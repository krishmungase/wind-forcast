import { useEffect, useState } from 'react';

/** Returns `value` after it has stayed unchanged for `delay` ms. */
const useDebounce = <T>(value: T, delay = 300): T => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
};

export default useDebounce;
