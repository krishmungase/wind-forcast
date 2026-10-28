import { HugeiconsIcon } from '@hugeicons/react';
import { Alert02Icon } from '@hugeicons/core-free-icons';
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
import {
  formatDay,
  formatGW,
  formatGWTick,
  formatLongDateTime,
  formatSignedGW,
  formatTime,
  formatDateTime,
} from '@/lib/format.lib';
import { cn } from '@/lib/utils';
import type { SeriesPoint, TimeWindow } from '@/types/wind.types';

interface ForecastChartProps {
  points: SeriesPoint[] | undefined;
  range: TimeWindow;
  horizon: number;
  isError: boolean;
  dimmed?: boolean;
  onRetry: () => void;
}

const chartConfig = {
  actual: { label: 'Actual', color: 'var(--series-actual)' },
  forecast: { label: 'Forecast', color: 'var(--series-forecast)' },
} satisfies ChartConfig;

const DAY_MS = 24 * 60 * 60 * 1000;
const Y_STEP_MW = 5000;

/** Round 5 GW gridlines from zero up to just above the highest value. */
function buildYTicks(points: SeriesPoint[]): number[] {
  const peak = Math.max(
    Y_STEP_MW,
    ...points.map((p) => Math.max(p.actual ?? 0, p.forecast ?? 0))
  );
  const top = Math.ceil(peak / Y_STEP_MW) * Y_STEP_MW;
  return Array.from({ length: top / Y_STEP_MW + 1 }, (_, i) => i * Y_STEP_MW);
}

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

interface TooltipBodyProps {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: SeriesPoint }>;
}

// Values lead, series names follow; keyed with short line strokes.
const TooltipBody = ({ active, payload }: TooltipBodyProps) => {
  const point = active ? payload?.[0]?.payload : undefined;
  if (!point) return null;
  const error =
    point.forecast != null && point.actual != null
      ? point.forecast - point.actual
      : null;

  return (
    <div className="grid min-w-52 gap-1.5 rounded-lg border bg-popover px-3 py-2.5 text-xs text-popover-foreground shadow-lg">
      <p className="font-medium">{formatLongDateTime(point.time)}</p>
      <Row
        color="var(--series-actual)"
        value={formatGW(point.actual)}
        label="Actual"
      />
      {point.forecast != null ? (
        <>
          <Row
            color="var(--series-forecast)"
            value={formatGW(point.forecast)}
            label="Forecast"
          />
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground tabular-nums">
              {formatSignedGW(error)}
            </span>{' '}
            error
          </p>
          {point.publishTime && (
            <p className="text-muted-foreground">
              Published {formatDateTime(point.publishTime)}
            </p>
          )}
        </>
      ) : (
        <p className="text-muted-foreground">Forecasts are hourly</p>
      )}
    </div>
  );
};

const Row = ({
  color,
  value,
  label,
}: {
  color: string;
  value: string;
  label: string;
}) => (
  <p className="flex items-center gap-2">
    <span className="h-0.5 w-3 rounded-full" style={{ background: color }} />
    <span className="font-semibold tabular-nums">{value}</span>
    <span className="text-muted-foreground">{label}</span>
  </p>
);

const LegendKey = ({
  color,
  children,
}: {
  color: string;
  children: React.ReactNode;
}) => (
  <span className="flex items-center gap-2">
    <span className="h-0.5 w-4 rounded-full" style={{ background: color }} />
    {children}
  </span>
);

const ForecastChart = ({
  points,
  range,
  horizon,
  isError,
  dimmed,
  onRetry,
}: ForecastChartProps) => {
  const ticks = points ? buildTicks(points, range) : null;
  const yTicks = buildYTicks(points ?? []);

  return (
    <section
      aria-labelledby="forecast-chart-title"
      className="rounded-xl border bg-card p-4 sm:p-5"
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
          <h2 id="forecast-chart-title" className="text-lg font-semibold">
            Actual vs forecast wind generation
          </h2>
          <p className="text-sm text-muted-foreground">
            Gigawatts, Great Britain total. Hover for the forecast’s publish
            time.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-secondary">
          <LegendKey color="var(--series-actual)">
            Actual, half-hourly
          </LegendKey>
          <LegendKey color="var(--series-forecast)">
            Forecast, {horizon} h ahead
          </LegendKey>
        </div>
      </div>

      {isError ? (
        <div className="flex h-[340px] flex-col items-center justify-center gap-3 text-center">
          <HugeiconsIcon
            icon={Alert02Icon}
            size={22}
            className="text-destructive"
          />
          <p className="max-w-sm text-sm text-ink-secondary">
            Couldn’t load wind data. Check that the API is running, then try
            again.
          </p>
          <Button variant="outline" size="sm" onClick={onRetry}>
            Try again
          </Button>
        </div>
      ) : !points || !ticks ? (
        <Skeleton className="h-[340px] w-full" />
      ) : (
        <ChartContainer
          config={chartConfig}
          className={cn(
            'aspect-auto h-[340px] w-full transition-opacity',
            dimmed && 'opacity-60'
          )}
        >
          <LineChart
            data={points}
            margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
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
              tickFormatter={(mw: number) => `${formatGWTick(mw)}\u00a0GW`}
              tickLine={false}
              axisLine={false}
              width={60}
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
              activeDot={{ r: 4, stroke: 'var(--card)', strokeWidth: 2 }}
              isAnimationActive={false}
            />
            <Line
              dataKey="forecast"
              type="monotone"
              stroke="var(--color-forecast)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, stroke: 'var(--card)', strokeWidth: 2 }}
              connectNulls
              isAnimationActive={false}
            />
          </LineChart>
        </ChartContainer>
      )}
    </section>
  );
};

export default ForecastChart;
