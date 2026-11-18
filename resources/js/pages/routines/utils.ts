import type { FormDataErrors } from '@inertiajs/core';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import {
    RoutineCategory,
    routineCategoryOptions,
} from '@/constants/routine-categories';
import type { RoutineWeekday } from '@/constants/routine-schedule';
import {
    RoutineIntervalUnit,
    RoutineScheduleType,
    routineIntervalUnitForms,
    routineIntervalUnitOptions,
    routineScheduleTypeOptions,
    routineWeekdayOptions,
} from '@/constants/routine-schedule';
import type { Household } from '@/types/household';
import type {
    Routine,
    RoutineAction,
    RoutineActionFormData,
    RoutineActionInput,
    RoutineFormData,
    RoutineHistoryEntry,
    RoutineInput,
    RoutineSchedule,
    RoutineScheduleChanges,
    routineStatusColors,
} from './types';
import { RoutineState, RoutineStatus } from './types';

export function getRoutineStatus(
    routine: Pick<Routine, 'state' | 'nextDueAt'>,
    now = dayjs(),
): keyof typeof routineStatusColors {
    if (routine.state === RoutineState.Paused) {
        return RoutineStatus.Paused;
    }

    if (routine.state === RoutineState.Archived) {
        return RoutineStatus.Archived;
    }

    const days = dayjs(routine.nextDueAt).diff(now.startOf('day'), 'day');

    if (days < 0) {
        return RoutineStatus.Overdue;
    }

    return days === 0 ? RoutineStatus.Today : RoutineStatus.Scheduled;
}

export function getNextWeekdayDate(
    from: string,
    weekdays: RoutineWeekday[],
    includeStart = false,
) {
    if (!weekdays.length) {
        throw new Error('Wybierz przynajmniej jeden dzień tygodnia.');
    }

    for (let offset = includeStart ? 0 : 1; offset <= 7; offset++) {
        const date = dayjs(from).add(offset, 'day');

        if (weekdays.some((weekday) => weekday === date.day())) {
            return date.format('YYYY-MM-DD');
        }
    }

    throw new Error('Nieprawidłowe dni tygodnia.');
}

export function getNextRoutineDate(
    referenceDate: string,
    schedule: RoutineSchedule,
    notBefore = dayjs().format('YYYY-MM-DD'),
) {
    if (!dayjs(referenceDate).isValid() || !dayjs(notBefore).isValid()) {
        return '';
    }

    if (schedule.scheduleType === RoutineScheduleType.Weekdays) {
        const firstPossibleDate = dayjs(referenceDate)
            .add(1, 'day')
            .format('YYYY-MM-DD');

        return getNextWeekdayDate(
            firstPossibleDate > notBefore ? firstPossibleDate : notBefore,
            schedule.weekdays,
            true,
        );
    }

    if (
        !Number.isSafeInteger(schedule.intervalCount) ||
        schedule.intervalCount < 1 ||
        schedule.intervalCount > 1000
    ) {
        return '';
    }

    let nextDate = dayjs(referenceDate).add(
        schedule.intervalCount,
        schedule.intervalUnit,
    );

    while (nextDate.isBefore(dayjs(notBefore), 'day')) {
        nextDate = nextDate.add(schedule.intervalCount, schedule.intervalUnit);
    }

    return nextDate.format('YYYY-MM-DD');
}

export function getNextRoutineActionDate(
    routine: Routine,
    input: Pick<RoutineActionInput, 'type' | 'scheduledFor' | 'actionAt'>,
    today = dayjs().format('YYYY-MM-DD'),
) {
    const afterResolvedDate = dayjs(input.scheduledFor)
        .add(1, 'day')
        .format('YYYY-MM-DD');
    const notBefore = afterResolvedDate > today ? afterResolvedDate : today;

    let nextDueAt = getNextRoutineDate(
        input.type === 'completed' ? input.actionAt : input.scheduledFor,
        routine,
        routine.startsAt > notBefore ? routine.startsAt : notBefore,
    );

    while (nextDueAt && isRoutineTermResolved(routine, nextDueAt)) {
        nextDueAt = getNextRoutineDate(nextDueAt, routine, nextDueAt);
    }

    return nextDueAt;
}

export function getRoutineMissedTermsCount(routine: Routine, now = dayjs()) {
    if (routine.state !== RoutineState.Active) {
        return 0;
    }

    const today = now.startOf('day');
    let term = dayjs(routine.nextDueAt).startOf('day');
    let count = 0;

    while (term.isBefore(today, 'day')) {
        const date = term.format('YYYY-MM-DD');

        if (!isRoutineTermResolved(routine, date)) {
            count++;
        }

        const nextDate = getNextRoutineDate(date, routine, date);

        if (!nextDate || !dayjs(nextDate).isAfter(term, 'day')) {
            break;
        }

        term = dayjs(nextDate);
    }

    return count;
}

export function getRoutineDelayDays(scheduledFor: string, actionAt: string) {
    return Math.max(0, dayjs(actionAt).diff(dayjs(scheduledFor), 'day'));
}

export function isRoutineActionDateDisabled(date: Dayjs, routine?: Routine) {
    const lastCompletedAt = routine
        ? getLastRoutineCompletion(routine)?.actionAt
        : undefined;

    return (
        date.isAfter(dayjs(), 'day') ||
        Boolean(lastCompletedAt && date.isBefore(dayjs(lastCompletedAt), 'day'))
    );
}

export function validateRoutineAction(
    data: RoutineActionFormData,
    type: RoutineAction,
    routine?: Routine,
): FormDataErrors<RoutineActionFormData> {
    const errors: FormDataErrors<RoutineActionFormData> = {};

    if (
        type === 'completed' &&
        (!data.actionAt ||
            !dayjs(data.actionAt).isValid() ||
            isRoutineActionDateDisabled(dayjs(data.actionAt)))
    ) {
        errors.actionAt =
            'Wybierz prawidłową datę, nie późniejszą niż dzisiaj.';
    } else if (
        type === 'completed' &&
        isRoutineActionDateDisabled(dayjs(data.actionAt), routine)
    ) {
        errors.actionAt =
            'Data wykonania nie może być wcześniejsza niż ostatnie wykonanie rutyny.';
    }

    if (data.notes.length > 2000) {
        errors.notes = 'Notatka może mieć maksymalnie 2000 znaków.';
    }

    return errors;
}

export function getRoutineScheduleLabel(schedule: RoutineSchedule) {
    if (schedule.scheduleType === RoutineScheduleType.Weekdays) {
        return `Co tydzień: ${routineWeekdayOptions
            .filter((option) => schedule.weekdays.includes(option.value))
            .map((option) => option.shortLabel.toLocaleLowerCase('pl'))
            .join(', ')}`;
    }

    const count = schedule.intervalCount;
    const forms = routineIntervalUnitForms[schedule.intervalUnit];

    if (count === 1) {
        return `Co ${forms[0]}`;
    }

    const few =
        count % 10 >= 2 &&
        count % 10 <= 4 &&
        (count % 100 < 12 || count % 100 > 14);

    return `Co ${count} ${forms[few ? 1 : 2]}`;
}

export const formatRoutineDate = (value: string | null | undefined) =>
    value ? dayjs(value).format('DD.MM.YYYY') : 'Jeszcze nie wykonano';

export function getLastRoutineCompletion(routine: Routine) {
    return routine.history
        .filter((entry) => entry.type === 'completed' && !entry.cancelledAt)
        .sort((a, b) => b.actionAt.localeCompare(a.actionAt))[0];
}

export function isRoutineTermResolved(
    routine: Routine | undefined,
    scheduledFor: string,
) {
    return (
        routine?.history.some(
            (entry) =>
                isRoutineTermEntry(entry) &&
                !entry.cancelledAt &&
                entry.scheduledFor === scheduledFor,
        ) ?? false
    );
}

export function canRescheduleRoutineStart(routine: Routine) {
    return !routine.history.some(
        (entry) =>
            isRoutineTermEntry(entry) &&
            !entry.cancelledAt &&
            entry.scheduledFor >= routine.startsAt,
    );
}

export function isRoutineTermEntry(entry: RoutineHistoryEntry) {
    return entry.type === 'completed' || entry.type === 'skipped';
}

export function getRoutineEditedNextDueAt(
    data: RoutineFormData,
    routine?: Routine,
) {
    const lastCompletedAt = routine
        ? getLastRoutineCompletion(routine)?.actionAt
        : data.lastCompletedAt;

    if (
        !data.startsAt ||
        !dayjs(data.startsAt).isValid() ||
        (data.scheduleType === RoutineScheduleType.Weekdays &&
            !data.weekdays.length) ||
        (data.scheduleType === RoutineScheduleType.Interval &&
            (!data.intervalCount ||
                !Number.isSafeInteger(data.intervalCount) ||
                data.intervalCount < 1 ||
                data.intervalCount > 1000))
    ) {
        return data.nextDueAt;
    }

    const schedule = { ...data, intervalCount: data.intervalCount ?? 1 };
    let nextDueAt: string;

    if (lastCompletedAt && dayjs(lastCompletedAt).isValid()) {
        nextDueAt = getNextRoutineDate(
            lastCompletedAt,
            schedule,
            data.startsAt,
        );
    } else {
        nextDueAt =
            routine && data.nextDueAt && data.nextDueAt >= data.startsAt
                ? data.nextDueAt
                : data.startsAt;

        if (data.scheduleType === RoutineScheduleType.Weekdays) {
            nextDueAt = getNextWeekdayDate(nextDueAt, data.weekdays, true);
        }
    }

    while (nextDueAt && isRoutineTermResolved(routine, nextDueAt)) {
        nextDueAt = getNextRoutineDate(nextDueAt, schedule, nextDueAt);
    }

    return nextDueAt || data.nextDueAt;
}

export function updateRoutineSchedule(
    data: RoutineFormData,
    changes: RoutineScheduleChanges,
    routine?: Routine,
): RoutineFormData {
    const nextData = { ...data, ...changes };

    if (
        !routine &&
        nextData.startsAt &&
        dayjs(nextData.startsAt).isValid() &&
        nextData.scheduleType === RoutineScheduleType.Weekdays &&
        nextData.weekdays.length
    ) {
        nextData.startsAt = getNextWeekdayDate(
            nextData.startsAt,
            nextData.weekdays,
            true,
        );
    }

    const hasCompletion =
        (routine && getLastRoutineCompletion(routine)) ||
        nextData.lastCompletedAt;

    if (
        !hasCompletion &&
        ('startsAt' in changes || 'lastCompletedAt' in changes)
    ) {
        nextData.nextDueAt = nextData.startsAt;
    }

    const nextDueAt = getRoutineEditedNextDueAt(nextData, routine);

    return {
        ...nextData,
        nextDueAt,
        startsAt:
            routine && canRescheduleRoutineStart(routine)
                ? nextDueAt && nextDueAt < routine.startsAt
                    ? nextDueAt
                    : routine.startsAt
                : nextData.startsAt,
    };
}

export function validateRoutine(
    data: RoutineFormData,
    households: Household[] = [],
    routine?: Routine,
): FormDataErrors<RoutineFormData> {
    const errors: FormDataErrors<RoutineFormData> = {};

    if (
        data.lastCompletedAt &&
        (!dayjs(data.lastCompletedAt).isValid() ||
            isRoutineActionDateDisabled(dayjs(data.lastCompletedAt)))
    ) {
        errors.lastCompletedAt =
            'Wybierz prawidłową datę, nie późniejszą niż dzisiaj.';
    }

    if (!data.name.trim()) {
        errors.name = 'Podaj nazwę rutyny.';
    } else if (data.name.length > 150) {
        errors.name = 'Nazwa może mieć maksymalnie 150 znaków.';
    }

    if (!households.some((household) => household.id === data.householdId)) {
        errors.householdId = 'Wybierz dom, do którego należy rutyna.';
    }

    if (
        !routineCategoryOptions.some((option) => option.value === data.category)
    ) {
        errors.category = 'Wybierz kategorię.';
    }

    if (
        !routineScheduleTypeOptions.some(
            (option) => option.value === data.scheduleType,
        )
    ) {
        errors.scheduleType = 'Wybierz sposób powtarzania.';
    }

    if (data.scheduleType === RoutineScheduleType.Interval) {
        if (
            !data.intervalCount ||
            !Number.isSafeInteger(data.intervalCount) ||
            data.intervalCount < 1 ||
            data.intervalCount > 1000
        ) {
            errors.intervalCount = 'Podaj liczbę całkowitą od 1 do 1000.';
        }

        if (
            !routineIntervalUnitOptions.some(
                (option) => option.value === data.intervalUnit,
            )
        ) {
            errors.intervalUnit = 'Wybierz jednostkę czasu.';
        }
    } else if (
        data.scheduleType === RoutineScheduleType.Weekdays &&
        (!data.weekdays.length ||
            data.weekdays.some(
                (day) =>
                    !routineWeekdayOptions.some(
                        (option) => option.value === day,
                    ),
            ))
    ) {
        errors.weekdays = 'Wybierz przynajmniej jeden dzień tygodnia.';
    }

    if (!data.startsAt || !dayjs(data.startsAt).isValid()) {
        errors.startsAt = 'Wybierz pierwszy termin wykonania.';
    }

    if (!routine) {
        return errors;
    }

    if (!data.nextDueAt || !dayjs(data.nextDueAt).isValid()) {
        errors.nextDueAt = 'Wybierz termin wykonania.';
    } else if (
        !canRescheduleRoutineStart(routine) &&
        data.nextDueAt < routine.startsAt
    ) {
        errors.nextDueAt =
            'Termin wykonania nie może przypadać przed początkiem harmonogramu.';
    } else if (
        data.scheduleType === RoutineScheduleType.Weekdays &&
        data.weekdays.length &&
        !data.weekdays.some((day) => day === dayjs(data.nextDueAt).day())
    ) {
        errors.nextDueAt = 'Termin musi przypadać w wybrany dzień tygodnia.';
    } else if (isRoutineTermResolved(routine, data.nextDueAt)) {
        errors.nextDueAt =
            'Ten termin ma już wpis w historii. Wybierz inny termin.';
    }

    return errors;
}

export function getRoutineFormInitialValues(
    routine?: Routine,
    households: Household[] = [],
): RoutineFormData {
    return {
        version: routine?.version ?? 1,
        name: routine?.name ?? '',
        householdId:
            routine?.householdId ??
            (households.length === 1 ? households[0].id : 0),
        category: routine?.category ?? RoutineCategory.Other,
        scheduleType: routine?.scheduleType ?? RoutineScheduleType.Interval,
        intervalCount: routine?.intervalCount ?? 2,
        intervalUnit: routine?.intervalUnit ?? RoutineIntervalUnit.Week,
        weekdays: routine?.weekdays ?? [],
        startsAt: routine?.startsAt ?? dayjs().format('YYYY-MM-DD'),
        nextDueAt: routine?.nextDueAt ?? dayjs().format('YYYY-MM-DD'),
        notes: routine?.notes ?? '',
        lastCompletedAt: '',
    };
}

export function toRoutineInput(data: RoutineFormData): RoutineInput {
    return {
        householdId: data.householdId,
        category: data.category,
        startsAt: data.startsAt,
        scheduleType: data.scheduleType,
        intervalUnit: data.intervalUnit,
        name: data.name.trim(),
        notes: data.notes.trim(),
        intervalCount: data.intervalCount ?? 1,
        weekdays:
            data.scheduleType === RoutineScheduleType.Weekdays
                ? routineWeekdayOptions
                      .filter((option) => data.weekdays.includes(option.value))
                      .map((option) => option.value)
                : [],
        nextDueAt:
            data.scheduleType === RoutineScheduleType.Weekdays
                ? getNextWeekdayDate(data.nextDueAt, data.weekdays, true)
                : data.nextDueAt,
    };
}

export function getRoutineCategoryFilters(
    routines: Pick<Routine, 'category'>[],
) {
    return [
        { value: 'all', label: 'Wszystkie', count: routines.length },
        ...routineCategoryOptions.map((option) => ({
            ...option,
            count: routines.filter(
                (routine) => routine.category === option.value,
            ).length,
        })),
    ];
}

export function getRoutineStatistics(
    routines: Pick<Routine, 'state' | 'nextDueAt'>[],
) {
    const today = dayjs().startOf('day');
    const activeRoutines = routines.filter(
        (routine) => routine.state === RoutineState.Active,
    );

    return [
        {
            label: 'Aktywne rutyny',
            value: String(activeRoutines.length),
            icon: '/icons/wrench.svg',
            description: 'Powtarzalne czynności w Twoim domu',
        },
        {
            label: 'Zaległe rutyny',
            value: String(
                activeRoutines.filter(
                    (routine) =>
                        getRoutineStatus(routine, today) ===
                        RoutineStatus.Overdue,
                ).length,
            ),
            icon: '/icons/bolt.svg',
            description: 'Termin wykonania już minął',
        },
        {
            label: 'Nadchodzące terminy',
            value: String(
                activeRoutines.filter((routine) => {
                    const days = dayjs(routine.nextDueAt).diff(today, 'day');

                    return days >= 0 && days <= 7;
                }).length,
            ),
            icon: '/icons/trend-down.svg',
            description: 'Dzisiaj i w ciągu najbliższych 7 dni',
        },
    ];
}
