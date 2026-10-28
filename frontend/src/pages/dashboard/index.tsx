import { useState } from 'react';

import { useWindMetrics, useWindSeries } from '@/api/wind';
import { HORIZON } from '@/constants';
import { useDebounce } from '@/hooks';
import { formatDay } from '@/lib/format.lib';
import type { TimeWindow } from '@/types/wind.types';
import {
  FiltersBar,
  ForecastChart,
  Headline,
  SiteHeader,
  StatStrip,
} from './components';
import { DEFAULT_PERIOD, findPeriod } from './lib/periods';

function describePeriod(range: TimeWindow): string {
  const period = findPeriod(range);
  if (period)
    return period.id === 'month' ? 'All of January 2026' : period.label;
  return `${formatDay(range.start)} to ${formatDay(range.end)}`;
}

/**
 * Single-page dashboard. Owns the two filters (delivery period and forecast
 * horizon); every section below reads the same slice so the numbers agree.
 */
export default function DashboardPage() {
  const [range, setRange] = useState<TimeWindow>({
    start: DEFAULT_PERIOD.start,
    end: DEFAULT_PERIOD.end,
  });
  const [horizon, setHorizon] = useState<number>(HORIZON.DEFAULT);
  // The slider updates its label instantly; queries wait until it settles.
  const queryHorizon = useDebounce(horizon, 200);

  const series = useWindSeries(range, queryHorizon);
  const metrics = useWindMetrics(range, queryHorizon);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <FiltersBar
          range={range}
          onRangeChange={setRange}
          horizon={horizon}
          onHorizonChange={setHorizon}
        />
        <div className="space-y-6 pt-2">
          <Headline
            metrics={metrics.data}
            horizon={queryHorizon}
            periodLabel={describePeriod(range)}
          />
          <StatStrip
            metrics={metrics.data}
            dimmed={metrics.isPlaceholderData}
          />
        </div>
        <ForecastChart
          points={series.data}
          range={range}
          horizon={queryHorizon}
          isError={series.isError}
          dimmed={series.isPlaceholderData}
          onRetry={() => series.refetch()}
        />
      </main>
    </div>
  );
}
