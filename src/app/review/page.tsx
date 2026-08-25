'use client';
import { RefreshCcw, Check, X, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useReview } from '@/hooks/useReview';
import { getArticleDetail } from '@/data/articleExplanations';
import Link from 'next/link';

export default function Review() {
  const { isLoaded: bLoaded, getBookmarksByType } = useBookmarks();
  const { isLoaded: rLoaded, queue, grade } = useReview();
  const [idx, setIdx] = useState(0);

  const isLoaded = bLoaded && rLoaded;
  const confusing = getBookmarksByType('confusing');
  // Build review list: combine queue + any confusing not yet in queue
  const reviewList = [...queue];
  for (const b of confusing) {
    if (!reviewList.find(x=>x.lawId===b.lawId && x.articleId===b.articleId)) {
      reviewList.push({ lawId: b.lawId, articleId: b.articleId, dueDate: new Date().toISOString(), interval: 1, ease: 2.5 });
    }
  }

  if (!isLoaded) return <div className="p-10 text-center text-slate-400">載入中...</div>;

  if (reviewList.length === 0) {
    return (
      <div className="p-6 md:p-10 max-w-2xl mx-auto text-center mt-20 relative z-10">
        <div className="w-24 h-24 bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6"><Sparkles size={48} className="text-emerald-400" /></div>
        <h1 className="text-3xl font-bold text-white mb-4">今日複習已完成！</h1>
        <p className="text-slate-400 mb-8">去把生疏的法條標「我不懂」，系統會自動排入本頁。</p>
        <Link href="/laws" className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-8 py-3 rounded-xl inline-block">去學習</Link>
      </div>
    );
  }
  if (idx >= reviewList.length) {
    return (
      <div className="p-6 md:p-10 max-w-2xl mx-auto text-center mt-20 relative z-10">
        <div className="w-24 h-24 bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6"><Check size={48} className="text-emerald-400" /></div>
        <h1 className="text-3xl font-bold text-white mb-4">這批複習完了</h1>
        <button onClick={()=>setIdx(0)} className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl">再一次</button>
      </div>
    );
  }

  const cur = reviewList[idx];
  const detail = getArticleDetail(cur.lawId, cur.articleId);

  const handleGrade = (g: 'again'|'hard'|'good'|'easy') => {
    grade(cur.lawId, cur.articleId, g);
    setIdx(i=>i+1);
  };

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-6 relative z-10 flex flex-col min-h-screen">
      <header className="flex justify-between items-center pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3"><RefreshCcw size={24} className="text-emerald-400" /><h1 className="text-xl font-bold text-white">間隔複習</h1><span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-full">SM2 演算法</span></div>
        <span className="text-slate-400 text-sm">{idx+1}/{reviewList.length}</span>
      </header>

      <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-3xl p-8 md:p-10 flex flex-col justify-center">
        <div className="flex gap-2 mb-4">
          <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-full">{cur.lawId}</span>
          <span className="text-xs bg-orange-900/30 text-orange-300 border border-orange-500/20 px-2 py-1 rounded-full">間隔 {cur.interval} 天 · Ease {cur.ease.toFixed(1)}</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">第 {cur.articleId} 條</h2>
        <p className="text-lg text-slate-200 mb-4">{detail?.oneLiner}</p>
        <p className="text-sm text-slate-400 line-clamp-3">{detail?.articleText.slice(0,120)}…</p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <button onClick={()=>handleGrade('again')} className="bg-rose-900/30 hover:bg-rose-900/50 border border-rose-500/30 text-rose-300 py-4 rounded-2xl text-sm font-bold flex flex-col items-center gap-1"><X size={20}/> 完全忘記<br/><span className="text-xs font-normal">1天後</span></button>
        <button onClick={()=>handleGrade('hard')} className="bg-orange-900/30 hover:bg-orange-900/50 border border-orange-500/30 text-orange-300 py-4 rounded-2xl text-sm font-bold">困難<br/><span className="text-xs font-normal">稍後</span></button>
        <button onClick={()=>handleGrade('good')} className="bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 py-4 rounded-2xl text-sm font-bold">想起來<br/><span className="text-xs font-normal">{Math.round(cur.interval*cur.ease)}天</span></button>
        <button onClick={()=>handleGrade('easy')} className="bg-blue-900/30 hover:bg-blue-900/50 border border-blue-500/30 text-blue-300 py-4 rounded-2xl text-sm font-bold">很熟<br/><span className="text-xs font-normal">延長</span></button>
      </div>
      <Link href={`/articles/${cur.lawId}-${cur.articleId}`} className="text-center text-slate-500 hover:text-white text-sm underline">查看完整解析</Link>
    </div>
  );
}
