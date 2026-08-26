'use client';

import { useEffect, useState } from 'react';
import { Settings, Volume2, Type, Moon, Sun, Monitor, Play, Shield, Trash2, Check, Sparkles, WifiOff, Smartphone, SlidersHorizontal, KeyRound, ExternalLink, Eye, EyeOff, LockKeyhole, Palette, Activity, Loader2, CircleCheck, CircleAlert } from 'lucide-react';
import { useSettings, type VoiceEngine } from '@/hooks/useSettings';
import { AudioPlayer } from '@/components/AudioPlayer';
import { VOICE_PRESETS, type VoicePreset } from '@/lib/voiceConfig';
import { getStoredGeminiKey, maskGeminiKey, saveStoredGeminiKey } from '@/lib/geminiKey';
import { THEMES, type Appearance, type ThemeId } from '@/lib/themeConfig';

type TestState = { state: 'idle' | 'testing' | 'ok' | 'error'; message: string };

export default function SettingsPage() {
  const { isLoaded, settings, updateSettings } = useSettings();
  const [geminiKey, setGeminiKey] = useState('');
  const [savedKey, setSavedKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [testState, setTestState] = useState<TestState>({ state: 'idle', message: '' });

  useEffect(() => {
    queueMicrotask(() => {
      const key = getStoredGeminiKey();
      setGeminiKey(key);
      setSavedKey(key);
    });
  }, []);

  if (!isLoaded) return <div className="p-10 text-center text-tertiary">載入設定中…</div>;

  const engines: { id: VoiceEngine; label: string; desc: string; icon: string }[] = [
    { id: 'auto', label: '智慧自動（推薦）', desc: '有 Gemini Key 時優先自然 AI 語音，否則使用裝置最佳中文聲線。', icon: '✨' },
    { id: 'gemini', label: 'Gemini 自然語音', desc: '使用 Gemini 2.5 Flash TTS；失敗時仍保留裝置語音備援。', icon: '🎙️' },
    { id: 'device-natural', label: '裝置自然語音', desc: '免費、免 API；自動挑選 Natural／Neural 中文聲線。', icon: '📱' },
    { id: 'web-speech', label: '系統相容語音', desc: '離線保底方案，音質依裝置與瀏覽器而異。', icon: '🛟' },
  ];
  const appearances: { id: Appearance; label: string; desc: string; icon: typeof Sun }[] = [
    { id: 'system', label: '跟隨系統', desc: '跟著 macOS / Windows / 手機自動切換', icon: Monitor },
    { id: 'light', label: '淺色', desc: '明亮、高對比，適合白天閱讀', icon: Sun },
    { id: 'dark', label: '深色', desc: '低亮度，適合夜間與長時間使用', icon: Moon },
  ];
  const testText = '歡迎回來。先聽一次法條原文，再用白話拆解、案例和考點，把這一關真正弄懂。';
  const hasSavedKey = savedKey.length > 0;

  const saveAndTest = async () => {
    const key = geminiKey.trim();
    saveStoredGeminiKey(key);
    setSavedKey(key);
    updateSettings({ voiceEngine: 'auto' });
    setTestState({ state: 'testing', message: '正在驗證 Gemini 模型與權限…' });
    try {
      const res = await fetch('/api/gemini/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ apiKey: key || undefined }) });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || '驗證失敗');
      const capabilities = [data.textModel ? 'AI 老師 ✓' : 'AI 老師未偵測', data.ttsModel ? '自然語音 ✓' : 'TTS 未偵測'].join(' · ');
      setTestState({ state: 'ok', message: `連線成功：${capabilities}` });
    } catch (error) {
      setTestState({ state: 'error', message: error instanceof Error ? error.message : 'Gemini 連線測試失敗' });
    }
  };

  return (
    <div className="page-shell max-w-5xl space-y-5">
      <header className="page-header relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-indigo-500/[0.06] blur-3xl" />
        <div className="relative flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm"><Settings size={20}/></div>
          <div><div className="text-[10px] font-black tracking-[0.18em] text-indigo-600">PERSONAL SETUP</div><h1 className="text-2xl font-black mt-1 text-primary">外觀、主題與 AI 設定</h1><p className="text-sm mt-1 text-secondary">Appearance 與 Theme 分開控制：任何主題都能搭配淺色、深色或跟隨系統。</p></div>
        </div>
      </header>

      <section className="card rounded-[1.4rem] overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center gap-2" style={{borderColor:'var(--border)'}}><Palette size={16} className="text-indigo-600"/><span className="text-sm font-black text-primary">外觀與主題</span></div>
        <div className="p-5 space-y-6">
          <div>
            <div className="text-xs font-black text-secondary mb-3">1. 顯示模式</div>
            <div className="grid sm:grid-cols-3 gap-2">{appearances.map(item => <button key={item.id} onClick={() => updateSettings({ appearance: item.id })} className={`rounded-2xl border p-4 text-left card-hover ${settings.appearance===item.id?'ring-2 ring-indigo-500/20':''}`} style={{background:settings.appearance===item.id?'var(--primary-soft)':'var(--card)',borderColor:settings.appearance===item.id?'color-mix(in srgb,var(--primary) 40%,var(--border))':'var(--border)'}}><div className="flex items-center gap-2"><item.icon size={17} className="text-indigo-600"/><span className="text-sm font-black text-primary">{item.label}</span>{settings.appearance===item.id&&<Check size={14} className="ml-auto text-indigo-600"/>}</div><p className="text-[10px] mt-2 leading-relaxed text-tertiary">{item.desc}</p></button>)}</div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3 mb-3"><div><div className="text-xs font-black text-secondary">2. Theme Pack</div><p className="text-[10px] mt-1 text-tertiary">五套皆為原創視覺語彙，不使用受版權保護的角色圖像或名稱。</p></div><span className="text-[9px] font-black status-current">{THEMES[settings.theme].label}</span></div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{(Object.entries(THEMES) as [ThemeId,(typeof THEMES)[ThemeId]][]).map(([id,theme]) => <button key={id} onClick={() => updateSettings({ theme: id })} className={`theme-preview theme-preview-${id} rounded-2xl border p-4 text-left card-hover overflow-hidden relative ${settings.theme===id?'ring-2 ring-indigo-500/25':''}`} style={{borderColor:settings.theme===id?'var(--primary)':'var(--border)'}}><div className="absolute inset-0 theme-preview-bg pointer-events-none"/><div className="relative"><div className="flex items-center gap-2"><span className="text-xl">{theme.emoji}</span><div><div className="text-sm font-black text-primary">{theme.label}</div><div className="text-[9px] font-black text-tertiary">{theme.subtitle}</div></div>{settings.theme===id&&<CircleCheck size={15} className="ml-auto text-indigo-600"/>}</div><p className="text-[10px] leading-relaxed mt-3 text-secondary">{theme.description}</p><div className="text-[9px] font-bold mt-3 text-tertiary">{theme.vibe}</div></div></button>)}</div>
          </div>

          <button onClick={() => updateSettings({ enhancedMotion: !settings.enhancedMotion })} className="surface rounded-2xl p-4 w-full text-left flex items-center justify-between gap-4">
            <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 flex items-center justify-center"><Activity size={18}/></div><div><div className="text-sm font-black text-primary">主題動態效果</div><div className="text-[10px] mt-1 text-tertiary">游標、點擊特效、卡片 hover 與換頁掃光；系統「減少動態效果」仍優先。</div></div></div>
            <div className={`w-12 h-7 rounded-full relative transition ${settings.enhancedMotion?'bg-indigo-600':'bg-slate-300 dark:bg-slate-700'}`}><div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition shadow-sm ${settings.enhancedMotion?'right-1':'left-1'}`}/></div>
          </button>
        </div>
      </section>

      <section className="card rounded-[1.4rem] overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center gap-2" style={{borderColor:'var(--border)'}}><SlidersHorizontal size={16} className="text-indigo-600"/><span className="text-sm font-black text-primary">閱讀體驗</span></div>
        <div className="divide-y" style={{borderColor:'var(--border)'}}>
          <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl surface flex items-center justify-center text-secondary"><Type size={18}/></div><div><div className="text-sm font-black text-primary">閱讀字級</div><div className="text-xs mt-0.5 text-tertiary">法條、講解與題目同步調整</div></div></div><div className="flex gap-1 rounded-full p-1 progress-track border" style={{borderColor:'var(--border)'}}>{(['small','medium','large'] as const).map(size=><button key={size} onClick={()=>updateSettings({fontSize:size})} className={`px-4 py-1.5 rounded-full text-xs font-black transition ${settings.fontSize===size?'bg-indigo-600 text-white':'text-secondary'}`}>{size==='small'?'小':size==='medium'?'中':'大'}</button>)}</div></div>
          <label className="p-5 flex items-center justify-between gap-4 hover:bg-indigo-500/[0.025] cursor-pointer transition"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl surface flex items-center justify-center text-secondary"><Play size={18}/></div><div><div className="text-sm font-black text-primary">聽課自動連播</div><div className="text-xs mt-0.5 text-tertiary">Mini Lecture 播放完成後自動進下一條</div></div></div><input type="checkbox" checked={settings.autoPlayNext} onChange={e=>updateSettings({autoPlayNext:e.target.checked})} className="w-5 h-5 accent-indigo-600"/></label>
        </div>
      </section>

      <section className="card rounded-[1.4rem] overflow-hidden">
        <div className="px-5 py-4 border-b flex flex-wrap items-center justify-between gap-3" style={{borderColor:'var(--border)'}}><div className="flex items-center gap-2"><KeyRound size={16} className="text-amber-600"/><span className="text-sm font-black text-primary">Gemini API 連線</span></div><span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${hasSavedKey?'status-complete':'status-planned'}`}>{hasSavedKey?'本機 BYOK 已設定':'尚未設定 Key'}</span></div>
        <div className="p-5 space-y-4">
          <div className="rounded-2xl p-4 surface flex gap-3"><LockKeyhole size={18} className="text-indigo-600 shrink-0 mt-0.5"/><div><div className="text-xs font-black text-primary">私人裝置 BYOK 模式</div><p className="text-[11px] leading-relaxed mt-1 text-secondary">Key 只存在目前瀏覽器 localStorage，請求經本站後端代理至 Gemini，不寫入 GitHub。正式多人服務仍建議改用 Vercel server-side secret。</p></div></div>
          <div><label className="text-xs font-black text-secondary">Gemini API Key</label><div className="relative mt-2"><input type={showKey?'text':'password'} value={geminiKey} onChange={e=>{setGeminiKey(e.target.value);setTestState({state:'idle',message:''});}} placeholder="貼上 Google AI Studio 的 API Key" className="input-shell w-full rounded-xl px-4 py-3 pr-12 text-sm outline-none" autoComplete="off" spellCheck={false}/><button onClick={()=>setShowKey(v=>!v)} className="absolute right-2 top-1/2 -translate-y-1/2 icon-button !w-8 !h-8 border-0" title={showKey?'隱藏':'顯示'}>{showKey?<EyeOff size={15}/>:<Eye size={15}/>}</button></div>{hasSavedKey&&<div className="mt-2 text-[10px] text-tertiary">已保存：{maskGeminiKey(savedKey)}</div>}</div>
          <div className="flex flex-col sm:flex-row gap-2"><button onClick={()=>void saveAndTest()} disabled={testState.state==='testing'} className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl py-3 text-sm font-black transition flex items-center justify-center gap-2">{testState.state==='testing'?<Loader2 size={15} className="animate-spin"/>:<KeyRound size={14}/>}儲存並測試連線</button><a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="flex-1 surface rounded-xl py-3 px-4 text-sm font-black text-primary flex items-center justify-center gap-2 hover:border-indigo-300 transition">Google AI Studio <ExternalLink size={14}/></a></div>
          {testState.state!=='idle'&&<div className={`rounded-xl p-3 text-xs font-bold flex items-start gap-2 ${testState.state==='ok'?'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300':testState.state==='error'?'bg-rose-500/10 text-rose-700 dark:text-rose-300':'surface text-secondary'}`}>{testState.state==='testing'?<Loader2 size={14} className="animate-spin shrink-0"/>:testState.state==='ok'?<CircleCheck size={14} className="shrink-0"/>:<CircleAlert size={14} className="shrink-0"/>}<span>{testState.message}</span></div>}
        </div>
      </section>

      <section className="card rounded-[1.4rem] overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between gap-3" style={{borderColor:'var(--border)'}}><div className="flex items-center gap-2"><Volume2 size={16} className="text-violet-600"/><span className="text-sm font-black text-primary">自然語音</span></div><span className="text-[10px] font-black status-complete">Mini Lecture ready</span></div>
        <div className="p-5 space-y-6">
          <div><div className="text-xs font-black mb-3 text-secondary">1. 語音來源</div><div className="grid md:grid-cols-2 gap-3">{engines.map(engine=><button key={engine.id} onClick={()=>updateSettings({voiceEngine:engine.id})} className={`p-4 rounded-2xl text-left border card-hover ${settings.voiceEngine===engine.id?'ring-2 ring-indigo-500/20':''}`} style={{background:settings.voiceEngine===engine.id?'var(--primary-soft)':'var(--card)',borderColor:settings.voiceEngine===engine.id?'color-mix(in srgb,var(--primary) 35%,var(--border))':'var(--border)'}}><div className="flex items-start gap-3"><span className="text-xl">{engine.icon}</span><div className="flex-1"><div className="text-sm font-black text-primary">{engine.label}</div><div className="text-xs mt-1 leading-relaxed text-tertiary">{engine.desc}</div></div>{settings.voiceEngine===engine.id&&<Check size={16} className="text-indigo-600"/>}</div></button>)}</div></div>
          <div><div className="text-xs font-black mb-3 text-secondary">2. 老師聲線</div><div className="grid sm:grid-cols-3 gap-3">{(Object.entries(VOICE_PRESETS) as [VoicePreset,(typeof VOICE_PRESETS)[VoicePreset]][]).map(([id,voice])=><button key={id} onClick={()=>updateSettings({voicePreset:id})} className={`p-4 rounded-2xl text-left border card-hover ${settings.voicePreset===id?'ring-2 ring-violet-500/20':''}`} style={{background:settings.voicePreset===id?'color-mix(in srgb,var(--primary-soft) 60%,var(--card))':'var(--card)',borderColor:'var(--border)'}}><div className="text-2xl">{voice.emoji}</div><div className="text-sm font-black mt-2 text-primary">{voice.label}</div><div className="text-xs mt-1 leading-relaxed text-tertiary">{voice.description}</div></button>)}</div></div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"><div><div className="text-sm font-black text-primary">3. 語速</div><div className="text-xs text-tertiary">初學建議 0.85～1.0x</div></div><div className="flex gap-1 rounded-full p-1 progress-track border" style={{borderColor:'var(--border)'}}>{[0.85,1,1.15,1.25].map(speed=><button key={speed} onClick={()=>updateSettings({voiceSpeed:speed})} className={`px-3 py-1.5 rounded-full text-xs font-black ${settings.voiceSpeed===speed?'bg-violet-600 text-white':'text-secondary'}`}>{speed}x</button>)}</div></div>
          <div className="rounded-2xl p-4 surface"><div className="text-xs font-black mb-2 flex items-center gap-2 text-secondary"><Sparkles size={14} className="text-violet-600"/>即時試聽</div><AudioPlayer text={testText}/></div>
          <div className="grid sm:grid-cols-2 gap-3 text-xs"><div className="surface rounded-2xl p-4 flex gap-3"><Smartphone size={18} className="text-indigo-600 shrink-0"/><div className="text-secondary"><b className="text-primary">裝置自然備援</b><br/>Gemini 不可用時仍自動找最佳中文聲線。</div></div><div className="surface rounded-2xl p-4 flex gap-3"><WifiOff size={18} className="text-emerald-600 shrink-0"/><div className="text-secondary"><b className="text-primary">離線不中斷</b><br/>沒網路仍可用系統語音維持基本學習。</div></div></div>
        </div>
      </section>

      <section className="card rounded-[1.4rem] p-5">
        <div className="text-sm font-black flex items-center gap-2 text-primary"><Shield size={16} className="text-emerald-600"/>資料與防呆</div><ul className="text-xs mt-3 space-y-2 text-secondary"><li>✓ 2,399 條教材為預先生成資料，AI Drawer 僅用於追問或修正建議。</li><li>✓ AI 音檔快取在 IndexedDB，減少重複生成。</li><li>✓ Appearance、Theme 與語音設定都保存在本機。</li></ul><button onClick={()=>{if(confirm('確定要清除所有本機進度、標記、API Key 與設定？此動作無法復原。')){localStorage.clear();location.reload();}}} className="mt-4 w-full bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 text-rose-600 dark:text-rose-300 font-black py-3 rounded-xl flex justify-center items-center gap-2"><Trash2 size={16}/>清除所有本機資料</button>
      </section>
    </div>
  );
}
