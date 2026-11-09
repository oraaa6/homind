import { router } from '@inertiajs/react';
import { Tag } from 'antd';
import Button from '@/components/Button';
import Filters from '@/components/filters';
import ItemsTable from '@/components/items-table';
import SectionCard from '@/components/section-card';
import useListControls, { listSortOptions } from '@/hooks/use-list-controls';
import type { Place } from '@/pages/places/types';
import type { Thing } from '@/pages/things/types';
import { show as showThing } from '@/routes/things';

const contentTitles = {
    box: 'Przedmioty w tym pudełku',
    rack: 'Przedmioty na tym regale',
    room: 'Przedmioty w tej lokalizacji',
};

export default function PlaceContents({
    items,
    kind,
}: {
    items: Thing[];
    kind: Place['kind'];
}) {
    const controls = useListControls({
        items,
        getFilterValue: (item) => item.category,
        getSearchText: (item) =>
            `${item.name} ${item.id} ${item.category} ${item.storagePlaceName ?? ''}`,
        pageSize: 10,
    });
    const filteredItems = controls.filteredItems;

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
                    value={controls.filter}
                    onChange={controls.onFilterChange}
                    search={controls.searchInput}
                    onSearchChange={controls.onSearchInputChange}
                    onSearch={controls.onSearch}
                    searchPlaceholder="Szukaj w przedmiotach..."
                    sortOptions={listSortOptions}
                    sort={controls.sort}
                    onSortChange={controls.onSortChange}
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
                        <span className="text-sm! whitespace-nowrap">
                            {item.quantity} {item.unitShort}
                        </span>
                    ),
                    status: item.needsPacking ? (
                        <Tag
                            color="red"
                            className="m-0! rounded-full! px-3! py-1! font-semibold!"
                        >
                            Do spakowania
                        </Tag>
                    ) : undefined,
                    actions: (
                        <Button
                            type="text"
                            size="small"
                            onClick={() =>
                                router.visit(showThing(item.slug).url)
                            }
                        >
                            Szczegóły
                        </Button>
                    ),
                }))}
                pagination={controls.pagination}
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
