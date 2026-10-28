/**
 * Formatting for power and time. Everything is shown in UTC, which is UK local
 * time in January (GMT), so the labels match what the trading desk sees.
 */

const UTC = 'UTC';

/** MW → "2.05 GW". Null-safe: returns an en dash. */
export function formatGW(mw: number | null | undefined, digits = 2): string {
  if (mw == null || Number.isNaN(mw)) return '–';
  return `${(mw / 1000).toFixed(digits)}\u00a0GW`;
}

/** Signed MW → "+1.85 GW" / "−0.29 GW" (true minus sign). */
export function formatSignedGW(
  mw: number | null | undefined,
  digits = 2
): string {
  if (mw == null || Number.isNaN(mw)) return '–';
  const sign = mw > 0 ? '+' : mw < 0 ? '−' : '';
  return `${sign}${(Math.abs(mw) / 1000).toFixed(digits)}\u00a0GW`;
}

/** 0.177 → "17.7%". */
export function formatPercent(ratio: number | null | undefined): string {
  if (ratio == null || Number.isNaN(ratio)) return '–';
  return `${(ratio * 100).toFixed(1)}%`;
}

/** "10 Jan, 09:30". */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: UTC })}, ${formatTime(iso)}`;
}

/** "Sat 10 Jan, 09:30" for tooltips. */
export function formatLongDateTime(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: UTC,
  });
  return `${date}, ${formatTime(iso)}`;
}

/** "10 Jan". */
export function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: UTC,
  });
}

/** "09:30". */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: UTC,
  });
}

/** ISO UTC → value for <input type="datetime-local"> (read as UTC). */
export function toInputValue(iso: string): string {
  return iso.slice(0, 16);
}

/** <input type="datetime-local"> value (treated as UTC) → ISO UTC. */
export function fromInputValue(value: string): string {
  return `${value}:00Z`;
}
