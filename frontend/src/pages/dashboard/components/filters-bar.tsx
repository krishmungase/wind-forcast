import { useId, useState } from 'react';

import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { DATA_WINDOW, HORIZON } from '@/constants';
import { fromInputValue, toInputValue } from '@/lib/format.lib';
import type { TimeWindow } from '@/types/wind.types';
import { PERIODS, findPeriod } from '../lib/periods';

interface FiltersBarProps {
  range: TimeWindow;
  onRangeChange: (range: TimeWindow) => void;
  horizon: number;
  onHorizonChange: (horizon: number) => void;
}

const HORIZON_TICKS = [0, 12, 24, 36, 48];

const FiltersBar = ({
  range,
  onRangeChange,
  horizon,
  onHorizonChange,
}: FiltersBarProps) => {
  const id = useId();
  const activePeriod = findPeriod(range);

  // Draft values let the user type an invalid range without it being sent.
  const [draft, setDraft] = useState(range);
  const [prevWindow, setPrevWindow] = useState(range);
  if (prevWindow !== range) {
    setPrevWindow(range);
    setDraft(range);
  }
  const draftInvalid = draft.start >= draft.end;

  const updateDraft = (key: keyof TimeWindow, value: string) => {
    if (!value) return;
    const next = { ...draft, [key]: fromInputValue(value) };
    setDraft(next);
    if (next.start < next.end) onRangeChange(next);
  };

  return (
    <section
      aria-label="Filters"
      className="grid gap-6 rounded-xl border bg-card p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-10"
    >
      <fieldset className="min-w-0 space-y-3">
        <legend className="mb-3 text-sm font-medium">Delivery period</legend>
        <ToggleGroup
          type="single"
          variant="outline"
          spacing={2}
          value={activePeriod?.id ?? ''}
          onValueChange={(value) => {
            const period = PERIODS.find((p) => p.id === value);
            if (period) onRangeChange({ start: period.start, end: period.end });
          }}
          className="flex w-full flex-wrap justify-start"
        >
          {PERIODS.map((period) => (
            <ToggleGroupItem
              key={period.id}
              value={period.id}
              className="h-9 flex-none px-3 text-sm"
            >
              {period.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <div className="flex flex-wrap items-end gap-3">
          {(['start', 'end'] as const).map((key) => (
            <label
              key={key}
              className="grid gap-1 text-xs text-muted-foreground"
            >
              {key === 'start' ? 'From' : 'To'}
              <input
                id={`${id}-${key}`}
                type="datetime-local"
                step={1800}
                min={toInputValue(DATA_WINDOW.START)}
                max={toInputValue(DATA_WINDOW.END)}
                value={toInputValue(draft[key])}
                onChange={(e) => updateDraft(key, e.target.value)}
                aria-invalid={draftInvalid}
                aria-describedby={
                  draftInvalid ? `${id}-range-error` : undefined
                }
                className="h-9 rounded-md border border-input bg-background px-2.5 text-sm text-foreground tabular-nums shadow-xs focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none aria-invalid:border-destructive"
              />
            </label>
          ))}
          <span className="pb-2 text-xs text-muted-foreground">
            UK time (GMT)
          </span>
        </div>
        {draftInvalid && (
          <p id={`${id}-range-error`} className="text-xs text-destructive">
            The end of the period must be after the start.
          </p>
        )}
      </fieldset>

      <div className="min-w-0">
        <div className="mb-3 flex items-baseline justify-between gap-4">
          <label htmlFor={`${id}-horizon`} className="text-sm font-medium">
            Forecast horizon
          </label>
          <output
            htmlFor={`${id}-horizon`}
            className="text-2xl leading-none font-semibold"
          >
            {horizon} h
          </output>
        </div>
        <Slider
          id={`${id}-horizon`}
          min={HORIZON.MIN}
          max={HORIZON.MAX}
          step={1}
          value={[horizon]}
          onValueChange={([value]) => onHorizonChange(value)}
          aria-label="Forecast horizon in hours"
        />
        <div className="mt-2 flex justify-between text-xs text-muted-foreground tabular-nums">
          {HORIZON_TICKS.map((tick) => (
            <button
              key={tick}
              type="button"
              onClick={() => onHorizonChange(tick)}
              className="rounded-sm px-0.5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {tick === HORIZON.DEFAULT ? `${tick} h, day-ahead` : `${tick} h`}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-ink-secondary">
          {horizon === 0
            ? 'Uses the most recent forecast published before each delivery hour.'
            : `Uses the latest forecast published at least ${horizon} ${horizon === 1 ? 'hour' : 'hours'} before each delivery hour.`}
        </p>
      </div>
    </section>
  );
};

export default FiltersBar;
