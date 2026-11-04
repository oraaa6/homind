import {
    ExportOutlined,
    PlusCircleOutlined,
    QrcodeOutlined,
} from '@ant-design/icons';
import { message, Timeline } from 'antd';
import Button from '@/components/Button';
import SectionCard from '@/components/section-card';
import type { PlaceActivity } from '@/pages/places/data';

const activityIcons = {
    added: PlusCircleOutlined,
    moved: ExportOutlined,
    created: QrcodeOutlined,
};

const dateFormatter = new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'short',
    timeStyle: 'short',
});

export default function PlaceActivityCard({
    history,
}: {
    history: PlaceActivity[];
}) {
    return (
        <SectionCard
            title="Historia i aktywność"
            extra={
                <span className="text-xs text-(--button-text)">
                    Liczba wpisów: {history.length}
                </span>
            }
        >
            <Timeline
                items={history.map((entry) => {
                    const Icon = activityIcons[entry.type];

                    return {
                        key: `${entry.date}-${entry.type}`,
                        icon: <Icon className="text-primary" />,
                        title: (
                            <span className="text-sm font-medium text-foreground">
                                {entry.title}
                            </span>
                        ),
                        content: (
                            <p className="text-xs text-(--button-text)">
                                <time dateTime={entry.date}>
                                    {dateFormatter.format(new Date(entry.date))}
                                </time>{' '}
                                przez {entry.author}
                            </p>
                        ),
                    };
                })}
            />
            <Button
                type="text"
                size="small"
                className="h-auto! w-full whitespace-normal!"
                onClick={() =>
                    message.info(
                        'Pełny rejestr zdarzeń będzie dostępny po podłączeniu backendu.',
                    )
                }
            >
                Zobacz pełny rejestr zdarzeń ({history.length})
            </Button>
        </SectionCard>
    );
}
