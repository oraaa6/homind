import { PrinterOutlined } from '@ant-design/icons';
import Button from '@/components/Button';
import LabelPreview from '@/components/places/label-preview';
import SurfaceBox from '@/components/surface-box';
import { usePrintPlaceLabel } from '@/hooks/use-print-place-label';
import type { Thing, ThingDetails } from '@/pages/things/types';

export default function StorageCard({
    item,
    details,
}: {
    item: Thing;
    details: ThingDetails;
}) {
    const printLabel = usePrintPlaceLabel(
        details.locationCode,
        details.place || details.room,
    );

    return (
        <div className="min-w-0">
            {details.locationHasQr && (
                <div className="space-y-3">
                    <LabelPreview
                        identifier={details.locationCode}
                        name={details.place || details.room}
                        room={details.room}
                        kind={item.placeKind}
                        value={details.locationUrl}
                    />
                    <Button
                        type="text"
                        size="small"
                        icon={<PrinterOutlined />}
                        onClick={printLabel}
                    >
                        Drukuj etykietę
                    </Button>
                </div>
            )}
            <SurfaceBox className={details.locationHasQr ? 'mt-4' : undefined}>
                <p className="text-sm text-(--button-text)">
                    Identyfikator przedmiotu
                </p>
                <p className="text-xl font-semibold text-primary">#{item.id}</p>
            </SurfaceBox>
        </div>
    );
}
