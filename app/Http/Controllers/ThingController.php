<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreThingRequest;
use App\Http\Requests\UpdateThingQuantityRequest;
use App\Http\Requests\UpdateThingLocationRequest;
use App\Models\Category;
use App\Models\Household;
use App\Models\Place;
use App\Models\Thing;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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

    public function store(StoreThingRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $place = Place::query()
            ->whereIn(
                'household_id',
                $request->user()->households()->select('households.id'),
            )
            ->findOrFail($validated['place_id']);

        $place->things()->create([
            'name' => $validated['name'],
            'category_id' => $validated['category_id'],
            'placement' => ($validated['needs_packing'] ?? false)
                ? null
                : ($validated['placement'] ?? null),
            'quantity' => $validated['quantity'],
            'unit' => $validated['unit'],
            'needs_packing' => $validated['needs_packing'] ?? false,
        ]);

        return to_route('things');
    }

    public function updateLocation(
        UpdateThingLocationRequest $request,
        string $element,
    ): RedirectResponse {
        abort_unless(ctype_digit($element), 404);

        $thing = Thing::query()
            ->whereHas('place', fn ($query) => $query->whereIn(
                'household_id',
                $request->user()->households()->select('households.id'),
            ))
            ->findOrFail($element);
        $destination = Place::query()
            ->whereIn(
                'household_id',
                $request->user()->households()->select('households.id'),
            )
            ->findOrFail($request->validated('place_id'));

        $thing->update([
            'place_id' => $destination->id,
            'needs_packing' => $destination->kind !== 'room'
                ? false
                : $thing->needs_packing,
        ]);

        return to_route('things.show', $thing->id);
    }

    public function updateQuantity(
        UpdateThingQuantityRequest $request,
        string $element,
    ): RedirectResponse {
        abort_unless(ctype_digit($element), 404);

        $thing = Thing::query()
            ->whereHas('place', fn ($query) => $query->whereIn(
                'household_id',
                $request->user()->households()->select('households.id'),
            ))
            ->findOrFail($element);

        $thing->update($request->validated());

        return to_route('things.show', $thing->id);
    }

    public function destroy(Request $request, string $element): RedirectResponse
    {
        abort_unless(ctype_digit($element), 404);

        $thing = Thing::query()
            ->whereHas('place', fn ($query) => $query->whereIn(
                'household_id',
                $request->user()->households()->select('households.id'),
            ))
            ->findOrFail($element);

        $thing->delete();

        return to_route('things');
    }

    public function show(Request $request, string $element): Response
    {
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

        return Inertia::render('things/show', [
            'item' => $this->formatThing($thing),
            'availablePlaces' => $request->user()->households()
                ->with(['places.parent'])
                ->orderBy('households.name')
                ->get(['households.id', 'households.name'])
                ->flatMap(fn (Household $household) => $household->places->map(fn (Place $availablePlace) => [
                    'id' => $availablePlace->id,
                    'name' => $availablePlace->name,
                    'kind' => $availablePlace->kind,
                    'identifier' => $availablePlace->identifier,
                    'parent_name' => $availablePlace->parent?->name,
                    'household_name' => $household->name,
                ]))
                ->values(),
            'details' => [
                'thingId' => (string) $thing->id,
                'room' => $parent?->name ?? $place->name,
                'place' => $parent ? $place->name : '',
                'placementNote' => $thing->placement,
                'locationCode' => $place->identifier ?? (string) $place->id,
                'locationUrl' => route('places.show', $place->id),
                'locationHasQr' => $place->kind !== 'room',
                'history' => [],
            ],
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
            'needsPacking' => $thing->needs_packing,
            'createdAt' => $thing->created_at?->toDateString() ?? '',
        ];
    }
}
