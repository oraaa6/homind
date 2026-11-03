import { CheckOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Form, Input, message, Modal, Select } from 'antd';
import { useState } from 'react';
import Button from '@/components/Button';
import type { Thing, ThingDetails } from '@/pages/things/data';

const rooms = [
    { value: 'Kuchnia', label: 'Kuchnia (Parter)', floor: 'Parter' },
    { value: 'Spiżarnia', label: 'Spiżarnia (Parter)', floor: 'Parter' },
    { value: 'Salon', label: 'Salon (Parter)', floor: 'Parter' },
    { value: 'Pralnia', label: 'Pralnia (Parter)', floor: 'Parter' },
    { value: 'Sypialnia', label: 'Sypialnia (Piętro 1)', floor: 'Piętro 1' },
    { value: 'Garaż', label: 'Garaż (Budynek zewn.)', floor: 'Budynek zewn.' },
    { value: 'Ogród', label: 'Ogród', floor: 'Otoczenie' },
];

const places = [
    { room: 'Kuchnia', value: 'Blat kuchenny A', label: 'Blat kuchenny A' },
    {
        room: 'Kuchnia',
        value: 'Wyspa kuchenna - Strefa B',
        label: 'Wyspa kuchenna - Strefa B',
    },
    { room: 'Kuchnia', value: 'Szafka pod zlewem', label: 'Szafka pod zlewem' },
    { room: 'Kuchnia', value: 'Lodówka główna', label: 'Lodówka główna' },
    { room: 'Spiżarnia', value: 'Półka 2', label: 'Półka 2' },
    {
        room: 'Salon',
        value: 'Szafka pod biurkiem',
        label: 'Szafka pod biurkiem',
    },
    { room: 'Pralnia', value: 'Szafa gospodarcza', label: 'Szafa gospodarcza' },
    {
        room: 'Sypialnia',
        value: 'Szuflada z zapasami',
        label: 'Szuflada z zapasami',
    },
    {
        room: 'Garaż',
        value: 'Regał z narzędziami',
        label: 'Regał z narzędziami',
    },
    { room: 'Garaż', value: 'Schowek', label: 'Schowek' },
    {
        room: 'Ogród',
        value: 'Schowek gospodarczy',
        label: 'Schowek gospodarczy',
    },
];

export default function ChangeLocationModal({
    item,
    details,
    onClose,
}: {
    item: Thing;
    details: ThingDetails;
    onClose: () => void;
}) {
    const [form] = Form.useForm();
    const [room, setRoom] = useState(details.room);
    const roomPlaces = places.filter((place) => place.room === room);
    const suggestedPlace = roomPlaces.find(
        (place) => place.value !== details.place,
    )?.value;

    return (
        <Modal
            open
            centered
            width={840}
            onCancel={onClose}
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
                    <Button type="text" htmlType="button" size="small" onClick={onClose}>
                        Anuluj
                    </Button>
                    <Button
                        type="primary"
                        size="small"
                        htmlType="submit"
                        form="change-location-form"
                        icon={<CheckOutlined />}
                    >
                        Zapisz nową lokalizację
                    </Button>
                </div>
            }
        >
            <div className="my-5 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-tertiary p-4">
                <p className="flex items-center gap-2 text-sm text-(--button-text) sm:text-base">
                    <EnvironmentOutlined
                        className="text-primary"
                        aria-hidden="true"
                    />
                    Obecnie:{' '}
                    <strong className="text-foreground">
                        {details.room} › {details.place}
                    </strong>
                </p>
                <span className="rounded-lg bg-surface-muted px-2 py-1 text-xs font-medium text-(--button-text)">
                    {
                        rooms.find((option) => option.value === details.room)
                            ?.floor
                    }
                </span>
            </div>

            <Form
                form={form}
                id="change-location-form"
                layout="vertical"
                initialValues={{ room: details.room, place: suggestedPlace }}
                onFinish={() =>
                    message.info(
                        'Zapis lokalizacji będzie dostępny po podłączeniu backendu.',
                    )
                }
            >
                <div className="grid gap-x-4 sm:grid-cols-2">
                    <Form.Item
                        name="room"
                        label="Nowe pomieszczenie"
                        rules={[
                            {
                                required: true,
                                message: 'Wybierz pomieszczenie.',
                            },
                        ]}
                    >
                        <Select
                            size="large"
                            options={rooms}
                            onChange={(value) => {
                                setRoom(value);
                                form.setFieldValue('place', undefined);
                            }}
                        />
                    </Form.Item>
                    <Form.Item
                        name="place"
                        label="Strefa / Półka / Pudełko"
                        rules={[
                            { required: true, message: 'Wybierz miejsce.' },
                        ]}
                    >
                        <Select
                            size="large"
                            options={roomPlaces}
                            placeholder="Wybierz miejsce"
                        />
                    </Form.Item>
                </div>
                <Form.Item
                    name="note"
                    label="Powód / Notatka"
                    className="mb-0!"
                >
                    <Input
                        size="large"
                        placeholder="np. Wyniesione do spiżarni na czas remontu..."
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}
