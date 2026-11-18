<?php

namespace App\Http\Controllers;

use App\Enums\RoutineAction;
use App\Enums\RoutineScheduleType;
use App\Enums\RoutineState;
use App\Http\Requests\RoutineMutationRequest;
use App\Http\Requests\StoreRoutineActionRequest;
use App\Http\Requests\StoreRoutineRequest;
use App\Http\Requests\UpdateRoutineRequest;
use App\Http\Requests\UpdateRoutineStateRequest;
use App\Models\Routine;
use App\Models\RoutineHistoryEntry;
use App\Models\User;
use App\Services\RoutineSchedule;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use InvalidArgumentException;

class RoutineController extends Controller
{
    public function __construct(private readonly RoutineSchedule $schedule) {}

    public function index(Request $request): Response
    {
        $today = $this->schedule->today();
        $routines = Routine::query()
            ->select(['id', 'household_id', 'name', 'category', 'state', 'schedule_type', 'interval_count', 'interval_unit', 'weekdays', 'next_due_at', 'created_at'])
            ->whereIn('household_id', $request->user()->households()->select('households.id'))
            ->withMax(['history as last_completed_at' => fn (Builder $query) => $query
                ->where('type', RoutineAction::Completed->value)->whereNull('cancelled_at')], 'action_at')
            ->orderBy('next_due_at')->orderBy('id')
            ->get();

        $resolvedDates = RoutineHistoryEntry::query()
            ->join('routines', 'routines.id', '=', 'routine_history_entries.routine_id')
            ->whereIn('routine_id', $routines->modelKeys())
            ->where('routines.state', RoutineState::Active->value)
            ->whereNotNull('active_scheduled_for')
            ->whereColumn('scheduled_for', '>=', 'routines.next_due_at')
            ->where('scheduled_for', '<', $today)
            ->get(['routine_id', 'scheduled_for'])
            ->mapToGroups(fn (RoutineHistoryEntry $entry) => [$entry->routine_id => $entry->scheduled_for->toDateString()]);

        $items = $routines->map(fn (Routine $routine) => [
            ...$this->presentBase($routine),
            'lastCompletedAt' => $routine->getAttribute('last_completed_at'),
            'missedTermsCount' => $routine->state === RoutineState::Active
                ? $this->schedule->missedTermsCount(
                    $routine->scheduleData(), $routine->next_due_at->toDateString(), $today,
                    array_values($resolvedDates->get($routine->id)?->all() ?? []),
                ) : 0,
        ])->values();

        return Inertia::render('routines/index', ['routines' => $items]);
    }

    public function create(): Response
    {
        return Inertia::render('routines/add', ['routine' => null]);
    }

    public function missing(Request $request): \Symfony\Component\HttpFoundation\Response
    {
        return Inertia::render('routines/show', ['routine' => null])
            ->toResponse($request)->setStatusCode(404);
    }

    public function show(Routine $routine): Response
    {
        Gate::authorize('view', $routine);

        return Inertia::render('routines/show', ['routine' => $this->present($routine->load('history'))]);
    }

    public function edit(Routine $routine): Response
    {
        Gate::authorize('update', $routine);

        return Inertia::render('routines/add', ['routine' => $this->present($routine->load('history'))]);
    }

    public function store(StoreRoutineRequest $request): RedirectResponse
    {
        $data = $request->routineData();
        $initialDate = $request->validated('lastCompletedAt');
        $this->validateTerm($data, $initialDate ? [$initialDate] : []);
        $household = $request->user()->households()->findOrFail($request->integer('householdId'));

        $routine = DB::transaction(function () use ($household, $data, $initialDate, $request): Routine {
            $routine = $household->routines()->create([
                ...$data,
                'created_by' => $request->user()->id,
                'state' => RoutineState::Active,
                'version' => 1,
            ]);

            if ($initialDate) {
                $this->createEntry($routine, $request->user(), RoutineAction::Completed, $initialDate, $initialDate,
                    'Wykonanie podane przy dodawaniu rutyny.', $routine->starts_at->toDateString());
            }

            return $routine;
        });

        return to_route('routines.show', $routine);
    }

    public function update(UpdateRoutineRequest $request, Routine $routine): RedirectResponse
    {
        DB::transaction(function () use ($request, $routine): void {
            $record = $this->lockRoutine($routine, $request->integer('version'));
            $data = $request->routineData();
            $resolvedDates = $this->resolvedDates($record);
            $this->validateTerm($data, $resolvedDates);
            $data['starts_at'] = $this->calculate(fn () => $this->schedule->editedStartDate(
                $record->starts_at->toDateString(), $data['next_due_at'], $resolvedDates,
            ));
            $household = $request->user()->households()->findOrFail($request->integer('householdId'));
            $record->household()->associate($household);
            $record->fill([...$data, 'version' => $record->version + 1])->save();
        }, 3);

        return to_route('routines.show', $routine);
    }

    public function destroy(RoutineMutationRequest $request, Routine $routine): RedirectResponse
    {
        DB::transaction(function () use ($request, $routine): void {
            $record = $this->lockRoutine($routine, $request->integer('version'));
            Gate::authorize('delete', $record);
            $record->delete();
        }, 3);

        return to_route('routines');
    }

    public function storeAction(StoreRoutineActionRequest $request, Routine $routine): RedirectResponse
    {
        DB::transaction(function () use ($request, $routine): void {
            $record = $this->lockRoutine($routine, $request->integer('version'));
            $data = $request->validated();
            $scheduledFor = $data['scheduledFor'];

            if ($record->state !== RoutineState::Active) {
                throw ValidationException::withMessages(['version' => 'Wznów rutynę, aby zapisać wykonanie lub pominięcie.']);
            }
            if ($scheduledFor !== $record->next_due_at->toDateString() || in_array($scheduledFor, $this->resolvedDates($record), true)) {
                throw ValidationException::withMessages(['scheduledFor' => 'Ten termin został już zapisany lub zmieniony. Odśwież stronę.']);
            }

            $type = RoutineAction::from($data['type']);
            $actionAt = $type === RoutineAction::Skipped ? $this->schedule->today() : $data['actionAt'];
            $lastCompleted = $record->history()->whereNull('cancelled_at')
                ->where('type', RoutineAction::Completed->value)->max('action_at');

            if ($type === RoutineAction::Completed && $lastCompleted && $actionAt < $lastCompleted) {
                throw ValidationException::withMessages(['actionAt' => 'Data wykonania nie może być wcześniejsza niż ostatnie wykonanie rutyny.']);
            }

            $nextDueAt = $this->calculate(fn () => $this->schedule->afterAction(
                $record->scheduleData(), $record->starts_at->toDateString(), $scheduledFor, $actionAt, $type, $this->schedule->today(),
            ));
            $nextDueAt = $this->calculate(fn () => $this->schedule->restore(
                $record->scheduleData(), $record->starts_at->toDateString(), $nextDueAt, [...$this->resolvedDates($record), $scheduledFor],
            ));

            $this->createEntry($record, $request->user(), $type, $scheduledFor, $actionAt, $data['notes'] ?? null, $record->next_due_at->toDateString());
            $record->update(['next_due_at' => $nextDueAt, 'version' => $record->version + 1]);
        }, 3);

        return to_route('routines.show', $routine);
    }

    public function undoAction(RoutineMutationRequest $request, Routine $routine, int $entry): RedirectResponse
    {
        DB::transaction(function () use ($request, $routine, $entry): void {
            $record = $this->lockRoutine($routine, $request->integer('version'));
            $last = $record->history()->whereNull('cancelled_at')
                ->whereIn('type', [RoutineAction::Completed->value, RoutineAction::Skipped->value])->first();

            if (! $last || $last->id !== $entry) {
                throw ValidationException::withMessages(['version' => 'Można cofnąć tylko ostatnie niecofnięte wykonanie lub pominięcie. Odśwież stronę.']);
            }

            $last->update([
                'cancelled_at' => now(),
                'cancelled_by' => $request->user()->id,
                'cancelled_by_name' => $request->user()->name,
                'active_scheduled_for' => null,
            ]);
            $nextDueAt = $this->calculate(fn () => $this->schedule->restore(
                $record->scheduleData(), $record->starts_at->toDateString(), $last->previous_next_due_at->toDateString(), $this->resolvedDates($record),
            ));
            $record->update(['next_due_at' => $nextDueAt, 'version' => $record->version + 1]);
        }, 3);

        return to_route('routines.show', $routine);
    }

    public function updateState(UpdateRoutineStateRequest $request, Routine $routine): RedirectResponse
    {
        DB::transaction(function () use ($request, $routine): void {
            $record = $this->lockRoutine($routine, $request->integer('version'));
            $state = RoutineState::from($request->validated('state'));

            if ($state === $record->state) {
                return;
            }
            if ($state === RoutineState::Paused && $record->state !== RoutineState::Active) {
                throw ValidationException::withMessages(['state' => 'Można wstrzymać tylko aktywną rutynę.']);
            }

            $nextDueAt = $state === RoutineState::Active
                ? $this->calculate(fn () => $this->schedule->resume(
                    $record->scheduleData(), $record->starts_at->toDateString(), $record->next_due_at->toDateString(), $this->schedule->today(), $this->resolvedDates($record),
                ))
                : $record->next_due_at->toDateString();
            $type = match ($state) {
                RoutineState::Paused => RoutineAction::Paused,
                RoutineState::Archived => RoutineAction::Archived,
                RoutineState::Active => $record->state === RoutineState::Archived ? RoutineAction::Restored : RoutineAction::Resumed,
            };
            $this->createEntry(
                $record, $request->user(), $type,
                $nextDueAt, $this->schedule->today(), null, $record->next_due_at->toDateString(),
            );
            $record->update(['state' => $state, 'next_due_at' => $nextDueAt, 'version' => $record->version + 1]);
        }, 3);

        return to_route('routines.show', $routine);
    }

    private function lockRoutine(Routine $routine, int $version): Routine
    {
        $record = Routine::query()->lockForUpdate()->findOrFail($routine->id);
        Gate::authorize('update', $record);

        if ($record->version !== $version) {
            throw ValidationException::withMessages(['version' => 'Rutyna została zmieniona w innym oknie lub przez inną osobę. Odśwież stronę i spróbuj ponownie.']);
        }

        return $record;
    }

    /** @return list<string> */
    private function resolvedDates(Routine $routine): array
    {
        return array_values($routine->history()->whereNull('cancelled_at')
            ->whereIn('type', [RoutineAction::Completed->value, RoutineAction::Skipped->value])->get()
            ->map(fn (RoutineHistoryEntry $entry) => $entry->scheduled_for->toDateString())->all());
    }

    /** @param array<string, mixed> $data
     * @param  list<string>  $resolvedDates
     */
    private function validateTerm(array $data, array $resolvedDates): void
    {
        if ($data['schedule_type'] === RoutineScheduleType::Weekdays->value &&
            ! in_array((int) CarbonImmutable::parse($data['next_due_at'])->dayOfWeek, $data['weekdays'], true)) {
            throw ValidationException::withMessages(['nextDueAt' => 'Termin musi przypadać w wybrany dzień tygodnia.']);
        }
        if (in_array($data['next_due_at'], $resolvedDates, true)) {
            throw ValidationException::withMessages(['nextDueAt' => 'Ten termin ma już wpis w historii. Wybierz inny termin.']);
        }
    }

    private function createEntry(Routine $routine, User $user, RoutineAction $type, string $scheduledFor, string $actionAt, ?string $notes, string $previousDate): void
    {
        $routine->history()->create([
            'user_id' => $user->id, 'author_name' => $user->name,
            'type' => $type, 'scheduled_for' => $scheduledFor,
            'active_scheduled_for' => $type->isTerm() ? $scheduledFor : null,
            'action_at' => $actionAt, 'notes' => $notes,
            'previous_next_due_at' => $previousDate,
        ]);
    }

    /** @param callable(): string $calculation */
    private function calculate(callable $calculation): string
    {
        try {
            return $calculation();
        } catch (InvalidArgumentException $exception) {
            throw ValidationException::withMessages(['nextDueAt' => $exception->getMessage()]);
        }
    }

    /** @return array<string, mixed> */
    private function presentBase(Routine $routine): array
    {
        return [
            'id' => $routine->id,
            'householdId' => $routine->household_id,
            'name' => $routine->name, 'category' => $routine->category->value,
            'state' => $routine->state->value,
            'scheduleType' => $routine->schedule_type->value,
            'intervalCount' => $routine->interval_count,
            'intervalUnit' => $routine->interval_unit->value,
            'weekdays' => $routine->weekdays,
            'nextDueAt' => $routine->next_due_at->toDateString(),
            'createdAt' => $routine->created_at->toDateString(),
        ];
    }

    /** @return array<string, mixed> */
    private function present(Routine $routine): array
    {
        return [
            ...$this->presentBase($routine),
            'version' => $routine->version,
            'startsAt' => $routine->starts_at->toDateString(),
            'notes' => $routine->notes ?? '',
            'history' => $routine->history->map(fn (RoutineHistoryEntry $entry) => [
                'id' => (string) $entry->id,
                'type' => $entry->type->value,
                'scheduledFor' => $entry->scheduled_for->toDateString(),
                'actionAt' => $entry->action_at->toDateString(),
                'recordedAt' => $entry->created_at->toIso8601String(),
                'author' => ['id' => $entry->user_id ?? 0, 'name' => $entry->author_name],
                'notes' => $entry->notes ?? '',
                'previousNextDueAt' => $entry->previous_next_due_at->toDateString(),
                'cancelledAt' => $entry->cancelled_at?->toIso8601String(),
                'cancelledBy' => $entry->cancelled_at ? [
                    'id' => $entry->cancelled_by ?? 0, 'name' => $entry->cancelled_by_name ?? 'Usunięty użytkownik',
                ] : null,
            ])->values(),
        ];
    }
}
