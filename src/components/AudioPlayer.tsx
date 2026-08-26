'use client';
import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Sparkles, LoaderCircle } from 'lucide-react';
import { getCachedAudio, setCachedAudio, ttsCacheKey, fetchServerTTS, pickNaturalTaiwanVoice, waitForSpeechVoices } from '@/lib/tts';
import { useSettings } from '@/hooks/useSettings';
import { VOICE_PRESETS } from '@/lib/voiceConfig';

type Engine = 'gemini' | 'device-natural' | 'web-speech' | null;

export function AudioPlayer({ text, onEnded }: { text: string; onEnded?: ()=>void }) {
  const { settings } = useSettings();
  const [isPlaying, setIsPlaying] = useState(false);
  const [engine, setEngine] = useState<Engine>(null);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') synthRef.current = window.speechSynthesis;
    return () => {
      synthRef.current?.cancel();
      audioRef.current?.pause();
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  const playDevice = async (t: string, natural: boolean) => {
    if (!synthRef.current) return;
    const voices = await waitForSpeechVoices(synthRef.current);
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(t);
    utterance.lang = 'zh-TW';
    utterance.rate = settings.voiceSpeed;
    const candidate = natural
      ? pickNaturalTaiwanVoice(voices)
      : voices.find(v => /zh[-_]TW/i.test(v.lang)) || voices.find(v => /^zh/i.test(v.lang)) || voices[0];
    if (candidate) utterance.voice = candidate;
    utterance.pitch = 1;
    utterance.onend = () => { setIsPlaying(false); onEnded?.(); };
    utterance.onerror = () => setIsPlaying(false);
    synthRef.current.speak(utterance);
    setEngine(natural ? 'device-natural' : 'web-speech');
    setIsPlaying(true);
  };

  const playBlob = async (blob: Blob) => {
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    const url = URL.createObjectURL(blob);
    blobUrlRef.current = url;
    const audio = new Audio(url);
    audio.playbackRate = settings.voiceSpeed;
    audioRef.current = audio;
    audio.onended = () => { setIsPlaying(false); onEnded?.(); };
    audio.onerror = () => { setIsPlaying(false); void playDevice(text, true); };
    await audio.play();
    setEngine('gemini');
    setIsPlaying(true);
  };

  const handle = async () => {
    if (isPlaying) {
      audioRef.current?.pause();
      synthRef.current?.pause();
      setIsPlaying(false);
      return;
    }
    if (synthRef.current?.paused) {
      synthRef.current.resume();
      setIsPlaying(true);
      return;
    }
    if (audioRef.current?.paused && audioRef.current.src) {
      await audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    setLoading(true);
    try {
      const want = settings.voiceEngine;
      if (want === 'gemini' || want === 'auto') {
        const key = ttsCacheKey(text, settings.voicePreset, settings.voiceSpeed);
        const cached = await getCachedAudio(key);
        if (cached) {
          await playBlob(cached);
          return;
        }
        const blob = await fetchServerTTS(text, settings.voicePreset);
        if (blob) {
          await setCachedAudio(key, blob);
          await playBlob(blob);
          return;
        }
        if (want === 'gemini') {
          await playDevice(text, true);
          return;
        }
      }

      await playDevice(text, want !== 'web-speech');
    } finally {
      setLoading(false);
    }
  };

  const voice = VOICE_PRESETS[settings.voicePreset];
  const engineLabel = engine === 'gemini'
    ? `AI 自然語音 · ${voice.shortLabel}`
    : engine === 'device-natural'
      ? '裝置自然語音'
      : engine === 'web-speech'
        ? '系統語音'
        : `${voice.emoji} ${voice.shortLabel}`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={handle}
        disabled={loading}
        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-4 py-2.5 rounded-full text-sm font-black shadow-sm transition active:scale-[0.98]"
      >
        {loading ? <LoaderCircle size={15} className="animate-spin"/> : isPlaying ? <Pause size={15}/> : <Play size={15} className="fill-current"/>}
        {loading ? '準備自然語音…' : isPlaying ? '暫停' : '聽老師說'}
      </button>
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold card" style={{ color: engine === 'gemini' ? '#6d28d9' : 'var(--text-2)' }}>
        {engine === 'gemini' ? <Sparkles size={12}/> : <Volume2 size={12}/>}
        {engineLabel}
      </span>
      <span className="text-[11px] hidden sm:inline" style={{ color: 'var(--text-3)' }}>{settings.voiceSpeed}x</span>
    </div>
  );
}
