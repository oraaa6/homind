import { usePage } from '@inertiajs/react';
import RoutineMissedTerms from '@/components/routines/routine-missed-terms';
import RoutineStatusTag from '@/components/routines/routine-status-tag';
import SectionCard from '@/components/section-card';
import SurfaceBox from '@/components/surface-box';
import { routineCategoryLabels } from '@/constants/routine-categories';
import type { Routine } from '@/pages/routines/types';
import { RoutineState } from '@/pages/routines/types';
import {
    formatRoutineDate,
    getLastRoutineCompletion,
    getRoutineMissedTermsCount,
    getRoutineScheduleLabel,
} from '@/pages/routines/utils';
import type { Household } from '@/types/household';

export default function RoutineInformation({ routine }: { routine: Routine }) {
    const { households = [] } = usePage<{ households: Household[] }>().props;
    const household = households.find(
        (item) => item.id === routine.householdId,
    );
    const details = [
        { label: 'Kategoria', value: routineCategoryLabels[routine.category] },
        { label: 'Częstotliwość', value: getRoutineScheduleLabel(routine) },
        {
            label: 'Pierwszy termin wykonania',
            value: formatRoutineDate(routine.startsAt),
        },
        {
            label: 'Ostatnio wykonano',
            value: formatRoutineDate(
                getLastRoutineCompletion(routine)?.actionAt,
            ),
        },
        {
            label: 'Kolejny termin',
            value:
                routine.state === RoutineState.Active ? (
                    <>
                        {formatRoutineDate(routine.nextDueAt)}
                        <RoutineMissedTerms
                            count={getRoutineMissedTermsCount(routine)}
                        />
                    </>
                ) : routine.state === RoutineState.Paused ? (
                    'Wyznaczymy po wznowieniu'
                ) : (
                    'Wyznaczymy po przywróceniu'
                ),
        },
    ];

    return (
        <SectionCard
            title="Informacje o rutynie"
            description={
                households.length > 1 && household
                    ? `Dom: ${household.name}`
                    : undefined
            }
            extra={<RoutineStatusTag routine={routine} />}
        >
            <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]">
                {details.map((detail) => (
                    <SurfaceBox key={detail.label}>
                        <dt className="text-xs text-(--button-text) sm:text-sm">
                            {detail.label}
                        </dt>
                        <dd className="mt-2 text-sm font-semibold wrap-break-word text-foreground sm:text-base">
                            {detail.value}
                        </dd>
                    </SurfaceBox>
                ))}
            </dl>
            {routine.notes && (
                <SurfaceBox className="mt-4">
                    <h4 className="mb-2 text-sm font-semibold text-foreground">
                        Notatki
                    </h4>
                    <p className="text-sm wrap-break-word whitespace-pre-line text-(--button-text)">
                        {routine.notes}
                    </p>
                </SurfaceBox>
            )}
        </SectionCard>
    );
}
