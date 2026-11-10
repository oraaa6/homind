import clsx from 'clsx';
import type { CSSProperties, ReactNode } from 'react';

type StatisticsItem = {
    label: string;
    value: string;
    icon: string;
    description: ReactNode;
};

export default function Statistics({
    items,
    valueClassName = 'whitespace-nowrap',
}: {
    items: StatisticsItem[];
    valueClassName?: string;
}) {
    return (
        <dl
            className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-5 xl:grid-cols-[repeat(var(--statistics-columns),minmax(0,1fr))]"
            style={
                {
                    '--statistics-columns': Math.max(items.length, 1),
                } as CSSProperties
            }
        >
            {items.map((item) => (
                <div
                    key={item.label}
                    className="flex min-w-0 flex-col gap-1 rounded-xl bg-(--white) p-2.5 shadow-sm sm:gap-3 sm:rounded-2xl sm:p-4 2xl:gap-6 2xl:rounded-[1.25rem] 2xl:p-6"
                >
                    <dt className="flex min-h-6 items-center justify-between gap-1.5 sm:min-h-8 sm:gap-3 2xl:min-h-12 2xl:gap-4">
                        <span className="text-[0.75rem] leading-tight font-semibold tracking-wide text-(--button-text) uppercase sm:text-xs 2xl:text-sm">
                            {item.label}
                        </span>
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary-soft sm:size-8 sm:rounded-lg 2xl:size-10 2xl:rounded-xl">
                            <img
                                src={item.icon}
                                alt=""
                                className="size-3 sm:size-4 2xl:size-5"
                            />
                        </span>
                    </dt>
                    <dd>
                        <p
                            className={clsx(
                                'text-[1.375rem] leading-tight font-bold tracking-tight text-foreground sm:text-2xl 2xl:text-[2.5rem]',
                                valueClassName,
                            )}
                        >
                            {item.value}
                        </p>
                        <div className="mt-0.5 flex items-center gap-1 text-[0.75rem] leading-snug font-medium text-(--button-text) sm:mt-1 sm:gap-1.5 sm:text-xs 2xl:mt-2 2xl:gap-2 2xl:text-sm">
                            {item.description}
                        </div>
                    </dd>
                </div>
            ))}
        </dl>
    );
}
