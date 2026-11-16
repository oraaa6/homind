export type ActivityType =
    'added' | 'moved' | 'created' | 'updated' | 'deleted' | 'completed';

export type ActivityEntry = {
    id: string;
    title: string;
    description: string | null;
    date: string;
    author?: string | null;
    type: ActivityType;
};
