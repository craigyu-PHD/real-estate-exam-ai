'use client';

import type { VoicePreset } from '@/lib/voiceConfig';
import { getStoredGeminiKey } from '@/lib/geminiKey';

const DB_NAME = 'tts-cache';
const STORE = 'audio';
const DB_VERSION = 1;

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

export async function getCachedAudio(key: string): Promise<Blob | null> {
  try {
    const db = await openDB();
    return await new Promise((resolve) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch { return null; }
}

export async function setCachedAudio(key: string, blob: Blob) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(blob, key);
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

// Primary: Gemini free-tier natural TTS. Fallback stays device-local and free.
export async function fetchServerTTS(text: string, voicePreset: VoicePreset = 'warm'): Promise<Blob | null> {
  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voicePreset, apiKey: getStoredGeminiKey() || undefined }),
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    if (blob.size < 1000) return null;
    return blob;
  } catch { return null; }
}
