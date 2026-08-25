'use client';
import { Settings, Volume2, Type, Moon, Globe, LogOut, Check } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

export default function SettingsPage() {
  const { isLoaded, settings, updateSettings } = useSettings();

  if (!isLoaded) return <div className="p-10 text-center text-slate-400">載入中...</div>;

  const fontLabels = {
    'small': '小 (14px)',
    'medium': '適中 (16px)',
    'large': '大 (18px)'
  };

  const cycleFontSize = () => {
    if (settings.fontSize === 'small') updateSettings({ fontSize: 'medium' });
    else if (settings.fontSize === 'medium') updateSettings({ fontSize: 'large' });
    else updateSettings({ fontSize: 'small' });
  };

  const cycleVoiceSpeed = () => {
    if (settings.voiceSpeed === 1.0) updateSettings({ voiceSpeed: 1.25 });
    else if (settings.voiceSpeed === 1.25) updateSettings({ voiceSpeed: 1.5 });
    else if (settings.voiceSpeed === 1.5) updateSettings({ voiceSpeed: 0.75 });
    else updateSettings({ voiceSpeed: 1.0 });
  };

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-8 relative z-10">
      <header className="border-b border-slate-800 pb-6 flex items-center gap-4">
        <Settings size={32} className="text-slate-400" />
        <div>
          <h1 className="text-3xl font-bold text-white">設定</h1>
          <p className="text-slate-400">個人化您的學習體驗。</p>
        </div>
      </header>

      <div className="space-y-6">
        
        {/* 外觀設定 */}
        <section className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 bg-slate-800/50 border-b border-slate-800 text-sm font-semibold text-slate-400">外觀與閱讀</div>
          <div className="divide-y divide-slate-800">
            <div 
              onClick={() => updateSettings({ darkMode: !settings.darkMode })}
              className="p-5 flex items-center justify-between hover:bg-slate-800/20 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-4">
                <Moon size={24} className="text-slate-400" />
                <div>
                  <h3 className="text-white font-medium">深色模式</h3>
                  <p className="text-sm text-slate-500">{settings.darkMode ? '已開啟以保護眼睛' : '已關閉'}</p>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full relative transition-colors ${settings.darkMode ? 'bg-blue-600' : 'bg-slate-700'}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.darkMode ? 'right-1' : 'left-1'}`}></div>
              </div>
            </div>
            
            <div 
              onClick={cycleFontSize}
              className="p-5 flex items-center justify-between hover:bg-slate-800/20 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-4">
                <Type size={24} className="text-slate-400" />
                <div>
                  <h3 className="text-white font-medium">法條字體大小</h3>
                  <p className="text-sm text-slate-500">{fontLabels[settings.fontSize]}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 語音設定 */}
        <section className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 bg-slate-800/50 border-b border-slate-800 text-sm font-semibold text-slate-400">語音與 AI</div>
          <div className="divide-y divide-slate-800">
            <div 
              onClick={cycleVoiceSpeed}
              className="p-5 flex items-center justify-between hover:bg-slate-800/20 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-4">
                <Volume2 size={24} className="text-slate-400" />
                <div>
                  <h3 className="text-white font-medium">語音朗讀速度</h3>
                  <p className="text-sm text-slate-500">{settings.voiceSpeed}x</p>
                </div>
              </div>
            </div>
            <div className="p-5 flex items-center justify-between hover:bg-slate-800/20 cursor-pointer transition-colors">
              <div className="flex items-center gap-4">
                <Globe size={24} className="text-slate-400" />
                <div>
                  <h3 className="text-white font-medium">AI 解釋預設語言</h3>
                  <p className="text-sm text-slate-500">繁體中文</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pt-8">
          <button 
            onClick={() => {
              if(confirm('確定要清除所有學習進度與重點嗎？')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="w-full bg-rose-500/10 text-rose-500 border border-rose-500/20 font-bold text-lg py-4 rounded-xl flex justify-center items-center gap-2 hover:bg-rose-500/20 transition-colors"
          >
            <LogOut size={20} /> 清除所有本地資料
          </button>
        </section>
      </div>
    </div>
  );
}

