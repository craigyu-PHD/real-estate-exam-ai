'use client';

import { useEffect, useState } from 'react';
import { Settings, Volume2, Type, Moon, Sun, Monitor, Play, Shield, Trash2, Check, Sparkles, WifiOff, Smartphone, SlidersHorizontal, KeyRound, ExternalLink, Eye, EyeOff, LockKeyhole, Palette, Activity, Loader2, CircleCheck, CircleAlert } from 'lucide-react';
import { useSettings, type VoiceEngine } from '@/hooks/useSettings';
import { AudioPlayer } from '@/components/AudioPlayer';
import { VOICE_PRESETS, type VoicePreset } from '@/lib/voiceConfig';
import { getStoredAiKeys, maskApiKey, saveStoredAiKey, type AiProvider, type StoredAiKeys } from '@/lib/aiKeys';
import { THEMES, type Appearance, type ThemeId } from '@/lib/themeConfig';

type TestState = { provider: AiProvider | 'edge' | null; state: 'idle' | 'testing' | 'ok' | 'error'; message: string };

export default function SettingsPage() {
  const { isLoaded, settings, updateSettings } = useSettings();
  const emptyKeys: StoredAiKeys = { gemini: '', groq: '', mistral: '', openrouter: '', huggingface: '' };
  const [apiKeys, setApiKeys] = useState<StoredAiKeys>(emptyKeys);
  const [savedKeys, setSavedKeys] = useState<StoredAiKeys>(emptyKeys);
  const [showProvider, setShowProvider] = useState<AiProvider | null>(null);
  const [testState, setTestState] = useState<TestState>({ provider: null, state: 'idle', message: '' });

  useEffect(() => {
    queueMicrotask(() => {
      const keys = getStoredAiKeys();
      setApiKeys(keys);
      setSavedKeys(keys);
    });
  }, []);

  if (!isLoaded) return <div className="p-10 text-center text-tertiary">載入設定中…</div>;

  const engines: { id: VoiceEngine; label: string; desc: string; icon: string }[] = [
    { id: 'auto', label: '智慧自動（推薦）', desc: 'Gemini 可用就先用 Gemini；否則自動切到免 Key 的台灣 Edge Neural，再退到裝置語音。', icon: '✨' },
    { id: 'edge-neural', label: 'Edge Neural（免 Key）', desc: '直接使用 Microsoft 台灣 Natural／Neural 聲線，不需要 API Key，適合當穩定主力。', icon: '🌐' },
    { id: 'gemini', label: 'Gemini 優先', desc: '有 Gemini Key 時先用 Gemini TTS；失敗會自動切換 Edge Neural。', icon: '🎙️' },
    { id: 'device-natural', label: '裝置自然語音', desc: '不走伺服器，直接挑選目前裝置最佳中文 Natural／Neural 聲線。', icon: '📱' },
    { id: 'web-speech', label: '系統相容語音', desc: '離線保底方案，音質依裝置與瀏覽器而異。', icon: '🛟' },
  ];
  const appearances: { id: Appearance; label: string; desc: string; icon: typeof Sun }[] = [
    { id: 'system', label: '跟隨系統', desc: '跟著 macOS / Windows / 手機自動切換', icon: Monitor },
    { id: 'light', label: '淺色', desc: '明亮、高對比，適合白天閱讀', icon: Sun },
    { id: 'dark', label: '深色', desc: '低亮度，適合夜間與長時間使用', icon: Moon },
  ];
  const testText = '歡迎回來。先聽一次法條原文，再用白話拆解、案例和考點，把這一關真正弄懂。';
  const testProvider = async (provider: AiProvider | 'edge') => {
    const key = provider === 'edge' ? '' : apiKeys[provider].trim();
    if (provider !== 'edge') {
      saveStoredAiKey(provider, key);
      setSavedKeys(prev => ({ ...prev, [provider]: key }));
    }
    setTestState({ provider, state: 'testing', message: `正在測試 ${provider === 'edge' ? 'Edge Neural' : provider}…` });
    try {
      const res = await fetch('/api/ai/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider, apiKey: key || undefined }) });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || '驗證失敗');
      const detail = provider === 'gemini' ? `文字 ${data.text ? '✓' : '—'} · TTS ${data.tts ? '✓' : '—'}` : provider === 'edge' ? `${data.voice} · ${data.bytes} bytes` : `${data.model || 'API'} ✓`;
      setTestState({ provider, state: 'ok', message: `連線成功：${detail}` });
      if (provider === 'edge') updateSettings({ voiceEngine: 'edge-neural' });
    } catch (error) {
      setTestState({ provider, state: 'error', message: error instanceof Error ? error.message : '連線測試失敗' });
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
        <div className="px-5 py-4 border-b flex flex-wrap items-center justify-between gap-3" style={{borderColor:'var(--border)'}}>
          <div className="flex items-center gap-2"><KeyRound size={16} className="text-amber-600"/><span className="text-sm font-black text-primary">免費 AI API 備援</span></div>
          <span className="text-[10px] font-black status-current">5 路 AI + Local Tutor</span>
        </div>
        <div className="p-5 space-y-4">
          <div className="rounded-2xl p-4 surface flex gap-3"><LockKeyhole size={18} className="text-indigo-600 shrink-0 mt-0.5"/><div><div className="text-xs font-black text-primary">五路 BYOK + Local Tutor 永不中斷</div><p className="text-[11px] leading-relaxed mt-1 text-secondary">AI 老師依序嘗試 Gemini、Groq、Mistral、OpenRouter、Hugging Face；全部無 Key 或暫時失敗時，會立即改用本條預生成教材回答，不再整頁失效。Key 只存在目前瀏覽器；語音另有免 Key Edge Neural。</p></div></div>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
            {([
              {id:'gemini' as AiProvider,label:'Gemini Free',desc:'主力：AI 老師＋Gemini TTS',placeholder:'Google AI Studio API Key',href:'https://aistudio.google.com/apikey'},
              {id:'groq' as AiProvider,label:'Groq Free',desc:'高速文字 AI · Free Plan',placeholder:'Groq API Key',href:'https://console.groq.com/keys'},
              {id:'mistral' as AiProvider,label:'Mistral Free',desc:'Free mode · 無需信用卡',placeholder:'Mistral API Key',href:'https://console.mistral.ai/api-keys'},
              {id:'openrouter' as AiProvider,label:'OpenRouter Free',desc:'免費模型自動路由',placeholder:'OpenRouter API Key',href:'https://openrouter.ai/settings/keys'},
              {id:'huggingface' as AiProvider,label:'Hugging Face',desc:'Inference Providers 免費額度',placeholder:'HF Access Token',href:'https://huggingface.co/settings/tokens'},
            ]).map(provider => <div key={provider.id} className="surface rounded-2xl p-4">
              <div className="flex items-start justify-between gap-2"><div><div className="text-sm font-black text-primary">{provider.label}</div><div className="text-[10px] mt-1 text-tertiary">{provider.desc}</div></div><span className={`text-[9px] font-black ${savedKeys[provider.id]?'text-emerald-600':'text-tertiary'}`}>{savedKeys[provider.id]?'已保存':'未設定'}</span></div>
              <div className="relative mt-3"><input type={showProvider===provider.id?'text':'password'} value={apiKeys[provider.id]} onChange={e=>{setApiKeys(prev=>({...prev,[provider.id]:e.target.value}));setTestState({provider:null,state:'idle',message:''});}} placeholder={provider.placeholder} className="input-shell w-full rounded-xl px-3 py-2.5 pr-10 text-xs outline-none" autoComplete="off" spellCheck={false}/><button onClick={()=>setShowProvider(showProvider===provider.id?null:provider.id)} className="absolute right-1.5 top-1/2 -translate-y-1/2 icon-button !w-7 !h-7 border-0">{showProvider===provider.id?<EyeOff size={13}/>:<Eye size={13}/>}</button></div>
              {savedKeys[provider.id]&&<div className="mt-1.5 text-[9px] text-tertiary">{maskApiKey(savedKeys[provider.id])}</div>}
              <div className="grid grid-cols-2 gap-2 mt-3"><button onClick={()=>void testProvider(provider.id)} disabled={testState.state==='testing'} className="bg-indigo-600 text-white rounded-xl py-2.5 text-[10px] font-black disabled:opacity-50">{testState.provider===provider.id&&testState.state==='testing'?'測試中…':'儲存＋測試'}</button><a href={provider.href} target="_blank" rel="noreferrer" className="rounded-xl py-2.5 text-[10px] font-black surface text-primary flex items-center justify-center gap-1">取得 Key <ExternalLink size={11}/></a></div>
            </div>)}
          </div>
          <div className="rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center gap-3" style={{borderColor:'var(--border)',background:'color-mix(in srgb,var(--primary-soft) 55%,var(--card))'}}><div className="w-10 h-10 rounded-xl bg-emerald-500/12 text-emerald-600 flex items-center justify-center">🌐</div><div className="flex-1"><div className="text-sm font-black text-primary">Edge Neural · 免 API Key</div><div className="text-[10px] mt-1 text-secondary">台灣 Natural 聲線 HsiaoChen／YunJhe／HsiaoYu 已直接接到 server TTS，可當 Gemini TTS 的免費備援。</div></div><button onClick={()=>void testProvider('edge')} disabled={testState.state==='testing'} className="surface rounded-xl px-4 py-2.5 text-[10px] font-black text-primary disabled:opacity-50">測試語音連線</button></div>
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
          <div className="grid sm:grid-cols-2 gap-3 text-xs"><div className="surface rounded-2xl p-4 flex gap-3"><Smartphone size={18} className="text-indigo-600 shrink-0"/><div className="text-secondary"><b className="text-primary">裝置自然備援</b><br/>伺服器語音不可用時，再自動找目前裝置最佳中文聲線。</div></div><div className="surface rounded-2xl p-4 flex gap-3"><WifiOff size={18} className="text-emerald-600 shrink-0"/><div className="text-secondary"><b className="text-primary">離線不中斷</b><br/>沒網路仍可用系統語音維持基本學習。</div></div></div>
        </div>
      </section>

      <section className="card rounded-[1.4rem] p-5">
        <div className="text-sm font-black flex items-center gap-2 text-primary"><Shield size={16} className="text-emerald-600"/>資料與防呆</div><ul className="text-xs mt-3 space-y-2 text-secondary"><li>✓ 2,399 條教材為預先生成資料，AI Drawer 僅用於追問或修正建議。</li><li>✓ AI 音檔快取在 IndexedDB，減少重複生成。</li><li>✓ Appearance、Theme、語音設定與 5 路 BYOK API Keys 都只保存在本機。</li></ul><button onClick={()=>{if(confirm('確定要清除所有本機進度、標記、API Key 與設定？此動作無法復原。')){localStorage.clear();location.reload();}}} className="mt-4 w-full bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 text-rose-600 dark:text-rose-300 font-black py-3 rounded-xl flex justify-center items-center gap-2"><Trash2 size={16}/>清除所有本機資料</button>
      </section>
    </div>
  );
}
