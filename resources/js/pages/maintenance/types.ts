import type { Dayjs } from 'dayjs';

export type MaintenanceService = {
    id: string;
    name: string;
    isScheduled: boolean;
    appointmentAt: string | null;
    dueAt: string | null;
    recurrence: string;
    provider: string;
    phone: string;
    estimatedCost: number | null;
    notes: string;
    isCompleted?: boolean;
    history: MaintenanceVisit[];
};

export type MaintenanceDevice = {
    id: number;
    name: string;
    category: string;
};

export type MaintenanceIndexDevice = MaintenanceDevice & {
    createdAt: string;
    service: MaintenanceService | null;
    services: MaintenanceService[];
};

export type MaintenanceVisit = {
    id: string;
    completedAt: string;
    actualCost: number | null;
    notes: string | null;
    performedBy?: string | null;
    provider?: string | null;
    phone?: string | null;
};

export type MaintenanceThingOption = { value: number; label: string };

export type MaintenanceFormValues = {
    name: string;
    thing_id: number | undefined;
    is_scheduled: boolean;
    appointment_at?: Dayjs;
    due_at?: Dayjs;
    recurrence: string;
    provider?: string;
    phone?: string;
    estimated_cost?: number;
    notes?: string;
};

export type MaintenanceRequestData = Omit<
    MaintenanceFormValues,
    'appointment_at' | 'due_at'
> & {
    appointment_at: string | null;
    due_at: string | null;
};
