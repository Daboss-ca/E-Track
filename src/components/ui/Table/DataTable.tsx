import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Inbox } from 'lucide-react';
import type { ColumnAlign, DataTableColumn, DataTableProps, SortDirection, TruncateMode } from './types';
import { compareSortValues, isEmptyValue, middleTruncate } from './utils';

const DENSITY_STYLES: Record<string, { cell: string; header: string; text: string }> = {
  compact: { cell: 'px-2.5 py-1.5', header: 'px-2.5 py-2', text: 'text-[11px]' },
  default: { cell: 'px-3 py-2.5', header: 'px-3 py-2.5', text: 'text-xs' },
  comfortable: { cell: 'px-4 py-3.5', header: 'px-4 py-3', text: 'text-sm' },
};

function alignClass(align: ColumnAlign): string {
  if (align === 'right') return 'text-right';
  if (align === 'center') return 'text-center';
  return 'text-left';
}

function resolveAlign<T>(column: DataTableColumn<T>): ColumnAlign {
  if (column.align) return column.align;
  return column.dataType === 'numeric' ? 'right' : 'left';
}

function resolveTruncate<T>(column: DataTableColumn<T>): TruncateMode {
  if (column.dataType === 'numeric') return 'none';
  if (column.truncate) return column.truncate;
  if (column.dataType === 'identifier') return 'middle';
  if (column.dataType === 'custom') return 'none';
  return 'end';
}

export function DataTable<T>({
  columns,
  data,
  getRowId,
  density = 'default',
  rowActions,
  emptyMessage = 'No records found.',
  emptyIcon,
  zebra,
  className = '',
  maxHeight,
  defaultSort,
  onSortChange,
  isLoading = false,
  skeletonRows = 5,
  ...rest
}: DataTableProps<T>) {
  const [sort, setSort] = useState<{ key: string; direction: SortDirection } | undefined>(defaultSort);
  const densityStyle = DENSITY_STYLES[density] ?? DENSITY_STYLES.default;
  const effectiveZebra = zebra ?? columns.length >= 7;
  const hasActions = Boolean(rowActions);
  const ariaLabel = rest['aria-label'];

  const sortedData = useMemo(() => {
    if (!sort) return data;
    const column = columns.find((c) => c.key === sort.key);
    if (!column || !column.sortable) return data;

    const getSortValue = (row: T): string | number | null | undefined => {
      if (column.sortValue) return column.sortValue(row);
      const raw = column.accessor ? column.accessor(row) : undefined;
      return typeof raw === 'string' || typeof raw === 'number' ? raw : undefined;
    };

    const sorted = [...data].sort((a, b) => compareSortValues(getSortValue(a), getSortValue(b)));
    return sort.direction === 'desc' ? sorted.reverse() : sorted;
  }, [data, sort, columns]);

  const handleSort = (column: DataTableColumn<T>) => {
    if (!column.sortable) return;
    setSort((prev) => {
      const next: { key: string; direction: SortDirection } =
        prev && prev.key === column.key
          ? { key: column.key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
          : { key: column.key, direction: 'asc' };
      onSortChange?.(next.key, next.direction);
      return next;
    });
  };

  const renderCellContent = (column: DataTableColumn<T>, row: T): React.ReactNode => {
    if (column.render) return column.render(row);

    const raw = column.accessor ? column.accessor(row) : undefined;
    if (isEmptyValue(raw)) return <span className="text-gray-300 dark:text-gray-700">-</span>;

    if (typeof raw === 'string' && resolveTruncate(column) === 'middle') {
      const truncated = middleTruncate(raw, column.truncateAt ?? 20);
      return truncated === raw ? raw : <span title={raw}>{truncated}</span>;
    }

    return raw;
  };

  const colCount = columns.length + (hasActions ? 1 : 0);

  return (
    <div
      className={`w-full overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 ${className}`}
      style={maxHeight ? { maxHeight, overflowY: 'auto' } : undefined}
    >
      <table className="w-full min-w-[750px] border-collapse" aria-label={ariaLabel}>
        <thead className="sticky top-0 z-30 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
          <tr>
            {columns.map((column) => {
              const align = resolveAlign(column);
              const isSorted = sort?.key === column.key;
              const isPinnedLeft = column.pin === 'left';

              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={isSorted ? (sort!.direction === 'asc' ? 'ascending' : 'descending') : undefined}
                  className={`${densityStyle.header} ${densityStyle.text} font-medium whitespace-nowrap ${alignClass(
                    align
                  )} bg-gray-50 dark:bg-gray-800 ${
                    isPinnedLeft ? 'sticky left-0 z-40 bg-gray-50 dark:bg-gray-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]' : ''
                  }`}
                  style={{ width: column.width, minWidth: column.minWidth }}
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(column)}
                      className={`inline-flex w-full items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 transition-colors ${
                        align === 'right' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <span>{column.header}</span>
                      {isSorted &&
                        (sort!.direction === 'asc' ? (
                          <ArrowUp className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ) : (
                          <ArrowDown className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ))}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
            {hasActions && (
              <th
                scope="col"
                className={`${densityStyle.header} ${densityStyle.text} font-medium text-right whitespace-nowrap bg-gray-50 dark:bg-gray-800`}
                style={{ minWidth: '220px' }}
              >
                Actions
              </th>
            )}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
          {isLoading ? (
            Array.from({ length: skeletonRows }).map((_, rowIdx) => (
              <tr key={`skeleton-${rowIdx}`} className="bg-white dark:bg-gray-900">
                {columns.map((column) => (
                  <td key={column.key} className={densityStyle.cell}>
                    <div
                      className="h-3 rounded bg-gray-100 dark:bg-gray-800 animate-pulse"
                      style={{ width: `${55 + ((rowIdx * 13 + column.key.length * 7) % 35)}%` }}
                    />
                  </td>
                ))}
                {hasActions && <td className={densityStyle.cell} />}
              </tr>
            ))
          ) : sortedData.length === 0 ? (
            <tr>
              <td colSpan={colCount} className="p-10">
                <div className="flex flex-col items-center justify-center gap-2 text-gray-400 dark:text-gray-600">
                  {emptyIcon ?? <Inbox className="h-5 w-5" />}
                  <span className="text-xs">{emptyMessage}</span>
                </div>
              </td>
            </tr>
          ) : (
            sortedData.map((row, rowIdx) => {
              const rowBg =
                effectiveZebra && rowIdx % 2 === 1
                  ? 'bg-gray-50/50 dark:bg-white/[0.015]'
                  : 'bg-white dark:bg-gray-900';

              return (
                <tr key={getRowId(row)} className={`transition-colors hover:bg-gray-50/70 dark:hover:bg-white/[0.03] ${rowBg}`}>
                  {columns.map((column) => {
                    const align = resolveAlign(column);
                    const isNumeric = column.dataType === 'numeric';
                    const truncateMode = resolveTruncate(column);
                    const isPinnedLeft = column.pin === 'left';

                    return (
                      <td
                        key={column.key}
                        className={`${densityStyle.cell} ${densityStyle.text} ${alignClass(align)} ${
                          isNumeric
                            ? 'tabular-nums whitespace-nowrap text-gray-800 dark:text-gray-200'
                            : 'text-gray-700 dark:text-gray-300'
                        } ${truncateMode === 'end' ? 'max-w-[16rem] truncate' : ''} ${
                          isPinnedLeft ? `sticky left-0 z-20 ${rowBg} shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] font-medium text-gray-900 dark:text-gray-100` : ''
                        }`}
                        style={{ width: column.width, minWidth: column.minWidth }}
                      >
                        {renderCellContent(column, row)}
                      </td>
                    );
                  })}

                  {hasActions && (
                    <td className={`${densityStyle.cell} text-right whitespace-nowrap ${rowBg}`} style={{ minWidth: '220px' }}>
                      <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                        {rowActions!(row)}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;