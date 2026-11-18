import type { RoutineCategory } from '@/constants/routine-categories';
import type {
    RoutineIntervalUnit,
    RoutineScheduleType,
    RoutineWeekday,
} from '@/constants/routine-schedule';

export type RoutineSchedule = {
    scheduleType: RoutineScheduleType;
    intervalCount: number;
    intervalUnit: RoutineIntervalUnit;
    weekdays: RoutineWeekday[];
};

export enum RoutineStatus {
    Overdue = 'Zaległa',
    Today = 'Na dziś',
    Scheduled = 'Zaplanowana',
    Paused = 'Wstrzymana',
    Archived = 'Zarchiwizowana',
}

export enum RoutineState {
    Active = 'active',
    Paused = 'paused',
    Archived = 'archived',
}

export type RoutineAction = 'completed' | 'skipped';

export type RoutineActor = { id: number; name: string };

export type RoutineHistoryEntry = {
    id: string;
    type: RoutineAction | 'paused' | 'resumed' | 'archived' | 'restored';
    scheduledFor: string;
    actionAt: string;
    recordedAt: string;
    author: RoutineActor;
    notes: string;
    previousNextDueAt?: string;
    cancelledAt?: string | null;
    cancelledBy?: RoutineActor | null;
};

export type RoutineActionInput = Pick<
    RoutineHistoryEntry,
    'scheduledFor' | 'actionAt' | 'notes'
> & { type: RoutineAction };

export type RoutineActionFormData = Pick<
    RoutineActionInput,
    'scheduledFor' | 'actionAt' | 'notes'
>;

export type Routine = RoutineSchedule & {
    id: number;
    version: number;
    state: RoutineState;
    householdId: number;
    name: string;
    category: RoutineCategory;
    startsAt: string;
    nextDueAt: string;
    notes: string;
    createdAt: string;
    history: RoutineHistoryEntry[];
};

export type RoutineListItem = Pick<
    Routine,
    | 'id'
    | 'householdId'
    | 'name'
    | 'category'
    | 'state'
    | 'nextDueAt'
    | 'createdAt'
    | keyof RoutineSchedule
> & {
    lastCompletedAt: string | null;
    missedTermsCount: number;
};

export type RoutineInput = Pick<
    Routine,
    'name' | 'householdId' | 'category' | 'startsAt' | 'nextDueAt' | 'notes'
> &
    RoutineSchedule;

export type RoutineFormData = Omit<RoutineInput, 'intervalCount'> & {
    version: number;
    intervalCount: number | null;
    lastCompletedAt: string;
};

export type RoutineScheduleChanges = Partial<
    Pick<
        RoutineFormData,
        keyof RoutineSchedule | 'startsAt' | 'lastCompletedAt'
    >
>;

export const routineStatusColors = {
    [RoutineStatus.Overdue]: 'red',
    [RoutineStatus.Today]: 'gold',
    [RoutineStatus.Scheduled]: 'green',
    [RoutineStatus.Paused]: 'blue',
    [RoutineStatus.Archived]: 'default',
};
