import { Head } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import RoutineActionModal from '@/components/routines/routine-action-modal';
import RoutineActions from '@/components/routines/routine-actions';
import RoutineHistory from '@/components/routines/routine-history';
import RoutineInformation from '@/components/routines/routine-information';
import RoutineNotFound from '@/components/routines/routine-not-found';
import { routines as routinesRoute } from '@/routes';
import type { Routine, RoutineAction } from './types';
import { RoutineState } from './types';

export default function RoutineShow({ routine }: { routine: Routine | null }) {
    const [action, setAction] = useState<RoutineAction | null>(null);

    if (!routine) {
        return <RoutineNotFound />;
    }

    return (
        <>
            <Head title={routine.name} />
            <Heading
                title={routine.name}
                description="Szczegóły rutyny, nadchodzący termin i historia wykonania."
                backLink={{ href: routinesRoute().url, label: 'Wróć' }}
                actions={
                    <RoutineActions routine={routine} onAction={setAction} />
                }
            />
            <div className="flex flex-col gap-5 sm:gap-7">
                <RoutineInformation routine={routine} />
                <RoutineHistory routine={routine} />
            </div>
            {action && routine.state === RoutineState.Active && (
                <RoutineActionModal
                    key={action}
                    routine={routine}
                    type={action}
                    onClose={() => setAction(null)}
                />
            )}
        </>
    );
}

RoutineShow.layout = {
    breadcrumbs: [{ title: 'Rutyny', href: routinesRoute() }],
};
