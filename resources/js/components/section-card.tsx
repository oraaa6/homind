import clsx from 'clsx';
import type { ReactNode } from 'react';

export default function SectionCard({
    title,
    description,
    number,
    extra,
    children,
    as: Tag = 'section',
    className,
    titleClassName,
}: {
    title?: ReactNode;
    description?: string;
    number?: string;
    extra?: ReactNode;
    children: ReactNode;
    as?: 'section' | 'aside' | 'div';
    className?: string;
    titleClassName?: string;
}) {
    return (
        <Tag
            className={clsx(
                'rounded-2xl bg-(--white) p-5 shadow-sm sm:p-7',
                className,
            )}
        >
            {title && (
                <div className="mb-6 flex flex-wrap items-start justify-between gap-3 sm:mb-8">
                    <div className="flex min-w-0 items-start gap-3">
                        {number && (
                            <span className="mt-1 rounded-lg bg-surface-muted px-2.5 py-1 text-sm font-semibold text-(--button-text)">
                                {number}
                            </span>
                        )}
                        <div className="min-w-0">
                            <h3
                                className={clsx(
                                    'flex items-center gap-3 text-xl leading-tight font-semibold sm:text-2xl',
                                    titleClassName ?? 'text-foreground',
                                )}
                            >
                                {title}
                            </h3>
                            {description && (
                                <p className="mt-1 text-sm text-(--button-text) sm:text-base">
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>
                    {extra && <div>{extra}</div>}
                </div>
            )}
            {children}
        </Tag>
    );
}
