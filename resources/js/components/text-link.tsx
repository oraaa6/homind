import { Link } from '@inertiajs/react';
import type { ComponentProps } from 'react';
import clsx from 'clsx';

type TextLinkProps = ComponentProps<typeof Link>;

export default function TextLink({ className, ...props }: TextLinkProps) {
    return (
        <Link
            className={clsx(
                'font-medium text-primary hover:text-primary/80',
                className,
            )}
            {...props}
        />
    );
}
