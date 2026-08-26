'use client';

const STORAGE_KEY = 'gemini_api_key';

export function getStoredGeminiKey() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEY)?.trim() || '';
}

export function saveStoredGeminiKey(value: string) {
  const key = value.trim();
  if (!key) localStorage.removeItem(STORAGE_KEY);
  else localStorage.setItem(STORAGE_KEY, key);
  window.dispatchEvent(new Event('gemini-key-updated'));
}

export function maskGeminiKey(value: string) {
  if (value.length < 10) return '••••••••';
  return `${value.slice(0, 4)}••••••••${value.slice(-4)}`;
}
