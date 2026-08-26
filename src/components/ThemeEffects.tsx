'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { ThemeId } from '@/lib/themeConfig';

type ClickFx = { id: number; x: number; y: number; theme: ThemeId };

function currentTheme(): ThemeId {
  const value = document.documentElement.dataset.theme as ThemeId | undefined;
  return value || 'classic';
}

function ThemeClickGraphic({ theme }: { theme: ThemeId }) {
  if (theme === 'cyber-web') return <svg viewBox="0 0 120 120"><g className="web-fx-lines" fill="none"><path d="M60 60 60 4M60 60 108 20M60 60 116 65M60 60 94 109M60 60 37 115M60 60 5 88M60 60 8 31"/><path d="M60 42Q73 44 81 52Q79 66 70 75Q57 78 46 71Q40 59 45 48Q51 43 60 42Z"/><path d="M60 27Q82 31 96 47Q94 72 78 89Q54 95 34 82Q24 59 34 39Q45 30 60 27Z"/><path d="M60 11Q91 18 108 42Q108 78 85 104Q50 111 22 91Q7 57 23 29Q40 14 60 11Z"/></g><circle cx="60" cy="60" r="4" className="web-fx-core"/></svg>;
  if (theme === 'apex-racing') return <svg viewBox="0 0 140 80"><g fill="none" strokeLinecap="round"><path d="M6 24h61M0 39h82M17 55h50" className="race-fx-speed"/><path d="M57 48 70 32c5-6 13-9 22-9h13c7 0 14 3 19 8l10 10v11H53Z" className="race-fx-car"/><circle cx="74" cy="53" r="7"/><circle cx="116" cy="53" r="7"/></g><g className="race-fx-check"><path d="M116 4h8v8h-8zm8 8h8v8h-8zm8-8h8v8h-8zm-16 16h8v8h-8zm16 0h8v8h-8z"/></g></svg>;
  if (theme === 'deep-space') return <svg viewBox="0 0 120 120"><g fill="none" className="space-fx-radar"><ellipse cx="60" cy="60" rx="50" ry="23"/><ellipse cx="60" cy="60" rx="34" ry="15"/><path d="M10 60h100M60 15v90"/></g><path d="m60 30 17 27-9 3-8 20-8-20-9-3Z" className="space-fx-ship"/><circle cx="92" cy="32" r="2.5" className="space-fx-star"/></svg>;
  if (theme === 'iron-forge') return <svg viewBox="0 0 120 120"><g fill="none" className="forge-fx-ring"><circle cx="60" cy="60" r="32"/><circle cx="60" cy="60" r="18"/><path d="M60 15v17M60 88v17M15 60h17M88 60h17M28 28l12 12M80 80l12 12M92 28 80 40M40 80 28 92"/></g><g className="forge-fx-sparks"><path d="M75 34 100 16M84 50l29-5M77 78l25 18"/></g></svg>;
  if (theme === 'shadow-ronin') return <svg viewBox="0 0 140 100"><path d="M5 82C49 65 86 43 134 9" className="ronin-fx-blade"/><path d="M18 91C62 74 99 52 137 24" className="ronin-fx-after"/><circle cx="105" cy="22" r="18" className="ronin-fx-moon"/></svg>;
  return null;
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
      setEffects(prev => [...prev.slice(-6), { id, x: event.clientX, y: event.clientY, theme: currentTheme() }]);
      window.setTimeout(() => setEffects(prev => prev.filter(item => item.id !== id)), 1050);
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
    const timer = window.setTimeout(() => body.classList.remove('theme-route-transition'), 700);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      <div ref={cursorRef} className={`theme-cursor cursor-${theme}`} aria-hidden="true"><span/></div>
      <div className="theme-fx-layer" aria-hidden="true">
        {effects.map(effect => <span key={effect.id} className={`theme-click-fx fx-${effect.theme}`} style={{ left: effect.x, top: effect.y }}><ThemeClickGraphic theme={effect.theme}/></span>)}
      </div>
    </>
  );
}
