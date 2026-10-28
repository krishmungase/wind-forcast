import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import {
  AlertDiamondIcon,
  ChartIncreaseIcon,
  Clock01Icon,
  Shield01Icon,
} from '@hugeicons/core-free-icons';

import { Skeleton } from '@/components/ui/skeleton';
import { formatGW, formatPercent } from '@/lib/format.lib';
import type { HorizonPoint, HourPoint, WindMetrics } from '@/types/wind.types';
import { hourRange } from '../lib/chart';

interface TakeawaysProps {
  metrics: WindMetrics | undefined;
  curve: HorizonPoint[] | undefined;
  hours: HourPoint[] | undefined;
  horizon: number;
}

interface Takeaway {
  title: string;
  body: string;
  icon: IconSvgElement;
  /** Series colour of what the takeaway is about, matching the charts. */
  tone: string;
}

const FORECAST = 'var(--series-forecast)';
const ACTUAL = 'var(--series-actual)';
const ERROR = 'var(--series-error)';

// Below this share of MAE, the bias is too small to call the forecast one-sided.
const LEAN_THRESHOLD = 0.3;

function leanTakeaway(m: WindMetrics): Takeaway | null {
  if (m.mae == null || m.bias == null || m.debiasedMae == null) return null;
  if (Math.abs(m.bias) < LEAN_THRESHOLD * m.mae) {
    return {
      title: 'No strong lean either way',
      body: `Misses were split between too much and too little wind. Shifting the forecast up or down would barely change the ${formatGW(m.mae)} typical miss.`,
      icon: ChartIncreaseIcon,
      tone: FORECAST,
    };
  }
  const high = m.bias > 0;
  const share = high ? m.overForecastShare : 1 - (m.overForecastShare ?? 0);
  return {
    title: `The forecast leans ${high ? 'high' : 'low'}`,
    body: `In ${formatPercent(share)} of hours it promised ${high ? 'more' : 'less'} wind than arrived, by ${formatGW(Math.abs(m.bias))} on average. Adjusting the forecast by that average would have cut the typical miss from ${formatGW(m.mae)} to ${formatGW(m.debiasedMae)}.`,
    icon: ChartIncreaseIcon,
    tone: FORECAST,
  };
}

function leadTimeTakeaway(
  curve: HorizonPoint[],
  horizon: number
): Takeaway | null {
  if (curve.length < 2) return null;
  const first = curve[0];
  const last = curve[curve.length - 1];
  const current = curve.find((p) => p.horizon === horizon);
  const cost =
    current && current.horizon > first.horizon
      ? ` Buying ${horizon} h ahead carries about ${formatGW(current.mae - first.mae)} more error than buying at the last moment.`
      : '';
  return {
    title: 'Lead time costs accuracy',
    body: `Typical miss rises from ${formatGW(first.mae)} with the freshest forecast to ${formatGW(last.mae)} at ${last.horizon} h ahead.${cost}`,
    icon: Clock01Icon,
    tone: ERROR,
  };
}

function hourTakeaway(hours: HourPoint[], horizon: number): Takeaway | null {
  if (hours.length < 2) return null;
  const worst = hours.reduce((a, b) => (b.mae > a.mae ? b : a));
  const best = hours.reduce((a, b) => (b.mae < a.mae ? b : a));
  return {
    title: `Hardest hour: ${hourRange(worst.hour)}`,
    body: `At ${horizon} h ahead, that hour missed by ${formatGW(worst.mae)} typically, against ${formatGW(best.mae)} for ${hourRange(best.hour)}. Plan extra cover for this hour.`,
    icon: AlertDiamondIcon,
    tone: ERROR,
  };
}

function coverTakeaway(m: WindMetrics): Takeaway | null {
  if (m.errorP90 == null || m.errorP90 <= 0) return null;
  return {
    title: `Hold ${formatGW(m.errorP90)} of cover`,
    body: `In 9 hours out of 10, actual wind came in no more than ${formatGW(m.errorP90)} below the forecast. Holding that much in reserve covers all but the worst 10% of hours.`,
    icon: Shield01Icon,
    tone: ACTUAL,
  };
}

/** Plain-language conclusions for the buying desk, computed from the same
 *  slice as the charts above so the numbers always match. */
const Takeaways = ({ metrics, curve, hours, horizon }: TakeawaysProps) => {
  const ready = metrics && metrics.count > 0 && curve && hours;
  const items = ready
    ? [
        leanTakeaway(metrics),
        coverTakeaway(metrics),
        leadTimeTakeaway(curve, horizon),
        hourTakeaway(hours, horizon),
      ].filter((t): t is Takeaway => t !== null)
    : null;

  return (
    <section
      id="takeaways"
      aria-labelledby="takeaways-title"
      className="scroll-mt-28 space-y-4"
    >
      <h2
        id="takeaways-title"
        className="text-2xl font-semibold tracking-tight"
      >
        For the buying desk
      </h2>
      <ul className="grid gap-4 md:grid-cols-2">
        {items
          ? items.map((item) => (
              <li
                key={item.title}
                className="panel flex gap-4 rounded-2xl p-5 sm:p-6"
              >
                <span
                  className="grid size-10 shrink-0 place-items-center rounded-xl"
                  style={{
                    color: item.tone,
                    background: `color-mix(in srgb, ${item.tone} 14%, transparent)`,
                  }}
                >
                  <HugeiconsIcon icon={item.icon} size={20} />
                </span>
                <div className="min-w-0">
                  <h3 className="font-semibold tracking-tight">{item.title}</h3>
                  <p className="mt-1.5 max-w-prose text-[15px] leading-relaxed text-ink-secondary">
                    {item.body}
                  </p>
                </div>
              </li>
            ))
          : Array.from({ length: 4 }, (_, i) => (
              <li key={i} className="panel space-y-2 rounded-2xl p-6">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </li>
            ))}
      </ul>
    </section>
  );
};

export default Takeaways;
