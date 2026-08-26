'use client';

import { AlertCircle, CheckCircle2, ChevronDown, Clock, Headphones, LoaderCircle, Pause, Play, Route, SkipBack, SkipForward, Sparkles, Trophy, Volume2, Waves } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { lawsData } from '@/data/lawsData';
import { generatedArticles } from '@/data/generatedArticles';
import { useSettings } from '@/hooks/useSettings';
import { fetchServerTTS, getCachedAudio, setCachedAudio, ttsCacheKey, pickNaturalTaiwanVoice, waitForSpeechVoices, type ServerTtsResult } from '@/lib/tts';
import { VOICE_PRESETS } from '@/lib/voiceConfig';
import { getStoredGeminiKey } from '@/lib/geminiKey';

type PlaybackState = 'idle' | 'preparing' | 'playing' | 'paused' | 'error';
type QueueArticle = { articleNumber: string; text: string };
type PreparedArticle = { lecture: string; audio: ServerTtsResult | null; streamUrl?: string };

export default function ListenPage() {
  const { settings } = useSettings();
  const [lawId, setLawId] = useState('civil');
  const [idx, setIdx] = useState(0);
  const [minutes, setMinutes] = useState(10);
  const [playbackState, setPlaybackState] = useState<PlaybackState>('idle');
  const [status, setStatus] = useState('');
  const [warming, setWarming] = useState(false);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const sessionRef = useRef(0);
  const startLockRef = useRef(false);
  const queueRef = useRef<QueueArticle[]>([]);
  const idxRef = useRef(0);
  const lawRef = useRef(lawId);
  const settingsRef = useRef(settings);
  const lectureCache = useRef(new Map<string, string>());
  const lectureInflight = useRef(new Map<string, Promise<string>>());
  const prepareInflight = useRef(new Map<string, Promise<PreparedArticle>>());

  const arts = useMemo(() => generatedArticles[lawId] || [], [lawId]);
  const queueLen = Math.min(arts.length, Math.max(1, Math.round(minutes / 1.5)));
  const queue = useMemo(() => arts.slice(0, queueLen), [arts, queueLen]);
  const cur = queue[idx];
  const currentLaw = lawsData.find(law => law.id === lawId);
  const voice = VOICE_PRESETS[settings.voicePreset];
  const progressPct = queue.length ? Math.round(((idx + 1) / queue.length) * 100) : 0;
  const isPreparing = playbackState === 'preparing';
  const isPlaying = playbackState === 'playing';
  const isPaused = playbackState === 'paused';

  useEffect(() => { idxRef.current = idx; }, [idx]);
  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { lawRef.current = lawId; }, [lawId]);
  useEffect(() => { settingsRef.current = settings; }, [settings]);
  useEffect(() => {
    if (typeof window !== 'undefined') synthRef.current = window.speechSynthesis;
    return () => {
      synthRef.current?.cancel();
      audioRef.current?.pause();
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  const cleanupAudio = useCallback(() => {
    synthRef.current?.cancel();
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }, []);

  const invalidatePlayback = useCallback((message = '') => {
    sessionRef.current += 1;
    startLockRef.current = false;
    cleanupAudio();
    setPlaybackState('idle');
    setStatus(message);
  }, [cleanupAudio]);

  const getLecture = useCallback(async (targetLawId: string, article: QueueArticle) => {
    const cacheId = `${targetLawId}-${article.articleNumber}`;
    const cached = lectureCache.current.get(cacheId);
    if (cached) return cached;
    const existing = lectureInflight.current.get(cacheId);
    if (existing) return existing;
    const task = (async () => {
      try {
        const response = await fetch('/api/material/lecture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lawId: targetLawId, articleId: article.articleNumber }),
        });
        if (!response.ok) return article.text;
        const data = await response.json();
        const lecture = typeof data.lectureScript === 'string' && data.lectureScript.trim() ? data.lectureScript : article.text;
        lectureCache.current.set(cacheId, lecture);
        return lecture;
      } catch {
        return article.text;
      } finally {
        lectureInflight.current.delete(cacheId);
      }
    })();
    lectureInflight.current.set(cacheId, task);
    return task;
  }, []);

  const serverProvider = useCallback((): 'auto' | 'gemini' | 'edge' | null => {
    const engine = settingsRef.current.voiceEngine;
    if (engine === 'device-natural' || engine === 'web-speech') return null;
    if (engine === 'edge-neural') return 'edge';
    if (engine === 'gemini') return 'gemini';
    return 'auto';
  }, []);

  const prepareArticle = useCallback(async (targetLawId: string, article: QueueArticle): Promise<PreparedArticle> => {
    const prefs = settingsRef.current;
    const provider = serverProvider();
    const prepareId = `${targetLawId}-${article.articleNumber}|${prefs.voicePreset}|${prefs.voiceSpeed}|${provider || 'device'}`;
    const existing = prepareInflight.current.get(prepareId);
    if (existing) return existing;

    const task = (async () => {
      const lecture = await getLecture(targetLawId, article);
      if (!provider) return { lecture, audio: null };
      const canUseEdgeStream = provider === 'edge' || ((provider === 'auto' || provider === 'gemini') && !getStoredGeminiKey());
      if (canUseEdgeStream) {
        const query = new URLSearchParams({ lawId: targetLawId, articleId: article.articleNumber, preset: prefs.voicePreset });
        return { lecture, audio: null, streamUrl: `/api/material/audio?${query.toString()}` };
      }
      const key = ttsCacheKey(lecture, prefs.voicePreset, prefs.voiceSpeed);
      const cached = await getCachedAudio(key);
      if (cached?.blob) return { lecture, audio: { blob: cached.blob, engine: cached.engine || 'cached', voice: cached.voice || '' } };
      const result = await fetchServerTTS(lecture, prefs.voicePreset, provider);
      if (result) await setCachedAudio(key, result);
      return { lecture, audio: result };
    })().finally(() => prepareInflight.current.delete(prepareId));

    prepareInflight.current.set(prepareId, task);
    return task;
  }, [getLecture, serverProvider]);

  const prefetchArticle = useCallback(async (targetLawId: string, article?: QueueArticle) => {
    if (!article) return;
    try { await prepareArticle(targetLawId, article); } catch {}
  }, [prepareArticle]);

  const playDevice = useCallback(async (lecture: string, session: number, onEnd: () => void) => {
    if (!synthRef.current || sessionRef.current !== session) return;
    const voices = await waitForSpeechVoices(synthRef.current);
    if (sessionRef.current !== session) return;
    synthRef.current.cancel();
    const prefs = settingsRef.current;
    const utterance = new SpeechSynthesisUtterance(lecture);
    utterance.lang = 'zh-TW';
    utterance.rate = prefs.voiceSpeed;
    const natural = prefs.voiceEngine !== 'web-speech';
    const candidate = natural
      ? pickNaturalTaiwanVoice(voices)
      : voices.find(v => /zh[-_]TW/i.test(v.lang)) || voices.find(v => /^zh/i.test(v.lang)) || voices[0];
    if (candidate) utterance.voice = candidate;
    utterance.onstart = () => {
      if (sessionRef.current !== session) return;
      setPlaybackState('playing');
      setStatus(`${natural ? '裝置 Natural' : '系統語音'} · ${candidate?.name || '預設中文'} · ${prefs.voiceSpeed}x`);
    };
    utterance.onend = onEnd;
    utterance.onerror = () => {
      if (sessionRef.current !== session) return;
      startLockRef.current = false;
      setPlaybackState('error');
      setStatus('播放失敗，請改用 Edge Neural 或檢查裝置語音設定');
    };
    synthRef.current.speak(utterance);
  }, []);

  const playIndex = useCallback(async function playIndexImpl(index: number, session: number) {
    if (startLockRef.current) return;
    startLockRef.current = true;
    const article = queueRef.current[index];
    const targetLawId = lawRef.current;
    if (!article || sessionRef.current !== session) { startLockRef.current = false; return; }

    const finish = () => {
      if (sessionRef.current !== session) return;
      const nextIndex = index + 1;
      if (!settingsRef.current.autoPlayNext || nextIndex >= queueRef.current.length) {
        setPlaybackState('idle');
        setStatus(nextIndex >= queueRef.current.length ? '本輪完成 ✓' : '本條播放完成');
        return;
      }
      setIdx(nextIndex);
      idxRef.current = nextIndex;
      window.setTimeout(() => {
        if (sessionRef.current !== session) return;
        void playIndexImpl(nextIndex, session);
      }, 280);
    };

    setPlaybackState('preparing');
    setStatus(`正在準備第 ${article.articleNumber} 條 Mini Lecture…`);
    try {
      const prepared = await prepareArticle(targetLawId, article);
      if (sessionRef.current !== session) return;
      const prefs = settingsRef.current;
      const next = queueRef.current[index + 1];
      if (next) void prefetchArticle(targetLawId, next);

      if (prepared.streamUrl) {
        cleanupAudio();
        const audio = new Audio(prepared.streamUrl);
        audio.preload = 'auto';
        audio.playbackRate = prefs.voiceSpeed;
        audioRef.current = audio;
        audio.onplaying = () => {
          if (sessionRef.current !== session) return;
          setPlaybackState('playing');
          setStatus(`Edge Neural 串流 · 台灣自然聲線 · ${prefs.voiceSpeed}x`);
        };
        audio.onended = finish;
        audio.onerror = () => {
          if (sessionRef.current !== session) return;
          setStatus('Edge Neural 串流暫時不可用，正在切換裝置聲線…');
          void playDevice(prepared.lecture, session, finish);
        };
        await audio.play();
        startLockRef.current = false;
        if (sessionRef.current !== session) { audio.pause(); return; }
        return;
      }

      if (prepared.audio?.blob) {
        cleanupAudio();
        const url = URL.createObjectURL(prepared.audio.blob);
        blobUrlRef.current = url;
        const audio = new Audio(url);
        audio.playbackRate = prefs.voiceSpeed;
        audioRef.current = audio;
        audio.onended = finish;
        audio.onerror = () => {
          if (sessionRef.current !== session) return;
          setStatus('伺服器自然語音播放失敗，正在切換裝置聲線…');
          void playDevice(prepared.lecture, session, finish);
        };
        const engineLabel = prepared.audio.engine === 'gemini'
          ? `Gemini · ${voice.label}`
          : prepared.audio.engine === 'edge-neural'
            ? `Edge Neural · ${prepared.audio.voice || '台灣自然聲線'}`
            : `自然語音快取 · ${voice.label}`;
        await audio.play();
        if (sessionRef.current !== session) { audio.pause(); return; }
        setPlaybackState('playing');
        setStatus(`${engineLabel} · ${prefs.voiceSpeed}x`);
        startLockRef.current = false;
        return;
      }
      await playDevice(prepared.lecture, session, finish);
      startLockRef.current = false;
    } catch {
      if (sessionRef.current !== session) return;
      setPlaybackState('error');
      setStatus('語音準備失敗，請重新嘗試或改用裝置自然語音');
    } finally {
      startLockRef.current = false;
    }
  }, [cleanupAudio, playDevice, prefetchArticle, prepareArticle, voice.label]);

  useEffect(() => {
    if (!queue.length) return;
    const session = ++sessionRef.current;
    cleanupAudio();
    queueMicrotask(() => {
      if (sessionRef.current !== session) return;
      setPlaybackState('idle');
      setStatus('');
      setWarming(true);
      void prefetchArticle(lawId, queue[0]).finally(() => {
        if (sessionRef.current === session) setWarming(false);
      });
    });
  }, [lawId, minutes, settings.voiceEngine, settings.voicePreset, settings.voiceSpeed, queue, cleanupAudio, prefetchArticle]);

  const handleToggle = () => {
    if (startLockRef.current || isPreparing) return;
    if (isPlaying) {
      if (audioRef.current && !audioRef.current.paused) audioRef.current.pause();
      if (synthRef.current?.speaking) synthRef.current.pause();
      setPlaybackState('paused');
      setStatus('已暫停 · 點一下繼續');
      return;
    }
    if (isPaused) {
      if (audioRef.current?.paused && audioRef.current.src) void audioRef.current.play();
      if (synthRef.current?.paused) synthRef.current.resume();
      setPlaybackState('playing');
      setStatus('繼續播放');
      return;
    }
    if (!cur) return;
    const session = sessionRef.current;
    void playIndex(idxRef.current, session);
  };

  const changeRoute = (nextLawId: string) => {
    if (nextLawId === lawId) return;
    invalidatePlayback();
    setWarming(false);
    setIdx(0);
    idxRef.current = 0;
    setLawId(nextLawId);
  };

  const changeMinutes = (nextMinutes: number) => {
    if (nextMinutes === minutes) return;
    invalidatePlayback();
    setWarming(false);
    setIdx(0);
    idxRef.current = 0;
    setMinutes(nextMinutes);
  };

  const jump = (delta: number) => {
    if (isPreparing) return;
    invalidatePlayback();
    const next = Math.max(0, Math.min(queue.length - 1, idxRef.current + delta));
    idxRef.current = next;
    setIdx(next);
    const session = sessionRef.current;
    void prefetchArticle(lawId, queue[next]).finally(() => {
      if (sessionRef.current === session) setWarming(false);
    });
  };

  if (!cur) return <div className="p-10 text-center text-tertiary">此法規暫無條文</div>;

  return (
    <div className="page-shell max-w-5xl space-y-4 pb-28 md:pb-10">
      <header className="page-header relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-violet-600 text-white flex items-center justify-center shadow-sm shrink-0"><Headphones size={20}/></div>
            <div><div className="text-[10px] font-black tracking-[0.18em] text-violet-600">HANDS-FREE STUDY</div><h1 className="text-2xl font-black mt-1 text-primary">AI 聽課模式</h1><p className="text-xs md:text-sm mt-1 leading-relaxed text-secondary">法條原文 → 白話拆解 → 制度目的 → 案例 → 考點；下一條會在背景預先準備。</p></div>
          </div>
          <span className="inline-flex self-start items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-full bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20"><Sparkles size={12}/> {voice.emoji} {voice.label}</span>
        </div>
      </header>

      <section className="card rounded-[1.4rem] p-4 grid md:grid-cols-[1fr_auto] gap-3 items-end">
        <label className="min-w-0">
          <span className="text-[10px] font-black text-tertiary flex items-center gap-1.5"><Route size={12}/>今天的學習路線</span>
          <div className="relative mt-1.5">
            <select value={lawId} onChange={event => changeRoute(event.target.value)} className="input-shell appearance-none w-full rounded-xl px-3 py-3 pr-9 text-sm font-black outline-none text-primary">
              {lawsData.map(law => <option key={law.id} value={law.id}>{law.name} · {generatedArticles[law.id]?.length || 0} 條</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-tertiary pointer-events-none"/>
          </div>
        </label>
        <div>
          <span className="text-[10px] font-black text-tertiary flex items-center gap-1.5"><Clock size={12}/>本輪時間</span>
          <div className="flex gap-1.5 mt-1.5">{[5,10,20,30].map(value => <button key={value} onClick={() => changeMinutes(value)} className={`min-w-14 px-3 py-3 rounded-xl border text-xs font-black transition ${minutes===value?'bg-emerald-600 border-emerald-600 text-white':'surface text-secondary'}`}>{value} 分</button>)}</div>
        </div>
      </section>

      <section className="listen-stage rounded-[1.75rem] p-5 md:p-7 text-white shadow-xl relative overflow-hidden min-h-[440px] flex items-center">
        <div className="absolute inset-0 pointer-events-none opacity-45 bg-[radial-gradient(circle_at_15%_15%,rgba(255,255,255,.2),transparent_24%),radial-gradient(circle_at_85%_85%,rgba(45,212,191,.26),transparent_30%)]" />
        <div className="relative w-full max-w-2xl mx-auto flex flex-col items-center text-center">
          <div className="text-[10px] font-black tracking-[0.18em] opacity-70">NOW LEARNING · {progressPct}%</div>

          <div className={`lecture-loader mt-5 ${isPreparing ? 'is-loading' : isPlaying ? 'is-playing' : ''}`} aria-hidden="true">
            <div className="lecture-loader-ring ring-one"/><div className="lecture-loader-ring ring-two"/>
            <div className="lecture-teacher-avatar">{isPreparing ? <LoaderCircle size={38} className="animate-spin"/> : <span>{voice.emoji}</span>}</div>
            <div className="lecture-wave-bars">{[0,1,2,3,4].map(bar => <i key={bar}/>)}</div>
          </div>

          <div className="mt-4 min-h-7 inline-flex items-center gap-2 text-[10px] md:text-xs px-3 py-1.5 rounded-full bg-white/10 border border-white/10 max-w-full">
            {isPreparing ? <LoaderCircle size={13} className="animate-spin shrink-0"/> : <Volume2 size={13} className="shrink-0"/>}
            <span className="truncate">{status || (warming ? '背景正在預熱這一條的自然語音…' : '已準備好，點擊開始聽課')}</span>
          </div>
          {isPreparing && <p className="mt-2 text-[10px] text-white/65">正在讀取教材與自然聲線，按鈕已鎖定，避免重複送出請求。</p>}

          <h2 className="text-xl md:text-2xl font-black mt-4">{currentLaw?.name} · 第 {cur.articleNumber} 條</h2>
          <p className="text-xs md:text-sm opacity-80 mt-2 leading-relaxed max-w-xl">本條會先完整朗讀法條，再進入老師拆解；播放下一條前系統會先做快取預熱。</p>

          <button onClick={handleToggle} disabled={isPreparing} className={`mt-6 min-w-44 inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-black text-sm shadow-lg transition active:scale-[0.98] disabled:cursor-wait disabled:opacity-80 ${isPreparing?'bg-white/20 text-white':isPlaying?'bg-amber-300 text-slate-950 hover:bg-amber-200':'bg-white text-indigo-700 hover:bg-indigo-50'}`}>
            {isPreparing ? <><LoaderCircle size={17} className="animate-spin"/>正在準備…</> : isPlaying ? <><Pause size={17}/>暫停</> : isPaused ? <><Play size={17} className="fill-current"/>繼續播放</> : <><Play size={17} className="fill-current"/>開始聽課</>}
          </button>

          <div className="flex items-center gap-4 mt-5">
            <button onClick={() => jump(-1)} disabled={idx===0 || isPreparing} className="w-10 h-10 rounded-full bg-white/10 disabled:opacity-25 flex items-center justify-center hover:bg-white/15 transition"><SkipBack size={16}/></button>
            <div><div className="text-[10px] opacity-65">本輪進度</div><div className="text-sm font-black mt-0.5">{idx+1} / {queue.length} 條</div></div>
            <button onClick={() => jump(1)} disabled={idx===queue.length-1 || isPreparing} className="w-10 h-10 rounded-full bg-white/10 disabled:opacity-25 flex items-center justify-center hover:bg-white/15 transition"><SkipForward size={16}/></button>
          </div>
          <div className="w-full max-w-lg h-1.5 bg-white/10 rounded-full overflow-hidden mt-5"><div className="h-full rounded-full bg-emerald-300 transition-all duration-500" style={{ width: `${progressPct}%` }} /></div>
        </div>
      </section>

      <section className="grid sm:grid-cols-3 gap-3">
        <div className="card rounded-2xl p-4"><div className="text-[10px] text-tertiary">本輪任務</div><div className="text-base font-black mt-1 text-primary">{queue.length} 條 · 約 {minutes} 分</div></div>
        <div className="card rounded-2xl p-4"><div className="text-[10px] text-tertiary">自然聲線</div><div className="text-base font-black mt-1 text-primary">{voice.emoji} {voice.label}</div><div className="text-[10px] mt-1 text-tertiary">{settings.voiceEngine === 'edge-neural' ? 'Edge Neural' : settings.voiceEngine === 'auto' ? '智慧自動' : settings.voiceEngine} · {settings.voiceSpeed}x</div></div>
        <div className="card rounded-2xl p-4"><div className="text-[10px] flex items-center gap-1 text-tertiary"><Trophy size={11} className="text-amber-500"/>完成建議</div><div className="text-sm font-black mt-1 text-primary">聽完回閱讀頁標記理解</div></div>
      </section>

      {!settings.autoPlayNext && <div className="card rounded-2xl p-3 text-xs flex items-center gap-2 text-amber-700 dark:text-amber-300"><AlertCircle size={14}/>自動連播目前關閉；每條播完需手動下一條。</div>}

      <section key={`${lawId}-${minutes}`} className="card rounded-[1.4rem] p-4 md:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div><div className="text-sm font-black text-primary flex items-center gap-2"><Waves size={15} className="text-indigo-600"/>本輪播放清單</div><div className="text-[10px] mt-1 text-tertiary">已同步：{currentLaw?.name} · {minutes} 分鐘</div></div>
          <span className="text-[10px] font-black text-tertiary">共 {queue.length} 條</span>
        </div>
        <div className="space-y-1.5 max-h-80 overflow-auto mt-3 pr-1">
          {queue.map((article, index) => (
            <button key={`${lawId}-${article.articleNumber}`} onClick={() => {
              if (isPreparing) return;
              invalidatePlayback();
              idxRef.current = index;
              setIdx(index);
              setWarming(true);
              const session = sessionRef.current;
              void prefetchArticle(lawId, article).finally(() => { if (sessionRef.current === session) setWarming(false); });
            }} className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex justify-between items-center gap-3 transition border ${index===idx?'bg-indigo-600 border-indigo-600 text-white':'surface text-secondary hover:border-indigo-300'}`}>
              <span className="truncate"><b>第 {article.articleNumber} 條</b><span className={index===idx?'text-white/70':'text-tertiary'}> · {article.text.replace(/^第\s*[^條]+條\s*/, '').slice(0, 36)}…</span></span>
              {index===idx && isPlaying ? <Volume2 size={13} className="animate-pulse shrink-0"/> : index===idx ? <CheckCircle2 size={13} className="shrink-0"/> : null}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
