import { HugeiconsIcon } from '@hugeicons/react';
import { Moon02Icon, Sun03Icon } from '@hugeicons/core-free-icons';

import { useTheme } from '@/hooks';
import { Button } from '@/components/ui/button';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);
  const label = isDark ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full"
      aria-label={label}
      title={label}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      <HugeiconsIcon icon={isDark ? Sun03Icon : Moon02Icon} size={18} />
    </Button>
  );
};

export default ThemeToggle;
