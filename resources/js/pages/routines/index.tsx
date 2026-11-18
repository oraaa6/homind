import { PlusOutlined } from '@ant-design/icons';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Button from '@/components/Button';
import Filters from '@/components/filters';
import Heading from '@/components/heading';
import ItemsTable from '@/components/items-table';
import RoutineMissedTerms from '@/components/routines/routine-missed-terms';
import RoutineStatusTag from '@/components/routines/routine-status-tag';
import Statistics from '@/components/statistics';
import { routineCategoryLabels } from '@/constants/routine-categories';
import useListControls, { SortValue } from '@/hooks/use-list-controls';
import { routines as routinesRoute } from '@/routes';
import { add, show } from '@/routes/routines';
import type { Household } from '@/types/household';
import type { RoutineListItem } from './types';
import { RoutineState } from './types';
import {
    formatRoutineDate,
    getRoutineCategoryFilters,
    getRoutineScheduleLabel,
    getRoutineStatistics,
} from './utils';

export default function Routines({
    routines,
}: {
    routines: RoutineListItem[];
}) {
    const { households = [] } = usePage<{ households: Household[] }>().props;
    const [state, setState] = useState(RoutineState.Active);
    const stateRoutines = routines.filter((routine) => routine.state === state);
    const controls = useListControls({
        items: stateRoutines,
        getFilterValue: (routine) => routine.category,
        getSearchText: (routine) =>
            `${routine.name} ${routineCategoryLabels[routine.category]}`,
        getSortValue: (routine) => routine.nextDueAt,
        initialSort: SortValue.EarliestDate,
        pageSize: 6,
    });
    const tableItems = controls.filteredItems.map((routine) => ({
        id: routine.id,
        title: routine.name,
        description: (
            <div className="flex flex-col gap-1 text-xs text-(--button-text) sm:text-sm">
                <span>
                    Ostatnio: {formatRoutineDate(routine.lastCompletedAt)}
                </span>
                {households.length > 1 && (
                    <span>
                        Dom:{' '}
                        {
                            households.find(
                                (household) =>
                                    household.id === routine.householdId,
                            )?.name
                        }
                    </span>
                )}
            </div>
        ),
        value: (
            <span className="text-sm font-medium">
                {getRoutineScheduleLabel(routine)}
            </span>
        ),
        secondaryValue: (
            <div className="flex flex-col gap-1">
                <span>
                    {state === RoutineState.Active
                        ? `Kolejny termin: ${formatRoutineDate(routine.nextDueAt)}`
                        : state === RoutineState.Paused
                          ? 'Harmonogram wstrzymany'
                          : 'Rutyna w archiwum'}
                </span>
                <RoutineMissedTerms count={routine.missedTermsCount} />
            </div>
        ),
        status: <RoutineStatusTag routine={routine} />,
        actions: (
            <Button
                type="secondary"
                size="small"
                onClick={() => router.visit(show(routine.id).url)}
            >
                Szczegóły
            </Button>
        ),
    }));

    return (
        <>
            <Head title="Rutyny" />
            <div className="flex flex-col gap-5 sm:gap-8">
                <Heading
                    title="Rutyny"
                    description="Powtarzalne czynności, dzięki którym łatwiej zadbać o dom i codzienne nawyki."
                    primaryButtonProps={{
                        children: 'Dodaj rutynę',
                        icon: <PlusOutlined />,
                        onClick: () => router.visit(add().url),
                    }}
                />
                <Statistics items={getRoutineStatistics(routines)} />
                <div
                    role="group"
                    aria-label="Stan rutyn"
                    className="flex flex-wrap gap-2"
                >
                    {[
                        { value: RoutineState.Active, label: 'Aktywne' },
                        { value: RoutineState.Paused, label: 'Wstrzymane' },
                        { value: RoutineState.Archived, label: 'Archiwum' },
                    ].map((option) => (
                        <Button
                            key={option.value}
                            type={
                                state === option.value ? 'primary' : 'secondary'
                            }
                            size="small"
                            aria-pressed={state === option.value}
                            onClick={() => {
                                setState(option.value);
                                controls.onFilterChange('all');
                                controls.onSortChange(
                                    option.value === RoutineState.Active
                                        ? SortValue.EarliestDate
                                        : SortValue.Name,
                                );
                            }}
                        >
                            {option.label} (
                            {
                                routines.filter(
                                    (routine) => routine.state === option.value,
                                ).length
                            }
                            )
                        </Button>
                    ))}
                </div>
                <Filters
                    options={getRoutineCategoryFilters(stateRoutines)}
                    value={controls.filter}
                    onChange={controls.onFilterChange}
                    search={controls.searchInput}
                    onSearchChange={controls.onSearchInputChange}
                    onSearch={controls.onSearch}
                    searchPlaceholder="Szukaj rutyn..."
                    sortOptions={
                        state === RoutineState.Active
                            ? [
                                  {
                                      value: SortValue.EarliestDate,
                                      label: 'Najbliższy termin',
                                  },
                                  {
                                      value: SortValue.LatestDate,
                                      label: 'Najdalszy termin',
                                  },
                                  { value: SortValue.Name, label: 'Nazwa A–Z' },
                              ]
                            : [{ value: SortValue.Name, label: 'Nazwa A–Z' }]
                    }
                    sort={controls.sort}
                    onSortChange={controls.onSortChange}
                />
                <ItemsTable
                    items={tableItems}
                    valueColumnWidth={220}
                    pagination={{
                        ...controls.pagination,
                        showSizeChanger: false,
                        showLessItems: true,
                        responsive: true,
                        showTotal: (total, [start, end]) =>
                            `Pokazano ${start}–${end} z ${total} rutyn`,
                    }}
                    locale={{
                        emptyText: stateRoutines.length
                            ? 'Brak rutyn pasujących do filtrów'
                            : state === RoutineState.Active
                              ? 'Nie masz aktywnych rutyn. Dodaj rutynę lub wznów wstrzymaną.'
                              : state === RoutineState.Paused
                                ? 'Brak wstrzymanych rutyn.'
                                : 'Archiwum jest puste.',
                    }}
                />
            </div>
        </>
    );
}

Routines.layout = { breadcrumbs: [{ title: 'Rutyny', href: routinesRoute() }] };
