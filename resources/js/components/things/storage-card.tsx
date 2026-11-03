import Button from '@/components/Button';
import SectionCard from '@/components/section-card';
import type { Thing, ThingDetails } from '@/pages/things/data';
import { PrinterOutlined } from '@ant-design/icons';
import { message, QRCode } from 'antd';

export default function StorageCard({
    item,
    details,
}: {
    item: Thing;
    details: ThingDetails;
}) {
    return (
        <SectionCard
            as="aside"
            title="Miejsce składowania"
            className="min-w-0 xl:self-start"
        >
            <div className="flex flex-col items-center rounded-xl bg-tertiary p-5 text-center">
                <div className="rounded-xl bg-(--white) p-3 shadow-sm">
                    <QRCode
                        value={details.locationCode}
                        size={160}
                        bordered={false}
                        color="var(--text-primary)"
                        bgColor="var(--white)"
                    />
                </div>
                <p className="mt-4 text-xs font-semibold tracking-wide text-(--button-text) uppercase">
                    Kod QR miejsca: {details.locationCode}
                </p>
                <Button
                    type="text"
                    size="small"
                    icon={<PrinterOutlined />}
                    onClick={() =>
                        message.info(
                            'Drukowanie etykiety będzie dostępne wkrótce.',
                        )
                    }
                >
                    Drukuj etykietę strefy
                </Button>
            </div>
            <div className="mt-4 rounded-xl bg-tertiary p-4">
                <p className="text-sm text-(--button-text)">
                    Identyfikator przedmiotu
                </p>
                <p className="text-xl font-semibold text-primary">#{item.id}</p>
            </div>
            {details.serialNumber && (
                <div className="mt-3 rounded-xl bg-tertiary p-4">
                    <p className="text-sm text-(--button-text)">
                        Numer seryjny
                    </p>
                    <p className="font-semibold break-all text-foreground">
                        {details.serialNumber}
                    </p>
                </div>
            )}
        </SectionCard>
    );
}
