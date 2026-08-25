'use client';
import Link from 'next/link';
import { BookOpen, Target, RotateCcw, AlertTriangle, ArrowRight } from 'lucide-react';
import { useProgress } from '@/hooks/useProgress';

export default function Home() {
  const { isLoaded, getProgress, getTotalProgress, lawTotalArticles } = useProgress();

  const totalProgress = getTotalProgress();
  
  const lawsList = [
    { id: 'civil', name: '民法' },
    { id: 'land', name: '土地法' },
    { id: 'tax', name: '土地相關稅法' },
    { id: 'broker', name: '不動產經紀相關法規' },
    { id: 'appraisal', name: '估價相關法規' },
  ];

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 relative z-10">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">下午好，今天繼續建立法律地圖。</h1>
        <p className="text-slate-400">這是您的個人法規學習中心。</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 主要行動區塊：整合「繼續學習」與「今天複習」 */}
        <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-6 shadow-lg md:col-span-2 flex flex-col md:flex-row gap-4 justify-between items-center hover:border-slate-700 transition-colors">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
              <BookOpen className="text-blue-400" /> 開始今天的學習
            </h2>
            <p className="text-slate-400">您目前累積了 {isLoaded ? totalProgress : 0}% 的總進度。繼續保持！</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Link href="/review" className="flex-1 md:flex-none px-6 py-3 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-medium rounded-xl transition-colors text-center">
              10 分鐘複習
            </Link>
            <Link href="/laws" className="flex-1 md:flex-none px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors text-center flex items-center justify-center gap-2">
              探索法規 <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* 第一輪總進度 */}
        <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-6 shadow-lg md:col-span-2">
          <div className="flex items-center gap-3 text-purple-400 mb-6">
            <Target size={24} />
            <h2 className="text-xl font-semibold text-white">第一輪總進度</h2>
            <span className="ml-auto text-2xl font-bold text-white">{isLoaded ? totalProgress : 0}%</span>
          </div>
          
          <div className="space-y-4">
            {lawsList.map((law) => {
              const prog = getProgress(law.id);
              return (
                <div key={law.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">{law.name}</span>
                    <span className="text-slate-400">{isLoaded ? prog.percentage : 0}% ({isLoaded ? prog.read : 0}/{prog.total})</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${isLoaded ? prog.percentage : 0}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

