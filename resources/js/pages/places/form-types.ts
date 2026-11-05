import type { InertiaFormProps } from '@inertiajs/react';
import type { Place } from './data';

export type PlaceFormData = {
    household_id: number;
    kind: Place['kind'];
    name: string;
    parent_id: number | null;
    placement: string;
};

export type PlaceFormState = InertiaFormProps<PlaceFormData>;
