'use client';
import Link from 'next/link';
import { Play, Sparkles, BookOpen, Flame, Target, ArrowRight, ShieldCheck } from 'lucide-react';
import { useProgress } from '@/hooks/useProgress';
import { useBookmarks } from '@/hooks/useBookmarks';
import { lawsData } from '@/data/lawsData';

export default function Home() {
  const { isLoaded, getTotalProgress, streak, getTodayReadCount, getProgress } = useProgress();
  const { getBookmarksByType } = useBookmarks();
  const totalPercentage = getTotalProgress();
  const todayCount = getTodayReadCount();
  const confusingCount = getBookmarksByType('confusing').length;

  if (!isLoaded) return <div className="p-10 text-center text-slate-400">載入中...</div>;

  // Find law with most progress to suggest continue, or first law if 0%
  const nextLaw = [...lawsData].sort((a,b)=> getProgress(b.id).percentage - getProgress(a.id).percentage)[0] || lawsData[0];
  const prog = getProgress(nextLaw.id);

  return (
    <div className="p-4 md:p-10 max-w-5xl mx-auto space-y-8 relative z-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 tracking-tight">早安，歡迎回來</h1>
          <p className="text-slate-400">今天先完成一個小目標，就能推進法律地圖一格。</p>
          <div className="mt-3 inline-flex items-center gap-2 text-xs bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-full">
            <ShieldCheck size={14} className="text-emerald-400" /> 第一輪目標：把所有重要法條完整走過一次，先求見過、再求記住
          </div>
        </div>
        <div className="bg-slate-900/80 backdrop-blur border border-slate-800 px-5 py-4 rounded-2xl flex items-center gap-5">
          <div>
            <div className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Flame size={12} className="text-orange-400" /> 連續學習</div>
            <div className="text-2xl font-bold text-orange-400">{streak} <span className="text-xs font-normal text-slate-500">天</span></div>
          </div>
          <div className="w-px h-10 bg-slate-800" />
          <div>
            <div className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Target size={12} className="text-blue-400" /> 今日已讀</div>
            <div className="text-2xl font-bold text-blue-400">{todayCount} <span className="text-xs font-normal text-slate-500">條</span></div>
          </div>
          <div className="w-px h-10 bg-slate-800" />
          <div>
            <div className="text-xs text-slate-400 mb-1">總進度</div>
            <div className="text-2xl font-bold text-white">{totalPercentage}<span className="text-sm">%</span></div>
          </div>
        </div>
      </header>

      {totalPercentage===0 && (
        <div className="bg-amber-900/20 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
          <span className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-300 shrink-0">①</span>
          <div>
            <div className="font-bold text-amber-100 text-sm">零基礎新手怎麼開始？</div>
            <p className="text-sm text-slate-300 mt-1 leading-relaxed">按「開始第一條」→ 看法條原文 → 聽一句話白話 → 看案例 → 按「大致懂了」。一天 10 分鐘，系統會自動排下次複習，不用一次背完。</p>
          </div>
        </div>
      )}

      <section className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-900/30 to-slate-900/80 backdrop-blur border border-blue-500/20 rounded-3xl p-6 md:p-8">
          <div className="flex items-center gap-2 text-blue-300 mb-3 font-semibold text-sm"><BookOpen size={18} /> 繼續上次學習</div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-1">{nextLaw.name}</h2>
          <p className="text-slate-400 text-sm mb-4">進度 {prog.read}/{prog.total}（{prog.percentage}%）· 上次進度自動記憶</p>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${prog.percentage}%` }} />
            </div>
            <span className="text-slate-300 text-xs font-medium">{prog.percentage}%</span>
          </div>
          <Link href={`/laws/${nextLaw.id}`} className="inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-blue-900/20">
            繼續學習 <Play size={16} className="ml-2" />
          </Link>
          <Link href="/laws" className="mt-2 flex items-center justify-center gap-1 text-xs text-slate-400 hover:text-white">查看全部法規 <ArrowRight size={12} /></Link>
        </div>

        <div className="bg-gradient-to-br from-emerald-900/20 to-slate-900/80 backdrop-blur border border-emerald-500/20 rounded-3xl p-6 md:p-8">
          <div className="flex items-center gap-2 text-emerald-300 mb-3 font-semibold text-sm"><Sparkles size={18} /> 今天複習</div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-1">待複習：{confusingCount} 條</h2>
          <p className="text-slate-400 text-sm mb-6">來自你標「我不懂」的法條，系統會用間隔重複幫你排程。</p>
          <Link href="/review" className="inline-flex items-center justify-center w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-emerald-900/20">
            開始 10 分鐘複習
          </Link>
          <p className="text-xs text-slate-500 mt-2 text-center">沒標不懂也會在進度頁看到「快忘記的」清單</p>
        </div>
      </section>

      <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
        <div className="text-sm font-bold text-white mb-3">整體完成度 {totalPercentage}%</div>
        <div className="space-y-3">
          {lawsData.slice(0,6).map(law=>{
            const p=getProgress(law.id);
            return (
              <div key={law.id} className="flex items-center gap-3">
                <span className="text-xs text-slate-400 w-28 truncate">{law.name}</span>
                <div className="flex-1 bg-slate-800 rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full" style={{width:`${p.percentage}%`}} /></div>
                <span className="text-xs text-slate-500 w-10 text-right">{p.percentage}%</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
