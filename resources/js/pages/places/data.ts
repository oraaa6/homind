export type Place = {
    id: string;
    slug: string;
    name: string;
    kind: 'room' | 'box' | 'rack';
    parentId: number | null;
    parentName?: string | null;
    qrCode: string | null;
    level: string;
    levelLabel: string;
    description: string;
    createdAt: string;
    thingCount: number;
};

export type PlaceActivity = {
    title: string;
    date: string;
    author: string;
    type: 'added' | 'moved' | 'created';
};
