import { Skeleton } from '@/components/ui/skeleton';
import { formatGW, formatPercent, formatSignedGW } from '@/lib/format.lib';
import { cn } from '@/lib/utils';
import type { WindMetrics } from '@/types/wind.types';

interface StatStripProps {
  metrics: WindMetrics | undefined;
  dimmed?: boolean;
}

interface Stat {
  label: string;
  value: string;
  note: string;
}

function buildStats(m: WindMetrics): Stat[] {
  const bias = m.bias ?? 0;
  return [
    {
      label: 'Typical miss',
      value: formatGW(m.mae),
      note: `Mean absolute error, ${formatPercent(m.normalizedMae)} of average output. RMSE ${formatGW(m.rmse)}.`,
    },
    {
      label: 'Average bias',
      value: formatSignedGW(m.bias),
      note:
        bias >= 0
          ? 'Forecast promised more wind than arrived.'
          : 'Forecast promised less wind than arrived.',
    },
    {
      label: 'Bad-hour miss',
      value: formatGW(m.p90AbsError),
      note: 'Nine hours in ten missed by less than this.',
    },
    {
      label: 'Wind you could count on',
      value: formatGW(m.p10Actual),
      note: 'Actual output stayed above this 90% of the time.',
    },
  ];
}

/** Four headline numbers in one ruled strip rather than four floating cards. */
const StatStrip = ({ metrics, dimmed }: StatStripProps) => {
  const stats = metrics && metrics.count > 0 ? buildStats(metrics) : null;

  return (
    <dl
      className={cn(
        'grid grid-cols-1 divide-y rounded-xl border bg-card transition-opacity sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x',
        dimmed && 'opacity-60'
      )}
    >
      {(stats ?? Array.from({ length: 4 }, () => null)).map((stat, i) => (
        <div
          key={stat?.label ?? i}
          className={cn(
            'flex flex-col gap-1 p-4 sm:p-5',
            // 2x2 on tablet: rule between rows and columns.
            'sm:max-lg:nth-[n+3]:border-t sm:max-lg:even:border-l'
          )}
        >
          {stat ? (
            <>
              <dt className="text-sm font-medium text-ink-secondary">
                {stat.label}
              </dt>
              <dd className="order-first text-3xl font-semibold tracking-tight">
                {stat.value}
              </dd>
              <dd className="text-xs leading-snug text-muted-foreground">
                {stat.note}
              </dd>
            </>
          ) : (
            <>
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-4 w-36" />
            </>
          )}
        </div>
      ))}
    </dl>
  );
};

export default StatStrip;
