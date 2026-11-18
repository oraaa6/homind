import type { InertiaFormProps } from '@inertiajs/react';
import { DatePicker, Form, InputNumber, Select } from 'antd';
import dayjs from 'dayjs';
import Button from '@/components/Button';
import SectionCard from '@/components/section-card';
import {
    RoutineScheduleType,
    routineIntervalUnitOptions,
    routineScheduleTypeOptions,
    routineWeekdayOptions,
} from '@/constants/routine-schedule';
import type {
    Routine,
    RoutineFormData,
    RoutineScheduleChanges,
} from '@/pages/routines/types';
import {
    formatRoutineDate,
    canRescheduleRoutineStart,
    getLastRoutineCompletion,
    isRoutineActionDateDisabled,
    isRoutineTermResolved,
    updateRoutineSchedule,
} from '@/pages/routines/utils';

export default function RoutineSchedule({
    form,
    routine,
}: {
    form: InertiaFormProps<RoutineFormData>;
    routine?: Routine;
}) {
    const isWeekdays = form.data.scheduleType === RoutineScheduleType.Weekdays;
    const canMoveStart = routine ? canRescheduleRoutineStart(routine) : false;
    const lastCompletion = routine
        ? getLastRoutineCompletion(routine)
        : undefined;
    const updateSchedule = (changes: RoutineScheduleChanges) => {
        form.setData((data) => updateRoutineSchedule(data, changes, routine));
        form.clearErrors('nextDueAt', 'startsAt', 'lastCompletedAt');
    };
    const nextDueAt =
        form.data.startsAt &&
        form.data.nextDueAt &&
        (!isWeekdays || form.data.weekdays.length)
            ? form.data.nextDueAt
            : null;

    return (
        <SectionCard
            number="02"
            title="Termin i częstotliwość"
            className="xl:p-9"
        >
            <Form.Item
                label="Sposób powtarzania"
                required
                validateStatus={form.errors.scheduleType ? 'error' : undefined}
                help={form.errors.scheduleType}
            >
                <div
                    role="group"
                    aria-label="Sposób powtarzania"
                    className="flex flex-wrap gap-2"
                >
                    {routineScheduleTypeOptions.map((option) => (
                        <Button
                            key={option.value}
                            type={
                                form.data.scheduleType === option.value
                                    ? 'primary'
                                    : 'secondary'
                            }
                            size="small"
                            aria-pressed={
                                form.data.scheduleType === option.value
                            }
                            onClick={() => {
                                if (form.data.scheduleType === option.value) {
                                    return;
                                }

                                updateSchedule({ scheduleType: option.value });
                                form.clearErrors(
                                    'scheduleType',
                                    'intervalCount',
                                    'intervalUnit',
                                    'weekdays',
                                );
                            }}
                        >
                            {option.label}
                        </Button>
                    ))}
                </div>
            </Form.Item>

            {isWeekdays ? (
                <Form.Item
                    label="Dni tygodnia"
                    required
                    validateStatus={form.errors.weekdays ? 'error' : undefined}
                    help={form.errors.weekdays}
                    extra="Wybierz przynajmniej jeden dzień. Spóźnione wykonanie nie przesuwa wybranych dni tygodnia."
                >
                    <div
                        role="group"
                        aria-label="Dni wykonywania rutyny"
                        className="flex flex-wrap gap-2"
                    >
                        {routineWeekdayOptions.map((option) => {
                            const selected = form.data.weekdays.includes(
                                option.value,
                            );

                            return (
                                <Button
                                    key={option.value}
                                    type={selected ? 'primary' : 'secondary'}
                                    size="small"
                                    aria-label={option.label}
                                    aria-pressed={selected}
                                    onClick={() => {
                                        updateSchedule({
                                            weekdays: selected
                                                ? form.data.weekdays.filter(
                                                      (day) =>
                                                          day !== option.value,
                                                  )
                                                : [
                                                      ...form.data.weekdays,
                                                      option.value,
                                                  ],
                                        });
                                        form.clearErrors('weekdays');
                                    }}
                                >
                                    {option.shortLabel}
                                </Button>
                            );
                        })}
                    </div>
                </Form.Item>
            ) : (
                <div className="grid gap-x-5 md:grid-cols-2">
                    <Form.Item
                        label="Powtarzaj co"
                        required
                        validateStatus={
                            form.errors.intervalCount ? 'error' : undefined
                        }
                        help={form.errors.intervalCount}
                    >
                        <InputNumber
                            size="large"
                            min={1}
                            max={1000}
                            precision={0}
                            step={1}
                            value={form.data.intervalCount}
                            onChange={(value) => {
                                updateSchedule({ intervalCount: value });
                                form.clearErrors('intervalCount');
                            }}
                            className="w-full! bg-tertiary!"
                        />
                    </Form.Item>
                    <Form.Item
                        label="Jednostka czasu"
                        required
                        validateStatus={
                            form.errors.intervalUnit ? 'error' : undefined
                        }
                        help={form.errors.intervalUnit}
                    >
                        <Select
                            size="large"
                            value={form.data.intervalUnit}
                            options={routineIntervalUnitOptions}
                            onChange={(value) => {
                                updateSchedule({ intervalUnit: value });
                                form.clearErrors('intervalUnit');
                            }}
                        />
                    </Form.Item>
                </div>
            )}

            <Form.Item
                label={
                    routine
                        ? 'Kolejny termin wykonania'
                        : 'Pierwszy termin wykonania'
                }
                required
                validateStatus={
                    (routine ? form.errors.nextDueAt : form.errors.startsAt)
                        ? 'error'
                        : undefined
                }
                help={routine ? form.errors.nextDueAt : form.errors.startsAt}
                extra={
                    routine
                        ? isWeekdays
                            ? 'Termin przypada w jeden z wybranych dni tygodnia.'
                            : 'Po wykonaniu rutyny kolejny termin liczymy od daty jej wykonania.'
                        : 'To dzień pierwszego planowanego wykonania. Samo dodanie rutyny nie oznacza jej wykonania.'
                }
            >
                <DatePicker
                    size="large"
                    format="DD.MM.YYYY"
                    value={
                        (routine ? form.data.nextDueAt : form.data.startsAt)
                            ? dayjs(
                                  routine
                                      ? form.data.nextDueAt
                                      : form.data.startsAt,
                              )
                            : null
                    }
                    disabled={isWeekdays && !form.data.weekdays.length}
                    disabledDate={(date) =>
                        (isWeekdays &&
                            !form.data.weekdays.some(
                                (day) => day === date.day(),
                            )) ||
                        Boolean(
                            routine &&
                            ((!canMoveStart &&
                                date.isBefore(
                                    dayjs(routine.startsAt),
                                    'day',
                                )) ||
                                isRoutineTermResolved(
                                    routine,
                                    date.format('YYYY-MM-DD'),
                                )),
                        )
                    }
                    onChange={(value) => {
                        const date = value?.format('YYYY-MM-DD') ?? '';

                        if (routine) {
                            form.setData((data) => ({
                                ...data,
                                nextDueAt: date,
                                startsAt:
                                    canMoveStart &&
                                    date &&
                                    date < routine.startsAt
                                        ? date
                                        : routine.startsAt,
                            }));
                            form.clearErrors('nextDueAt', 'startsAt');
                        } else {
                            updateSchedule({ startsAt: date });
                        }
                    }}
                    placeholder={
                        routine
                            ? 'Wybierz kolejny termin'
                            : 'Wybierz pierwszy termin'
                    }
                    className="w-full! bg-tertiary!"
                />
            </Form.Item>
            {!routine && (
                <Form.Item
                    label="Ostatnio wykonano (opcjonalnie)"
                    validateStatus={
                        form.errors.lastCompletedAt ? 'error' : undefined
                    }
                    help={form.errors.lastCompletedAt}
                    extra="Jeśli rutyna była już wykonywana, podaj datę. Na jej podstawie wyliczymy kolejny termin."
                >
                    <DatePicker
                        size="large"
                        format="DD.MM.YYYY"
                        value={
                            form.data.lastCompletedAt
                                ? dayjs(form.data.lastCompletedAt)
                                : null
                        }
                        disabledDate={(date) =>
                            isRoutineActionDateDisabled(date)
                        }
                        onChange={(value) =>
                            updateSchedule({
                                lastCompletedAt:
                                    value?.format('YYYY-MM-DD') ?? '',
                            })
                        }
                        placeholder="Wybierz datę ostatniego wykonania"
                        className="w-full! bg-tertiary!"
                    />
                </Form.Item>
            )}
            {!routine && form.errors.nextDueAt && (
                <p className="mb-3 text-sm text-red-500">
                    {form.errors.nextDueAt}
                </p>
            )}
            {nextDueAt && (
                <p className="text-sm font-medium text-foreground">
                    Kolejny termin: {formatRoutineDate(nextDueAt)}
                </p>
            )}
            {lastCompletion && (
                <p className="mt-2 text-xs text-(--button-text) sm:text-sm">
                    Zmiana częstotliwości przelicza termin od ostatniego
                    wykonania: {formatRoutineDate(lastCompletion.actionAt)}.
                    Datę możesz też zmienić ręcznie.
                </p>
            )}
        </SectionCard>
    );
}
