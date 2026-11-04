import {
    DownloadOutlined,
    ReloadOutlined,
    ShareAltOutlined,
} from '@ant-design/icons';
import { message } from 'antd';
import Button from '@/components/Button';
import SectionCard from '@/components/section-card';
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
    return (
        <SectionCard
            as="aside"
            title="Fizyczny tag QR"
            description="Etykieta samoprzylepna"
            className="min-w-0"
        >
            <LabelPreview
                identifier={place.qrCode ?? place.id}
                name={place.name}
                room={room}
                kind={place.kind}
                value={url}
            />
            <p className="mt-3 text-xs text-(--button-text)">
                Skan aparatem otwiera bezpośredni podgląd zawartości w Homind.
            </p>
            <div className="mt-5 flex flex-col gap-2">
                <Button
                    type="primary"
                    size="small"
                    icon={<DownloadOutlined />}
                    className="h-auto! min-h-9 py-2! whitespace-normal!"
                    onClick={() =>
                        message.info(
                            'Pobieranie etykiety PDF będzie dostępne po podłączeniu backendu.',
                        )
                    }
                >
                    Pobierz etykietę PDF (50×30 mm)
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
                        Generuj nowy kod
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
        </SectionCard>
    );
}
