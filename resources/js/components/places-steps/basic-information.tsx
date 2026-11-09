import { AppstoreOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Alert, Form, Input, Select } from 'antd';
import SectionCard from '@/components/section-card';
import type { PlaceFormState } from '@/pages/places/types';

type HouseholdOption = { id: number; name: string };
export type RoomOption = {
    id: number;
    household_id: number;
    name: string;
};

export default function BasicInformationStep({
    form,
    households,
    rooms,
}: {
    form: PlaceFormState;
    households: HouseholdOption[];
    rooms: RoomOption[];
}) {
    const isRoom = form.data.kind === 'room';
    const roomOptions = rooms
        .filter((room) => room.household_id === form.data.household_id)
        .map((room) => ({ value: room.id, label: room.name }));

    return (
        <SectionCard
            number="02"
            title="Podstawowe informacje"
            description="Określ nazwę oraz fizyczne przypisanie w strukturze domu"
            className="xl:p-9"
        >
            <Form.Item
                label="Dom"
                required
                validateStatus={form.errors.household_id ? 'error' : ''}
                help={form.errors.household_id}
            >
                <Select
                    size="large"
                    value={form.data.household_id || undefined}
                    options={households.map((household) => ({
                        value: household.id,
                        label: household.name,
                    }))}
                    disabled={households.length === 1}
                    onChange={(value) => {
                        form.setData('household_id', value);
                        form.setData('parent_id', null);
                        form.clearErrors('household_id');
                        form.clearErrors('parent_id');
                    }}
                />
            </Form.Item>

            <Form.Item
                label="Nazwa lokalizacji / pojemnika"
                htmlFor="place-name"
                required
                validateStatus={form.errors.name ? 'error' : ''}
                help={form.errors.name}
            >
                <Input
                    id="place-name"
                    name="name"
                    size="large"
                    placeholder="np. Karton: Elektronika i kable USB"
                    value={form.data.name}
                    onChange={(event) => {
                        form.setData('name', event.target.value);
                        form.clearErrors('name');
                    }}
                    className="bg-tertiary!"
                />
            </Form.Item>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Form.Item
                    label="Strefa nadrzędna / Pomieszczenie"
                    htmlFor="place-parent"
                    required={!isRoom}
                    validateStatus={form.errors.parent_id ? 'error' : ''}
                    help={form.errors.parent_id}
                    className="mb-0! min-w-0"
                >
                    <Select
                        id="place-parent"
                        size="large"
                        prefix={<EnvironmentOutlined />}
                        placeholder={
                            isRoom
                                ? 'Brak — strefa główna'
                                : 'Wybierz pomieszczenie'
                        }
                        options={roomOptions}
                        value={form.data.parent_id || undefined}
                        disabled={isRoom}
                        onChange={(value) => {
                            form.setData('parent_id', value);
                            form.clearErrors('parent_id');
                        }}
                        className="w-full"
                    />
                    {!isRoom && roomOptions.length === 0 && (
                        <Alert
                            type="info"
                            showIcon
                            title="Najpierw utwórz pomieszczenie. Wybierz typ „Pomieszczenie / Strefa”, zapisz je, a potem dodaj pudełko lub regał."
                            className="mt-3 border-0! bg-primary-soft! text-primary! [&_.ant-alert-icon]:text-primary! [&_.ant-alert-title]:text-primary!"
                        />
                    )}
                </Form.Item>

                <Form.Item
                    label={
                        <span className="flex w-full flex-wrap justify-between gap-x-3">
                            <span>Położenie szczegółowe</span>
                            <span className="font-normal text-(--button-text)">
                                Opcjonalnie
                            </span>
                        </span>
                    }
                    htmlFor="place-placement"
                    validateStatus={form.errors.placement ? 'error' : ''}
                    help={form.errors.placement}
                    className="mb-0! min-w-0 [&_.ant-form-item-label>label]:w-full"
                >
                    <Input
                        id="place-placement"
                        name="placement"
                        size="large"
                        prefix={<AppstoreOutlined />}
                        placeholder="np. Regał metalowy #02, półka środkowa"
                        value={form.data.placement}
                        onChange={(event) => {
                            form.setData('placement', event.target.value);
                            form.clearErrors('placement');
                        }}
                        className="bg-tertiary!"
                    />
                </Form.Item>
            </div>
        </SectionCard>
    );
}
