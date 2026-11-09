import { CheckOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useForm } from '@inertiajs/react';
import { Alert, Form, Modal, Select, message } from 'antd';
import Button from '@/components/Button';
import SurfaceBox from '@/components/surface-box';
import type {
    Thing,
    ThingDetails,
    ThingPlaceOption,
} from '@/pages/things/types';
import { update as updateThingLocation } from '@/routes/things/location';

export default function ChangeLocationModal({
    item,
    details,
    places,
    onClose,
}: {
    item: Thing;
    details: ThingDetails;
    places: ThingPlaceOption[];
    onClose: () => void;
}) {
    const form = useForm({ place_id: item.placeId });
    const options = places.map((place) => ({
        value: place.id,
        label: [place.name, place.parent_name, place.household_name]
            .filter(Boolean)
            .join(' · '),
    }));
    const currentLocation = [details.room, details.place]
        .filter(Boolean)
        .join(' › ');

    return (
        <Modal
            open
            centered
            width={840}
            onCancel={onClose}
            closable={!form.processing}
            mask={{ closable: !form.processing }}
            title={
                <div>
                    <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
                        Zmień lokalizację
                    </h2>
                    <p className="mt-2 text-sm font-normal text-(--button-text) sm:text-base">
                        Przedmiot: <strong>{item.name}</strong> (#{item.id})
                    </p>
                </div>
            }
            footer={
                <div className="flex flex-wrap justify-end gap-2">
                    <Button
                        type="text"
                        htmlType="button"
                        size="small"
                        disabled={form.processing}
                        onClick={onClose}
                    >
                        Anuluj
                    </Button>
                    <Button
                        type="primary"
                        size="small"
                        htmlType="submit"
                        form="change-location-form"
                        loading={form.processing}
                        disabled={form.data.place_id === item.placeId}
                        icon={<CheckOutlined />}
                    >
                        Zapisz nową lokalizację
                    </Button>
                </div>
            }
        >
            <SurfaceBox className="my-5 flex flex-wrap items-center gap-2">
                <p className="flex items-center gap-2 text-sm text-(--button-text) sm:text-base">
                    <EnvironmentOutlined
                        className="text-primary"
                        aria-hidden="true"
                    />
                    Obecnie:{' '}
                    <strong className="text-foreground">
                        {currentLocation}
                    </strong>
                </p>
            </SurfaceBox>

            <Form
                id="change-location-form"
                layout="vertical"
                onFinish={() =>
                    form.patch(updateThingLocation(item.slug).url, {
                        onSuccess: () => {
                            message.success(
                                'Lokalizacja przedmiotu została zmieniona.',
                            );
                            onClose();
                        },
                    })
                }
            >
                {places.length === 0 ? (
                    <Alert
                        type="info"
                        showIcon
                        title="Brak dostępnych lokalizacji. Najpierw dodaj miejsce w domu."
                    />
                ) : (
                    <Form.Item
                        label="Nowa lokalizacja"
                        required
                        validateStatus={form.errors.place_id ? 'error' : ''}
                        help={form.errors.place_id}
                        className="mb-0!"
                    >
                        <Select
                            showSearch={{ optionFilterProp: 'label' }}
                            size="large"
                            value={form.data.place_id}
                            options={options}
                            placeholder="Wybierz pomieszczenie, regał lub pudełko"
                            onChange={(value) => {
                                form.setData('place_id', value);
                                form.clearErrors('place_id');
                            }}
                        />
                    </Form.Item>
                )}
            </Form>
        </Modal>
    );
}
