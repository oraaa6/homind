import { Empty } from 'antd';
import { useState } from 'react';
import ActivityList from '@/components/activity-list';
import Button from '@/components/Button';
import RoutineUndoModal from '@/components/routines/routine-undo-modal';
import SectionCard from '@/components/section-card';
import type { Routine } from '@/pages/routines/types';
import {
    formatRoutineDate,
    getRoutineDelayDays,
    isRoutineTermEntry,
} from '@/pages/routines/utils';
import type { ActivityEntry } from '@/types/activity';

const stateHistoryLabels = {
    paused: { title: 'Rutyna wstrzymana', dateLabel: 'Wstrzymano' },
    resumed: { title: 'Rutyna wznowiona', dateLabel: 'Wznowiono' },
    archived: { title: 'Rutyna zarchiwizowana', dateLabel: 'Zarchiwizowano' },
    restored: {
        title: 'Rutyna przywrócona z archiwum',
        dateLabel: 'Przywrócono',
    },
};

export default function RoutineHistory({ routine }: { routine: Routine }) {
    const [undoEntryId, setUndoEntryId] = useState<string | null>(null);
    const lastEntry = routine.history.find(
        (entry) => isRoutineTermEntry(entry) && !entry.cancelledAt,
    );
    const undoEntry = routine.history.find(
        (entry) => isRoutineTermEntry(entry) && entry.id === undoEntryId,
    );
    const entries: ActivityEntry[] = [...routine.history]
        .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))
        .map((entry) => {
            if (
                entry.type === 'paused' ||
                entry.type === 'resumed' ||
                entry.type === 'archived' ||
                entry.type === 'restored'
            ) {
                return {
                    id: entry.id,
                    type: entry.type,
                    ...stateHistoryLabels[entry.type],
                    date: entry.actionAt,
                    author: entry.author.name,
                    description:
                        entry.type === 'resumed' || entry.type === 'restored'
                            ? `Kolejny termin: ${formatRoutineDate(entry.scheduledFor)}`
                            : null,
                };
            }

            const delay = getRoutineDelayDays(
                entry.scheduledFor,
                entry.actionAt,
            );
            const completed = entry.type === 'completed';

            return {
                id: entry.id,
                type: entry.cancelledAt ? 'deleted' : entry.type,
                title: entry.cancelledAt
                    ? completed
                        ? 'Wykonanie cofnięte'
                        : 'Pominięcie cofnięte'
                    : completed
                      ? 'Rutyna wykonana'
                      : 'Termin pominięty',
                date: entry.actionAt,
                dateLabel: completed ? 'Wykonano' : 'Pominięto',
                author: entry.author.name,
                description: [
                    `Planowany termin: ${formatRoutineDate(entry.scheduledFor)}`,
                    !entry.cancelledAt && completed && delay > 0
                        ? `Opóźnienie: ${delay} ${delay === 1 ? 'dzień' : 'dni'}`
                        : '',
                    entry.notes,
                    entry.cancelledBy
                        ? `Wpis cofnięto: ${entry.cancelledBy.name}.`
                        : '',
                ]
                    .filter(Boolean)
                    .join('\n'),
            };
        });

    return (
        <>
            <SectionCard
                title="Historia rutyny"
                description="Wykonania, pominięte terminy i zmiany stanu rutyny — od najnowszego wpisu."
            >
                {entries.length ? (
                    <ActivityList
                        hasMore={false}
                        entries={entries}
                        dateOnly
                        renderActions={(activity) => {
                            if (activity.id !== lastEntry?.id) {
                                return null;
                            }

                            return (
                                <Button
                                    type="ghost"
                                    size="small"
                                    onClick={() => setUndoEntryId(lastEntry.id)}
                                >
                                    Cofnij
                                </Button>
                            );
                        }}
                    />
                ) : (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Ta rutyna nie ma jeszcze historii."
                    />
                )}
            </SectionCard>
            {undoEntry && (
                <RoutineUndoModal
                    routine={routine}
                    entry={undoEntry}
                    onClose={() => setUndoEntryId(null)}
                />
            )}
        </>
    );
}
