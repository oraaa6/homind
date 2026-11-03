import { ArrowLeftOutlined } from '@ant-design/icons';
import { Link } from '@inertiajs/react';
import type { ComponentProps } from 'react';
import Button from '@/components/Button';
import { cn } from '@/lib/utils';

type HeadingButtonProps = Omit<ComponentProps<typeof Button>, 'type'>;

export default function Heading({
    title,
    description,
    variant = 'default',
    secondaryButtonProps,
    primaryButtonProps,
    backLink,
    className,
}: {
    title: string;
    description?: string;
    variant?: 'default' | 'small';
    secondaryButtonProps?: HeadingButtonProps;
    primaryButtonProps?: HeadingButtonProps;
    backLink?: { href: string; label: string };
    className?: string;
}) {
    return (
        <header
            className={cn(
                'mb-8 flex min-w-0 flex-col gap-4 xl:flex-row xl:items-end xl:justify-between xl:gap-6',
                variant === 'small' && 'mb-0',
                className,
            )}
        >
            <div className="min-w-0">
                {backLink && (
                    <Link
                        href={backLink.href}
                        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-(--button-text) hover:text-primary sm:mb-7 sm:text-base"
                    >
                        <ArrowLeftOutlined aria-hidden="true" />
                        {backLink.label}
                    </Link>
                )}
                <h2
                    className={
                        variant === 'small'
                            ? 'text-xl font-medium text-foreground sm:text-2xl'
                            : 'text-[1.75rem] leading-tight font-semibold text-foreground sm:text-[2.25rem]'
                    }
                >
                    {title}
                </h2>
                {description && (
                    <p className="mt-1 text-sm text-(--button-text) sm:text-base">
                        {description}
                    </p>
                )}
            </div>
            {(secondaryButtonProps || primaryButtonProps) && (
                <div className="flex max-w-full flex-wrap items-center gap-2 sm:gap-3 xl:shrink-0">
                    {secondaryButtonProps && (
                        <Button
                            type="secondary"
                            size="small"
                            {...secondaryButtonProps}
                        />
                    )}
                    {primaryButtonProps && (
                        <Button
                            type="primary"
                            size="small"
                            {...primaryButtonProps}
                        />
                    )}
                </div>
            )}
        </header>
    );
}
