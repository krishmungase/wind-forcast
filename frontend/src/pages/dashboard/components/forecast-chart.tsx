import { HugeiconsIcon } from '@hugeicons/react';
import { Download04Icon } from '@hugeicons/core-free-icons';
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Button } from '@/components/ui/button';
import { ChartContainer, type ChartConfig } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { downloadCsv, toCsv } from '@/lib/csv.lib';
import {
  formatDateTime,
  formatDay,
  formatGW,
  formatLongDateTime,
  formatSignedGW,
  formatTime,
} from '@/lib/format.lib';
import { cn } from '@/lib/utils';
import type { SeriesPoint, TimeWindow } from '@/types/wind.types';
import { ACTIVE_DOT, AXIS_PROPS, gwAxisLabel, gwTicks } from '../lib/chart';
import {
  ChartCard,
  ChartError,
  LegendKey,
  TooltipRow,
  TooltipShell,
} from './chart-parts';

interface ForecastChartProps {
  points: SeriesPoint[] | undefined;
  range: TimeWindow;
  horizon: number;
  isError: boolean;
  dimmed?: boolean;
  onRetry: () => void;
}

const HEIGHT = 340;
const DAY_MS = 24 * 60 * 60 * 1000;

const chartConfig = {
  actual: { label: 'Actual', color: 'var(--series-actual)' },
  forecast: { label: 'Forecast', color: 'var(--series-forecast)' },
} satisfies ChartConfig;

/** Pick x-axis ticks that stay readable at any range: hours for short
 *  windows, midnights every N days for longer ones. */
function buildTicks(points: SeriesPoint[], range: TimeWindow) {
  const spanDays =
    (new Date(range.end).getTime() - new Date(range.start).getTime()) / DAY_MS;
  if (spanDays <= 2) {
    const every = spanDays <= 1 ? 3 : 6;
    return {
      ticks: points
        .map((p) => p.time)
        .filter(
          (t) => t.endsWith(':00:00Z') && Number(t.slice(11, 13)) % every === 0
        ),
      format: (t: string) =>
        t.slice(11, 16) === '00:00' ? formatDay(t) : formatTime(t),
    };
  }
  const everyDays = spanDays <= 10 ? 1 : spanDays <= 20 ? 2 : 4;
  const first = new Date(range.start).getTime();
  return {
    ticks: points
      .map((p) => p.time)
      .filter(
        (t) =>
          t.endsWith('T00:00:00Z') &&
          Math.round((new Date(t).getTime() - first) / DAY_MS) % everyDays === 0
      ),
    format: formatDay,
  };
}

function exportCsv(points: SeriesPoint[], range: TimeWindow, horizon: number) {
  const csv = toCsv(
    [
      'time_utc',
      'actual_mw',
      'forecast_mw',
      'forecast_published_utc',
      'error_mw',
    ],
    points.map((p) => [
      p.time,
      p.actual,
      p.forecast,
      p.publishTime,
      p.forecast != null && p.actual != null
        ? Math.round((p.forecast - p.actual) * 10) / 10
        : null,
    ])
  );
  downloadCsv(
    `wind-${range.start.slice(0, 10)}-to-${range.end.slice(0, 10)}-${horizon}h.csv`,
    csv
  );
}

interface TooltipBodyProps {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: SeriesPoint }>;
}

const TooltipBody = ({ active, payload }: TooltipBodyProps) => {
  const point = active ? payload?.[0]?.payload : undefined;
  if (!point) return null;
  const error =
    point.forecast != null && point.actual != null
      ? point.forecast - point.actual
      : null;

  return (
    <TooltipShell title={formatLongDateTime(point.time)}>
      <TooltipRow
        color="var(--series-actual)"
        value={formatGW(point.actual)}
        label="Actual"
      />
      {point.forecast != null ? (
        <>
          <TooltipRow
            color="var(--series-forecast)"
            value={formatGW(point.forecast)}
            label="Forecast"
          />
          <TooltipRow value={formatSignedGW(error)} label="Error" />
          {point.publishTime && (
            <p className="text-muted-foreground">
              Published {formatDateTime(point.publishTime)}
            </p>
          )}
        </>
      ) : (
        <p className="text-muted-foreground">Forecasts are hourly</p>
      )}
    </TooltipShell>
  );
};

const ForecastChart = ({
  points,
  range,
  horizon,
  isError,
  dimmed,
  onRetry,
}: ForecastChartProps) => {
  const ticks = points ? buildTicks(points, range) : null;
  const yTicks = gwTicks(
    Math.max(
      0,
      ...(points ?? []).map((p) => Math.max(p.actual ?? 0, p.forecast ?? 0))
    ),
    5000
  );

  return (
    <ChartCard
      id="forecast-chart-title"
      title="Actual vs forecast wind generation"
      description="Great Britain total. Hover for the forecast’s publish time."
      aside={
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-secondary">
          <LegendKey color="var(--series-actual)">
            Actual, half-hourly
          </LegendKey>
          <LegendKey color="var(--series-forecast)">
            Forecast, {horizon} h ahead
          </LegendKey>
          <Button
            variant="outline"
            size="sm"
            disabled={!points?.length}
            onClick={() => points && exportCsv(points, range, horizon)}
          >
            <HugeiconsIcon icon={Download04Icon} size={16} />
            Download CSV
          </Button>
        </div>
      }
    >
      {isError ? (
        <ChartError height={HEIGHT} onRetry={onRetry} />
      ) : !points || !ticks ? (
        <Skeleton style={{ height: HEIGHT }} className="w-full" />
      ) : (
        <ChartContainer
          config={chartConfig}
          style={{ height: HEIGHT }}
          className={cn(
            'aspect-auto w-full transition-opacity',
            dimmed && 'opacity-60'
          )}
        >
          <LineChart
            data={points}
            margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
            accessibilityLayer
          >
            <CartesianGrid vertical={false} stroke="var(--grid)" />
            <XAxis
              dataKey="time"
              ticks={ticks.ticks}
              tickFormatter={ticks.format}
              tickLine={false}
              axisLine={{ stroke: 'var(--axis)' }}
              tickMargin={8}
              minTickGap={16}
            />
            <YAxis
              ticks={yTicks}
              domain={[0, yTicks[yTicks.length - 1]]}
              tickFormatter={(mw: number) => gwAxisLabel(mw)}
              width={60}
              {...AXIS_PROPS}
            />
            <Tooltip
              cursor={{ stroke: 'var(--axis)', strokeWidth: 1 }}
              content={({ active, payload }) => (
                <TooltipBody
                  active={active}
                  payload={payload as TooltipBodyProps['payload']}
                />
              )}
            />
            <Line
              dataKey="actual"
              type="monotone"
              stroke="var(--color-actual)"
              strokeWidth={2}
              dot={false}
              activeDot={ACTIVE_DOT}
              isAnimationActive={false}
            />
            <Line
              dataKey="forecast"
              type="monotone"
              stroke="var(--color-forecast)"
              strokeWidth={2}
              dot={false}
              activeDot={ACTIVE_DOT}
              connectNulls
              isAnimationActive={false}
            />
          </LineChart>
        </ChartContainer>
      )}
    </ChartCard>
  );
};

export default ForecastChart;
