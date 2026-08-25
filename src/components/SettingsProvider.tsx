'use client';
import { useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { settings, isLoaded } = useSettings();

  useEffect(() => {
    if (isLoaded) {
      if (settings.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      // Handle font size
      const body = document.body;
      body.classList.remove('text-sm', 'text-base', 'text-lg');
      if (settings.fontSize === 'small') body.classList.add('text-sm');
      if (settings.fontSize === 'medium') body.classList.add('text-base');
      if (settings.fontSize === 'large') body.classList.add('text-lg');
    }
  }, [isLoaded, settings]);

  return <>{children}</>;
}
