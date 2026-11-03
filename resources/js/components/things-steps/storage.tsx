import { QrcodeOutlined } from '@ant-design/icons';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Alert, Checkbox, Form, Input, Modal, Radio, Select } from 'antd';
import clsx from 'clsx';
import { useState } from 'react';
import Button from '@/components/Button';
import SectionCard from '@/components/section-card';
import type { ThingFormState } from '@/pages/things/form-types';

const boxOptions = [
    {
        value: 'BOX-01',
        label: '#BOX-01 Narzędzia warsztatowe (Pojemnik L-BOXX)',
    },
    { value: 'BOX-02', label: '#BOX-02 Akcesoria i śruby' },
    { value: 'BOX-03', label: '#BOX-03 Elektronika' },
];

export default function StorageStep({ form }: { form: ThingFormState }) {
    const [scannerOpen, setScannerOpen] = useState(false);
    const [manualCode, setManualCode] = useState('');
    const [scanError, setScanError] = useState('');

    const closeScanner = () => {
        setScannerOpen(false);
        setManualCode('');
        setScanError('');
    };

    const selectScannedBox = (code: string) => {
        const boxId = code
            .trim()
            .match(/BOX-\d+/i)?.[0]
            .toUpperCase();

        if (!boxId || !boxOptions.some((box) => box.value === boxId)) {
            setScanError('Nie znaleziono pudełka o podanym kodzie.');

            return;
        }

        form.setData('boxId', boxId);
        form.clearErrors('boxId');
        closeScanner();
    };

    return (
        <>
            <SectionCard
                number="03"
                title="Typ składowania"
                description="Czy przedmiot znajduje się w oznakowanym pojemniku?"
                className="xl:p-9"
            >
                <Form.Item
                    required
                    validateStatus={form.errors.storage ? 'error' : ''}
                    help={form.errors.storage}
                    className={
                        form.data.storage === 'container' ? 'mb-5!' : 'mb-0!'
                    }
                >
                    <Radio.Group
                        value={form.data.storage}
                        onChange={(event) => {
                            form.setData('storage', event.target.value);
                            form.clearErrors('storage');
                        }}
                        className="grid! w-full grid-cols-1 gap-3 md:grid-cols-2"
                    >
                        <Radio
                            value="standalone"
                            className={clsx(
                                'm-0! flex! rounded-xl border border-transparent p-4! sm:p-5!',
                                form.data.storage === 'standalone'
                                    ? 'border-primary! bg-surface-muted! text-foreground! [&_.ant-radio-inner]:border-(--button-text)! [&_.ant-radio-inner]:bg-(--white)! [&_.ant-radio-inner:after]:bg-(--button-text)!'
                                    : 'bg-tertiary text-foreground!',
                            )}
                        >
                            <span className="flex flex-col gap-1 pl-2">
                                <span className="font-semibold">
                                    Przedmiot wolnostojący
                                </span>
                                <span className="text-sm text-(--button-text)">
                                    Leży bezpośrednio na półce, blacie lub haku
                                </span>
                            </span>
                        </Radio>
                        <Radio
                            value="container"
                            className={clsx(
                                'm-0! flex! rounded-xl border border-transparent p-4! sm:p-5!',
                                form.data.storage === 'container'
                                    ? 'border-primary! bg-surface-muted! text-foreground! [&_.ant-radio-inner]:border-(--button-text)! [&_.ant-radio-inner]:bg-(--white)! [&_.ant-radio-inner:after]:bg-(--button-text)!'
                                    : 'bg-tertiary text-foreground!',
                            )}
                        >
                            <span className="flex flex-col gap-1 pl-2">
                                <span className="font-semibold">
                                    W pudełku / organizerze{' '}
                                    <span className="ml-1 rounded-full bg-(--white) px-2 py-0.5 text-xs text-(--button-text)">
                                        QR Code
                                    </span>
                                </span>
                                <span className="text-sm text-(--button-text)">
                                    Zorganizowany w oznaczonym pojemniku
                                </span>
                            </span>
                        </Radio>
                    </Radio.Group>
                </Form.Item>

                {form.data.storage === 'container' && (
                    <div className="rounded-xl bg-(--white)">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-foreground sm:text-base">
                                Wybierz pudełko docelowe
                            </span>
                            <span className="rounded-full bg-surface-muted px-2.5 py-1 text-xs text-(--button-text)">
                                {boxOptions.length} dostępne pudełka
                            </span>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                            <Form.Item
                                validateStatus={
                                    form.errors.boxId ? 'error' : ''
                                }
                                help={form.errors.boxId}
                                className="mb-0! min-w-0 flex-1"
                            >
                                <Select
                                    aria-label="Wybierz pudełko docelowe"
                                    size="large"
                                    className="w-full"
                                    placeholder="Wybierz pudełko"
                                    options={boxOptions}
                                    value={form.data.boxId || undefined}
                                    disabled={form.data.assignBoxLater}
                                    onChange={(value) => {
                                        form.setData('boxId', value);
                                        form.clearErrors('boxId');
                                    }}
                                />
                            </Form.Item>
                            <Button
                                type="primary"
                                htmlType="button"
                                size="small"
                                icon={<QrcodeOutlined />}
                                disabled={form.data.assignBoxLater}
                                onClick={() => setScannerOpen(true)}
                            >
                                Skanuj QR
                            </Button>
                        </div>
                        <div className="mt-4 border-t border-neutral/20 pt-4">
                            <Checkbox
                                checked={form.data.assignBoxLater}
                                onChange={(event) => {
                                    form.setData({
                                        ...form.data,
                                        assignBoxLater: event.target.checked,
                                        boxId: event.target.checked
                                            ? ''
                                            : form.data.boxId,
                                    });
                                    form.clearErrors('boxId');
                                }}
                            >
                                Przypiszę do pudełka później (dodaj do kolejki{' '}
                                <strong>Do spakowania</strong>)
                            </Checkbox>
                        </div>
                    </div>
                )}
            </SectionCard>
            <Modal
                title="Zeskanuj kod QR pudełka lub regału"
                open={scannerOpen}
                onCancel={closeScanner}
                centered
                width={600}
                footer={
                    <Button
                        type="text"
                        htmlType="button"
                        size="small"
                        onClick={closeScanner}
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
                            onScan={(codes) =>
                                selectScannedBox(codes[0].rawValue)
                            }
                            onError={() =>
                                setScanError(
                                    'Nie udało się uruchomić aparatu. Możesz wpisać kod ręcznie.',
                                )
                            }
                        />
                    )}
                    <p className="pointer-events-none absolute right-0 bottom-4 left-0 text-center text-sm font-medium text-(--white)">
                        Skieruj aparat na kod QR
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
                        onPressEnter={() => selectScannedBox(manualCode)}
                        placeholder="Wpisz kod ręcznie, np. BOX-01"
                        aria-label="Kod pudełka"
                    />
                    <Button
                        type="primary"
                        htmlType="button"
                        onClick={() => selectScannedBox(manualCode)}
                        disabled={!manualCode.trim()}
                        size="small"
                    >
                        Dodaj
                    </Button>
                </div>
            </Modal>
        </>
    );
}
