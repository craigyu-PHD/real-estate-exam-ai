'use client';
import { useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { settings, isLoaded } = useSettings();

  useEffect(() => {
    if (isLoaded) {
      if (settings.darkMode) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      // Handle font size - also set html font-size for scaling
      const html = document.documentElement;
      html.classList.remove('text-sm','text-base','text-lg');
      html.style.fontSize = settings.fontSize === 'small' ? '14px' : settings.fontSize === 'large' ? '18px' : '16px';
    }
  }, [isLoaded, settings]);

  return <>{children}</>;
}
