'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export function ThemeEffects() {
  const pathname = usePathname();
  const firstRoute = useRef(true);

  useEffect(() => {
    if (firstRoute.current) {
      firstRoute.current = false;
      return;
    }
    if (document.documentElement.dataset.motion === 'calm') return;

    const body = document.body;
    body.classList.remove('theme-route-transition');
    void body.offsetWidth;
    body.classList.add('theme-route-transition');
    const timer = window.setTimeout(() => body.classList.remove('theme-route-transition'), 260);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  return null;
}
