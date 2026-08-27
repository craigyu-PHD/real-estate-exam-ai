'use client';
import { useEffect, useState } from 'react';
import { CalendarDays, Clock3, Trophy } from 'lucide-react';
import { dateFromKey, useStudyDateKey } from '@/hooks/useStudyDate';

function getDailyCounts(): Record<string,number> {
  if (typeof window==='undefined') return {};
  try { const d=JSON.parse(localStorage.getItem('app_progress')||'{}'); return d.dailyCounts||{}; } catch { return {}; }
}
function localKey(d:Date){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}

export function StudyCalendar() {
  const [daily,setDaily]=useState<Record<string,number>>({});
  const todayKey = useStudyDateKey();
  const today = dateFromKey(todayKey);
  useEffect(()=>{
    const sync = () => setDaily(getDailyCounts());
    queueMicrotask(sync);
    window.addEventListener('app-progress-updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('app-progress-updated', sync);
      window.removeEventListener('storage', sync);
    };
  },[]);
  const year=today.getFullYear(),month=today.getMonth(),firstDay=new Date(year,month,1).getDay(),daysInMonth=new Date(year,month+1,0).getDate();
  const cells:(number|null)[]=Array(firstDay).fill(null).concat(Array.from({length:daysInMonth},(_,i)=>i+1));
  while(cells.length%7!==0)cells.push(null);
  const total=Array.from({length:daysInMonth},(_,i)=>daily[`${year}-${String(month+1).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`]||0).reduce((a,b)=>a+b,0);
  return <div className="card rounded-[1.4rem] p-5">
    <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2"><CalendarDays size={15} className="text-indigo-600"/><span className="text-sm font-black text-primary">{year} 年 {month+1} 月</span></div><span className="text-[10px] font-bold text-tertiary">本月 {total} 條</span></div>
    <div className="grid grid-cols-7 gap-1.5 text-center">{['日','一','二','三','四','五','六'].map(w=><span key={w} className="text-[10px] font-black text-tertiary py-1">{w}</span>)}{cells.map((d,i)=>{if(d===null)return <span key={i}/>;const date=new Date(year,month,d),key=localKey(date),count=daily[key]||0,isToday=key===todayKey;return <span key={key} title={`${key}：${count} 條`} className={`aspect-square rounded-xl flex flex-col items-center justify-center text-[10px] font-black border ${count>0?'bg-indigo-600 text-white border-indigo-600':'surface text-secondary'} ${isToday?'ring-2 ring-amber-400 ring-offset-1':''}`}><span>{d}</span>{count>0&&<span className="text-[8px] opacity-75">{count}條</span>}</span>;})}</div>
    <div className="text-[10px] mt-3 text-tertiary">深色格＝有學習；琥珀框＝今天。</div>
  </div>;
}

export function ExamCountdown() {
  const todayKey = useStudyDateKey();
  const now = dateFromKey(todayKey);
  const examDate=new Date('2027-11-06T09:00:00+08:00'),startDate=new Date('2026-08-25T00:00:00+08:00');
  const diff=Math.ceil((examDate.getTime()-now.getTime())/86400000),total=Math.ceil((examDate.getTime()-startDate.getTime())/86400000),elapsed=Math.max(0,total-diff),pct=Math.max(0,Math.min(100,Math.round(elapsed/total*100)));
  return <div className="hero-surface rounded-[1.5rem] p-6 text-white relative overflow-hidden shadow-xl"><div className="absolute -right-8 -top-8 w-36 h-36 bg-white/10 rounded-full blur-2xl"/><div className="relative flex items-start justify-between gap-5"><div><div className="text-[10px] font-black tracking-[.15em] text-white/70 flex items-center gap-1.5"><Clock3 size={11}/>2027 EXAM COUNTDOWN</div><div className="text-4xl font-black mt-2">{diff>0?diff:0}<span className="text-sm font-medium ml-1.5">天</span></div><div className="text-xs text-white/70 mt-1">目標日 2027/11/06 · 準備期進度 {pct}%</div></div><Trophy size={26} className="text-amber-300"/></div><div className="relative mt-4 h-2 bg-white/15 rounded-full overflow-hidden"><div className="h-full bg-white rounded-full" style={{width:`${pct}%`}}/></div></div>;
}
