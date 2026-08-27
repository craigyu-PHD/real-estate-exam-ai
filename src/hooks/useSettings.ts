'use client';
import { useState, useEffect } from 'react';
import type { VoicePreset } from '@/lib/voiceConfig';
import type { Appearance, ThemeId } from '@/lib/themeConfig';

export type VoiceEngine = 'auto' | 'gemini' | 'edge-neural' | 'device-natural' | 'web-speech';

export interface Settings {
  appearance: Appearance;
  theme: ThemeId;
  fontSize: 'small' | 'medium' | 'large';
  voiceEngine: VoiceEngine;
  voicePreset: VoicePreset;
  voiceSpeed: number;
  autoPlayNext: boolean;
  enhancedMotion: boolean;
}

export const defaultSettings: Settings = {
  appearance: 'dark',
  theme: 'classic',
  fontSize: 'medium',
  voiceEngine: 'auto',
  voicePreset: 'warm',
  voiceSpeed: 1.0,
  autoPlayNext: true,
  enhancedMotion: true,
};

function normalizeSettings(raw: Record<string, unknown>): Settings {
  const migrated = { ...raw } as Record<string, unknown>;
  if (!migrated.appearance && typeof migrated.darkMode === 'boolean') migrated.appearance = migrated.darkMode ? 'dark' : 'light';
  if (migrated.voiceEngine === 'edge') migrated.voiceEngine = 'device-natural';
  const themeIds = ['classic','cyber-web','iron-forge','apex-racing','deep-space','shadow-ronin'];
  const appearances = ['system','light','dark'];
  return {
    ...defaultSettings,
    ...migrated,
    appearance: appearances.includes(String(migrated.appearance)) ? migrated.appearance as Appearance : defaultSettings.appearance,
    theme: themeIds.includes(String(migrated.theme)) ? migrated.theme as ThemeId : defaultSettings.theme,
  };
}

export function applyVisualSettings(settings: Pick<Settings, 'appearance' | 'theme' | 'fontSize' | 'enhancedMotion'>) {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  const systemDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  const isDark = settings.appearance === 'dark' || (settings.appearance === 'system' && systemDark);
  html.classList.toggle('dark', isDark);
  html.dataset.theme = settings.theme;
  html.dataset.appearance = settings.appearance;
  html.dataset.motion = settings.enhancedMotion ? 'enhanced' : 'calm';
  html.style.fontSize = settings.fontSize === 'small' ? '14px' : settings.fontSize === 'large' ? '18px' : '16px';
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      let next = defaultSettings;
      const stored = localStorage.getItem('app_settings');
      if (stored) {
        try { next = normalizeSettings(JSON.parse(stored)); } catch {}
      }
      setSettings(next);
      applyVisualSettings(next);
      setIsLoaded(true);
    });
  }, []);

  const updateSettings = (updates: Partial<Settings>) => {
    setSettings(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem('app_settings', JSON.stringify(next));
      applyVisualSettings(next);
      window.dispatchEvent(new CustomEvent('app-settings-updated', { detail: next }));
      return next;
    });
  };

  return { isLoaded, settings, updateSettings };
}
