'use client';
import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Sparkles } from 'lucide-react';
import { getCachedAudio, setCachedAudio, hashText, fetchServerTTS } from '@/lib/tts';
import { useSettings } from '@/hooks/useSettings';

type Engine = 'gemini' | 'edge' | 'web-speech' | null;

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

  const waitVoices = async (): Promise<SpeechSynthesisVoice[]> => {
    if (!synthRef.current) return [];
    let v = synthRef.current.getVoices();
    if (v.length) return v;
    return await new Promise(res=>{
      const h = ()=>{ res(synthRef.current!.getVoices()); synthRef.current!.removeEventListener('voiceschanged',h); };
      synthRef.current!.addEventListener('voiceschanged',h);
      setTimeout(()=> res(synthRef.current!.getVoices()), 800);
    });
  };

  const playWeb = async (t: string, eng: Engine) => {
    if (!synthRef.current) return;
    const voices = await waitVoices();
    synthRef.current.cancel();
    const u = new SpeechSynthesisUtterance(t);
    u.lang = 'zh-TW';
    u.rate = settings.voiceSpeed;
    // differentiate: edge prefers HsiaoYu, gemini fallback uses slightly slower + higher pitch, web uses default
    let candidate: SpeechSynthesisVoice | undefined;
    if (eng==='edge') candidate = voices.find(v=> v.name.includes('HsiaoYu') || v.name.includes('YunJhe')) || voices.find(v=>v.lang.includes('zh-TW'));
    else if (eng==='gemini') candidate = voices.find(v=> v.name.includes('Google')) || voices.find(v=>v.lang.includes('zh-TW'));
    else candidate = voices.find(v=> v.lang.includes('zh-TW')) || voices[0];
    if (candidate) u.voice = candidate;
    if (eng==='gemini') u.pitch = 1.05;
    if (eng==='edge') u.pitch = 1.0;
    u.onend = ()=> { setIsPlaying(false); onEnded?.(); };
    u.onerror = ()=> setIsPlaying(false);
    synthRef.current.speak(u);
    setEngine(eng as Engine);
    setIsPlaying(true);
  };

  const handle = async ()=>{
    if (isPlaying){ audioRef.current?.pause(); synthRef.current?.pause(); setIsPlaying(false); return; }
    if (synthRef.current?.paused){ synthRef.current.resume(); setIsPlaying(true); return; }
    if (audioRef.current?.paused && audioRef.current.src){ audioRef.current.play(); setIsPlaying(true); return; }
    setLoading(true);
    // decide engine per settings
    const want = settings.voiceEngine;
    if (want==='gemini' || want==='auto'){
      const key = hashText(text);
      const cached = await getCachedAudio(key);
      if (cached){ const url=URL.createObjectURL(cached); blobUrlRef.current=url; const a=new Audio(url); a.playbackRate=settings.voiceSpeed; audioRef.current=a; a.onended=()=>{setIsPlaying(false); onEnded?.();}; await a.play(); setIsPlaying(true); setEngine('gemini'); setLoading(false); return; }
      const blob = await fetchServerTTS(text);
      if (blob){ await setCachedAudio(key, blob); const url=URL.createObjectURL(blob); blobUrlRef.current=url; const a=new Audio(url); a.playbackRate=settings.voiceSpeed; audioRef.current=a; a.onended=()=>{setIsPlaying(false); onEnded?.();}; await a.play(); setIsPlaying(true); setEngine('gemini'); setLoading(false); return; }
      // if auto, fall through to edge/web
      if (want==='gemini'){ setLoading(false); await playWeb(text,'gemini'); return; }
    }
    setLoading(false);
    if (want==='edge') await playWeb(text,'edge');
    else await playWeb(text,'web-speech');
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button onClick={handle} disabled={loading} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-full text-sm font-black shadow">
        {isPlaying ? <Pause size={14}/> : <Play size={14} className="fill-current"/>}
        {loading ? '準備中…' : isPlaying ? '暫停' : '聽老師說'}
      </button>
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-bold ${engine==='gemini' ? 'bg-violet-50 text-violet-700 border-violet-200' : engine==='edge' ? 'bg-sky-50 text-sky-700 border-sky-200' : engine==='web-speech' ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
        {engine ? <Sparkles size={12}/> : <Volume2 size={12}/>}
        {engine==='gemini' ? 'Gemini' : engine==='edge' ? 'Edge' : engine==='web-speech' ? '系統' : `${settings.voiceEngine} · ${settings.voiceSpeed}x`}
      </span>
      <span className="text-xs text-slate-500 hidden sm:inline">{settings.voiceSpeed}x · {settings.voiceEngine}</span>
    </div>
  );
}
