import clsx from 'clsx';
import type { ReactNode } from 'react';

export default function SurfaceBox({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={clsx(
                'min-w-0 rounded-xl bg-tertiary p-4 sm:p-5',
                className,
            )}
        >
            {children}
        </div>
    );
}
