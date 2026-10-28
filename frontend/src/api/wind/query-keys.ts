import type { TimeWindow } from '@/types/wind.types';

export const windKeys = {
  all: ['wind'] as const,
  meta: () => [...windKeys.all, 'meta'] as const,
  series: (range: TimeWindow, horizon: number) =>
    [...windKeys.all, 'series', range.start, range.end, horizon] as const,
  metrics: (range: TimeWindow, horizon: number) =>
    [...windKeys.all, 'metrics', range.start, range.end, horizon] as const,
  horizonCurve: (range: TimeWindow) =>
    [...windKeys.all, 'horizon-curve', range.start, range.end] as const,
  errorByHour: (range: TimeWindow, horizon: number) =>
    [
      ...windKeys.all,
      'error-by-hour',
      range.start,
      range.end,
      horizon,
    ] as const,
};
