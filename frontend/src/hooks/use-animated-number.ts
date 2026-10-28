import { useEffect, useRef, useState } from 'react';

import usePrefersReducedMotion from './use-prefers-reduced-motion';

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/**
 * Eases from the previous value to `target` over `duration` ms. Counts up
 * from 0 the first time a value arrives. Returns `target` unchanged when it is
 * missing or the user prefers reduced motion.
 */
const useAnimatedNumber = (
  target: number | null | undefined,
  duration = 700
): number | null | undefined => {
  const reduced = usePrefersReducedMotion();
  const [display, setDisplay] = useState<number | undefined>(undefined);
  const current = useRef(0);

  useEffect(() => {
    if (reduced || target == null) return;
    const from = current.current;
    const start = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const next = from + (target - from) * easeOutCubic(t);
      current.current = next;
      setDisplay(next);
      if (t < 1) frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [target, duration, reduced]);

  if (reduced || target == null) return target;
  return display ?? 0;
};

export default useAnimatedNumber;
