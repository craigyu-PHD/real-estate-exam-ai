import { Settings, Volume2, Type, Moon, Globe, LogOut } from 'lucide-react';

export default function SettingsPage() {
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
            <div className="p-5 flex items-center justify-between hover:bg-slate-800/20 cursor-pointer">
              <div className="flex items-center gap-4">
                <Moon size={24} className="text-slate-400" />
                <div>
                  <h3 className="text-white font-medium">深色模式</h3>
                  <p className="text-sm text-slate-500">預設開啟以保護眼睛</p>
                </div>
              </div>
              <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
              </div>
            </div>
            
            <div className="p-5 flex items-center justify-between hover:bg-slate-800/20 cursor-pointer">
              <div className="flex items-center gap-4">
                <Type size={24} className="text-slate-400" />
                <div>
                  <h3 className="text-white font-medium">法條字體大小</h3>
                  <p className="text-sm text-slate-500">適中 (16px)</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 語音設定 */}
        <section className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 bg-slate-800/50 border-b border-slate-800 text-sm font-semibold text-slate-400">語音與 AI</div>
          <div className="divide-y divide-slate-800">
            <div className="p-5 flex items-center justify-between hover:bg-slate-800/20 cursor-pointer">
              <div className="flex items-center gap-4">
                <Volume2 size={24} className="text-slate-400" />
                <div>
                  <h3 className="text-white font-medium">語音朗讀速度</h3>
                  <p className="text-sm text-slate-500">正常 (1.0x)</p>
                </div>
              </div>
            </div>
            <div className="p-5 flex items-center justify-between hover:bg-slate-800/20 cursor-pointer">
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
          <button className="w-full bg-rose-500/10 text-rose-500 border border-rose-500/20 font-bold text-lg py-4 rounded-xl flex justify-center items-center gap-2 hover:bg-rose-500/20 transition-colors">
            <LogOut size={20} /> 登出帳號
          </button>
        </section>
      </div>
    </div>
  );
}
