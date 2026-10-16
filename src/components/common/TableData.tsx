import type { CSSProperties, ReactNode } from 'react';
import { Fragment } from 'react';
import { cn } from '@/lib/utils';

function getByPath(obj: object, path: string): unknown {
  const parts = path.split('.');
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

function getCellValue<T extends object>(record: T, dataIndex: keyof T | string | undefined): unknown {
  if (dataIndex == null || dataIndex === '') return undefined;
  if (typeof dataIndex === 'string' && dataIndex.includes('.')) {
    return getByPath(record, dataIndex);
  }
  return (record as Record<string, unknown>)[dataIndex as string];
}

export type TableDataColumn<T extends object> = {
  key: string;
  title: ReactNode;
  dataIndex?: keyof T | string;
  render?: (value: unknown, record: T, index: number) => ReactNode;
  width?: number | string;
  minWidth?: number | string;
  maxWidth?: number | string;
  fixed?: 'left' | 'right';
  align?: 'left' | 'center' | 'right';
  thClassName?: string;
  tdClassName?: string;
};

export type TableDataProps<T extends object> = {
  columns: TableDataColumn<T>[];
  data: T[];
  rowKey: keyof T | ((record: T) => string | number);
  renderSubRow?: (record: T, index: number) => ReactNode | null;
  minWidth?: number;
  ariaLabel?: string;
  emptyText?: ReactNode;
  loading?: boolean;
  className?: string;
  tableClassName?: string;
  style?: CSSProperties;
  tableStyle?: CSSProperties;
};

function resolveRowKey<T extends object>(
  record: T,
  index: number,
  rowKey: TableDataProps<T>['rowKey'],
): string {
  if (typeof rowKey === 'function') {
    return String(rowKey(record));
  }
  const v = (record as Record<string, unknown>)[rowKey as string];
  return v != null ? String(v) : String(index);
}

export function TableData<T extends object>({
  columns,
  data,
  rowKey,
  renderSubRow,
  minWidth = 920,
  ariaLabel = 'Bảng dữ liệu — vuốt ngang để xem thêm cột',
  emptyText = 'Không có dữ liệu.',
  loading = false,
  className,
  tableClassName,
  style,
  tableStyle,
}: TableDataProps<T>) {
  if (loading) {
    return (
      <div className={cn('flex min-h-[200px] items-center justify-center py-12 text-muted-foreground', className)}>
        <span className="text-sm">Đang tải…</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn('py-12 text-center text-sm text-muted-foreground', className)}>{emptyText}</div>
    );
  }

  const colCount = columns.length;

  return (
    <div
      className={cn(
        'w-full max-w-full min-w-0 overflow-x-auto overscroll-x-contain pb-1 pt-0 touch-pan-x [-webkit-overflow-scrolling:touch]',
        '[&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-2',
        '[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border',
        '[&::-webkit-scrollbar-track]:bg-muted/40',
        className,
      )}
      role="region"
      aria-label={ariaLabel}
      style={style}
    >
      <table
        className={cn('w-full border-separate border-spacing-0 text-left text-sm', tableClassName)}
        style={{ minWidth: `${minWidth}px`, ...tableStyle }}
      >
        <thead>
          <tr className="bg-primary text-primary-foreground">
            {columns.map(col => {
              const w = col.width != null ? (typeof col.width === 'number' ? `${col.width}px` : col.width) : undefined;
              const mw =
                col.minWidth != null
                  ? typeof col.minWidth === 'number'
                    ? `${col.minWidth}px`
                    : col.minWidth
                  : undefined;
              const mxw =
                col.maxWidth != null
                  ? typeof col.maxWidth === 'number'
                    ? `${col.maxWidth}px`
                    : col.maxWidth
                  : undefined;
              return (
                <th
                  key={col.key}
                  scope="col"
                  style={{ width: w, minWidth: mw, maxWidth: mxw }}
                  className={cn(
                    'px-3 py-3 font-semibold whitespace-nowrap',
                    col.align === 'center' && 'text-center',
                    col.align === 'right' && 'text-right',
                    col.fixed === 'left' &&
                      'sticky left-0 bg-primary text-primary-foreground shadow-[4px_0_12px_-6px_rgba(0,0,0,0.2)]',
                    col.fixed === 'right' &&
                      'sticky right-0 bg-primary text-primary-foreground shadow-[-4px_0_12px_-6px_rgba(0,0,0,0.2)]',
                    col.thClassName,
                  )}
                >
                  {col.title}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="bg-card">
          {data.map((record, index) => {
            const key = resolveRowKey(record, index, rowKey);
            const sub = renderSubRow?.(record, index);
            return (
              <Fragment key={key}>
                <tr className="group align-top hover:bg-muted/50">
                  {columns.map(col => {
                    const raw = getCellValue(record, col.dataIndex as keyof T | string | undefined);
                    const content = col.render ? col.render(raw, record, index) : (raw as ReactNode);
                    const w = col.width != null ? (typeof col.width === 'number' ? `${col.width}px` : col.width) : undefined;
                    const mw =
                      col.minWidth != null
                        ? typeof col.minWidth === 'number'
                          ? `${col.minWidth}px`
                          : col.minWidth
                        : undefined;
                    const mxw =
                      col.maxWidth != null
                        ? typeof col.maxWidth === 'number'
                          ? `${col.maxWidth}px`
                          : col.maxWidth
                        : undefined;
                    return (
                      <td
                        key={col.key}
                        style={{ width: w, minWidth: mw, maxWidth: mxw }}
                        className={cn(
                          'px-3 py-3 align-top',
                          col.align === 'center' && 'text-center',
                          col.align === 'right' && 'text-right',
                          col.fixed === 'left' &&
                            'sticky left-0 bg-white shadow-[4px_0_12px_-6px_rgba(0,0,0,0.08)]',
                          col.fixed === 'right' &&
                            'sticky right-0 bg-white shadow-[-4px_0_12px_-6px_rgba(0,0,0,0.08)]',
                          col.tdClassName,
                        )}
                      >
                        {content as ReactNode}
                      </td>
                    );
                  })}
                </tr>
                {sub != null && sub !== false ? (
                  <tr className="bg-amber-50/90">
                    <td colSpan={colCount} className="px-3 py-3">
                      {sub}
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
