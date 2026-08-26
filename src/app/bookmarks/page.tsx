'use client';
import Link from 'next/link';
import { Star, HelpCircle, AlertTriangle, PenLine, Bookmark as BookmarkIcon, ArrowRight } from 'lucide-react';
import { useBookmarks, BookmarkType } from '@/hooks/useBookmarks';
import { lawsData } from '@/data/lawsData';
import { useState } from 'react';

const tabs: { type: BookmarkType | 'all'; label: string; emoji: string }[] = [
  {type:'all',label:'全部',emoji:'📚'},{type:'important',label:'很重要',emoji:'⭐'},{type:'confusing',label:'我不懂',emoji:'❓'},{type:'memorize',label:'必背',emoji:'🧠'},{type:'note',label:'筆記',emoji:'📝'},
];

export default function Bookmarks() {
  const { isLoaded, getBookmarksByType } = useBookmarks();
  const [currentFilter, setCurrentFilter] = useState<BookmarkType | 'all'>('all');
  const bookmarks=getBookmarksByType(currentFilter);
  const getMeta=(type:BookmarkType)=> type==='important'?{icon:<Star size={12}/>,label:'重要',cls:'status-planned'}:type==='confusing'?{icon:<HelpCircle size={12}/>,label:'不懂',cls:'bg-orange-500/10 text-orange-600 border-orange-500/20'}:type==='memorize'?{icon:<AlertTriangle size={12}/>,label:'必背',cls:'bg-rose-500/10 text-rose-600 border-rose-500/20'}:{icon:<PenLine size={12}/>,label:'筆記',cls:'status-complete'};

  return <div className="page-shell max-w-5xl space-y-5">
    <header className="page-header flex items-start gap-4"><div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center"><BookmarkIcon size={20}/></div><div><div className="text-[10px] font-black tracking-[.16em] text-amber-600">PERSONAL LIBRARY</div><h1 className="text-2xl font-black mt-1 text-primary">我的重點</h1><p className="text-sm mt-1 text-secondary">把不懂、必背與重要法條集中成自己的複習清單。</p></div></header>
    <div className="flex gap-2 overflow-x-auto pb-1">{tabs.map(tab=><button key={tab.type} onClick={()=>setCurrentFilter(tab.type)} className={`px-4 py-2.5 rounded-full text-xs font-black whitespace-nowrap border transition ${currentFilter===tab.type?'bg-indigo-600 text-white border-indigo-600':'surface text-secondary'}`}><span className="mr-1.5">{tab.emoji}</span>{tab.label}</button>)}</div>
    {!isLoaded?<div className="p-10 text-center text-tertiary">載入中…</div>:bookmarks.length===0?<div className="card rounded-[1.4rem] p-10 text-center"><BookmarkIcon size={34} className="mx-auto text-tertiary"/><div className="text-sm font-black mt-3 text-primary">這個分類目前是空的</div><p className="text-xs mt-1 text-tertiary">在法條頁標記「重要／不懂／必背」後會自動出現在這裡。</p><Link href="/laws" className="inline-flex mt-4 text-sm font-black text-indigo-600">回學習中心 →</Link></div>:<div className="grid md:grid-cols-2 gap-3">{bookmarks.map(b=>{const lawName=lawsData.find(l=>l.id===b.lawId)?.name||b.lawId;const meta=getMeta(b.type);return <Link key={`${b.id}-${b.type}`} href={`/articles/${b.lawId}-${b.articleId}`} className="card rounded-2xl p-5 card-hover group"><div className="flex items-start justify-between gap-3"><div><span className="text-[10px] font-bold text-tertiary">{lawName}</span><div className="text-lg font-black mt-1 text-primary">第 {b.articleId} 條</div></div><span className={`release-status flex items-center gap-1 ${meta.cls}`}>{meta.icon}{meta.label}</span></div>{b.note&&<div className="mt-3 surface rounded-xl p-3 text-xs leading-relaxed text-secondary">{b.note}</div>}<div className="mt-4 flex items-center justify-end gap-1 text-xs font-black text-indigo-600">開啟法條 <ArrowRight size={13} className="group-hover:translate-x-0.5 transition"/></div></Link>})}</div>}
  </div>;
}
