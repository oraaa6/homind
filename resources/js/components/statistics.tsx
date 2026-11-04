import clsx from 'clsx';
import type { ReactNode } from 'react';

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
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] sm:gap-5">
            {items.map((item) => (
                <div
                    key={item.label}
                    className="flex min-w-0 flex-col gap-3 rounded-2xl bg-(--white) p-4 shadow-sm 2xl:gap-6 2xl:rounded-[1.25rem] 2xl:p-6"
                >
                    <dt className="flex min-h-8 items-center justify-between gap-3 2xl:min-h-12 2xl:gap-4">
                        <span className="text-xs font-semibold tracking-wide text-(--button-text) uppercase 2xl:text-sm">
                            {item.label}
                        </span>
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft 2xl:size-10 2xl:rounded-xl">
                            <img
                                src={item.icon}
                                alt=""
                                className="size-4 2xl:size-5"
                            />
                        </span>
                    </dt>
                    <dd>
                        <p
                            className={clsx(
                                'text-2xl leading-tight font-bold tracking-tight text-foreground 2xl:text-[2.5rem]',
                                valueClassName,
                            )}
                        >
                            {item.value}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-(--button-text) 2xl:mt-2 2xl:gap-2 2xl:text-sm">
                            {item.description}
                        </div>
                    </dd>
                </div>
            ))}
        </dl>
    );
}
