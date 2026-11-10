import {
    BellOutlined,
    CloseOutlined,
    MenuOutlined,
    PlusOutlined,
    QrcodeOutlined,
} from '@ant-design/icons';
import { usePage } from '@inertiajs/react';
import { Avatar, Badge, Drawer, Dropdown, Grid, Layout, Menu } from 'antd';
import clsx from 'clsx';
import { useMemo, useState } from 'react';
import Button from '@/components/Button';
import RequiredHouseholdModal from '@/components/households/required-household-modal';
import type { AppLayoutProps } from '@/types';
import { useMenuItems } from '../../hooks/use-menu-items';
import { getBottomNavItems, getDropdownItems, getNavItems } from './nav-items';
import styles from './styles.module.css';

const { Sider, Content } = Layout;


export default function BaseLayout({ children }: AppLayoutProps) {
    const { households = [] } = usePage<{
        households?: { id: number; name: string }[];
    }>().props;
    const screens = Grid.useBreakpoint();
    const isMobile = !screens.lg;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navItems = useMemo(() => getNavItems(), []);
    const bottomNavItems = useMemo(
        () => getBottomNavItems(households),
        [households],
    );
    const nav = useMenuItems(navItems);
    const bottomNav = useMenuItems(bottomNavItems);
    const sidebarContents = (inDrawer: boolean) => (
        <div
            className={clsx(
                'flex flex-col',
                !inDrawer && 'min-h-svh',
            )}
        >
            {!inDrawer && (
                <img
                    src="/icons/homind-logo.svg"
                    className="max-w-28"
                    alt="Homind"
                />
            )}
            {/* <Button
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
            </Button> */}
            <Menu
                mode="inline"
                selectedKeys={nav.selectedKeys}
                items={nav.items}
                onClick={() => setMobileMenuOpen(false)}
                className={clsx(
                    styles.homindSidebarMenu,
                    'border-none! bg-transparent!',
                    !inDrawer && 'flex-1',
                )}
            />
            <div
                className={clsx(
                    'border-t border-neutral/25 pt-4',
                    inDrawer ? 'mt-4' : 'mt-auto',
                )}
            >
                <Menu
                    mode="inline"
                    selectedKeys={bottomNav.selectedKeys}
                    items={bottomNav.items}
                    onClick={() => setMobileMenuOpen(false)}
                    className={clsx(
                        styles.homindSidebarMenu,
                        'border-none! bg-transparent!',
                    )}
                />
            </div>
        </div>
    );

    return (
        <Layout className="relative min-h-svh rounded-xl">
            {!isMobile && (
                <Sider width={300} className="min-h-svh bg-surface-muted! p-6">
                    {sidebarContents(false)}
                </Sider>
            )}
            {isMobile && (
                <>
                    <Button
                        type="secondary"
                        size="small"
                        icon={<MenuOutlined />}
                        aria-label="Otwórz menu"
                        className="fixed top-2 left-2 z-[999] size-10! shrink-0 rounded-xl! p-0!"
                        onClick={() => setMobileMenuOpen(true)}
                    />
                    <Drawer
                        title={
                            <div className="flex w-full items-center justify-between gap-4">
                                <img
                                    src="/icons/homind-logo.svg"
                                    className="max-w-28"
                                    alt="Homind"
                                />
                                <Button
                                    type="secondary"
                                    size="small"
                                    icon={<CloseOutlined />}
                                    aria-label="Zamknij menu"
                                    className="size-9! shrink-0 rounded-xl! p-0!"
                                    onClick={() => setMobileMenuOpen(false)}
                                />
                            </div>
                        }
                        closable={false}
                        getContainer={false}
                        placement="left"
                        width={270}
                        open={mobileMenuOpen}
                        onClose={() => setMobileMenuOpen(false)}
                        styles={{
                            content: {
                                backgroundColor: 'var(--surface-muted)',
                            },
                            header: {
                                padding: '12px 24px',
                            },
                            body: { padding: 24 },
                        }}
                    >
                        {sidebarContents(true)}
                    </Drawer>
                </>
            )}
            <Layout>
                <Content>
                    <div className="mx-auto w-full px-[1rem] py-[1rem] md:px-[1.5rem]">
                        {children}
                    </div>
                </Content>
            </Layout>
            <RequiredHouseholdModal />
        </Layout>
    );
}
