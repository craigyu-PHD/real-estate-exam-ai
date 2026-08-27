'use client';

import { AlertCircle, Bot, CheckCircle2, ChevronDown, Clock, LoaderCircle, Pause, Play, Route, SkipBack, SkipForward, Volume2, Waves } from 'lucide-react';
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
  const [sessionStart, setSessionStart] = useState(0);
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
  const queueLen = Math.min(Math.max(0, arts.length - sessionStart), Math.max(1, Math.round(minutes / 1.5)));
  const queue = useMemo(() => arts.slice(sessionStart, sessionStart + queueLen), [arts, sessionStart, queueLen]);
  const cur = queue[idx];
  const activeGlobalIndex = sessionStart + idx;
  const progressStops = useMemo(() => Array.from({ length: Math.max(1, Math.ceil(arts.length / 10)) }, (_, i) => i * 10), [arts.length]);
  const currentLaw = lawsData.find(law => law.id === lawId);
  const voice = VOICE_PRESETS[settings.voicePreset];
  const progressPct = arts.length ? Math.round(((activeGlobalIndex + 1) / arts.length) * 100) : 0;
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
        setStatus(nextIndex >= queueRef.current.length ? '本輪完成' : '本條播放完成');
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
    setSessionStart(0);
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

  const selectSessionStart = (nextStart: number) => {
    const safe = Math.max(0, Math.min(arts.length - 1, nextStart));
    invalidatePlayback();
    setWarming(false);
    setSessionStart(safe);
    setIdx(0);
    idxRef.current = 0;
  };

  return (
    <div className="page-shell max-w-6xl space-y-5 pb-28 md:pb-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-medium tracking-[0.1em] text-tertiary">LISTEN MODE</div>
          <h1 className="text-[28px] leading-tight font-bold mt-1 text-primary">AI 聽課模式</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-secondary">把法條原文、白話拆解、制度目的、案例與考點串成可連續播放的 Podcast 式課程。</p>
        </div>
        <div className="text-xs text-tertiary">{voice.label} · {settings.voiceSpeed}x · {settings.autoPlayNext ? '自動連播' : '手動切換'}</div>
      </header>

      <section className="card rounded-2xl p-4 grid md:grid-cols-[minmax(0,1.3fr)_minmax(180px,.65fr)_auto] gap-3 items-end">
        <label className="min-w-0">
          <span className="text-xs font-medium text-tertiary flex items-center gap-1.5"><Route size={13} strokeWidth={1.9}/>學習路線</span>
          <div className="relative mt-1.5">
            <select value={lawId} onChange={event => changeRoute(event.target.value)} className="input-shell appearance-none w-full rounded-lg px-3 py-2.5 pr-9 text-xs font-medium outline-none text-primary">
              {lawsData.map(law => <option key={law.id} value={law.id}>{law.name} · {generatedArticles[law.id]?.length || 0} 條</option>)}
            </select>
            <ChevronDown size={14} strokeWidth={1.9} className="absolute right-3 top-1/2 -translate-y-1/2 text-tertiary pointer-events-none"/>
          </div>
        </label>
        <label className="min-w-0">
          <span className="text-xs font-medium text-tertiary flex items-center gap-1.5"><Waves size={13} strokeWidth={1.9}/>進度起點</span>
          <div className="relative mt-1.5">
            <select value={sessionStart} onChange={event => selectSessionStart(Number(event.target.value))} className="input-shell appearance-none w-full rounded-lg px-3 py-2.5 pr-8 text-xs font-medium outline-none text-primary">
              {progressStops.map(start => <option key={start} value={start}>第 {start + 1} 條起 · {Math.min(start + 10, arts.length)}/{arts.length}</option>)}
            </select>
            <ChevronDown size={13} strokeWidth={1.9} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-tertiary pointer-events-none"/>
          </div>
        </label>
        <div>
          <span className="text-xs font-medium text-tertiary flex items-center gap-1.5"><Clock size={13} strokeWidth={1.9}/>本輪時間</span>
          <div className="flex gap-1.5 mt-1.5">
            {[5, 10, 20, 30].map(value => (
              <button key={value} type="button" aria-pressed={minutes === value} onClick={() => changeMinutes(value)} className={`min-h-10 px-3 rounded-lg border text-xs font-medium ${minutes === value ? 'text-white border-transparent' : 'text-secondary'}`} style={minutes === value ? { background: 'var(--primary)' } : { background: 'transparent', borderColor: 'var(--border)' }}>
                {value} 分
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid xl:grid-cols-[minmax(300px,.36fr)_minmax(0,.64fr)] gap-4 items-stretch">
        <aside className="card rounded-2xl overflow-hidden min-h-[460px] flex flex-col order-2 xl:order-1">
          <div className="px-4 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="text-xs font-medium tracking-[0.1em] text-tertiary">PLAYLIST</div>
            <div className="mt-1 flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-primary">{currentLaw?.name}</h2>
              <span className="text-xs text-tertiary">{arts.length} 條</span>
            </div>
            <div className="mt-1 text-xs text-tertiary">本輪從第 {sessionStart + 1} 條開始，共 {queue.length} 條</div>
          </div>
          <div className="flex-1 min-h-0 max-h-[560px] overflow-y-auto sidebar-scroll">
            {arts.map((article, index) => {
              const active = index === activeGlobalIndex;
              const inSession = index >= sessionStart && index < sessionStart + queue.length;
              return (
                <button
                  key={`${lawId}-${article.articleNumber}`}
                  type="button"
                  onClick={() => selectSessionStart(index)}
                  disabled={isPreparing}
                  className={`listen-playlist-row ${active ? 'listen-playlist-active' : ''}`}
                >
                  <span className="w-8 text-xs font-medium text-tertiary shrink-0">{String(index + 1).padStart(2, '0')}</span>
                  <span className="min-w-0 flex-1 text-left">
                    <span className="block text-sm font-medium text-primary">第 {article.articleNumber} 條</span>
                    <span className="block mt-0.5 text-xs text-tertiary truncate">{article.text.replace(/^第\s*[^條]+條\s*/, '').slice(0, 54)}</span>
                  </span>
                  {active && isPlaying ? <Volume2 size={14} strokeWidth={1.9} style={{ color: 'var(--primary)' }} className="shrink-0"/> : active ? <CheckCircle2 size={14} strokeWidth={1.9} style={{ color: 'var(--primary)' }} className="shrink-0"/> : inSession ? <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--primary)' }}/> : null}
                </button>
              );
            })}
          </div>
        </aside>

        <div className="card rounded-2xl min-h-[460px] p-5 md:p-7 flex flex-col order-1 xl:order-2 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'var(--primary)' }}/>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-medium tracking-[0.1em] text-tertiary">NOW PLAYING</div>
              <h2 className="text-xl font-semibold mt-2 text-primary">第 {cur.articleNumber} 條</h2>
              <div className="mt-1 text-xs text-tertiary">{currentLaw?.name} · {activeGlobalIndex + 1} / {arts.length}</div>
            </div>
            <div className="flex items-center gap-2 surface rounded-lg px-3 py-2">
              <Bot size={16} strokeWidth={1.9} style={{ color: 'var(--primary)' }}/>
              <div><div className="text-xs font-medium text-primary">AI 講師</div><div className="text-xs text-tertiary">{voice.label}</div></div>
            </div>
          </div>

          <div className="mt-6 flex-1">
            <div className="text-xs font-medium text-tertiary">法條原文</div>
            <p className="mt-2 font-serif text-base md:text-lg leading-8 text-primary whitespace-pre-wrap">{cur.text}</p>
          </div>

          <div className="mt-6 border-t pt-5" style={{ borderColor: 'var(--border)' }}>
            <div className="min-h-6 flex items-center gap-2 text-xs text-tertiary">
              {isPreparing ? <LoaderCircle size={14} strokeWidth={1.9} className="animate-spin shrink-0"/> : <Volume2 size={14} strokeWidth={1.9} className="shrink-0"/>}
              <span>{status || (warming ? '正在預先準備教材…' : '已準備好，開始後會依序播放原文與教學內容。')}</span>
            </div>

            <div className="mt-4 flex items-center justify-center gap-3">
              <button type="button" onClick={() => jump(-1)} disabled={idx === 0 || isPreparing} className="icon-button !w-10 !h-10 disabled:opacity-30" aria-label="上一條"><SkipBack size={16} strokeWidth={1.9}/></button>
              <button
                type="button"
                onClick={handleToggle}
                disabled={isPreparing}
                className="w-14 h-14 rounded-full text-white flex items-center justify-center disabled:opacity-60"
                style={{ background: 'var(--primary)' }}
                aria-label={isPlaying ? '暫停' : '播放'}
              >
                {isPreparing ? <LoaderCircle size={20} strokeWidth={1.9} className="animate-spin"/> : isPlaying ? <Pause size={20} strokeWidth={1.9}/> : <Play size={20} strokeWidth={1.9} className="ml-0.5"/>}
              </button>
              <button type="button" onClick={() => jump(1)} disabled={idx === queue.length - 1 || isPreparing} className="icon-button !w-10 !h-10 disabled:opacity-30" aria-label="下一條"><SkipForward size={16} strokeWidth={1.9}/></button>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between gap-3 text-xs text-tertiary"><span>全法進度 {progressPct}%</span><span>本輪 {idx + 1} / {queue.length}</span></div>
              <div className="mt-2 h-1.5 progress-track rounded-full overflow-hidden"><div className="h-full rounded-full progress-fill" style={{ width: `${progressPct}%`, background: 'var(--primary)' }}/></div>
            </div>

            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-tertiary">
              <span>本輪 {queue.length} 條</span>
              <span>{settings.voiceSpeed}x</span>
              <span>{settings.voiceEngine === 'edge-neural' ? 'Edge Neural' : settings.voiceEngine === 'auto' ? '智慧自動' : settings.voiceEngine}</span>
              <span>{isPaused ? '已暫停' : isPlaying ? '播放中' : '待播放'}</span>
            </div>
          </div>
        </div>
      </section>

      {!settings.autoPlayNext && (
        <div className="rounded-xl border p-3 text-sm flex items-center gap-2 text-secondary" style={{ borderColor: 'color-mix(in srgb,var(--warning) 35%,var(--border))', background: 'color-mix(in srgb,var(--warning) 5%,var(--card))' }}>
          <AlertCircle size={15} strokeWidth={1.9} style={{ color: 'var(--warning)' }}/> 自動連播目前關閉，每條播放完成後需手動切換下一條。
        </div>
      )}
    </div>
  );
}
