import { Tag } from 'antd';
import clsx from 'clsx';
import SectionCard from '@/components/section-card';
import SurfaceBox from '@/components/surface-box';
import type { Thing, ThingDetails } from '@/pages/things/types';
import StorageCard from './storage-card';

export default function LocationCard({
    item,
    details,
}: {
    item: Thing;
    details: ThingDetails;
}) {
    return (
        <SectionCard
            title={'Lokalizacja przedmiotu'}
            extra={
                item.needsPacking ? (
                    <Tag color="red">Do spakowania</Tag>
                ) : (
                    <span className="text-xs font-semibold tracking-wide text-(--button-text) uppercase">
                        Stałe miejsce
                    </span>
                )
            }
        >
            <div
                className={clsx(
                    'grid min-w-0 items-start',
                    details.locationHasQr ? 'gap-5 lg:gap-7' : 'gap-2 lg:gap-3',
                )}
            >
                <SurfaceBox>
                    <p className="mb-3 text-xs font-semibold tracking-wide text-(--button-text) uppercase">
                        Ścieżka składowania
                    </p>
                    <p className="text-lg font-semibold text-foreground sm:text-2xl">
                        {details.room}
                        {details.place && (
                            <>
                                {' '}
                                <span className="text-(--button-text)">
                                    ›
                                </span>{' '}
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
                </SurfaceBox>
                <StorageCard item={item} details={details} />
            </div>
        </SectionCard>
    );
}
