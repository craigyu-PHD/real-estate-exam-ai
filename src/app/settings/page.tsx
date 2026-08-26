'use client';
import { useEffect, useState } from 'react';
import { Settings, Volume2, Type, Moon, Play, Shield, Trash2, Check, Sparkles, WifiOff, Smartphone, SlidersHorizontal, KeyRound, ExternalLink, Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { useSettings, type VoiceEngine } from '@/hooks/useSettings';
import { AudioPlayer } from '@/components/AudioPlayer';
import { VOICE_PRESETS, type VoicePreset } from '@/lib/voiceConfig';
import { getStoredGeminiKey, maskGeminiKey, saveStoredGeminiKey } from '@/lib/geminiKey';

export default function SettingsPage() {
  const { isLoaded, settings, updateSettings } = useSettings();
  const [geminiKey, setGeminiKey] = useState('');
  const [savedKey, setSavedKey] = useState('');
  const [showKey, setShowKey] = useState(false);

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
    { id: 'gemini', label: 'Gemini 自然語音', desc: '使用 Gemini 2.5 Flash TTS，支援自然語氣與節奏控制。', icon: '🎙️' },
    { id: 'device-natural', label: '裝置自然語音', desc: '免費、免 API；自動挑選 Natural／Neural 中文聲線。', icon: '📱' },
    { id: 'web-speech', label: '系統相容語音', desc: '最穩定的離線備援，音質依裝置而異。', icon: '🛟' },
  ];

  const testText = '歡迎回來。今天不用一次記很多，我們先把這一條法規講懂，再往下一關前進。';
  const hasSavedKey = savedKey.length > 0;

  return (
    <div className="page-shell max-w-4xl space-y-5">
      <header className="page-header relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-indigo-500/[0.06] blur-3xl" />
        <div className="relative flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm"><Settings size={20}/></div>
          <div><div className="text-[10px] font-black tracking-[0.18em] text-indigo-600">PERSONAL SETUP</div><h1 className="text-2xl font-black mt-1 text-primary">學習與語音設定</h1><p className="text-sm mt-1 text-secondary">外觀、字級、自然語音與 Gemini 連線集中管理。</p></div>
        </div>
      </header>

      <section className="card rounded-[1.4rem] overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center gap-2" style={{borderColor:'var(--border)'}}><SlidersHorizontal size={16} className="text-indigo-600"/><span className="text-sm font-black text-primary">閱讀體驗</span></div>
        <div className="divide-y" style={{borderColor:'var(--border)'}}>
          <button onClick={() => updateSettings({darkMode: !settings.darkMode})} className="w-full p-5 flex items-center justify-between text-left hover:bg-indigo-500/[0.025] transition">
            <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl surface flex items-center justify-center text-secondary"><Moon size={18}/></div><div><div className="text-sm font-black text-primary">深色模式</div><div className="text-xs mt-0.5 text-tertiary">{settings.darkMode?'已開啟，適合夜間閱讀':'目前使用清爽明亮模式'}</div></div></div>
            <div className={`w-12 h-7 rounded-full relative transition ${settings.darkMode?'bg-indigo-600':'bg-slate-300'}`}><div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition shadow-sm ${settings.darkMode?'right-1':'left-1'}`}/></div>
          </button>
          <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl surface flex items-center justify-center text-secondary"><Type size={18}/></div><div><div className="text-sm font-black text-primary">閱讀字級</div><div className="text-xs mt-0.5 text-tertiary">法條、講解與題目同步調整</div></div></div>
            <div className="flex gap-1 rounded-full p-1 progress-track border" style={{borderColor:'var(--border)'}}>{(['small','medium','large'] as const).map(s=><button key={s} onClick={()=>updateSettings({fontSize:s})} className={`px-4 py-1.5 rounded-full text-xs font-black transition ${settings.fontSize===s?'bg-indigo-600 text-white':''} ${settings.fontSize!==s?'text-secondary':''}`}>{s==='small'?'小':s==='medium'?'中':'大'}</button>)}</div>
          </div>
          <label className="p-5 flex items-center justify-between gap-4 hover:bg-indigo-500/[0.025] cursor-pointer transition">
            <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl surface flex items-center justify-center text-secondary"><Play size={18}/></div><div><div className="text-sm font-black text-primary">聽課自動連播</div><div className="text-xs mt-0.5 text-tertiary">適合通勤、散步與免看螢幕學習</div></div></div>
            <input type="checkbox" checked={settings.autoPlayNext} onChange={e=>updateSettings({autoPlayNext:e.target.checked})} className="w-5 h-5 accent-indigo-600"/>
          </label>
        </div>
      </section>

      <section className="card rounded-[1.4rem] overflow-hidden">
        <div className="px-5 py-4 border-b flex flex-wrap items-center justify-between gap-3" style={{borderColor:'var(--border)'}}>
          <div className="flex items-center gap-2"><KeyRound size={16} className="text-amber-600"/><span className="text-sm font-black text-primary">Gemini 免費 API 連線</span></div>
          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${hasSavedKey?'status-complete':'status-planned'}`}>{hasSavedKey?'本機 Key 已設定':'尚未設定 Key'}</span>
        </div>
        <div className="p-5 space-y-4">
          <div className="rounded-2xl p-4 surface flex gap-3"><LockKeyhole size={18} className="text-indigo-600 shrink-0 mt-0.5"/><div><div className="text-xs font-black text-primary">只保存在這台瀏覽器</div><p className="text-[11px] leading-relaxed mt-1 text-secondary">金鑰不會寫進 GitHub。播放或詢問 AI 時，才透過 HTTPS 傳給本站後端轉送至 Gemini。若使用公用電腦，建議用完後清除。</p></div></div>
          <div>
            <label className="text-xs font-black text-secondary">Gemini API Key</label>
            <div className="relative mt-2">
              <input type={showKey?'text':'password'} value={geminiKey} onChange={e=>setGeminiKey(e.target.value)} placeholder="貼上 Google AI Studio 建立的免費 API Key" className="input-shell w-full rounded-xl px-4 py-3 pr-12 text-sm outline-none" autoComplete="off" spellCheck={false}/>
              <button onClick={()=>setShowKey(v=>!v)} className="absolute right-2 top-1/2 -translate-y-1/2 icon-button !w-8 !h-8 border-0" title={showKey?'隱藏':'顯示'}>{showKey?<EyeOff size={15}/>:<Eye size={15}/>}</button>
            </div>
            {hasSavedKey && <div className="mt-2 text-[10px] text-tertiary">目前已保存：{maskGeminiKey(savedKey)}</div>}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button onClick={()=>{saveStoredGeminiKey(geminiKey); setSavedKey(geminiKey.trim()); updateSettings({voiceEngine:'auto'});}} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 text-sm font-black transition">儲存並啟用 Gemini</button>
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="flex-1 surface rounded-xl py-3 px-4 text-sm font-black text-primary flex items-center justify-center gap-2 hover:border-indigo-300 transition">取得免費 Key <ExternalLink size={14}/></a>
          </div>
          <p className="text-[10px] leading-relaxed text-tertiary">Google 的 Gemini API 需要使用者自己的 Key 才能驗證請求。免費層可使用 Gemini 2.5 Flash Preview TTS；實際額度與政策以 Google 當下規則為準。</p>
        </div>
      </section>

      <section className="card rounded-[1.4rem] overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between gap-3" style={{borderColor:'var(--border)'}}><div className="flex items-center gap-2"><Volume2 size={16} className="text-violet-600"/><span className="text-sm font-black text-primary">自然語音</span></div><span className="text-[10px] font-black status-complete">免費備援</span></div>
        <div className="p-5 space-y-6">
          <div><div className="text-xs font-black mb-3 text-secondary">1. 語音來源</div><div className="grid md:grid-cols-2 gap-3">{engines.map(e=><button key={e.id} onClick={()=>updateSettings({voiceEngine:e.id})} className={`p-4 rounded-2xl text-left border card-hover ${settings.voiceEngine===e.id?'ring-2 ring-indigo-500/20':''}`} style={{background:settings.voiceEngine===e.id?'var(--primary-soft)':'var(--card)',borderColor:settings.voiceEngine===e.id?'color-mix(in srgb,var(--primary) 35%,var(--border))':'var(--border)'}}><div className="flex items-start gap-3"><span className="text-xl">{e.icon}</span><div className="flex-1"><div className="text-sm font-black text-primary">{e.label}</div><div className="text-xs mt-1 leading-relaxed text-tertiary">{e.desc}</div></div>{settings.voiceEngine===e.id&&<Check size={16} className="text-indigo-600"/>}</div></button>)}</div></div>
          <div><div className="text-xs font-black mb-3 text-secondary">2. 老師聲線</div><div className="grid sm:grid-cols-3 gap-3">{(Object.entries(VOICE_PRESETS) as [VoicePreset,(typeof VOICE_PRESETS)[VoicePreset]][]).map(([id,v])=><button key={id} onClick={()=>updateSettings({voicePreset:id})} className={`p-4 rounded-2xl text-left border card-hover ${settings.voicePreset===id?'ring-2 ring-violet-500/20':''}`} style={{background:settings.voicePreset===id?'color-mix(in srgb,var(--primary-soft) 60%,var(--card))':'var(--card)',borderColor:'var(--border)'}}><div className="text-2xl">{v.emoji}</div><div className="text-sm font-black mt-2 text-primary">{v.label}</div><div className="text-xs mt-1 leading-relaxed text-tertiary">{v.description}</div></button>)}</div></div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"><div><div className="text-sm font-black text-primary">3. 語速</div><div className="text-xs text-tertiary">初學建議 0.85～1.0x</div></div><div className="flex gap-1 rounded-full p-1 progress-track border" style={{borderColor:'var(--border)'}}>{[0.85,1,1.15,1.25].map(v=><button key={v} onClick={()=>updateSettings({voiceSpeed:v})} className={`px-3 py-1.5 rounded-full text-xs font-black ${settings.voiceSpeed===v?'bg-violet-600 text-white':'text-secondary'}`}>{v}x</button>)}</div></div>
          <div className="rounded-2xl p-4 surface"><div className="text-xs font-black mb-2 flex items-center gap-2 text-secondary"><Sparkles size={14} className="text-violet-600"/>即時試聽</div><AudioPlayer text={testText}/></div>
          <div className="grid sm:grid-cols-2 gap-3 text-xs"><div className="surface rounded-2xl p-4 flex gap-3"><Smartphone size={18} className="text-indigo-600 shrink-0"/><div className="text-secondary"><b className="text-primary">裝置自然備援</b><br/>Gemini 不可用時仍自動找最佳中文聲線。</div></div><div className="surface rounded-2xl p-4 flex gap-3"><WifiOff size={18} className="text-emerald-600 shrink-0"/><div className="text-secondary"><b className="text-primary">離線不中斷</b><br/>沒網路仍可用系統語音維持基本學習。</div></div></div>
        </div>
      </section>

      <section className="card rounded-[1.4rem] p-5">
        <div className="text-sm font-black flex items-center gap-2 text-primary"><Shield size={16} className="text-emerald-600"/>資料與防呆</div>
        <ul className="text-xs mt-3 space-y-2 text-secondary"><li>✓ 法條已讀可以取消。</li><li>✓ AI 音檔快取在 IndexedDB，減少重複生成。</li><li>✓ Gemini Key 只存在目前瀏覽器的 localStorage。</li></ul>
        <button onClick={()=>{if(confirm('確定要清除所有本機進度、標記、API Key 與設定？此動作無法復原。')){localStorage.clear();location.reload();}}} className="mt-4 w-full bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 text-rose-600 dark:text-rose-300 font-black py-3 rounded-xl flex justify-center items-center gap-2"><Trash2 size={16}/>清除所有本機資料</button>
      </section>
    </div>
  );
}
