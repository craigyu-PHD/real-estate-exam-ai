'use client';
import { Play, Pause, SkipForward, SkipBack, Settings2, ListMusic, CheckCircle2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { lawsData } from '@/data/lawsData';

export default function ListenPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);

  const playlist = lawsData[0].chapters.map(c => ({
    title: `${lawsData[0].name} - ${c.name}`,
    desc: `第 ${c.startArticle} 條 ~ 第 ${c.endArticle} 條`,
    duration: '10:30'
  }));

  const togglePlay = () => setIsPlaying(!isPlaying);

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-8 relative z-10 flex flex-col min-h-screen">
      <header className="flex justify-between items-center pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">聽課模式</h1>
          <p className="text-slate-400">戴上耳機，用聽的建立法條記憶。</p>
        </div>
        <button className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center text-slate-300 transition-colors">
          <Settings2 size={20} />
        </button>
      </header>

      {/* 播放器主視覺 */}
      <div className="flex-1 flex flex-col items-center justify-center py-8">
        <div className="w-64 h-64 md:w-80 md:h-80 bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-full shadow-2xl flex items-center justify-center border-4 border-slate-800/50 relative mb-12">
          {isPlaying && (
            <>
              <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping opacity-50"></div>
              <div className="absolute inset-[-20px] bg-purple-500/10 rounded-full animate-pulse"></div>
            </>
          )}
          <ListMusic size={80} className="text-white/50" />
        </div>

        <div className="text-center w-full max-w-md px-4">
          <h2 className="text-2xl font-bold text-white mb-3">{playlist[currentIdx].title}</h2>
          <p className="text-slate-400 mb-8">{playlist[currentIdx].desc}</p>

          {/* 進度條 */}
          <div className="w-full bg-slate-800 rounded-full h-2 mb-4 cursor-pointer relative">
            <div className={`h-2 rounded-full bg-blue-500 ${isPlaying ? 'w-1/3' : 'w-0'} transition-all duration-[30000ms] ease-linear`}></div>
            <div className="absolute top-[-4px] left-1/3 w-4 h-4 bg-white rounded-full shadow"></div>
          </div>
          <div className="flex justify-between text-xs text-slate-500 font-medium mb-10">
            <span>{isPlaying ? '02:15' : '00:00'}</span>
            <span>{playlist[currentIdx].duration}</span>
          </div>

          {/* 控制器 */}
          <div className="flex items-center justify-center gap-8">
            <button 
              onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <SkipBack size={32} />
            </button>
            <button 
              onClick={togglePlay}
              className="w-20 h-20 bg-white hover:bg-slate-200 text-slate-900 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-xl"
            >
              {isPlaying ? <Pause size={36} className="fill-current" /> : <Play size={36} className="fill-current ml-2" />}
            </button>
            <button 
              onClick={() => setCurrentIdx(Math.min(playlist.length - 1, currentIdx + 1))}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <SkipForward size={32} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
