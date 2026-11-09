import type { InertiaFormProps } from '@inertiajs/react';
import type { ActivityEntry } from '@/types/activity';
import type { PlaceType } from '@/types/place';

export type Place = {
    id: string;
    slug: string;
    name: string;
    kind: PlaceType;
    parentId: number | null;
    parentName?: string | null;
    qrCode: string | null;
    level: string;
    levelLabel: string;
    description: string;
    createdAt: string;
    thingCount: number;
};

export type PlaceActivity = ActivityEntry;

export type PlaceFormData = {
    household_id: number;
    kind: Place['kind'];
    name: string;
    parent_id: number | null;
    placement: string;
};

export type PlaceFormState = InertiaFormProps<PlaceFormData>;
