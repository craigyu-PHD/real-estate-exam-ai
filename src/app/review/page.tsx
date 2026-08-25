'use client';
import { RefreshCcw, Check, X, Sparkles, Target, Zap } from 'lucide-react';
import { useState } from 'react';
import { useBookmarks } from '@/hooks/useBookmarks';
import Link from 'next/link';

export default function Review() {
  const { isLoaded, getBookmarksByType } = useBookmarks();
  const [currentIdx, setCurrentIdx] = useState(0);

  const reviewQueue = getBookmarksByType('confusing');

  if (!isLoaded) return <div className="p-10 text-center text-slate-400">載入中...</div>;

  if (reviewQueue.length === 0) {
    return (
      <div className="p-6 md:p-10 max-w-2xl mx-auto text-center mt-20 relative z-10">
        <div className="w-24 h-24 bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles size={48} className="text-emerald-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">今日複習已完成！</h1>
        <p className="text-slate-400 mb-8 text-lg">您已經沒有被標記為「我不懂」的法條了，真是太棒了！</p>
        <Link href="/laws" className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-8 py-3 rounded-xl transition-colors inline-block">
          去學習新法規
        </Link>
      </div>
    );
  }

  if (currentIdx >= reviewQueue.length) {
    return (
      <div className="p-6 md:p-10 max-w-2xl mx-auto text-center mt-20 relative z-10">
        <div className="w-24 h-24 bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check size={48} className="text-emerald-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">這批法條複習完了</h1>
        <p className="text-slate-400 mb-8 text-lg">大腦已經重新鞏固了這些記憶。</p>
        <button onClick={() => setCurrentIdx(0)} className="bg-slate-800 hover:bg-slate-700 text-white font-medium px-8 py-3 rounded-xl transition-colors">
          再複習一次
        </button>
      </div>
    );
  }

  const currentItem = reviewQueue[currentIdx];

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-8 relative z-10 flex flex-col min-h-screen">
      <header className="flex justify-between items-center pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <RefreshCcw size={28} className="text-emerald-400" />
          <h1 className="text-2xl font-bold text-white">間隔複習</h1>
        </div>
        <div className="text-slate-400 text-sm font-medium">
          進度 {currentIdx + 1} / {reviewQueue.length}
        </div>
      </header>

      <div className="flex-1 flex flex-col">
        {/* 卡片區 */}
        <div className="flex-1 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl flex flex-col justify-center relative">
          <div className="absolute top-6 left-6 flex gap-2">
            <span className="text-xs font-semibold px-2 py-1 bg-slate-800 text-slate-400 rounded">民法</span>
            <span className="text-xs font-semibold px-2 py-1 bg-orange-900/30 text-orange-400 border border-orange-500/20 rounded">我不懂</span>
          </div>

          <div className="text-center mt-6">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-wide">第 {currentItem.articleId} 條</h2>
            <p className="text-xl md:text-2xl text-slate-300 leading-relaxed font-serif">
              請試著回想這條法規的核心重點是什麼？
            </p>
          </div>
        </div>

        {/* 底部操作區 */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          <button 
            onClick={() => setCurrentIdx(i => i + 1)}
            className="bg-rose-900/30 hover:bg-rose-900/50 border border-rose-500/30 text-rose-400 py-6 rounded-2xl text-lg font-bold transition-colors flex flex-col items-center gap-2"
          >
            <X size={28} /> 還是想不起來
          </button>
          <button 
            onClick={() => setCurrentIdx(i => i + 1)}
            className="bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-400 py-6 rounded-2xl text-lg font-bold transition-colors flex flex-col items-center gap-2"
          >
            <Check size={28} /> 想起來了！
          </button>
        </div>
        <div className="mt-4 text-center">
          <Link href={`/articles/${currentItem.lawId}-${currentItem.articleId}`} className="text-slate-500 hover:text-white underline transition-colors">
            偷看答案（前往法條）
          </Link>
        </div>
      </div>
    </div>
  );
}
