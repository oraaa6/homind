import { CheckOutlined } from '@ant-design/icons';
import { Head, useForm } from '@inertiajs/react';
import { Form, message } from 'antd';
import Button from '@/components/Button';
import Heading from '@/components/heading';
import SectionCard from '@/components/section-card';
import BasicInformationStep from '@/components/maintenance-steps/basic-information';
import NotesStep from '@/components/maintenance-steps/notes';
import ProviderBudgetStep from '@/components/maintenance-steps/provider-budget';
import ScheduleStep from '@/components/maintenance-steps/schedule';
import { maintenance } from '@/routes';
import {
    add as addMaintenance,
    show as showMaintenance,
} from '@/routes/maintenance';
import {
    store as storeMaintenance,
    update as updateMaintenance,
} from '@/routes/maintenance/services';
import type {
    MaintenanceFormValues,
    MaintenanceRequestData,
    MaintenanceService,
    MaintenanceThingOption,
} from './types';
import {
    getMaintenanceFormInitialValues,
    toMaintenanceRequestData,
} from './utils';

export default function AddMaintenance({
    maintainableThings,
    selectedThingId,
    service,
}: {
    maintainableThings: MaintenanceThingOption[];
    selectedThingId: number | null;
    service: MaintenanceService | null;
}) {
    const initialValues = getMaintenanceFormInitialValues(
        service,
        selectedThingId,
    );
    const form = useForm<MaintenanceRequestData>(
        toMaintenanceRequestData(initialValues),
    );
    const isScheduled = form.data.is_scheduled;
    const returnUrl = selectedThingId
        ? showMaintenance(selectedThingId).url
        : maintenance().url;

    const submit = (values: MaintenanceFormValues) => {
        const options = {
            onSuccess: () =>
                message.success(
                    service
                        ? 'Plan serwisu został zaktualizowany.'
                        : 'Plan serwisu został dodany.',
                ),
        };

        form.transform(() => toMaintenanceRequestData(values, isScheduled));

        if (service) {
            form.put(updateMaintenance(service.id).url, options);
        } else {
            form.post(storeMaintenance().url, options);
        }
    };

    return (
        <>
            <Head title={service ? 'Edytuj serwis' : 'Dodaj serwis'} />
            <Heading
                title={service ? 'Edytuj serwis' : 'Dodaj serwis lub przegląd'}
                description={
                    service
                        ? 'Zmień dane zaplanowanego serwisu urządzenia.'
                        : 'Zaplanuj przegląd techniczny, wpisz dane wykonawcy lub zarejestruj wykonaną naprawę instalacji.'
                }
                backLink={{
                    href: returnUrl,
                    label: 'Wróć',
                }}
                className="mb-8! sm:mb-10!"
            />

            <Form
                onFinish={submit}
                initialValues={initialValues}
                onValuesChange={() => form.clearErrors()}
                layout="vertical"
                noValidate
                className="space-y-5 sm:space-y-7"
            >
                <BasicInformationStep
                    maintainableThings={maintainableThings}
                    disabled={Boolean(service)}
                    nameError={form.errors.name}
                    thingError={form.errors.thing_id}
                />
                <ScheduleStep
                    isScheduled={isScheduled}
                    onScheduledChange={(scheduled) => {
                        form.setData((current) => ({
                            ...current,
                            is_scheduled: scheduled,
                            ...(scheduled
                                ? { due_at: null }
                                : { appointment_at: null }),
                        }));
                        form.clearErrors('appointment_at', 'due_at');
                    }}
                    appointmentError={form.errors.appointment_at}
                    dueError={form.errors.due_at}
                    recurrenceError={form.errors.recurrence}
                />
                <ProviderBudgetStep
                    providerError={form.errors.provider}
                    phoneError={form.errors.phone}
                    costError={form.errors.estimated_cost}
                />
                <NotesStep error={form.errors.notes} />

                <SectionCard
                    as="div"
                    className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between xl:p-9"
                >
                    <Button
                        href={returnUrl}
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
                            disabled={form.processing}
                            htmlType="submit"
                            icon={<CheckOutlined />}
                        >
                            {service ? 'Zapisz zmiany' : 'Zapisz serwis'}
                        </Button>
                    </div>
                </SectionCard>
            </Form>
        </>
    );
}

AddMaintenance.layout = {
    breadcrumbs: [
        { title: 'Utrzymanie', href: maintenance() },
        { title: 'Formularz serwisu', href: addMaintenance() },
    ],
};
