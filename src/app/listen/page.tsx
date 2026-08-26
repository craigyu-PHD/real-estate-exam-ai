'use client';
import { SkipBack, SkipForward, Clock, CheckCircle2, Volume2, AlertCircle, Pause, Play, Headphones, Sparkles, Route, Trophy } from 'lucide-react';
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { lawsData } from '@/data/lawsData';
import { generatedArticles } from '@/data/generatedArticles';
import { useSettings } from '@/hooks/useSettings';
import { fetchServerTTS, getCachedAudio, setCachedAudio, ttsCacheKey, pickNaturalTaiwanVoice, waitForSpeechVoices } from '@/lib/tts';
import { VOICE_PRESETS } from '@/lib/voiceConfig';

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

  useEffect(() => { idxRef.current = idx; }, [idx]);
  useEffect(() => {
    if (typeof window !== 'undefined') synthRef.current = window.speechSynthesis;
    return () => { synthRef.current?.cancel(); audioRef.current?.pause(); };
  }, []);

  const arts = useMemo(() => generatedArticles[lawId] || [], [lawId]);
  const queueLen = Math.min(arts.length, Math.max(1, Math.round(minutes / 1.5)));
  const queue = useMemo(() => arts.slice(0, queueLen), [arts, queueLen]);
  const cur = queue[idx];
  const voice = VOICE_PRESETS[settings.voicePreset];

  const speakDevice = useCallback(async (text: string, onEnd?: () => void) => {
    if (!synthRef.current) return;
    const voices = await waitForSpeechVoices(synthRef.current);
    synthRef.current.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-TW';
    u.rate = settings.voiceSpeed;
    const natural = settings.voiceEngine !== 'web-speech';
    const best = natural ? pickNaturalTaiwanVoice(voices) : voices.find(v => /zh[-_]TW/i.test(v.lang)) || voices.find(v => /^zh/i.test(v.lang));
    if (best) u.voice = best;
    setStatus(`${natural ? '裝置自然語音' : '系統語音'} · ${best?.name || '預設中文'} · ${settings.voiceSpeed}x`);
    u.onend = () => { setIsPlaying(false); setStatus(''); onEnd?.(); };
    u.onerror = () => { setStatus('播放失敗，請檢查裝置音量或改用系統語音'); setIsPlaying(false); };
    u.onstart = () => setIsPlaying(true);
    synthRef.current.speak(u);
    setIsPlaying(true);
  }, [settings.voiceEngine, settings.voiceSpeed]);

  const speakWithFallback = useCallback(async (text: string, onEnd?: () => void) => {
    if (settings.voiceEngine === 'auto' || settings.voiceEngine === 'gemini') {
      try {
        const key = ttsCacheKey(text, settings.voicePreset, settings.voiceSpeed);
        let blob = await getCachedAudio(key);
        if (!blob) {
          blob = await fetchServerTTS(text, settings.voicePreset);
          if (blob) await setCachedAudio(key, blob);
        }
        if (blob) {
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          audio.playbackRate = settings.voiceSpeed;
          audioRef.current = audio;
          setStatus(`AI 自然語音 · ${voice.emoji} ${voice.label}`);
          audio.onended = () => { setIsPlaying(false); setStatus(''); onEnd?.(); URL.revokeObjectURL(url); };
          audio.onerror = () => { setStatus('AI 語音暫時不可用，已切換裝置自然語音'); void speakDevice(text, onEnd); URL.revokeObjectURL(url); };
          await audio.play();
          setIsPlaying(true);
          return;
        }
      } catch {}
    }
    await speakDevice(text, onEnd);
  }, [settings.voiceEngine, settings.voicePreset, settings.voiceSpeed, speakDevice, voice.emoji, voice.label]);

  const getLecture = useCallback(async (articleNumber: string, fallback: string) => {
    try {
      const response = await fetch('/api/material/lecture', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lawId, articleId: articleNumber }),
      });
      if (!response.ok) return fallback;
      const data = await response.json();
      return typeof data.lectureScript === 'string' && data.lectureScript ? data.lectureScript : fallback;
    } catch { return fallback; }
  }, [lawId]);

  const playArticle = useCallback(async (article: { articleNumber: string; text: string }, onEnd?: () => void) => {
    setStatus('正在準備 Mini Lecture…');
    const lecture = await getLecture(article.articleNumber, article.text);
    await speakWithFallback(lecture, onEnd);
  }, [getLecture, speakWithFallback]);

  const handleToggle = () => {
    if (isPlaying) {
      if (audioRef.current && !audioRef.current.paused) audioRef.current.pause();
      if (synthRef.current?.speaking) synthRef.current.pause();
      setIsPlaying(false);
      setStatus('已暫停 · 隨時可繼續');
      return;
    }
    if (synthRef.current?.paused) { synthRef.current.resume(); setIsPlaying(true); setStatus('繼續播放'); return; }
    if (audioRef.current?.paused && audioRef.current.src) { void audioRef.current.play(); setIsPlaying(true); return; }
    if (!cur) { setStatus('目前沒有可播放條文'); return; }

    const doNext = () => {
      const nextIdx = idxRef.current + 1;
      if (settings.autoPlayNext && nextIdx < queue.length) {
        setIdx(nextIdx);
        const next = queue[nextIdx];
        if (next) setTimeout(() => { void playArticle(next, doNext); }, 650);
      }
    };
    void playArticle(cur, doNext);
  };

  const stopCurrent = () => {
    synthRef.current?.cancel();
    audioRef.current?.pause();
    setIsPlaying(false);
    setStatus('');
  };

  const jump = (delta: number) => {
    stopCurrent();
    setIdx(i => Math.max(0, Math.min(queue.length - 1, i + delta)));
  };

  if (!cur) return <div className="p-10 text-center" style={{ color: 'var(--text-3)' }}>此法規暫無條文</div>;

  const progressPct = Math.round(((idx + 1) / queue.length) * 100);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-5 pb-28 md:pb-10">
      <header className="card rounded-[1.75rem] p-6 md:p-7 shadow-sm relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-600 text-white flex items-center justify-center shadow-sm"><Headphones size={22} /></div>
            <div><div className="text-xs font-black tracking-[0.18em] text-violet-600">HANDS-FREE STUDY</div><h1 className="text-2xl font-black mt-1" style={{ color: 'var(--text-1)' }}>AI 聽課模式</h1><p className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>每條都播放同一套 Mini Lecture：法條原文、白話解析、制度目的、案例與考點。</p></div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-full bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20"><Sparkles size={13}/> {voice.emoji} {voice.label}</span>
        </div>
      </header>

      <section className="grid md:grid-cols-[1.2fr_.8fr] gap-4">
        <div className="card rounded-[1.75rem] p-5 shadow-sm">
          <div className="text-xs font-black mb-3 flex items-center gap-2" style={{ color: 'var(--text-2)' }}><Route size={14} className="text-indigo-600"/> 選擇今天的路線</div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {lawsData.map(l => (
              <button key={l.id} onClick={() => { stopCurrent(); setLawId(l.id); setIdx(0); }} className={`px-3.5 py-2.5 rounded-full text-xs font-black border whitespace-nowrap transition ${lawId===l.id?'bg-indigo-600 border-indigo-600 text-white shadow-sm':'card'}`} style={lawId!==l.id?{color:'var(--text-2)'}:undefined}>{l.name}</button>
            ))}
          </div>
        </div>
        <div className="card rounded-[1.75rem] p-5 shadow-sm">
          <div className="text-xs font-black mb-3 flex items-center gap-2" style={{ color: 'var(--text-2)' }}><Clock size={14} className="text-emerald-600"/> 這輪要聽多久</div>
          <div className="grid grid-cols-4 gap-2">
            {[5,10,20,30].map(m => (
              <button key={m} onClick={() => { stopCurrent(); setIdx(0); setMinutes(m); }} className={`py-2.5 rounded-xl text-sm font-black border transition ${minutes===m?'bg-emerald-600 border-emerald-600 text-white shadow-sm':'card'}`} style={minutes!==m?{color:'var(--text-2)'}:undefined}>{m}<span className="text-[10px] ml-0.5">分</span></button>
            ))}
          </div>
        </div>
      </section>

      <section className="listen-stage rounded-[2rem] p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,.18),transparent_25%),radial-gradient(circle_at_80%_80%,rgba(16,185,129,.22),transparent_28%)]" />
        <div className="relative max-w-xl mx-auto flex flex-col items-center text-center">
          <div className="text-xs font-black tracking-[0.18em] opacity-70">NOW LEARNING · {progressPct}%</div>
          <div className={`mt-5 w-40 h-40 rounded-full bg-white/10 border border-white/15 flex items-center justify-center relative shadow-2xl backdrop-blur ${isPlaying ? 'voice-orbit' : ''}`}>
            <div className="w-28 h-28 rounded-full bg-white/10 border border-white/15 flex items-center justify-center"><span className="text-5xl">{voice.emoji}</span></div>
            {isPlaying && <span className="absolute inset-[-14px] rounded-full border border-emerald-300/30 animate-ping" />}
          </div>
          <div className="mt-5 inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-white/10 border border-white/10"><Volume2 size={13}/> {status || '準備好就開始這一輪'}</div>
          <h2 className="text-xl font-black mt-4">{lawsData.find(l => l.id === lawId)?.name} 第 {cur.articleNumber} 條</h2>
          <p className="text-sm opacity-80 mt-2 leading-relaxed line-clamp-3">先聽法條原文，再由老師拆解本條重點與實務情境。</p>
          <button onClick={handleToggle} className={`mt-6 inline-flex items-center gap-2 px-9 py-3.5 rounded-full font-black text-sm shadow-lg transition active:scale-[0.98] ${isPlaying ? 'bg-amber-400 text-slate-950 hover:bg-amber-300' : 'bg-white text-indigo-700 hover:bg-indigo-50'}`}>
            {isPlaying ? <><Pause size={17}/> 暫停這一輪</> : <><Play size={17} className="fill-current"/> 開始聽課</>}
          </button>
          <div className="flex items-center gap-4 mt-5">
            <button onClick={() => jump(-1)} disabled={idx===0} className="w-11 h-11 rounded-full bg-white/10 disabled:opacity-30 flex items-center justify-center hover:bg-white/15 transition"><SkipBack size={17}/></button>
            <div><div className="text-xs opacity-70">本輪進度</div><div className="text-sm font-black mt-0.5">{idx+1} / {queue.length} 條</div></div>
            <button onClick={() => jump(1)} disabled={idx===queue.length-1} className="w-11 h-11 rounded-full bg-white/10 disabled:opacity-30 flex items-center justify-center hover:bg-white/15 transition"><SkipForward size={17}/></button>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-5"><div className="h-full rounded-full bg-emerald-300 transition-all duration-500" style={{ width: `${progressPct}%` }} /></div>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-3">
        <div className="card rounded-2xl p-4"><div className="text-xs" style={{color:'var(--text-3)'}}>本輪任務</div><div className="text-lg font-black mt-1" style={{color:'var(--text-1)'}}>完成 {queue.length} 條</div><div className="text-xs mt-1" style={{color:'var(--text-3)'}}>約 {minutes} 分鐘</div></div>
        <div className="card rounded-2xl p-4"><div className="text-xs" style={{color:'var(--text-3)'}}>聲線</div><div className="text-lg font-black mt-1" style={{color:'var(--text-1)'}}>{voice.emoji} {voice.label}</div><div className="text-xs mt-1" style={{color:'var(--text-3)'}}>{settings.voiceSpeed}x</div></div>
        <div className="card rounded-2xl p-4"><div className="text-xs flex items-center gap-1" style={{color:'var(--text-3)'}}><Trophy size={12} className="text-amber-500"/> 闖關提示</div><div className="text-sm font-black mt-1" style={{color:'var(--text-1)'}}>聽完後回閱讀頁標記理解</div><div className="text-xs mt-1" style={{color:'var(--text-3)'}}>讓「聽過」變成真正進度</div></div>
      </section>

      {!settings.autoPlayNext && <div className="card rounded-2xl p-4 text-xs flex items-center gap-2 text-amber-700 dark:text-amber-300"><AlertCircle size={14}/> 自動連播目前關閉；每條播完需手動下一條。</div>}

      <section className="card rounded-[1.75rem] p-5 shadow-sm">
        <div className="text-sm font-black flex items-center justify-between gap-3" style={{color:'var(--text-1)'}}><span>本輪播放清單</span><span className="text-xs font-normal" style={{color:'var(--text-3)'}}>{queue.length} 條 · 約 {minutes} 分鐘</span></div>
        <div className="space-y-1.5 max-h-72 overflow-auto mt-3 pr-1">
          {queue.map((article, i) => (
            <button key={article.articleNumber} onClick={() => { stopCurrent(); setIdx(i); }} className={`w-full text-left px-3.5 py-3 rounded-xl text-xs flex justify-between items-center gap-3 transition border ${i===idx?'bg-indigo-600 border-indigo-600 text-white':'card'}`} style={i!==idx?{color:'var(--text-2)'}:undefined}>
              <span className="truncate">第 {article.articleNumber} 條 — {article.text.slice(0, 28)}…</span>
              {i===idx && isPlaying ? <Volume2 size={14} className="animate-pulse shrink-0"/> : i===idx ? <CheckCircle2 size={14} className="shrink-0"/> : null}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
