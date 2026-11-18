import { CheckOutlined } from '@ant-design/icons';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Alert, Form, Input, message, Select } from 'antd';
import Button from '@/components/Button';
import Heading from '@/components/heading';
import RoutineSchedule from '@/components/routines/routine-schedule';
import SectionCard from '@/components/section-card';
import { routineCategoryOptions } from '@/constants/routine-categories';
import { useFormValidation } from '@/hooks/use-form-validation';
import { routines as routinesRoute } from '@/routes';
import { show, store, update } from '@/routes/routines';
import type { Household } from '@/types/household';
import type { Routine, RoutineFormData } from './types';
import {
    getRoutineFormInitialValues,
    toRoutineInput,
    validateRoutine,
} from './utils';

export default function AddRoutine({ routine }: { routine: Routine | null }) {
    const { households = [] } = usePage<{
        households: Household[];
    }>().props;
    const returnUrl = routine ? show(routine.id).url : routinesRoute().url;
    const form = useForm<RoutineFormData>(
        getRoutineFormInitialValues(routine ?? undefined, households),
    );
    const validate = useFormValidation(form, (data) =>
        validateRoutine(data, households, routine ?? undefined),
    );

    const submit = () => {
        if (!validate()) {
            return;
        }

        form.transform((data) => {
            const { startsAt, nextDueAt, ...input } = toRoutineInput(data);

            return routine
                ? { ...input, startsAt, nextDueAt, version: data.version }
                : {
                      ...input,
                      startsAt,
                      lastCompletedAt: data.lastCompletedAt || null,
                  };
        });
        const options = {
            onSuccess: () =>
                message.success(
                    routine
                        ? 'Zmiany zostały zapisane.'
                        : 'Rutyna została dodana.',
                ),
        };

        if (routine) {
            form.put(update(routine.id).url, options);
        } else {
            form.post(store().url, options);
        }
    };

    return (
        <>
            <Head
                title={
                    routine ? `Edytuj rutynę: ${routine.name}` : 'Dodaj rutynę'
                }
            />
            <Heading
                title={
                    routine ? `Edytuj rutynę: ${routine.name}` : 'Dodaj rutynę'
                }
                description={
                    routine
                        ? 'Zmień czynność, częstotliwość i kolejny termin wykonania.'
                        : 'Określ czynność, częstotliwość i pierwszy termin wykonania.'
                }
                backLink={{ href: returnUrl, label: 'Wróć' }}
            />
            <Form
                key={routine?.id ?? 'new'}
                layout="vertical"
                noValidate
                onFinish={submit}
                className="space-y-5 sm:space-y-7"
            >
                {form.errors.version && (
                    <Alert type="error" showIcon title={form.errors.version} />
                )}
                <SectionCard
                    number="01"
                    title="Podstawowe informacje"
                    className="xl:p-9"
                >
                    {households.length > 1 && (
                        <Form.Item
                            label="Dom"
                            required
                            validateStatus={
                                form.errors.householdId ? 'error' : undefined
                            }
                            help={form.errors.householdId}
                        >
                            <Select
                                size="large"
                                placeholder="Wybierz dom"
                                value={form.data.householdId || undefined}
                                options={households.map((household) => ({
                                    value: household.id,
                                    label: household.name,
                                }))}
                                onChange={(value) => {
                                    form.setData('householdId', value);
                                    form.clearErrors('householdId');
                                }}
                            />
                        </Form.Item>
                    )}
                    <Form.Item
                        label="Nazwa rutyny"
                        required
                        validateStatus={form.errors.name ? 'error' : undefined}
                        help={form.errors.name}
                    >
                        <Input
                            size="large"
                            maxLength={150}
                            value={form.data.name}
                            onChange={(event) => {
                                form.setData('name', event.target.value);
                                form.clearErrors('name');
                            }}
                            placeholder="np. Zmiana pościeli lub wymiana końcówki szczoteczki"
                            className="bg-tertiary!"
                        />
                    </Form.Item>
                    <Form.Item
                        label="Kategoria"
                        required
                        validateStatus={
                            form.errors.category ? 'error' : undefined
                        }
                        help={form.errors.category}
                        className="mb-0!"
                    >
                        <Select
                            size="large"
                            value={form.data.category}
                            onChange={(value) => {
                                form.setData('category', value);
                                form.clearErrors('category');
                            }}
                            options={routineCategoryOptions}
                        />
                    </Form.Item>
                </SectionCard>
                <RoutineSchedule form={form} routine={routine ?? undefined} />
                <SectionCard number="03" title="Notatki" className="xl:p-9">
                    <Form.Item label="Dodatkowe informacje" className="mb-0!">
                        <Input.TextArea
                            rows={4}
                            maxLength={2000}
                            value={form.data.notes}
                            onChange={(event) =>
                                form.setData('notes', event.target.value)
                            }
                            placeholder="Wskazówki, potrzebne akcesoria lub miejsce wykonania..."
                            className="bg-tertiary!"
                        />
                    </Form.Item>
                </SectionCard>
                <SectionCard
                    as="div"
                    className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between xl:p-9"
                >
                    <Button
                        type="text"
                        size="small"
                        disabled={form.processing}
                        onClick={() => router.visit(returnUrl)}
                    >
                        Anuluj
                    </Button>
                    <Button
                        type="primary"
                        size="small"
                        htmlType="submit"
                        disabled={households.length === 0}
                        loading={form.processing}
                        icon={<CheckOutlined />}
                    >
                        {routine ? 'Zapisz zmiany' : 'Zapisz rutynę'}
                    </Button>
                </SectionCard>
            </Form>
        </>
    );
}

AddRoutine.layout = {
    breadcrumbs: [{ title: 'Rutyny', href: routinesRoute() }],
};
