import {
    CarOutlined,
    CheckOutlined,
    ClockCircleOutlined,
    EditOutlined,
    FileProtectOutlined,
    MedicineBoxOutlined,
    ToolOutlined,
    WarningOutlined,
} from '@ant-design/icons';
import { Head } from '@inertiajs/react';
import { Button, Card, Segmented, Space, Typography } from 'antd';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import Heading from '@/components/heading';
import { toDo } from '@/routes';
import styles from './styles.module.css';

type TodoCategory = 'Utrzymanie' | 'Rutyny' | 'Dokumenty' | 'Samochody';
type TodoFilter = 'Wszystko' | TodoCategory;
type TodoSectionStatus = 'overdue' | 'today' | 'thisWeek' | 'later';

type TodoItem = {
    title: string;
    category: TodoCategory;
    dueLabel: string;
    actionLabel: string;
    secondaryActionLabel?: string;
};

type TodoSection = {
    status: TodoSectionStatus;
    items: TodoItem[];
};

const filters: TodoFilter[] = [
    'Wszystko',
    'Utrzymanie',
    'Rutyny',
    'Dokumenty',
    'Samochody',
];

const todoSections: TodoSection[] = [
    {
        status: 'overdue',
        items: [
            {
                title: 'Przegląd dentystyczny',
                category: 'Rutyny',
                dueLabel: '3 dni temu',
                actionLabel: 'Zrobione',
                secondaryActionLabel: 'Edytuj',
            },
        ],
    },
    {
        status: 'today',
        items: [
            {
                title: 'Filtr wody (Wymiana)',
                category: 'Utrzymanie',
                dueLabel: 'Dzisiaj',
                actionLabel: 'Zrobione',
                secondaryActionLabel: 'Szczegóły',
            },
        ],
    },
    {
        status: 'thisWeek',
        items: [
            {
                title: 'Przegląd piecyka',
                category: 'Utrzymanie',
                dueLabel: 'Czwartek, 12:00',
                actionLabel: 'Zaplanuj',
            },
            {
                title: 'Gwarancja MacBooka',
                category: 'Dokumenty',
                dueLabel: 'Koniec: Niedziela',
                actionLabel: 'Przejrzyj',
            },
        ],
    },
    {
        status: 'later',
        items: [
            {
                title: 'Ubezpieczenie Toyota',
                category: 'Samochody',
                dueLabel: 'Za 14 dni',
                actionLabel: 'Przejrzyj',
            },
        ],
    },
];

const sectionTitle: Record<TodoSectionStatus, string> = {
    overdue: 'Przeterminowane',
    today: 'Dzisiaj',
    thisWeek: 'W tym tygodniu',
    later: 'Później',
};

const categoryIcon: Record<TodoCategory, ReactNode> = {
    Utrzymanie: <ToolOutlined />,
    Rutyny: <MedicineBoxOutlined />,
    Dokumenty: <FileProtectOutlined />,
    Samochody: <CarOutlined />,
};

const sectionToneClassName: Record<TodoSectionStatus, string> = {
    overdue: 'text-todo-danger before:bg-todo-danger',
    today: 'text-todo-primary before:bg-todo-primary',
    thisWeek: 'text-todo-indigo before:bg-todo-indigo',
    later: 'text-todo-muted before:bg-todo-muted',
};

const cardAccentClassName: Partial<Record<TodoSectionStatus, string>> = {
    overdue: 'before:bg-todo-accent-danger',
    today: 'before:bg-todo-accent-primary',
};

const itemIconClassName: Record<TodoSectionStatus, string> = {
    overdue: 'bg-todo-danger-surface text-todo-danger',
    today: 'bg-todo-primary-surface text-todo-primary',
    thisWeek: 'bg-todo-muted-surface text-todo-muted-strong',
    later: 'bg-todo-muted-surface-alt text-todo-muted-alt',
};

function CategoryFilters({
    activeFilter,
    onChange,
}: {
    activeFilter: TodoFilter;
    onChange: (filter: TodoFilter) => void;
}) {
    const filterOptions = useMemo(
        () =>
            filters.map((filter) => ({
                label: filter,
                value: filter,
                className:
                    filter === activeFilter
                        ? styles.categorySegmentedItemActive
                        : undefined,
            })),
        [activeFilter],
    );

    return (
        <div className="border-b border-todo-filter-divider pb-7">
            <Segmented
                value={activeFilter}
                options={filterOptions}
                onChange={(value) => onChange(value as TodoFilter)}
                className={clsx(
                    styles.categorySegmented,
                    'max-w-full bg-transparent! p-0!',
                )}
            />
        </div>
    );
}

function SectionHeader({ status }: Pick<TodoSection, 'status'>) {
    return (
        <div
            className={clsx(
                'mb-5 flex items-center gap-4 text-xs font-bold tracking-[0.18em] uppercase before:size-2 before:shrink-0 before:rounded-full after:h-px after:flex-1 after:bg-todo-divider',
                sectionToneClassName[status],
            )}
        >
            <span>{sectionTitle[status]}</span>
        </div>
    );
}

function TodoMeta({
    item,
    sectionStatus,
}: {
    item: TodoItem;
    sectionStatus: TodoSectionStatus;
}) {
    const isOverdue = sectionStatus === 'overdue';

    return (
        <Space
            size={10}
            wrap
            className="text-[0.85rem] leading-none font-semibold text-todo-muted-strong"
        >
            <span
                className={clsx(
                    'inline-flex items-center gap-1.5 rounded-md',
                    isOverdue &&
                        'bg-todo-danger-muted-surface px-2 py-1 text-todo-accent-danger',
                )}
            >
                {isOverdue ? <WarningOutlined /> : <ClockCircleOutlined />}
                {item.dueLabel}
            </span>
            <span aria-hidden="true">•</span>
            <span>{item.category}</span>
        </Space>
    );
}

function TodoActions({ item }: { item: TodoItem }) {
    const isDoneAction = item.actionLabel === 'Zrobione';

    return (
        <Space size={12} wrap className="justify-end">
            {item.secondaryActionLabel && (
                <Button
                    icon={
                        item.secondaryActionLabel === 'Edytuj' ? (
                            <EditOutlined />
                        ) : undefined
                    }
                    className="h-9! border-0! bg-todo-action-bg! px-4! text-sm! font-bold! text-primary! shadow-none!"
                >
                    {item.secondaryActionLabel}
                </Button>
            )}
            <Button
                type={isDoneAction ? 'primary' : 'default'}
                icon={isDoneAction ? <CheckOutlined /> : undefined}
                className={clsx(
                    'h-9! min-w-28 text-sm! font-bold! shadow-none!',
                    isDoneAction
                        ? 'bg-primary! text-white!'
                        : 'border-border! bg-todo-action-bg! text-primary!',
                )}
            >
                {item.actionLabel}
            </Button>
        </Space>
    );
}

function TodoCard({
    item,
    sectionStatus,
}: {
    item: TodoItem;
    sectionStatus: TodoSectionStatus;
}) {
    return (
        <Card
            className={clsx(
                'relative overflow-hidden rounded-lg! border-todo-card-border! shadow-none before:absolute before:top-0 before:bottom-0 before:left-0 before:w-1.5',
                cardAccentClassName[sectionStatus],
            )}
            styles={{ body: { padding: 20 } }}
        >
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div className="flex min-w-0 gap-4">
                    <span
                        className={clsx(
                            'flex size-12 shrink-0 items-center justify-center rounded-lg text-xl',
                            itemIconClassName[sectionStatus],
                        )}
                    >
                        {categoryIcon[item.category]}
                    </span>
                    <div className="min-w-0">
                        <Typography.Title
                            level={3}
                            className="mb-1.5! text-lg! font-bold! text-todo-title! sm:text-xl!"
                        >
                            {item.title}
                        </Typography.Title>
                        <TodoMeta item={item} sectionStatus={sectionStatus} />
                    </div>
                </div>
                <TodoActions item={item} />
            </div>
        </Card>
    );
}

function TodoSection({ section }: { section: TodoSection }) {
    const shouldUseColumns = section.items.length > 1;

    return (
        <section>
            <SectionHeader status={section.status} />
            <div
                className={clsx(
                    'grid gap-5',
                    shouldUseColumns && 'lg:grid-cols-2',
                    !shouldUseColumns && 'grid-cols-1',
                )}
            >
                {section.items.map((item) => (
                    <TodoCard
                        key={`${section.status}-${item.title}`}
                        item={item}
                        sectionStatus={section.status}
                    />
                ))}
            </div>
        </section>
    );
}

export default function ToDo() {
    const [activeFilter, setActiveFilter] = useState<TodoFilter>('Wszystko');

    const filteredSections = useMemo(
        () =>
            todoSections
                .map((section) => ({
                    ...section,
                    items:
                        activeFilter === 'Wszystko'
                            ? section.items
                            : section.items.filter(
                                  (item) => item.category === activeFilter,
                              ),
                }))
                .filter((section) => section.items.length > 0),
        [activeFilter],
    );

    return (
        <>
            <Head title="To-do" />
            <Heading
                title="Do ogarnięcia"
                description="Twoje centrum uwagi skupione na priorytetach. Panuj nad zaległymi zadaniami i nadchodzącymi rutynowymi czynnościami."
            />

            <div className="max-w-[96rem]">
                <CategoryFilters
                    activeFilter={activeFilter}
                    onChange={setActiveFilter}
                />

                <div className="mt-10 grid gap-11">
                    {filteredSections.map((section) => (
                        <TodoSection key={section.status} section={section} />
                    ))}
                </div>
            </div>
        </>
    );
}

ToDo.layout = {
    breadcrumbs: [
        {
            title: 'ToDo',
            href: toDo(),
        },
    ],
};
