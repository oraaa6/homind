<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePlaceRequest;
use App\Http\Requests\UpdatePlaceRequest;
use App\Models\ActivityLog;
use App\Models\Household;
use App\Models\Place;
use App\Models\Thing;
use App\Services\ActivityLogger;
use App\Services\ActivityLogPresenter;
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
            'rooms' => $households->flatMap(fn (Household $household) => $household->places->map(fn (Place $place) => [
                'id' => $place->id,
                'household_id' => $household->id,
                'name' => $place->name,
            ])),
        ]);
    }

    public function store(StorePlaceRequest $request, ActivityLogger $activityLogger): RedirectResponse
    {
        $validated = $request->validated();

        $household = $request->user()->households()->findOrFail($validated['household_id']);
        $parent = isset($validated['parent_id'])
            ? $household->places()->find($validated['parent_id'])
            : null;

        DB::transaction(function () use ($household, $parent, $validated, $request, $activityLogger) {
            $place = $household->places()->create([
                'parent_id' => $parent?->id,
                'kind' => $validated['kind'],
                'name' => $validated['name'],
                'level' => $parent?->level,
                'placement' => $validated['placement'] ?? null,
            ]);

            $activityLogger->log(
                $household,
                $request->user(),
                'place_created',
                [
                    'place_name' => $place->name,
                    'place_kind' => $place->kind,
                    'identifier' => $place->identifier,
                ],
                place: $place,
            );
        });

        return to_route('places');
    }

    public function show(
        Request $request,
        string $element,
        ActivityLogPresenter $presenter,
    ): Response
    {
        abort_unless(ctype_digit($element), 404);
        $place = Place::with(['household', 'parent'])->findOrFail($element);
        Gate::authorize('view', $place->household);

        $path = $place->kind === 'room' || $place->identifier === null
            ? route('places.show', $place->id, false)
            : route('places.qr', [
                'element' => $place->id,
                'identifier' => $place->identifier,
            ], false);
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

        $activityQuery = ActivityLog::query()
            ->where('household_id', $place->household_id)
            ->where(function ($query) use ($placeIds) {
                $query->whereIn('place_id', $placeIds)
                    ->orWhereIn('from_place_id', $placeIds)
                    ->orWhereIn('to_place_id', $placeIds);
            });
        $historyCount = (clone $activityQuery)->count();
        $historyPage = max(1, $request->integer('history_page', 1));
        $activityLogs = $activityQuery
            ->with('user')
            ->latest()
            ->orderByDesc('id')
            ->offset(($historyPage - 1) * 10)
            ->limit(10)
            ->get();
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
                    'unitShort' => $this->unitShortLabel($thing->unit),
                    'needsPacking' => $thing->needs_packing,
                    'createdAt' => $thing->created_at?->toDateString() ?? '',
                ];
            })
            ->values();

        return Inertia::render('places/show', [
            'things' => $things,
            'history' => Inertia::merge(
                $activityLogs->map(fn (ActivityLog $log) => $presenter->forPlace($log))->values(),
            )->append(),
            'historyCount' => $historyCount,
            'historyHasMore' => $historyCount > $historyPage * 10,
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

    public function regenerateIdentifier(
        Request $request,
        string $element,
        ActivityLogger $activityLogger,
    ): RedirectResponse {
        abort_unless(ctype_digit($element), 404);

        $place = Place::with('household')->findOrFail($element);
        Gate::authorize('update', $place->household);
        abort_if($place->kind === 'room', 404);

        $prefix = match ($place->kind) {
            'rack' => 'RACK',
            'box' => 'BOX',
            default => abort(404),
        };
        $oldIdentifier = $place->identifier;

        DB::transaction(function () use ($place, $prefix, $oldIdentifier, $request, $activityLogger) {
            $household = $place->household()->lockForUpdate()->firstOrFail();
            $identifiers = $household->places()
                ->where('identifier', 'like', $prefix.'-%')
                ->pluck('identifier');
            $lastNumber = $identifiers->reduce(function (int $highest, ?string $value) use ($prefix) {
                if (preg_match('/^'.preg_quote($prefix, '/').'-(\d+)$/', $value ?? '', $matches) !== 1) {
                    return $highest;
                }

                return max($highest, (int) $matches[1]);
            }, 0);
            $nextNumber = $lastNumber + 1;
            $identifier = sprintf('%s-%06d', $prefix, $nextNumber);

            while ($household->places()->where('identifier', $identifier)->exists()) {
                $identifier = sprintf('%s-%06d', $prefix, ++$nextNumber);
            }

            $place->forceFill(['identifier' => $identifier])->save();

            $activityLogger->log(
                $place->household,
                $request->user(),
                'place_code_regenerated',
                [
                    'place_name' => $place->name,
                    'old_identifier' => $oldIdentifier,
                    'identifier' => $identifier,
                ],
                place: $place,
            );
        });

        return to_route('places.show', $place->id);
    }

    public function openQr(Request $request, string $element, string $identifier): RedirectResponse
    {
        abort_unless(ctype_digit($element), 404);

        $place = Place::with('household')->findOrFail($element);
        Gate::authorize('view', $place->household);

        abort_if(
            $place->kind === 'room'
                || ! hash_equals((string) $place->identifier, $identifier),
            404,
        );

        return to_route('places.show', $place->id);
    }

    public function update(
        UpdatePlaceRequest $request,
        string $element,
        ActivityLogger $activityLogger,
    ): RedirectResponse {
        abort_unless(ctype_digit($element), 404);

        $place = Place::with('household')->findOrFail($element);
        Gate::authorize('update', $place->household);
        $validated = $request->validated();
        $oldParent = $place->parent;
        $oldPlacement = $place->placement;
        $newParent = $place->household->places()->findOrFail($validated['parent_id']);

        DB::transaction(function () use ($place, $validated, $oldParent, $oldPlacement, $newParent, $request, $activityLogger) {
            $place->update([
                'parent_id' => $validated['parent_id'],
                'placement' => $validated['placement'] ?? null,
            ]);

            if ($oldParent?->id !== $newParent->id) {
                $activityLogger->log(
                    $place->household,
                    $request->user(),
                    'place_moved',
                    [
                        'place_name' => $place->name,
                        'from_place_name' => $oldParent?->name,
                        'to_place_name' => $newParent->name,
                        'old_placement' => $oldPlacement,
                        'new_placement' => $place->placement,
                    ],
                    place: $place,
                    fromPlace: $oldParent,
                    toPlace: $newParent,
                );
            } elseif ($oldPlacement !== $place->placement) {
                $activityLogger->log(
                    $place->household,
                    $request->user(),
                    'place_updated',
                    [
                        'place_name' => $place->name,
                        'old_placement' => $oldPlacement,
                        'new_placement' => $place->placement,
                    ],
                    place: $place,
                );
            }
        });

        return to_route('places.show', $place->id);
    }

    public function destroy(
        Request $request,
        string $element,
        ActivityLogger $activityLogger,
    ): RedirectResponse {
        abort_unless(ctype_digit($element), 404);

        $place = Place::with('household')->findOrFail($element);
        Gate::authorize('update', $place->household);

        if ($place->children()->exists() || $place->things()->exists()) {
            return back()->withErrors([
                'place' => 'Nie można usunąć lokalizacji, do której przypisano przedmioty lub lokalizacje podrzędne. Najpierw je przenieś lub usuń.',
            ]);
        }

        $parent = $place->parent;

        DB::transaction(function () use ($place, $parent, $request, $activityLogger) {
            $activityLogger->log(
                $place->household,
                $request->user(),
                'place_deleted',
                [
                    'place_name' => $place->name,
                    'place_kind' => $place->kind,
                    'identifier' => $place->identifier,
                    'from_place_name' => $parent?->name,
                ],
                place: $place,
                fromPlace: $parent,
            );

            $place->delete();
        });

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

    private function unitShortLabel(string $unit): string
    {
        $units = config('thing-units', []);

        return $units[$unit]['short'] ?? $units[$unit]['label'] ?? $unit;
    }

}
