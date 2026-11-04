import {
    InfoCircleOutlined,
    NumberOutlined,
    SyncOutlined,
} from '@ant-design/icons';
import { Alert, Form, Input } from 'antd';
import Button from '@/components/Button';
import LabelPreview from '@/components/places/label-preview';
import SectionCard from '@/components/section-card';
import { mockPlaces } from '@/pages/places/data';
import type { PlaceFormState } from '@/pages/places/form-types';

export default function IdentifierStep({
    form,
    onRegenerate,
}: {
    form: PlaceFormState;
    onRegenerate: () => void;
}) {
    const room = mockPlaces.find((place) => place.id === form.data.parentId);

    return (
        <SectionCard
            number="03"
            title="Identyfikator i Kod QR"
            description="Przypisz unikalny kod, aby drukować trwałe etykiety lub skanować telefonem."
            className="xl:p-9"
        >
            <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1.3fr_1fr]">
                <div className="min-w-0">
                    <Form.Item
                        label={
                            <span className="flex w-full flex-wrap justify-between gap-x-3">
                                <span>Identyfikator (slug systemowy)</span>
                                <span className="text-xs font-normal text-primary">
                                    Unikalny identyfikator
                                </span>
                            </span>
                        }
                        htmlFor="place-identifier"
                        extra="System automatycznie przydzieli kolejny wolny indeks z prefiksem typu."
                        className="[&_.ant-form-item-label>label]:w-full"
                    >
                        <div className="flex items-center gap-2">
                            <Input
                                id="place-identifier"
                                name="identifier"
                                size="large"
                                prefix={<NumberOutlined />}
                                value={form.data.identifier}
                                readOnly
                                className="min-w-0 bg-tertiary! font-mono"
                            />
                            <Button
                                type="secondary"
                                size="small"
                                icon={<SyncOutlined />}
                                aria-label="Wygeneruj nowy identyfikator"
                                onClick={onRegenerate}
                                className="shrink-0"
                            />
                        </div>
                    </Form.Item>
                    <Alert
                        type="info"
                        showIcon
                        icon={<InfoCircleOutlined />}
                        title="Wydrukowaną naklejkę QR możesz przykleić na czoło pudła lub krawędź regału. Każde zeskanowanie aparatem natychmiast otworzy spis zawartości."
                        className="border-0! bg-primary-soft! p-4! text-primary! [&_.ant-alert-icon]:text-primary! [&_.ant-alert-title]:text-primary!"
                    />
                </div>
                <div className="min-w-0">
                    <p className="mb-2 text-sm font-medium text-foreground">
                        Podgląd etykiety do druku
                    </p>
                    <LabelPreview
                        identifier={form.data.identifier}
                        name={form.data.name}
                        room={room?.name}
                        kind={form.data.kind}
                    />
                </div>
            </div>
        </SectionCard>
    );
}
