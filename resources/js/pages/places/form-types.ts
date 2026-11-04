import type { InertiaFormProps } from '@inertiajs/react';
import type { Place } from './data';

export type PlaceFormData = {
    kind: Place['kind'];
    name: string;
    parentId: string;
    placement: string;
    identifier: string;
};

export type PlaceFormState = InertiaFormProps<PlaceFormData>;
