'use client';
import Link from 'next/link';
import { Play, Sparkles, BookOpen, Flame, Target, ArrowRight, CalendarDays, Clock, Trophy, GraduationCap, BarChart3, ShieldCheck, Users, Award } from 'lucide-react';
import { useProgress } from '@/hooks/useProgress';
import { useBookmarks } from '@/hooks/useBookmarks';
import { lawsData } from '@/data/lawsData';
import { StudyCalendar, ExamCountdown } from '@/components/StudyCalendar';

function Ring({ percent, label, sub, color }: { percent: number; label: string; sub: string; color: string }) {
  const deg = Math.round(percent * 3.6);
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20 rounded-full flex items-center justify-center shadow-sm" style={{ background: `conic-gradient(${color} ${deg}deg, #e2e8f0 ${deg}deg)` }}>
        <div className="w-[68px] h-[68px] bg-white rounded-full flex flex-col items-center justify-center border border-slate-100">
          <span className="text-lg font-black text-slate-900">{percent}%</span>
          <span className="text-[10px] text-slate-500">{sub}</span>
        </div>
      </div>
      <span className="text-xs font-black text-slate-700">{label}</span>
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
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-6">
      {/* Trust bar */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full font-bold"><ShieldCheck size={14}/> 補習班級品質</span>
        <span className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-full"><Award size={14}/> 依考試院命題大綱</span>
        <span className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-full"><Users size={14}/> 零基礎友善</span>
        <span className="ml-auto inline-flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-full text-slate-600"><CalendarDays size={14} className="text-indigo-500"/> {todayStr}</span>
      </div>

      {/* Hero */}
      <div className="rounded-[2rem] bg-white border border-slate-200 shadow-xl overflow-hidden">
        <div className="grid lg:grid-cols-2">
          <div className="p-6 md:p-8">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full text-xs font-black">2027 考季 · 現在開始剛剛好</div>
            <h1 className="text-3xl md:text-[2.1rem] font-black text-slate-900 mt-3 leading-tight">用 10 分鐘，<span className="text-gradient">推進法律地圖</span>一格</h1>
            <p className="text-slate-600 text-sm mt-2 leading-relaxed">比照補習班「先全貌、再細節、再題庫」的節奏，AI 家教陪你每天小步、不走回頭路。首輪見過 → 二輪理解 → 三輪題感 → 考前衝刺。</p>
            <div className="flex gap-3 mt-5">
              <Link href={`/laws/${nextLaw.id}`} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-3 rounded-full text-sm shadow">繼續學習 <Play size={14} className="fill-current" /></Link>
              <Link href="/listen" className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 font-bold px-6 py-3 rounded-full text-sm">去聽課 <Clock size={14} /></Link>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center"><div className="text-xs text-slate-500 flex items-center justify-center gap-1"><Flame size={12} className="text-orange-500"/> 連續</div><div className="text-xl font-black text-orange-600 mt-1">{streak}<span className="text-xs text-slate-500">天</span></div></div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center"><div className="text-xs text-slate-500 flex items-center justify-center gap-1"><Target size={12} className="text-indigo-500"/> 今日</div><div className="text-xl font-black text-indigo-600 mt-1">{today}<span className="text-xs text-slate-500">條</span></div></div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center"><div className="text-xs text-slate-500">總進度</div><div className="text-xl font-black text-slate-900 mt-1">{total}<span className="text-xs">%</span></div></div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 p-6 md:p-8 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/15 rounded-full blur-2xl" />
            <div>
              <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center"><GraduationCap size={24} /></div>
              <h3 className="text-xl font-black mt-4">補習班級的學習路徑</h3>
              <p className="text-xs opacity-80 mt-1">視覺層次、進度可視、每日任務，與坊間名師課程同級體驗</p>
            </div>
            <div className="mt-6 grid grid-cols-4 gap-2">
              <Ring percent={civil.percentage} label="民法" sub={`${civil.read}/${civil.total}`} color="#4f46e5" />
              <Ring percent={land.percentage} label="土地法" sub={`${land.read}/${land.total}`} color="#059669" />
              <Ring percent={broker.percentage} label="經紀" sub={`${broker.read}/${broker.total}`} color="#d97706" />
              <Ring percent={total} label="全科" sub="衝刺" color="#7c3aed" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ExamCountdown />
          <section className="grid md:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm card-hover">
              <div className="flex items-center gap-2 text-indigo-600 font-black text-sm mb-2"><BookOpen size={16}/> 繼續上次</div>
              <h3 className="text-lg font-black text-slate-900">{nextLaw.name}</h3>
              <p className="text-xs text-slate-500 mb-3">進度 {prog.read}/{prog.total} · {prog.percentage}%</p>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4"><div className="h-2 bg-indigo-600 rounded-full" style={{width:`${prog.percentage}%`}} /></div>
              <Link href={`/laws/${nextLaw.id}`} className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl text-sm">繼續學習 <ArrowRight size={14} /></Link>
            </div>
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm card-hover">
              <div className="flex items-center gap-2 text-emerald-600 font-black text-sm mb-2"><Sparkles size={16}/> 今日複習</div>
              <h3 className="text-lg font-black text-slate-900">待複習：{confusing} 條</h3>
              <p className="text-xs text-slate-500 mb-3">SM2 演算法自動排程</p>
              <Link href="/review" className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl text-sm">開始複習</Link>
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3"><span className="text-sm font-black text-slate-900 flex items-center gap-2"><BarChart3 size={16} className="text-slate-400"/> 各科進度（更真實）</span><Link href="/laws" className="text-xs text-slate-500 hover:text-indigo-600">全部法規 →</Link></div>
            <div className="space-y-2.5">
              {lawsData.map(law=>{
                const p=getProgress(law.id);
                return (
                  <div key={law.id} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-700 w-32 truncate">{law.name}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden"><div className="h-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600" style={{width:`${p.percentage}%`}} /></div>
                    <span className="text-xs text-slate-500 w-16 text-right">{p.read}/{p.total}</span>
                    <span className="text-xs font-black text-slate-900 w-10 text-right">{p.percentage}%</span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <StudyCalendar />
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="text-sm font-black text-slate-900 flex items-center gap-2"><GraduationCap size={16} className="text-amber-500"/> 補習班級學習法</div>
            <ul className="text-xs text-slate-600 mt-3 space-y-2">
              <li className="flex gap-2"><span className="text-emerald-500 font-black">✓</span> 每天 10 分鐘，完成比完美重要</li>
              <li className="flex gap-2"><span className="text-emerald-500 font-black">✓</span> 第一輪先「見過」，第二輪再「記住」</li>
              <li className="flex gap-2"><span className="text-emerald-500 font-black">✓</span> 通勤用聽課，睡前用複習</li>
            </ul>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-50 border border-slate-200 rounded-xl py-2"><div className="text-xs text-slate-500">已讀</div><div className="text-sm font-black text-slate-900">{today}條</div></div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl py-2"><div className="text-xs text-slate-500">待複習</div><div className="text-sm font-black text-amber-600">{confusing}條</div></div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl py-2"><div className="text-xs text-slate-500">連續</div><div className="text-sm font-black text-orange-600">{streak}天</div></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
