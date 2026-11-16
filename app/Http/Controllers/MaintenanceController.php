<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMaintenanceServiceRequest;
use App\Http\Requests\StoreMaintenanceVisitRequest;
use App\Http\Requests\UpdateMaintenanceServiceRequest;
use App\Models\MaintenanceService;
use App\Models\MaintenanceVisit;
use App\Models\Thing;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class MaintenanceController extends Controller
{
    public function index(Request $request): Response
    {
        $devices = $this->maintainableThingsQuery($request)
            ->with([
                'place.parent',
                'place.household',
                'category',
                'maintenanceServices' => fn ($query) => $query->withCount('visits'),
            ])
            ->orderBy('name')
            ->get()
            ->map(function (Thing $thing) {
                $services = $thing->maintenanceServices
                    ->map(fn (MaintenanceService $service) => $this->formatService($service))
                    ->values();

                return [
                    ...$this->formatThing($thing),
                    'service' => $this->nextServiceFor($services),
                    'services' => $services,
                ];
            })
            ->values();

        return Inertia::render('maintenance/index', [
            'devices' => $devices,
        ]);
    }

    public function create(Request $request): Response
    {
        $things = $this->maintainableThingsQuery($request)
            ->orderBy('name')
            ->get()
            ->map(fn (Thing $thing) => [
                'value' => $thing->id,
                'label' => $thing->name,
            ])
            ->values();

        $service = null;
        $selectedThingId = $request->integer('thing_id') ?: null;

        if ($serviceId = $request->integer('service_id')) {
            $service = $this->accessibleServicesQuery($request)
                ->withCount('visits')
                ->findOrFail($serviceId);
            $selectedThingId = $service->thing_id;
        }

        abort_if(
            $selectedThingId !== null && ! $things->contains('value', $selectedThingId),
            404,
        );

        return Inertia::render('maintenance/add', [
            'maintainableThings' => $things,
            'selectedThingId' => $selectedThingId,
            'service' => $service ? $this->formatService($service) : null,
        ]);
    }

    public function show(Request $request, int $thing): Response
    {
        $device = $this->maintainableThingsQuery($request)
            ->with([
                'place.parent',
                'place.household',
                'category',
                'maintenanceServices' => fn ($query) => $query
                    ->withCount('visits')
                    ->with(['visits.user'])
                    ->orderByDesc('updated_at'),
            ])
            ->findOrFail($thing);

        return Inertia::render('maintenance/show', [
            'device' => $this->formatThing($device),
            'services' => $device->maintenanceServices
                ->map(fn (MaintenanceService $service) => $this->formatService($service))
                ->values(),
        ]);
    }

    public function store(StoreMaintenanceServiceRequest $request): RedirectResponse
    {
        $data = $request->serviceData();
        $thing = $this->maintainableThingsQuery($request)
            ->findOrFail($data['thing_id']);
        $service = $thing->maintenanceServices()->create($data);

        return to_route('maintenance.show', $service->thing_id);
    }

    public function update(
        UpdateMaintenanceServiceRequest $request,
        int $service,
    ): RedirectResponse {
        $record = $this->accessibleServicesQuery($request)->findOrFail($service);
        $data = $request->serviceData();
        if ((int) $data['thing_id'] !== $record->thing_id) {
            throw ValidationException::withMessages([
                'thing_id' => 'Nie można przypisać istniejącego planu do innego urządzenia.',
            ]);
        }

        unset($data['thing_id']);
        $record->update($data);

        return to_route('maintenance.show', $record->thing_id);
    }

    public function destroy(Request $request, int $service): RedirectResponse
    {
        $record = $this->accessibleServicesQuery($request)->findOrFail($service);
        $thingId = $record->thing_id;

        $record->delete();

        return to_route('maintenance.show', $thingId);
    }

    public function storeVisit(
        StoreMaintenanceVisitRequest $request,
        int $service,
    ): RedirectResponse {
        $record = $this->accessibleServicesQuery($request)
            ->with('thing.place.household')
            ->findOrFail($service);
        $data = $request->validated();
        abort_if(
            $record->recurrence_months === null
                && $record->due_at === null
                && $record->appointment_at === null
                && $record->visits()->exists(),
            409,
        );

        DB::transaction(function () use ($record, $data, $request) {
            $visit = $record->visits()->create([
                ...$data,
                'user_id' => $request->user()->id,
            ]);

            if ($record->recurrence_months) {
                $record->update([
                    'due_at' => Carbon::parse($visit->performed_at)
                        ->addMonthsNoOverflow($record->recurrence_months)
                        ->toDateString(),
                    'appointment_at' => null,
                ]);
            } else {
                $record->update([
                    'due_at' => null,
                    'appointment_at' => null,
                ]);
            }
        });

        return to_route('maintenance.show', $record->thing_id);
    }

    private function maintainableThingsQuery(Request $request): Builder
    {
        return Thing::query()
            ->where('requires_maintenance', true)
            ->whereHas('place', fn ($query) => $query->whereIn(
                'household_id',
                $request->user()->households()->select('households.id'),
            ));
    }

    private function accessibleServicesQuery(Request $request): Builder
    {
        return MaintenanceService::query()
            ->whereHas('thing', fn (Builder $query) => $this->applyThingAccess($query, $request));
    }

    private function applyThingAccess(Builder $query, Request $request): Builder
    {
        return $query
            ->where('requires_maintenance', true)
            ->whereHas('place', fn ($placeQuery) => $placeQuery->whereIn(
                'household_id',
                $request->user()->households()->select('households.id'),
            ));
    }

    /** @return array<string, bool|int|string|null> */
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

    /** @return array<string, mixed>|null */
    private function nextServiceFor(Collection $services): ?array
    {
        return $services
            ->reject(fn (array $service) => $service['isCompleted'])
            ->sortBy(fn (array $service) => $service['appointmentAt'] ?? $service['dueAt'] ?? '9999-12-31')
            ->first()
            ?? $services->first();
    }

    /** @return array<string, mixed> */
    private function formatService(MaintenanceService $service): array
    {
        $visitCount = $service->relationLoaded('visits')
            ? $service->visits->count()
            : ($service->visits_count ?? 0);

        return [
            'id' => (string) $service->id,
            'thingId' => $service->thing_id,
            'name' => $service->name,
            'isScheduled' => $service->appointment_at !== null,
            'appointmentAt' => $service->appointment_at?->toIso8601String(),
            'dueAt' => $service->due_at?->toDateString(),
            'recurrence' => match ($service->recurrence_months) {
                3 => '3-months',
                6 => '6-months',
                12 => 'yearly',
                24 => '2-years',
                36 => '3-years',
                default => 'none',
            },
            'provider' => $service->provider ?? '',
            'phone' => $service->phone ?? '',
            'estimatedCost' => $service->estimated_cost === null
                ? null
                : (float) $service->estimated_cost,
            'notes' => $service->notes ?? '',
            'isCompleted' => $service->recurrence_months === null
                && $service->due_at === null
                && $service->appointment_at === null
                && $visitCount > 0,
            'history' => $service->relationLoaded('visits')
                ? $service->visits
                    ->sortByDesc('performed_at')
                    ->map(fn (MaintenanceVisit $visit) => [
                        'id' => (string) $visit->id,
                        'completedAt' => $visit->performed_at->toDateString(),
                        'actualCost' => $visit->actual_cost === null
                            ? null
                            : (float) $visit->actual_cost,
                        'notes' => $visit->notes,
                        'performedBy' => $visit->user?->name,
                        'provider' => $service->provider,
                        'phone' => $service->phone,
                    ])
                    ->values()
                : [],
        ];
    }
}
