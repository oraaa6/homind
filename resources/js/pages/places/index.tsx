import { EnvironmentOutlined, PlusOutlined } from '@ant-design/icons';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import Button from '@/components/Button';
import Filters from '@/components/filters';
import Heading from '@/components/heading';
import ItemsTable from '@/components/items-table';
import { placeKinds } from '@/components/places/place-kinds';
import Statistics from '@/components/statistics';
import { places } from '@/routes';
import { add as addPlace, show as showPlace } from '@/routes/places';
import type { Place } from './data';

const sortOptions = [
    { value: 'newest', label: 'Najnowsze' },
    { value: 'oldest', label: 'Najstarsze' },
    { value: 'name', label: 'Nazwa A–Z' },
];

export default function Places({ places: placesData }: { places: Place[] }) {
    const [filter, setFilter] = useState('all');
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('newest');
    const [page, setPage] = useState(1);
    const query = search.trim().toLocaleLowerCase('pl');
    const filteredPlaces = placesData
        .filter(
            (place) =>
                (filter === 'all' || place.kind === filter) &&
                `${place.name} ${place.id} ${place.description} ${place.levelLabel} ${placeKinds[place.kind].label}`
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

    const tableItems = filteredPlaces.map((place) => {
        return {
            id: place.id,
            title: place.name,
            description: (
                <>
                    <EnvironmentOutlined
                        className="mt-0.5 shrink-0"
                        aria-hidden="true"
                    />
                    {place.parentName ?? 'Bez pomieszczenia nadrzędnego'}
                </>
            ),
            value: (
                <span className="text-sm whitespace-nowrap sm:text-base">
                    Przedmioty: 0
                </span>
            ),
            status: (
                <span className="inline-flex rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold whitespace-nowrap text-(--button-text) sm:text-sm">
                    {placeKinds[place.kind].label}
                </span>
            ),
            actions: (
                <Button
                    type="secondary"
                    size="small"
                    onClick={() => router.visit(showPlace(place.slug).url)}
                >
                    Szczegóły
                </Button>
            ),
        };
    });

    const statistics = [
        {
            label: 'Wszystkie strefy',
            value: String(placesData.filter((place) => place.kind === 'room').length),
            icon: '/icons/zone.svg',
            description: 'Pomieszczenia i otoczenie domu',
        },
        {
            label: 'Pudełka z kodem QR',
            value: String(
                placesData.filter((place) => place.kind === 'box' && place.qrCode).length,
            ),
            icon: '/icons/qr-box.svg',
            description: 'Oznaczone pojemniki',
        },
        {
            label: 'Skatalogowane rzeczy',
            value: '0',
            icon: '/icons/catalog.svg',
            description: 'Przypisane do stref',
        },
    ];

    const filters = [
        { value: 'all', label: 'Wszystkie' },
        { value: 'room', label: 'Pomieszczenia' },
        { value: 'box', label: 'Pudełka' },
        { value: 'rack', label: 'Regały' },
    ].map((option) => ({
        ...option,
        count: placesData.filter(
            (place) => option.value === 'all' || place.kind === option.value,
        ).length,
    }));

    return (
        <>
            <Head title="Lokalizacje" />
            <div className="flex flex-col gap-5 sm:gap-8">
                <Heading
                    title="Lokalizacje"
                    description="Strefy domu, pudełka z kodami QR i przypisane do nich przedmioty."
                    primaryButtonProps={{
                        children: 'Dodaj lokalizację',
                        icon: <PlusOutlined />,
                        onClick: () => router.visit(addPlace().url),
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
                    searchPlaceholder="Szukaj lokalizacji..."
                    sortOptions={sortOptions}
                    sort={sort}
                    onSortChange={(value) => {
                        setSort(value);
                        setPage(1);
                    }}
                />
                <ItemsTable
                    items={tableItems}
                    valueColumnWidth={168}
                    pagination={{ current: page, onChange: setPage }}
                />
            </div>
        </>
    );
}

Places.layout = {
    breadcrumbs: [{ title: 'Lokalizacje', href: places() }],
};
