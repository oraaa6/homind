import { Form, Input, Radio } from 'antd';
import clsx from 'clsx';
import SectionCard from '@/components/section-card';
import type { ThingFormState } from '@/pages/things/form-types';

const rooms = [
    {
        value: 'kitchen',
        label: 'Kuchnia',
        subtitle: 'Poziom 0',
    },
    {
        value: 'garage',
        label: 'Garaż & Warsztat',
        subtitle: 'Budynek zewn.',
    },
    {
        value: 'living-room',
        label: 'Salon',
        subtitle: 'Poziom 0',
    },
    {
        value: 'basement',
        label: 'Piwnica',
        subtitle: 'Poziom -1',
    },
    {
        value: 'attic',
        label: 'Strych',
        subtitle: 'Poziom +2',
    },
    {
        value: 'garden',
        label: 'Ogród',
        subtitle: 'Otoczenie',
    },
];

export default function LocationStep({ form }: { form: ThingFormState }) {
    return (
        <SectionCard
            number="02"
            title="Gdzie znajduje się przedmiot?"
            description="Przypisz stałą strefę domową"
            className="xl:p-9"
        >
            <Form.Item
                label="Strefa główna / Pomieszczenie"
                required
                validateStatus={form.errors.room ? 'error' : ''}
                help={form.errors.room}
            >
                <Radio.Group
                    value={form.data.room}
                    onChange={(event) => {
                        form.setData('room', event.target.value);
                        form.clearErrors('room');
                    }}
                    className="grid! w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
                >
                    {rooms.map((room) => {
                        const selected = form.data.room === room.value;

                        return (
                            <Radio
                                key={room.value}
                                value={room.value}
                                className={clsx(
                                    'm-0! flex! min-h-24 min-w-0 items-center! justify-start! rounded-xl border border-transparent p-4! text-left! sm:p-5! [&_.ant-radio]:hidden',
                                    selected
                                        ? 'border-primary! bg-primary-soft! text-primary!'
                                        : 'bg-tertiary text-foreground!',
                                )}
                            >
                                <span className="flex flex-col items-start gap-1">
                                    <span className="font-semibold sm:text-base">
                                        {room.label}
                                    </span>
                                    <span className="text-xs text-(--button-text) sm:text-sm">
                                        {room.subtitle}
                                    </span>
                                </span>
                            </Radio>
                        );
                    })}
                </Radio.Group>
            </Form.Item>
            <Form.Item
                label="Dokładne umiejscowienie w strefie"
                extra="Półka, regał lub szafka itp."
                className="mb-0!"
            >
                <Input
                    name="placement"
                    size="large"
                    placeholder="np. Regał warsztatowy A, Półka 2"
                    value={form.data.placement}
                    onChange={(event) =>
                        form.setData('placement', event.target.value)
                    }
                    className="bg-tertiary!"
                />
            </Form.Item>
        </SectionCard>
    );
}
