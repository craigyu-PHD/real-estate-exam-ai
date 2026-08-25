'use client';
import Link from 'next/link';
import { BookOpen, CheckCircle2, Play, Headphones, Clock } from 'lucide-react';
import { useProgress } from '@/hooks/useProgress';
import { useBookmarks } from '@/hooks/useBookmarks';
import { lawsData } from '@/data/lawsData';

export default function LawsIndex() {
  const { isLoaded, getProgress } = useProgress();
  const { getBookmarksByType } = useBookmarks();
  const due = getBookmarksByType('confusing').length;
  if (!isLoaded) return <div className="p-10 text-center text-slate-500">載入中...</div>;

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <header className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2"><BookOpen size={24} className="text-indigo-600"/> 學習中心</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">初次學習與二次複習一體，依「見過→理解→記住」推進。<span className="font-bold text-indigo-600">不灌水，單一進度。</span></p>
        </div>
        <div className="flex gap-2">
          <Link href="/review" className="inline-flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-black"><Clock size={16}/> 待複習 {due} 條</Link>
          <Link href="/listen" className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold"><Headphones size={16}/> 聽課連播</Link>
        </div>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {lawsData.map((law) => {
          const { read, total, percentage } = getProgress(law.id);
          const done = percentage === 100;
          return (
            <Link key={law.id} href={`/laws/${law.id}`} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-full">{law.category}</span>
                  {done && <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full"><CheckCircle2 size={14}/> 完成</span>}
                </div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-indigo-600">{law.name}</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{law.description}</p>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs font-bold mb-2"><span className="text-slate-500">進度</span><span className="text-slate-900 dark:text-white">{read} / {total} · {percentage}%</span></div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden"><div className={`h-2 rounded-full ${done ? 'bg-emerald-500' : 'bg-indigo-600'}`} style={{ width: `${percentage}%` }} /></div>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-indigo-600">{done ? '複習一下' : '繼續學習'} <Play size={12}/></span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
