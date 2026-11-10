import Button from '@/components/Button';
import Heading from '@/components/heading';
import SectionCard from '@/components/section-card';
import { maintenance } from '@/routes';
import { add as addMaintenance } from '@/routes/maintenance';
import {
    CalendarOutlined,
    CheckOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { Head } from '@inertiajs/react';
import {
    Alert,
    Col,
    DatePicker,
    Form,
    Input,
    InputNumber,
    message,
    Row,
    Select,
    Tag,
} from 'antd';
import { useState } from 'react';
import dayjs from 'dayjs';

type MaintenanceThingOption = { value: number; label: string };
type MaintenanceService = {
    name: string;
    isScheduled: boolean;
    appointmentAt: string | null;
    dueAt: string | null;
    recurrence: string;
    provider: string;
    phone: string;
    estimatedCost: number;
    notes: string;
};

export default function AddMaintenance({
    maintainableThings,
    selectedThingId,
    service,
}: {
    maintainableThings: MaintenanceThingOption[];
    selectedThingId: number | null;
    service: MaintenanceService | null;
}) {
    const [form] = Form.useForm();
    const [isScheduled, setIsScheduled] = useState(
        service?.isScheduled ?? false,
    );

    const showNotConnectedMessage = () => {
        message.info(
            service
                ? 'To demonstracyjny serwis — zmiany nie są zapisywane.'
                : 'Zapisywanie serwisów będzie dostępne po podłączeniu backendu.',
        );
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
                    href: maintenance().url,
                    label: 'Wróć',
                }}
                className="mb-8! sm:mb-10!"
            />

            <Form
                form={form}
                initialValues={{
                    name: service?.name,
                    recurrence: service?.recurrence ?? 'yearly',
                    thing_id: selectedThingId ?? undefined,
                    is_scheduled: service?.isScheduled ?? false,
                    appointment_at: service?.appointmentAt
                        ? dayjs(service.appointmentAt)
                        : undefined,
                    due_at: service?.dueAt ? dayjs(service.dueAt) : undefined,
                    provider: service?.provider,
                    phone: service?.phone,
                    estimated_cost: service?.estimatedCost,
                    notes: service?.notes,
                }}
                layout="vertical"
                noValidate
                onFinish={showNotConnectedMessage}
                className="space-y-5 sm:space-y-7"
            >
                <SectionCard
                    number="01"
                    title="Podstawowe informacje"
                    className="xl:p-9"
                >
                    <Form.Item
                        label="Nazwa serwisu / przeglądu"
                        name="name"
                        rules={[
                            { required: true, message: 'Podaj nazwę serwisu.' },
                        ]}
                        required
                    >
                        <Input
                            size="large"
                            placeholder="np. Przegląd roczny pompy ciepła, czyszczenie komina"
                            className="bg-tertiary!"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Urządzenie wymagające serwisowania"
                        name="thing_id"
                        rules={[
                            {
                                required: true,
                                message: 'Wybierz urządzenie.',
                            },
                        ]}
                        required
                        className="mb-0!"
                    >
                        {maintainableThings.length > 0 ? (
                            <Select
                                size="large"
                                className="w-full!"
                                showSearch={{ optionFilterProp: 'label' }}
                                placeholder="Wybierz urządzenie"
                                options={maintainableThings}
                            />
                        ) : (
                            <>
                                <Select
                                    size="large"
                                    className="w-full!"
                                    disabled
                                    placeholder="Brak urządzeń wymagających serwisowania"
                                />
                                <Alert
                                    type="info"
                                    showIcon
                                    title="Najpierw dodaj przedmiot i zaznacz „Wymaga serwisowania”."
                                    className="mt-3!"
                                />
                            </>
                        )}
                    </Form.Item>
                </SectionCard>

                <SectionCard
                    number="02"
                    title="Termin i status realizacji"
                    className="xl:p-9"
                >
                    <Form.Item
                        label="Czy serwis jest już umówiony?"
                        className="mb-5!"
                    >
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                            {[
                                { value: false, label: 'Nie, jeszcze nie' },
                                { value: true, label: 'Tak, jest umówiony' },
                            ].map((option) => (
                                <Tag.CheckableTag
                                    key={String(option.value)}
                                    checked={isScheduled === option.value}
                                    onChange={() => {
                                        setIsScheduled(option.value);
                                        form.setFieldValue(
                                            'is_scheduled',
                                            option.value,
                                        );

                                        if (option.value) {
                                            form.setFieldValue(
                                                'due_at',
                                                undefined,
                                            );
                                        } else {
                                            form.setFieldValue(
                                                'appointment_at',
                                                undefined,
                                            );
                                        }
                                    }}
                                    className="m-0! rounded-full! border! border-transparent! bg-tertiary! px-4! py-2! text-sm! text-(--button-text)! hover:bg-surface-muted! sm:text-base! [&.ant-tag-checkable-checked]:border-primary! [&.ant-tag-checkable-checked]:bg-primary-soft! [&.ant-tag-checkable-checked]:text-primary! [&.ant-tag-checkable-checked:hover]:bg-primary-soft!"
                                >
                                    {option.label}
                                </Tag.CheckableTag>
                            ))}
                        </div>
                    </Form.Item>

                    <Row gutter={[20, 0]}>
                        <Col xs={24} md={12}>
                            {isScheduled ? (
                                <Form.Item
                                    label="Termin i godzina umówionej wizyty"
                                    name="appointment_at"
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                'Wybierz termin umówionej wizyty.',
                                        },
                                    ]}
                                    required
                                >
                                    <DatePicker
                                        size="large"
                                        showTime={{ format: 'HH:mm' }}
                                        format="DD.MM.YYYY HH:mm"
                                        placeholder="Wybierz termin wizyty"
                                        className="w-full! bg-tertiary!"
                                        suffixIcon={<CalendarOutlined />}
                                    />
                                </Form.Item>
                            ) : (
                                <Form.Item
                                    label="Do kiedy należy umówić serwis?"
                                    name="due_at"
                                    extra="Na podstawie tej daty wyliczymy pilność serwisu."
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                'Wybierz termin, do którego należy umówić serwis.',
                                        },
                                    ]}
                                    required
                                >
                                    <DatePicker
                                        size="large"
                                        format="DD.MM.YYYY"
                                        placeholder="Wybierz termin"
                                        className="w-full! bg-tertiary!"
                                        suffixIcon={<CalendarOutlined />}
                                    />
                                </Form.Item>
                            )}
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Cykliczność / Powtarzalność"
                                name="recurrence"
                                className="mb-0!"
                            >
                                <Select
                                    size="large"
                                    className="w-full!"
                                    options={[
                                        { value: 'none', label: 'Jednorazowo' },
                                        {
                                            value: '3-months',
                                            label: 'Co 3 miesiące',
                                        },
                                        {
                                            value: '6-months',
                                            label: 'Co 6 miesięcy',
                                        },
                                        {
                                            value: 'yearly',
                                            label: 'Co 1 rok (przegląd coroczny)',
                                        },
                                        {
                                            value: '2-years',
                                            label: 'Co 2 lata',
                                        },
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </SectionCard>

                <SectionCard
                    number="03"
                    title="Wykonawca i budżet"
                    className="xl:p-9"
                >
                    <Row gutter={[20, 0]}>
                        <Col xs={24} md={12} xl={8}>
                            <Form.Item
                                label="Wykonawca / Firma"
                                name="provider"
                            >
                                <Input
                                    size="large"
                                    prefix={<UserOutlined />}
                                    placeholder="np. Serwis HVAC Termo-Partner"
                                    className="bg-tertiary!"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12} xl={8}>
                            <Form.Item label="Telefon kontaktowy" name="phone">
                                <Input
                                    size="large"
                                    type="tel"
                                    placeholder="+48 601 234 567"
                                    className="bg-tertiary!"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12} xl={8}>
                            <Form.Item
                                label="Szacowany koszt"
                                name="estimated_cost"
                            >
                                <InputNumber
                                    min={0}
                                    size="large"
                                    addonAfter="PLN"
                                    placeholder="0"
                                    className="w-full! bg-tertiary!"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </SectionCard>

                <SectionCard
                    number="04"
                    title="Notatki i zalecenia"
                    className="xl:p-9"
                >
                    <Form.Item name="notes" className="mb-0!">
                        <Input.TextArea
                            rows={4}
                            placeholder="np. Wymienić anody magnezowe, sprawdzić ciśnienie w naczyniu wzbiorczym oraz pobrać protokół gwarancyjny dla ubezpieczyciela."
                            className="bg-tertiary!"
                        />
                    </Form.Item>
                </SectionCard>

                <SectionCard
                    as="div"
                    className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between xl:p-9"
                >
                    <Button
                        href={maintenance().url}
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
