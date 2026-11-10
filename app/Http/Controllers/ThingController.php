<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreThingRequest;
use App\Http\Requests\UpdateThingLocationRequest;
use App\Http\Requests\UpdateThingQuantityRequest;
use App\Models\ActivityLog;
use App\Models\Category;
use App\Models\Household;
use App\Models\Place;
use App\Models\Thing;
use App\Services\ActivityLogger;
use App\Services\ActivityLogPresenter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ThingController extends Controller
{
    public function index(Request $request): Response
    {
        $things = Thing::query()
            ->whereHas('place', fn ($query) => $query->whereIn(
                'household_id',
                $request->user()->households()->select('households.id'),
            ))
            ->with(['place.parent', 'place.household', 'category'])
            ->latest()
            ->get()
            ->map(fn (Thing $thing) => $this->formatThing($thing))
            ->values();

        return Inertia::render('things/index', [
            'things' => $things,
            'categories' => Category::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function create(Request $request): Response
    {
        $households = $request->user()->households()
            ->with(['places.parent'])
            ->orderBy('households.name')
            ->get(['households.id', 'households.name']);

        return Inertia::render('things/add', [
            'categories' => Category::query()->orderBy('name')->get(['id', 'name']),
            'units' => collect(config('thing-units'))->map(fn (array $unit, string $value) => [
                'value' => $value,
                'label' => $unit['label'],
            ])->values(),
            'places' => $households->flatMap(fn (Household $household) => $household->places->map(fn (Place $place) => [
                'id' => $place->id,
                'name' => $place->name,
                'kind' => $place->kind,
                'identifier' => $place->identifier,
                'parent_name' => $place->parent?->name,
                'household_name' => $household->name,
            ]))->values(),
        ]);
    }

    public function store(StoreThingRequest $request, ActivityLogger $activityLogger): RedirectResponse
    {
        $validated = $request->validated();
        $place = Place::query()
            ->whereIn(
                'household_id',
                $request->user()->households()->select('households.id'),
            )
            ->findOrFail($validated['place_id']);

        DB::transaction(function () use ($place, $validated, $request, $activityLogger) {
            $thing = $place->things()->create([
                'name' => $validated['name'],
                'category_id' => $validated['category_id'],
                'placement' => ($validated['needs_packing'] ?? false)
                    ? null
                    : ($validated['placement'] ?? null),
                'quantity' => $validated['quantity'],
                'unit' => $validated['unit'],
                'needs_packing' => $validated['needs_packing'] ?? false,
                'requires_maintenance' => $validated['requires_maintenance'] ?? false,
            ]);

            $activityLogger->log(
                $place->household,
                $request->user(),
                'thing_added',
                [
                    'thing_name' => $thing->name,
                    'place_name' => $place->name,
                    'place_kind' => $place->kind,
                    'quantity' => $thing->quantity,
                    'unit' => $thing->unit,
                ],
                thing: $thing,
                place: $place,
                toPlace: $place,
            );
        });

        return to_route('things');
    }

    public function updateLocation(
        UpdateThingLocationRequest $request,
        string $element,
        ActivityLogger $activityLogger,
    ): RedirectResponse {
        abort_unless(ctype_digit($element), 404);

        $thing = Thing::query()
            ->whereHas('place', fn ($query) => $query->whereIn(
                'household_id',
                $request->user()->households()->select('households.id'),
            ))
            ->with('place.household')
            ->findOrFail($element);
        $destination = Place::query()
            ->where('household_id', $thing->place->household_id)
            ->with('household')
            ->findOrFail($request->validated('place_id'));

        $oldPlace = $thing->place;

        DB::transaction(function () use ($thing, $destination, $oldPlace, $request, $activityLogger) {
            $thing->update([
                'place_id' => $destination->id,
                'needs_packing' => $destination->kind !== 'room'
                    ? false
                    : $thing->needs_packing,
            ]);

            if ($oldPlace->id !== $destination->id) {
                $activityLogger->log(
                    $destination->household,
                    $request->user(),
                    'thing_moved',
                    [
                        'thing_name' => $thing->name,
                        'from_place_name' => $oldPlace->name,
                        'from_place_kind' => $oldPlace->kind,
                        'to_place_name' => $destination->name,
                        'to_place_kind' => $destination->kind,
                    ],
                    thing: $thing,
                    place: $destination,
                    fromPlace: $oldPlace,
                    toPlace: $destination,
                );
            }
        });

        return to_route('things.show', $thing->id);
    }

    public function updateQuantity(
        UpdateThingQuantityRequest $request,
        string $element,
        ActivityLogger $activityLogger,
    ): RedirectResponse {
        abort_unless(ctype_digit($element), 404);

        $thing = Thing::query()
            ->whereHas('place', fn ($query) => $query->whereIn(
                'household_id',
                $request->user()->households()->select('households.id'),
            ))
            ->with('place.household')
            ->findOrFail($element);

        $oldQuantity = $thing->quantity;
        $newQuantity = $request->validated('quantity');

        DB::transaction(function () use ($thing, $oldQuantity, $newQuantity, $request, $activityLogger) {
            $thing->update(['quantity' => $newQuantity]);

            if ($oldQuantity !== (int) $newQuantity) {
                $activityLogger->log(
                    $thing->place->household,
                    $request->user(),
                    'thing_quantity_changed',
                    [
                        'thing_name' => $thing->name,
                        'place_name' => $thing->place->name,
                        'old_quantity' => $oldQuantity,
                        'new_quantity' => $newQuantity,
                        'unit' => $thing->unit,
                    ],
                    thing: $thing,
                    place: $thing->place,
                );
            }
        });

        return to_route('things.show', $thing->id);
    }

    public function destroy(
        Request $request,
        string $element,
        ActivityLogger $activityLogger,
    ): RedirectResponse {
        abort_unless(ctype_digit($element), 404);

        $thing = Thing::query()
            ->whereHas('place', fn ($query) => $query->whereIn(
                'household_id',
                $request->user()->households()->select('households.id'),
            ))
            ->with('place.household')
            ->findOrFail($element);

        DB::transaction(function () use ($thing, $request, $activityLogger) {
            $activityLogger->log(
                $thing->place->household,
                $request->user(),
                'thing_deleted',
                [
                    'thing_name' => $thing->name,
                    'place_name' => $thing->place->name,
                    'quantity' => $thing->quantity,
                    'unit' => $thing->unit,
                ],
                thing: $thing,
                place: $thing->place,
            );

            $thing->delete();
        });

        return to_route('things');
    }

    public function show(
        Request $request,
        string $element,
        ActivityLogPresenter $presenter,
    ): Response {
        abort_unless(ctype_digit($element), 404);

        $thing = Thing::query()
            ->whereHas('place', fn ($query) => $query->whereIn(
                'household_id',
                $request->user()->households()->select('households.id'),
            ))
            ->with(['place.parent', 'place.household', 'category'])
            ->findOrFail($element);

        $place = $thing->place;
        $parent = $place->parent?->household_id === $place->household_id
            ? $place->parent
            : null;
        $historyQuery = ActivityLog::query()
            ->where('thing_id', $thing->id);
        $historyCount = (clone $historyQuery)->count();
        $historyPage = max(1, $request->integer('history_page', 1));
        $history = $historyQuery
            ->with('user')
            ->latest()
            ->orderByDesc('id')
            ->offset(($historyPage - 1) * 10)
            ->limit(10)
            ->get()
            ->map(fn (ActivityLog $log) => $presenter->forThing($log))
            ->values();

        return Inertia::render('things/show', [
            'item' => $this->formatThing($thing),
            'availablePlaces' => $place->household->places()
                ->with('parent')
                ->orderBy('name')
                ->get()
                ->map(fn (Place $availablePlace) => [
                    'id' => $availablePlace->id,
                    'name' => $availablePlace->name,
                    'kind' => $availablePlace->kind,
                    'identifier' => $availablePlace->identifier,
                    'parent_name' => $availablePlace->parent?->name,
                    'household_name' => $place->household->name,
                ])
                ->values(),
            'details' => [
                'thingId' => (string) $thing->id,
                'room' => $parent?->name ?? $place->name,
                'place' => $parent ? $place->name : '',
                'placementNote' => $thing->placement,
                'locationCode' => $place->identifier ?? (string) $place->id,
                'locationUrl' => $place->kind === 'room' || $place->identifier === null
                    ? route('places.show', $place->id)
                    : route('places.qr', [
                        'element' => $place->id,
                        'identifier' => $place->identifier,
                    ]),
                'locationHasQr' => $place->kind !== 'room' && $place->identifier !== null,
            ],
            'history' => Inertia::merge($history)->append(),
            'historyCount' => $historyCount,
            'historyHasMore' => $historyCount > $historyPage * 10,
        ]);
    }

    /**
     * @return array<string, bool|int|string|null>
     */
    private function formatThing(Thing $thing): array
    {
        $place = $thing->place;
        $parent = $place->parent?->household_id === $place->household_id
            ? $place->parent
            : null;
        $location = collect([$parent?->name, $place->name])
            ->filter()
            ->implode(' › ');

        if ($thing->placement) {
            $location .= ' · '.$thing->placement;
        }

        return [
            'id' => (string) $thing->id,
            'slug' => (string) $thing->id,
            'name' => $thing->name,
            'location' => $location.' · '.$place->household->name,
            'placeId' => $place->id,
            'placeKind' => $place->kind,
            'category' => $thing->category->name,
            'placement' => $thing->placement,
            'quantity' => $thing->quantity,
            'unit' => $thing->unit,
            'unitShort' => $this->unitShortLabel($thing->unit),
            'needsPacking' => $thing->needs_packing,
            'requiresMaintenance' => $thing->requires_maintenance,
            'createdAt' => $thing->created_at?->toDateString() ?? '',
        ];
    }

    private function unitShortLabel(string $unit): string
    {
        $units = config('thing-units', []);

        return $units[$unit]['short'] ?? $units[$unit]['label'] ?? $unit;
    }
}
