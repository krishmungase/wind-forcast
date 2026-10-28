import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { apis } from './apis';
import { windKeys } from './query-keys';
import type { TimeWindow } from '@/types/wind.types';

// The data is a fixed historical month, so nothing goes stale.
const STATIC = { staleTime: Infinity, gcTime: 30 * 60 * 1000 } as const;

export const useWindMeta = () =>
  useQuery({
    queryKey: windKeys.meta(),
    queryFn: () => apis.getMeta(),
    select: (res) => res.data,
    ...STATIC,
  });

// Changing the range or horizon keeps the previous result on screen until the
// new one arrives, so charts dim instead of flashing a skeleton.

export const useWindSeries = (range: TimeWindow, horizon: number) =>
  useQuery({
    queryKey: windKeys.series(range, horizon),
    queryFn: () => apis.getSeries({ ...range, horizon }),
    select: (res) => res.data,
    placeholderData: keepPreviousData,
    ...STATIC,
  });

export const useWindMetrics = (range: TimeWindow, horizon: number) =>
  useQuery({
    queryKey: windKeys.metrics(range, horizon),
    queryFn: () => apis.getMetrics({ ...range, horizon }),
    select: (res) => res.data,
    placeholderData: keepPreviousData,
    ...STATIC,
  });

export const useHorizonCurve = (range: TimeWindow) =>
  useQuery({
    queryKey: windKeys.horizonCurve(range),
    queryFn: () => apis.getHorizonCurve(range),
    select: (res) => res.data,
    placeholderData: keepPreviousData,
    ...STATIC,
  });

export const useErrorByHour = (range: TimeWindow, horizon: number) =>
  useQuery({
    queryKey: windKeys.errorByHour(range, horizon),
    queryFn: () => apis.getErrorByHour({ ...range, horizon }),
    select: (res) => res.data,
    placeholderData: keepPreviousData,
    ...STATIC,
  });
