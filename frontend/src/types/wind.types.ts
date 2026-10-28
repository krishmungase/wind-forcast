/** Mirrors backend/app/schemas.py. All times are ISO 8601 UTC strings, power in MW. */

export interface TimeWindow {
  start: string;
  end: string;
}

export interface WindMeta {
  targetStart: string;
  targetEnd: string;
  minHorizon: number;
  maxHorizon: number;
  defaultHorizon: number;
  actualPoints: number;
  forecastRuns: number;
  forecastRows: number;
}

export interface SeriesPoint {
  time: string;
  actual: number | null;
  forecast: number | null;
  publishTime: string | null;
}

export interface WindMetrics {
  horizon: number;
  count: number;
  mae: number | null;
  rmse: number | null;
  bias: number | null;
  medianAbsError: number | null;
  p90AbsError: number | null;
  errorP10: number | null;
  errorP90: number | null;
  /** Share of hours (0–1) where the forecast was above the actual. */
  overForecastShare: number | null;
  /** MAE after subtracting the period's average bias from every forecast. */
  debiasedMae: number | null;
  normalizedMae: number | null;
  meanActual: number | null;
  p10Actual: number | null;
}

export interface HorizonPoint {
  horizon: number;
  count: number;
  mae: number;
  rmse: number;
  bias: number;
}

export interface HourPoint {
  hour: number;
  count: number;
  mae: number;
  bias: number;
}
