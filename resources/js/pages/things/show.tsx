import {
    DeleteOutlined,
    EnvironmentOutlined,
    EditOutlined,
    CheckOutlined,
} from '@ant-design/icons';
import { Head, router, useForm } from '@inertiajs/react';
import { Form, InputNumber, Modal, Popconfirm, message } from 'antd';
import { useState } from 'react';
import Button from '@/components/Button';
import Heading from '@/components/heading';
import SectionCard from '@/components/section-card';
import SurfaceBox from '@/components/surface-box';
import ChangeLocationModal from '@/components/things/change-location-modal';
import LocationCard from '@/components/things/location-card';
import LocationHistory from '@/components/things/location-history';
import { things } from '@/routes';
import { destroy as destroyThing } from '@/routes/things';
import { update as updateThingQuantity } from '@/routes/things/quantity';
import type { ActivityEntry } from '@/types/activity';
import type { Thing, ThingDetails, ThingPlaceOption } from './types';

export default function ShowThing({
    item,
    details,
    availablePlaces,
    history,
    historyCount,
    historyHasMore,
}: {
    item: Thing;
    details: ThingDetails;
    availablePlaces: ThingPlaceOption[];
    history: ActivityEntry[];
    historyCount: number;
    historyHasMore: boolean;
}) {
    const [locationModalOpen, setLocationModalOpen] = useState(false);
    const [quantityModalOpen, setQuantityModalOpen] = useState(false);
    const quantityForm = useForm({ quantity: item.quantity });

    return (
        <>
            <Head title={item.name} />
            <Heading
                title={item.name}
                description={`#${item.id}`}
                backLink={{
                    href: things().url,
                    label: 'Wróć',
                    onClick: (event) => {
                        event.preventDefault();
                        window.history.back();
                    },
                }}
                primaryButtonProps={{
                    children: 'Zmień lokalizację',
                    icon: <EnvironmentOutlined />,
                    onClick: () => setLocationModalOpen(true),
                }}
            />

            <div className="flex min-w-0 flex-col gap-5 lg:gap-7">
                <LocationCard item={item} details={details} />
                <SectionCard
                    title="Zarządzanie przedmiotem"
                    description="Zmień ilość lub usuń przedmiot z domu."
                >
                    <div className="space-y-5">
                        <SurfaceBox className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium text-(--button-text)">
                                    Ilość
                                </p>
                                <p className="mt-1 text-2xl font-semibold text-foreground">
                                    {item.quantity}{' '}
                                    <span className="text-base font-medium text-(--button-text)">
                                        {item.unit}
                                    </span>
                                </p>
                            </div>
                            <Button
                                type="primary"
                                size="small"
                                icon={<EditOutlined />}
                                onClick={() => {
                                    quantityForm.setData(
                                        'quantity',
                                        item.quantity,
                                    );
                                    quantityForm.clearErrors();
                                    setQuantityModalOpen(true);
                                }}
                            >
                                Edytuj ilość
                            </Button>
                        </SurfaceBox>
                        <div className="flex flex-col gap-3 border-t border-neutral/20 pt-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="font-semibold text-foreground">
                                    Trwałe usunięcie
                                </p>
                                <p className="mt-1 text-sm text-(--button-text)">
                                    Tej operacji nie będzie można cofnąć.
                                </p>
                            </div>
                            <Popconfirm
                                title="Usunąć przedmiot na stałe?"
                                description="Tej operacji nie będzie można cofnąć."
                                okText="Usuń na stałe"
                                cancelText="Anuluj"
                                okButtonProps={{ type: 'primary' }}
                                cancelButtonProps={{ type: 'text' }}
                                onConfirm={() =>
                                    router.delete(destroyThing(item.slug).url, {
                                        onSuccess: () =>
                                            message.success(
                                                'Przedmiot został usunięty.',
                                            ),
                                    })
                                }
                            >
                                <Button
                                    type="secondary"
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    className="self-start sm:self-auto"
                                >
                                    Usuń przedmiot
                                </Button>
                            </Popconfirm>
                        </div>
                    </div>
                </SectionCard>
                <LocationHistory
                    history={history}
                    historyCount={historyCount}
                    historyHasMore={historyHasMore}
                />
            </div>
            <Modal
                title={
                    <div>
                        <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
                            Zmień ilość
                        </h2>
                        <p className="mt-2 text-sm font-normal text-(--button-text) sm:text-base">
                            Przedmiot: <strong>{item.name}</strong> (#{item.id})
                        </p>
                    </div>
                }
                open={quantityModalOpen}
                onCancel={() => {
                    if (!quantityForm.processing) {
                        setQuantityModalOpen(false);
                    }
                }}
                closable={!quantityForm.processing}
                maskClosable={!quantityForm.processing}
                centered
                width={520}
                footer={
                    <div className="flex flex-wrap justify-end gap-2">
                        <Button
                            type="secondary"
                            size="small"
                            disabled={quantityForm.processing}
                            onClick={() => setQuantityModalOpen(false)}
                        >
                            Anuluj
                        </Button>
                        <Button
                            type="primary"
                            size="small"
                            icon={<CheckOutlined />}
                            loading={quantityForm.processing}
                            disabled={
                                quantityForm.data.quantity < 0 ||
                                !Number.isInteger(quantityForm.data.quantity)
                            }
                            onClick={() => {
                                quantityForm.patch(
                                    updateThingQuantity(item.slug).url,
                                    {
                                        preserveScroll: true,
                                        onSuccess: () => {
                                            setQuantityModalOpen(false);
                                            message.success(
                                                'Ilość przedmiotu została zmieniona.',
                                            );
                                        },
                                    },
                                );
                            }}
                        >
                            Zapisz ilość
                        </Button>
                    </div>
                }
            >
                <SurfaceBox className="my-5 flex flex-wrap items-center gap-2 text-sm text-(--button-text) sm:text-base">
                    Obecna ilość:
                    <strong className="text-foreground">
                        {item.quantity} {item.unit}
                    </strong>
                </SurfaceBox>
                <Form layout="vertical">
                    <Form.Item
                        label="Nowa ilość"
                        required
                        validateStatus={
                            quantityForm.errors.quantity ? 'error' : ''
                        }
                        help={quantityForm.errors.quantity}
                        className="mb-0!"
                    >
                        <InputNumber
                            min={0}
                            precision={0}
                            value={quantityForm.data.quantity}
                            onChange={(value) => {
                                quantityForm.setData('quantity', value ?? 0);
                                quantityForm.clearErrors('quantity');
                            }}
                            className="w-full! bg-tertiary!"
                            size="large"
                        />
                    </Form.Item>
                </Form>
            </Modal>
            {locationModalOpen && (
                <ChangeLocationModal
                    item={item}
                    details={details}
                    places={availablePlaces}
                    onClose={() => setLocationModalOpen(false)}
                />
            )}
        </>
    );
}

ShowThing.layout = {
    breadcrumbs: [{ title: 'Przedmioty', href: things() }],
};
