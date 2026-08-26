'use client';
import { RefreshCcw, Check, X, Sparkles, Brain, Clock3 } from 'lucide-react';
import { useState } from 'react';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useReview } from '@/hooks/useReview';
import { getArticleDetail } from '@/data/articleExplanations';
import { lawsData } from '@/data/lawsData';
import Link from 'next/link';

export default function Review() {
  const { isLoaded:bLoaded,getBookmarksByType }=useBookmarks();
  const { isLoaded:rLoaded,queue,grade }=useReview();
  const [idx,setIdx]=useState(0);
  const reviewList=[...queue];
  for(const b of getBookmarksByType('confusing')) if(!reviewList.find(x=>x.lawId===b.lawId&&x.articleId===b.articleId)) reviewList.push({lawId:b.lawId,articleId:b.articleId,dueDate:new Date().toISOString(),interval:1,ease:2.5});
  const isLoaded=bLoaded&&rLoaded;
  if(!isLoaded)return <div className="p-10 text-center text-tertiary">載入中…</div>;
  if(reviewList.length===0)return <div className="page-shell max-w-2xl"><div className="card rounded-[1.5rem] p-10 text-center mt-12"><div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto"><Sparkles size={28}/></div><h1 className="text-2xl font-black mt-4 text-primary">今天沒有待複習項目</h1><p className="text-sm mt-2 text-secondary">閱讀時標記「不懂」，或完成之後安排間隔複習，系統會把內容帶回這裡。</p><Link href="/laws" className="inline-flex mt-5 bg-indigo-600 text-white rounded-xl px-5 py-3 text-sm font-black">去學習</Link></div></div>;
  if(idx>=reviewList.length)return <div className="page-shell max-w-2xl"><div className="card rounded-[1.5rem] p-10 text-center mt-12"><div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto"><Check size={28}/></div><h1 className="text-2xl font-black mt-4 text-primary">這一輪完成了</h1><p className="text-sm mt-2 text-secondary">做得好，下一次出現時間會依你的評分調整。</p><button onClick={()=>setIdx(0)} className="mt-5 surface rounded-xl px-5 py-3 text-sm font-black text-primary">再看一輪</button></div></div>;
  const cur=reviewList[idx], detail=getArticleDetail(cur.lawId,cur.articleId), lawName=lawsData.find(l=>l.id===cur.lawId)?.name||cur.lawId;
  const handleGrade=(g:'again'|'hard'|'good'|'easy')=>{grade(cur.lawId,cur.articleId,g);setIdx(i=>i+1);};
  return <div className="page-shell max-w-3xl space-y-5">
    <header className="page-header flex items-center justify-between gap-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center"><RefreshCcw size={18}/></div><div><div className="text-[10px] font-black tracking-[.15em] text-emerald-600">SPACED REVIEW</div><h1 className="text-xl font-black text-primary">間隔複習</h1></div></div><span className="text-xs font-black text-tertiary">{idx+1} / {reviewList.length}</span></header>
    <section className="card rounded-[1.5rem] p-6 md:p-8"><div className="flex flex-wrap gap-2"><span className="surface rounded-full px-2.5 py-1 text-[10px] font-bold text-tertiary">{lawName}</span><span className="surface rounded-full px-2.5 py-1 text-[10px] font-bold text-tertiary flex items-center gap-1"><Clock3 size={10}/>間隔 {cur.interval} 天</span></div><h2 className="text-3xl font-black mt-5 text-primary">第 {cur.articleId} 條</h2><p className="text-lg font-black leading-relaxed mt-3 text-primary">{detail?.oneLiner}</p><div className="surface rounded-2xl p-4 mt-5"><div className="text-[10px] font-black text-tertiary">法條提示</div><p className="text-sm leading-loose mt-1 text-secondary">{detail?.articleText.slice(0,180)}{(detail?.articleText.length||0)>180?'…':''}</p></div></section>
    <section><div className="flex items-center justify-center gap-2 text-xs mb-3 text-tertiary"><Brain size={14}/>這次想得起來多少？</div><div className="grid grid-cols-2 md:grid-cols-4 gap-2"><button onClick={()=>handleGrade('again')} className="rounded-xl py-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-300 font-black text-sm"><X size={16} className="mx-auto mb-1"/>完全忘記</button><button onClick={()=>handleGrade('hard')} className="rounded-xl py-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 font-black text-sm">有點困難</button><button onClick={()=>handleGrade('good')} className="rounded-xl py-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-black text-sm">想起來了</button><button onClick={()=>handleGrade('easy')} className="rounded-xl py-3.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-black text-sm">很熟</button></div></section>
    <Link href={`/articles/${cur.lawId}-${cur.articleId}`} className="block text-center text-xs font-black text-indigo-600">查看完整解析 →</Link>
  </div>;
}
