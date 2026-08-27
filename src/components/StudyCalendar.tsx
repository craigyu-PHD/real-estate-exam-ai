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
  return <div className="card rounded-2xl p-5">
    <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2"><CalendarDays size={16} strokeWidth={1.9} style={{ color: 'var(--primary)' }}/><span className="text-sm font-semibold text-primary">{year} 年 {month+1} 月</span></div><span className="text-xs font-medium text-tertiary">本月 {total} 條</span></div>
    <div className="grid grid-cols-7 gap-1.5 text-center">{['日','一','二','三','四','五','六'].map(w=><span key={w} className="text-xs font-medium text-tertiary py-1">{w}</span>)}{cells.map((d,i)=>{if(d===null)return <span key={i}/>;const date=new Date(year,month,d),key=localKey(date),count=daily[key]||0,isToday=key===todayKey;return <span key={key} title={`${key}：${count} 條`} className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-semibold border ${count>0?'text-white border-transparent':'surface text-secondary'} ${isToday?'border-[var(--primary)]':''}`} style={count>0?{background:'var(--primary)'}:undefined}><span>{d}</span>{count>0&&<span className="text-xs opacity-80">{count}條</span>}</span>;})}</div>
    <div className="text-xs mt-3 text-tertiary">Accent 格代表有學習紀錄；外框代表今天。</div>
  </div>;
}

export function ExamCountdown() {
  const todayKey = useStudyDateKey();
  const now = dateFromKey(todayKey);
  const examDate=new Date('2027-11-06T09:00:00+08:00'),startDate=new Date('2026-08-25T00:00:00+08:00');
  const diff=Math.ceil((examDate.getTime()-now.getTime())/86400000),total=Math.ceil((examDate.getTime()-startDate.getTime())/86400000),elapsed=Math.max(0,total-diff),pct=Math.max(0,Math.min(100,Math.round(elapsed/total*100)));
  return <div className="card rounded-2xl p-5"><div className="flex items-start justify-between gap-5"><div><div className="text-xs font-medium tracking-[.1em] text-tertiary flex items-center gap-1.5"><Clock3 size={13} strokeWidth={1.9}/>2027 EXAM COUNTDOWN</div><div className="text-3xl font-bold mt-2 text-primary">{diff>0?diff:0}<span className="text-sm font-medium ml-1.5 text-secondary">天</span></div><div className="text-xs text-tertiary mt-1">目標日 2027/11/06 · 準備期進度 {pct}%</div></div><Trophy size={20} strokeWidth={1.9} style={{color:'var(--primary)'}}/></div><div className="mt-4 h-1.5 progress-track rounded-full overflow-hidden"><div className="h-full rounded-full" style={{width:`${pct}%`,background:'var(--primary)'}}/></div></div>;
}
