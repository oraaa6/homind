import { CheckOutlined, QrcodeOutlined } from '@ant-design/icons';
import type { FormDataErrors } from '@inertiajs/core';
import { Head, Link, useForm } from '@inertiajs/react';
import { Form, message } from 'antd';
import Button from '@/components/Button';
import Heading from '@/components/heading';
import type { RoomOption } from '@/components/places-steps/basic-information';
import BasicInformationStep from '@/components/places-steps/basic-information';
import TypeStep from '@/components/places-steps/type';
import SectionCard from '@/components/section-card';
import { useFormValidation } from '@/hooks/use-form-validation';
import { places } from '@/routes';
import { add as addPlace, store as storePlace } from '@/routes/places';
import type { PlaceFormData } from './form-types';

function validatePlace(data: PlaceFormData): FormDataErrors<PlaceFormData> {
    const errors: FormDataErrors<PlaceFormData> = {};

    if (!data.name.trim()) {
        errors.name = 'Podaj nazwę lokalizacji lub pojemnika.';
    }

    if (!data.household_id) {
        errors.household_id = 'Wybierz dom.';
    }

    if (data.kind !== 'room' && !data.parent_id) {
        errors.parent_id = 'Wybierz strefę nadrzędną lub pomieszczenie.';
    }

    return errors;
}

type HouseholdOption = { id: number; name: string };
export default function AddPlace({
    households,
    rooms,
}: {
    households: HouseholdOption[];
    rooms: RoomOption[];
}) {
    const form = useForm<PlaceFormData>({
        household_id: households[0]?.id ?? 0,
        kind: 'room',
        name: '',
        parent_id: null,
        placement: '',
    });
    const validate = useFormValidation(form, validatePlace);
    const submit = () => {
        if (!form.processing && validate()) {
            form.post(storePlace().url);
        }
    };

    return (
        <>
            <Head title="Dodaj nową lokalizację lub pojemnik" />
            <Heading
                title="Dodaj nową lokalizację lub pojemnik"
                description="Zdefiniuj stałe miejsce składowania (strefa, regał, szafa) lub ruchomy pojemnik. Każdy obiekt może posiadać unikalny kod QR ułatwiający natychmiastowe odnajdywanie rzeczy skanerem."
                backLink={{
                    href: places().url,
                    label: 'Wróć do listy lokalizacji',
                }}
                className="mb-8 sm:mb-10"
            />
            <Form
                layout="vertical"
                noValidate
                onFinish={submit}
                className="space-y-5 sm:space-y-7"
            >
                <TypeStep
                    form={form}
                    onKindChange={(kind) => {
                        form.setData({
                            ...form.data,
                            kind,
                            parent_id:
                                kind === 'room' ? null : form.data.parent_id,
                        });
                        form.clearErrors('parent_id');
                    }}
                />

                <BasicInformationStep
                    form={form}
                    households={households}
                    rooms={rooms}
                />

                <SectionCard
                    as="div"
                    className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between xl:p-9"
                >
                    <Link
                        href={places().url}
                        className="px-2 py-2 text-sm font-medium text-(--button-text) hover:text-primary sm:text-base"
                    >
                        Anuluj
                    </Link>
                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                        <Button
                            type="primary"
                            size="small"
                            htmlType="submit"
                            loading={form.processing}
                            icon={<CheckOutlined />}
                        >
                            Zapisz lokalizację
                        </Button>
                    </div>
                </SectionCard>
            </Form>
        </>
    );
}

AddPlace.layout = {
    breadcrumbs: [
        { title: 'Lokalizacje', href: places() },
        { title: 'Dodaj lokalizację', href: addPlace() },
    ],
};
