import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import {
  AlertDiamondIcon,
  ChartIncreaseIcon,
  Target02Icon,
  WindPowerIcon,
} from '@hugeicons/core-free-icons';

import { Skeleton } from '@/components/ui/skeleton';
import { useAnimatedNumber } from '@/hooks';
import { formatGW, formatPercent, formatSignedGW } from '@/lib/format.lib';
import { cn } from '@/lib/utils';
import type { WindMetrics } from '@/types/wind.types';

interface StatStripProps {
  metrics: WindMetrics | undefined;
  dimmed?: boolean;
}

interface Stat {
  label: string;
  /** Raw MW, animated on screen and formatted by `format`. */
  value: number | null;
  format: (mw: number | null | undefined) => string;
  note: string;
  icon: IconSvgElement;
  /** The series this number describes, so its chip matches the charts. */
  tone: string;
}

function buildStats(m: WindMetrics): Stat[] {
  const bias = m.bias ?? 0;
  return [
    {
      label: 'Typical miss',
      value: m.mae,
      format: formatGW,
      note: `Mean absolute error, ${formatPercent(m.normalizedMae)} of average output. RMSE ${formatGW(m.rmse)}.`,
      icon: Target02Icon,
      tone: 'var(--series-error)',
    },
    {
      label: 'Average bias',
      value: m.bias,
      format: formatSignedGW,
      note:
        bias >= 0
          ? 'Forecast promised more wind than arrived.'
          : 'Forecast promised less wind than arrived.',
      icon: ChartIncreaseIcon,
      tone: 'var(--series-forecast)',
    },
    {
      label: 'Bad-hour miss',
      value: m.p90AbsError,
      format: formatGW,
      note: 'Nine hours in ten missed by less than this.',
      icon: AlertDiamondIcon,
      tone: 'var(--series-error)',
    },
    {
      label: 'Wind you could count on',
      value: m.p10Actual,
      format: formatGW,
      note: 'Actual output stayed above this 90% of the time.',
      icon: WindPowerIcon,
      tone: 'var(--series-actual)',
    },
  ];
}

/** Counts up to the value, and eases between values when filters change. */
const AnimatedValue = ({ stat }: { stat: Stat }) => {
  const value = useAnimatedNumber(stat.value);
  return <>{stat.format(value)}</>;
};

/** Four headline numbers in one ruled panel strip. */
const StatStrip = ({ metrics, dimmed }: StatStripProps) => {
  const stats = metrics && metrics.count > 0 ? buildStats(metrics) : null;

  return (
    <dl
      className={cn(
        'panel grid grid-cols-1 divide-y rounded-2xl transition-opacity sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x',
        dimmed && 'opacity-60'
      )}
    >
      {(stats ?? Array.from({ length: 4 }, () => null)).map((stat, i) => (
        <div
          key={stat?.label ?? i}
          className={cn(
            'flex flex-col gap-1.5 p-5 sm:p-6',
            // 2x2 on tablet: rule between rows and columns.
            'sm:max-lg:even:border-l sm:max-lg:nth-[n+3]:border-t'
          )}
        >
          {stat ? (
            <>
              <dt className="flex items-center gap-2.5 text-sm font-medium text-ink-secondary">
                <span
                  className="grid size-7 place-items-center rounded-lg"
                  style={{
                    color: stat.tone,
                    background: `color-mix(in srgb, ${stat.tone} 14%, transparent)`,
                  }}
                >
                  <HugeiconsIcon icon={stat.icon} size={16} />
                </span>
                {stat.label}
              </dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight">
                <AnimatedValue stat={stat} />
              </dd>
              <dd className="text-xs leading-snug text-muted-foreground">
                {stat.note}
              </dd>
            </>
          ) : (
            <>
              <Skeleton className="h-7 w-36" />
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-4 w-40" />
            </>
          )}
        </div>
      ))}
    </dl>
  );
};

export default StatStrip;
