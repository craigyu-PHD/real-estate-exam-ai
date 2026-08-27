'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  Bookmark,
  BookText,
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flag,
  GraduationCap,
  Headphones,
  HelpCircle,
  Landmark,
  Lightbulb,
  MessageCircleQuestion,
  Scale,
  Trophy,
  Zap,
} from 'lucide-react';
import { AudioPlayer } from '@/components/AudioPlayer';
import { ChatGPTButton } from '@/components/ChatGPTButton';
import { ArticleTeacherDrawer } from '@/components/ArticleTeacherDrawer';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useProgress } from '@/hooks/useProgress';
import type { ArticleDetailData } from '@/data/articleDetailTypes';
import { lawsData } from '@/data/lawsData';
import { generatedArticles } from '@/data/generatedArticles';

export function ArticleDetailClient({ rawId, detail }: { rawId: string; detail: ArticleDetailData }) {
  const { markAsRead, unmarkAsRead, isArticleRead, getGamificationStats } = useProgress();
  const { hasBookmark, toggleBookmark } = useBookmarks();
  const [showToast, setShowToast] = useState<string | null>(null);
  const [showReward, setShowReward] = useState(false);
  const [teacherOpen, setTeacherOpen] = useState(false);

  const idParts = rawId.split('-');
  const lawId = idParts[0] || 'civil';
  const articleId = idParts.slice(1).join('-') || rawId;
  const lawName = lawsData.find(law => law.id === lawId)?.name || lawId;
  const game = getGamificationStats();
  const articles = generatedArticles[lawId] || [];
  const currentIndex = articles.findIndex(article => article.articleNumber === articleId);
  const prevArticle = currentIndex > 0 ? articles[currentIndex - 1] : null;
  const nextArticle = currentIndex >= 0 && currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null;
  const prevId = prevArticle ? `${lawId}-${prevArticle.articleNumber}` : null;
  const nextId = nextArticle ? `${lawId}-${nextArticle.articleNumber}` : null;
  const nearbyArticles = currentIndex >= 0 ? articles.slice(Math.max(0, currentIndex - 2), Math.min(articles.length, currentIndex + 3)) : [];
  const isMarked = isArticleRead(lawId, articleId);

  const handleMarkAsRead = () => {
    if (isMarked) {
      unmarkAsRead(lawId, articleId);
      setShowToast('已取消完成標記');
    } else {
      markAsRead(lawId, articleId);
      setShowReward(true);
      setShowToast('完成一條 · +12 XP');
      setTimeout(() => setShowReward(false), 900);
    }
    setTimeout(() => setShowToast(null), 1800);
  };

  const isImportant = hasBookmark(lawId, articleId, 'important');
  const isMemorize = hasBookmark(lawId, articleId, 'memorize');
  const isConfusing = hasBookmark(lawId, articleId, 'confusing');
  const lectureText = `${lawName}第${articleId}條。先聽法條原文。${detail.articleText}。接著老師用白話拆解：${detail.explanation}。為什麼這樣規定：${detail.why}。實務案例：${detail.cases.map(item => item.content).join(' ')}。考試提醒：${detail.examTips.join(' ')}`;
  const lawProgress = currentIndex >= 0 && articles.length > 0 ? Math.round(((currentIndex + 1) / articles.length) * 100) : 0;
  const cleanCaseTitle = (title: string) => title.replace(/^[\u2600-\u27BF\u{1F300}-\u{1FAFF}\uFE0F\u200D\s]+/u, '');

  const bookmarkButtons = (
    <div className="grid grid-cols-3 gap-2">
      <button type="button" onClick={() => toggleBookmark(lawId, articleId, 'important')} className={`reader-tool-button ${isImportant ? 'reader-tool-active' : ''}`} title="重要" aria-pressed={isImportant}>
        <Bookmark size={15} strokeWidth={1.9}/><span>重要</span>
      </button>
      <button type="button" onClick={() => toggleBookmark(lawId, articleId, 'memorize')} className={`reader-tool-button ${isMemorize ? 'reader-tool-active' : ''}`} title="必背" aria-pressed={isMemorize}>
        <BookText size={15} strokeWidth={1.9}/><span>必背</span>
      </button>
      <button type="button" onClick={() => toggleBookmark(lawId, articleId, 'confusing')} className={`reader-tool-button ${isConfusing ? 'reader-tool-active' : ''}`} title="不懂" aria-pressed={isConfusing}>
        <HelpCircle size={15} strokeWidth={1.9}/><span>不懂</span>
      </button>
    </div>
  );

  return (
    <div className="max-w-[1240px] mx-auto pb-44 md:pb-28 relative z-10">
      <div className="sticky top-0 z-30 border-b px-4 md:px-6 py-3 flex items-center justify-between gap-4" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
        <div className="flex items-center gap-2 min-w-0">
          <Link href={`/laws/${lawId}`} className="icon-button shrink-0" aria-label="回法規目錄"><ArrowLeft size={16} strokeWidth={1.9}/></Link>
          <div className="min-w-0">
            <div className="text-xs font-medium tracking-[0.1em] text-tertiary">ARTICLE READER</div>
            <h1 className="text-sm font-semibold truncate text-primary">{lawName} · 第 {articleId} 條</h1>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-xs text-tertiary shrink-0">
          <span>{currentIndex >= 0 ? `${currentIndex + 1} / ${articles.length}` : `第 ${articleId} 條`}</span>
          <span>{lawProgress}%</span>
        </div>
      </div>

      <div className="grid xl:grid-cols-[180px_minmax(0,780px)_220px] gap-5 px-4 md:px-6 pt-6 items-start justify-center">
        <aside className="hidden xl:block sticky top-20">
          <div className="surface rounded-xl p-3">
            <div className="text-xs font-medium tracking-[0.1em] text-tertiary">ARTICLE NAV</div>
            <div className="mt-2 text-sm font-semibold text-primary line-clamp-2">{lawName}</div>
            <div className="mt-3 h-1.5 rounded-full progress-track overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${lawProgress}%`, background: 'var(--primary)' }}/>
            </div>
            <div className="mt-4 space-y-1">
              {nearbyArticles.map(article => {
                const active = article.articleNumber === articleId;
                return (
                  <Link key={article.articleNumber} href={`/articles/${lawId}-${article.articleNumber}`} className={`reader-nav-row ${active ? 'reader-nav-active' : ''}`}>
                    <span>第 {article.articleNumber} 條</span>
                    {isArticleRead(lawId, article.articleNumber) && <CheckCircle2 size={13} strokeWidth={1.9}/>}
                  </Link>
                );
              })}
            </div>
            <Link href={`/laws/${lawId}`} className="mt-3 block text-xs font-medium text-tertiary hover:text-primary">查看完整目錄</Link>
          </div>
        </aside>

        <article className="min-w-0 space-y-5">
          <section className="border-b pb-5" style={{ borderColor: 'var(--border)' }}>
            <div className="flex flex-wrap items-center gap-2 text-xs text-tertiary">
              <span>第一輪閱讀</span>
              <span>·</span>
              <span>{detail.importance >= 4 ? '高頻條文' : '一般條文'}</span>
              <span>·</span>
              <span>進度 {lawProgress}%</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {detail.keywords.slice(0, 6).map(keyword => <span key={keyword} className="reader-keyword">#{keyword}</span>)}
            </div>
            <div className="xl:hidden mt-4">{bookmarkButtons}</div>
          </section>

          <section className="surface rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}><Headphones size={17} strokeWidth={1.9}/></span>
              <div>
                <div className="text-sm font-semibold text-primary">Mini Lecture</div>
                <div className="text-xs mt-1 text-tertiary">原文 → 白話解析 → 制度目的 → 案例 → 考點</div>
              </div>
            </div>
            <AudioPlayer text={lectureText} articleRef={{ lawId, articleId }}/>
          </section>

          <section className="reader-section">
            <div className="reader-section-label"><BookText size={15} strokeWidth={1.9}/><span>A. 官方法條原文</span><span className="reader-meta">不由 AI 改寫</span></div>
            <div className="reader-law-text">{detail.articleText}</div>
            <div className="mt-3 text-xs text-tertiary flex items-center gap-1.5"><Scale size={13} strokeWidth={1.9}/> 正式文字來自本地法規資料，AI 僅處理教學層。</div>
          </section>

          <section className="reader-ai-panel rounded-xl p-5">
            <div className="reader-section-label"><MessageCircleQuestion size={15} strokeWidth={1.9}/><span>B. AI 白話解讀</span><span className="reader-meta">逐條教材</span></div>
            <p className="mt-3 leading-7 text-[15px] text-primary whitespace-pre-line">{detail.explanation}</p>
          </section>

          <section className="grid md:grid-cols-2 gap-4">
            <div className="reader-section rounded-xl border p-5" style={{ borderColor: 'var(--border)' }}>
              <div className="reader-section-label"><Landmark size={15} strokeWidth={1.9}/><span>C. 制度目的</span><span className="reader-meta">WHY</span></div>
              <p className="mt-3 text-sm leading-7 text-secondary whitespace-pre-line">{detail.why}</p>
              <div className="mt-4 pt-3 border-t text-xs text-tertiary flex items-center gap-1.5" style={{ borderColor: 'var(--border)' }}><Lightbulb size={13} strokeWidth={1.9}/> 先理解制度問題，再記條文文字。</div>
            </div>

            <div className="reader-section rounded-xl border p-5" style={{ borderColor: 'var(--border)' }}>
              <div className="reader-section-label"><BriefcaseBusiness size={15} strokeWidth={1.9}/><span>D. 實務案例</span><span className="reader-meta">CASE</span></div>
              <div className="mt-3 space-y-4">
                {detail.cases.map((item, index) => (
                  <div key={index} className={index ? 'pt-4 border-t' : ''} style={index ? { borderColor: 'var(--border)' } : undefined}>
                    <div className="text-sm font-semibold text-primary flex items-center gap-1.5"><GraduationCap size={14} strokeWidth={1.9}/>{cleanCaseTitle(item.title)}</div>
                    <p className="text-sm mt-2 leading-7 text-secondary whitespace-pre-line">{item.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid md:grid-cols-2 gap-4">
            <div className="reader-semantic-panel rounded-xl p-4">
              <div className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--danger)' }}><AlertTriangle size={15} strokeWidth={1.9}/> 容易誤會</div>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-secondary">
                {detail.pitfalls.map((item, index) => <li key={index} className="flex gap-2"><span style={{ color: 'var(--danger)' }}>•</span><span>{item}</span></li>)}
              </ul>
            </div>
            <div className="reader-semantic-panel rounded-xl p-4">
              <div className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--warning)' }}><Flag size={15} strokeWidth={1.9}/> 國考考點</div>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-secondary">
                {detail.examTips.map((item, index) => <li key={index} className="flex gap-2"><span style={{ color: 'var(--warning)' }}>•</span><span>{item}</span></li>)}
              </ul>
            </div>
          </section>

          <section className="card rounded-xl p-5">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium tracking-[0.1em] text-tertiary">COMPLETE ARTICLE</div>
                <h2 className="text-base font-semibold mt-1 text-primary">{isMarked ? '這一條已完成，可以往下一條。' : '理解到可辨識考點，就先完成這一條。'}</h2>
                <div className="mt-2 flex gap-3 text-xs text-tertiary"><span>LV.{game.level}</span><span className="inline-flex items-center gap-1"><Zap size={12} strokeWidth={1.9}/> +12 XP</span></div>
              </div>
              <div className="flex flex-col gap-2 md:min-w-56">
                <button type="button" onClick={handleMarkAsRead} className="workspace-primary-action w-full">
                  <CheckCircle2 size={15} strokeWidth={1.9}/>{isMarked ? '已完成 · 點擊取消' : '完成這一條'}
                </button>
                <ChatGPTButton article={`${lawName}第 ${articleId} 條`} text={`${detail.articleText}\n\n白話解析：${detail.explanation}`}/>
              </div>
            </div>
          </section>
        </article>

        <aside className="hidden xl:block sticky top-20 space-y-3">
          <section className="surface rounded-xl p-3">
            <div className="text-xs font-medium tracking-[0.1em] text-tertiary">READER TOOLS</div>
            <div className="mt-3">{bookmarkButtons}</div>
          </section>
          <section className="reader-ai-panel rounded-xl p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary"><Bot size={16} strokeWidth={1.9} style={{ color: 'var(--primary)' }}/> AI 老師</div>
            <p className="mt-2 text-xs leading-5 text-secondary">已帶入本條原文與教學內容，可直接追問概念、差異、案例與考點。</p>
            <button type="button" onClick={() => setTeacherOpen(true)} className="workspace-secondary-action w-full mt-3"><Bot size={14} strokeWidth={1.9}/> 開啟 AI 對話</button>
          </section>
        </aside>
      </div>

      <footer className="reader-footer fixed left-0 md:left-[248px] right-0 border-t px-3 py-2.5 flex items-center justify-between z-30" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
        {prevId ? <Link href={`/articles/${prevId}`} className="workspace-secondary-action"><ChevronLeft size={15} strokeWidth={1.9}/> 上一條</Link> : <span className="text-sm text-tertiary px-2">已是首條</span>}
        <Link href={`/laws/${lawId}`} className="text-sm font-medium text-tertiary hover:text-primary">回目錄</Link>
        {nextId ? <Link href={`/articles/${nextId}`} className="workspace-primary-action">下一條 <ChevronRight size={15} strokeWidth={1.9}/></Link> : <span className="text-sm text-tertiary px-2">已是末條</span>}
      </footer>

      <ArticleTeacherDrawer open={teacherOpen} onClose={() => setTeacherOpen(false)} lawName={lawName} articleId={articleId} detail={detail}/>
      {showToast && <div className="fixed bottom-20 left-1/2 -translate-x-1/2 card text-sm font-semibold px-4 py-2 rounded-full z-40 text-primary">{showToast}</div>}
      {showReward && <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 reward-burst pointer-events-none"><div className="card font-semibold px-4 py-2.5 rounded-full flex items-center gap-2 text-primary"><Trophy size={15} strokeWidth={1.9} style={{ color: 'var(--warning)' }}/> +12 XP · 過關</div></div>}
    </div>
  );
}
