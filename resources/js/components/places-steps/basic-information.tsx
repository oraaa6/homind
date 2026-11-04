import { AppstoreOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Form, Input, Select } from 'antd';
import SectionCard from '@/components/section-card';
import { mockPlaces } from '@/pages/places/data';
import type { PlaceFormState } from '@/pages/places/form-types';

const roomOptions = mockPlaces
    .filter((place) => place.kind === 'room')
    .map((place) => ({ value: place.id, label: place.name }));

export default function BasicInformationStep({
    form,
}: {
    form: PlaceFormState;
}) {
    const isRoom = form.data.kind === 'room';

    return (
        <SectionCard
            number="02"
            title="Podstawowe informacje"
            description="Określ nazwę oraz fizyczne przypisanie w strukturze domu"
            className="xl:p-9"
        >
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
                    validateStatus={form.errors.parentId ? 'error' : ''}
                    help={form.errors.parentId}
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
                        value={form.data.parentId || undefined}
                        disabled={isRoom}
                        onChange={(value) => {
                            form.setData('parentId', value);
                            form.clearErrors('parentId');
                        }}
                        className="w-full"
                    />
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
                    className="mb-0! min-w-0 [&_.ant-form-item-label>label]:w-full"
                >
                    <Input
                        id="place-placement"
                        name="placement"
                        size="large"
                        prefix={<AppstoreOutlined />}
                        placeholder="np. Regał metalowy #02, półka środkowa"
                        value={form.data.placement}
                        onChange={(event) =>
                            form.setData('placement', event.target.value)
                        }
                        className="bg-tertiary!"
                    />
                </Form.Item>
            </div>
        </SectionCard>
    );
}
