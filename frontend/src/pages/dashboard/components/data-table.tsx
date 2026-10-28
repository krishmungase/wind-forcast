import { cn } from '@/lib/utils';

export interface Column<T> {
  header: string;
  cell: (row: T) => string;
  numeric?: boolean;
}

interface DataTableProps<T> {
  caption: string;
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
}

/** The table twin of a chart: every plotted value, readable without hovering. */
const DataTable = <T,>({
  caption,
  columns,
  rows,
  rowKey,
}: DataTableProps<T>) => (
  <details className="group mt-3 text-sm">
    <summary className="w-fit cursor-pointer rounded-sm text-ink-secondary select-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
      <span className="group-open:hidden">Show as table</span>
      <span className="hidden group-open:inline">Hide table</span>
    </summary>
    <div className="mt-3 max-h-72 overflow-auto rounded-md border">
      <table className="w-full border-collapse text-xs">
        <caption className="sr-only">{caption}</caption>
        <thead className="sticky top-0 bg-muted">
          <tr>
            {columns.map((col) => (
              <th
                key={col.header}
                scope="col"
                className={cn(
                  'px-3 py-2 font-medium text-ink-secondary',
                  col.numeric ? 'text-right' : 'text-left'
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className="border-t">
              {columns.map((col) => (
                <td
                  key={col.header}
                  className={cn(
                    'px-3 py-1.5',
                    col.numeric && 'text-right tabular-nums'
                  )}
                >
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </details>
);

export default DataTable;
