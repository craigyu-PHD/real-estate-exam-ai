'use client';
import { BarChart3, Trophy, Flame, Target, Book, Calendar } from 'lucide-react';
import { useProgress } from '@/hooks/useProgress';
import { lawsData } from '@/data/lawsData';

export default function Progress() {
  const { isLoaded, getProgress, getTotalProgress, streak } = useProgress();

  if (!isLoaded) return <div className="p-10 text-center text-slate-400">載入中...</div>;

  const totalPercentage = getTotalProgress();
  
  // Calculate total read and total articles
  let totalRead = 0;
  let totalArticles = 0;
  lawsData.forEach(law => {
    const p = getProgress(law.id);
    totalRead += p.read;
    totalArticles += p.total;
  });

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 relative z-10">
      <header className="border-b border-slate-800 pb-6 flex items-center gap-4">
        <BarChart3 size={32} className="text-emerald-400" />
        <div>
          <h1 className="text-3xl font-bold text-white">學習進度</h1>
          <p className="text-slate-400">追蹤您的學習軌跡，保持穩定前進。</p>
        </div>
      </header>

      {/* 總體數據 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-5 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Target size={18} />
            <span className="text-sm font-medium">總進度</span>
          </div>
          <div className="text-3xl font-bold text-white">{totalPercentage}%</div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${totalPercentage}%` }}></div>
          </div>
        </div>
        
        <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-5 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Book size={18} />
            <span className="text-sm font-medium">已讀法條</span>
          </div>
          <div className="text-3xl font-bold text-white">{totalRead} <span className="text-sm text-slate-500">/ {totalArticles}</span></div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-5 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Flame size={18} className="text-orange-400" />
            <span className="text-sm font-medium">連續學習</span>
          </div>
          <div className="text-3xl font-bold text-white">{streak} <span className="text-lg text-slate-400 font-normal">天</span></div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-5 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Trophy size={18} className="text-yellow-400" />
            <span className="text-sm font-medium">解鎖成就</span>
          </div>
          <div className="text-3xl font-bold text-white">0 <span className="text-lg text-slate-400 font-normal">個</span></div>
        </div>
      </div>

      {/* 各科詳細進度 */}
      <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-6 md:p-8 mt-8">
        <h2 className="text-xl font-bold text-white mb-6">各科詳細進度</h2>
        <div className="space-y-6">
          {lawsData.map((law) => {
            const { read, total, percentage } = getProgress(law.id);
            return (
              <div key={law.id}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300 font-medium">{law.name}</span>
                  <span className="text-slate-400">{read} / {total} ({percentage}%)</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className={`h-2 rounded-full transition-all ${percentage === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${percentage}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BookOpenIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}
