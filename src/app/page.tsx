'use client';
import Link from 'next/link';
import { Play, Sparkles, BookOpen, Flame, Target, ArrowRight, ShieldCheck, CalendarDays, Clock } from 'lucide-react';
import { useProgress } from '@/hooks/useProgress';
import { useBookmarks } from '@/hooks/useBookmarks';
import { lawsData } from '@/data/lawsData';
import { StudyCalendar, ExamCountdown } from '@/components/StudyCalendar';

export default function Home() {
  const { isLoaded, getTotalProgress, streak, getTodayReadCount, getProgress } = useProgress();
  const { getBookmarksByType } = useBookmarks();
  const totalPercentage = getTotalProgress();
  const todayCount = getTodayReadCount();
  const confusingCount = getBookmarksByType('confusing').length;
  const todayStr = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });

  if (!isLoaded) return <div className="p-10 text-center text-slate-400">載入中...</div>;

  const nextLaw = [...lawsData].sort((a,b)=> getProgress(b.id).percentage - getProgress(a.id).percentage)[0] || lawsData[0];
  const prog = getProgress(nextLaw.id);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 relative z-10">
      {/* Top bar: date + greeting */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-full">
            <CalendarDays size={14} className="text-blue-400" /> {todayStr}
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white mt-3 tracking-tight">早安，歡迎回來</h1>
          <p className="text-slate-400 text-sm mt-1">今天先完成一個小目標，就能推進法律地圖一格。</p>
        </div>
        <div className="bg-slate-900/80 backdrop-blur border border-slate-800 px-4 py-3 rounded-2xl flex items-center gap-4">
          <div className="text-center">
            <div className="text-xs text-slate-400 flex items-center gap-1 justify-center"><Flame size={12} className="text-orange-400" /> 連續</div>
            <div className="text-xl font-black text-orange-400">{streak}<span className="text-xs font-normal text-slate-500"> 天</span></div>
          </div>
          <div className="w-px h-10 bg-slate-800" />
          <div className="text-center">
            <div className="text-xs text-slate-400 flex items-center gap-1 justify-center"><Target size={12} className="text-blue-400" /> 今日</div>
            <div className="text-xl font-black text-blue-400">{todayCount}<span className="text-xs font-normal text-slate-500"> 條</span></div>
          </div>
          <div className="w-px h-10 bg-slate-800" />
          <div className="text-center">
            <div className="text-xs text-slate-400">總進度</div>
            <div className="text-xl font-black text-white">{totalPercentage}<span className="text-xs">%</span></div>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ExamCountdown />
          <div className="bg-amber-900/20 border border-amber-500/30 rounded-2xl p-4 flex gap-3">
            <span className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-300 shrink-0 text-sm font-bold">①</span>
            <div>
              <div className="font-bold text-amber-100 text-sm">零基礎新手 4 步驟</div>
              <p className="text-sm text-slate-300 mt-1">看原文 → 聽一句話 → 看案例 → 按「大致懂了」。一天 10 分鐘，系統自動排複習。</p>
            </div>
          </div>

          <section className="grid md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-900/30 to-slate-900/80 backdrop-blur border border-blue-500/20 rounded-3xl p-6">
              <div className="flex items-center gap-2 text-blue-300 mb-2 font-bold text-sm"><BookOpen size={16} /> 繼續上次</div>
              <h2 className="text-lg font-black text-white">{nextLaw.name}</h2>
              <p className="text-slate-400 text-xs mb-3">進度 {prog.read}/{prog.total}（{prog.percentage}%）</p>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 bg-slate-800 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${prog.percentage}%` }} /></div>
                <span className="text-xs text-slate-300">{prog.percentage}%</span>
              </div>
              <Link href={`/laws/${nextLaw.id}`} className="inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-sm">繼續學習 <Play size={14} className="ml-1" /></Link>
            </div>
            <div className="bg-gradient-to-br from-emerald-900/20 to-slate-900/80 backdrop-blur border border-emerald-500/20 rounded-3xl p-6">
              <div className="flex items-center gap-2 text-emerald-300 mb-2 font-bold text-sm"><Sparkles size={16} /> 今日複習</div>
              <h2 className="text-lg font-black text-white">待複習：{confusingCount} 條</h2>
              <p className="text-slate-400 text-xs mb-4">來自「我不懂」＋ SM2 排程</p>
              <Link href="/review" className="inline-flex items-center justify-center w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-sm">開始複習</Link>
            </div>
          </section>

          <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-white">整體完成度 {totalPercentage}%</span>
              <Link href="/laws" className="text-xs text-slate-400 hover:text-white flex items-center gap-1">全部法規 <ArrowRight size={12} /></Link>
            </div>
            <div className="space-y-2.5">
              {lawsData.map(law=>{
                const p=getProgress(law.id);
                return (
                  <div key={law.id} className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 w-32 truncate">{law.name}</span>
                    <div className="flex-1 bg-slate-800 rounded-full h-1.5"><div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full transition-all" style={{width:`${p.percentage}%`}} /></div>
                    <span className="text-xs text-slate-500 w-14 text-right">{p.read}/{p.total}</span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <StudyCalendar />
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="text-sm font-bold text-white flex items-center gap-2"><Clock size={14} className="text-slate-400" /> 學習建議</div>
            <ul className="text-xs text-slate-400 mt-2 space-y-1.5 list-disc list-inside">
              <li>每天 10 分鐘比一天 2 小時更有效</li>
              <li>先走完整體，再回來攻陷標「不懂」的條文</li>
              <li>聽課模式適合通勤時用</li>
            </ul>
            <Link href="/listen" className="mt-3 block text-center bg-white text-slate-900 text-sm font-bold py-2.5 rounded-xl">去聽課模式</Link>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-3 text-xs text-slate-400 flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-400" /> 第一輪先求「見過」，第二輪再求「記住」
          </div>
        </div>
      </div>
    </div>
  );
}
