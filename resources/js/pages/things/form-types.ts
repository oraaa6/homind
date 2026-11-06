import type { InertiaFormProps } from '@inertiajs/react';

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
    kind: 'room' | 'rack' | 'box';
    identifier: string | null;
    parent_name: string | null;
    household_name: string;
};

export type ThingCategoryOption = {
    id: number;
    name: string;
};
