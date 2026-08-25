'use client';
import Link from 'next/link';
import { ChevronLeft, CheckCircle2, Play, Headphones, Search } from 'lucide-react';
import { useProgress } from '@/hooks/useProgress';
import { lawsData } from '@/data/lawsData';
import { generatedArticles } from '@/data/generatedArticles';
import { use } from 'react';

export default function LawDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isLoaded, getProgress, isArticleRead } = useProgress() as any;
  const law = lawsData.find(l => l.id === id);
  const prog = getProgress(id);
  if (!law) return <div className="p-10 text-center">找不到此法規</div>;
  if (!isLoaded) return <div className="p-10 text-center text-slate-500">載入中...</div>;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <Link href="/laws" className="inline-flex items-center gap-1 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600"><ChevronLeft size={16}/> 回學習中心</Link>

      <header className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <span className="text-xs font-bold px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 rounded-full">{law.category}</span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-2">{law.name}</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{law.description}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-center min-w-[140px]">
            <div className="text-2xl font-black text-slate-900 dark:text-white">{prog.percentage}%</div>
            <div className="text-xs text-slate-500">{prog.read} / {prog.total}</div>
            <div className="mt-2 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-1.5 bg-indigo-600 rounded-full" style={{width:`${prog.percentage}%`}}/></div>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Link href={`/listen?law=${law.id}`} className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-2 rounded-xl text-xs font-black"><Headphones size={14}/> 聽此法</Link>
          <Link href="/search" className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-xs font-bold"><Search size={14}/> 搜條文</Link>
        </div>
      </header>

      <div className="space-y-5">
        {law.chapters.map((ch) => {
          const arts = generatedArticles[law.id]?.filter(a=> {
            const n = parseInt(a.articleNumber,10);
            return !isNaN(n) && n >= ch.startArticle && n <= ch.endArticle;
          }) || [];
          const list = arts.length ? arts : Array.from({length: ch.articlesCount}, (_,i)=> ({ articleNumber: String(ch.startArticle+i), text: `第 ${ch.startArticle+i} 條` }));
          return (
            <section key={ch.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-black text-slate-900 dark:text-white text-sm">{ch.name}</h3>
                <span className="text-xs text-slate-500 font-bold">共 {list.length} 條</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {list.map((a:any)=>{
                  const read = isArticleRead ? isArticleRead(law.id, a.articleNumber) : false;
                  return (
                    <Link key={a.articleNumber} href={`/articles/${law.id}-${a.articleNumber}`} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black border ${read ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>{a.articleNumber}</span>
                      <span className="flex-1 text-sm text-slate-700 dark:text-slate-300 line-clamp-1">{a.text.slice(0,60)}</span>
                      <span className={`text-xs font-bold ${read ? 'text-emerald-600' : 'text-indigo-600'}`}>{read ? '已讀' : '學習'} →</span>
                      {read && <CheckCircle2 size={14} className="text-emerald-500"/>}
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
