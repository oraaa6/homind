<?php

namespace App\Services;

use App\Enums\RoutineAction;
use App\Enums\RoutineIntervalUnit;
use App\Enums\RoutineScheduleType;
use Carbon\CarbonImmutable;
use InvalidArgumentException;

class RoutineSchedule
{
    public function today(): string
    {
        return CarbonImmutable::today((string) config('routines.timezone', 'Europe/Warsaw'))->toDateString();
    }

    /**
     * @param  array{schedule_type: string, interval_count: int, interval_unit: string, weekdays: list<int>}  $schedule
     * @return array{starts_at: string, next_due_at: string}
     */
    public function initialDates(array $schedule, string $firstDate, ?string $lastCompletedAt = null): array
    {
        $firstDate = $schedule['schedule_type'] === RoutineScheduleType::Weekdays->value
            ? $this->nextWeekday($firstDate, $schedule['weekdays'], true)
            : $firstDate;

        return [
            'starts_at' => $firstDate,
            'next_due_at' => $lastCompletedAt
                ? $this->nextDate($lastCompletedAt, $schedule, $firstDate)
                : $firstDate,
        ];
    }

    /** @param list<string> $resolvedDates */
    public function editedStartDate(string $firstDate, string $nextDueAt, array $resolvedDates): string
    {
        foreach ($resolvedDates as $date) {
            if ($date >= $firstDate) {
                if ($nextDueAt < $firstDate) {
                    throw new InvalidArgumentException('Termin wykonania nie może przypadać przed początkiem rozliczonego harmonogramu.');
                }

                return $firstDate;
            }
        }

        return min($firstDate, $nextDueAt);
    }

    /** @param list<int> $weekdays */
    public function nextWeekday(string $from, array $weekdays, bool $includeStart = false): string
    {
        if ($weekdays === [] || array_diff($weekdays, range(0, 6)) !== []) {
            throw new InvalidArgumentException('Wybierz prawidłowe dni tygodnia.');
        }

        $date = CarbonImmutable::parse($from)->startOfDay();
        for ($offset = $includeStart ? 0 : 1; $offset <= 7; $offset++) {
            $candidate = $date->addDays($offset);
            if (in_array($candidate->dayOfWeek, $weekdays, true)) {
                return $this->dateString($candidate);
            }
        }

        throw new InvalidArgumentException('Nieprawidłowe dni tygodnia.');
    }

    /** @param array{schedule_type: string, interval_count: int, interval_unit: string, weekdays: list<int>} $schedule */
    public function nextDate(string $reference, array $schedule, string $notBefore): string
    {
        if ($schedule['schedule_type'] === RoutineScheduleType::Weekdays->value) {
            $afterReference = CarbonImmutable::parse($reference)->addDay()->toDateString();

            return $this->nextWeekday(max($afterReference, $notBefore), $schedule['weekdays'], true);
        }

        $count = $schedule['interval_count'];
        if ($count < 1 || $count > 1000) {
            throw new InvalidArgumentException('Częstotliwość musi być liczbą od 1 do 1000.');
        }

        $date = CarbonImmutable::parse($reference)->startOfDay();
        do {
            $date = match ($schedule['interval_unit']) {
                RoutineIntervalUnit::Day->value => $date->addDays($count),
                RoutineIntervalUnit::Week->value => $date->addWeeks($count),
                RoutineIntervalUnit::Month->value => $date->addMonthsNoOverflow($count),
                RoutineIntervalUnit::Year->value => $date->addYearsNoOverflow($count),
                default => throw new InvalidArgumentException('Nieprawidłowa jednostka czasu.'),
            };
            $result = $this->dateString($date);
        } while ($result < $notBefore);

        return $result;
    }

    /** @param array{schedule_type: string, interval_count: int, interval_unit: string, weekdays: list<int>} $schedule */
    public function afterAction(array $schedule, string $startsAt, string $scheduledFor, string $actionAt, RoutineAction $type, string $today): string
    {
        if (! $type->isTerm()) {
            throw new InvalidArgumentException('Zmiana stanu rutyny nie rozlicza terminu.');
        }

        $notBefore = max($startsAt, $today, CarbonImmutable::parse($scheduledFor)->addDay()->toDateString());

        return $this->nextDate(
            $type === RoutineAction::Completed ? $actionAt : $scheduledFor,
            $schedule,
            $notBefore,
        );
    }

    /**
     * @param  array{schedule_type: string, interval_count: int, interval_unit: string, weekdays: list<int>}  $schedule
     * @param  list<string>  $resolvedDates
     */
    public function missedTermsCount(array $schedule, string $nextDueAt, string $today, array $resolvedDates = []): int
    {
        $resolved = array_flip($resolvedDates);
        $count = 0;
        for ($date = $nextDueAt; $date < $today; $date = $this->nextDate($date, $schedule, $date)) {
            if (! isset($resolved[$date])) {
                $count++;
            }
        }

        return $count;
    }

    /**
     * @param  array{schedule_type: string, interval_count: int, interval_unit: string, weekdays: list<int>}  $schedule
     * @param  list<string>  $resolvedDates
     */
    public function resume(array $schedule, string $startsAt, string $nextDueAt, string $today, array $resolvedDates = []): string
    {
        $notBefore = max($startsAt, $today);
        $date = $nextDueAt >= $notBefore
            ? $nextDueAt
            : $this->nextDate($nextDueAt, $schedule, $notBefore);

        return $this->restore($schedule, $startsAt, $date, $resolvedDates);
    }

    /**
     * @param  array{schedule_type: string, interval_count: int, interval_unit: string, weekdays: list<int>}  $schedule
     * @param  list<string>  $resolvedDates
     */
    public function restore(array $schedule, string $startsAt, string $date, array $resolvedDates = []): string
    {
        $date = max($startsAt, $date);
        if ($schedule['schedule_type'] === RoutineScheduleType::Weekdays->value) {
            $date = $this->nextWeekday($date, $schedule['weekdays'], true);
        }

        while (in_array($date, $resolvedDates, true)) {
            $date = $this->nextDate($date, $schedule, $date);
        }

        return $date;
    }

    private function dateString(CarbonImmutable $date): string
    {
        if ($date->year < 1 || $date->year > 9999) {
            throw new InvalidArgumentException('Wyliczony termin wykracza poza obsługiwany zakres dat.');
        }

        return $date->toDateString();
    }
}
