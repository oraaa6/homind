import type { ItemType, MenuItemType } from 'antd/es/menu/interface';
import { useMemo } from 'react';

function isMenuItem(item: ItemType): item is MenuItemType {
    return Boolean(item && 'key' in item && item.key);
}

function getAllKeys(items: ItemType[]): string[] {
    return items.flatMap((item) => {
        if (!item) {
            return [];
        }

        const children =
            'children' in item && Array.isArray(item.children)
                ? getAllKeys(item.children)
                : [];

        return isMenuItem(item) ? [String(item.key), ...children] : children;
    });
}

export function useMenuItems(items: ItemType[]) {
    return useMemo(() => {
        const pathname = window.location.pathname;
        const selectedKey = getAllKeys(items)
            .filter((key) => pathname === key || pathname.startsWith(`${key}/`))
            .sort((a, b) => b.length - a.length)[0];

        return {
            items,
            selectedKeys: selectedKey ? [selectedKey] : [],
        };
    }, [items]);
}
