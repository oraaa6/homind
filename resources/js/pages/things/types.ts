import type { InertiaFormProps } from '@inertiajs/react';
import type { PlaceType } from '@/types/place';

export type Thing = {
    id: string;
    slug: string;
    name: string;
    location: string;
    placeId: number;
    placeKind: PlaceType;
    storagePlaceName?: string | null;
    category: string;
    placement: string | null;
    quantity: number;
    unit: string;
    unitShort: string;
    needsPacking: boolean;
    createdAt: string;
};

export type ThingDetails = {
    thingId: string;
    room: string;
    place: string;
    placementNote: string | null;
    locationCode: string;
    locationUrl: string;
    locationHasQr: boolean;
};

export type ThingFormData = {
    name: string;
    category_id: number | null;
    quantity: number;
    unit: string;
    placement: string;
    place_id: number | null;
    needs_packing: boolean;
};

export type ThingFormState = InertiaFormProps<ThingFormData>;

export type ThingPlaceOption = {
    id: number;
    name: string;
    kind: PlaceType;
    identifier: string | null;
    parent_name: string | null;
    household_name: string;
};

export type ThingCategoryOption = {
    id: number;
    name: string;
};

export type ThingUnitOption = {
    value: string;
    label: string;
};
