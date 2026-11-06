import { EnvironmentOutlined, PlusOutlined } from '@ant-design/icons';
import { Head, router } from '@inertiajs/react';
import { Tag } from 'antd';
import { useState } from 'react';
import Button from '@/components/Button';
import Filters from '@/components/filters';
import Heading from '@/components/heading';
import ItemsTable from '@/components/items-table';
import Statistics from '@/components/statistics';
import { things } from '@/routes';
import { add as addThing, show as showThing } from '@/routes/things';
import type { Thing } from './data';
import type { ThingCategoryOption } from './form-types';

const sortOptions = [
    { value: 'newest', label: 'Najnowsze' },
    { value: 'oldest', label: 'Najstarsze' },
    { value: 'name', label: 'Nazwa A–Z' },
];

export default function Things({
    categories,
    things: items,
}: {
    categories: ThingCategoryOption[];
    things: Thing[];
}) {
    const [filter, setFilter] = useState('all');
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('newest');
    const [page, setPage] = useState(1);
    const query = search.trim().toLocaleLowerCase('pl');
    const filteredThings = items
        .filter(
            (item) =>
                (filter === 'all' || item.category === filter) &&
                `${item.name} ${item.id} ${item.location} ${item.category}`
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

    const statistics = [
        {
            label: 'Łącznie przedmiotów',
            value: String(items.length),
            icon: '/icons/catalog.svg',
            description: 'Wszystkie zapisane pozycje',
        },
        {
            label: 'W pomieszczeniach',
            value: String(items.filter((item) => item.placeKind === 'room').length),
            icon: '/icons/zone.svg',
            description: 'Przypisane bezpośrednio do pomieszczeń',
        },
        {
            label: 'W pudełkach QR',
            value: String(items.filter((item) => item.placeKind === 'box').length),
            icon: '/icons/qr-box.svg',
            description: 'Przypisane do oznaczonych pojemników',
        },
        {
            label: 'Na regałach',
            value: String(items.filter((item) => item.placeKind === 'rack').length),
            icon: '/icons/catalog.svg',
            description: 'Przypisane do regałów lub mebli',
        },
    ];
    const filters = [
        { value: 'all', label: 'Wszystkie' },
        ...categories.map((category) => ({
            value: category.name,
            label: category.name,
        })),
    ].map((option) => ({
        ...option,
        count: items.filter(
            (item) => option.value === 'all' || item.category === option.value,
        ).length,
    }));

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
            value: (
                <span className="whitespace-nowrap text-sm!">
                    {item.quantity} {item.unit === 'sztuka' ? 'szt.' : item.unit}
                </span>
            ),
            status: item.needsPacking ? (
                <Tag className="m-0! rounded-full! border-0! bg-primary-soft! px-3! py-1! font-semibold! text-primary!">
                    Do spakowania
                </Tag>
            ) : undefined,
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
            <Head title="Przedmioty" />
            <div className="flex flex-col gap-5 sm:gap-8">
                <Heading
                    title="Przedmioty"
                    description="Katalog przedmiotów, ilości i ich lokalizacji w domu."
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
