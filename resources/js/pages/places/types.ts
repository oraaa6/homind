import type { InertiaFormProps } from '@inertiajs/react';

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
    id: string;
    title: string;
    description: string | null;
    date: string;
    author: string;
    type: 'added' | 'moved' | 'created' | 'updated' | 'deleted';
};

export type PlaceFormData = {
    household_id: number;
    kind: Place['kind'];
    name: string;
    parent_id: number | null;
    placement: string;
};

export type PlaceFormState = InertiaFormProps<PlaceFormData>;
