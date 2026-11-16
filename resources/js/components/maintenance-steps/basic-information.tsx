import { Alert, Form, Input, Select } from 'antd';
import SectionCard from '@/components/section-card';
import type { MaintenanceThingOption } from '@/pages/maintenance/types';

export default function BasicInformationStep({
    maintainableThings,
    disabled,
    nameError,
    thingError,
}: {
    maintainableThings: MaintenanceThingOption[];
    disabled: boolean;
    nameError?: string;
    thingError?: string;
}) {
    return (
        <SectionCard number="01" title="Podstawowe informacje" className="xl:p-9">
            <Form.Item
                label="Nazwa serwisu / przeglądu"
                name="name"
                validateStatus={nameError ? 'error' : undefined}
                help={nameError}
                rules={[{ required: true, message: 'Podaj nazwę serwisu.' }]}
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
                validateStatus={thingError ? 'error' : undefined}
                help={thingError}
                rules={[{ required: true, message: 'Wybierz urządzenie.' }]}
                required
                className="mb-0!"
            >
                {maintainableThings.length > 0 ? (
                    <Select
                        size="large"
                        className="w-full!"
                        disabled={disabled}
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
    );
}
