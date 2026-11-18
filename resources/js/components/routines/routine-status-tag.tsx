import { Tag } from 'antd';
import type { Routine } from '@/pages/routines/types';
import { routineStatusColors } from '@/pages/routines/types';
import { getRoutineStatus } from '@/pages/routines/utils';

export default function RoutineStatusTag({
    routine,
}: {
    routine: Pick<Routine, 'state' | 'nextDueAt'>;
}) {
    const status = getRoutineStatus(routine);

    return (
        <Tag
            color={routineStatusColors[status]}
            className="m-0! rounded-full! px-3! py-1! font-semibold!"
        >
            {status}
        </Tag>
    );
}
