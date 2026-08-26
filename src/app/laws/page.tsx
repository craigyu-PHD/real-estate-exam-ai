'use client';
import Link from 'next/link';
import { BookOpen, CheckCircle2, Play, Headphones, Clock3, Layers3 } from 'lucide-react';
import { useProgress } from '@/hooks/useProgress';
import { useBookmarks } from '@/hooks/useBookmarks';
import { lawsData } from '@/data/lawsData';
import { useState } from 'react';

export default function LawsIndex() {
  const { isLoaded, getProgress }=useProgress();
  const { getBookmarksByType }=useBookmarks();
  const [category,setCategory]=useState('全部');
  const due=getBookmarksByType('confusing').length;
  if(!isLoaded)return <div className="p-10 text-center text-tertiary">載入中…</div>;
  const categories=['全部',...Array.from(new Set(lawsData.map(l=>l.category)))];
  const visible=category==='全部'?lawsData:lawsData.filter(l=>l.category===category);
  return <div className="page-shell space-y-5">
    <header className="page-header flex flex-col lg:flex-row lg:items-center justify-between gap-5">
      <div className="flex items-start gap-4"><div className="w-11 h-11 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center"><BookOpen size={21}/></div><div><div className="text-[10px] font-black tracking-[.16em] text-indigo-600">LEARNING MAP</div><h1 className="text-2xl font-black mt-1 text-primary">學習中心</h1><p className="text-sm mt-1 max-w-2xl text-secondary">所有法規都走同一條路：先建立全貌，再理解、複習與做題，不另外拆成多套入口。</p></div></div>
      <div className="flex flex-wrap gap-2"><Link href="/review" className="inline-flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-black"><Clock3 size={15}/>待複習 {due} 條</Link><Link href="/listen" className="surface inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-black text-primary"><Headphones size={15} className="text-violet-600"/>聽課模式</Link></div>
    </header>

    <div className="flex gap-2 overflow-x-auto pb-1">{categories.map(c=><button key={c} onClick={()=>setCategory(c)} className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-black border transition ${category===c?'bg-indigo-600 border-indigo-600 text-white':'surface text-secondary'}`}>{c}</button>)}</div>

    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{visible.map(law=>{const {read,total,percentage}=getProgress(law.id),done=percentage===100;return <Link key={law.id} href={`/laws/${law.id}`} className="card rounded-[1.35rem] p-5 card-hover flex flex-col justify-between group min-h-[220px]">
      <div><div className="flex items-start justify-between gap-3"><div className="w-10 h-10 rounded-xl surface text-indigo-600 flex items-center justify-center"><Layers3 size={18}/></div><span className="text-[10px] font-bold px-2 py-1 rounded-full surface text-tertiary">{law.category}</span></div><h2 className="text-lg font-black mt-4 text-primary group-hover:text-indigo-600 transition">{law.name}</h2><p className="text-xs mt-1.5 leading-relaxed line-clamp-2 text-secondary">{law.description}</p></div>
      <div className="mt-5"><div className="flex items-center justify-between text-[10px] font-bold mb-2 text-tertiary"><span>{done?<span className="inline-flex items-center gap-1 text-emerald-600"><CheckCircle2 size={12}/>已完成</span>:'第一輪進度'}</span><span>{read}/{total} · {percentage}%</span></div><div className="h-2 rounded-full progress-track overflow-hidden"><div className={`h-full rounded-full ${done?'bg-emerald-500':'bg-indigo-600'}`} style={{width:`${percentage}%`}}/></div><div className="mt-3 flex items-center justify-between"><span className="text-[10px] text-tertiary">共 {law.totalArticles} 條</span><span className="text-xs font-black text-indigo-600 flex items-center gap-1">{done?'再複習':'進入學習'} <Play size={11}/></span></div></div>
    </Link>;})}</div>
  </div>;
}
