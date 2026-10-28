import { useState } from 'react';

import {
  useErrorByHour,
  useHorizonCurve,
  useWindMetrics,
  useWindSeries,
} from '@/api/wind';
import { HORIZON } from '@/constants';
import { useDebounce } from '@/hooks';
import { formatDay } from '@/lib/format.lib';
import type { TimeWindow } from '@/types/wind.types';
import {
  FiltersBar,
  ForecastChart,
  Headline,
  HorizonChart,
  HourlyErrorChart,
  MethodNote,
  SiteHeader,
  StatStrip,
  Takeaways,
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
  const curve = useHorizonCurve(range);
  const hours = useErrorByHour(range, queryHorizon);

  return (
    <div className="relative min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl space-y-6 px-4 pt-6 pb-6 sm:px-6 sm:pt-8">
        <div id="overview" className="scroll-mt-28 space-y-6">
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
        </div>
        <div id="analysis" className="grid scroll-mt-28 gap-6 lg:grid-cols-2">
          <HorizonChart
            curve={curve.data}
            horizon={queryHorizon}
            onHorizonChange={setHorizon}
            isError={curve.isError}
            dimmed={curve.isPlaceholderData}
            onRetry={() => curve.refetch()}
          />
          <HourlyErrorChart
            hours={hours.data}
            horizon={queryHorizon}
            isError={hours.isError}
            dimmed={hours.isPlaceholderData}
            onRetry={() => hours.refetch()}
          />
        </div>
        <div className="pt-6">
          <Takeaways
            metrics={metrics.data}
            curve={curve.data}
            hours={hours.data}
            horizon={queryHorizon}
          />
        </div>
        <MethodNote />
      </main>
    </div>
  );
}
