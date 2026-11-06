import { router } from '@inertiajs/react';
import { Tag } from 'antd';
import { useState } from 'react';
import Button from '@/components/Button';
import Filters from '@/components/filters';
import ItemsTable from '@/components/items-table';
import SectionCard from '@/components/section-card';
import type { Place } from '@/pages/places/data';
import type { Thing } from '@/pages/things/data';
import { show as showThing } from '@/routes/things';

const contentTitles = {
    box: 'Przedmioty w tym pudełku',
    rack: 'Przedmioty na tym regale',
    room: 'Przedmioty w tej lokalizacji',
};

const sortOptions = [
    { value: 'newest', label: 'Najnowsze' },
    { value: 'oldest', label: 'Najstarsze' },
    { value: 'name', label: 'Nazwa A–Z' },
];

export default function PlaceContents({
    items,
    kind,
}: {
    items: Thing[];
    kind: Place['kind'];
}) {
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [sort, setSort] = useState('newest');
    const [page, setPage] = useState(1);
    const query = search.trim().toLocaleLowerCase('pl');
    const filteredItems = items
        .filter(
            (item) =>
                (category === 'all' || item.category === category) &&
                `${item.name} ${item.id} ${item.category} ${item.storagePlaceName ?? ''}`
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
    const filters = [
        { value: 'all', label: 'Wszystkie' },
        ...Array.from(new Set(items.map((item) => item.category)))
            .sort((a, b) => a.localeCompare(b, 'pl'))
            .map((value) => ({ value, label: value })),
    ].map((option) => ({
        ...option,
        count: items.filter(
            (item) => option.value === 'all' || item.category === option.value,
        ).length,
    }));

    return (
        <SectionCard
            title={contentTitles[kind]}
            description="Zarządzaj przypisanymi przedmiotami i akcesoriami"
            extra={
                <span className="rounded-lg bg-surface-muted px-2.5 py-1 text-xs font-semibold text-(--button-text)">
                    {items.length} pozycji
                </span>
            }
            className="min-w-0"
        >
            <div className="mb-4">
                <Filters
                    variant="muted"
                    options={filters}
                    value={category}
                    onChange={(value) => {
                        setCategory(value);
                        setPage(1);
                    }}
                    search={searchInput}
                    onSearchChange={setSearchInput}
                    onSearch={(value) => {
                        setSearch(value);
                        setPage(1);
                    }}
                    searchPlaceholder="Szukaj w przedmiotach..."
                    sortOptions={sortOptions}
                    sort={sort}
                    onSortChange={(value) => {
                        setSort(value);
                        setPage(1);
                    }}
                />
            </div>
            <ItemsTable
                items={filteredItems.map((item) => ({
                    id: item.id,
                    title: item.name,
                    badge: `#${item.id}`,
                    description: (
                        <span className="flex flex-wrap items-center gap-x-2">
                            <span>{item.category}</span>
                            {item.storagePlaceName && (
                                <span className="text-(--button-text)">
                                    Na miejscu: {item.storagePlaceName}
                                </span>
                            )}
                        </span>
                    ),
                    value: (
                        <span className="whitespace-nowrap text-sm!">
                            {item.quantity}{' '}
                            {item.unit === 'sztuka' ? 'szt.' : item.unit}
                        </span>
                    ),
                    status: item.needsPacking ? (
                        <Tag className="m-0! rounded-full! border-0! bg-primary-soft! px-3! py-1! font-semibold! text-primary!">
                            Do spakowania
                        </Tag>
                    ) : undefined,
                    actions: (
                        <Button
                            type="text"
                            size="small"
                            onClick={() => router.visit(showThing(item.slug).url)}
                        >
                            Szczegóły
                        </Button>
                    ),
                }))}
                pagination={{ current: page, onChange: setPage }}
                variant="muted"
                locale={{
                    emptyText: items.length
                        ? 'Brak przedmiotów pasujących do filtrów'
                        : 'Brak przedmiotów w tej lokalizacji',
                }}
            />
        </SectionCard>
    );
}
