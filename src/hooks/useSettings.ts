'use client';
import { useState, useEffect } from 'react';

interface Settings {
  darkMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  voiceSpeed: number;
}

const defaultSettings: Settings = {
  darkMode: true,
  fontSize: 'medium',
  voiceSpeed: 1.0,
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('app_settings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (e) {}
    }
    setIsLoaded(true);
  }, []);

  const updateSettings = (updates: Partial<Settings>) => {
    setSettings(prev => {
      const newSettings = { ...prev, ...updates };
      localStorage.setItem('app_settings', JSON.stringify(newSettings));
      
      // Apply dark mode globally
      if (updates.darkMode !== undefined) {
        if (updates.darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }

      return newSettings;
    });
  };

  return { isLoaded, settings, updateSettings };
}
