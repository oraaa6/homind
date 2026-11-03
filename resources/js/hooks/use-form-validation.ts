import type { FormDataErrors } from '@inertiajs/core';
import type { InertiaFormProps } from '@inertiajs/react';
import { useCallback } from 'react';

export function useFormValidation<TForm extends Record<string, unknown>>(
    form: InertiaFormProps<TForm>,
    getErrors: (data: TForm) => FormDataErrors<TForm>,
) {
    const { data, clearErrors, setError } = form;

    return useCallback(() => {
        const errors = getErrors(data);

        clearErrors();

        if (Object.keys(errors).length > 0) {
            setError(errors);

            return false;
        }

        return true;
    }, [data, clearErrors, setError, getErrors]);
}
