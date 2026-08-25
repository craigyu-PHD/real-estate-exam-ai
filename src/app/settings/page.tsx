'use client';
import { Settings, Volume2, Type, Moon, Sparkles, Play, Shield, Trash2, Check } from 'lucide-react';
import { useSettings, VoiceEngine } from '@/hooks/useSettings';
import { useState } from 'react';

export default function SettingsPage() {
  const { isLoaded, settings, updateSettings } = useSettings();
  const [testVoice, setTestVoice] = useState(false);
  if (!isLoaded) return <div className="p-10 text-center text-slate-400">載入中...</div>;

  const engines: { id: VoiceEngine; label: string; desc: string }[] = [
    { id: 'auto', label: '自動（推薦）', desc: 'Gemini → Edge → 系統語音，三級備援' },
    { id: 'gemini', label: 'Gemini 自然語音', desc: '最自然，需 GEMINI_API_KEY' },
    { id: 'edge', label: 'Edge 類神經語音', desc: '免費、擬真，zh-TW-HsiaoYu' },
    { id: 'web-speech', label: '系統語音（離線）', desc: '永遠可用，音質依裝置' },
  ];

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-6 relative z-10">
      <header className="border-b border-slate-800 pb-6">
        <h1 className="text-2xl font-black text-white flex items-center gap-2"><Settings size={22} /> 設定</h1>
        <p className="text-sm text-slate-400 mt-1">語音、閱讀與學習偏好，全部本地儲存、跨裝置可用。</p>
      </header>

      <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 bg-slate-800/50 border-b border-slate-800 text-xs font-bold tracking-widest text-slate-400">外觀與閱讀</div>
        <div className="divide-y divide-slate-800">
          <div onClick={() => updateSettings({ darkMode: !settings.darkMode })} className="p-4 flex items-center justify-between hover:bg-slate-800/40 cursor-pointer">
            <div className="flex items-center gap-3"><Moon size={18} className="text-slate-400" /><div><div className="text-sm font-bold text-white">深色模式</div><div className="text-xs text-slate-500">{settings.darkMode ? '已開啟' : '已關閉'}</div></div></div>
            <div className={`w-11 h-6 rounded-full relative transition ${settings.darkMode ? 'bg-blue-600' : 'bg-slate-700'}`}><div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition ${settings.darkMode ? 'right-1' : 'left-1'}`} /></div>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3"><Type size={18} className="text-slate-400" /><div><div className="text-sm font-bold text-white">字級</div><div className="text-xs text-slate-500">法條內文字體大小</div></div></div>
            <div className="flex gap-1 bg-slate-800 rounded-full p-1 border border-slate-700">
              {(['small','medium','large'] as const).map(s=> (
                <button key={s} onClick={()=>updateSettings({fontSize:s})} className={`px-3 py-1 rounded-full text-xs font-bold ${settings.fontSize===s?'bg-white text-slate-900':'text-slate-400'}`}>{s==='small'?'小':s==='medium'?'中':'大'}</button>
              ))}
            </div>
          </div>
          <label className="p-4 flex items-center justify-between hover:bg-slate-800/40 cursor-pointer">
            <div className="flex items-center gap-3"><Play size={18} className="text-slate-400" /><div><div className="text-sm font-bold text-white">聽課自動連播下一條</div><div className="text-xs text-slate-500">適合通勤連續聽</div></div></div>
            <input type="checkbox" checked={settings.autoPlayNext} onChange={e=>updateSettings({autoPlayNext:e.target.checked})} className="w-4 h-4" />
          </label>
        </div>
      </section>

      <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 bg-slate-800/50 border-b border-slate-800 text-xs font-bold tracking-widest text-slate-400 flex items-center gap-2"><Volume2 size={14} /> 語音設定</div>
        <div className="p-4 space-y-3">
          <div className="text-xs font-bold text-slate-300">語音引擎</div>
          <div className="grid gap-2">
            {engines.map(e=> (
              <button key={e.id} onClick={()=>updateSettings({voiceEngine:e.id})} className={`text-left p-3 rounded-xl border flex justify-between items-center ${settings.voiceEngine===e.id?'bg-blue-600 border-blue-500 text-white':'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'}`}>
                <div><div className="text-sm font-bold">{e.label}</div><div className="text-xs opacity-80">{e.desc}</div></div>
                {settings.voiceEngine===e.id && <Check size={16} />}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-bold text-white">語速</span>
            <div className="flex gap-1 bg-slate-800 rounded-full p-1 border border-slate-700">
              {[0.8,1.0,1.25,1.5].map(v=> (
                <button key={v} onClick={()=>updateSettings({voiceSpeed:v})} className={`px-3 py-1 rounded-full text-xs font-bold ${settings.voiceSpeed===v?'bg-white text-slate-900':'text-slate-400'}`}>{v}x</button>
              ))}
            </div>
          </div>
          <button onClick={()=>{setTestVoice(true); const u=new SpeechSynthesisUtterance('這是語音測試，現在語速為'+settings.voiceSpeed+'倍'); u.lang='zh-TW'; u.rate=settings.voiceSpeed; speechSynthesis.speak(u); setTimeout(()=>setTestVoice(false),1500);}} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-sm flex justify-center items-center gap-2">
            <Sparkles size={14} /> {testVoice?'播放中...':'試聽語音'}
          </button>
          <p className="text-xs text-slate-500">提示：Gemini/Edge 需伺服器設定對應的 API Key/URL，未設定會自動降級到系統語音，不影響學習。</p>
        </div>
      </section>

      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="text-sm font-bold text-white flex items-center gap-2"><Shield size={16} /> 防呆與安全</div>
        <ul className="text-xs text-slate-400 mt-2 list-disc list-inside space-y-1">
          <li>已讀可再按取消，避免誤觸</li>
          <li>清除資料需二次確認</li>
          <li>所有進度本地優先，支援離線</li>
        </ul>
        <button onClick={()=>{if(confirm('確定要清除所有學習進度、標記與設定？此動作無法復原。')){localStorage.clear(); location.reload();}}} className="mt-4 w-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 font-bold py-3 rounded-xl flex justify-center items-center gap-2">
          <Trash2 size={16} /> 清除所有本地資料
        </button>
      </section>
    </div>
  );
}
