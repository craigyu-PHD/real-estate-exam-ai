'use client';

import Link from 'next/link';
import { use } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, Headphones, Search } from 'lucide-react';
import { WorkspacePageHeader } from '@/components/WorkspacePageHeader';
import { useProgress } from '@/hooks/useProgress';
import { lawsData } from '@/data/lawsData';
import { generatedArticles } from '@/data/generatedArticles';

export default function LawDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isLoaded, getProgress, isArticleRead } = useProgress();
  const law = lawsData.find(item => item.id === id);

  if (!law) return <div className="p-10 text-center text-sm text-tertiary">找不到此法規</div>;
  if (!isLoaded) return <div className="p-10 text-center text-sm text-tertiary">載入法規工作台…</div>;

  const progress = getProgress(id);
  const allArticles = generatedArticles[law.id] || [];
  const chapters = law.chapters?.length
    ? law.chapters
    : [{ id: 'all', name: '全部條文', startArticle: 1, endArticle: law.totalArticles, articlesCount: law.totalArticles }];
  const nextUnread = allArticles.find(article => !isArticleRead(law.id, article.articleNumber));

  return (
    <div className="page-shell max-w-5xl space-y-5">
      <Link href="/laws" className="inline-flex items-center gap-1.5 text-sm font-medium text-tertiary hover:text-primary transition-colors">
        <ChevronLeft size={15} strokeWidth={1.9}/> 回學習中心
      </Link>

      <WorkspacePageHeader
        eyebrow="LAW WORKSPACE"
        title={law.name}
        description={law.description}
        actions={
          <>
            {nextUnread && (
              <Link href={`/articles/${law.id}-${nextUnread.articleNumber}`} className="workspace-primary-action">
                繼續下一條 <ChevronRight size={15} strokeWidth={1.9}/>
              </Link>
            )}
            <Link href={`/listen?law=${law.id}`} className="workspace-secondary-action">
              <Headphones size={15} strokeWidth={1.9}/> 聽此法
            </Link>
            <Link href="/search" className="workspace-secondary-action">
              <Search size={15} strokeWidth={1.9}/> 搜尋
            </Link>
          </>
        }
      />

      <section className="card rounded-2xl p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-medium text-tertiary">{law.category}</div>
            <div className="mt-1 text-sm text-secondary">共 {law.totalArticles} 條 · 第一輪覆蓋 {progress.read} / {progress.total}</div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary">{progress.percentage}%</span>
            <span className="text-xs text-tertiary">completed</span>
          </div>
        </div>
        <div className="mt-4 h-1.5 rounded-full progress-track overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${progress.percentage}%`, background: 'var(--primary)' }}/>
        </div>
      </section>

      <div className="space-y-3">
        {chapters.map(chapter => {
          const list = allArticles.filter(article => {
            const articleNumber = Number.parseInt(article.articleNumber, 10);
            return Number.isFinite(articleNumber) && articleNumber >= chapter.startArticle && articleNumber <= chapter.endArticle;
          });
          if (!list.length) return null;
          const completed = list.filter(article => isArticleRead(id, article.articleNumber)).length;
          const chapterProgress = list.length ? Math.round((completed / list.length) * 100) : 0;

          return (
            <section key={chapter.id} className="card rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b flex items-center justify-between gap-4" style={{ borderColor: 'var(--border)' }}>
                <div>
                  <h2 className="text-sm font-semibold text-primary">{chapter.name}</h2>
                  <div className="text-xs text-tertiary mt-1">{completed} / {list.length} 已讀 · {chapterProgress}%</div>
                </div>
                <div className="w-24 h-1.5 progress-track rounded-full overflow-hidden shrink-0">
                  <div className="h-full rounded-full" style={{ width: `${chapterProgress}%`, background: 'var(--primary)' }}/>
                </div>
              </div>

              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {list.map(article => {
                  const read = isArticleRead(id, article.articleNumber);
                  return (
                    <Link key={article.articleNumber} href={`/articles/${id}-${article.articleNumber}`} className="group flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.025] transition-colors">
                      <span className="min-w-11 h-8 px-2 rounded-lg border flex items-center justify-center text-xs font-semibold shrink-0" style={{ borderColor: read ? 'color-mix(in srgb,var(--success) 45%,var(--border))' : 'var(--border)', color: read ? 'var(--success)' : 'var(--text-2)', background: 'var(--surface)' }}>
                        {article.articleNumber}
                      </span>
                      <p className="flex-1 min-w-0 text-sm line-clamp-1 text-secondary">{article.text}</p>
                      {read && <CheckCircle2 size={15} strokeWidth={1.9} style={{ color: 'var(--success)' }} className="shrink-0"/>}
                      <ChevronRight size={15} strokeWidth={1.9} className="text-tertiary shrink-0"/>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
