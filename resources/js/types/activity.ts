export type ActivityType = 'added' | 'moved' | 'created' | 'updated' | 'deleted';

export type ActivityEntry = {
    id: string;
    title: string;
    description: string | null;
    date: string;
    author: string;
    type: ActivityType;
};
