export enum RoutineScheduleType {
    Interval = 'interval',
    Weekdays = 'weekdays',
}

export const routineScheduleTypeOptions = [
    { value: RoutineScheduleType.Interval, label: 'Co określony czas' },
    { value: RoutineScheduleType.Weekdays, label: 'W wybrane dni tygodnia' },
];

export enum RoutineIntervalUnit {
    Day = 'day',
    Week = 'week',
    Month = 'month',
    Year = 'year',
}

export const routineIntervalUnitOptions = [
    { value: RoutineIntervalUnit.Day, label: 'Dni' },
    { value: RoutineIntervalUnit.Week, label: 'Tygodnie' },
    { value: RoutineIntervalUnit.Month, label: 'Miesiące' },
    { value: RoutineIntervalUnit.Year, label: 'Lata' },
];

export const routineIntervalUnitForms: Record<
    RoutineIntervalUnit,
    [string, string, string]
> = {
    day: ['dzień', 'dni', 'dni'],
    week: ['tydzień', 'tygodnie', 'tygodni'],
    month: ['miesiąc', 'miesiące', 'miesięcy'],
    year: ['rok', 'lata', 'lat'],
};

// Values match dayjs().day(); options are displayed from Monday to Sunday.
export const routineWeekdayOptions = [
    { value: 1, label: 'Poniedziałek', shortLabel: 'Pon.' },
    { value: 2, label: 'Wtorek', shortLabel: 'Wt.' },
    { value: 3, label: 'Środa', shortLabel: 'Śr.' },
    { value: 4, label: 'Czwartek', shortLabel: 'Czw.' },
    { value: 5, label: 'Piątek', shortLabel: 'Pt.' },
    { value: 6, label: 'Sobota', shortLabel: 'Sob.' },
    { value: 0, label: 'Niedziela', shortLabel: 'Niedz.' },
] as const;

export type RoutineWeekday = (typeof routineWeekdayOptions)[number]['value'];
