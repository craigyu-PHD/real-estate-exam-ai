'use client';

import type { VoicePreset } from '@/lib/voiceConfig';
import { getStoredGeminiKey } from '@/lib/geminiKey';

const DB_NAME = 'tts-cache';
const STORE = 'audio';
const DB_VERSION = 1;

type CachedAudioRecord = { blob: Blob; engine?: string; voice?: string };
export type ServerTtsResult = { blob: Blob; engine: string; voice: string };
const inflight = new Map<string, Promise<ServerTtsResult | null>>();

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getCachedAudio(key: string): Promise<CachedAudioRecord | null> {
  try {
    const db = await openDB();
    return await new Promise((resolve) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(key);
      req.onsuccess = () => {
        const value = req.result;
        if (value instanceof Blob) resolve({ blob: value, engine: 'cached', voice: '' });
        else if (value?.blob instanceof Blob) resolve(value as CachedAudioRecord);
        else resolve(null);
      };
      req.onerror = () => resolve(null);
    });
  } catch { return null; }
}

export async function setCachedAudio(key: string, value: Blob | CachedAudioRecord) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE, 'readwrite');
    const record = value instanceof Blob ? { blob: value } : value;
    tx.objectStore(STORE).put(record, key);
  } catch {}
}

export function hashText(text: string): string {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return `tts-${h}-${text.length}`;
}

export function ttsCacheKey(text: string, preset: VoicePreset, speed = 1) {
  return hashText(`${preset}|${speed}|${text}`);
}

export function pickNaturalTaiwanVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  const zh = voices.filter(v => /^zh(-|_)/i.test(v.lang) || /Chinese|中文|國語|Mandarin/i.test(v.name));
  const tw = zh.filter(v => /zh[-_]TW/i.test(v.lang) || /Taiwan|臺灣|台灣|Hsiao|Mei-Jia|Meijia|Yating|Hanhan/i.test(v.name));
  const pool = tw.length ? tw : zh.length ? zh : voices;

  const score = (v: SpeechSynthesisVoice) => {
    let n = 0;
    if (/Natural|Neural|Premium|Enhanced|Online/i.test(v.name)) n += 100;
    if (/HsiaoChen|HsiaoYu|YunJhe|Mei-Jia|Meijia|Yating|Hanhan/i.test(v.name)) n += 70;
    if (/Google/i.test(v.name)) n += 35;
    if (/zh[-_]TW/i.test(v.lang)) n += 40;
    if (v.localService) n += 5;
    return n;
  };

  return [...pool].sort((a, b) => score(b) - score(a))[0];
}

export async function waitForSpeechVoices(synth: SpeechSynthesis): Promise<SpeechSynthesisVoice[]> {
  const ready = synth.getVoices();
  if (ready.length) return ready;
  return await new Promise(resolve => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      synth.removeEventListener('voiceschanged', finish);
      resolve(synth.getVoices());
    };
    synth.addEventListener('voiceschanged', finish);
    setTimeout(finish, 900);
  });
}

// Server cascade: Gemini (when configured) → free Edge Neural → optional custom endpoint.
// Client cascade then falls back to device Natural / Web Speech.
export async function fetchServerTTS(text: string, voicePreset: VoicePreset = 'warm', provider: 'auto' | 'gemini' | 'edge' = 'auto'): Promise<ServerTtsResult | null> {
  const requestKey = hashText(`${provider}|${voicePreset}|${text}`);
  const existing = inflight.get(requestKey);
  if (existing) return existing;
  const task = (async () => {
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voicePreset, provider, apiKey: provider === 'edge' ? undefined : getStoredGeminiKey() || undefined }),
      });
      if (!res.ok) return null;
      const blob = await res.blob();
      if (blob.size < 1000) return null;
      return {
        blob,
        engine: res.headers.get('x-tts-engine') || 'server-natural',
        voice: res.headers.get('x-tts-voice') || '',
      };
    } catch { return null; }
  })();
  inflight.set(requestKey, task);
  try { return await task; }
  finally { inflight.delete(requestKey); }
}
