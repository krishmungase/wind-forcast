import type { ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export interface ThemeProviderContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}
