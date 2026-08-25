'use client';
import { useProgress } from '@/hooks/useProgress';

export function StudyCalendar() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let dailyCounts: Record<string, number> = {};
  if (typeof window !== 'undefined') {
    try { dailyCounts = JSON.parse(localStorage.getItem('app_progress') || '{}').dailyCounts || {}; } catch {}
  }
  const cells: (number|null)[] = Array(firstDay).fill(null).concat(Array.from({length: daysInMonth}, (_,i)=>i+1));
  while (cells.length % 7 !== 0) cells.push(null);
  const fmt = (d:number) => `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-black text-slate-900">{year}年 {month+1}月</span>
        <span className="text-xs text-slate-500">深色＝當天有學習</span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {['日','一','二','三','四','五','六'].map(w=> <span key={w} className="text-slate-400 py-1 font-bold">{w}</span>)}
        {cells.map((d,i)=> {
          if (d===null) return <span key={i} />;
          const key = fmt(d);
          const count = dailyCounts[key] || 0;
          const isToday = d===today.getDate();
          return (
            <span key={i} className={`aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-bold border ${count>0 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 border-slate-200'} ${isToday ? 'ring-2 ring-amber-400' : ''}`}>
              <span>{d}</span>
              {count>0 && <span className="text-[10px] leading-none opacity-80">{count}條</span>}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export function ExamCountdown() {
  const examDate = new Date('2027-11-06T09:00:00+08:00');
  const startDate = new Date('2026-08-25T00:00:00+08:00');
  const now = new Date();
  const diff = Math.ceil((examDate.getTime() - now.getTime()) / (1000*60*60*24));
  const total = Math.ceil((examDate.getTime() - startDate.getTime()) / (1000*60*60*24));
  const elapsed = total - diff;
  const pct = Math.max(0, Math.min(100, Math.round((elapsed / total) * 100)));
  return (
    <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 rounded-[1.5rem] p-6 text-white relative overflow-hidden shadow-xl">
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/15 rounded-full blur-2xl" />
      <div className="absolute -right-2 top-6 text-white/10 text-6xl font-black">2027</div>
      <div className="text-xs font-bold tracking-widest opacity-90">距離 2027 不動產經紀人考試</div>
      <div className="text-4xl font-black mt-2">{diff > 0 ? `${diff} 天` : '已結束'}</div>
      <div className="text-xs opacity-80 mt-1">考試日：2027/11/06（六）09:00｜自 2026/08/25 起算，已過 {elapsed} 天</div>
      <div className="mt-4">
        <div className="flex justify-between text-[11px] opacity-80 mb-1"><span>準備期進度</span><span>{pct}%</span></div>
        <div className="h-2 bg-white/20 rounded-full overflow-hidden"><div className="h-2 bg-white rounded-full transition-all" style={{width: `${pct}%`}} /></div>
        <div className="text-[11px] opacity-70 mt-1">依「開始準備日→考試日」計算，僅供節奏參考，非成績</div>
      </div>
    </div>
  );
}
