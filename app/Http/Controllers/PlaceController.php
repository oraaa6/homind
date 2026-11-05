<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePlaceRequest;
use App\Models\Household;
use App\Models\Place;
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
        $places = $request->user()->households()
            ->with(['places.parent'])
            ->get()
            ->flatMap(fn (Household $household) => $household->places->map(
                fn (Place $place) => $this->formatPlace($place),
            ))
            ->values();

        return Inertia::render('places/index', [
            'places' => $places,
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

        return Inertia::render('places/show', [
            'place' => [
                'id' => $place->identifier ?? (string) $place->id,
                'slug' => (string) $place->id,
                'name' => $place->name,
                'kind' => $place->kind,
                'parentId' => $parent?->identifier,
                'qrCode' => $place->identifier,
                'level' => $level ?? '',
                'levelLabel' => $levelLabel,
                'description' => $place->placement ?? '',
                'createdAt' => $place->created_at?->toDateString(),
            ],
            'parentName' => $parent?->name,
            'placePath' => $path,
        ]);
    }

    /**
     * @return array<string, int|string|null>
     */
    private function formatPlace(Place $place): array
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
            'parentId' => $parent?->identifier,
            'parentName' => $parent?->name,
            'qrCode' => $place->identifier,
            'level' => $level ?? '',
            'levelLabel' => match ($level) {
                'ground' => 'Parter',
                'first-floor' => 'Piętro 1',
                'outside' => 'Budynek zewnętrzny',
                default => $level ?? 'Poziom nieustawiony',
            },
            'description' => $place->placement ?? '',
            'createdAt' => $place->created_at?->toDateString() ?? '',
        ];
    }
}
