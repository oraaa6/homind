<?php

namespace App\Http\Controllers;

use App\Models\Thing;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MaintenanceController extends Controller
{
    public function index(Request $request): Response
    {
        $maintainableThings = $this->maintainableThings($request);
        $demoThingId = $maintainableThings->first()?->id;
        $things = $maintainableThings
            ->map(fn (Thing $thing) => [
                ...$this->formatThing($thing),
                'service' => $this->demoServiceFor($thing->id, $demoThingId),
            ])
            ->values();

        return Inertia::render('maintenance/index', [
            'devices' => $things,
        ]);
    }

    public function create(Request $request): Response
    {
        $things = $this->maintainableThings($request)
            ->map(fn (Thing $thing) => [
                'value' => $thing->id,
                'label' => collect([
                    $thing->place->parent?->name,
                    $thing->name,
                    $thing->place->household->name,
                ])->filter()->implode(' · '),
            ])
            ->values();
        $requestedThingId = $request->integer('thing_id');
        $selectedThingId = $things->contains('value', $requestedThingId)
            ? $requestedThingId
            : null;
        $service = $request->boolean('edit')
            ? $this->demoServiceFor(
                $selectedThingId,
                $things->first()['value'] ?? null,
            )
            : null;

        return Inertia::render('maintenance/add', [
            'maintainableThings' => $things,
            'selectedThingId' => $selectedThingId,
            'service' => $service,
        ]);
    }

    public function show(Request $request, int $thing): Response
    {
        $things = $this->maintainableThings($request);
        $device = $things->firstWhere('id', $thing);

        abort_unless($device, 404);

        return Inertia::render('maintenance/show', [
            'device' => [
                ...$this->formatThing($device),
                'placement' => $device->placement,
                'quantity' => $device->quantity,
                'unit' => $device->unit,
            ],
            'service' => $this->demoServiceFor($device->id, $things->first()?->id),
        ]);
    }

    /**
     * Temporary display data for checking the service details and edit flow.
     * It is intentionally not saved to the database.
     *
     * @return array<string, bool|float|int|string|null>|null
     */
    private function demoServiceFor(?int $thingId, ?int $demoThingId): ?array
    {
        if ($thingId === null || $thingId !== $demoThingId) {
            return null;
        }

        return [
            'id' => 'demo-service',
            'name' => 'Coroczny przegląd techniczny',
            'isScheduled' => true,
            'appointmentAt' => now()->addDays(8)->setTime(10, 0)->toIso8601String(),
            'dueAt' => null,
            'recurrence' => 'yearly',
            'provider' => 'Serwis Techniczny',
            'phone' => '+48 600 123 456',
            'estimatedCost' => 450,
            'notes' => 'Sprawdzić stan urządzenia i wykonać standardowy przegląd okresowy.',
        ];
    }

    private function maintainableThings(Request $request): Collection
    {
        return Thing::query()
            ->where('requires_maintenance', true)
            ->whereHas('place', fn ($query) => $query->whereIn(
                'household_id',
                $request->user()->households()->select('households.id'),
            ))
            ->with(['place.parent', 'place.household', 'category'])
            ->orderBy('name')
            ->get();
    }

    /**
     * @return array<string, bool|int|string|null>
     */
    private function formatThing(Thing $thing): array
    {
        return [
            'id' => $thing->id,
            'name' => $thing->name,
            'category' => $thing->category->name,
            'location' => collect([
                $thing->place->parent?->name,
                $thing->place->name,
                $thing->place->household->name,
            ])->filter()->implode(' · '),
            'createdAt' => $thing->created_at?->toDateString() ?? '',
        ];
    }
}
