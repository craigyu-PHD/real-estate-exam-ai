'use client';

export type AiProvider = 'gemini' | 'groq' | 'mistral' | 'openrouter' | 'huggingface';
export type StoredAiKeys = Record<AiProvider, string>;

const STORAGE: Record<AiProvider, string> = {
  gemini: 'gemini_api_key',
  groq: 'groq_api_key',
  mistral: 'mistral_api_key',
  openrouter: 'openrouter_api_key',
  huggingface: 'huggingface_api_key',
};

export function getStoredAiKey(provider: AiProvider) {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE[provider])?.trim() || '';
}

export function getStoredAiKeys(): StoredAiKeys {
  return {
    gemini: getStoredAiKey('gemini'),
    groq: getStoredAiKey('groq'),
    mistral: getStoredAiKey('mistral'),
    openrouter: getStoredAiKey('openrouter'),
    huggingface: getStoredAiKey('huggingface'),
  };
}

export function saveStoredAiKey(provider: AiProvider, value: string) {
  const key = value.trim();
  if (!key) localStorage.removeItem(STORAGE[provider]);
  else localStorage.setItem(STORAGE[provider], key);
  window.dispatchEvent(new CustomEvent('ai-keys-updated', { detail: { provider } }));
}

export function maskApiKey(value: string) {
  if (!value) return '未設定';
  if (value.length < 10) return '••••••••';
  return `${value.slice(0, 4)}••••••••${value.slice(-4)}`;
}
