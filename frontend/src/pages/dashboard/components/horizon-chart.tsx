import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { ChartContainer, type ChartConfig } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { HORIZON } from '@/constants';
import { formatGW, formatSignedGW } from '@/lib/format.lib';
import { cn } from '@/lib/utils';
import type { HorizonPoint } from '@/types/wind.types';
import { ACTIVE_DOT, AXIS_PROPS, gwAxisLabel, gwTicks } from '../lib/chart';
import { ChartCard, ChartError, TooltipRow, TooltipShell } from './chart-parts';
import DataTable from './data-table';

interface HorizonChartProps {
  curve: HorizonPoint[] | undefined;
  horizon: number;
  onHorizonChange: (horizon: number) => void;
  isError: boolean;
  dimmed?: boolean;
  onRetry: () => void;
}

const HEIGHT = 260;
const X_TICKS = [0, 12, 24, 36, 48];

const chartConfig = {
  mae: { label: 'Typical miss', color: 'var(--series-error)' },
} satisfies ChartConfig;

interface TooltipBodyProps {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: HorizonPoint }>;
}

const TooltipBody = ({ active, payload }: TooltipBodyProps) => {
  const point = active ? payload?.[0]?.payload : undefined;
  if (!point) return null;
  return (
    <TooltipShell title={`${point.horizon} h ahead`}>
      <TooltipRow
        color="var(--series-error)"
        value={formatGW(point.mae)}
        label="Typical miss (MAE)"
      />
      <TooltipRow value={formatSignedGW(point.bias)} label="Bias" />
      <p className="text-muted-foreground">
        {point.count.toLocaleString('en-GB')} hours. Click to use this horizon.
      </p>
    </TooltipShell>
  );
};

/** Typical miss at every horizon, with the selected horizon marked. Clicking a
 *  point moves the horizon slider; the slider stays the keyboard route. */
const HorizonChart = ({
  curve,
  horizon,
  onHorizonChange,
  isError,
  dimmed,
  onRetry,
}: HorizonChartProps) => {
  const current = curve?.find((p) => p.horizon === horizon);
  const yTicks = gwTicks(Math.max(0, ...(curve ?? []).map((p) => p.mae)), 500);
  const labelSide =
    horizon <= 6 ? 'right' : horizon >= HORIZON.MAX - 6 ? 'left' : 'top';

  return (
    <ChartCard
      id="horizon-chart-title"
      title="Error grows with lead time"
      description="Typical miss (mean absolute error) by how far ahead the forecast was made."
    >
      {isError ? (
        <ChartError height={HEIGHT} onRetry={onRetry} />
      ) : !curve ? (
        <Skeleton style={{ height: HEIGHT }} className="w-full" />
      ) : (
        <>
          <ChartContainer
            config={chartConfig}
            style={{ height: HEIGHT }}
            className={cn(
              'aspect-auto w-full cursor-pointer transition-opacity',
              dimmed && 'opacity-60'
            )}
          >
            <LineChart
              data={curve}
              margin={{ top: 24, right: 12, bottom: 0, left: 0 }}
              onClick={(state) => {
                const next = Number(state?.activeLabel);
                if (Number.isFinite(next)) onHorizonChange(next);
              }}
            >
              <CartesianGrid vertical={false} stroke="var(--grid)" />
              <XAxis
                dataKey="horizon"
                type="number"
                domain={[HORIZON.MIN, HORIZON.MAX]}
                ticks={X_TICKS}
                tickFormatter={(h: number) => `${h}\u00a0h`}
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
              <ReferenceLine x={horizon} stroke="var(--axis)" />
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
                dataKey="mae"
                type="monotone"
                stroke="var(--color-mae)"
                strokeWidth={2}
                dot={false}
                activeDot={ACTIVE_DOT}
                isAnimationActive={false}
              />
              {current && (
                <ReferenceDot
                  x={current.horizon}
                  y={current.mae}
                  r={5}
                  fill="var(--series-error)"
                  stroke="var(--card)"
                  strokeWidth={2}
                  label={{
                    value: `${formatGW(current.mae)} at ${current.horizon}\u00a0h`,
                    position: labelSide,
                    offset: 10,
                    fill: 'var(--foreground)',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                />
              )}
            </LineChart>
          </ChartContainer>
          <DataTable
            caption="Forecast error by horizon"
            rows={curve}
            rowKey={(p) => p.horizon}
            columns={[
              { header: 'Hours ahead', cell: (p) => `${p.horizon}` },
              {
                header: 'Typical miss',
                cell: (p) => formatGW(p.mae),
                numeric: true,
              },
              { header: 'RMSE', cell: (p) => formatGW(p.rmse), numeric: true },
              {
                header: 'Bias',
                cell: (p) => formatSignedGW(p.bias),
                numeric: true,
              },
              {
                header: 'Hours',
                cell: (p) => p.count.toLocaleString('en-GB'),
                numeric: true,
              },
            ]}
          />
        </>
      )}
    </ChartCard>
  );
};

export default HorizonChart;
