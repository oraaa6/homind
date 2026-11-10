import {
    EditOutlined,
    EnvironmentOutlined,
    PlusOutlined,
} from '@ant-design/icons';
import { Head } from '@inertiajs/react';
import { Tag } from 'antd';
import Button from '@/components/Button';
import Filters from '@/components/filters';
import Heading from '@/components/heading';
import ItemsTable from '@/components/items-table';
import Statistics from '@/components/statistics';
import useListControls, {
    SortValue,
    type SortOption,
} from '@/hooks/use-list-controls';
import { maintenance } from '@/routes';
import {
    add as addMaintenance,
    show as showMaintenance,
} from '@/routes/maintenance';

type MaintenanceDevice = {
    id: number;
    name: string;
    category: string;
    location: string;
    createdAt: string;
    service: {
        isScheduled: boolean;
        appointmentAt: string | null;
    } | null;
};

const statusTag = (isScheduled: boolean) => (
    <Tag
        color={isScheduled ? 'green' : 'default'}
        className="m-0! rounded-full! px-3! py-1! font-semibold!"
    >
        {isScheduled ? 'Umówione' : 'Brak terminu'}
    </Tag>
);

const formatAppointment = (value: string) =>
    new Intl.DateTimeFormat('pl-PL', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));

const sortOptions: SortOption[] = [
    { value: SortValue.Name, label: 'Nazwa A–Z' },
    { value: SortValue.Newest, label: 'Dodane najnowsze' },
    { value: SortValue.Oldest, label: 'Dodane najstarsze' },
];

export default function Maintenance({
    devices,
}: {
    devices: MaintenanceDevice[];
}) {
    const controls = useListControls({
        items: devices,
        getFilterValue: (device) => device.category,
        getSearchText: (device) =>
            `${device.name} ${device.category} ${device.location}`,
        initialSort: SortValue.Name,
        pageSize: 4,
    });

    const categories = Array.from(
        new Set(devices.map((device) => device.category)),
    );
    const filters = [
        { value: 'all', label: 'Wszystkie' },
        ...categories.map((category) => ({ value: category, label: category })),
    ].map((option) => ({
        ...option,
        count: devices.filter(
            (device) =>
                option.value === 'all' || device.category === option.value,
        ).length,
    }));

    const statistics = [
        {
            label: 'Planowane serwisy',
            value: '0',
            icon: '/icons/wrench.svg',
            description: 'W tym roku',
        },
        {
            label: 'Pilne interwencje',
            value: '0',
            icon: '/icons/bolt.svg',
            description: 'Brak zapisanych terminów',
        },
        {
            label: 'Zbliżające się terminy',
            value: '0',
            icon: '/icons/trend-down.svg',
            description: 'Brak zapisanych terminów',
        },
    ];

    const tableItems = controls.filteredItems.map((device) => ({
        id: device.id,
        title: device.name,
        description: (
            <div className="flex min-w-0 flex-col items-start gap-1">
                <Tag className="m-0! rounded-md! bg-surface-muted! px-2! py-0.5! text-xs! font-semibold! text-(--button-text)!">
                    {device.category}
                </Tag>
                <span className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
                    <EnvironmentOutlined aria-hidden="true" />
                    <span>{device.location}</span>
                </span>
            </div>
        ),
        value: device.service?.appointmentAt
            ? formatAppointment(device.service.appointmentAt)
            : undefined,
        secondaryValue: device.service?.appointmentAt
            ? 'Termin wizyty'
            : undefined,
        status: statusTag(Boolean(device.service?.isScheduled)),
        actions: (
            <div className="flex flex-nowrap items-center justify-end gap-2">
                <Button
                    href={showMaintenance(device.id).url}
                    type="ghost"
                    size="small"
                >
                    Szczegóły
                </Button>
                {device.service ? (
                    <Button
                        href={
                            addMaintenance({
                                query: { thing_id: device.id, edit: 1 },
                            }).url
                        }
                        type="primary"
                        size="small"
                        icon={<EditOutlined />}
                        shape="circle"
                        aria-label={`Edytuj serwis: ${device.name}`}
                        title="Edytuj serwis"
                    />
                ) : (
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
                        aria-label={`Dodaj serwis: ${device.name}`}
                        title="Dodaj serwis"
                    />
                )}
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
                <Statistics items={statistics} />
                <Filters
                    options={filters}
                    value={controls.filter}
                    onChange={controls.onFilterChange}
                    search={controls.searchInput}
                    onSearchChange={controls.onSearchInputChange}
                    onSearch={controls.onSearch}
                    searchPlaceholder="Szukaj urządzeń..."
                    sortOptions={sortOptions}
                    sort={controls.sort}
                    onSortChange={controls.onSortChange}
                />
                <ItemsTable
                    items={tableItems}
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
