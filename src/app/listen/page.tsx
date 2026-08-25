'use client';
import { SkipBack, SkipForward, ListMusic, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { lawsData } from '@/data/lawsData';
import { generatedArticles } from '@/data/generatedArticles';
import { useSettings } from '@/hooks/useSettings';

export default function ListenPage() {
  const { settings } = useSettings();
  const [lawId, setLawId] = useState('civil');
  const [idx, setIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [minutes, setMinutes] = useState(10);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(()=>{ if(typeof window!=='undefined') synthRef.current = window.speechSynthesis; return()=> synthRef.current?.cancel(); },[]);

  const arts = generatedArticles[lawId] || [];
  // queue based on minutes: ~1 article per 1.5 min
  const queueLen = Math.min(arts.length, Math.max(1, Math.round(minutes / 1.5)));
  const queue = useMemo(()=> arts.slice(0, queueLen), [arts, queueLen]);
  const cur = queue[idx];

  const speak = (text: string, onEnd?: ()=>void) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-TW';
    u.rate = settings.voiceSpeed;
    const voices = synthRef.current.getVoices();
    const tw = voices.find(v=>v.lang.includes('zh-TW')) || voices.find(v=>v.lang.startsWith('zh'));
    if (tw) u.voice = tw;
    u.onend = ()=> { setIsPlaying(false); onEnd?.(); };
    u.onerror = ()=> setIsPlaying(false);
    synthRef.current.speak(u);
    setIsPlaying(true);
  };

  const handlePlay = () => {
    if (!cur) return;
    if (isPlaying) { synthRef.current?.pause(); setIsPlaying(false); return; }
    if (synthRef.current?.paused) { synthRef.current.resume(); setIsPlaying(true); return; }
    const next = () => {
      if (settings.autoPlayNext && idx < queue.length - 1) {
        setIdx(i=>i+1);
        // auto play next after short delay
        setTimeout(()=> {
          const nxt = queue[idx+1];
          if (nxt) {
            const u2 = new SpeechSynthesisUtterance(nxt.text);
            u2.lang='zh-TW'; u2.rate=settings.voiceSpeed;
            const voices = synthRef.current?.getVoices() || [];
            const tw = voices.find(v=>v.lang.includes('zh-TW')) || voices.find(v=>v.lang.startsWith('zh'));
            if (tw) u2.voice = tw as any;
            u2.onend = ()=> next();
            synthRef.current?.speak(u2);
          }
        }, 600);
      }
    };
    speak(cur.text, next);
  };

  if (!cur) return <div className="p-10 text-center text-slate-500">此法規暫無條文</div>;

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6 relative z-10">
      <header className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-black text-white">聽課模式</h1>
        <p className="text-xs text-slate-400 mt-1">免盯螢幕 · 戴耳機連播 {minutes} 分鐘 · 自動用你的語音設定（{settings.voiceEngine} / {settings.voiceSpeed}x）</p>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {lawsData.slice(0,6).map(l=> (
          <button key={l.id} onClick={()=>{setLawId(l.id); setIdx(0); synthRef.current?.cancel(); setIsPlaying(false);}} className={`px-3 py-2 rounded-full text-xs font-bold border whitespace-nowrap ${lawId===l.id?'bg-blue-600 border-blue-500 text-white':'bg-slate-800 border-slate-700 text-slate-400'}`}>{l.name}</button>
        ))}
      </div>

      <div className="flex gap-2">
        {[5,10,20,30].map(m=> (
          <button key={m} onClick={()=>{setMinutes(m); setIdx(0);}} className={`flex-1 py-2.5 rounded-xl text-sm font-bold border ${minutes===m?'bg-white text-slate-900 border-white':'bg-slate-800 text-slate-300 border-slate-700'}`}>{m}分鐘</button>
        ))}
      </div>

      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-3xl p-6 flex flex-col items-center">
        <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center relative">
          {isPlaying && <span className="absolute inset-0 rounded-full bg-white/10 animate-ping" />}
          <ListMusic size={40} className="text-white" />
        </div>
        <h2 className="text-base font-black text-white mt-4 text-center">{lawsData.find(l=>l.id===lawId)?.name} 第 {cur.articleNumber} 條</h2>
        <p className="text-xs text-slate-400 mt-1 text-center line-clamp-3 max-w-md">{cur.text}</p>
        <button onClick={handlePlay} className={`mt-4 px-8 py-3 rounded-full font-black text-sm ${isPlaying ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white hover:bg-emerald-500'}`}>
          {isPlaying ? '暫停' : '開始播放'}
        </button>
        <div className="flex items-center gap-3 mt-4">
          <button onClick={()=>{synthRef.current?.cancel(); setIsPlaying(false); setIdx(Math.max(0, idx-1));}} className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-white"><SkipBack size={16} /></button>
          <span className="text-xs text-slate-400 flex items-center gap-1"><Clock size={12} /> {idx+1} / {queue.length} 條 · 約 {minutes} 分鐘</span>
          <button onClick={()=>{synthRef.current?.cancel(); setIsPlaying(false); setIdx(Math.min(queue.length-1, idx+1));}} className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-white"><SkipForward size={16} /></button>
        </div>
        {!settings.autoPlayNext && <p className="text-xs text-amber-300 mt-2 flex items-center gap-1"><AlertCircle size={12} /> 已關閉自動連播，請手動下一條</p>}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="text-xs font-bold text-white mb-2">本輪播放清單</div>
        <div className="space-y-1 max-h-64 overflow-auto">
          {queue.map((a,i)=> (
            <button key={a.articleNumber} onClick={()=>{synthRef.current?.cancel(); setIdx(i); setIsPlaying(false);}} className={`w-full text-left px-3 py-2 rounded-xl text-xs flex justify-between items-center ${i===idx?'bg-blue-600 text-white':'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
              <span>第 {a.articleNumber} 條</span>
              {i===idx && <CheckCircle2 size={14} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
