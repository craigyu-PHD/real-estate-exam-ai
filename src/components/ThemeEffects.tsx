'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { ThemeId } from '@/lib/themeConfig';

type ClickFx = { id: number; x: number; y: number; theme: ThemeId };

function currentTheme(): ThemeId {
  const value = document.documentElement.dataset.theme as ThemeId | undefined;
  return value || 'classic';
}

export function ThemeEffects() {
  const pathname = usePathname();
  const cursorRef = useRef<HTMLDivElement>(null);
  const firstRoute = useRef(true);
  const [theme, setTheme] = useState<ThemeId>('classic');
  const [effects, setEffects] = useState<ClickFx[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const sync = () => setTheme(currentTheme());
    sync();
    window.addEventListener('app-settings-updated', sync);
    return () => window.removeEventListener('app-settings-updated', sync);
  }, []);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      const cursor = cursorRef.current;
      if (!cursor) return;
      cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    };
    const click = (event: PointerEvent) => {
      if (document.documentElement.dataset.motion === 'calm' || currentTheme() === 'classic') return;
      const id = ++idRef.current;
      setEffects(prev => [...prev.slice(-8), { id, x: event.clientX, y: event.clientY, theme: currentTheme() }]);
      window.setTimeout(() => setEffects(prev => prev.filter(item => item.id !== id)), 900);
    };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', click, { passive: true });
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', click);
    };
  }, []);

  useEffect(() => {
    if (firstRoute.current) { firstRoute.current = false; return; }
    if (document.documentElement.dataset.motion === 'calm' || currentTheme() === 'classic') return;
    const body = document.body;
    body.classList.remove('theme-route-transition');
    void body.offsetWidth;
    body.classList.add('theme-route-transition');
    const timer = window.setTimeout(() => body.classList.remove('theme-route-transition'), 620);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      <div ref={cursorRef} className={`theme-cursor cursor-${theme}`} aria-hidden="true"><span/></div>
      <div className="theme-fx-layer" aria-hidden="true">
        {effects.map(effect => <span key={effect.id} className={`theme-click-fx fx-${effect.theme}`} style={{ left: effect.x, top: effect.y }} />)}
      </div>
    </>
  );
}
