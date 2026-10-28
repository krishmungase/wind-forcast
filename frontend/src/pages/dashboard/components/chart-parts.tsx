import type { ReactNode } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Alert02Icon } from '@hugeicons/core-free-icons';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChartCardProps {
  id: string;
  title: string;
  description: ReactNode;
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** Shared frame for every chart: title, one-line description, optional legend
 *  or actions on the right. */
export const ChartCard = ({
  id,
  title,
  description,
  aside,
  className,
  children,
}: ChartCardProps) => (
  <section
    aria-labelledby={id}
    className={cn('min-w-0 rounded-xl border bg-card p-4 sm:p-5', className)}
  >
    <div className="mb-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="min-w-0">
        <h2 id={id} className="text-lg font-semibold">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {aside}
    </div>
    {children}
  </section>
);

export const ChartError = ({
  height,
  onRetry,
}: {
  height: number;
  onRetry: () => void;
}) => (
  <div
    style={{ height }}
    className="flex flex-col items-center justify-center gap-3 text-center"
  >
    <HugeiconsIcon icon={Alert02Icon} size={22} className="text-destructive" />
    <p className="max-w-sm text-sm text-ink-secondary">
      Couldn’t load wind data. Check that the API is running, then try again.
    </p>
    <Button variant="outline" size="sm" onClick={onRetry}>
      Try again
    </Button>
  </div>
);

/** Legend entry: a short stroke of the series colour, never coloured text. */
export const LegendKey = ({
  color,
  shape = 'line',
  children,
}: {
  color: string;
  shape?: 'line' | 'bar';
  children: ReactNode;
}) => (
  <span className="flex items-center gap-2">
    <span
      className={cn(
        'rounded-full',
        shape === 'line' ? 'h-0.5 w-4' : 'h-2.5 w-2.5 rounded-[3px]'
      )}
      style={{ background: color }}
    />
    {children}
  </span>
);

export const TooltipShell = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <div className="grid min-w-48 gap-1.5 rounded-lg border bg-popover px-3 py-2.5 text-xs text-popover-foreground shadow-lg">
    <p className="font-medium">{title}</p>
    {children}
  </div>
);

/** Tooltip line: value first (strong), label second (muted). */
export const TooltipRow = ({
  color,
  value,
  label,
}: {
  color?: string;
  value: string;
  label: string;
}) => (
  <p className="flex items-center gap-2">
    {color && (
      <span className="h-0.5 w-3 rounded-full" style={{ background: color }} />
    )}
    <span className="font-semibold tabular-nums">{value}</span>
    <span className="text-muted-foreground">{label}</span>
  </p>
);
