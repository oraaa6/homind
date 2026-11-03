import type { TableProps } from 'antd';
import { Grid } from 'antd';
import type { ComponentProps, Key, ReactNode } from 'react';
import DataTable, { DataTableItem } from '@/components/data-table';

export type ItemsTableRow = ComponentProps<typeof DataTableItem> & {
    id: Key;
    value?: ReactNode;
    secondaryValue?: ReactNode;
    status?: ReactNode;
    actions?: ReactNode;
};

type ItemsTableProps = Omit<
    TableProps<ItemsTableRow>,
    'columns' | 'dataSource' | 'rowKey'
> & {
    items: ItemsTableRow[];
};

export default function ItemsTable({ items, ...props }: ItemsTableProps) {
    const isMobile = !Grid.useBreakpoint().xl;

    const hasValue = items.some(
        (item) => item.value != null || item.secondaryValue != null,
    );
    const hasStatus = items.some((item) => item.status != null);
    const hasActions = items.some((item) => item.actions != null);
    const columns: NonNullable<TableProps<ItemsTableRow>['columns']> = isMobile
        ? [
              {
                  key: 'mobile',
                  render: (_, item) => (
                      <div className="flex min-w-0 flex-col gap-3">
                          <DataTableItem {...item} />
                          {(hasValue || hasStatus) && (
                              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-neutral/20 pt-3">
                                  {hasValue && (
                                      <div className="min-w-0 text-foreground">
                                          <div className="text-sm font-semibold">
                                              {item.value}
                                          </div>
                                          <div className="text-xs text-(--button-text)">
                                              {item.secondaryValue}
                                          </div>
                                      </div>
                                  )}
                                  {hasStatus && <div>{item.status}</div>}
                              </div>
                          )}
                          {hasActions && (
                              <div className="flex justify-end">
                                  {item.actions}
                              </div>
                          )}
                      </div>
                  ),
              },
          ]
        : [
              {
                  key: 'item',
                  render: (_, item) => <DataTableItem {...item} />,
              },
          ];

    if (!isMobile && hasValue) {
        columns.push({
            key: 'value',
            width: 112,
            align: 'right',
            render: (_, item) => (
                <div className="text-foreground">
                    <div className="text-sm font-semibold sm:text-lg">
                        {item.value}
                    </div>
                    <div className="text-xs font-medium text-(--button-text)">
                        {item.secondaryValue}
                    </div>
                </div>
            ),
        });
    }

    if (!isMobile && hasStatus) {
        columns.push({
            key: 'status',
            width: 176,
            align: 'center',
            render: (_, item) => item.status,
        });
    }

    if (!isMobile && hasActions) {
        columns.push({
            key: 'actions',
            width: 128,
            align: 'right',
            render: (_, item) => item.actions,
        });
    }

    return <DataTable columns={columns} dataSource={items} {...props} />;
}
