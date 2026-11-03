import { CheckOutlined } from '@ant-design/icons';
import type { FormDataErrors } from '@inertiajs/core';
import { Head, Link, useForm } from '@inertiajs/react';
import { Form, message } from 'antd';
import Button from '@/components/Button';
import Heading from '@/components/heading';
import SectionCard from '@/components/section-card';
import BasicInformationStep from '@/components/things-steps/basic-information';
import LocationStep from '@/components/things-steps/location';
import StorageStep from '@/components/things-steps/storage';
import { useFormValidation } from '@/hooks/use-form-validation';
import { things } from '@/routes';
import { add as addThing } from '@/routes/things';
import type { ThingFormData } from './form-types';

function validateThing(data: ThingFormData): FormDataErrors<ThingFormData> {
    const errors: FormDataErrors<ThingFormData> = {};

    if (!data.name.trim()) {
        errors.name = 'Podaj nazwę przedmiotu.';
    }

    if (!data.category) {
        errors.category = 'Wybierz kategorię.';
    }

    if (!data.room) {
        errors.room = 'Wybierz pomieszczenie.';
    }

    if (!data.storage) {
        errors.storage = 'Wybierz typ składowania.';
    }

    if (data.storage === 'container' && !data.assignBoxLater && !data.boxId) {
        errors.boxId = 'Wybierz pudełko lub przypisz je później.';
    }

    return errors;
}

export default function AddThing() {
    const form = useForm<ThingFormData>({
        name: '',
        category: '',
        serialNumber: '',
        room: '',
        placement: '',
        storage: '',
        boxId: '',
        assignBoxLater: false,
    });
    const validate = useFormValidation(form, validateThing);

    return (
        <>
            <Head title="Dodaj nowy przedmiot" />
            <div className="mx-auto max-w-6xl">
                <Heading
                    title="Dodaj nowy przedmiot"
                    description="Zarejestruj fizyczny przedmiot w ewidencji domowej i przypisz jego stałe miejsce w przestrzeni."
                    backLink={{
                        href: things().url,
                        label: 'Wróć do listy przedmiotów',
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
                            'Zapis przedmiotu będzie dostępny po podłączeniu backendu.',
                        );
                    }}
                    className="space-y-5 sm:space-y-7"
                >
                    <BasicInformationStep form={form} />

                    <LocationStep form={form} />

                    <StorageStep form={form} />

                    <SectionCard
                        as="div"
                        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between xl:p-9"
                    >
                        <Link
                            href={things().url}
                            className="px-2 py-2 text-sm font-medium text-(--button-text) hover:text-primary sm:text-base"
                        >
                            Anuluj
                        </Link>
                        <div className="flex flex-col gap-2 sm:flex-row">
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
                                type="primary"
                                size="small"
                                htmlType="submit"
                                icon={<CheckOutlined />}
                            >
                                Zapisz i dodaj przedmiot
                            </Button>
                        </div>
                    </SectionCard>
                </Form>
            </div>
        </>
    );
}

AddThing.layout = {
    breadcrumbs: [
        { title: 'Przedmioty', href: things() },
        { title: 'Dodaj przedmiot', href: addThing() },
    ],
};
