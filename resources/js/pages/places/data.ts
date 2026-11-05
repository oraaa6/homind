export type Place = {
    id: string;
    slug: string;
    name: string;
    kind: 'room' | 'box' | 'rack';
    parentId: string | null;
    parentName?: string | null;
    qrCode: string | null;
    level: string;
    levelLabel: string;
    description: string;
    createdAt: string;
};

export type PlaceActivity = {
    title: string;
    date: string;
    author: string;
    type: 'added' | 'moved' | 'created';
};
