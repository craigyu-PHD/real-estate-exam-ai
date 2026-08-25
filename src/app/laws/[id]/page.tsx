'use client';
import Link from 'next/link';
import { ChevronLeft, FileText, CheckCircle2 } from 'lucide-react';
import { useProgress } from '@/hooks/useProgress';
import { lawsData } from '@/data/lawsData';
import { use } from 'react';

export default function LawDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { isLoaded, getProgress } = useProgress();
  
  const law = lawsData.find(l => l.id === resolvedParams.id);
  const prog = getProgress(resolvedParams.id);

  if (!law) return <div className="p-10 text-white text-center">找不到此法規</div>;
  if (!isLoaded) return <div className="p-10 text-slate-400 text-center">載入中...</div>;

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 relative z-10">
      <Link href="/laws" className="inline-flex items-center text-slate-400 hover:text-white transition-colors">
        <ChevronLeft size={20} className="mr-1" /> 回法規總覽
      </Link>

      <header className="bg-slate-900/80 backdrop-blur border border-slate-800 p-8 rounded-3xl">
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="text-xs font-semibold px-2 py-1 bg-blue-900/30 text-blue-400 rounded border border-blue-500/20 mb-3 inline-block">
              {law.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{law.name}</h1>
            <p className="text-slate-400">{law.description}</p>
          </div>
          <div className="text-right bg-slate-950 p-4 rounded-2xl border border-slate-800 hidden md:block">
            <div className="text-3xl font-bold text-white mb-1">{prog.percentage}%</div>
            <div className="text-slate-400 text-sm">總進度 {prog.read} / {prog.total}</div>
          </div>
        </div>
        
        {/* Mobile Progress */}
        <div className="md:hidden mt-4 pt-4 border-t border-slate-800">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">總進度</span>
            <span className="text-white font-medium">{prog.percentage}% ({prog.read}/{prog.total})</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${prog.percentage}%` }}></div>
          </div>
        </div>
      </header>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white mb-4 px-2">法規目錄</h2>
        {law.chapters.map((chapter) => (
          <div key={chapter.id} className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-colors group">
            <div className="p-4 bg-slate-800/30 border-b border-slate-800/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-200 group-hover:text-white transition-colors">{chapter.name}</h3>
              <span className="text-xs text-slate-500">共 {chapter.articlesCount} 條</span>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {Array.from({ length: chapter.articlesCount }).map((_, idx) => {
                  const articleNum = chapter.startArticle + idx;
                  return (
                    <Link 
                      key={articleNum}
                      href={`/articles/${law.id}-${articleNum}`}
                      className="aspect-square flex items-center justify-center rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all font-medium text-sm"
                    >
                      {articleNum}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
