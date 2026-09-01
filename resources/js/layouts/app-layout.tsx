import type { BreadcrumbItem } from '@/types';
import BaseLayout from './app/base-layout';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    return <BaseLayout breadcrumbs={breadcrumbs}>{children}</BaseLayout>;
}
