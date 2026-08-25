'use client';
import { SkipBack, SkipForward, ListMusic, Clock, CheckCircle2, Volume2, AlertCircle, Pause, Play } from 'lucide-react';
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { lawsData } from '@/data/lawsData';
import { generatedArticles } from '@/data/generatedArticles';
import { useSettings } from '@/hooks/useSettings';
import { fetchServerTTS, getCachedAudio, setCachedAudio, hashText } from '@/lib/tts';

export default function ListenPage() {
  const { settings } = useSettings();
  const [lawId, setLawId] = useState('civil');
  const [idx, setIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [minutes, setMinutes] = useState(10);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const idxRef = useRef(0);
  idxRef.current = idx;

  useEffect(()=>{ if(typeof window!=='undefined') synthRef.current = window.speechSynthesis; return()=> { synthRef.current?.cancel(); audioRef.current?.pause(); }; },[]);

  const arts = generatedArticles[lawId] || [];
  const queueLen = Math.min(arts.length, Math.max(1, Math.round(minutes / 1.5)));
  const queue = useMemo(()=> arts.slice(0, queueLen), [arts, queueLen]);
  const cur = queue[idx];

  const waitVoices = useCallback(async (): Promise<SpeechSynthesisVoice[]> => {
    if (!synthRef.current) return [];
    let voices = synthRef.current.getVoices();
    if (voices.length > 0) return voices;
    return await new Promise(res=>{
      const handler = ()=> { res(synthRef.current!.getVoices()); synthRef.current!.removeEventListener('voiceschanged', handler); };
      synthRef.current!.addEventListener('voiceschanged', handler);
      setTimeout(()=> res(synthRef.current!.getVoices()), 800);
    });
  },[]);

  const speakWithFallback = useCallback(async (text: string, onEnd?: ()=>void) => {
    // Try server TTS first if settings allows
    if (settings.voiceEngine !== 'web-speech') {
      try {
        const key = hashText(text);
        let blob = await getCachedAudio(key);
        if (!blob) {
          blob = await fetchServerTTS(text);
          if (blob) await setCachedAudio(key, blob);
        }
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = new Audio(url);
          a.playbackRate = settings.voiceSpeed;
          audioRef.current = a;
          setStatus('AI 語音播放中');
          a.onended = ()=> { setIsPlaying(false); setStatus(''); onEnd?.(); URL.revokeObjectURL(url); };
          a.onerror = ()=> { setStatus('AI 失敗，切換系統語音'); speakWeb(text, onEnd); };
          await a.play();
          setIsPlaying(true);
          return;
        }
      } catch {}
    }
    // fallback to Web Speech
    await speakWeb(text, onEnd);
  }, [settings.voiceEngine, settings.voiceSpeed]);

  const speakWeb = async (text: string, onEnd?: ()=>void) => {
    if (!synthRef.current) return;
    const voices = await waitVoices();
    synthRef.current.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-TW';
    u.rate = settings.voiceSpeed;
    const tw = voices.find(v=>v.lang.includes('zh-TW')) || voices.find(v=> v.lang.startsWith('zh')) || voices[0];
    if (tw) u.voice = tw;
    u.volume = 1;
    setStatus(`系統語音：${tw?.name || '預設'} · ${settings.voiceSpeed}x`);
    u.onend = ()=> { setIsPlaying(false); setStatus(''); onEnd?.(); };
    u.onerror = (e)=> { setStatus('播放失敗，請檢查音量'); setIsPlaying(false); console.error(e); };
    u.onstart = ()=> setIsPlaying(true);
    synthRef.current.speak(u);
    setIsPlaying(true);
    // Safari needs resume kick
    setTimeout(()=> { if (synthRef.current?.paused) synthRef.current.resume(); }, 100);
  };

  const handleToggle = () => {
    if (isPlaying) {
      if (audioRef.current && !audioRef.current.paused) audioRef.current.pause();
      if (synthRef.current?.speaking) synthRef.current.pause();
      setIsPlaying(false);
      setStatus('已暫停');
      return;
    }
    if (synthRef.current?.paused) { synthRef.current.resume(); setIsPlaying(true); setStatus('繼續播放'); return; }
    if (audioRef.current?.paused && audioRef.current.src) { audioRef.current.play(); setIsPlaying(true); return; }
    if (!cur) { setStatus('無條文可播放'); return; }
    const doNext = () => {
      const nextIdx = idxRef.current + 1;
      if (settings.autoPlayNext && nextIdx < queue.length) {
        setIdx(nextIdx);
        const nxt = queue[nextIdx];
        if (nxt) setTimeout(()=> speakWithFallback(nxt.text, doNext), 700);
      }
    };
    speakWithFallback(cur.text, doNext);
  };

  const jump = (delta: number) => {
    synthRef.current?.cancel();
    audioRef.current?.pause();
    setIsPlaying(false);
    setStatus('');
    setIdx(i=> Math.max(0, Math.min(queue.length-1, i+delta)));
  };

  if (!cur) return <div className="p-10 text-center text-slate-500">此法規暫無條文</div>;

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-5 relative z-10">
      <header className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-black text-white flex items-center gap-2"><Volume2 className="text-emerald-400" /> 聽課模式</h1>
        <p className="text-xs text-slate-400 mt-1">免盯螢幕 · 戴耳機連播 {minutes} 分鐘 · {settings.voiceEngine} / {settings.voiceSpeed}x {settings.autoPlayNext ? '· 自動連播' : '· 手動'}</p>
        {status && <p className="text-xs text-emerald-300 mt-2 bg-emerald-900/20 border border-emerald-500/20 rounded-lg px-3 py-1.5">{status}</p>}
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {lawsData.slice(0,6).map(l=> (
          <button key={l.id} onClick={()=>{synthRef.current?.cancel(); audioRef.current?.pause(); setIsPlaying(false); setStatus(''); setLawId(l.id); setIdx(0);}} className={`px-3 py-2 rounded-full text-xs font-bold border whitespace-nowrap transition ${lawId===l.id?'bg-blue-600 border-blue-500 text-white shadow':'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>{l.name}</button>
        ))}
      </div>

      <div className="flex gap-2">
        {[5,10,20,30].map(m=> (
          <button key={m} onClick={()=>{synthRef.current?.cancel(); setIdx(0); setIsPlaying(false); setMinutes(m);}} className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition ${minutes===m?'bg-white text-slate-900 border-white shadow':'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'}`}>{m}分鐘</button>
        ))}
      </div>

      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700 rounded-[2rem] p-6 flex flex-col items-center shadow-2xl">
        <div className={`w-44 h-44 rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center relative shadow-xl ${isPlaying ? 'animate-pulse' : ''}`}>
          {isPlaying && <span className="absolute inset-0 rounded-full bg-white/10 animate-ping" />}
          <span className={`absolute inset-[-10px] rounded-full border ${isPlaying ? 'border-emerald-400/30 animate-pulse' : 'border-white/5'}`} />
          <ListMusic size={44} className="text-white" />
        </div>
        <h2 className="text-base font-black text-white mt-5 text-center">{lawsData.find(l=>l.id===lawId)?.name} 第 {cur.articleNumber} 條</h2>
        <p className="text-xs text-slate-300 mt-2 text-center line-clamp-3 max-w-md leading-relaxed bg-slate-950/50 border border-slate-800 rounded-xl p-3">{cur.text}</p>
        <button onClick={handleToggle} className={`mt-5 inline-flex items-center gap-2 px-8 py-3 rounded-full font-black text-sm shadow-lg transition ${isPlaying ? 'bg-amber-500 hover:bg-amber-400 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}>
          {isPlaying ? <><Pause size={16} /> 暫停</> : <><Play size={16} className="fill-current" /> 開始播放</>}
        </button>
        <div className="flex items-center gap-3 mt-4">
          <button onClick={()=>jump(-1)} disabled={idx===0} className="w-10 h-10 rounded-full bg-slate-700 disabled:opacity-40 flex items-center justify-center text-white hover:bg-slate-600"><SkipBack size={16} /></button>
          <span className="text-xs text-slate-400 flex items-center gap-1.5"><Clock size={12} /> {idx+1} / {queue.length} 條</span>
          <button onClick={()=>jump(1)} disabled={idx===queue.length-1} className="w-10 h-10 rounded-full bg-slate-700 disabled:opacity-40 flex items-center justify-center text-white hover:bg-slate-600"><SkipForward size={16} /></button>
        </div>
        {!settings.autoPlayNext && <p className="text-xs text-amber-300 mt-3 flex items-center gap-1"><AlertCircle size={12} /> 已關閉自動連播，播完需手動下一條</p>}
        <p className="text-[11px] text-slate-500 mt-2">若無聲音請檢查：① 裝置音量 ② 瀏覽器是否靜音 ③ 切到「系統語音」再試</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="text-xs font-bold text-white mb-2 flex items-center justify-between">本輪播放清單 <span className="text-slate-500 font-normal">{queue.length} 條 · 約 {minutes} 分鐘</span></div>
        <div className="space-y-1 max-h-64 overflow-auto">
          {queue.map((a,i)=> (
            <button key={a.articleNumber} onClick={()=>{synthRef.current?.cancel(); audioRef.current?.pause(); setIdx(i); setIsPlaying(false); setStatus('');}} className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex justify-between items-center transition ${i===idx?'bg-blue-600 text-white shadow':'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
              <span className="truncate">第 {a.articleNumber} 條 — {a.text.slice(0,22)}…</span>
              {i===idx && isPlaying ? <Volume2 size={14} className="animate-pulse" /> : i===idx ? <CheckCircle2 size={14} /> : null}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
