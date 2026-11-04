import { CheckOutlined, PrinterOutlined } from '@ant-design/icons';
import type { FormDataErrors } from '@inertiajs/core';
import { Head, Link, useForm } from '@inertiajs/react';
import { Form, message } from 'antd';
import Button from '@/components/Button';
import Heading from '@/components/heading';
import { placeKinds } from '@/components/places/place-kinds';
import BasicInformationStep from '@/components/places-steps/basic-information';
import IdentifierStep from '@/components/places-steps/identifier';
import TypeStep from '@/components/places-steps/type';
import SectionCard from '@/components/section-card';
import { useFormValidation } from '@/hooks/use-form-validation';
import { places } from '@/routes';
import { add as addPlace } from '@/routes/places';
import type { Place } from './data';
import { mockPlaces } from './data';
import type { PlaceFormData } from './form-types';

function nextIdentifier(kind: Place['kind'], current = '') {
    const prefix = placeKinds[kind].prefix;
    const indices = mockPlaces
        .filter((place) => place.kind === kind)
        .map((place) => Number(place.id.split('-')[1]));
    const currentIndex = current.startsWith(`${prefix}-`)
        ? Number(current.split('-')[1])
        : 0;
    const nextIndex = Math.max(0, currentIndex, ...indices) + 1;

    return `${prefix}-${String(nextIndex).padStart(3, '0')}`;
}

function validatePlace(data: PlaceFormData): FormDataErrors<PlaceFormData> {
    const errors: FormDataErrors<PlaceFormData> = {};

    if (!data.name.trim()) {
        errors.name = 'Podaj nazwę lokalizacji lub pojemnika.';
    }

    if (data.kind !== 'room' && !data.parentId) {
        errors.parentId = 'Wybierz strefę nadrzędną lub pomieszczenie.';
    }

    return errors;
}

export default function AddPlace() {
    const form = useForm<PlaceFormData>({
        kind: 'box',
        name: '',
        parentId: '',
        placement: '',
        identifier: nextIdentifier('box'),
    });
    const validate = useFormValidation(form, validatePlace);

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
                onFinish={() => {
                    if (!validate()) {
                        return;
                    }

                    message.info(
                        'Zapis lokalizacji będzie dostępny po podłączeniu backendu.',
                    );
                }}
                className="space-y-5 sm:space-y-7"
            >
                <TypeStep
                    form={form}
                    onKindChange={(kind) => {
                        form.setData({
                            ...form.data,
                            kind,
                            parentId: kind === 'room' ? '' : form.data.parentId,
                            identifier: nextIdentifier(kind),
                        });
                        form.clearErrors('parentId');
                    }}
                />

                <BasicInformationStep form={form} />

                <IdentifierStep
                    form={form}
                    onRegenerate={() =>
                        form.setData(
                            'identifier',
                            nextIdentifier(
                                form.data.kind,
                                form.data.identifier,
                            ),
                        )
                    }
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
                            type="ghost"
                            size="small"
                            onClick={() =>
                                message.info(
                                    'Zapisywanie wersji roboczej będzie dostępne po podłączeniu backendu.',
                                )
                            }
                        >
                            Zapisz jako wersję roboczą
                        </Button>
                        <Button
                            type="secondary"
                            size="small"
                            icon={<PrinterOutlined />}
                            onClick={() => {
                                if (!validate()) {
                                    return;
                                }

                                message.info(
                                    'Zapis lokalizacji i pobieranie etykiety PDF będą dostępne po podłączeniu backendu.',
                                );
                            }}
                        >
                            Zapisz i pobierz etykietę PDF
                        </Button>
                        <Button
                            type="primary"
                            size="small"
                            htmlType="submit"
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
