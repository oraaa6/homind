import { useState } from 'react';

export enum SortValue {
    Newest = 'newest',
    Oldest = 'oldest',
    Name = 'name',
}

export type SortOption = {
    value: SortValue;
    label: string;
};

export const listSortOptions: SortOption[] = [
    { value: SortValue.Newest, label: 'Najnowsze' },
    { value: SortValue.Oldest, label: 'Najstarsze' },
    { value: SortValue.Name, label: 'Nazwa A–Z' },
];

type SortableListItem = {
    name: string;
    createdAt: string;
};

type UseListControlsOptions<T extends SortableListItem> = {
    items: T[];
    getFilterValue: (item: T) => string;
    getSearchText: (item: T) => string;
    pageSize: number;
};

export default function useListControls<T extends SortableListItem>({
    items,
    getFilterValue,
    getSearchText,
    pageSize,
}: UseListControlsOptions<T>) {
    const [filter, setFilter] = useState('all');
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState(SortValue.Newest);
    const [page, setPage] = useState(1);
    const query = search.trim().toLocaleLowerCase('pl');

    const filteredItems = items
        .filter(
            (item) =>
                (filter === 'all' || getFilterValue(item) === filter) &&
                getSearchText(item).toLocaleLowerCase('pl').includes(query),
        )
        .sort((first, second) => {
            if (sort === SortValue.Name) {
                return first.name.localeCompare(second.name, 'pl');
            }

            return sort === SortValue.Oldest
                ? first.createdAt.localeCompare(second.createdAt)
                : second.createdAt.localeCompare(first.createdAt);
        });

    return {
        filter,
        searchInput,
        sort,
        filteredItems,
        pagination: {
            current: page,
            defaultPageSize: pageSize,
            onChange: setPage,
        },
        onFilterChange: (value: string) => {
            setFilter(value);
            setPage(1);
        },
        onSearchInputChange: setSearchInput,
        onSearch: (value: string) => {
            setSearch(value);
            setPage(1);
        },
        onSortChange: (value: SortValue) => {
            setSort(value);
            setPage(1);
        },
    };
}
