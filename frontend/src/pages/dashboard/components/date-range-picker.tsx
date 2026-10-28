import { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon, Tick02Icon } from '@hugeicons/core-free-icons';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { TimeWindow } from '@/types/wind.types';
import { PERIODS, findPeriod } from '../lib/periods';

interface DateRangePickerProps {
  range: TimeWindow;
  onRangeChange: (range: TimeWindow) => void;
  className?: string;
}

// The data covers January 2026 only, so the calendar shows that one month.
const MONTH = new Date(2026, 0, 1);
const LAST_DAY = new Date(2026, 0, 31);

const pad = (n: number) => String(n).padStart(2, '0');

/** "2026-01-08T…Z" → a local Date for the calendar (day only). */
const toCalendarDate = (iso: string) =>
  new Date(
    Number(iso.slice(0, 4)),
    Number(iso.slice(5, 7)) - 1,
    Number(iso.slice(8, 10))
  );

/** A calendar day → that whole delivery day in UTC (00:00 to the 23:30 slot). */
const toWindow = (from: Date, to: Date): TimeWindow => {
  const ymd = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return { start: `${ymd(from)}T00:00:00Z`, end: `${ymd(to)}T23:30:00Z` };
};

function describe(range: TimeWindow): { label: string; days: number } {
  const first = Number(range.start.slice(8, 10));
  const last = Number(range.end.slice(8, 10));
  return {
    label: first === last ? `${first} Jan 2026` : `${first}–${last} Jan 2026`,
    days: last - first + 1,
  };
}

/**
 * Delivery period picker: quick picks on the left, a range calendar on the
 * right. The first click on the calendar sets the start day, the second sets
 * the end day and applies the range.
 */
const DateRangePicker = ({
  range,
  onRangeChange,
  className,
}: DateRangePickerProps) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange | undefined>();
  const active = findPeriod(range);
  const summary = describe(range);

  const selected: DateRange = draft ?? {
    from: toCalendarDate(range.start),
    to: toCalendarDate(range.end),
  };

  const apply = (next: TimeWindow) => {
    onRangeChange(next);
    setDraft(undefined);
    setOpen(false);
  };

  const pickDay = (day: Date) => {
    if (!draft?.from) {
      setDraft({ from: day, to: undefined });
      return;
    }
    const [from, to] = day < draft.from ? [day, draft.from] : [draft.from, day];
    apply(toWindow(from, to));
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setDraft(undefined);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'h-11 justify-start gap-2.5 rounded-xl border-input bg-background/60 px-3.5 text-sm font-medium shadow-none hover:bg-accent dark:bg-white/5',
            className
          )}
        >
          {summary.label}
          <span className="font-normal text-muted-foreground">
            {summary.days} {summary.days === 1 ? 'day' : 'days'}
          </span>
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            size={16}
            className="ml-auto text-muted-foreground"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="panel-raised w-auto rounded-2xl p-0 text-popover-foreground"
      >
        <div className="flex flex-col sm:flex-row">
          <ul
            aria-label="Quick picks"
            className="flex flex-row flex-wrap gap-1 border-b p-2 sm:w-44 sm:flex-col sm:flex-nowrap sm:border-r sm:border-b-0"
          >
            {PERIODS.map((period) => {
              const isActive = !draft && active?.id === period.id;
              return (
                <li key={period.id}>
                  <button
                    type="button"
                    onClick={() =>
                      apply({ start: period.start, end: period.end })
                    }
                    className={cn(
                      'flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 text-left text-sm text-ink-secondary hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                      isActive && 'font-medium text-foreground'
                    )}
                  >
                    {period.label}
                    {isActive && (
                      <HugeiconsIcon
                        icon={Tick02Icon}
                        size={16}
                        className="text-glow"
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="p-2">
            <Calendar
              mode="range"
              month={MONTH}
              hideNavigation
              weekStartsOn={1}
              showOutsideDays={false}
              disabled={{ before: MONTH, after: LAST_DAY }}
              selected={selected}
              onSelect={(_, day) => pickDay(day)}
              className="bg-transparent"
            />
            <p className="px-2 pb-1 text-xs text-muted-foreground">
              {draft?.from
                ? 'Now pick the last day.'
                : 'Pick the first and last day. Times are UK time (GMT).'}
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DateRangePicker;
