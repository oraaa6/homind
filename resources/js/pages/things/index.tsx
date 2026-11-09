import { EnvironmentOutlined, PlusOutlined } from '@ant-design/icons';
import { Head, router } from '@inertiajs/react';
import { Tag } from 'antd';
import Button from '@/components/Button';
import Filters from '@/components/filters';
import Heading from '@/components/heading';
import ItemsTable from '@/components/items-table';
import Statistics from '@/components/statistics';
import useListControls, { listSortOptions } from '@/hooks/use-list-controls';
import { things } from '@/routes';
import { add as addThing, show as showThing } from '@/routes/things';
import { PlaceType } from '@/types/place';
import type { Thing, ThingCategoryOption } from './types';

export default function Things({
    categories,
    things: items,
}: {
    categories: ThingCategoryOption[];
    things: Thing[];
}) {
    const controls = useListControls({
        items,
        getFilterValue: (item) => item.category,
        getSearchText: (item) =>
            `${item.name} ${item.id} ${item.location} ${item.category}`,
        pageSize: 6,
    });
    const filteredThings = controls.filteredItems;

    const statistics = [
        {
            label: 'Łącznie przedmiotów',
            value: String(items.length),
            icon: '/icons/catalog.svg',
            description: 'Wszystkie zapisane pozycje',
        },
        {
            label: 'W pomieszczeniach',
            value: String(
                items.filter((item) => item.placeKind === PlaceType.Room)
                    .length,
            ),
            icon: '/icons/zone.svg',
            description: 'Przypisane bezpośrednio do pomieszczeń',
        },
        {
            label: 'W pudełkach',
            value: String(
                items.filter((item) => item.placeKind === PlaceType.Box).length,
            ),
            icon: '/icons/qr-box.svg',
            description: 'Przypisane do oznaczonych pojemników',
        },
        {
            label: 'Na regałach',
            value: String(
                items.filter((item) => item.placeKind === PlaceType.Rack)
                    .length,
            ),
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
                    value={controls.filter}
                    onChange={controls.onFilterChange}
                    search={controls.searchInput}
                    onSearchChange={controls.onSearchInputChange}
                    onSearch={controls.onSearch}
                    searchPlaceholder="Szukaj w zasobach..."
                    sortOptions={listSortOptions}
                    sort={controls.sort}
                    onSortChange={controls.onSortChange}
                />
                <ItemsTable
                    items={tableItems}
                    pagination={controls.pagination}
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
