'use client';

import { useEffect, useState } from 'react';
import type { ThemeId } from '@/lib/themeConfig';

const ART: Partial<Record<ThemeId, string>> = {
  'cyber-web': '/themes/cyber-web-hero.webp',
  'iron-forge': '/themes/iron-forge-hero.webp',
  'apex-racing': '/themes/apex-racing-hero.webp',
  'deep-space': '/themes/deep-space-hero.webp',
  'shadow-ronin': '/themes/shadow-ronin-hero.webp',
};

function currentTheme(): ThemeId {
  if (typeof document === 'undefined') return 'classic';
  return (document.documentElement.dataset.theme as ThemeId | undefined) || 'classic';
}

export function ThemeArtwork({ theme, className = '' }: { theme: ThemeId; className?: string }) {
  const src = ART[theme];
  if (!src) return null;
  return <div aria-hidden="true" className={`theme-artwork theme-artwork-${theme} ${className}`} style={{ backgroundImage: `url(${src})` }} />;
}

export function ActiveThemeArtwork({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<ThemeId>('classic');
  useEffect(() => {
    const sync = () => setTheme(currentTheme());
    sync();
    window.addEventListener('app-settings-updated', sync);
    return () => window.removeEventListener('app-settings-updated', sync);
  }, []);
  return <ThemeArtwork theme={theme} className={className} />;
}
