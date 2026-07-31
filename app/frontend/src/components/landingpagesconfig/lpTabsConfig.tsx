import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { ComponentDisplay } from '../../types/ui.types';

export interface LpTabsConfigProps {
  componentDisplay: ComponentDisplay;
  order?: string[];
  scrollContainerSelector?: string;
  className?: string;
}

interface TabDef {
  id: string;
  label: string;
  dependsOn?: keyof ComponentDisplay | 'always';
}

const BASE_TABS: TabDef[] = [
  { id: 'html', label: 'HTML', dependsOn: 'always' },
  { id: 'background', label: 'Background', dependsOn: 'background' },
  { id: 'button', label: 'Button', dependsOn: 'button' },
  { id: 'widget', label: 'Widget', dependsOn: 'widget' },
  { id: 'navbar', label: 'Navbar', dependsOn: 'navbar' },
  { id: 'hero', label: 'Hero', dependsOn: 'always' },
  { id: 'titleTxt', label: 'Game Presentation', dependsOn: 'titleTxt' },
  { id: 'videoPlayer', label: 'Video Player', dependsOn: 'videoPlayer' },
  { id: 'columnTxt', label: 'Game Features', dependsOn: 'columnTxt' },
  { id: 'mediaShowcase', label: 'Media Showcase', dependsOn: 'mediaShowcase' },
  { id: 'carousel', label: 'Carousel', dependsOn: 'carousel' },
  { id: 'steamReviews', label: 'Steam Reviews', dependsOn: 'steamReviews' },
  { id: 'faq', label: 'FAQ', dependsOn: 'faq' },
  { id: 'footer', label: 'Footer', dependsOn: 'footer' },
  { id: 'banner', label: 'Banner', dependsOn: 'always' },
];

const LpTabsConfig: React.FC<LpTabsConfigProps> = ({
  componentDisplay,
  order,
  scrollContainerSelector = '.flex-1.min-h-0.overflow-y-auto',
  className = ''
}) => {
  const [active, setActive] = useState<string>('html');
  const mountedRef = useRef(false);
  const sectionsRef = useRef<HTMLElement[]>([]);
  const rAFRef = useRef<number | null>(null);
  const lastScrollTopRef = useRef(0);

  const tabs = useMemo(() => {
    let list = BASE_TABS.filter(t => {
      if (t.dependsOn === 'always') return true;
      return !!componentDisplay[t.dependsOn as keyof ComponentDisplay];
    });
    if (order && order.length) {
      const map = new Map(list.map(l => [l.id, l] as const));
      list = order.map(id => map.get(id)).filter(Boolean) as TabDef[];
    }
    return list;
  }, [componentDisplay, order]);

  const scrollContainer = useMemo<HTMLElement | null>(() => {
    if (typeof document === 'undefined') return null;
    const el = document.querySelector(scrollContainerSelector) as HTMLElement | null;
    if (el) return el;
    return document.querySelector('.overflow-y-auto');
  }, [scrollContainerSelector]);

  useEffect(() => {
    if (!tabs.length) return;
    mountedRef.current = true;

    const collect = () => {
      sectionsRef.current = tabs
        .map(t => document.getElementById(t.id))
        .filter((el): el is HTMLElement => !!el);
    };
    collect();
    if (!sectionsRef.current.length) return;

    let container: HTMLElement | null = scrollContainer;
    const firstSection = sectionsRef.current[0];
    if (firstSection) {
      if (!container || !container.contains(firstSection)) {
        const candidates = Array.from(document.querySelectorAll('.overflow-y-auto')) as HTMLElement[];
        for (const c of candidates) {
          if (c.contains(firstSection)) { container = c; break; }
        }
      }
    }
    if (!container) return;

    const pickActive = () => {
      if (!sectionsRef.current.length) return;
      const scrollTop = container!.scrollTop;
      lastScrollTopRef.current = scrollTop;
      const containerRect = container!.getBoundingClientRect();
      const pivot = container!.clientHeight * 0.35;
      let current = sectionsRef.current[0].id;
      for (const sec of sectionsRef.current) {
        const relTop = sec.getBoundingClientRect().top - containerRect.top;
        if (relTop <= pivot) current = sec.id; else break;
      }
      if (scrollTop + container!.clientHeight >= container!.scrollHeight - 4) {
        current = sectionsRef.current[sectionsRef.current.length - 1].id;
      }
      setActive(prev => prev === current ? prev : current);
    };

    const onScroll = () => {
      if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
      rAFRef.current = requestAnimationFrame(pickActive);
    };
    const onResize = () => { collect(); pickActive(); };

    container.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    const mo = new MutationObserver(() => { collect(); pickActive(); });
    mo.observe(container, { subtree: true, childList: true });
    const delayed = setTimeout(() => { collect(); pickActive(); }, 250);
    pickActive();

    return () => {
      container.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
      mo.disconnect();
      clearTimeout(delayed);
    };
  }, [tabs, scrollContainer]);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActive(id);
  };

  const [useDropdown, setUseDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      setUseDropdown(containerRef.current.offsetWidth < 560);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!tabs.length) return null;

  return (
    <div ref={containerRef} className={`w-full ${className}`}>
      {useDropdown ? (
        <div className="relative">
          <select
            value={active}
            onChange={(e) => handleClick(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {tabs.map(t => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>
      ) : (
        <div className="flex items-center overflow-x-auto no-scrollbar text-[13px] font-medium tracking-wide select-none">
          {tabs.map((t, idx) => {
            const isActive = active === t.id;
            return (
              <React.Fragment key={t.id}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleClick(t.id)}
                  className={`relative px-3 py-1.5 rounded-md transition-colors whitespace-nowrap focus:outline-none focus:ring-1 focus:ring-indigo-500 ${isActive ? 'bg-indigo-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'} `}
                >
                  {t.label}
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-[3px] w-7 rounded-full bg-indigo-300" />
                  )}
                </button>
                {idx < tabs.length - 1 && (
                  <div className="flex items-center mx-1.5 text-gray-600 shrink-0" aria-hidden="true">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                    <span className="h-px w-7 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 mx-1" />
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LpTabsConfig;
