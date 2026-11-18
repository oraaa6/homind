import { DeleteOutlined } from '@ant-design/icons';
import { useForm } from '@inertiajs/react';
import { Alert, message, Modal } from 'antd';
import Button from '@/components/Button';
import type { Routine } from '@/pages/routines/types';
import { destroy } from '@/routes/routines';

export default function RoutineDeleteModal({
    routine,
    onClose,
}: {
    routine: Routine;
    onClose: () => void;
}) {
    const form = useForm({ version: routine.version });
    const remove = () => {
        form.delete(destroy(routine.id).url, {
            onSuccess: () => {
                onClose();
                message.success('Rutyna została usunięta.');
            },
        });
    };

    return (
        <Modal
            open
            centered
            width={720}
            onCancel={onClose}
            closable={!form.processing}
            mask={{ closable: !form.processing }}
            keyboard={!form.processing}
            title={
                <div>
                    <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
                        Usuń rutynę
                    </h2>
                    <p className="mt-2 text-sm font-normal text-(--button-text) sm:text-base">
                        Rutyna: <strong>{routine.name}</strong>
                    </p>
                </div>
            }
            footer={
                <div className="flex flex-wrap justify-end gap-2">
                    <Button
                        type="text"
                        size="small"
                        onClick={onClose}
                        disabled={form.processing}
                    >
                        Anuluj
                    </Button>
                    <Button
                        type="primary"
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={remove}
                        loading={form.processing}
                    >
                        Usuń rutynę
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
            <p className="my-5 text-sm text-(--button-text) sm:text-base">
                Rutyna i cała jej historia zostaną trwale usunięte. Tej operacji
                nie można cofnąć.
            </p>
        </Modal>
    );
}
