import { CheckOutlined } from '@ant-design/icons';
import type { FormDataErrors } from '@inertiajs/core';
import { Head, useForm } from '@inertiajs/react';
import { Form, message } from 'antd';
import Button from '@/components/Button';
import Heading from '@/components/heading';
import SectionCard from '@/components/section-card';
import BasicInformationStep from '@/components/things-steps/basic-information';
import LocationStep from '@/components/things-steps/location';
import { useFormValidation } from '@/hooks/use-form-validation';
import { things } from '@/routes';
import {
    add as addThing,
    store as storeThing,
} from '@/routes/things';
import type {
    ThingCategoryOption,
    ThingFormData,
    ThingPlaceOption,
} from './form-types';

function validateThing(data: ThingFormData): FormDataErrors<ThingFormData> {
    const errors: FormDataErrors<ThingFormData> = {};

    if (!data.name.trim()) {
        errors.name = 'Podaj nazwę przedmiotu.';
    }

    if (!data.category_id) {
        errors.category_id = 'Wybierz kategorię.';
    }

    if (data.quantity < 0) {
        errors.quantity = 'Ilość nie może być ujemna.';
    }

    if (!data.unit.trim()) {
        errors.unit = 'Wybierz jednostkę.';
    }

    if (!data.place_id) {
        errors.place_id = 'Wybierz lokalizację.';
    }

    return errors;
}

export default function AddThing({
    categories,
    places,
}: {
    categories: ThingCategoryOption[];
    places: ThingPlaceOption[];
}) {
    const form = useForm<ThingFormData>({
        name: '',
        category_id: null,
        quantity: 1,
        unit: 'sztuka',
        placement: '',
        place_id: null,
        needs_packing: false,
    });
    const validate = useFormValidation(form, validateThing);

    return (
        <>
            <Head title="Dodaj nowy przedmiot" />
            <Heading
                title="Dodaj nowy przedmiot"
                description="Zarejestruj fizyczny przedmiot w ewidencji domowej i przypisz jego stałe miejsce w przestrzeni."
                backLink={{
                    href: things().url,
                    label: 'Wróć do listy przedmiotów',
                }}
                className="mb-8! sm:mb-10!"
            />

            <Form
                layout="vertical"
                noValidate
                onFinish={() => {
                    if (!validate()) {
                        return;
                    }

                    form.post(storeThing().url, {
                        onSuccess: () =>
                            message.success('Przedmiot został dodany.'),
                    });
                }}
                className="space-y-5 sm:space-y-7"
            >
                <BasicInformationStep form={form} categories={categories} />

                <LocationStep form={form} places={places} />

                <SectionCard
                    as="div"
                    className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between xl:p-9"
                >
                    <Button
                        href={things().url}
                        type="text"
                        size="small"
                        className="px-2! py-2!"
                    >
                        Anuluj
                    </Button>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Button
                            type="primary"
                            size="small"
                            loading={form.processing}
                            htmlType="submit"
                            icon={<CheckOutlined />}
                        >
                            Zapisz i dodaj przedmiot
                        </Button>
                    </div>
                </SectionCard>
            </Form>
        </>
    );
}

AddThing.layout = {
    breadcrumbs: [
        { title: 'Przedmioty', href: things() },
        { title: 'Dodaj przedmiot', href: addThing() },
    ],
};
