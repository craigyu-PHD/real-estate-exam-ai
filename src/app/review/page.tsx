'use client';

import Link from 'next/link';
import { Brain, Check, Clock3, RefreshCcw, RotateCcw, X } from 'lucide-react';
import { useState } from 'react';
import { WorkspacePageHeader } from '@/components/WorkspacePageHeader';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useReview } from '@/hooks/useReview';
import { generatedArticles } from '@/data/generatedArticles';
import { lawsData } from '@/data/lawsData';

export default function Review() {
  const { isLoaded: bookmarksLoaded, getBookmarksByType } = useBookmarks();
  const { isLoaded: reviewLoaded, queue, grade } = useReview();
  const [idx, setIdx] = useState(0);

  const reviewList = [...queue];
  for (const bookmark of getBookmarksByType('confusing')) {
    if (!reviewList.find(item => item.lawId === bookmark.lawId && item.articleId === bookmark.articleId)) {
      reviewList.push({ lawId: bookmark.lawId, articleId: bookmark.articleId, dueDate: new Date().toISOString(), interval: 1, ease: 2.5 });
    }
  }

  if (!bookmarksLoaded || !reviewLoaded) return <div className="p-10 text-center text-tertiary">載入中…</div>;

  if (reviewList.length === 0) {
    return (
      <div className="page-shell max-w-4xl space-y-5">
        <WorkspacePageHeader eyebrow="REVIEW QUEUE" title="間隔複習" description="待複習與標記為「不懂」的法條會集中回到這裡。"/>
        <section className="card rounded-2xl p-7 md:p-8">
          <div className="w-10 h-10 rounded-lg surface flex items-center justify-center"><Check size={18} strokeWidth={1.9} style={{ color: 'var(--success)' }}/></div>
          <h2 className="text-xl font-semibold mt-5 text-primary">今天沒有待複習項目</h2>
          <p className="text-sm leading-6 mt-2 text-secondary">閱讀時標記「不懂」，或完成後安排間隔複習，系統會依時間把內容帶回這個 Queue。</p>
          <Link href="/laws" className="workspace-primary-action mt-5">前往學習中心</Link>
        </section>
      </div>
    );
  }

  if (idx >= reviewList.length) {
    return (
      <div className="page-shell max-w-4xl space-y-5">
        <WorkspacePageHeader eyebrow="REVIEW QUEUE" title="間隔複習" description="本輪 Queue 已處理完成。"/>
        <section className="card rounded-2xl p-7 md:p-8">
          <div className="w-10 h-10 rounded-lg surface flex items-center justify-center"><Check size={18} strokeWidth={1.9} style={{ color: 'var(--success)' }}/></div>
          <h2 className="text-xl font-semibold mt-5 text-primary">這一輪完成了</h2>
          <p className="text-sm leading-6 mt-2 text-secondary">下一次出現時間會依這次的記憶評分調整。</p>
          <button type="button" onClick={() => setIdx(0)} className="workspace-secondary-action mt-5"><RotateCcw size={15} strokeWidth={1.9}/> 再看一輪</button>
        </section>
      </div>
    );
  }

  const current = reviewList[idx];
  const lawName = lawsData.find(law => law.id === current.lawId)?.name || current.lawId;
  const articleText = generatedArticles[current.lawId]?.find(article => article.articleNumber === current.articleId)?.text || '';
  const reviewSummary = articleText.replace(/^第\s*[^條]+條\s*/, '').slice(0, 110) || '回想這一條的主體、條件與法律效果。';
  const dueCount = reviewList.length - idx;
  const handleGrade = (result: 'again' | 'hard' | 'good' | 'easy') => {
    grade(current.lawId, current.articleId, result);
    setIdx(value => value + 1);
  };

  return (
    <div className="page-shell max-w-5xl space-y-5">
      <WorkspacePageHeader
        eyebrow="REVIEW QUEUE"
        title="間隔複習"
        description="先回想，再揭示提示，最後用四級記憶評分安排下一次出現時間。"
        actions={<div className="text-sm text-tertiary">Queue 剩餘 <span className="font-semibold text-primary">{dueCount}</span> 條</div>}
      />

      <section className="grid md:grid-cols-3 gap-3">
        <div className="card rounded-xl p-4"><div className="text-xs text-tertiary">本輪待處理</div><div className="text-2xl font-bold mt-2 text-primary">{reviewList.length}</div></div>
        <div className="card rounded-xl p-4"><div className="text-xs text-tertiary">目前位置</div><div className="text-2xl font-bold mt-2 text-primary">{idx + 1} / {reviewList.length}</div></div>
        <div className="card rounded-xl p-4"><div className="text-xs text-tertiary">目前間隔</div><div className="text-2xl font-bold mt-2 text-primary">{current.interval} 天</div></div>
      </section>

      <section className="card rounded-2xl p-5 md:p-7">
        <div className="flex items-center justify-between gap-4 text-xs text-tertiary">
          <span>{lawName}</span>
          <span className="inline-flex items-center gap-1.5"><Clock3 size={13} strokeWidth={1.9}/> 間隔 {current.interval} 天</span>
        </div>
        <div className="mt-5 text-sm font-medium" style={{ color: 'var(--primary)' }}>第 {current.articleId} 條</div>
        <h2 className="text-xl md:text-2xl font-semibold leading-9 mt-2 text-primary">{reviewSummary}</h2>
        <div className="mt-6 rounded-xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <div className="text-xs font-medium tracking-[0.1em] text-tertiary">ARTICLE HINT</div>
          <p className="font-serif text-base leading-8 mt-2 text-secondary">{articleText.slice(0, 220)}{articleText.length > 220 ? '…' : ''}</p>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 text-sm text-secondary mb-3"><Brain size={15} strokeWidth={1.9}/> 這次想得起來多少？</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button type="button" onClick={() => handleGrade('again')} className="review-grade-button"><X size={15} strokeWidth={1.9}/> 完全忘記</button>
          <button type="button" onClick={() => handleGrade('hard')} className="review-grade-button">有點困難</button>
          <button type="button" onClick={() => handleGrade('good')} className="review-grade-button">想起來了</button>
          <button type="button" onClick={() => handleGrade('easy')} className="review-grade-button"><RefreshCcw size={15} strokeWidth={1.9}/> 很熟</button>
        </div>
      </section>

      <Link href={`/articles/${current.lawId}-${current.articleId}`} className="workspace-secondary-action">查看完整解析</Link>
    </div>
  );
}
