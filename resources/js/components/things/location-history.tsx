import { HistoryOutlined } from '@ant-design/icons';
import { Empty } from 'antd';
import SectionCard from '@/components/section-card';
import type { ThingDetails } from '@/pages/things/data';

export default function LocationHistory({
    history,
}: {
    history: ThingDetails['history'];
}) {
    return (
        <SectionCard
            title={
                <>
                    <HistoryOutlined
                        className="text-primary"
                        aria-hidden="true"
                    />
                    Historia lokalizacji
                </>
            }
            extra={
                <span className="shrink-0 text-sm text-(--button-text)">
                    Liczba wpisów: {history.length}
                </span>
            }
        >
            {history.length === 0 ? (
                <Empty description="Brak historii lokalizacji" />
            ) : (
                <div className="flex flex-col gap-3">
                    {history.map((entry) => (
                        <div
                            key={entry.id}
                            className="flex flex-col gap-2 rounded-xl bg-tertiary p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div className="min-w-0">
                                <p className="font-medium text-foreground">
                                    {entry.location}
                                </p>
                                <p className="text-sm text-(--button-text)">
                                    {entry.description}
                                </p>
                            </div>
                            <time
                                dateTime={entry.date}
                                className="shrink-0 text-sm text-(--button-text)"
                            >
                                {new Intl.DateTimeFormat('pl-PL').format(
                                    new Date(`${entry.date}T12:00:00`),
                                )}
                            </time>
                        </div>
                    ))}
                </div>
            )}
        </SectionCard>
    );
}
