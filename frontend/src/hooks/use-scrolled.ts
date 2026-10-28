import { useSyncExternalStore } from 'react';

const subscribe = (onChange: () => void) => {
  window.addEventListener('scroll', onChange, { passive: true });
  return () => window.removeEventListener('scroll', onChange);
};

/** True once the page has scrolled past `threshold` pixels. */
const useScrolled = (threshold = 8) =>
  useSyncExternalStore(
    subscribe,
    () => window.scrollY > threshold,
    () => false
  );

export default useScrolled;
