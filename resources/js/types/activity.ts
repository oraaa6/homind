export type ActivityType =
    | 'added'
    | 'moved'
    | 'created'
    | 'updated'
    | 'deleted'
    | 'completed'
    | 'skipped'
    | 'paused'
    | 'resumed'
    | 'archived'
    | 'restored';

export type ActivityEntry = {
    id: string;
    title: string;
    description: string | null;
    date: string;
    dateLabel?: string;
    author?: string | null;
    type: ActivityType;
};
