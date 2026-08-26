'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Search, FileText, ArrowRight, Sparkles } from 'lucide-react';
import { generatedArticlesFlat } from '@/data/generatedArticles';
import { lawsData } from '@/data/lawsData';

export default function SearchPage() {
  const [q, setQ] = useState('');
  const results = q.trim().length < 1 ? [] : generatedArticlesFlat.filter(a => {
    const lawName = lawsData.find(l=>l.id===a.lawId)?.name || '';
    const needle=q.trim();
    return a.articleNumber.includes(needle) || a.text.includes(needle) || lawName.includes(needle) || `${a.lawId}${a.articleNumber}`.includes(needle);
  }).slice(0, 50);

  return (
    <div className="page-shell max-w-5xl space-y-5">
      <header className="page-header flex items-start gap-4">
        <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center"><Search size={20}/></div>
        <div><div className="text-[10px] font-black tracking-[.16em] text-indigo-600">SMART SEARCH</div><h1 className="text-2xl font-black mt-1 text-primary">搜尋法條</h1><p className="text-sm mt-1 text-secondary">從 2,399 條現行法規資料中搜尋法規名稱、條號與原文關鍵字。</p></div>
      </header>

      <section className="card rounded-[1.4rem] p-4 md:p-5">
        <div className="relative"><Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary"/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="例如：民法 758、抵押權、未辦登記" className="input-shell w-full rounded-xl pl-11 pr-4 py-3.5 text-sm outline-none" autoFocus/></div>
        <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-tertiary"><span className="surface rounded-full px-2.5 py-1">條號</span><span className="surface rounded-full px-2.5 py-1">法規名稱</span><span className="surface rounded-full px-2.5 py-1">原文關鍵字</span></div>
      </section>

      {q && <div className="flex items-center justify-between text-xs text-tertiary"><span>找到 {results.length} 筆{results.length===50?'（僅顯示前 50 筆）':''}</span><span>輸入越精準，結果越集中</span></div>}

      <div className="space-y-2.5">
        {results.map(r=>{
          const lawName=lawsData.find(l=>l.id===r.lawId)?.name||r.lawId;
          return <Link key={`${r.lawId}-${r.articleNumber}`} href={`/articles/${r.lawId}-${r.articleNumber}`} className="card rounded-2xl p-4 md:p-5 card-hover flex items-start gap-3 group">
            <div className="w-9 h-9 rounded-xl surface flex items-center justify-center text-indigo-600 shrink-0"><FileText size={16}/></div>
            <div className="min-w-0 flex-1"><div className="text-[10px] font-bold text-tertiary">{lawName}</div><div className="text-sm font-black mt-0.5 text-primary">第 {r.articleNumber} 條</div><p className="text-xs leading-relaxed mt-1 line-clamp-2 text-secondary">{r.text}</p></div>
            <ArrowRight size={15} className="text-tertiary group-hover:text-indigo-600 group-hover:translate-x-0.5 transition shrink-0 mt-2"/>
          </Link>;
        })}
        {q && results.length===0 && <div className="card rounded-[1.4rem] p-10 text-center"><Sparkles size={28} className="mx-auto text-tertiary"/><div className="text-sm font-black mt-3 text-primary">沒有找到直接符合的法條</div><p className="text-xs mt-1 text-tertiary">可改用更短的關鍵字，或到 AI 老師用白話提問。</p><Link href="/teacher" className="inline-flex mt-4 text-sm font-black text-indigo-600">改問 AI 老師 →</Link></div>}
      </div>
    </div>
  );
}
