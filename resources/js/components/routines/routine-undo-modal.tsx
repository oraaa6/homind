import { CalendarOutlined, UndoOutlined } from '@ant-design/icons';
import { useForm } from '@inertiajs/react';
import { Alert, message, Modal } from 'antd';
import Button from '@/components/Button';
import SurfaceBox from '@/components/surface-box';
import type { Routine, RoutineHistoryEntry } from '@/pages/routines/types';
import { formatRoutineDate } from '@/pages/routines/utils';
import { undo as undoAction } from '@/routes/routines/actions';

export default function RoutineUndoModal({
    routine,
    entry,
    onClose,
}: {
    routine: Routine;
    entry: RoutineHistoryEntry;
    onClose: () => void;
}) {
    const form = useForm({ version: routine.version });
    const undo = () => {
        form.patch(undoAction([routine.id, entry.id]).url, {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
                message.success('Ostatni wpis został cofnięty.');
            },
        });
    };

    return (
        <Modal
            open
            centered
            width={720}
            onCancel={onClose}
            title={
                <div>
                    <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
                        {entry.type === 'completed'
                            ? 'Cofnij ostatnie wykonanie'
                            : 'Cofnij ostatnie pominięcie'}
                    </h2>
                    <p className="mt-2 text-sm font-normal text-(--button-text) sm:text-base">
                        Rutyna: <strong>{routine.name}</strong>
                    </p>
                </div>
            }
            footer={
                <div className="flex flex-wrap justify-end gap-2">
                    <Button
                        type="secondary"
                        size="small"
                        onClick={onClose}
                        disabled={form.processing}
                    >
                        Anuluj
                    </Button>
                    <Button
                        type="primary"
                        size="small"
                        icon={<UndoOutlined />}
                        onClick={undo}
                        loading={form.processing}
                    >
                        Cofnij
                    </Button>
                </div>
            }
            destroyOnHidden
        >
            {Object.values(form.errors)[0] && (
                <Alert
                    type="error"
                    showIcon
                    className="mt-5"
                    title={Object.values(form.errors)[0]}
                />
            )}
            <SurfaceBox className="my-5 flex flex-wrap items-center gap-2 text-sm text-(--button-text) sm:text-base">
                <CalendarOutlined className="text-primary" aria-hidden="true" />
                <span>Wpis z:</span>
                <strong className="text-foreground">
                    {formatRoutineDate(entry.actionAt)}
                </strong>
            </SurfaceBox>
            <p className="mb-5 text-sm text-(--button-text) sm:text-base">
                Przywrócimy poprzedni termin. Wpis pozostanie w historii jako
                cofnięty.
            </p>
        </Modal>
    );
}
