import { Carousel, Input, Select } from 'antd';
import { useRef } from 'react';
import Button from '@/components/Button';

type FilterOption = {
    value: string;
    label: string;
    count?: number;
};

type FiltersProps = {
    options: FilterOption[];
    value: string;
    onChange: (value: string) => void;
    search: string;
    onSearchChange: (value: string) => void;
    onSearch: (value: string) => void;
    searchPlaceholder?: string;
    sortOptions: { value: string; label: string }[];
    sort: string;
    onSortChange: (value: string) => void;
};

export default function Filters({
    options,
    value,
    onChange,
    search,
    onSearchChange,
    onSearch,
    searchPlaceholder = 'Szukaj...',
    sortOptions,
    sort,
    onSortChange,
}: FiltersProps) {
    const dragged = useRef(false);

    return (
        <div className="grid min-w-0 grid-cols-1 items-center gap-3 rounded-2xl bg-(--white) p-3 shadow-sm sm:grid-cols-[minmax(0,1fr)_auto] sm:rounded-[1.25rem] sm:p-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto] xl:gap-4">
            <Input.Search
                aria-label={searchPlaceholder}
                size="large"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                onSearch={onSearch}
                placeholder={searchPlaceholder}
                className="min-w-0"
            />

            <div
                role="group"
                aria-label="Filtry"
                className="order-3 min-w-0 sm:col-span-2 xl:order-2 xl:col-span-1"
                onPointerDownCapture={() => {
                    dragged.current = false;
                }}
                onClickCapture={(event) => {
                    if (dragged.current) {
                        dragged.current = false;
                        event.preventDefault();
                        event.stopPropagation();
                    }
                }}
            >
                <Carousel
                    draggable
                    swipeToSlide
                    variableWidth
                    infinite={false}
                    dots={false}
                    arrows={false}
                    swipeEvent={() => {
                        dragged.current = true;
                    }}
                    className="[&_.slick-list]:cursor-grab [&_.slick-list]:py-1 [&_.slick-list:active]:cursor-grabbing [&_.slick-slide]:pointer-events-auto! [&_.slick-slide]:w-auto! [&_.slick-track]:flex! [&_.slick-track]:w-max!"
                >
                    {options.map((option) => (
                        <div key={option.value} className="w-max! px-1">
                            <Button
                                htmlType="button"
                                type={
                                    value === option.value
                                        ? 'primary'
                                        : 'secondary'
                                }
                                size="small"
                                aria-pressed={value === option.value}
                                onClick={() => onChange(option.value)}
                                className="font-semibold!"
                            >
                                <span>
                                    {option.label}
                                    {option.count !== undefined && (
                                        <span className="ml-1 font-normal opacity-70">
                                            ({option.count})
                                        </span>
                                    )}
                                </span>
                            </Button>
                        </div>
                    ))}
                </Carousel>
            </div>

            <div className="order-2 flex h-10 items-center gap-2 rounded-xl bg-background px-3 text-xs text-(--button-text) focus-within:ring-2 focus-within:ring-primary/40 sm:h-11 sm:px-4 sm:text-sm xl:order-3">
                <span>Sortuj:</span>
                <Select
                    aria-label="Sortuj przedmioty"
                    value={sort}
                    onChange={onSortChange}
                    options={sortOptions}
                    variant="borderless"
                    className="min-w-36 flex-1 [&_.ant-select-selection-item]:font-semibold! [&_.ant-select-selection-item]:text-primary!"
                />
            </div>
        </div>
    );
}
