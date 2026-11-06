import { CheckOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useForm } from '@inertiajs/react';
import { Form, Input, Modal, Select } from 'antd';
import Button from '@/components/Button';
import type { Place } from '@/pages/places/data';
import { update as updatePlace } from '@/routes/places';

type RoomOption = {
    id: number;
    name: string;
};

export default function ChangePlaceLocationModal({
    place,
    parentName,
    rooms,
    onClose,
}: {
    place: Place;
    parentName: string | null;
    rooms: RoomOption[];
    onClose: () => void;
}) {
    const form = useForm({
        parent_id: place.parentId ?? 0,
        placement: place.description,
    });

    const submit = () => {
        form.put(updatePlace(place.slug).url, {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    return (
        <Modal
            open
            centered
            width={720}
            onCancel={onClose}
            title={
                <div>
                    <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
                        Zmień lokalizację
                    </h2>
                    <p className="mt-2 text-sm font-normal text-(--button-text) sm:text-base">
                        {place.name} · {place.id}
                    </p>
                </div>
            }
            footer={
                <div className="flex flex-wrap justify-end gap-2">
                    <Button
                        type="secondary"
                        size="small"
                        disabled={form.processing}
                        onClick={onClose}
                    >
                        Anuluj
                    </Button>
                    <Button
                        type="primary"
                        size="small"
                        icon={<CheckOutlined />}
                        loading={form.processing}
                        onClick={submit}
                    >
                        Zapisz lokalizację
                    </Button>
                </div>
            }
        >
            <div className="my-5 flex flex-wrap items-center gap-2 rounded-xl bg-tertiary p-4 text-sm text-(--button-text) sm:text-base">
                <EnvironmentOutlined
                    className="text-primary"
                    aria-hidden="true"
                />
                <span>Obecnie:</span>
                <strong className="text-foreground">
                    {parentName ?? 'Brak pomieszczenia'}
                    {place.description && ` · ${place.description}`}
                </strong>
            </div>

            <Form layout="vertical" onFinish={submit}>
                <Form.Item
                    label="Nowe pomieszczenie nadrzędne"
                    required
                    validateStatus={form.errors.parent_id ? 'error' : ''}
                    help={form.errors.parent_id}
                >
                    <Select
                        size="large"
                        value={form.data.parent_id || undefined}
                        options={rooms.map((room) => ({
                            value: room.id,
                            label: room.name,
                        }))}
                        placeholder="Wybierz pomieszczenie"
                        onChange={(value) => {
                            form.setData('parent_id', value);
                            form.clearErrors('parent_id');
                        }}
                    />
                </Form.Item>
                <Form.Item
                    label="Położenie szczegółowe"
                    validateStatus={form.errors.placement ? 'error' : ''}
                    help={form.errors.placement}
                    className="mb-0!"
                >
                    <Input
                        size="large"
                        value={form.data.placement}
                        placeholder="np. Regał metalowy #02, półka środkowa"
                        onChange={(event) => {
                            form.setData('placement', event.target.value);
                            form.clearErrors('placement');
                        }}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}
