'use client';
import Link from 'next/link';
import { ChevronLeft, CheckCircle2, Headphones, Search, ChevronRight } from 'lucide-react';
import { useProgress } from '@/hooks/useProgress';
import { lawsData } from '@/data/lawsData';
import { generatedArticles } from '@/data/generatedArticles';
import { use } from 'react';

export default function LawDetail({params}:{params:Promise<{id:string}>}) {
  const {id}=use(params);
  const {isLoaded,getProgress,isArticleRead}=useProgress();
  const law=lawsData.find(l=>l.id===id);
  if(!law)return <div className="p-10 text-center text-tertiary">找不到此法規</div>;
  if(!isLoaded)return <div className="p-10 text-center text-tertiary">載入中…</div>;
  const prog=getProgress(id);
  const allArticles=generatedArticles[law.id]||[];
  const chapters=law.chapters?.length?law.chapters:[{id:'all',name:'全部條文',startArticle:1,endArticle:law.totalArticles,articlesCount:law.totalArticles}];
  const nextUnread=allArticles.find(a=>!isArticleRead(law.id,a.articleNumber));

  return <div className="page-shell max-w-5xl space-y-5">
    <Link href="/laws" className="inline-flex items-center gap-1 text-xs font-black text-tertiary hover:text-indigo-600"><ChevronLeft size={14}/>回學習中心</Link>
    <header className="page-header">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5"><div><div className="flex flex-wrap items-center gap-2"><span className="text-[10px] font-black px-2.5 py-1 rounded-full status-current">{law.category}</span><span className="text-[10px] font-bold text-tertiary">共 {law.totalArticles} 條</span></div><h1 className="text-2xl md:text-3xl font-black mt-3 text-primary">{law.name}</h1><p className="text-sm mt-2 leading-relaxed max-w-2xl text-secondary">{law.description}</p></div><div className="surface rounded-2xl px-5 py-4 min-w-[150px]"><div className="text-[10px] font-black text-tertiary">第一輪覆蓋</div><div className="text-2xl font-black mt-1 text-primary">{prog.percentage}%</div><div className="text-[10px] mt-1 text-tertiary">{prog.read} / {prog.total} 條</div></div></div>
      <div className="mt-5 h-2 rounded-full progress-track overflow-hidden"><div className="h-full bg-indigo-600 rounded-full" style={{width:`${prog.percentage}%`}}/></div>
      <div className="mt-4 flex flex-wrap gap-2">{nextUnread&&<Link href={`/articles/${law.id}-${nextUnread.articleNumber}`} className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-black inline-flex items-center gap-1.5">繼續下一條 <ChevronRight size={13}/></Link>}<Link href={`/listen?law=${law.id}`} className="surface px-4 py-2.5 rounded-xl text-xs font-black text-primary inline-flex items-center gap-1.5"><Headphones size={14} className="text-violet-600"/>聽此法</Link><Link href="/search" className="surface px-4 py-2.5 rounded-xl text-xs font-black text-primary inline-flex items-center gap-1.5"><Search size={14} className="text-indigo-600"/>搜尋條文</Link></div>
    </header>

    <div className="space-y-3">{chapters.map(ch=>{const list=allArticles.filter(a=>{const n=parseInt(a.articleNumber,10);return Number.isFinite(n)&&n>=ch.startArticle&&n<=ch.endArticle;});if(!list.length)return null;const done=list.filter(a=>isArticleRead(id,a.articleNumber)).length;return <section key={ch.id} className="card rounded-[1.35rem] overflow-hidden"><div className="px-5 py-3.5 border-b flex items-center justify-between gap-3" style={{borderColor:'var(--border)',background:'var(--surface)'}}><div><h2 className="text-sm font-black text-primary">{ch.name}</h2><div className="text-[10px] text-tertiary mt-0.5">{done}/{list.length} 已讀</div></div><div className="w-20 h-1.5 progress-track rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{width:`${list.length?done/list.length*100:0}%`}}/></div></div><div className="divide-y" style={{borderColor:'var(--border)'}}>{list.map(a=>{const read=isArticleRead(id,a.articleNumber);return <Link key={a.articleNumber} href={`/articles/${id}-${a.articleNumber}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-indigo-500/[0.025] transition group"><span className={`min-w-10 h-10 px-2 rounded-xl flex items-center justify-center text-[11px] font-black border ${read?'bg-emerald-500 text-white border-emerald-500':'surface text-secondary'}`}>{a.articleNumber}</span><p className="flex-1 min-w-0 text-sm line-clamp-1 text-secondary">{a.text}</p>{read&&<CheckCircle2 size={15} className="text-emerald-500 shrink-0"/>}<ChevronRight size={14} className="text-tertiary group-hover:translate-x-0.5 transition shrink-0"/></Link>;})}</div></section>;})}</div>
  </div>;
}
