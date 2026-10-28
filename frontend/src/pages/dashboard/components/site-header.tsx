import { ThemeToggle } from '@/components/shared';
import { appEnv } from '@/constants';

const SiteHeader = () => (
  <header className="border-b bg-card">
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
      <div className="flex items-center gap-3">
        <img src="/favicon.svg" alt="" className="size-7" />
        <div>
          <p className="text-[15px] leading-tight font-semibold">
            {appEnv.APP_NAME}
          </p>
          <p className="text-xs leading-tight text-muted-foreground">
            Great Britain national wind, January 2026
          </p>
        </div>
      </div>
      <ThemeToggle />
    </div>
  </header>
);

export default SiteHeader;
