'use client';
import Link from 'next/link';
import { Star, Flag, HelpCircle, AlertTriangle, PenLine, Bookmark as BookmarkIcon } from 'lucide-react';
import { useBookmarks, BookmarkType } from '@/hooks/useBookmarks';
import { lawsData } from '@/data/lawsData';
import { useState } from 'react';

export default function Bookmarks() {
  const { isLoaded, getBookmarksByType } = useBookmarks();
  const [currentFilter, setCurrentFilter] = useState<BookmarkType | 'all'>('all');

  const bookmarks = getBookmarksByType(currentFilter);

  const getTypeStyle = (type: BookmarkType) => {
    switch (type) {
      case 'important': return { icon: <Star size={12} />, bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20', label: '很重要' };
      case 'confusing': return { icon: <HelpCircle size={12} />, bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', label: '我不懂' };
      case 'memorize': return { icon: <AlertTriangle size={12} />, bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', label: '必背' };
      case 'note': return { icon: <PenLine size={12} />, bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', label: '筆記' };
    }
  };

  const tabs: { type: BookmarkType | 'all', label: string }[] = [
    { type: 'all', label: '全部' },
    { type: 'important', label: '很重要' },
    { type: 'confusing', label: '我不懂' },
    { type: 'memorize', label: '必背' },
    { type: 'note', label: '筆記' },
  ];

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 relative z-10">
      <header className="border-b border-slate-800 pb-6 flex items-center gap-4">
        <Star size={32} className="text-yellow-400" />
        <div>
          <h1 className="text-3xl font-bold text-white">我的重點</h1>
          <p className="text-slate-400">管理您標記的所有法條與筆記。</p>
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => (
          <button 
            key={tab.type} 
            onClick={() => setCurrentFilter(tab.type)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors text-sm font-medium ${currentFilter === tab.type ? 'bg-blue-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-4 mt-6">
        {!isLoaded ? (
          <div className="text-slate-500 text-center py-10">載入中...</div>
        ) : bookmarks.length === 0 ? (
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-10 text-center">
            <BookmarkIcon size={48} className="mx-auto text-slate-700 mb-4" />
            <p className="text-slate-400 text-lg">您目前還沒有標記任何重點。</p>
            <p className="text-slate-500 text-sm mt-2">在閱讀法規時，點擊星星或標記按鈕即可收藏到這裡。</p>
          </div>
        ) : (
          bookmarks.map((bookmark) => {
            const lawName = lawsData.find(l => l.id === bookmark.lawId)?.name || bookmark.lawId;
            const style = getTypeStyle(bookmark.type);
            
            return (
              <div key={bookmark.id} className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold px-2 py-1 bg-slate-800 text-slate-400 rounded">{lawName}</span>
                    <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded border ${style.bg} ${style.text} ${style.border}`}>
                      {style.icon} {style.label}
                    </span>
                  </div>
                  <Link href={`/articles/${bookmark.lawId}-${bookmark.articleId}`} className="text-lg font-bold text-white hover:text-blue-400 transition-colors">
                    第 {bookmark.articleId} 條
                  </Link>
                  {bookmark.note && (
                    <div className="mt-3 bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                      <p className="text-slate-300 text-sm">{bookmark.note}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

