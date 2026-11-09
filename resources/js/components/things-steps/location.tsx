import { EnvironmentOutlined, QrcodeOutlined } from '@ant-design/icons';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Alert, Checkbox, Form, Input, Modal, Select } from 'antd';
import { useState } from 'react';
import Button from '@/components/Button';
import SectionCard from '@/components/section-card';
import type { ThingFormState, ThingPlaceOption } from '@/pages/things/types';
import { PlaceType } from '@/types/place';

function getPlaceFromQr(
    code: string,
): { id: number; identifier?: string } | null {
    try {
        const pathname = new URL(code.trim(), 'https://homind.local').pathname;
        const qrMatch = pathname.match(/\/places\/(\d+)\/qr\/([^/]+)\/?$/);

        if (qrMatch) {
            return { id: Number(qrMatch[1]), identifier: qrMatch[2] };
        }

        const placeMatch = pathname.match(/\/places\/(\d+)\/?$/);

        return placeMatch ? { id: Number(placeMatch[1]) } : null;
    } catch {
        return null;
    }
}

export default function LocationStep({
    form,
    places,
}: {
    form: ThingFormState;
    places: ThingPlaceOption[];
}) {
    const [scannerOpen, setScannerOpen] = useState(false);
    const [manualCode, setManualCode] = useState('');
    const [scanError, setScanError] = useState('');
    const placeOptions = places.map((place) => ({
        value: place.id,
        label: [place.name, place.parent_name, place.household_name]
            .filter(Boolean)
            .join(' · '),
    }));
    const selectedPlace = places.find(
        (place) => String(place.id) === String(form.data.place_id),
    );

    const selectScannedPlace = (code: string) => {
        const scannedPlace = getPlaceFromQr(code);
        const place = places.find((option) => option.id === scannedPlace?.id);

        if (!place) {
            setScanError(
                'Kod nie wskazuje lokalizacji dostępnej w jednym z Twoich domów.',
            );

            return;
        }

        if (
            scannedPlace?.identifier &&
            scannedPlace.identifier !== place.identifier
        ) {
            setScanError(
                'Ten kod QR został zastąpiony. Zeskanuj aktualną etykietę lokalizacji.',
            );

            return;
        }

        form.setData({
            ...form.data,
            place_id: place.id,
            needs_packing:
                place.kind === PlaceType.Room ? form.data.needs_packing : false,
            placement:
                place.kind !== PlaceType.Room && form.data.needs_packing
                    ? ''
                    : form.data.placement,
        });
        form.clearErrors('place_id');
        setScannerOpen(false);
        setManualCode('');
        setScanError('');
    };

    return (
        <>
            <SectionCard
                number="02"
                title="Gdzie znajduje się przedmiot?"
                description="Wybierz pomieszczenie docelowe albo konkretne miejsce składowania."
                className="xl:p-9"
            >
                {places.length === 0 ? (
                    <Alert
                        type="info"
                        showIcon
                        title="Najpierw dodaj lokalizację, w której będzie przechowywany przedmiot."
                    />
                ) : (
                    <>
                        <Form.Item
                            label="Lokalizacja"
                            required
                            validateStatus={form.errors.place_id ? 'error' : ''}
                            help={form.errors.place_id}
                        >
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <Select
                                    showSearch={{ optionFilterProp: 'label' }}
                                    size="large"
                                    className="min-w-0 flex-1"
                                    placeholder="Wybierz lokalizację"
                                    options={placeOptions}
                                    value={form.data.place_id ?? undefined}
                                    onChange={(value) => {
                                        const place = places.find(
                                            (option) =>
                                                String(option.id) ===
                                                String(value),
                                        );
                                        form.setData({
                                            ...form.data,
                                            place_id: value,
                                            needs_packing:
                                                place?.kind !== PlaceType.Room
                                                    ? false
                                                    : form.data.needs_packing,
                                            placement:
                                                place?.kind !==
                                                    PlaceType.Room &&
                                                form.data.needs_packing
                                                    ? ''
                                                    : form.data.placement,
                                        });
                                        form.clearErrors('place_id');
                                    }}
                                />
                                <Button
                                    type="secondary"
                                    size="small"
                                    icon={<QrcodeOutlined />}
                                    onClick={() => {
                                        setScanError('');
                                        setScannerOpen(true);
                                    }}
                                >
                                    Skanuj kod QR
                                </Button>
                            </div>
                        </Form.Item>
                        <Form.Item
                            validateStatus={
                                form.errors.needs_packing ? 'error' : ''
                            }
                            help={form.errors.needs_packing}
                            className="mt-5! mb-5!"
                        >
                            <Checkbox
                                checked={form.data.needs_packing}
                                disabled={
                                    selectedPlace?.kind !== PlaceType.Room
                                }
                                onChange={(event) => {
                                    form.setData({
                                        ...form.data,
                                        needs_packing: event.target.checked,
                                        placement: event.target.checked
                                            ? ''
                                            : form.data.placement,
                                    });
                                    form.clearErrors('needs_packing');
                                }}
                            >
                                Dodaj do kolejki <strong>Do spakowania</strong>
                            </Checkbox>
                        </Form.Item>
                        {selectedPlace &&
                            selectedPlace.kind !== PlaceType.Room && (
                                <p className="-mt-3 mb-5 text-sm text-(--button-text)">
                                    „Do spakowania” można wybrać tylko dla
                                    przedmiotu przypisanego bezpośrednio do
                                    pomieszczenia.
                                </p>
                            )}
                        {selectedPlace?.kind === PlaceType.Room &&
                            !form.data.needs_packing && (
                                <p className="-mt-3 mb-5 text-sm text-(--button-text)">
                                    Bez zaznaczenia pomieszczenie będzie
                                    docelową lokalizacją przedmiotu.
                                </p>
                            )}
                        {form.data.needs_packing && (
                            <Alert
                                type="info"
                                showIcon
                                title="Pomieszczenie jest aktualnym miejscem przedmiotu. Szczegółowe położenie zostanie ustawione po spakowaniu."
                                className="mb-5!"
                            />
                        )}
                        {!form.data.needs_packing && (
                            <Form.Item
                                label="Położenie szczegółowe"
                                validateStatus={
                                    form.errors.placement ? 'error' : ''
                                }
                                help={form.errors.placement}
                                extra="Np. półka środkowa lub szuflada z narzędziami."
                                className="mb-0!"
                            >
                                <Input
                                    size="large"
                                    prefix={<EnvironmentOutlined />}
                                    placeholder="Opisz dokładne położenie"
                                    value={form.data.placement}
                                    onChange={(event) => {
                                        form.setData(
                                            'placement',
                                            event.target.value,
                                        );
                                        form.clearErrors('placement');
                                    }}
                                    className="bg-tertiary!"
                                />
                            </Form.Item>
                        )}
                    </>
                )}
            </SectionCard>

            <Modal
                title="Zeskanuj kod QR lokalizacji"
                open={scannerOpen}
                onCancel={() => {
                    setScannerOpen(false);
                    setManualCode('');
                    setScanError('');
                }}
                centered
                width={600}
                footer={
                    <Button
                        type="secondary"
                        htmlType="button"
                        size="small"
                        onClick={() => {
                            setScannerOpen(false);
                            setManualCode('');
                            setScanError('');
                        }}
                    >
                        Anuluj
                    </Button>
                }
            >
                <div className="relative overflow-hidden rounded-xl bg-secondary">
                    {scannerOpen && (
                        <Scanner
                            formats={['qr_code']}
                            constraints={{ facingMode: 'environment' }}
                            components={{ finder: true, torch: false }}
                            sound={false}
                            onScan={(codes) => {
                                if (codes[0]?.rawValue) {
                                    selectScannedPlace(codes[0].rawValue);
                                }
                            }}
                            onError={() =>
                                setScanError(
                                    'Nie udało się uruchomić aparatu. Możesz wkleić adres z kodu ręcznie.',
                                )
                            }
                        />
                    )}
                    <p className="pointer-events-none absolute right-0 bottom-4 left-0 text-center text-sm font-medium text-(--white)">
                        Skieruj aparat na etykietę lokalizacji
                    </p>
                </div>
                {scanError && (
                    <Alert type="error" title={scanError} className="mt-4!" />
                )}
                <div className="mt-5 flex gap-2">
                    <Input
                        size="large"
                        value={manualCode}
                        onChange={(event) => setManualCode(event.target.value)}
                        onPressEnter={() => selectScannedPlace(manualCode)}
                        placeholder="Wklej adres QR, np. /places/42"
                        aria-label="Adres z kodu QR lokalizacji"
                    />
                    <Button
                        type="primary"
                        htmlType="button"
                        size="small"
                        disabled={!manualCode.trim()}
                        onClick={() => selectScannedPlace(manualCode)}
                    >
                        Wybierz
                    </Button>
                </div>
            </Modal>
        </>
    );
}
