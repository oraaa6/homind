import { EnvironmentOutlined, PlusOutlined } from '@ant-design/icons';
import { Head, router } from '@inertiajs/react';
import clsx from 'clsx';
import { useState } from 'react';
import Button from '@/components/Button';
import Filters from '@/components/filters';
import Heading from '@/components/heading';
import ItemsTable from '@/components/items-table';
import Statistics from '@/components/statistics';
import { things } from '@/routes';
import { add as addThing, show as showThing } from '@/routes/things';
import type { Thing } from './data';
import { mockThings } from './data';

const statistics = [
    {
        label: 'Łączne wydatki (m/m)',
        value: '4 850 zł',
        icon: '/icons/money.svg',
        description: (
            <span className="flex items-center gap-1.5 text-primary sm:gap-2">
                <img
                    src="/icons/trend-down.svg"
                    alt=""
                    className="size-3.5 sm:size-4"
                />
                -12% vs poprz. m-c
            </span>
        ),
    },
    {
        label: 'Rachunki i media',
        value: '1 620 zł',
        icon: '/icons/bolt.svg',
        description: (
            <>
                <span
                    aria-hidden="true"
                    className="size-1.5 shrink-0 rounded-full bg-primary sm:size-2"
                />
                <span>W normie</span>
            </>
        ),
    },
    {
        label: 'Utrzymanie i serwisy',
        value: '850 zł',
        icon: '/icons/wrench.svg',
        description: 'Kocioł, filtry osmozy',
    },
    {
        label: 'Zapasy i pojazdy',
        value: '2 380 zł',
        icon: '/icons/car.svg',
        description: 'Paliwo + zakupy',
    },
];

const filters = [
    { value: 'all', label: 'Wszystkie' },
    { value: 'kitchen', label: 'Kuchnia' },
    { value: 'living-room', label: 'Salon' },
    { value: 'garage', label: 'Garaż & Warsztat' },
    { value: 'bedroom', label: 'Sypialnia' },
    { value: 'bathroom', label: 'Łazienka' },
    { value: 'garden', label: 'Ogród' },
].map((option) => ({
    ...option,
    count: mockThings.filter(
        (item) => option.value === 'all' || item.category === option.value,
    ).length,
}));

const sortOptions = [
    { value: 'newest', label: 'Najnowsze' },
    { value: 'oldest', label: 'Najstarsze' },
    { value: 'name', label: 'Nazwa A–Z' },
];

const statusClasses: Record<Thing['status']['tone'], string> = {
    danger: 'bg-todo-danger-muted-surface text-todo-danger',
    success: 'bg-primary/10 text-primary',
    neutral: 'bg-surface-muted text-(--button-text)',
};

function ThingStatus({ item }: { item: Thing }) {
    return (
        <span
            className={clsx(
                'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap before:size-1.5 before:rounded-full before:bg-current sm:text-sm',
                statusClasses[item.status.tone],
            )}
        >
            {item.status.label}
        </span>
    );
}

export default function Things() {
    const [filter, setFilter] = useState('all');
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('newest');
    const [page, setPage] = useState(1);
    const query = search.trim().toLocaleLowerCase('pl');
    const filteredThings = mockThings
        .filter(
            (item) =>
                (filter === 'all' || item.category === filter) &&
                `${item.name} ${item.id} ${item.location}`
                    .toLocaleLowerCase('pl')
                    .includes(query),
        )
        .sort((a, b) => {
            if (sort === 'name') {
                return a.name.localeCompare(b.name, 'pl');
            }

            return sort === 'oldest'
                ? a.createdAt.localeCompare(b.createdAt)
                : b.createdAt.localeCompare(a.createdAt);
        });

    const tableItems = filteredThings.map((item) => {
        return {
            id: item.id,
            title: item.name,
            badge: `#${item.id}`,
            description: (
                <>
                    <EnvironmentOutlined
                        className="mt-0.5 shrink-0"
                        aria-hidden="true"
                    />
                    {item.location}
                </>
            ),
            value: `${item.quantity} ${item.unit}`,
            secondaryValue: `Min: ${item.minimum} ${item.unit}`,
            status: <ThingStatus item={item} />,
            actions: (
                <Button
                    type="secondary"
                    size="small"
                    onClick={() => router.visit(showThing(item.slug).url)}
                >
                    Szczegóły
                </Button>
            ),
        };
    });

    return (
        <>
            <Head title="Things" />
            <div className="flex flex-col gap-5 sm:gap-8">
                <Heading
                    title="Przedmioty"
                    description="Katalog sprzętów domowych, elektroniki i wyposażenia z historią oraz kodami QR."
                    primaryButtonProps={{
                        children: 'Dodaj przedmiot',
                        icon: <PlusOutlined />,
                        onClick: () => router.visit(addThing().url),
                    }}
                />
                <Statistics items={statistics} />
                <Filters
                    options={filters}
                    value={filter}
                    onChange={(value) => {
                        setFilter(value);
                        setPage(1);
                    }}
                    search={searchInput}
                    onSearchChange={setSearchInput}
                    onSearch={(value) => {
                        setSearch(value);
                        setPage(1);
                    }}
                    searchPlaceholder="Szukaj w zasobach..."
                    sortOptions={sortOptions}
                    sort={sort}
                    onSortChange={(value) => {
                        setSort(value);
                        setPage(1);
                    }}
                />
                <ItemsTable
                    items={tableItems}
                    pagination={{ current: page, onChange: setPage }}
                />
            </div>
        </>
    );
}

Things.layout = {
    breadcrumbs: [
        {
            title: 'Things',
            href: things(),
        },
    ],
};
