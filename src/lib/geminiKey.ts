'use client';

import { getStoredAiKey, maskApiKey, saveStoredAiKey } from '@/lib/aiKeys';

export function getStoredGeminiKey() { return getStoredAiKey('gemini'); }
export function saveStoredGeminiKey(value: string) { saveStoredAiKey('gemini', value); }
export function maskGeminiKey(value: string) { return maskApiKey(value); }
