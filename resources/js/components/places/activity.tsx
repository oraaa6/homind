import { Empty } from 'antd';
import ActivityList from '@/components/activity-list';
import SectionCard from '@/components/section-card';
import type { PlaceActivity } from '@/pages/places/types';

export default function PlaceActivityCard({
    history,
    historyCount,
    historyHasMore,
}: {
    history: PlaceActivity[];
    historyCount: number;
    historyHasMore: boolean;
}) {
    return (
        <SectionCard
            title="Historia i aktywność"
            extra={
                <span className="text-xs text-(--button-text)">
                    Liczba wpisów: {historyCount}
                </span>
            }
        >
            {history.length ? (
                <ActivityList entries={history} hasMore={historyHasMore} />
            ) : (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Brak zarejestrowanej aktywności"
                />
            )}
        </SectionCard>
    );
}
