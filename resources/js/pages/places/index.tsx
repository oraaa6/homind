import { EnvironmentOutlined, PlusOutlined } from '@ant-design/icons';
import { Head, router } from '@inertiajs/react';
import Button from '@/components/Button';
import Filters from '@/components/filters';
import Heading from '@/components/heading';
import ItemsTable from '@/components/items-table';
import { placeKinds } from '@/components/places/place-kinds';
import Statistics from '@/components/statistics';
import useListControls, { listSortOptions } from '@/hooks/use-list-controls';
import { places } from '@/routes';
import { add as addPlace, show as showPlace } from '@/routes/places';
import { PlaceType } from '@/types/place';
import type { Place } from './types';

export default function Places({
    places: placesData,
    totalThings,
}: {
    places: Place[];
    totalThings: number;
}) {
    const controls = useListControls({
        items: placesData,
        getFilterValue: (place) => place.kind,
        getSearchText: (place) =>
            `${place.name} ${place.id} ${place.parentName ?? ''} ${place.description} ${place.levelLabel} ${placeKinds[place.kind].label}`,
        pageSize: 16,
    });
    const filteredPlaces = controls.filteredItems;

    const tableItems = filteredPlaces.map((place) => {
        return {
            id: place.id,
            title: place.name,
            description:
                place.parentName || place.description ? (
                    <>
                        <EnvironmentOutlined
                            className="mt-0.5 shrink-0"
                            aria-hidden="true"
                        />
                        <span className="flex min-w-0 flex-wrap items-center gap-x-1.5">
                            {place.parentName && (
                                <span>{place.parentName}</span>
                            )}
                            {place.parentName && place.description && (
                                <span aria-hidden="true">·</span>
                            )}
                            {place.description && (
                                <span>{place.description}</span>
                            )}
                        </span>
                    </>
                ) : undefined,
            value: (
                <span className="text-sm whitespace-nowrap sm:text-base">
                    Przedmioty: {place.thingCount}
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
            value: String(
                placesData.filter((place) => place.kind === PlaceType.Room)
                    .length,
            ),
            icon: '/icons/zone.svg',
            description: 'Pomieszczenia i otoczenie domu',
        },
        {
            label: 'Obiekty z kodem QR',
            value: String(
                placesData.filter(
                    (place) => place.kind !== PlaceType.Room && place.qrCode,
                ).length,
            ),
            icon: '/icons/qr-box.svg',
            description: 'Oznaczone regały i pojemniki',
        },
        {
            label: 'Skatalogowane rzeczy',
            value: String(totalThings),
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
                    value={controls.filter}
                    onChange={controls.onFilterChange}
                    search={controls.searchInput}
                    onSearchChange={controls.onSearchInputChange}
                    onSearch={controls.onSearch}
                    searchPlaceholder="Szukaj lokalizacji..."
                    sortOptions={listSortOptions}
                    sort={controls.sort}
                    onSortChange={controls.onSortChange}
                />
                <ItemsTable
                    items={tableItems}
                    valueColumnWidth={168}
                    pagination={controls.pagination}
                />
            </div>
        </>
    );
}

Places.layout = {
    breadcrumbs: [{ title: 'Lokalizacje', href: places() }],
};
