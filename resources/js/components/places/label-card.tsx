import {
    PrinterOutlined,
    QrcodeOutlined,
    ReloadOutlined,
    ShareAltOutlined,
} from '@ant-design/icons';
import { useForm } from '@inertiajs/react';
import { message } from 'antd';
import Button from '@/components/Button';
import SectionCard from '@/components/section-card';
import SurfaceBox from '@/components/surface-box';
import { usePrintPlaceLabel } from '@/hooks/use-print-place-label';
import type { Place } from '@/pages/places/types';
import places from '@/routes/places';
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
    const regenerateForm = useForm({});

    return (
        <SectionCard as="aside" title="Kod QR" className="w-full min-w-0">
            <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] lg:gap-8">
                <div className="min-w-0">
                    <LabelPreview
                        identifier={place.qrCode ?? place.id}
                        name={place.name}
                        room={room}
                        kind={place.kind}
                        value={url}
                    />
                </div>
                <SurfaceBox className="flex h-full flex-col justify-center gap-5">
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
                            type="ghost"
                            size="small"
                            icon={<ReloadOutlined />}
                            className="h-auto! min-h-9 py-2! whitespace-normal!"
                            loading={regenerateForm.processing}
                            disabled={regenerateForm.processing}
                            onClick={() =>
                                regenerateForm.patch(
                                    places.identifier.regenerate(place.slug)
                                        .url,
                                    {
                                        preserveScroll: true,
                                        onSuccess: () =>
                                            message.success(
                                                'Wygenerowano nowy kod etykiety.',
                                            ),
                                        onError: () =>
                                            message.error(
                                                'Nie udało się wygenerować nowego kodu.',
                                            ),
                                    },
                                )
                            }
                        >
                            Nowy kod
                        </Button>
                        <Button
                            type="ghost"
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
                            Skopiuj link
                        </Button>
                    </div>
                </SurfaceBox>
            </div>
        </SectionCard>
    );
}
