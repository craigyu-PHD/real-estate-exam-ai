'use client';
import { useProgress } from '@/hooks/useProgress';

export function StudyCalendar() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const { isLoaded } = useProgress();
  // read dailyCounts directly
  let dailyCounts: Record<string, number> = {};
  if (typeof window !== 'undefined') {
    try { dailyCounts = JSON.parse(localStorage.getItem('app_progress') || '{}').dailyCounts || {}; } catch {}
  }
  const cells: (number|null)[] = Array(firstDay).fill(null).concat(Array.from({length: daysInMonth}, (_,i)=>i+1));
  while (cells.length % 7 !== 0) cells.push(null);

  const fmt = (d:number) => `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-bold text-white">{year}年 {month+1}月</span>
        <span className="text-xs text-slate-500">有顏色＝當天有學習</span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {['日','一','二','三','四','五','六'].map(w=> <span key={w} className="text-slate-500 py-1">{w}</span>)}
        {cells.map((d,i)=> {
          if (d===null) return <span key={i} />;
          const key = fmt(d);
          const count = dailyCounts[key] || 0;
          const isToday = d===today.getDate();
          return (
            <span key={i} className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs ${count>0 ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-800 text-slate-400'} ${isToday ? 'ring-2 ring-blue-500' : ''}`}>
              <span>{d}</span>
              {count>0 && <span className="text-[10px] leading-none">{count}條</span>}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export function ExamCountdown() {
  // 2027 exam: assume 2027-11-06 (first Saturday of Nov)
  const examDate = new Date('2027-11-06T09:00:00+08:00');
  const now = new Date();
  const diff = Math.ceil((examDate.getTime() - now.getTime()) / (1000*60*60*24));
  return (
    <div className="bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl p-5 text-white relative overflow-hidden">
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
      <div className="text-xs opacity-80 tracking-widest">距離 2027 不動產經紀人考試</div>
      <div className="text-4xl font-black mt-2">{diff > 0 ? `${diff} 天` : '已結束'}</div>
      <div className="text-xs opacity-80 mt-1">考試日：2027/11/06（六）09:00｜考前衝刺倒數</div>
      <div className="mt-3 h-2 bg-black/20 rounded-full overflow-hidden"><div className="h-2 bg-white rounded-full" style={{width: `${Math.max(5, Math.min(100, 100 - diff/5))}%`}} /></div>
    </div>
  );
}
