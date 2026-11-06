import { PrinterOutlined } from '@ant-design/icons';
import Button from '@/components/Button';
import LabelPreview from '@/components/places/label-preview';
import { usePrintPlaceLabel } from '@/hooks/use-print-place-label';
import SectionCard from '@/components/section-card';
import type { Thing, ThingDetails } from '@/pages/things/data';

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
        <SectionCard
            as="aside"
            title="Miejsce składowania"
            className="min-w-0 xl:self-start"
        >
            {details.locationHasQr ? (
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
            ) : (
                <div className="rounded-xl bg-tertiary p-5 text-sm text-(--button-text)">
                    Ta lokalizacja nie ma etykiety QR.
                </div>
            )}
            <div className="mt-4 rounded-xl bg-tertiary p-4">
                <p className="text-sm text-(--button-text)">
                    Identyfikator przedmiotu
                </p>
                <p className="text-xl font-semibold text-primary">#{item.id}</p>
            </div>
        </SectionCard>
    );
}
