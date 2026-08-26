'use client';
import { useEffect } from 'react';
import { applyVisualSettings, useSettings } from '@/hooks/useSettings';

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { settings, isLoaded } = useSettings();

  useEffect(() => {
    if (!isLoaded) return;
    applyVisualSettings(settings);
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => { if (settings.appearance === 'system') applyVisualSettings(settings); };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [isLoaded, settings]);

  return <>{children}</>;
}
