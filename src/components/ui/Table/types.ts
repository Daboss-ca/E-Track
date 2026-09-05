import type { ReactNode } from 'react';

export type ColumnDataType = 'text' | 'numeric' | 'identifier' | 'custom';
export type ColumnAlign = 'left' | 'center' | 'right';
export type TableDensity = 'compact' | 'default' | 'comfortable';
export type SortDirection = 'asc' | 'desc';
export type TruncateMode = 'end' | 'middle' | 'none';

export interface DataTableColumn<T> {
  /** Unique key for the column. Also used as the sort key and React key. */
  key: string;
  /** Header label shown in the column head. */
  header: string;
  /**
   * Reads the display value for this column off a row. Used for default
   * rendering and, when `sortValue` is omitted, for sorting too.
   * Return `null` / `undefined` / `''` to render the standard "-" placeholder.
   */
  accessor?: (row: T) => ReactNode;
  /**
   * Raw comparable value used purely for sorting. Provide this when
   * `accessor` returns JSX (badges, icons, composed nodes) rather than a
   * plain string or number.
   */
  sortValue?: (row: T) => string | number | null | undefined;
  /**
   * Fully custom cell renderer. Overrides all default formatting for this
   * column (dash-for-empty, truncation, alignment still applies via the
   * `<td>` wrapper) — use when a cell needs bespoke markup, e.g. a badge.
   */
  render?: (row: T) => ReactNode;
  /**
   * Governs the column's default alignment and truncation behavior:
   * - 'text'        -> left aligned, truncates at the end
   * - 'numeric'      -> right aligned, tabular-nums, never truncates
   * - 'identifier'   -> left aligned, truncates from the middle
   * - 'custom'       -> left aligned, no automatic truncation
   */
  dataType?: ColumnDataType;
  /** Explicit alignment override. Defaults are derived from `dataType`. */
  align?: ColumnAlign;
  /** Enables client-side sorting for this column. */
  sortable?: boolean;
  /** Truncation strategy override. Defaults are derived from `dataType`. */
  truncate?: TruncateMode;
  /**
   * Approximate character length before truncation kicks in. Applies to
   * middle-truncated identifier columns (string-length based). End-truncated
   * text columns instead rely on the column's `width`/`max-width` and CSS
   * ellipsis, since that truncation point is layout-dependent.
   */
  truncateAt?: number;
  /**
   * Pins the column to the edge of the scroll container so it stays visible
   * during horizontal scroll. Use `'left'` on the primary identity column
   * (e.g. an ID, name, or code) so context never scrolls away.
   */
  pin?: 'left' | 'right';
  /** CSS width, e.g. '12rem' or '20%'. */
  width?: string;
  /** CSS min-width — recommended on pinned columns so layout doesn't collapse. */
  minWidth?: string;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  /** Returns a stable unique id for a row, used as the React key. */
  getRowId: (row: T) => string | number;
  /** Row height / spacing variant. Defaults to 'default'. */
  density?: TableDensity;
  /**
   * Row-level actions (e.g. a kebab menu, quick buttons) rendered in a
   * trailing pinned column. Revealed on hover/focus on pointer devices;
   * always visible on touch devices where hover doesn't exist.
   */
  rowActions?: (row: T) => ReactNode;
  /** Message shown when `data` is empty. */
  emptyMessage?: string;
  /** Icon shown above the empty message. Defaults to an inbox icon. */
  emptyIcon?: ReactNode;
  /**
   * Forces zebra striping on/off. Left unset, striping auto-enables once a
   * table gets wide/dense (7+ columns) and stays off for everyday tables.
   */
  zebra?: boolean;
  className?: string;
  /**
   * Caps the table's height and enables a scrollable container with a
   * sticky header, e.g. '32rem'. Omit for a table that grows with its
   * content and has no independent vertical scroll.
   */
  maxHeight?: string;
  /** Initial sort state. */
  defaultSort?: { key: string; direction: SortDirection };
  /** Called whenever the user changes the sort column/direction. */
  onSortChange?: (key: string, direction: SortDirection) => void;
  /** Shows animated skeleton rows instead of data. */
  isLoading?: boolean;
  /** Number of skeleton rows to show while loading. Defaults to 5. */
  skeletonRows?: number;
  'aria-label'?: string;
}
