import type { InertiaFormProps } from '@inertiajs/react';

export type ThingFormData = {
    name: string;
    category: string;
    serialNumber: string;
    room: string;
    placement: string;
    storage: '' | 'standalone' | 'container';
    boxId: string;
    assignBoxLater: boolean;
};

export type ThingFormState = InertiaFormProps<ThingFormData>;
