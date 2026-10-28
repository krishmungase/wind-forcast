import { Skeleton } from '@/components/ui/skeleton';
import { formatGW } from '@/lib/format.lib';
import type { WindMetrics } from '@/types/wind.types';

interface HeadlineProps {
  metrics: WindMetrics | undefined;
  horizon: number;
  periodLabel: string;
}

function leadIn(horizon: number): string {
  if (horizon === 0) return 'With the freshest forecast available';
  if (horizon === 1) return 'Bought one hour ahead';
  return `Bought ${horizon} hours ahead`;
}

/**
 * The page's answer in one sentence: how far off was the forecast the desk
 * would have bought on. Rewrites itself as the horizon and period change.
 */
const Headline = ({ metrics, horizon, periodLabel }: HeadlineProps) => {
  if (!metrics) {
    return (
      <div className="space-y-3" aria-busy="true">
        <Skeleton className="h-10 w-full max-w-3xl" />
        <Skeleton className="h-10 w-2/3 max-w-2xl" />
      </div>
    );
  }

  if (metrics.count === 0 || metrics.mae == null || metrics.bias == null) {
    return (
      <h1 className="max-w-4xl text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl">
        No forecast was published {horizon} hours ahead for this period. Try a
        shorter horizon.
      </h1>
    );
  }

  const direction = metrics.bias >= 0 ? 'high' : 'low';

  return (
    <div className="space-y-3">
      <h1
        aria-live="polite"
        className="max-w-4xl text-3xl leading-[1.15] font-semibold tracking-tight text-balance sm:text-[2.75rem]"
      >
        {leadIn(horizon)}, the wind forecast was off by {formatGW(metrics.mae)}{' '}
        in a typical hour, and ran {formatGW(Math.abs(metrics.bias))}{' '}
        {direction} on average.
      </h1>
      <p className="max-w-3xl text-base text-ink-secondary">
        {periodLabel}, measured over {metrics.count.toLocaleString('en-GB')}{' '}
        delivery hours against Elexon’s metered wind output.
      </p>
    </div>
  );
};

export default Headline;
