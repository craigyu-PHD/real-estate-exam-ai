'use client';
import { Settings, Volume2, Type, Moon, Play, Shield, Trash2, Check, Sparkles, WifiOff, Smartphone, SlidersHorizontal } from 'lucide-react';
import { useSettings, type VoiceEngine } from '@/hooks/useSettings';
import { AudioPlayer } from '@/components/AudioPlayer';
import { VOICE_PRESETS, type VoicePreset } from '@/lib/voiceConfig';

export default function SettingsPage() {
  const { isLoaded, settings, updateSettings } = useSettings();
  if (!isLoaded) return <div className="p-10 text-center" style={{ color: 'var(--text-3)' }}>載入設定中…</div>;

  const engines: { id: VoiceEngine; label: string; desc: string; icon: string }[] = [
    { id: 'auto', label: '智慧自動（推薦）', desc: '優先 Gemini 自然語音，失敗自動切換裝置最佳中文聲線', icon: '✨' },
    { id: 'gemini', label: 'Gemini 自然語音', desc: '最自然；需要網站端設定 GEMINI_API_KEY', icon: '🎙️' },
    { id: 'device-natural', label: '裝置自然語音', desc: '免費、免 API；自動挑選裝置上的 Natural／Neural 中文聲線', icon: '📱' },
    { id: 'web-speech', label: '系統相容語音', desc: '最穩定的離線備援，音質依裝置而異', icon: '🛟' },
  ];

  const testText = '歡迎回來。今天不用一次記很多，我們先把這一條法規講懂，再往下一關前進。';

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 pb-28 md:pb-10">
      <header className="card rounded-[1.75rem] p-6 md:p-7 shadow-sm overflow-hidden relative">
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-indigo-500/10 blur-2xl" />
        <div className="relative flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm"><Settings size={22} /></div>
          <div>
            <div className="text-xs font-black tracking-[0.18em] text-indigo-600">PERSONAL LEARNING SETUP</div>
            <h1 className="text-2xl font-black mt-1" style={{ color: 'var(--text-1)' }}>學習與語音設定</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>先把閱讀與聽課調成舒服的節奏。設定目前以本機保存為主；雲端同步啟用後才會跨裝置同步。</p>
          </div>
        </div>
      </header>

      <section className="card rounded-[1.75rem] overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)', color: 'var(--text-1)' }}>
          <SlidersHorizontal size={16} className="text-indigo-600" />
          <span className="text-sm font-black">閱讀體驗</span>
        </div>
        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          <button onClick={() => updateSettings({ darkMode: !settings.darkMode })} className="w-full p-5 flex items-center justify-between text-left hover:bg-indigo-500/[0.03] transition">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--muted)', color: 'var(--text-2)' }}><Moon size={18} /></div>
              <div><div className="text-sm font-black" style={{ color: 'var(--text-1)' }}>深色模式</div><div className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{settings.darkMode ? '已開啟，適合夜間閱讀' : '目前使用明亮模式'}</div></div>
            </div>
            <div className={`w-12 h-7 rounded-full relative transition ${settings.darkMode ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}><div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition shadow-sm ${settings.darkMode ? 'right-1' : 'left-1'}`} /></div>
          </button>

          <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--muted)', color: 'var(--text-2)' }}><Type size={18} /></div>
              <div><div className="text-sm font-black" style={{ color: 'var(--text-1)' }}>閱讀字級</div><div className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>法條與講解會同步放大</div></div>
            </div>
            <div className="flex gap-1 rounded-full p-1" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
              {(['small','medium','large'] as const).map(s => (
                <button key={s} onClick={() => updateSettings({ fontSize: s })} className={`px-4 py-1.5 rounded-full text-xs font-black transition ${settings.fontSize===s?'bg-indigo-600 text-white shadow-sm':''}`} style={settings.fontSize!==s?{color:'var(--text-2)'}:undefined}>{s==='small'?'小':s==='medium'?'中':'大'}</button>
              ))}
            </div>
          </div>

          <label className="p-5 flex items-center justify-between gap-4 hover:bg-indigo-500/[0.03] cursor-pointer transition">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--muted)', color: 'var(--text-2)' }}><Play size={18} /></div>
              <div><div className="text-sm font-black" style={{ color: 'var(--text-1)' }}>聽課自動連播</div><div className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>通勤或散步時自動進入下一條</div></div>
            </div>
            <input type="checkbox" checked={settings.autoPlayNext} onChange={e => updateSettings({ autoPlayNext: e.target.checked })} className="w-5 h-5 accent-indigo-600" />
          </label>
        </div>
      </section>

      <section className="card rounded-[1.75rem] overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b flex items-center justify-between gap-3" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2 text-sm font-black" style={{ color: 'var(--text-1)' }}><Volume2 size={16} className="text-violet-600" /> 自然語音</div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">免費優先 · 自動備援</span>
        </div>
        <div className="p-5 space-y-6">
          <div>
            <div className="text-xs font-black mb-3" style={{ color: 'var(--text-2)' }}>1. 選擇語音來源</div>
            <div className="grid md:grid-cols-2 gap-3">
              {engines.map(e => (
                <button key={e.id} onClick={() => updateSettings({ voiceEngine: e.id })} className={`text-left p-4 rounded-2xl border transition card-hover ${settings.voiceEngine===e.id?'ring-2 ring-indigo-500/30 border-indigo-400':''}`} style={{ background: settings.voiceEngine===e.id ? 'color-mix(in srgb, var(--card) 90%, #6366f1 10%)' : 'var(--card)' }}>
                  <div className="flex items-start gap-3">
                    <span className="text-xl leading-none">{e.icon}</span>
                    <div className="flex-1"><div className="text-sm font-black" style={{ color: 'var(--text-1)' }}>{e.label}</div><div className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-3)' }}>{e.desc}</div></div>
                    {settings.voiceEngine===e.id && <Check size={16} className="text-indigo-600" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-black mb-3" style={{ color: 'var(--text-2)' }}>2. 選擇老師聲線</div>
            <div className="grid sm:grid-cols-3 gap-3">
              {(Object.entries(VOICE_PRESETS) as [VoicePreset, (typeof VOICE_PRESETS)[VoicePreset]][]).map(([id, v]) => (
                <button key={id} onClick={() => updateSettings({ voicePreset: id })} className={`p-4 rounded-2xl border text-left transition card-hover ${settings.voicePreset===id?'ring-2 ring-violet-500/30 border-violet-400':''}`} style={{ background: settings.voicePreset===id ? 'color-mix(in srgb, var(--card) 90%, #8b5cf6 10%)' : 'var(--card)' }}>
                  <div className="text-2xl">{v.emoji}</div>
                  <div className="text-sm font-black mt-2" style={{ color: 'var(--text-1)' }}>{v.label}</div>
                  <div className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-3)' }}>{v.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
            <div><div className="text-sm font-black" style={{ color: 'var(--text-1)' }}>3. 語速</div><div className="text-xs" style={{ color: 'var(--text-3)' }}>建議初學 0.9～1.0x，複習可提高到 1.25x</div></div>
            <div className="flex gap-1 rounded-full p-1" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
              {[0.85,1.0,1.15,1.25].map(v => (
                <button key={v} onClick={() => updateSettings({ voiceSpeed: v })} className={`px-3 py-1.5 rounded-full text-xs font-black transition ${settings.voiceSpeed===v?'bg-violet-600 text-white shadow-sm':''}`} style={settings.voiceSpeed!==v?{color:'var(--text-2)'}:undefined}>{v}x</button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-4 border" style={{ background: 'var(--muted)', borderColor: 'var(--border)' }}>
            <div className="text-xs font-black mb-2 flex items-center gap-2" style={{ color: 'var(--text-2)' }}><Sparkles size={14} className="text-violet-600" /> 即時試聽</div>
            <AudioPlayer text={testText} />
          </div>

          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-2xl p-4 border flex gap-3" style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}><Smartphone size={18} className="shrink-0 text-indigo-600"/><div><b style={{color:'var(--text-1)'}}>裝置備援</b><br/>Gemini 不可用時，自動挑選 Natural／Neural 中文聲線。</div></div>
            <div className="rounded-2xl p-4 border flex gap-3" style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}><WifiOff size={18} className="shrink-0 text-emerald-600"/><div><b style={{color:'var(--text-1)'}}>離線不中斷</b><br/>沒有網路仍可用 Web Speech，不把核心學習綁死在 API。</div></div>
          </div>
        </div>
      </section>

      <section className="card rounded-[1.75rem] p-5 shadow-sm">
        <div className="text-sm font-black flex items-center gap-2" style={{ color: 'var(--text-1)' }}><Shield size={16} className="text-emerald-600"/> 防呆與資料安全</div>
        <ul className="text-xs mt-3 space-y-2" style={{ color: 'var(--text-2)' }}>
          <li>✓ 法條已讀可以取消，不會因誤觸永久鎖住。</li>
          <li>✓ AI 音檔會快取在 IndexedDB，減少重複生成。</li>
          <li>✓ 清除本地資料前會再次確認。</li>
        </ul>
        <button onClick={() => { if(confirm('確定要清除所有學習進度、標記與設定？此動作無法復原。')) { localStorage.clear(); location.reload(); } }} className="mt-4 w-full bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 text-rose-600 dark:text-rose-300 font-black py-3 rounded-xl flex justify-center items-center gap-2 transition">
          <Trash2 size={16} /> 清除本機學習資料
        </button>
      </section>
    </div>
  );
}
