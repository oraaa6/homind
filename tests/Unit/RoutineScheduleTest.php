<?php

use App\Enums\RoutineAction;
use App\Services\RoutineSchedule;

function routineScheduleFixture(string $unit = 'week', int $count = 2, array $weekdays = []): array
{
    return ['schedule_type' => $weekdays === [] ? 'interval' : 'weekdays', 'interval_count' => $count, 'interval_unit' => $unit, 'weekdays' => $weekdays];
}

test('initial routine dates distinguish the first planned term from an actual completion', function (array $schedule, string $firstDate, ?string $lastCompletedAt, array $expected) {
    expect((new RoutineSchedule)->initialDates($schedule, $firstDate, $lastCompletedAt))->toBe($expected);
})->with([
    [routineScheduleFixture('month', 1), '2026-11-18', null, ['starts_at' => '2026-11-18', 'next_due_at' => '2026-11-18']],
    [routineScheduleFixture('month', 1), '2026-11-18', '2026-11-18', ['starts_at' => '2026-11-18', 'next_due_at' => '2026-12-18']],
    [routineScheduleFixture('month', 1), '2026-12-01', null, ['starts_at' => '2026-12-01', 'next_due_at' => '2026-12-01']],
    [routineScheduleFixture(), '2026-11-18', '2026-11-11', ['starts_at' => '2026-11-18', 'next_due_at' => '2026-11-25']],
    [routineScheduleFixture(weekdays: [1, 5]), '2026-11-18', null, ['starts_at' => '2026-11-20', 'next_due_at' => '2026-11-20']],
    [routineScheduleFixture(weekdays: [1, 5]), '2026-11-18', '2026-11-18', ['starts_at' => '2026-11-20', 'next_due_at' => '2026-11-20']],
    [routineScheduleFixture('month', 1), '2026-01-31', '2026-01-31', ['starts_at' => '2026-01-31', 'next_due_at' => '2026-02-28']],
]);

test('editing can bring an unstarted routine forward without moving an established start', function (string $nextDueAt, array $resolvedDates, string $expected) {
    expect((new RoutineSchedule)->editedStartDate('2026-11-18', $nextDueAt, $resolvedDates))->toBe($expected);
})->with([
    ['2026-11-17', [], '2026-11-17'],
    ['2026-11-20', [], '2026-11-18'],
    ['2026-11-17', ['2026-11-11'], '2026-11-17'],
    ['2026-11-20', ['2026-11-18'], '2026-11-18'],
]);

test('editing cannot move the next term before an already resolved schedule began', function () {
    expect(fn () => (new RoutineSchedule)->editedStartDate('2026-11-18', '2026-11-17', ['2026-11-18']))
        ->toThrow(InvalidArgumentException::class);
});

test('routine intervals clamp month and leap year boundaries without overflow', function (string $reference, string $unit, int $count, string $minimum, string $expected) {
    expect((new RoutineSchedule)->nextDate($reference, routineScheduleFixture($unit, $count), $minimum))->toBe($expected);
})->with([
    ['2026-01-31', 'month', 1, '2026-01-01', '2026-02-28'],
    ['2026-02-28', 'month', 1, '2026-01-01', '2026-03-28'],
    ['2024-02-29', 'year', 1, '2024-01-01', '2025-02-28'],
    ['2026-11-01', 'week', 2, '2026-11-18', '2026-11-29'],
    ['2026-11-17', 'day', 1, '2026-11-18', '2026-11-18'],
    ['2026-11-11', 'week', 2, '2026-11-18', '2026-11-25'],
]);

test('late completion counts from execution and skipping counts from the planned term', function () {
    $schedule = new RoutineSchedule;
    $data = routineScheduleFixture();
    expect($schedule->afterAction($data, '2026-09-01', '2026-11-16', '2026-11-18', RoutineAction::Completed, '2026-11-18'))->toBe('2026-12-02')
        ->and($schedule->afterAction($data, '2026-09-01', '2026-11-16', '2026-11-18', RoutineAction::Skipped, '2026-11-18'))->toBe('2026-11-30');
});

test('multiple missed routine dates resolve to one next pending term', function () {
    $schedule = new RoutineSchedule;
    expect($schedule->afterAction(routineScheduleFixture('week', 1), '2026-09-01', '2026-10-01', '2026-11-18', RoutineAction::Completed, '2026-11-18'))->toBe('2026-11-25');
});

test('state changes cannot be used to resolve a routine term', function (RoutineAction $type) {
    expect(fn () => (new RoutineSchedule)->afterAction(
        routineScheduleFixture(), '2026-09-01', '2026-11-16', '2026-11-18', $type, '2026-11-18',
    ))->toThrow(InvalidArgumentException::class);
})->with([RoutineAction::Paused, RoutineAction::Resumed, RoutineAction::Archived, RoutineAction::Restored]);

test('weekday schedules keep Monday and Friday even after late completion', function () {
    $schedule = new RoutineSchedule;
    $data = routineScheduleFixture(weekdays: [1, 5]);
    expect($schedule->afterAction($data, '2026-09-01', '2026-11-16', '2026-11-18', RoutineAction::Completed, '2026-11-18'))->toBe('2026-11-20')
        ->and($schedule->nextWeekday('2026-11-20', [1, 5]))->toBe('2026-11-23')
        ->and($schedule->nextWeekday('2026-11-20', [1, 5], true))->toBe('2026-11-20');
});

test('resuming ignores elapsed terms and avoids already resolved dates', function () {
    $schedule = new RoutineSchedule;
    expect($schedule->resume(routineScheduleFixture(), '2026-09-01', '2026-10-01', '2026-11-18'))->toBe('2026-11-26')
        ->and($schedule->resume(routineScheduleFixture(), '2026-09-01', '2026-10-01', '2026-11-18', ['2026-11-26']))->toBe('2026-12-10');
});

test('list summaries count only unresolved overdue routine terms', function (array $schedule, string $nextDueAt, string $today, array $resolvedDates, int $expected) {
    expect((new RoutineSchedule)->missedTermsCount($schedule, $nextDueAt, $today, $resolvedDates))->toBe($expected);
})->with([
    [routineScheduleFixture(count: 1), '2026-11-08', '2026-11-18', [], 2],
    [routineScheduleFixture(count: 1), '2026-11-08', '2026-11-18', ['2026-11-15'], 1],
    [routineScheduleFixture(count: 1), '2026-11-08', '2026-11-18', ['2026-11-08', '2026-11-15'], 0],
    [routineScheduleFixture(count: 1), '2026-11-18', '2026-11-18', [], 0],
    [routineScheduleFixture(count: 1), '2026-11-25', '2026-11-18', [], 0],
    [routineScheduleFixture('day', 1), '2026-11-14', '2026-11-18', ['2026-11-15', '2026-11-17'], 2],
    [routineScheduleFixture(weekdays: [2, 5]), '2026-11-10', '2026-11-18', ['2026-11-13', '2026-11-17'], 1],
    [routineScheduleFixture('month', 1), '2026-01-31', '2026-04-01', ['2026-02-28'], 2],
]);

test('undo restores old pending dates and respects edited starts and weekdays', function () {
    $schedule = new RoutineSchedule;
    expect($schedule->restore(routineScheduleFixture(), '2026-09-01', '2026-11-16'))->toBe('2026-11-16')
        ->and($schedule->restore(routineScheduleFixture(weekdays: [1, 5]), '2026-11-21', '2026-11-16'))->toBe('2026-11-23')
        ->and($schedule->restore(routineScheduleFixture(), '2026-09-01', '2026-11-16', ['2026-11-16']))->toBe('2026-11-30');
});

test('invalid routine frequencies and date overflow are rejected', function () {
    expect(fn () => (new RoutineSchedule)->nextDate('2026-11-18', routineScheduleFixture(count: 0), '2026-11-18'))->toThrow(InvalidArgumentException::class)
        ->and(fn () => (new RoutineSchedule)->nextDate('9500-01-01', routineScheduleFixture('year', 1000), '9500-01-01'))->toThrow(InvalidArgumentException::class)
        ->and(fn () => (new RoutineSchedule)->nextWeekday('2026-11-18', []))->toThrow(InvalidArgumentException::class);
});
