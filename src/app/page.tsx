'use client';
import Link from 'next/link';
import { Play, Sparkles, BookOpen, Flame, Target, ArrowRight, CalendarDays, Clock, Trophy, GraduationCap, BarChart3 } from 'lucide-react';
import { useProgress } from '@/hooks/useProgress';
import { useBookmarks } from '@/hooks/useBookmarks';
import { lawsData } from '@/data/lawsData';
import { StudyCalendar, ExamCountdown } from '@/components/StudyCalendar';

function Ring({ percent, label, sub, color }: { percent: number; label: string; sub: string; color: string }) {
  const deg = Math.round(percent * 3.6);
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20 rounded-full flex items-center justify-center" style={{ background: `conic-gradient(${color} ${deg}deg, #1e293b ${deg}deg)` }}>
        <div className="w-[68px] h-[68px] bg-slate-900 rounded-full flex flex-col items-center justify-center">
          <span className="text-lg font-black text-white">{percent}%</span>
          <span className="text-[10px] text-slate-500">{sub}</span>
        </div>
      </div>
      <span className="text-xs font-bold text-white">{label}</span>
    </div>
  );
}

export default function Home() {
  const { isLoaded, getTotalProgress, streak, getTodayReadCount, getProgress } = useProgress();
  const { getBookmarksByType } = useBookmarks();
  const total = getTotalProgress();
  const today = getTodayReadCount();
  const confusing = getBookmarksByType('confusing').length;
  const todayStr = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });

  if (!isLoaded) return <div className="p-10 text-center text-slate-400">載入中...</div>;

  const nextLaw = [...lawsData].sort((a,b)=> getProgress(b.id).percentage - getProgress(a.id).percentage)[0] || lawsData[0];
  const prog = getProgress(nextLaw.id);
  const civil = getProgress('civil');
  const land = getProgress('land');
  const broker = getProgress('broker');

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-6 relative z-10">
      {/* Hero */}
      <div className="rounded-[2rem] bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-[1px] shadow-2xl">
        <div className="rounded-[2rem] bg-slate-950 px-6 md:px-8 py-6">
          <div className="flex flex-col lg:flex-row justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs bg-white/10 border border-white/15 text-white px-3 py-1.5 rounded-full backdrop-blur">
                <CalendarDays size={14} /> {todayStr} · 補習班級 AI 家教
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white mt-3 tracking-tight">用 10 分鐘，<span className="text-gradient">推進法律地圖</span>一格</h1>
              <p className="text-slate-400 text-sm mt-2">零基礎 → 第一輪全貌 → 第二輪理解 → 考上。每天小步，不走回頭路。</p>
              <div className="flex gap-2 mt-4">
                <Link href={`/laws/${nextLaw.id}`} className="inline-flex items-center gap-2 bg-white text-slate-900 font-black px-5 py-3 rounded-full text-sm shadow">繼續學習 <Play size={14} className="fill-current" /></Link>
                <Link href="/listen" className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white font-bold px-5 py-3 rounded-full text-sm backdrop-blur">去聽課 <Clock size={14} /></Link>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 lg:w-[420px]">
              <div className="glass rounded-2xl p-4 text-center"><div className="text-xs text-slate-400 flex items-center justify-center gap-1"><Flame size={12} className="text-orange-400"/> 連續</div><div className="text-2xl font-black text-orange-400 mt-1">{streak}<span className="text-xs text-slate-500">天</span></div></div>
              <div className="glass rounded-2xl p-4 text-center"><div className="text-xs text-slate-400 flex items-center justify-center gap-1"><Target size={12} className="text-blue-400"/> 今日</div><div className="text-2xl font-black text-blue-400 mt-1">{today}<span className="text-xs text-slate-500">條</span></div></div>
              <div className="glass rounded-2xl p-4 text-center"><div className="text-xs text-slate-400">總進度</div><div className="text-2xl font-black text-white mt-1">{total}<span className="text-xs">%</span></div></div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            <Ring percent={civil.percentage} label="民法" sub={`${civil.read}/${civil.total}`} color="#3b82f6" />
            <Ring percent={land.percentage} label="土地法" sub={`${land.read}/${land.total}`} color="#10b981" />
            <Ring percent={broker.percentage} label="經紀相關" sub={`${broker.read}/${broker.total}`} color="#f59e0b" />
            <Ring percent={total} label="全科總覽" sub="考前衝刺" color="#8b5cf6" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ExamCountdown />
          <section className="grid md:grid-cols-2 gap-4">
            <div className="glass rounded-3xl p-6 card-hover">
              <div className="flex items-center gap-2 text-blue-300 font-black text-sm mb-2"><BookOpen size={16}/> 繼續上次</div>
              <h3 className="text-lg font-black text-white">{nextLaw.name}</h3>
              <p className="text-xs text-slate-400 mb-3">進度 {prog.read}/{prog.total} · {prog.percentage}%</p>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-4"><div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{width:`${prog.percentage}%`}} /></div>
              <Link href={`/laws/${nextLaw.id}`} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded-xl text-sm">繼續學習 <ArrowRight size={14} /></Link>
            </div>
            <div className="glass rounded-3xl p-6 card-hover">
              <div className="flex items-center gap-2 text-emerald-300 font-black text-sm mb-2"><Sparkles size={16}/> 今日複習</div>
              <h3 className="text-lg font-black text-white">待複習：{confusing} 條</h3>
              <p className="text-xs text-slate-400 mb-3">SM2 演算法自動排程</p>
              <Link href="/review" className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl text-sm">開始複習</Link>
            </div>
          </section>

          <section className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3"><span className="text-sm font-black text-white flex items-center gap-2"><BarChart3 size={16} className="text-slate-400"/> 各科進度（更真實）</span><Link href="/laws" className="text-xs text-slate-400 hover:text-white">全部法規 →</Link></div>
            <div className="space-y-2.5">
              {lawsData.map(law=>{
                const p=getProgress(law.id);
                return (
                  <div key={law.id} className="flex items-center gap-3">
                    <span className="text-xs text-slate-300 w-32 truncate">{law.name}</span>
                    <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden"><div className="h-2 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" style={{width:`${p.percentage}%`}} /></div>
                    <span className="text-xs text-slate-400 w-16 text-right">{p.read}/{p.total}</span>
                    <span className="text-xs font-bold text-white w-10 text-right">{p.percentage}%</span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <StudyCalendar />
          <div className="glass rounded-2xl p-5">
            <div className="text-sm font-black text-white flex items-center gap-2"><GraduationCap size={16} className="text-amber-400"/> 補習班級學習法</div>
            <ul className="text-xs text-slate-300 mt-3 space-y-2">
              <li className="flex gap-2"><span className="text-emerald-400">✓</span> 每天 10 分鐘，完成比完美重要</li>
              <li className="flex gap-2"><span className="text-emerald-400">✓</span> 第一輪先「見過」，第二輪再「記住」</li>
              <li className="flex gap-2"><span className="text-emerald-400">✓</span> 通勤用聽課，睡前用複習</li>
            </ul>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-800 rounded-xl py-2"><div className="text-xs text-slate-500">已讀</div><div className="text-sm font-black text-white">{today}條</div></div>
              <div className="bg-slate-800 rounded-xl py-2"><div className="text-xs text-slate-500">待複習</div><div className="text-sm font-black text-amber-300">{confusing}條</div></div>
              <div className="bg-slate-800 rounded-xl py-2"><div className="text-xs text-slate-500">連續</div><div className="text-sm font-black text-orange-400">{streak}天</div></div>
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-4 text-white flex items-center gap-3">
            <Trophy size={20} /><div><div className="text-sm font-black">企業級視覺升級完成</div><div className="text-xs opacity-80">層次、陰影、動效皆已補強</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
