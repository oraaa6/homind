import {
    DeleteOutlined,
    DownOutlined,
    EditOutlined,
    EnvironmentOutlined,
    ExportOutlined,
    PlusCircleOutlined,
    CheckCircleOutlined,
    ForwardOutlined,
    PauseCircleOutlined,
    PlayCircleOutlined,
    InboxOutlined,
    UndoOutlined,
} from '@ant-design/icons';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import Button from '@/components/Button';
import type { ActivityEntry } from '@/types/activity';

const activityIcons = {
    added: PlusCircleOutlined,
    moved: ExportOutlined,
    created: EnvironmentOutlined,
    updated: EditOutlined,
    deleted: DeleteOutlined,
    completed: CheckCircleOutlined,
    skipped: ForwardOutlined,
    paused: PauseCircleOutlined,
    resumed: PlayCircleOutlined,
    archived: InboxOutlined,
    restored: UndoOutlined,
};

const dateFormatter = new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'short',
    timeStyle: 'short',
});

const dateOnlyFormatter = new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'short',
});

export type { ActivityEntry } from '@/types/activity';

export default function ActivityList({
    entries,
    hasMore,
    dateOnly = false,
    renderActions,
}: {
    entries: ActivityEntry[];
    hasMore: boolean;
    dateOnly?: boolean;
    renderActions?: (entry: ActivityEntry) => ReactNode;
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
                                <div className="flex items-start justify-between gap-3">
                                    <p className="min-w-0 flex-1 text-sm font-medium wrap-break-word text-foreground sm:text-base">
                                        {entry.title}
                                    </p>
                                    {renderActions && (
                                        <div className="shrink-0">
                                            {renderActions(entry)}
                                        </div>
                                    )}
                                </div>
                                {entry.description && (
                                    <p className="mt-1 text-sm wrap-break-word whitespace-pre-line text-(--button-text)">
                                        {entry.description}
                                    </p>
                                )}
                                <p className="mt-1 text-xs text-(--button-text)">
                                    <time dateTime={entry.date}>
                                        {entry.dateLabel &&
                                            `${entry.dateLabel}: `}
                                        {(dateOnly
                                            ? dateOnlyFormatter
                                            : dateFormatter
                                        ).format(
                                            new Date(
                                                entry.date.length === 10
                                                    ? `${entry.date}T00:00:00`
                                                    : entry.date,
                                            ),
                                        )}
                                    </time>
                                    {entry.author && ` przez ${entry.author}`}
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
