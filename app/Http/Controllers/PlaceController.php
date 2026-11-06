<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePlaceRequest;
use App\Http\Requests\UpdatePlaceRequest;
use App\Models\Household;
use App\Models\Place;
use App\Models\Thing;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PlaceController extends Controller
{
    public function index(Request $request): Response
    {
        $households = $request->user()->households()
            ->with(['places' => fn ($query) => $query
                ->with('parent')
                ->withCount('things')])
            ->get();
        $totalThings = $households
            ->sum(fn (Household $household) => $household->places->sum('things_count'));
        $places = $households
            ->flatMap(function (Household $household) {
                $householdPlaces = $household->places;

                return $householdPlaces->map(function (Place $place) use ($householdPlaces) {
                    $thingCount = $place->things_count;

                    if ($place->kind === 'room') {
                        $thingCount += $householdPlaces
                            ->filter(fn (Place $child) => (int) $child->parent_id === $place->id)
                            ->sum('things_count');
                    }

                    return $this->formatPlace($place, $thingCount);
                });
            })
            ->values();

        return Inertia::render('places/index', [
            'places' => $places,
            'totalThings' => $totalThings,
        ]);
    }

    public function create(Request $request): Response
    {
        $households = $request->user()->households()
            ->with(['places' => fn ($query) => $query
                ->where('kind', 'room')
                ->orderBy('name')])
            ->orderBy('households.name')
            ->get(['households.id', 'households.name']);

        return Inertia::render('places/add', [
            'households' => $households->map(fn (Household $household) => [
                'id' => $household->id,
                'name' => $household->name,
            ]),
            'rooms' => $households->flatMap(fn (Household $household) =>
                $household->places->map(fn (Place $place) => [
                    'id' => $place->id,
                    'household_id' => $household->id,
                    'name' => $place->name,
                ])),
        ]);
    }

    public function store(StorePlaceRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $household = $request->user()->households()->findOrFail($validated['household_id']);
        $parent = isset($validated['parent_id'])
            ? $household->places()->find($validated['parent_id'])
            : null;

        $place = DB::transaction(fn () => $household->places()->create([
            'parent_id' => $parent?->id,
            'kind' => $validated['kind'],
            'name' => $validated['name'],
            'level' => $parent?->level,
            'placement' => $validated['placement'] ?? null,
        ]));

        return to_route('places');
    }

    public function show(string $element): Response
    {
        abort_unless(ctype_digit($element), 404);
        $place = Place::with(['household', 'parent'])->findOrFail($element);
        Gate::authorize('view', $place->household);

        $path = route('places.show', $place->id, false);
        $parent = $place->parent?->household_id === $place->household_id
            ? $place->parent
            : null;
        $level = $place->level ?? $parent?->level;
        $levelLabel = match ($level) {
            'ground' => 'Parter',
            'first-floor' => 'Piętro 1',
            'outside' => 'Budynek zewnętrzny',
            default => $level ?? 'Poziom nieustawiony',
        };
        $placeIds = collect([$place->id]);

        if ($place->kind === 'room') {
            $placeIds = $placeIds->merge(
                $place->children()
                    ->where('household_id', $place->household_id)
                    ->whereIn('kind', ['rack', 'box'])
                    ->pluck('id'),
            );
        }

        $things = Thing::query()
            ->whereIn('place_id', $placeIds)
            ->with(['category', 'place'])
            ->latest()
            ->get()
            ->map(function (Thing $thing) use ($place) {
                $storagePlace = $thing->place;

                return [
                    'id' => (string) $thing->id,
                    'slug' => (string) $thing->id,
                    'name' => $thing->name,
                    'location' => $storagePlace->name,
                    'placeId' => $storagePlace->id,
                    'placeKind' => $storagePlace->kind,
                    'storagePlaceName' => $storagePlace->id === $place->id
                        ? null
                        : $storagePlace->name,
                    'category' => $thing->category->name,
                    'placement' => $thing->placement,
                    'quantity' => $thing->quantity,
                    'unit' => $thing->unit,
                    'needsPacking' => $thing->needs_packing,
                    'createdAt' => $thing->created_at?->toDateString() ?? '',
                ];
            })
            ->values();

        return Inertia::render('places/show', [
            'things' => $things,
            'place' => [
                'id' => $place->identifier ?? (string) $place->id,
                'slug' => (string) $place->id,
                'name' => $place->name,
                'kind' => $place->kind,
                'parentId' => $parent?->id,
                'qrCode' => $place->kind === 'room' ? null : $place->identifier,
                'level' => $level ?? '',
                'levelLabel' => $levelLabel,
                'description' => $place->placement ?? '',
                'createdAt' => $place->created_at?->toDateString(),
            ],
            'parentName' => $parent?->name,
            'rooms' => $place->household->places()
                ->where('kind', 'room')
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (Place $room) => [
                    'id' => $room->id,
                    'name' => $room->name,
                ])
                ->values(),
            'placePath' => $path,
        ]);
    }

    public function update(UpdatePlaceRequest $request, string $element): RedirectResponse
    {
        abort_unless(ctype_digit($element), 404);

        $place = Place::with('household')->findOrFail($element);
        Gate::authorize('update', $place->household);
        $validated = $request->validated();

        $place->update([
            'parent_id' => $validated['parent_id'],
            'placement' => $validated['placement'] ?? null,
        ]);

        return to_route('places.show', $place->id);
    }

    public function destroy(string $element): RedirectResponse
    {
        abort_unless(ctype_digit($element), 404);

        $place = Place::with('household')->findOrFail($element);
        Gate::authorize('update', $place->household);

        if ($place->children()->exists() || $place->things()->exists()) {
            return back()->withErrors([
                'place' => 'Nie można usunąć lokalizacji, do której przypisano przedmioty lub lokalizacje podrzędne. Najpierw je przenieś lub usuń.',
            ]);
        }

        $place->delete();

        return to_route('places');
    }

    /**
     * @return array<string, int|string|null>
     */
    private function formatPlace(Place $place, int $thingCount = 0): array
    {
        $parent = $place->parent?->household_id === $place->household_id
            ? $place->parent
            : null;
        $level = $place->level ?? $parent?->level;

        return [
            'id' => $place->identifier ?? (string) $place->id,
            'slug' => (string) $place->id,
            'name' => $place->name,
            'kind' => $place->kind,
            'parentId' => $parent?->id,
            'parentName' => $parent?->name,
            'qrCode' => $place->kind === 'room' ? null : $place->identifier,
            'level' => $level ?? '',
            'levelLabel' => match ($level) {
                'ground' => 'Parter',
                'first-floor' => 'Piętro 1',
                'outside' => 'Budynek zewnętrzny',
                default => $level ?? 'Poziom nieustawiony',
            },
            'description' => $place->placement ?? '',
            'createdAt' => $place->created_at?->toDateString() ?? '',
            'thingCount' => $thingCount,
        ];
    }
}
