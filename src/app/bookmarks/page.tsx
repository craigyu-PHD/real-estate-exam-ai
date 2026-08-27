'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowRight, Bookmark as BookmarkIcon, HelpCircle, PenLine, Star } from 'lucide-react';
import { WorkspacePageHeader } from '@/components/WorkspacePageHeader';
import { useBookmarks, type BookmarkType } from '@/hooks/useBookmarks';
import { lawsData } from '@/data/lawsData';
import { useState } from 'react';

const tabs: { type: BookmarkType | 'all'; label: string; icon: typeof BookmarkIcon }[] = [
  { type: 'all', label: '全部', icon: BookmarkIcon },
  { type: 'important', label: '重要', icon: Star },
  { type: 'confusing', label: '不懂', icon: HelpCircle },
  { type: 'memorize', label: '必背', icon: AlertTriangle },
  { type: 'note', label: '筆記', icon: PenLine },
];

export default function Bookmarks() {
  const { isLoaded, getBookmarksByType } = useBookmarks();
  const [currentFilter, setCurrentFilter] = useState<BookmarkType | 'all'>('all');
  const bookmarks = getBookmarksByType(currentFilter);

  const getMeta = (type: BookmarkType) => {
    if (type === 'important') return { icon: Star, label: '重要' };
    if (type === 'confusing') return { icon: HelpCircle, label: '不懂' };
    if (type === 'memorize') return { icon: AlertTriangle, label: '必背' };
    return { icon: PenLine, label: '筆記' };
  };

  return (
    <div className="page-shell max-w-5xl space-y-5">
      <WorkspacePageHeader eyebrow="KNOWLEDGE LIBRARY" title="我的重點" description="把重要、不懂、必背與個人筆記集中成同一套 Knowledge Library。"/>

      <div className="flex gap-1 overflow-x-auto border-b" style={{ borderColor: 'var(--border)' }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          const active = currentFilter === tab.type;
          return (
            <button key={tab.type} type="button" aria-pressed={active} onClick={() => setCurrentFilter(tab.type)} className={`min-h-11 px-3 flex items-center gap-2 text-xs font-medium border-b-2 whitespace-nowrap ${active ? 'text-primary' : 'text-tertiary'}`} style={{ borderColor: active ? 'var(--primary)' : 'transparent' }}>
              <Icon size={14} strokeWidth={1.9}/>{tab.label}
            </button>
          );
        })}
      </div>

      {!isLoaded ? (
        <div className="p-10 text-center text-tertiary">載入中…</div>
      ) : bookmarks.length === 0 ? (
        <section className="card rounded-2xl p-7 md:p-8">
          <BookmarkIcon size={24} strokeWidth={1.9} className="text-tertiary"/>
          <h2 className="text-lg font-semibold mt-4 text-primary">這個分類目前是空的</h2>
          <p className="text-sm leading-6 mt-2 text-secondary">在法條頁標記「重要／不懂／必背」或加入筆記後，內容會自動出現在這裡。</p>
          <Link href="/laws" className="workspace-secondary-action mt-5">回學習中心</Link>
        </section>
      ) : (
        <section className="card rounded-2xl overflow-hidden divide-y" style={{ borderColor: 'var(--border)' }}>
          {bookmarks.map(bookmark => {
            const lawName = lawsData.find(law => law.id === bookmark.lawId)?.name || bookmark.lawId;
            const meta = getMeta(bookmark.type);
            const MetaIcon = meta.icon;
            return (
              <Link key={`${bookmark.id}-${bookmark.type}`} href={`/articles/${bookmark.lawId}-${bookmark.articleId}`} className="knowledge-row group">
                <div className="w-9 h-9 rounded-lg surface flex items-center justify-center shrink-0"><MetaIcon size={15} strokeWidth={1.9} style={{ color: 'var(--primary)' }}/></div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-tertiary"><span>{lawName}</span><span>{meta.label}</span></div>
                  <div className="text-base font-semibold mt-1 text-primary">第 {bookmark.articleId} 條</div>
                  {bookmark.note && <p className="text-sm leading-6 mt-2 text-secondary line-clamp-2">{bookmark.note}</p>}
                </div>
                <ArrowRight size={15} strokeWidth={1.9} className="text-tertiary shrink-0 group-hover:translate-x-0.5 transition-transform"/>
              </Link>
            );
          })}
        </section>
      )}
    </div>
  );
}
