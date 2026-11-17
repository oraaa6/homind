import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import type {
    MaintenanceFormValues,
    MaintenanceRequestData,
    MaintenanceService,
} from './types';

export enum MaintenanceStatus {
    NoDate = 'Brak terminu',
    Normal = 'W normie',
    NeedsScheduling = 'Do umówienia',
    Urgent = 'Pilne',
    Scheduled = 'Umówione',
    InProgress = 'W trakcie',
    AwaitingConfirmation = 'Do potwierdzenia',
    Completed = 'Wykonany',
}

export const maintenanceStatusColors: Record<MaintenanceStatus, string> = {
    [MaintenanceStatus.NoDate]: 'default',
    [MaintenanceStatus.Normal]: 'green',
    [MaintenanceStatus.NeedsScheduling]: 'gold',
    [MaintenanceStatus.Urgent]: 'red',
    [MaintenanceStatus.Scheduled]: 'green',
    [MaintenanceStatus.InProgress]: 'processing',
    [MaintenanceStatus.AwaitingConfirmation]: 'orange',
    [MaintenanceStatus.Completed]: 'green',
};

const dateAtMidnight = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

export function getDaysUntilMaintenanceDate(
    value: string,
    now = new Date(),
): number {
    return Math.ceil(
        (dateAtMidnight(new Date(value)).getTime() -
            dateAtMidnight(now).getTime()) /
            86_400_000,
    );
}

export function getMaintenanceStatus(
    service: MaintenanceService | null,
    now = new Date(),
): MaintenanceStatus {
    if (!service) {
        return MaintenanceStatus.NoDate;
    }

    if (service.isCompleted) {
        return MaintenanceStatus.Completed;
    }

    if (service.isScheduled && service.appointmentAt) {
        const daysUntilAppointment = getDaysUntilMaintenanceDate(
            service.appointmentAt,
            now,
        );

        if (daysUntilAppointment < 0) {
            return MaintenanceStatus.AwaitingConfirmation;
        }

        if (daysUntilAppointment === 0) {
            return MaintenanceStatus.InProgress;
        }

        return MaintenanceStatus.Scheduled;
    }

    if (!service.dueAt) {
        return MaintenanceStatus.NoDate;
    }

    const daysUntilDeadline = getDaysUntilMaintenanceDate(service.dueAt, now);

    if (daysUntilDeadline <= 7) {
        return MaintenanceStatus.Urgent;
    }

    if (daysUntilDeadline <= 90) {
        return MaintenanceStatus.NeedsScheduling;
    }

    return MaintenanceStatus.Normal;
}

export function getMaintenanceStatistics(
    services: MaintenanceService[],
    now = new Date(),
) {
    const year = now.getFullYear();

    return services.reduce(
        (counts, service) => {
            if (
                service.isScheduled &&
                service.appointmentAt &&
                new Date(service.appointmentAt).getFullYear() === year &&
                getDaysUntilMaintenanceDate(service.appointmentAt, now) >= 0
            ) {
                counts.plannedThisYear += 1;
            }

            if (getMaintenanceStatus(service, now) === MaintenanceStatus.Urgent) {
                counts.urgent += 1;
            }

            if (!service.isScheduled && service.dueAt) {
                const daysUntilDue = getDaysUntilMaintenanceDate(
                    service.dueAt,
                    now,
                );

                if (daysUntilDue > 7 && daysUntilDue < 30) {
                    counts.upcoming += 1;
                }
            }

            return counts;
        },
        { plannedThisYear: 0, urgent: 0, upcoming: 0 },
    );
}

export const maintenanceRecurrenceLabels: Record<string, string> = {
    none: 'Jednorazowo',
    '3-months': 'Co 3 miesiące',
    '6-months': 'Co pół roku',
    yearly: 'Co rok',
    '2-years': 'Co 2 lata',
    '3-years': 'Co 3 lata',
};

export const maintenanceRecurrenceOptions = Object.entries(
    maintenanceRecurrenceLabels,
).map(([value, label]) => ({ value, label }));

export const isMaintenanceDateBeforeToday = (date: Dayjs) =>
    date.isBefore(dayjs().startOf('day'), 'day');

export function getMaintenanceFormInitialValues(
    service: MaintenanceService | null,
    selectedThingId: number | null,
): MaintenanceFormValues {
    return {
        name: service?.name ?? '',
        thing_id: selectedThingId ?? undefined,
        is_scheduled: service?.isScheduled ?? false,
        appointment_at: service?.appointmentAt
            ? dayjs(service.appointmentAt)
            : undefined,
        due_at: service?.dueAt ? dayjs(service.dueAt) : undefined,
        recurrence: service?.recurrence ?? 'yearly',
        provider: service?.provider ?? '',
        phone: service?.phone ?? '',
        estimated_cost: service?.estimatedCost ?? undefined,
        notes: service?.notes ?? '',
    };
}

export function toMaintenanceRequestData(
    values: MaintenanceFormValues,
    isScheduled = values.is_scheduled,
): MaintenanceRequestData {
    return {
        ...values,
        is_scheduled: isScheduled,
        appointment_at: isScheduled
            ? (values.appointment_at?.toISOString() ?? null)
            : null,
        due_at: isScheduled
            ? null
            : (values.due_at?.format('YYYY-MM-DD') ?? null),
    };
}

export const formatMaintenanceDate = (
    value: string | null,
    includeTime = false,
    dateStyle: Intl.DateTimeFormatOptions['dateStyle'] = 'long',
) => {
    if (!value) {
        return 'Nie podano';
    }

    return new Intl.DateTimeFormat('pl-PL', {
        dateStyle,
        ...(includeTime ? { timeStyle: 'short' as const } : {}),
    }).format(new Date(value));
};

export const formatMaintenanceCost = (value: number) =>
    new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: 'PLN',
        maximumFractionDigits: 2,
    }).format(value);

export function getMaintenanceServiceDetails(
    service: MaintenanceService,
): { label: string; value: string }[] {
    return [
        {
            label: service.isScheduled
                ? 'Termin wizyty'
                : 'Termin do umówienia',
            value: service.isScheduled
                ? formatMaintenanceDate(service.appointmentAt, true)
                : formatMaintenanceDate(service.dueAt),
        },
        {
            label: 'Cykliczność',
            value:
                maintenanceRecurrenceLabels[service.recurrence] ??
                service.recurrence,
        },
        ...(service.provider
            ? [{ label: 'Wykonawca', value: service.provider }]
            : []),
        ...(service.phone
            ? [{ label: 'Telefon kontaktowy', value: service.phone }]
            : []),
        ...(service.estimatedCost !== null
            ? [
                  {
                      label: 'Szacowany koszt',
                      value: formatMaintenanceCost(service.estimatedCost),
                  },
              ]
            : []),
        ...(service.notes
            ? [{ label: 'Notatki i zalecenia', value: service.notes }]
            : []),
    ];
}
