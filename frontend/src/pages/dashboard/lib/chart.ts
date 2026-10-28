/** Round gridlines from zero to just above `peakMW`, every `stepMW`. */
export function gwTicks(peakMW: number, stepMW: number): number[] {
  const top = Math.max(stepMW, Math.ceil(peakMW / stepMW) * stepMW);
  return Array.from({ length: top / stepMW + 1 }, (_, i) => i * stepMW);
}

/** Axis label in GW; the non-breaking space keeps "20 GW" on one line. */
export function gwAxisLabel(mw: number, digits = 0): string {
  return `${(mw / 1000).toFixed(digits)}\u00a0GW`;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** 3 → "03:00". */
export const hourLabel = (hour: number) => `${pad(hour)}:00`;

/** 3 → "03:00–04:00". Word joiners stop a line break at the dash. */
export const hourRange = (hour: number) =>
  `${pad(hour)}:00\u2060–\u2060${pad((hour + 1) % 24)}:00`;

export const AXIS_PROPS = {
  tickLine: false,
  axisLine: false,
} as const;

export const ACTIVE_DOT = { r: 4, stroke: 'var(--card)', strokeWidth: 2 };
