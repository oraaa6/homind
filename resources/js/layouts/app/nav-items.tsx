import {
    AppstoreOutlined,
    BarChartOutlined,
    CarOutlined,
    CheckSquareOutlined,
    DatabaseOutlined,
    FileTextOutlined,
    HomeOutlined,
    QrcodeOutlined,
    SettingOutlined,
    ShoppingCartOutlined,
    ToolOutlined,
} from '@ant-design/icons';
import { Link, router } from '@inertiajs/react';
import type { MenuProps } from 'antd';
import { dashboard, logout } from '@/routes';
import { edit as editProfile } from '@/routes/profile';

export type NavItems = NonNullable<MenuProps['items']>;

export function getNavItems(): NavItems {
    return [
        {
            key: 'home',
            label: 'HOME',
            type: 'group',
            children: [
                {
                    key: dashboard.url(),
                    icon: <AppstoreOutlined />,
                    label: <Link href={dashboard()}>Dashboard</Link>,
                },
                {
                    key: 'todo',
                    icon: <CheckSquareOutlined />,
                    label: 'Do ogarnięcia',
                },
            ],
        },
        {
            key: 'dom',
            label: 'DOM',
            type: 'group',
            children: [
                {
                    key: 'items',
                    icon: <DatabaseOutlined />,
                    label: 'Przedmioty',
                },
                {
                    key: 'locations',
                    icon: <HomeOutlined />,
                    label: 'Lokalizacje',
                },
                {
                    key: 'maintenance',
                    icon: <ToolOutlined />,
                    label: 'Utrzymanie',
                },
                { key: 'routines', icon: <QrcodeOutlined />, label: 'Rutyny' },
            ],
        },
        {
            key: 'resources',
            label: 'ZASOBY',
            type: 'group',
            children: [
                {
                    key: 'supplies',
                    icon: <ShoppingCartOutlined />,
                    label: 'Zapasy',
                },
                {
                    key: 'documents',
                    icon: <FileTextOutlined />,
                    label: 'Dokumenty',
                },
                { key: 'cars', icon: <CarOutlined />, label: 'Samochody' },
            ],
        },
        {
            key: 'analysis',
            label: 'ANALIZA',
            type: 'group',
            children: [
                {
                    key: 'expenses',
                    icon: <DatabaseOutlined />,
                    label: 'Wydatki',
                },
                {
                    key: 'stats',
                    icon: <BarChartOutlined />,
                    label: 'Statystyki',
                },
            ],
        },
    ];
}

export function getBottomNavItems(): NavItems {
    return [
        {
            key: '/settings',
            icon: <SettingOutlined />,
            label: <Link href={editProfile()}>Ustawienia</Link>,
        },
    ];
}

export const getDropdownItems: MenuProps['items'] = [
    {
        label: <span>Wyloguj</span>,
        key: '0',
        onClick: () => router.post(logout.url()),
    },
    {
        label: (
            <Link href={editProfile()} className="text-primary">
                Mój profil
            </Link>
        ),
        key: '1',
    },
];
