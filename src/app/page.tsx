'use client';
import Link from 'next/link';
import { Play, Sparkles, BookOpen } from 'lucide-react';
import { useProgress } from '@/hooks/useProgress';

export default function Home() {
  const { isLoaded, getTotalProgress, streak, getTodayReadCount } = useProgress();
  const totalPercentage = getTotalProgress();
  const todayCount = getTodayReadCount();

  if (!isLoaded) return <div className="p-10 text-center text-slate-400">載入中...</div>;

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-10 relative z-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-wide">早安，克雷格</h1>
          <p className="text-slate-400 text-lg">準備好繼續解鎖不動產法規了嗎？</p>
        </div>
        <div className="bg-slate-900/80 backdrop-blur border border-slate-800 px-6 py-4 rounded-2xl flex items-center gap-6">
          <div>
            <div className="text-sm text-slate-400 mb-1">連續學習</div>
            <div className="text-2xl font-bold text-orange-400">{streak} <span className="text-sm font-normal text-slate-500">天</span></div>
          </div>
          <div className="w-px h-10 bg-slate-800"></div>
          <div>
            <div className="text-sm text-slate-400 mb-1">今日已讀</div>
            <div className="text-2xl font-bold text-blue-400">{todayCount} <span className="text-sm font-normal text-slate-500">條</span></div>
          </div>
        </div>
      </header>

      {/* 焦點行動區塊 */}
      <section className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-900/40 to-slate-900/80 backdrop-blur border border-blue-500/30 rounded-3xl p-8 hover:border-blue-500/60 transition-colors">
          <div className="flex items-center gap-2 text-blue-400 mb-4 font-semibold">
            <BookOpen size={20} /> 目前進度
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">民法 - 物權編</h2>
          <p className="text-slate-400 mb-6">您上次讀到第 758 條：設權登記。</p>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div className="bg-blue-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${totalPercentage}%` }}></div>
            </div>
            <span className="text-slate-300 text-sm font-medium">{totalPercentage}%</span>
          </div>
          <Link href="/laws/civil" className="inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20">
            繼續學習 <Play size={18} className="ml-2" />
          </Link>
        </div>

        <div className="bg-gradient-to-br from-emerald-900/40 to-slate-900/80 backdrop-blur border border-emerald-500/30 rounded-3xl p-8 hover:border-emerald-500/60 transition-colors">
          <div className="flex items-center gap-2 text-emerald-400 mb-4 font-semibold">
            <Sparkles size={20} /> 今日複習
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">待複習法條：12 條</h2>
          <p className="text-slate-400 mb-8">AI 根據記憶曲線，挑選了您最容易忘記的法條。</p>
          <Link href="/review" className="inline-flex items-center justify-center w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-900/20">
            開始複習
          </Link>
        </div>
      </section>
    </div>
  );
}
