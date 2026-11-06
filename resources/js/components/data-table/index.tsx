import type { TableProps } from 'antd';
import { Table } from 'antd';
import clsx from 'clsx';
import styles from './styles.module.css';

export { default as DataTableItem } from './item';

type DataTableProps<T extends object> = TableProps<T> & {
    variant?: 'default' | 'muted';
};

export default function DataTable<T extends object>({
    className,
    pagination,
    locale,
    showHeader = false,
    variant = 'default',
    ...props
}: DataTableProps<T>) {
    return (
        <Table<T>
            rowKey="id"
            showHeader={showHeader}
            className={clsx(
                styles.table,
                !showHeader && styles.cards,
                variant === 'muted' && styles.muted,
                className,
            )}
            locale={{ emptyText: 'Brak wyników', ...locale }}
            pagination={
                pagination === false
                    ? false
                    : {
                          defaultPageSize: 4,
                          showSizeChanger: false,
                          showLessItems: true,
                          responsive: true,
                          showTotal: (total, [start, end]) =>
                              `Wyświetlono ${start}–${end} z ${total} pozycji`,
                          ...pagination,
                      }
            }
            {...props}
        />
    );
}
