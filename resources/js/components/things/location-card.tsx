import { EnvironmentOutlined } from '@ant-design/icons';
import SectionCard from '@/components/section-card';
import type { ThingDetails } from '@/pages/things/data';

export default function LocationCard({ details }: { details: ThingDetails }) {
    return (
        <SectionCard
            title={
                <>
                    <EnvironmentOutlined aria-hidden="true" />
                    Lokalizacja przedmiotu
                </>
            }
            titleClassName="text-primary"
            extra={
                <span className="text-xs font-semibold tracking-wide text-(--button-text) uppercase">
                    Stałe miejsce
                </span>
            }
        >
            <div className="rounded-xl bg-tertiary p-5 sm:p-6">
                <p className="mb-3 text-xs font-semibold tracking-wide text-(--button-text) uppercase">
                    Ścieżka składowania
                </p>
                <p className="text-lg font-semibold text-foreground sm:text-2xl">
                    {details.room}
                    {details.place && (
                        <>
                            {' '}
                            <span className="text-(--button-text)">›</span>{' '}
                            <span className="text-primary">
                                {details.place}
                            </span>
                        </>
                    )}
                </p>
                {details.placementNote && (
                    <p className="mt-4 text-sm text-(--button-text) sm:text-base">
                        {details.placementNote}
                    </p>
                )}
            </div>
        </SectionCard>
    );
}
