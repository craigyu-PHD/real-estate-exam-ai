'use client';
import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Gauge, RotateCcw, Sparkles } from 'lucide-react';
import { getCachedAudio, setCachedAudio, hashText, fetchServerTTS } from '@/lib/tts';

type Engine = 'gemini' | 'edge' | 'web-speech' | null;

export function AudioPlayer({ text }: { text: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [engine, setEngine] = useState<Engine>(null);
  const [rate, setRate] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') synthRef.current = window.speechSynthesis;
    return () => {
      if (synthRef.current) synthRef.current.cancel();
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  const playWebSpeech = (t: string, r: number) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const u = new SpeechSynthesisUtterance(t);
    u.lang = 'zh-TW';
    u.rate = r;
    // Prefer a Mandarin voice if available
    const voices = synthRef.current.getVoices();
    const tw = voices.find(v => v.lang.includes('zh-TW') || v.lang.includes('zh_TW')) || voices.find(v => v.lang.startsWith('zh'));
    if (tw) u.voice = tw;
    u.onend = () => setIsPlaying(false);
    u.onerror = () => setIsPlaying(false);
    utteranceRef.current = u;
    synthRef.current.speak(u);
    setEngine('web-speech');
    setIsPlaying(true);
  };

  const handlePlayPause = async () => {
    if (isPlaying) {
      if (audioRef.current && !audioRef.current.paused) audioRef.current.pause();
      if (synthRef.current?.speaking) synthRef.current.pause();
      setIsPlaying(false);
      return;
    }
    // resume if web speech paused
    if (synthRef.current?.paused) { synthRef.current.resume(); setIsPlaying(true); return; }
    if (audioRef.current && audioRef.current.paused && audioRef.current.src) { audioRef.current.play(); setIsPlaying(true); return; }

    setLoading(true);
    const key = hashText(text);
    // 1) IndexedDB cache
    const cached = await getCachedAudio(key);
    if (cached) {
      const url = URL.createObjectURL(cached);
      blobUrlRef.current = url;
      const a = new Audio(url);
      a.playbackRate = rate;
      audioRef.current = a;
      a.onended = () => setIsPlaying(false);
      a.onerror = () => { playWebSpeech(text, rate); };
      await a.play();
      setIsPlaying(true);
      setEngine('gemini');
      setLoading(false);
      return;
    }
    // 2) Server TTS
    const blob = await fetchServerTTS(text);
    if (blob) {
      await setCachedAudio(key, blob);
      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;
      const a = new Audio(url);
      a.playbackRate = rate;
      audioRef.current = a;
      a.onended = () => setIsPlaying(false);
      a.onerror = () => playWebSpeech(text, rate);
      await a.play();
      setIsPlaying(true);
      setEngine('gemini');
      setLoading(false);
      return;
    }
    // 3) Fallback
    setLoading(false);
    playWebSpeech(text, rate);
  };

  const handleRateChange = (r: number) => {
    setRate(r);
    if (audioRef.current) audioRef.current.playbackRate = r;
    // web speech needs restart to apply rate, do nothing until next play
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={handlePlayPause}
        disabled={loading}
        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg shadow-emerald-900/20 transition-colors"
      >
        {isPlaying ? <Pause size={14} className="fill-current" /> : <Play size={14} className="fill-current" />}
        {loading ? '準備中…' : isPlaying ? '暫停' : '聽老師說'}
      </button>
      <div className="flex items-center gap-1.5 text-xs">
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border ${engine === 'gemini' || engine === 'edge' ? 'bg-purple-500/10 text-purple-300 border-purple-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
          {engine === 'gemini' || engine === 'edge' ? <Sparkles size={12} /> : <Volume2 size={12} />}
          {engine === 'gemini' ? 'AI 語音' : engine === 'edge' ? 'Edge 語音' : engine === 'web-speech' ? '系統語音' : '自動選源'}
        </span>
        <div className="hidden sm:flex items-center gap-1 bg-slate-800 rounded-full p-1 border border-slate-700">
          {[0.8, 1.0, 1.25, 1.5].map(r => (
            <button key={r} onClick={() => handleRateChange(r)} className={`px-2 py-0.5 rounded-full text-xs font-medium transition ${rate === r ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'}`}>{r}x</button>
          ))}
        </div>
      </div>
    </div>
  );
}
