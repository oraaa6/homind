import { BellOutlined, PlusOutlined, QrcodeOutlined } from '@ant-design/icons';
import { Avatar, Badge, Dropdown, Grid, Input, Layout, Menu } from 'antd';
import clsx from 'clsx';
import { useMemo, useState } from 'react';
import Button from '@/components/Button';
import type { AppLayoutProps } from '@/types';
import { useMenuItems } from '../../hooks/use-menu-items';
import { getBottomNavItems, getDropdownItems, getNavItems } from './nav-items';
import styles from './styles.module.css';

const { Sider, Content } = Layout;

function Topbar() {
    const { Search } = Input;

    return (
        <div className="flex flex-col-reverse gap-3 border-b border-neutral/25 bg-background px-4 py-4 sm:h-18! sm:flex-row sm:items-center sm:justify-between sm:px-8! sm:py-0">
            <Search
                placeholder="Szukaj..."
                className="w-full sm:max-w-xl"
                classNames={{
                    button: {
                        root: 'border-[#777775]! bg-transparent! shadow-none!',
                        icon: 'text-primary!',
                    },
                }}
            />
            <div className="flex w-full items-center justify-end gap-3 sm:w-auto sm:gap-6">
                <Badge count={2} offset={[-5, 10]}>
                    <Button
                        type="text"
                        className="size-9! sm:size-10!"
                        icon={<BellOutlined width={24} height={24} />}
                    />
                </Badge>
                <Dropdown
                    menu={{ items: getDropdownItems }}
                    trigger={['click']}
                >
                    <Avatar
                        className="size-9! cursor-pointer! sm:size-11!"
                        size={44}
                        // src={avatarUrl}
                    >
                        O
                    </Avatar>
                </Dropdown>
            </div>
        </div>
    );
}

export default function BaseLayout({ children }: AppLayoutProps) {
    const screens = Grid.useBreakpoint();
    const isMobile = !screens.lg;
    const [collapsed, setCollapsed] = useState(isMobile);
    const navItems = useMemo(() => getNavItems(), []);
    const bottomNavItems = useMemo(() => getBottomNavItems(), []);
    const nav = useMenuItems(navItems);
    const bottomNav = useMenuItems(bottomNavItems);

    return (
        <Layout className="relative min-h-svh rounded-xl">
            <Sider
                width={300}
                className={clsx(
                    'min-h-svh bg-surface-muted! p-6',
                    isMobile && styles.mobileSider,
                    isMobile && collapsed && styles.mobileSiderCollapsed,
                )}
                breakpoint="lg"
                collapsedWidth={isMobile ? 0 : 270}
                collapsible
                collapsed={collapsed}
                onBreakpoint={(broken) => setCollapsed(broken)}
                onCollapse={(value) => setCollapsed(value)}
                trigger={isMobile ? undefined : null}
                zeroWidthTriggerStyle={{ color: '#4a5d4e' }}
            >
                <div className="flex min-h-svh flex-col">
                    <img
                        src="/icons/homind-logo.svg"
                        className="max-w-28"
                        alt=""
                    />
                    <Button
                        type="primary"
                        size="small"
                        icon={<PlusOutlined />}
                        className="mt-8 mb-2 w-full"
                    >
                        Dodaj
                    </Button>
                    <Button
                        type="secondary"
                        size="small"
                        icon={<QrcodeOutlined />}
                        className="mb-8 w-full"
                    >
                        Skanuj
                    </Button>
                    <Menu
                        mode="inline"
                        selectedKeys={nav.selectedKeys}
                        items={nav.items}
                        onClick={() => {
                            if (isMobile) {
                                setCollapsed(true);
                            }
                        }}
                        className={clsx(
                            styles.homindSidebarMenu,
                            'flex-1 border-none! bg-transparent!',
                        )}
                    />
                    <div className="mt-auto border-t border-neutral/25 pt-4">
                        <Menu
                            mode="inline"
                            selectedKeys={bottomNav.selectedKeys}
                            items={bottomNav.items}
                            onClick={() => {
                                if (isMobile) {
                                    setCollapsed(true);
                                }
                            }}
                            className={clsx(
                                styles.homindSidebarMenu,
                                'border-none! bg-transparent!',
                            )}
                        />
                    </div>
                </div>
            </Sider>
            <Layout>
                <Topbar />
                <Content>
                    <div className="mx-auto w-full px-8 py-20">{children}</div>
                </Content>
            </Layout>
        </Layout>
    );
}
