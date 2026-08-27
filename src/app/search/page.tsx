'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, FileText, Search } from 'lucide-react';
import { WorkspacePageHeader } from '@/components/WorkspacePageHeader';
import { generatedArticlesFlat } from '@/data/generatedArticles';
import { lawsData } from '@/data/lawsData';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const needle = query.trim();
  const results = needle.length < 1 ? [] : generatedArticlesFlat.filter(article => {
    const lawName = lawsData.find(law => law.id === article.lawId)?.name || '';
    return article.articleNumber.includes(needle) || article.text.includes(needle) || lawName.includes(needle) || `${article.lawId}${article.articleNumber}`.includes(needle);
  }).slice(0, 50);

  return (
    <div className="page-shell max-w-5xl space-y-5">
      <WorkspacePageHeader eyebrow="WORKSPACE SEARCH" title="搜尋法條" description="搜尋法規名稱、條號與原文關鍵字，結果直接回到條文閱讀器。"/>

      <section className="card rounded-2xl p-4 md:p-5">
        <div className="relative">
          <Search size={18} strokeWidth={1.9} className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary"/>
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            aria-label="搜尋法條"
            placeholder="搜尋法條、條號、概念、關鍵字…"
            className="input-shell w-full rounded-xl pl-11 pr-4 py-3.5 text-sm outline-none"
            autoFocus
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-tertiary"><span>條號</span><span>法規名稱</span><span>原文關鍵字</span><span>最多顯示 50 筆</span></div>
      </section>

      {needle && (
        <div className="flex items-center justify-between gap-4 text-xs text-tertiary">
          <span>找到 {results.length} 筆{results.length === 50 ? '，目前顯示前 50 筆' : ''}</span>
          <span className="hidden sm:inline">關鍵字越精準，結果越集中</span>
        </div>
      )}

      {needle && results.length > 0 && (
        <section className="card rounded-2xl overflow-hidden divide-y" style={{ borderColor: 'var(--border)' }}>
          {results.map(result => {
            const lawName = lawsData.find(law => law.id === result.lawId)?.name || result.lawId;
            return (
              <Link key={`${result.lawId}-${result.articleNumber}`} href={`/articles/${result.lawId}-${result.articleNumber}`} className="knowledge-row group">
                <div className="w-9 h-9 rounded-lg surface flex items-center justify-center shrink-0"><FileText size={15} strokeWidth={1.9} style={{ color: 'var(--primary)' }}/></div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-tertiary">{lawName}</div>
                  <div className="text-base font-semibold mt-1 text-primary">第 {result.articleNumber} 條</div>
                  <p className="text-sm leading-6 mt-1 text-secondary line-clamp-2">{result.text}</p>
                </div>
                <ArrowRight size={15} strokeWidth={1.9} className="text-tertiary shrink-0 group-hover:translate-x-0.5 transition-transform"/>
              </Link>
            );
          })}
        </section>
      )}

      {needle && results.length === 0 && (
        <section className="card rounded-2xl p-7 md:p-8">
          <Search size={24} strokeWidth={1.9} className="text-tertiary"/>
          <h2 className="text-lg font-semibold mt-4 text-primary">沒有找到直接符合的法條</h2>
          <p className="text-sm leading-6 mt-2 text-secondary">可以縮短關鍵字，或改到 AI 老師用白話描述問題。</p>
          <Link href="/teacher" className="workspace-secondary-action mt-5">改問 AI 老師</Link>
        </section>
      )}
    </div>
  );
}
