import { apiRequest } from '@/request';
import { REQUEST_METHOD } from '@/constants';
import type {
  HorizonPoint,
  HourPoint,
  SeriesPoint,
  TimeWindow,
  WindMeta,
  WindMetrics,
} from '@/types/wind.types';

const endpoint = {
  meta: '/meta',
  series: '/series',
  metrics: '/metrics',
  horizonCurve: '/horizon-curve',
  errorByHour: '/error-by-hour',
};

type WindowAndHorizon = TimeWindow & { horizon: number };

export const apis = {
  getMeta: () =>
    apiRequest<WindMeta>({ url: endpoint.meta, method: REQUEST_METHOD.GET }),

  getSeries: (params: WindowAndHorizon) =>
    apiRequest<SeriesPoint[]>({
      url: endpoint.series,
      method: REQUEST_METHOD.GET,
      params,
    }),

  getMetrics: (params: WindowAndHorizon) =>
    apiRequest<WindMetrics>({
      url: endpoint.metrics,
      method: REQUEST_METHOD.GET,
      params,
    }),

  getHorizonCurve: (params: TimeWindow) =>
    apiRequest<HorizonPoint[]>({
      url: endpoint.horizonCurve,
      method: REQUEST_METHOD.GET,
      params,
    }),

  getErrorByHour: (params: WindowAndHorizon) =>
    apiRequest<HourPoint[]>({
      url: endpoint.errorByHour,
      method: REQUEST_METHOD.GET,
      params,
    }),
};
