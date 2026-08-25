'use client';
import { useState, useEffect } from 'react';

export type VoiceEngine = 'auto' | 'gemini' | 'edge' | 'web-speech';

interface Settings {
  darkMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  voiceEngine: VoiceEngine;
  voiceSpeed: number;
  autoPlayNext: boolean;
}

const defaultSettings: Settings = {
  darkMode: true,
  fontSize: 'medium',
  voiceEngine: 'auto',
  voiceSpeed: 1.0,
  autoPlayNext: true,
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
      } catch {}
    }
    setIsLoaded(true);
  }, []);

  const updateSettings = (updates: Partial<Settings>) => {
    setSettings(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem('app_settings', JSON.stringify(next));
      if (updates.darkMode !== undefined) {
        if (updates.darkMode) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  return { isLoaded, settings, updateSettings };
}
