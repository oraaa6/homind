import { PlusOutlined } from '@ant-design/icons';
import { Head, Link } from '@inertiajs/react';
import { Alert, Tag } from 'antd';
import Button from '@/components/Button';
import Filters from '@/components/filters';
import Heading from '@/components/heading';
import ItemsTable from '@/components/items-table';
import Statistics from '@/components/statistics';
import useListControls, {
    SortValue,
} from '@/hooks/use-list-controls';
import type { SortOption } from '@/hooks/use-list-controls';
import { maintenance, things } from '@/routes';
import {
    add as addMaintenance,
    show as showMaintenance,
} from '@/routes/maintenance';
import type { MaintenanceIndexDevice, MaintenanceService } from './types';
import {
    formatMaintenanceDate,
    getMaintenanceStatistics,
    getMaintenanceStatus,
    maintenanceStatusColors,
} from './utils';

const maintenanceSortOptions: SortOption[] = [
    { value: SortValue.EarliestDate, label: 'Najbliższy' },
    { value: SortValue.LatestDate, label: 'Najdalszy' },
];

const statusTag = (service: MaintenanceService | null) => {
    const status = getMaintenanceStatus(service);

    return (
        <Tag
            color={maintenanceStatusColors[status]}
            className="m-0! rounded-full! px-3! py-1! font-semibold!"
        >
            {status}
        </Tag>
    );
};

export default function Maintenance({
    devices,
}: {
    devices: MaintenanceIndexDevice[];
}) {
    const controls = useListControls({
        items: devices,
        getFilterValue: (device) => device.category,
        getSearchText: (device) => `${device.name} ${device.category}`,
        getSortValue: (device) =>
            device.service?.appointmentAt ?? device.service?.dueAt ?? null,
        initialSort: SortValue.EarliestDate,
        pageSize: 4,
    });

    const categoryCounts = devices.reduce<Record<string, number>>(
        (counts, device) => {
            counts[device.category] = (counts[device.category] ?? 0) + 1;
            return counts;
        },
        {},
    );
    const filters = [
        { value: 'all', label: 'Wszystkie', count: devices.length },
        ...Object.entries(categoryCounts).map(([category, count]) => ({
            value: category,
            label: category,
            count,
        })),
    ];

    const { plannedThisYear, urgent, upcoming } = getMaintenanceStatistics(
        devices.flatMap((device) => device.services),
    );

    const statistics = [
        {
            label: 'Planowane serwisy',
            value: String(plannedThisYear),
            icon: '/icons/wrench.svg',
            description: 'Umówione w tym roku',
        },
        {
            label: 'Pilne interwencje',
            value: String(urgent),
            icon: '/icons/bolt.svg',
            description: 'Wymagają szybkiej reakcji',
        },
        {
            label: 'Zbliżające się terminy',
            value: String(upcoming),
            icon: '/icons/trend-down.svg',
            description: 'Termin za 8–29 dni',
        },
    ];

    const tableItems = controls.filteredItems.map((device) => ({
        id: device.id,
        title: device.name,
        description: (
            <Tag className="m-0! rounded-md! bg-surface-muted! px-2! py-0.5! text-xs! font-semibold! text-(--button-text)!">
                {device.category}
            </Tag>
        ),
        value:
            device.service?.appointmentAt || device.service?.dueAt ? (
                <span className="text-sm! font-medium! whitespace-nowrap">
                    {formatMaintenanceDate(
                        (device.service.appointmentAt ?? device.service.dueAt)!,
                        Boolean(device.service.appointmentAt),
                        'medium',
                    )}
                </span>
            ) : undefined,
        secondaryValue: device.service?.appointmentAt
            ? 'Termin wizyty'
            : device.service?.dueAt
              ? 'Umówić do'
              : undefined,
        status: statusTag(device.service),
        actions: (
            <div className="flex flex-nowrap items-center justify-end gap-2">
                <Button
                    href={showMaintenance(device.id).url}
                    type="ghost"
                    size="small"
                >
                    Szczegóły
                </Button>
                <Button
                    href={
                        addMaintenance({
                            query: { thing_id: device.id },
                        }).url
                    }
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    shape="circle"
                    aria-label={`Dodaj plan serwisu: ${device.name}`}
                    title="Dodaj plan serwisu"
                />
            </div>
        ),
    }));

    return (
        <>
            <Head title="Utrzymanie" />
            <div className="flex flex-col gap-5 sm:gap-8">
                <Heading
                    title="Utrzymanie"
                    description="Serwisy i przeglądy urządzeń wymagające umówienia fachowca."
                />
                <Alert
                    type="info"
                    showIcon
                    closable
                    title={
                        <>
                            Aby sprzęt pojawił się na tej liście, dodaj go w
                            zakładce <Link href={things().url}>Przedmioty</Link>{' '}
                            i zaznacz opcję „Wymaga serwisowania”.
                        </>
                    }
                    className="py-2!"
                />
                <Statistics items={statistics} />
                <Filters
                    options={filters}
                    value={controls.filter}
                    onChange={controls.onFilterChange}
                    search={controls.searchInput}
                    onSearchChange={controls.onSearchInputChange}
                    onSearch={controls.onSearch}
                    searchPlaceholder="Szukaj urządzeń..."
                    sortOptions={maintenanceSortOptions}
                    sort={controls.sort}
                    onSortChange={controls.onSortChange}
                />
                <ItemsTable
                    items={tableItems}
                    valueColumnWidth={184}
                    actionsColumnWidth={160}
                    pagination={{
                        current: controls.pagination.current,
                        defaultPageSize: controls.pagination.defaultPageSize,
                        onChange: controls.pagination.onChange,
                        showSizeChanger: false,
                        showLessItems: true,
                        responsive: true,
                        showTotal: (total, [start, end]) =>
                            `Pokazano ${start}–${end} z ${total} urządzeń`,
                    }}
                    locale={{
                        emptyText: devices.length
                            ? 'Brak urządzeń pasujących do filtrów'
                            : 'Brak urządzeń do serwisowania. Dodaj przedmiot i zaznacz „Wymaga serwisowania”.',
                    }}
                />
            </div>
        </>
    );
}

Maintenance.layout = {
    breadcrumbs: [
        {
            title: 'Utrzymanie',
            href: maintenance(),
        },
    ],
};
