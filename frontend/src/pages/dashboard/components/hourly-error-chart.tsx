import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { ChartContainer, type ChartConfig } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { formatGW, formatSignedGW } from '@/lib/format.lib';
import { cn } from '@/lib/utils';
import type { HourPoint } from '@/types/wind.types';
import {
  AXIS_PROPS,
  gwAxisLabel,
  gwTicks,
  hourLabel,
  hourRange,
} from '../lib/chart';
import { ChartCard, ChartError, TooltipRow, TooltipShell } from './chart-parts';
import DataTable from './data-table';

interface HourlyErrorChartProps {
  hours: HourPoint[] | undefined;
  horizon: number;
  isError: boolean;
  dimmed?: boolean;
  onRetry: () => void;
}

const HEIGHT = 260;

const chartConfig = {
  mae: { label: 'Typical miss', color: 'var(--series-error)' },
} satisfies ChartConfig;

interface TooltipBodyProps {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: HourPoint }>;
}

const TooltipBody = ({ active, payload }: TooltipBodyProps) => {
  const point = active ? payload?.[0]?.payload : undefined;
  if (!point) return null;
  return (
    <TooltipShell title={`${hourRange(point.hour)} UK time`}>
      <TooltipRow
        color="var(--series-error)"
        value={formatGW(point.mae)}
        label="Typical miss"
      />
      <TooltipRow value={formatSignedGW(point.bias)} label="Bias" />
      <p className="text-muted-foreground">{point.count} days</p>
    </TooltipShell>
  );
};

/** Typical miss for each delivery hour of the day at the selected horizon.
 *  Only the worst hour carries a value label; the rest live in the tooltip
 *  and the table. */
const HourlyErrorChart = ({
  hours,
  horizon,
  isError,
  dimmed,
  onRetry,
}: HourlyErrorChartProps) => {
  const worst = hours?.reduce((a, b) => (b.mae > a.mae ? b : a));
  const yTicks = gwTicks(Math.max(0, ...(hours ?? []).map((h) => h.mae)), 500);

  return (
    <ChartCard
      id="hourly-chart-title"
      title="When in the day it misses"
      description={`Typical miss by delivery hour, UK time, ${horizon} h ahead.`}
    >
      {isError ? (
        <ChartError height={HEIGHT} onRetry={onRetry} />
      ) : !hours ? (
        <Skeleton style={{ height: HEIGHT }} className="w-full" />
      ) : (
        <>
          <ChartContainer
            config={chartConfig}
            style={{ height: HEIGHT }}
            className={cn(
              'aspect-auto w-full transition-opacity',
              dimmed && 'opacity-60'
            )}
          >
            <BarChart
              data={hours}
              margin={{ top: 24, right: 4, bottom: 0, left: 0 }}
              barCategoryGap="20%"
            >
              <CartesianGrid vertical={false} stroke="var(--grid)" />
              <XAxis
                dataKey="hour"
                tickFormatter={hourLabel}
                interval="equidistantPreserveStart"
                minTickGap={10}
                tickMargin={8}
                tickLine={false}
                axisLine={{ stroke: 'var(--axis)' }}
              />
              <YAxis
                ticks={yTicks}
                domain={[0, yTicks[yTicks.length - 1]]}
                tickFormatter={(mw: number) => gwAxisLabel(mw, 1)}
                width={64}
                {...AXIS_PROPS}
              />
              <Tooltip
                cursor={{ fill: 'var(--muted)', opacity: 0.6 }}
                content={({ active, payload }) => (
                  <TooltipBody
                    active={active}
                    payload={payload as TooltipBodyProps['payload']}
                  />
                )}
              />
              <Bar
                dataKey="mae"
                fill="var(--color-mae)"
                radius={[4, 4, 0, 0]}
                maxBarSize={24}
                isAnimationActive={false}
              >
                <LabelList
                  dataKey="mae"
                  position="top"
                  offset={6}
                  className="fill-foreground text-xs font-semibold"
                  formatter={(value) =>
                    worst && value === worst.mae ? formatGW(worst.mae) : ''
                  }
                />
              </Bar>
            </BarChart>
          </ChartContainer>
          <DataTable
            caption="Forecast error by delivery hour"
            rows={hours}
            rowKey={(h) => h.hour}
            columns={[
              { header: 'Hour (UK)', cell: (h) => hourRange(h.hour) },
              {
                header: 'Typical miss',
                cell: (h) => formatGW(h.mae),
                numeric: true,
              },
              {
                header: 'Bias',
                cell: (h) => formatSignedGW(h.bias),
                numeric: true,
              },
              { header: 'Days', cell: (h) => `${h.count}`, numeric: true },
            ]}
          />
        </>
      )}
    </ChartCard>
  );
};

export default HourlyErrorChart;
