import { Empty } from 'antd';
import type { ActivityEntry } from '@/components/activity-list';
import ActivityList from '@/components/activity-list';
import SectionCard from '@/components/section-card';

export default function LocationHistory({
    history,
    historyCount,
    historyHasMore,
}: {
    history: ActivityEntry[];
    historyCount: number;
    historyHasMore: boolean;
}) {
    return (
        <SectionCard
            title={'Historia przedmiotu'}
            extra={
                <span className="shrink-0 text-sm text-(--button-text)">
                    Liczba wpisów: {historyCount}
                </span>
            }
        >
            {history.length ? (
                <ActivityList entries={history} hasMore={historyHasMore} />
            ) : (
                <Empty description="Brak historii przedmiotu" />
            )}
        </SectionCard>
    );
}
