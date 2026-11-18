import {
    CaretRightOutlined,
    CheckOutlined,
    DeleteOutlined,
    EditOutlined,
    EllipsisOutlined,
    ForwardOutlined,
    InboxOutlined,
    PauseOutlined,
    UndoOutlined,
} from '@ant-design/icons';
import { router } from '@inertiajs/react';
import type { MenuProps } from 'antd';
import { Dropdown, message } from 'antd';
import { useState } from 'react';
import Button from '@/components/Button';
import RoutineDeleteModal from '@/components/routines/routine-delete-modal';
import type { Routine, RoutineAction } from '@/pages/routines/types';
import { RoutineState } from '@/pages/routines/types';
import { edit } from '@/routes/routines';
import { update as updateState } from '@/routes/routines/state';

export default function RoutineActions({
    routine,
    onAction,
}: {
    routine: Routine;
    onAction: (type: RoutineAction | null) => void;
}) {
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const active = routine.state === RoutineState.Active;
    const archived = routine.state === RoutineState.Archived;
    const changeState = (state: RoutineState) => {
        onAction(null);

        router.patch(
            updateState(routine.id).url,
            { state, version: routine.version },
            {
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onFinish: () => setProcessing(false),
                onError: (errors) =>
                    message.error(
                        Object.values(errors)[0] ??
                            'Nie udało się zmienić stanu rutyny.',
                    ),
                onSuccess: () =>
                    message.success(
                        state === RoutineState.Paused
                            ? 'Rutyna została wstrzymana.'
                            : state === RoutineState.Archived
                              ? 'Rutyna trafiła do archiwum. Historia została zachowana.'
                              : 'Rutyna jest aktywna. Wyznaczono kolejny termin.',
                    ),
            },
        );
    };

    const items: MenuProps['items'] = [
        {
            key: active ? 'complete' : archived ? 'restore' : 'resume',
            label: active
                ? 'Oznacz jako wykonane'
                : archived
                  ? 'Przywróć z archiwum'
                  : 'Wznów',
            icon: active ? (
                <CheckOutlined />
            ) : archived ? (
                <UndoOutlined />
            ) : (
                <CaretRightOutlined />
            ),
            onClick: () =>
                active
                    ? onAction('completed')
                    : changeState(RoutineState.Active),
        },
        {
            key: 'edit',
            label: 'Edytuj',
            icon: <EditOutlined />,
            onClick: () => router.visit(edit(routine.id).url),
        },
    ];

    if (active) {
        items.push(
            {
                key: 'skip',
                label: 'Pomiń ten termin',
                icon: <ForwardOutlined />,
                onClick: () => onAction('skipped'),
            },
            {
                key: 'pause',
                label: 'Wstrzymaj',
                icon: <PauseOutlined />,
                onClick: () => changeState(RoutineState.Paused),
            },
        );
    }

    if (!archived) {
        items.push({
            key: 'archive',
            label: 'Archiwizuj',
            icon: <InboxOutlined />,
            onClick: () => changeState(RoutineState.Archived),
        });
    }

    items.push({
        key: 'delete',
        label: 'Usuń',
        icon: <DeleteOutlined />,
        onClick: () => setDeleteOpen(true),
    });

    return (
        <>
            <Dropdown
                disabled={processing}
                menu={{ items }}
                trigger={['click']}
                placement="bottomRight"
            >
                <Button
                    type="primary"
                    loading={processing}
                    size="small"
                    shape="circle"
                    icon={<EllipsisOutlined />}
                    aria-label="Więcej opcji rutyny"
                    title="Więcej opcji rutyny"
                />
            </Dropdown>
            {deleteOpen && (
                <RoutineDeleteModal
                    routine={routine}
                    onClose={() => setDeleteOpen(false)}
                />
            )}
        </>
    );
}
