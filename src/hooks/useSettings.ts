'use client';
import { useState, useEffect } from 'react';
import type { VoicePreset } from '@/lib/voiceConfig';

export type VoiceEngine = 'auto' | 'gemini' | 'device-natural' | 'web-speech';

export interface Settings {
  darkMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  voiceEngine: VoiceEngine;
  voicePreset: VoicePreset;
  voiceSpeed: number;
  autoPlayNext: boolean;
}

const defaultSettings: Settings = {
  darkMode: false,
  fontSize: 'medium',
  voiceEngine: 'auto',
  voicePreset: 'warm',
  voiceSpeed: 1.0,
  autoPlayNext: true,
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const stored = localStorage.getItem('app_settings');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Backward compatibility: the old "edge" option was only a local voice preference.
          if (parsed.voiceEngine === 'edge') parsed.voiceEngine = 'device-natural';
          setSettings({ ...defaultSettings, ...parsed });
        } catch {}
      }
      setIsLoaded(true);
    });
  }, []);

  const updateSettings = (updates: Partial<Settings>) => {
    setSettings(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem('app_settings', JSON.stringify(next));
      if (updates.darkMode !== undefined) {
        if (updates.darkMode) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
      }
      window.dispatchEvent(new CustomEvent('app-settings-updated', { detail: next }));
      return next;
    });
  };

  return { isLoaded, settings, updateSettings };
}
