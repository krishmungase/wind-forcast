import { useId, type ReactNode } from 'react';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import {
  Calendar03Icon,
  Clock01Icon,
  InformationCircleIcon,
} from '@hugeicons/core-free-icons';

import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HORIZON } from '@/constants';
import { cn } from '@/lib/utils';
import type { TimeWindow } from '@/types/wind.types';
import DateRangePicker from './date-range-picker';

interface FiltersBarProps {
  range: TimeWindow;
  onRangeChange: (range: TimeWindow) => void;
  horizon: number;
  onHorizonChange: (horizon: number) => void;
}

const HORIZON_TICKS = [0, 6, 12, 24, 36, 48];

function explainHorizon(horizon: number): string {
  return horizon === 0
    ? 'Each delivery hour uses the most recent forecast published before it.'
    : `Each delivery hour uses the latest forecast published at least ${horizon} ${horizon === 1 ? 'hour' : 'hours'} earlier. Day-ahead buying is about 24 hours.`;
}

const FieldLabel = ({
  icon,
  children,
}: {
  icon: IconSvgElement;
  children: ReactNode;
}) => (
  <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
    <HugeiconsIcon icon={icon} size={14} className="text-glow" />
    {children}
  </span>
);

/** One compact glass toolbar: delivery period on the left, forecast horizon
 *  on the right. The horizon explanation sits in a tooltip to save space. */
const FiltersBar = ({
  range,
  onRangeChange,
  horizon,
  onHorizonChange,
}: FiltersBarProps) => {
  const id = useId();
  const explanation = explainHorizon(horizon);

  return (
    <section
      aria-label="Filters"
      className="panel flex flex-col gap-4 rounded-2xl p-4 lg:flex-row lg:items-center lg:gap-6 lg:px-5 lg:py-3.5"
    >
      <div className="flex shrink-0 flex-col gap-2">
        <FieldLabel icon={Calendar03Icon}>Delivery period</FieldLabel>
        <DateRangePicker
          range={range}
          onRangeChange={onRangeChange}
          className="h-10 w-full lg:w-64"
        />
      </div>

      <div aria-hidden="true" className="hidden h-14 w-px bg-border lg:block" />

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <FieldLabel icon={Clock01Icon}>
            <label htmlFor={`${id}-horizon`}>Forecast horizon</label>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label="What the forecast horizon means"
                  className="grid size-5 place-items-center rounded-full hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <HugeiconsIcon icon={InformationCircleIcon} size={14} />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-64 text-pretty">
                {explanation}
              </TooltipContent>
            </Tooltip>
          </FieldLabel>
          <output
            htmlFor={`${id}-horizon`}
            className="rounded-full bg-glow/12 px-2.5 py-0.5 text-sm font-semibold text-glow tabular-nums"
          >
            {horizon === HORIZON.DEFAULT
              ? '24 h, day-ahead'
              : `${horizon} h ahead`}
          </output>
        </div>
        <p id={`${id}-explain`} className="sr-only">
          {explanation}
        </p>
        <Slider
          id={`${id}-horizon`}
          min={HORIZON.MIN}
          max={HORIZON.MAX}
          step={1}
          value={[horizon]}
          onValueChange={([value]) => onHorizonChange(value)}
          aria-label="Forecast horizon in hours"
          aria-describedby={`${id}-explain`}
          className="mt-3 py-1 [&_[data-slot=slider-range]]:bg-linear-to-r [&_[data-slot=slider-range]]:from-glow [&_[data-slot=slider-range]]:to-glow-2 [&_[data-slot=slider-thumb]]:size-[18px] [&_[data-slot=slider-thumb]]:border-2 [&_[data-slot=slider-thumb]]:border-white [&_[data-slot=slider-thumb]]:bg-glow [&_[data-slot=slider-thumb]]:shadow-[0_0_0_4px_color-mix(in_srgb,var(--glow)_20%,transparent)] [&_[data-slot=slider-track]]:h-1.5 [&_[data-slot=slider-track]]:bg-foreground/10"
        />
        {/* Ticks sit at each value's true position. The inset matches half the
            thumb width, which is where Radix places the thumb at 0 and 48. */}
        <div className="relative mx-[9px] mt-1.5 h-4 text-[11px] text-muted-foreground tabular-nums">
          {HORIZON_TICKS.map((tick) => (
            <button
              key={tick}
              type="button"
              onClick={() => onHorizonChange(tick)}
              style={{ left: `${(tick / HORIZON.MAX) * 100}%` }}
              className={cn(
                'absolute top-0 -translate-x-1/2 rounded-sm px-1 leading-4 whitespace-nowrap hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                tick === HORIZON.DEFAULT && 'font-medium text-glow',
                tick === horizon && 'font-semibold text-foreground'
              )}
            >
              {tick} h
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FiltersBar;
