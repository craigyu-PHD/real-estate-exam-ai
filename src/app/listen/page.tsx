'use client';
import { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Headphones, Settings2 } from 'lucide-react';

export default function ListenMode() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [setupMode, setSetupMode] = useState(true);

  if (setupMode) {
    return (
      <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-8">
        <header className="text-center space-y-2 mb-10">
          <Headphones size={48} className="mx-auto text-blue-500 mb-4" />
          <h1 className="text-3xl font-bold text-white">AI 補習班模式</h1>
          <p className="text-slate-400">戴上耳機，用聽的建立法律地圖。</p>
        </header>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-white">今天想聽多久？</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['5 分鐘', '10 分鐘', '20 分鐘', '30 分鐘'].map((t, i) => (
              <button key={t} className={`p-4 rounded-xl border ${i === 2 ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'}`}>
                {t}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-white">你想聽什麼？</h2>
          <div className="space-y-3">
            {['繼續第一輪 (依進度)', '今天複習 (間隔複習)', '我的弱點 (易錯題)', '隨機播放'].map((t, i) => (
              <label key={t} className="flex items-center gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer hover:bg-slate-800">
                <input type="radio" name="listen-type" defaultChecked={i === 0} className="w-5 h-5 text-blue-600 bg-slate-700 border-slate-600 focus:ring-blue-600 focus:ring-2" />
                <span className="text-slate-200 font-medium">{t}</span>
              </label>
            ))}
          </div>
        </section>

        <button 
          onClick={() => setSetupMode(false)}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-blue-900/50 mt-8"
        >
          開始上課
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-center items-center p-6 max-w-md mx-auto">
      <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col items-center shadow-2xl relative overflow-hidden">
        
        {/* 背景裝飾 */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none"></div>

        <button onClick={() => setSetupMode(true)} className="absolute top-6 right-6 text-slate-500 hover:text-slate-300">
          <Settings2 size={24} />
        </button>

        <p className="text-sm font-medium text-blue-400 mb-2 mt-4 tracking-wider">正在播放</p>
        <h1 className="text-2xl font-bold text-white mb-8 text-center">民法 第 758 條<br/><span className="text-lg font-normal text-slate-400 mt-2 block">設權登記</span></h1>

        {/* 視覺化波形模擬 */}
        <div className="flex items-center gap-1 h-16 mb-12 w-full justify-center">
          {[40, 70, 45, 90, 60, 30, 80, 50, 65, 40, 85, 55, 30, 75, 45].map((h, i) => (
            <div 
              key={i} 
              className={`w-1.5 rounded-full ${isPlaying ? 'bg-blue-500' : 'bg-slate-700'} transition-all duration-300 ease-in-out`}
              style={{ height: isPlaying ? `${h}%` : '20%' }}
            />
          ))}
        </div>

        {/* 控制列 */}
        <div className="flex items-center gap-8 mb-8">
          <button className="text-slate-400 hover:text-white transition-colors">
            <SkipBack size={32} />
          </button>
          
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-20 h-20 flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-900/50 transition-transform active:scale-95"
          >
            {isPlaying ? <Pause size={36} className="fill-current" /> : <Play size={36} className="fill-current ml-1" />}
          </button>
          
          <button className="text-slate-400 hover:text-white transition-colors">
            <SkipForward size={32} />
          </button>
        </div>

        {/* 速度控制與標記 */}
        <div className="flex justify-between w-full mt-4 border-t border-slate-800 pt-6">
          <div className="flex gap-2">
            {['0.8x', '1.0x', '1.25x', '1.5x'].map(speed => (
              <button key={speed} className={`px-2 py-1 text-xs rounded font-medium ${speed === '1.0x' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                {speed}
              </button>
            ))}
          </div>
        </div>

        {/* 回饋 */}
        <div className="flex gap-3 w-full mt-6">
          <button className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-colors">沒聽懂</button>
          <button className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition-colors">我懂了</button>
        </div>

      </div>
    </div>
  );
}
