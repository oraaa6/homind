import {
    AppstoreOutlined,
    BarChartOutlined,
    CarOutlined,
    CheckSquareOutlined,
    DatabaseOutlined,
    FileTextOutlined,
    HomeOutlined,
    LogoutOutlined,
    QrcodeOutlined,
    ShoppingCartOutlined,
    ToolOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { Link, router } from '@inertiajs/react';
import type { MenuProps } from 'antd';
import { dashboard, logout, places, things, toDo } from '@/routes';
import { settings as householdSettings } from '@/routes/households';
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
                    key: toDo.url(),
                    icon: <CheckSquareOutlined />,
                    label: <Link href={toDo()}>Do ogarnięcia</Link>,
                },
            ],
        },
        {
            key: 'dom',
            label: 'DOM',
            type: 'group',
            children: [
                {
                    key: things.url(),
                    icon: <DatabaseOutlined />,
                    label: <Link href={things()}>Przedmioty</Link>,
                },
                {
                    key: places.url(),
                    icon: <HomeOutlined />,
                    label: <Link href={places()}>Lokalizacje</Link>,
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

export function getBottomNavItems(
    households: { id: number; name: string }[] = [],
): NavItems {
    return [
        ...(households.length
            ? households.map((household) => ({
                  key: householdSettings(household.id).url,
                  icon: <HomeOutlined />,
                  label: (
                      <Link href={householdSettings(household.id)}>
                          {households.length === 1 ? 'Dom' : household.name}
                      </Link>
                  ),
              }))
            : [
                  {
                      key: 'settings-household-required',
                      icon: <HomeOutlined />,
                      label: 'Dom',
                      disabled: true,
                  },
              ]),
        {
            key: editProfile.url(),
            icon: <UserOutlined />,
            label: <Link href={editProfile()}>Profil</Link>,
        },
        {
            key: logout.url(),
            icon: <LogoutOutlined />,
            label: 'Wyloguj',
            onClick: () => router.post(logout.url()),
        },
    ];
}

export const getDropdownItems: MenuProps['items'] = [
    {
        label: (
            <Link href={editProfile()} className="text-primary">
                Mój profil
            </Link>
        ),
        key: 'profile',
    },
];
