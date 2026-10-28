import { DATA_WINDOW } from '@/constants';
import type { TimeWindow } from '@/types/wind.types';

export interface Period extends TimeWindow {
  id: string;
  label: string;
}

const day = (d: number, time: string) =>
  `2026-01-${String(d).padStart(2, '0')}T${time}:00Z`;

/** Quick picks for the date filter: the whole month, then each week. */
export const PERIODS: Period[] = [
  {
    id: 'month',
    label: 'All of January',
    start: DATA_WINDOW.START,
    end: DATA_WINDOW.END,
  },
  { id: 'w1', label: '1–7 Jan', start: day(1, '00:00'), end: day(7, '23:30') },
  {
    id: 'w2',
    label: '8–14 Jan',
    start: day(8, '00:00'),
    end: day(14, '23:30'),
  },
  {
    id: 'w3',
    label: '15–21 Jan',
    start: day(15, '00:00'),
    end: day(21, '23:30'),
  },
  {
    id: 'w4',
    label: '22–31 Jan',
    start: day(22, '00:00'),
    end: day(31, '23:30'),
  },
];

export const DEFAULT_PERIOD = PERIODS[0];

export function findPeriod(range: TimeWindow): Period | undefined {
  return PERIODS.find((p) => p.start === range.start && p.end === range.end);
}
