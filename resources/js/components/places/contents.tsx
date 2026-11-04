import { ExportOutlined, ToolOutlined } from '@ant-design/icons';
import { router } from '@inertiajs/react';
import { Input, message, Select, Tooltip } from 'antd';
import { useState } from 'react';
import Button from '@/components/Button';
import ItemsTable from '@/components/items-table';
import SectionCard from '@/components/section-card';
import type { Place } from '@/pages/places/data';
import type { Thing } from '@/pages/things/data';
import { show as showThing } from '@/routes/things';

const categoryLabels: Record<string, string> = {
    kitchen: 'Kuchnia',
    'living-room': 'Salon',
    garage: 'Garaż i warsztat',
    bedroom: 'Sypialnia',
    bathroom: 'Łazienka / Pralnia',
    garden: 'Ogród',
};

const contentTitles = {
    box: 'Przedmioty w tym pudełku',
    rack: 'Przedmioty na tym regale',
    room: 'Przedmioty w tej lokalizacji',
};

const statusColors = {
    danger: 'bg-todo-danger',
    success: 'bg-primary',
    neutral: 'bg-neutral',
};

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
                `${item.name} ${item.id}`
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
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input.Search
                    aria-label="Szukaj przedmiotu w lokalizacji"
                    placeholder="Szukaj modelu, numeru EQ..."
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    onSearch={(value) => {
                        setSearch(value);
                        setPage(1);
                    }}
                    className="min-w-0 sm:col-span-2"
                />
                <Select
                    aria-label="Filtruj przedmioty według kategorii"
                    value={category}
                    options={[
                        { value: 'all', label: 'Kategoria: Wszystkie' },
                        ...Array.from(
                            new Set(items.map((item) => item.category)),
                        ).map((value) => ({
                            value,
                            label: categoryLabels[value] ?? value,
                        })),
                    ]}
                    onChange={(value) => {
                        setCategory(value);
                        setPage(1);
                    }}
                    className="min-w-0"
                />
                <Select
                    aria-label="Sortuj przedmioty"
                    value={sort}
                    options={[
                        { value: 'newest', label: 'Sortuj: Najnowsze' },
                        { value: 'oldest', label: 'Sortuj: Najstarsze' },
                        { value: 'name', label: 'Sortuj: Nazwa A–Z' },
                    ]}
                    onChange={(value) => {
                        setSort(value);
                        setPage(1);
                    }}
                    className="min-w-0"
                />
            </div>
            <ItemsTable
                items={filteredItems.map((item) => ({
                    id: item.id,
                    title: item.name,
                    icon: <ToolOutlined aria-hidden="true" />,
                    description: (
                        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="font-mono">#{item.id}</span>
                            <span>
                                {categoryLabels[item.category] ?? item.category}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <span
                                    className={`size-1.5 rounded-full ${statusColors[item.status.tone]}`}
                                />
                                {item.status.label}
                            </span>
                            <span>
                                {item.quantity} {item.unit}
                            </span>
                        </span>
                    ),
                    actions: (
                        <div className="flex items-center justify-end gap-1">
                            <Button
                                type="secondary"
                                size="small"
                                onClick={() =>
                                    router.visit(showThing(item.slug).url)
                                }
                            >
                                Szczegóły
                            </Button>
                            <Tooltip title="Przenieś przedmiot">
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<ExportOutlined />}
                                    aria-label={`Przenieś: ${item.name}`}
                                    onClick={() =>
                                        message.info(
                                            'Przenoszenie przedmiotu będzie dostępne po podłączeniu backendu.',
                                        )
                                    }
                                />
                            </Tooltip>
                        </div>
                    ),
                }))}
                pagination={{ current: page, onChange: setPage, pageSize: 5 }}
                actionsColumnWidth={176}
                className="[&_.ant-table-row]:bg-tertiary! [&_.ant-table-tbody>tr>td]:bg-tertiary!"
                locale={{
                    emptyText: items.length
                        ? 'Brak przedmiotów pasujących do filtrów'
                        : 'Brak przedmiotów w tej lokalizacji',
                }}
            />
        </SectionCard>
    );
}
