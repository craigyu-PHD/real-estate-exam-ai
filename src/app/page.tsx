'use client';
import Link from 'next/link';
import { Play, Sparkles, BookOpen, Flame, Target, ArrowRight, CalendarDays, Clock, GraduationCap, BarChart3, ShieldCheck, Users, Award } from 'lucide-react';
import { useProgress } from '@/hooks/useProgress';
import { useBookmarks } from '@/hooks/useBookmarks';
import { lawsData } from '@/data/lawsData';
import { StudyCalendar, ExamCountdown } from '@/components/StudyCalendar';

function Ring({ percent, label, sub, color }: { percent: number; label: string; sub: string; color: string }) {
  const deg = Math.round(percent * 3.6);
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-[84px] h-[84px] rounded-full flex items-center justify-center" style={{ background: `conic-gradient(${color} ${deg}deg, #e2e8f0 ${deg}deg)` }}>
        <div className="w-[70px] h-[70px] rounded-full flex flex-col items-center justify-center border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <span className="text-[15px] font-black" style={{ color: 'var(--text-1)' }}>{percent}%</span>
          <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>{sub}</span>
        </div>
      </div>
      <span className="text-xs font-bold" style={{ color: 'var(--text-2)' }}>{label}</span>
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

  if (!isLoaded) return <div className="p-10 text-center" style={{ color: 'var(--text-3)' }}>載入中...</div>;

  const nextLaw = [...lawsData].sort((a,b)=> getProgress(b.id).percentage - getProgress(a.id).percentage)[0] || lawsData[0];
  const prog = getProgress(nextLaw.id);
  const civil = getProgress('civil');
  const land = getProgress('land');
  const broker = getProgress('broker');

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-8 py-8 space-y-8">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1.5 card px-3 py-1.5 rounded-full font-bold" style={{ color: '#065f46', background: '#ecfdf5', borderColor: '#a7f3d0' }}><ShieldCheck size={14}/> 補習班級品質</span>
        <span className="inline-flex items-center gap-1.5 card px-3 py-1.5 rounded-full" style={{ color: 'var(--text-2)' }}><Award size={14}/> 依考試院命題大綱</span>
        <span className="inline-flex items-center gap-1.5 card px-3 py-1.5 rounded-full" style={{ color: 'var(--text-2)' }}><Users size={14}/> 零基礎友善</span>
        <span className="ml-auto inline-flex items-center gap-2 card px-3 py-1.5 rounded-full text-sm" style={{ color: 'var(--text-2)' }}><CalendarDays size={14} className="text-indigo-600"/> {todayStr}</span>
      </div>

      <div className="card rounded-[2rem] shadow-xl overflow-hidden">
        <div className="grid lg:grid-cols-2">
          <div className="p-8 md:p-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black" style={{ background: '#eef2ff', color: '#4338ca', border: '1px solid #c7d2fe' }}>2027 考季 · 現在開始剛剛好</div>
            <h1 className="text-[28px] md:text-[32px] font-black mt-4 leading-tight" style={{ color: 'var(--text-1)' }}>用 10 分鐘，<span className="text-gradient">推進法律地圖</span>一格</h1>
            <p className="text-sm mt-3 leading-relaxed" style={{ color: 'var(--text-2)' }}>比照補習班「先全貌、再細節、再題庫」的節奏，AI 家教陪你每天小步、不走回頭路。首輪見過 → 二輪理解 → 三輪題感 → 考前衝刺。</p>
            <div className="flex gap-3 mt-6">
              <Link href={`/laws/${nextLaw.id}`} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-3 rounded-full text-sm shadow">繼續學習 <Play size={14} className="fill-current" /></Link>
              <Link href="/review" className="inline-flex items-center gap-2 card px-6 py-3 rounded-full text-sm font-bold hover:shadow-sm" style={{ color: 'var(--text-1)' }}>去複習 <Clock size={14} /></Link>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-3">
              <div className="card rounded-2xl p-4 text-center"><div className="text-xs flex items-center justify-center gap-1" style={{ color: 'var(--text-3)' }}><Flame size={12} className="text-orange-500"/> 連續</div><div className="text-xl font-black mt-1" style={{ color: '#ea580c' }}>{streak}<span className="text-xs" style={{ color: 'var(--text-3)' }}>天</span></div></div>
              <div className="card rounded-2xl p-4 text-center"><div className="text-xs flex items-center justify-center gap-1" style={{ color: 'var(--text-3)' }}><Target size={12} className="text-indigo-600"/> 今日</div><div className="text-xl font-black text-indigo-600 mt-1">{today}<span className="text-xs" style={{ color: 'var(--text-3)' }}>條</span></div></div>
              <div className="card rounded-2xl p-4 text-center"><div className="text-xs" style={{ color: 'var(--text-3)' }}>總進度</div><div className="text-xl font-black mt-1" style={{ color: 'var(--text-1)' }}>{total}<span className="text-xs" style={{ color: 'var(--text-3)' }}>%</span></div></div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 p-8 md:p-10 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/15 rounded-full blur-2xl" />
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center"><GraduationCap size={22} /></div>
              <h3 className="text-xl font-black mt-4">補習班級的學習路徑</h3>
              <p className="text-sm opacity-80 mt-1 leading-relaxed">進度可視、每日任務，與坊間名師課程同級體驗</p>
            </div>
            <div className="mt-8 grid grid-cols-4 gap-2">
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
            <div className="card rounded-3xl p-6 card-hover">
              <div className="flex items-center gap-2 font-black text-sm mb-2" style={{ color: '#4f46e5' }}><BookOpen size={16}/> 繼續上次</div>
              <h3 className="text-lg font-black" style={{ color: 'var(--text-1)' }}>{nextLaw.name}</h3>
              <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>進度 {prog.read}/{prog.total} · {prog.percentage}%</p>
              <div className="h-2 rounded-full overflow-hidden mt-3" style={{ background: 'var(--muted)' }}><div className="h-2 bg-indigo-600 rounded-full" style={{width:`${prog.percentage}%`}} /></div>
              <Link href={`/laws/${nextLaw.id}`} className="mt-4 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl text-sm">繼續學習 <ArrowRight size={14} /></Link>
            </div>
            <div className="card rounded-3xl p-6 card-hover">
              <div className="flex items-center gap-2 font-black text-sm mb-2" style={{ color: '#059669' }}><Sparkles size={16}/> 今日複習</div>
              <h3 className="text-lg font-black" style={{ color: 'var(--text-1)' }}>待複習：{confusing} 條</h3>
              <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>SM2 演算法自動排程</p>
              <Link href="/review" className="mt-4 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl text-sm">開始複習</Link>
            </div>
          </section>

          <section className="card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4"><span className="text-sm font-black flex items-center gap-2" style={{ color: 'var(--text-1)' }}><BarChart3 size={16} style={{ color: 'var(--text-3)' }}/> 各科進度</span><Link href="/laws" className="text-xs font-bold hover:underline" style={{ color: '#4f46e5' }}>全部法規 →</Link></div>
            <div className="space-y-3">
              {lawsData.map(law=>{
                const p=getProgress(law.id);
                return (
                  <div key={law.id} className="flex items-center gap-3">
                    <span className="text-xs font-bold w-28 truncate" style={{ color: 'var(--text-2)' }}>{law.name}</span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}><div className="h-2 rounded-full bg-indigo-600" style={{width:`${p.percentage}%`}} /></div>
                    <span className="text-xs w-16 text-right" style={{ color: 'var(--text-3)' }}>{p.read}/{p.total}</span>
                    <span className="text-xs font-black w-10 text-right" style={{ color: 'var(--text-1)' }}>{p.percentage}%</span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <StudyCalendar />
          <div className="card rounded-2xl p-5">
            <div className="text-sm font-black flex items-center gap-2" style={{ color: 'var(--text-1)' }}><GraduationCap size={16} className="text-amber-500"/> 補習班級學習法</div>
            <ul className="text-xs mt-3 space-y-2" style={{ color: 'var(--text-2)' }}>
              <li className="flex gap-2"><span className="text-emerald-600 font-black">✓</span> 每天 10 分鐘，完成比完美重要</li>
              <li className="flex gap-2"><span className="text-emerald-600 font-black">✓</span> 第一輪先「見過」，第二輪再「記住」</li>
              <li className="flex gap-2"><span className="text-emerald-600 font-black">✓</span> 通勤用聽課，睡前用複習</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
