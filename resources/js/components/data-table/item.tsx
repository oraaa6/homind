import type { ReactNode } from 'react';

type DataTableItemProps = {
    title: ReactNode;
    description?: ReactNode;
    icon?: ReactNode;
    badge?: ReactNode;
};

export default function DataTableItem({
    title,
    description,
    icon,
}: DataTableItemProps) {
    return (
        <div className="flex min-w-0 items-center gap-2 sm:gap-3 xl:gap-4">
            {icon && (
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-background text-base text-primary sm:size-12 sm:text-xl xl:size-14 xl:text-2xl">
                    {icon}
                </span>
            )}
            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-sm font-semibold text-foreground sm:text-base">
                        {title}
                    </span>
                </div>
                {description != null && (
                    <div className="mt-1 flex items-start gap-1.5 text-xs text-(--button-text) sm:text-sm">
                        {description}
                    </div>
                )}
            </div>
        </div>
    );
}
