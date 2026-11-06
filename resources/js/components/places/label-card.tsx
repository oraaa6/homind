import {
    QrcodeOutlined,
    PrinterOutlined,
    ReloadOutlined,
    ShareAltOutlined,
} from '@ant-design/icons';
import { message } from 'antd';
import Button from '@/components/Button';
import SectionCard from '@/components/section-card';
import { usePrintPlaceLabel } from '@/hooks/use-print-place-label';
import type { Place } from '@/pages/places/data';
import LabelPreview from './label-preview';

export default function PlaceLabelCard({
    place,
    room,
    url,
}: {
    place: Place;
    room?: string;
    url: string;
}) {
    const printLabel = usePrintPlaceLabel(place.id, place.name);

    return (
        <SectionCard
            as="aside"
            title="Fizyczny tag QR"
            description="Etykieta samoprzylepna"
            className="w-full min-w-0"
        >
            <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] lg:items-center lg:gap-8">
                <div className="min-w-0">
                    <LabelPreview
                        identifier={place.qrCode ?? place.id}
                        name={place.name}
                        room={room}
                        kind={place.kind}
                        value={url}
                    />
                </div>
                <div className="flex min-w-0 flex-col gap-5 rounded-2xl bg-tertiary p-4 sm:p-6">
                    <div className="flex items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-lg text-primary">
                            <QrcodeOutlined aria-hidden="true" />
                        </span>
                        <div>
                            <h4 className="font-semibold text-foreground">
                                Gotowa do wydruku
                            </h4>
                            <p className="mt-1 text-sm text-(--button-text)">
                                Zeskanowanie etykiety aparatem otwiera tę
                                lokalizację w Homind.
                            </p>
                        </div>
                    </div>
                    <Button
                        type="primary"
                        size="small"
                        icon={<PrinterOutlined />}
                        className="h-auto! min-h-9 w-full! py-2! whitespace-normal!"
                        onClick={printLabel}
                    >
                        Drukuj etykietę (50×30 mm)
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            type="secondary"
                            size="small"
                            icon={<ReloadOutlined />}
                            className="h-auto! min-h-9 py-2! whitespace-normal!"
                            onClick={() =>
                                message.info(
                                    'Generowanie nowego kodu będzie dostępne po podłączeniu backendu.',
                                )
                            }
                        >
                            Nowy kod
                        </Button>
                        <Button
                            type="secondary"
                            size="small"
                            icon={<ShareAltOutlined />}
                            className="h-auto! min-h-9 py-2! whitespace-normal!"
                            onClick={async () => {
                                try {
                                    await navigator.clipboard.writeText(url);
                                    message.success(
                                        'Skopiowano link do lokalizacji.',
                                    );
                                } catch {
                                    message.error(
                                        'Nie udało się skopiować linku. Skopiuj adres z paska przeglądarki.',
                                    );
                                }
                            }}
                        >
                            Udostępnij
                        </Button>
                    </div>
                </div>
            </div>
        </SectionCard>
    );
}
