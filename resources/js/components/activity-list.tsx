import {
    DeleteOutlined,
    DownOutlined,
    EditOutlined,
    EnvironmentOutlined,
    ExportOutlined,
    PlusCircleOutlined,
} from '@ant-design/icons';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import Button from '@/components/Button';
import type { ActivityEntry } from '@/types/activity';

const activityIcons = {
    added: PlusCircleOutlined,
    moved: ExportOutlined,
    created: EnvironmentOutlined,
    updated: EditOutlined,
    deleted: DeleteOutlined,
};

const dateFormatter = new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'short',
    timeStyle: 'short',
});

export type { ActivityEntry } from '@/types/activity';

export default function ActivityList({
    entries,
    hasMore,
}: {
    entries: ActivityEntry[];
    hasMore: boolean;
}) {
    const [loading, setLoading] = useState(false);

    return (
        <>
            <ol className="flex flex-col">
                {entries.map((entry, index) => {
                    const Icon = activityIcons[entry.type];

                    return (
                        <li
                            key={entry.id}
                            className="relative flex gap-3 pb-5 last:pb-0 sm:gap-4"
                        >
                            <div className="relative flex w-9 shrink-0 justify-center">
                                {index < entries.length - 1 && (
                                    <span className="absolute top-9 bottom-0 w-px bg-neutral/20" />
                                )}
                                <span className="relative z-10 flex size-9 items-center justify-center rounded-full bg-primary-soft text-primary">
                                    <Icon aria-hidden="true" />
                                </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1">
                                <p className="text-sm font-medium wrap-break-word text-foreground sm:text-base">
                                    {entry.title}
                                </p>
                                {entry.description && (
                                    <p className="mt-1 text-sm wrap-break-word text-(--button-text)">
                                        {entry.description}
                                    </p>
                                )}
                                <p className="mt-1 text-xs text-(--button-text)">
                                    <time dateTime={entry.date}>
                                        {dateFormatter.format(
                                            new Date(entry.date),
                                        )}
                                    </time>{' '}
                                    przez {entry.author}
                                </p>
                            </div>
                        </li>
                    );
                })}
            </ol>
            {hasMore && (
                <Button
                    type="text"
                    size="small"
                    icon={<DownOutlined />}
                    loading={loading}
                    className="mt-5"
                    onClick={() => {
                        setLoading(true);
                        router.reload({
                            data: {
                                history_page:
                                    Math.floor(entries.length / 10) + 1,
                            },
                            only: ['history', 'historyHasMore'],
                            preserveUrl: true,
                            onFinish: () => setLoading(false),
                        });
                    }}
                >
                    Pokaż kolejne wpisy
                </Button>
            )}
        </>
    );
}
