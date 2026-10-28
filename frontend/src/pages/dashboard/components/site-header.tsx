import { useEffect, useRef } from 'react';

import { ThemeToggle } from '@/components/shared';
import { appEnv } from '@/constants';
import { useActiveSection, useScrolled } from '@/hooks';
import { cn } from '@/lib/utils';
import { SECTIONS } from '../lib/sections';

const SECTION_IDS = SECTIONS.map((s) => s.id);

/**
 * Compact glass pill centred over the page: brand, section links, theme
 * toggle. A highlight slides to the active link, and the pill tightens and
 * frosts more once the page scrolls.
 */
const SiteHeader = () => {
  const active = useActiveSection(SECTION_IDS);
  const scrolled = useScrolled();
  const listRef = useRef<HTMLUListElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);

  // Move the highlight under the active link. Re-measured on resize because
  // link widths change when the web font finishes loading.
  useEffect(() => {
    const list = listRef.current;
    const indicator = indicatorRef.current;
    if (!list || !indicator) return;
    const place = () => {
      const link = list.querySelector<HTMLElement>(`[data-id="${active}"]`);
      if (!link) return;
      indicator.style.width = `${link.offsetWidth}px`;
      indicator.style.transform = `translateX(${link.offsetLeft}px)`;
      indicator.style.opacity = '1';
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(list);
    return () => observer.disconnect();
  }, [active]);

  return (
    <header className="pointer-events-none sticky top-0 z-30 flex justify-center px-4 pt-3 sm:px-6 sm:pt-4">
      <nav
        aria-label="Sections"
        data-scrolled={scrolled}
        className={cn(
          'header-glass pointer-events-auto flex w-full animate-[header-in_500ms_cubic-bezier(0.2,0.8,0.2,1)_both] items-center gap-2 rounded-full py-1.5 pr-1.5 pl-3 transition-[max-width,box-shadow,background-color] duration-300 ease-out',
          scrolled ? 'max-w-[44rem]' : 'max-w-[48rem]'
        )}
      >
        <a
          href={`#${SECTIONS[0].id}`}
          className="flex shrink-0 items-center gap-2 rounded-full py-1 pr-2 text-[15px] font-semibold tracking-tight focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <img src="/favicon.svg" alt="" className="size-7" />
          <span className="hidden sm:inline">{appEnv.APP_NAME}</span>
        </a>

        <ul
          ref={listRef}
          className="relative mx-auto flex items-center gap-0.5 overflow-x-auto"
        >
          <span
            ref={indicatorRef}
            aria-hidden="true"
            className="absolute top-0 left-0 h-full rounded-full bg-foreground/8 opacity-0 transition-[transform,width] duration-300 ease-out dark:bg-white/10"
          />
          {SECTIONS.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                data-id={section.id}
                aria-current={active === section.id ? 'location' : undefined}
                className={cn(
                  'relative z-10 block rounded-full px-2 py-1.5 text-sm whitespace-nowrap text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:px-3.5',
                  active === section.id && 'text-foreground'
                )}
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>

        <ThemeToggle />
      </nav>
    </header>
  );
};

export default SiteHeader;
