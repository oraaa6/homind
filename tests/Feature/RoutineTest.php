<?php

use App\Models\Household;
use App\Models\Routine;
use App\Models\RoutineHistoryEntry;
use App\Models\User;
use Carbon\CarbonImmutable;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    CarbonImmutable::setTestNow('2026-11-18 12:00:00');
    $this->withoutVite();
    $this->user = User::factory()->create();
    $this->household = Household::factory()->create();
    $this->household->users()->attach($this->user);
    $this->actingAs($this->user);
});

afterEach(fn () => CarbonImmutable::setTestNow());

function routineRequestData(int $household, array $overrides = []): array
{
    return [...[
        'householdId' => $household, 'name' => 'Zmiana pościeli', 'category' => 'cleaning',
        'scheduleType' => 'interval', 'intervalCount' => 2, 'intervalUnit' => 'week', 'weekdays' => [],
        'startsAt' => '2026-09-01', 'notes' => '',
    ], ...$overrides];
}

function createTestRoutine(Household $household): Routine
{
    return $household->routines()->create([
        'name' => 'Zmiana pościeli', 'category' => 'cleaning', 'state' => 'active',
        'schedule_type' => 'interval', 'interval_count' => 2, 'interval_unit' => 'week',
        'weekdays' => [], 'starts_at' => '2026-09-01', 'next_due_at' => '2026-11-16', 'version' => 1,
    ]);
}

test('routine creation includes an earlier completion and uses authenticated author', function () {
    $this->post(route('routines.store'), routineRequestData($this->household->id, [
        'startsAt' => '2026-11-18', 'lastCompletedAt' => '2026-11-11',
        'author' => ['id' => 999, 'name' => 'Forged'], 'state' => 'archived', 'created_by' => 999,
    ]))->assertSessionHasNoErrors()->assertRedirect();
    $routine = Routine::query()->sole();
    expect($routine->household_id)->toBe($this->household->id)
        ->and($routine->state->value)->toBe('active')
        ->and($routine->created_by)->toBe($this->user->id)
        ->and($routine->starts_at->toDateString())->toBe('2026-11-18')
        ->and($routine->next_due_at->toDateString())->toBe('2026-11-25')
        ->and($routine->history->sole()->user_id)->toBe($this->user->id)
        ->and($routine->history->sole()->author_name)->toBe($this->user->name);
});

test('a new monthly routine starts on the chosen date without inventing a completion', function () {
    $this->post(route('routines.store'), routineRequestData($this->household->id, [
        'startsAt' => '2026-11-18', 'intervalCount' => 1, 'intervalUnit' => 'month',
    ]))->assertSessionHasNoErrors();
    $routine = Routine::query()->sole();
    expect($routine->starts_at->toDateString())->toBe('2026-11-18')
        ->and($routine->next_due_at->toDateString())->toBe('2026-11-18')
        ->and($routine->history()->count())->toBe(0);
});

test('a monthly routine completed today is next due in a month and rejects client calculated dates', function () {
    $this->post(route('routines.store'), routineRequestData($this->household->id, [
        'startsAt' => '2026-11-18', 'intervalCount' => 1, 'intervalUnit' => 'month', 'lastCompletedAt' => '2026-11-18',
    ]))->assertSessionHasNoErrors();
    $routine = Routine::query()->sole();
    expect($routine->next_due_at->toDateString())->toBe('2026-12-18')
        ->and($routine->starts_at->toDateString())->toBe('2026-11-18')
        ->and($routine->history()->count())->toBe(1);
    $this->post(route('routines.store'), routineRequestData($this->household->id, [
        'startsAt' => '2026-11-18', 'nextDueAt' => '2027-01-01',
    ]))->assertSessionHasErrors('nextDueAt');
    expect(Routine::query()->count())->toBe(1);
});

test('routine endpoints require authentication', function () {
    auth()->logout();
    $this->get(route('routines'))->assertRedirect(route('login'));
    $this->post(route('routines.store'), routineRequestData($this->household->id))->assertRedirect(route('login'));
});

test('users cannot read or mutate routines from other households', function () {
    $other = Household::factory()->create();
    $routine = createTestRoutine($other);
    $this->get(route('routines.show', $routine))->assertForbidden();
    $this->get(route('routines.edit', $routine))->assertForbidden();
    $this->put(route('routines.update', $routine), routineRequestData($this->household->id, ['version' => 1]))->assertForbidden();
    $this->delete(route('routines.destroy', $routine), ['version' => 1])->assertForbidden();
    $this->patch(route('routines.state.update', $routine), ['version' => 1, 'state' => 'paused'])->assertForbidden();
    $this->post(route('routines.actions.store', $routine), ['version' => 1, 'type' => 'completed', 'scheduledFor' => '2026-11-16', 'actionAt' => '2026-11-18'])->assertForbidden();
    $this->post(route('routines.store'), routineRequestData($other->id))->assertSessionHasErrors('householdId');
    $this->get(route('routines'))->assertInertia(fn (Assert $page) => $page->has('routines', 0));
});

test('members of the same household share routine access and multiple homes are supported', function () {
    $routine = createTestRoutine($this->household);
    $member = User::factory()->create();
    $this->household->users()->attach($member);
    $second = Household::factory()->create();
    $second->users()->attach($member);
    createTestRoutine($second);
    $this->actingAs($member)->get(route('routines'))->assertInertia(fn (Assert $page) => $page->has('routines', 2));
    $this->get(route('routines.show', $routine))->assertOk();
});

test('list uses summaries while details and edit retain the complete history', function () {
    $routine = createTestRoutine($this->household);
    $routine->update(['interval_count' => 1, 'next_due_at' => '2026-11-08']);
    foreach ([
        ['type' => 'completed', 'scheduled_for' => '2026-11-01', 'action_at' => '2026-11-10', 'active_scheduled_for' => '2026-11-01'],
        ['type' => 'skipped', 'scheduled_for' => '2026-11-15', 'action_at' => '2026-11-15', 'active_scheduled_for' => '2026-11-15'],
        ['type' => 'completed', 'scheduled_for' => '2026-11-17', 'action_at' => '2026-11-17', 'cancelled_at' => now()],
        ['type' => 'resumed', 'scheduled_for' => '2026-11-08', 'action_at' => '2026-11-18'],
    ] as $entry) {
        $routine->history()->create([
            'user_id' => $this->user->id, 'author_name' => $this->user->name,
            'previous_next_due_at' => '2026-11-08', 'notes' => 'History details', ...$entry,
        ]);
    }

    $this->get(route('routines'))->assertInertia(fn (Assert $page) => $page
        ->has('routines', 1)
        ->where('routines.0.lastCompletedAt', '2026-11-10')
        ->where('routines.0.missedTermsCount', 1)
        ->missing('routines.0.history')
        ->missing('routines.0.notes')
        ->missing('routines.0.startsAt')
        ->missing('routines.0.version'));
    foreach (['routines.show', 'routines.edit'] as $route) {
        $this->get(route($route, $routine))->assertInertia(fn (Assert $page) => $page
            ->has('routine.history', 4)
            ->where('routine.history.0.notes', 'History details')
            ->where('routine.history.0.author.name', $this->user->name)
            ->where('routine.version', 1));
    }
});

test('inactive routines without completions have empty summaries without history', function () {
    foreach (['paused', 'archived'] as $state) {
        $routine = createTestRoutine($this->household);
        $routine->update(['state' => $state]);
    }
    $this->get(route('routines'))->assertInertia(fn (Assert $page) => $page
        ->has('routines', 2)
        ->where('routines.0.lastCompletedAt', null)->where('routines.0.missedTermsCount', 0)
        ->where('routines.1.lastCompletedAt', null)->where('routines.1.missedTermsCount', 0)
        ->missing('routines.0.history')->missing('routines.1.history'));
});

test('completion is atomic rejects stale duplicates and retains planned and actual dates', function () {
    $routine = createTestRoutine($this->household);
    $payload = ['version' => 1, 'type' => 'completed', 'scheduledFor' => '2026-11-16', 'actionAt' => '2026-11-18', 'author' => ['id' => 999]];
    $this->post(route('routines.actions.store', $routine), $payload)->assertSessionHasNoErrors();
    $this->post(route('routines.actions.store', $routine), $payload)->assertSessionHasErrors('version');
    $this->post(route('routines.actions.store', $routine), [...$payload, 'version' => 2])->assertSessionHasErrors('scheduledFor');
    $routine->refresh();
    expect($routine->next_due_at->toDateString())->toBe('2026-12-02')
        ->and($routine->history)->toHaveCount(1)
        ->and($routine->history->sole()->action_at->toDateString())->toBe('2026-11-18')
        ->and($routine->history->sole()->scheduled_for->toDateString())->toBe('2026-11-16')
        ->and($routine->history->sole()->user_id)->toBe($this->user->id);
});

test('only latest active history can be undone and the same term can then be confirmed again', function () {
    $routine = createTestRoutine($this->household);
    $this->post(route('routines.actions.store', $routine), ['version' => 1, 'type' => 'completed', 'scheduledFor' => '2026-11-16', 'actionAt' => '2026-11-18']);
    $first = $routine->history()->first();
    $this->post(route('routines.actions.store', $routine), ['version' => 2, 'type' => 'skipped', 'scheduledFor' => '2026-12-02']);
    $last = $routine->history()->first();
    $this->patch(route('routines.actions.undo', [$routine, $first->id]), ['version' => 3])->assertSessionHasErrors('version');
    $this->patch(route('routines.actions.undo', [$routine, $last->id]), ['version' => 3])->assertSessionHasNoErrors();
    $this->patch(route('routines.actions.undo', [$routine, $first->id]), ['version' => 4])->assertSessionHasNoErrors();
    expect($routine->refresh()->next_due_at->toDateString())->toBe('2026-11-16')
        ->and($routine->history()->whereNull('cancelled_at')->count())->toBe(0)
        ->and($first->refresh()->cancelled_by)->toBe($this->user->id)
        ->and($first->active_scheduled_for)->toBeNull();
    $this->post(route('routines.actions.store', $routine), ['version' => 5, 'type' => 'completed', 'scheduledFor' => '2026-11-16', 'actionAt' => '2026-11-18'])->assertSessionHasNoErrors();
    expect($routine->history()->count())->toBe(3);
});

test('dates cannot be future or earlier than the last active completion', function () {
    $routine = createTestRoutine($this->household);
    $this->post(route('routines.actions.store', $routine), ['version' => 1, 'type' => 'completed', 'scheduledFor' => '2026-11-16', 'actionAt' => '2026-11-17']);
    foreach (['2026-11-01', '2026-11-19'] as $date) {
        $this->post(route('routines.actions.store', $routine), ['version' => 2, 'type' => 'completed', 'scheduledFor' => '2026-12-01', 'actionAt' => $date])->assertSessionHasErrors('actionAt');
    }
    expect($routine->history()->count())->toBe(1);
});

test('edits validate household dates resolved terms and stale versions', function () {
    $routine = createTestRoutine($this->household);
    $this->post(route('routines.actions.store', $routine), ['version' => 1, 'type' => 'completed', 'scheduledFor' => '2026-11-16', 'actionAt' => '2026-11-18']);
    $this->put(route('routines.update', $routine), routineRequestData($this->household->id, ['version' => 2, 'nextDueAt' => '2026-11-16']))->assertSessionHasErrors('nextDueAt');
    $this->put(route('routines.update', $routine), routineRequestData($this->household->id, ['version' => 1, 'nextDueAt' => '2026-12-18']))->assertSessionHasErrors('version');
    $this->put(route('routines.update', $routine), routineRequestData($this->household->id, ['version' => 2, 'intervalCount' => 1, 'intervalUnit' => 'month', 'nextDueAt' => '2026-12-18']))->assertSessionHasNoErrors();
    expect($routine->refresh()->next_due_at->toDateString())->toBe('2026-12-18')
        ->and($routine->starts_at->toDateString())->toBe('2026-09-01')
        ->and($routine->history()->count())->toBe(1);
});

test('weekday creation aligns its first date while edits validate manual dates and duplicate days', function () {
    $payload = routineRequestData($this->household->id, ['scheduleType' => 'weekdays', 'weekdays' => [1, 5], 'startsAt' => '2026-11-18']);
    $this->post(route('routines.store'), [...$payload, 'weekdays' => [1, '1']])->assertSessionHasErrors('weekdays.0');
    $this->post(route('routines.store'), $payload)->assertSessionHasNoErrors();
    $routine = Routine::query()->sole();
    expect($routine->starts_at->toDateString())->toBe('2026-11-20')
        ->and($routine->next_due_at->toDateString())->toBe('2026-11-20');
    $this->put(route('routines.update', $routine), [...$payload, 'version' => 1, 'startsAt' => '2026-11-20', 'nextDueAt' => '2026-11-25'])->assertSessionHasErrors('nextDueAt');
});

test('changing weekdays permits an earlier first term before any planned term is resolved', function () {
    $routine = createTestRoutine($this->household);
    $routine->update(['schedule_type' => 'weekdays', 'weekdays' => [3, 5], 'starts_at' => '2026-11-18', 'next_due_at' => '2026-11-18']);

    $this->put(route('routines.update', $routine), routineRequestData($this->household->id, [
        'version' => 1, 'scheduleType' => 'weekdays', 'weekdays' => [2, 5],
        'startsAt' => '2026-11-18', 'nextDueAt' => '2026-11-17',
    ]))->assertSessionHasNoErrors();

    expect($routine->refresh()->starts_at->toDateString())->toBe('2026-11-17')
        ->and($routine->next_due_at->toDateString())->toBe('2026-11-17')
        ->and($routine->weekdays)->toBe([2, 5])
        ->and($routine->history()->count())->toBe(0);
});

test('submitted start dates cannot bypass the original start of a resolved schedule', function () {
    $routine = createTestRoutine($this->household);
    $routine->update(['starts_at' => '2026-11-18', 'next_due_at' => '2026-11-18']);
    $this->post(route('routines.actions.store', $routine), [
        'version' => 1, 'type' => 'completed', 'scheduledFor' => '2026-11-18', 'actionAt' => '2026-11-18',
    ])->assertSessionHasNoErrors();

    $this->put(route('routines.update', $routine), routineRequestData($this->household->id, [
        'version' => 2, 'startsAt' => '2026-11-17', 'nextDueAt' => '2026-11-17',
    ]))->assertSessionHasErrors('nextDueAt');

    expect($routine->refresh()->starts_at->toDateString())->toBe('2026-11-18')
        ->and($routine->next_due_at->toDateString())->toBe('2026-12-02')
        ->and($routine->version)->toBe(2)
        ->and($routine->history()->count())->toBe(1);
});

test('paused and archived routines retain history cannot be completed and resume without backlog', function () {
    $routine = createTestRoutine($this->household);
    $routine->update(['next_due_at' => '2026-09-01']);
    $routine->history()->create([
        'user_id' => $this->user->id, 'author_name' => $this->user->name,
        'type' => 'completed', 'scheduled_for' => '2026-08-18', 'active_scheduled_for' => '2026-08-18',
        'action_at' => '2026-08-18', 'previous_next_due_at' => '2026-09-01',
    ]);
    $this->patch(route('routines.state.update', $routine), ['version' => 1, 'state' => 'paused'])->assertSessionHasNoErrors();
    $this->post(route('routines.actions.store', $routine), ['version' => 2, 'type' => 'completed', 'scheduledFor' => '2026-09-01', 'actionAt' => '2026-11-18'])->assertSessionHasErrors('version');
    $this->patch(route('routines.state.update', $routine), ['version' => 2, 'state' => 'archived'])->assertSessionHasNoErrors();
    $this->patch(route('routines.state.update', $routine), ['version' => 3, 'state' => 'active'])->assertSessionHasNoErrors();
    expect($routine->refresh()->next_due_at->toDateString())->toBeGreaterThanOrEqual('2026-11-18')
        ->and($routine->history()->pluck('type')->map(fn ($type) => $type->value)->all())->toBe(['restored', 'archived', 'paused', 'completed']);
});

test('archive and restore history records the actor and new term without resolving it', function () {
    $routine = createTestRoutine($this->household);
    $this->patch(route('routines.state.update', $routine), ['version' => 1, 'state' => 'archived'])->assertSessionHasNoErrors();
    $archived = $routine->history()->first();
    expect($archived->type->value)->toBe('archived')
        ->and($archived->action_at->toDateString())->toBe('2026-11-18')
        ->and($archived->user_id)->toBe($this->user->id)
        ->and($archived->author_name)->toBe($this->user->name)
        ->and($archived->active_scheduled_for)->toBeNull();
    $this->patch(route('routines.state.update', $routine), ['version' => 2, 'state' => 'archived'])->assertSessionHasNoErrors();
    expect($routine->history()->count())->toBe(1);

    $this->patch(route('routines.state.update', $routine), ['version' => 2, 'state' => 'active'])->assertSessionHasNoErrors();
    $restored = $routine->history()->first();
    expect($restored->type->value)->toBe('restored')
        ->and($restored->scheduled_for->toDateString())->toBe('2026-11-30')
        ->and($restored->user_id)->toBe($this->user->id)
        ->and($restored->author_name)->toBe($this->user->name)
        ->and($restored->active_scheduled_for)->toBeNull();
    $this->get(route('routines.show', $routine))->assertInertia(fn (Assert $page) => $page
        ->where('routine.history.0.type', 'restored')
        ->where('routine.history.0.scheduledFor', '2026-11-30')
        ->where('routine.history.1.type', 'archived'));
    foreach ([$archived, $restored] as $entry) {
        $this->patch(route('routines.actions.undo', [$routine, $entry->id]), ['version' => 3])->assertSessionHasErrors('version');
    }
    $this->post(route('routines.actions.store', $routine), [
        'version' => 3, 'type' => 'completed', 'scheduledFor' => '2026-11-30', 'actionAt' => '2026-11-18',
    ])->assertSessionHasNoErrors();
});

test('pause and resume history is informational and does not block undo or resolve pending terms', function () {
    $routine = createTestRoutine($this->household);
    $this->post(route('routines.actions.store', $routine), [
        'version' => 1, 'type' => 'completed', 'scheduledFor' => '2026-11-16', 'actionAt' => '2026-11-17',
    ])->assertSessionHasNoErrors();
    $completed = $routine->history()->first();

    $this->patch(route('routines.state.update', $routine), ['version' => 2, 'state' => 'paused'])->assertSessionHasNoErrors();
    $paused = $routine->history()->first();
    expect($paused->type->value)->toBe('paused')
        ->and($paused->action_at->toDateString())->toBe('2026-11-18')
        ->and($paused->user_id)->toBe($this->user->id)
        ->and($paused->author_name)->toBe($this->user->name)
        ->and($paused->active_scheduled_for)->toBeNull();

    $this->patch(route('routines.state.update', $routine), ['version' => 3, 'state' => 'paused'])->assertSessionHasNoErrors();
    expect($routine->history()->count())->toBe(2);

    $this->patch(route('routines.state.update', $routine), ['version' => 3, 'state' => 'active'])->assertSessionHasNoErrors();
    $resumed = $routine->history()->first();
    expect($resumed->type->value)->toBe('resumed')
        ->and($resumed->scheduled_for->toDateString())->toBe('2026-12-01')
        ->and($resumed->active_scheduled_for)->toBeNull()
        ->and($routine->refresh()->next_due_at->toDateString())->toBe('2026-12-01');
    $this->get(route('routines.show', $routine))->assertInertia(fn (Assert $page) => $page
        ->where('routine.history.0.type', 'resumed')
        ->where('routine.history.0.author.name', $this->user->name)
        ->where('routine.history.0.scheduledFor', '2026-12-01')
        ->where('routine.history.1.type', 'paused'));

    $this->patch(route('routines.actions.undo', [$routine, $resumed->id]), ['version' => 4])->assertSessionHasErrors('version');
    $this->patch(route('routines.actions.undo', [$routine, $completed->id]), ['version' => 4])->assertSessionHasNoErrors();
    expect($completed->refresh()->cancelled_at)->not->toBeNull()
        ->and($resumed->refresh()->cancelled_at)->toBeNull()
        ->and($routine->refresh()->next_due_at->toDateString())->toBe('2026-11-16');
    $this->post(route('routines.actions.store', $routine), [
        'version' => 5, 'type' => 'completed', 'scheduledFor' => '2026-11-16', 'actionAt' => '2026-11-18',
    ])->assertSessionHasNoErrors();
});

test('state entries cannot be submitted through the completion endpoint or freeze an unstarted schedule', function () {
    $routine = createTestRoutine($this->household);
    $routine->update(['starts_at' => '2026-11-20', 'next_due_at' => '2026-11-20']);
    foreach (['paused', 'resumed', 'archived', 'restored'] as $type) {
        $this->post(route('routines.actions.store', $routine), [
            'version' => 1, 'type' => $type, 'scheduledFor' => '2026-11-20',
        ])->assertSessionHasErrors('type');
    }
    $this->patch(route('routines.state.update', $routine), ['version' => 1, 'state' => 'paused'])->assertSessionHasNoErrors();
    $this->patch(route('routines.state.update', $routine), ['version' => 2, 'state' => 'active'])->assertSessionHasNoErrors();
    $this->put(route('routines.update', $routine), routineRequestData($this->household->id, [
        'version' => 3, 'startsAt' => '2026-11-20', 'nextDueAt' => '2026-11-18',
    ]))->assertSessionHasNoErrors();
    expect($routine->refresh()->starts_at->toDateString())->toBe('2026-11-18')
        ->and($routine->history()->count())->toBe(2);
    $this->post(route('routines.actions.store', $routine), [
        'version' => 4, 'type' => 'completed', 'scheduledFor' => '2026-11-18', 'actionAt' => '2026-11-18',
    ])->assertSessionHasNoErrors();
});

test('deleted actors keep their names in the routine history and routine deletion removes history', function () {
    $routine = createTestRoutine($this->household);
    $this->post(route('routines.actions.store', $routine), ['version' => 1, 'type' => 'completed', 'scheduledFor' => '2026-11-16', 'actionAt' => '2026-11-18']);
    $entry = $routine->history()->first();
    $member = User::factory()->create();
    $this->household->users()->attach($member);
    $originalName = $this->user->name;
    $this->user->delete();
    $this->actingAs($member)->get(route('routines.show', $routine))->assertInertia(fn (Assert $page) => $page->where('routine.history.0.author.name', $originalName));
    $this->delete(route('routines.destroy', $routine), ['version' => 2])->assertRedirect(route('routines'));
    expect(RoutineHistoryEntry::query()->find($entry->id))->toBeNull();
});

test('missing routines show a useful missing view on details and edit', function () {
    foreach (['routines.show', 'routines.edit'] as $route) {
        $this->get(route($route, 99999))->assertNotFound()->assertInertia(fn (Assert $page) => $page->component('routines/show')->where('routine', null));
    }
});
