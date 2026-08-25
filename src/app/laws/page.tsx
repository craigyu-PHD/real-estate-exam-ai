'use client';
import Link from 'next/link';
import { BookOpen, CheckCircle2 } from 'lucide-react';
import { useProgress } from '@/hooks/useProgress';
import { lawsData } from '@/data/lawsData';

export default function LawsIndex() {
  const { isLoaded, getProgress } = useProgress();

  if (!isLoaded) return <div className="p-10 text-center text-slate-400">載入中...</div>;

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 relative z-10">
      <header className="border-b border-slate-800 pb-6 flex items-center gap-4">
        <BookOpen size={32} className="text-blue-500" />
        <div>
          <h1 className="text-3xl font-bold text-white">法規學習</h1>
          <p className="text-slate-400">所有不動產經紀人必考法規都在這裡。</p>
        </div>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lawsData.map((law) => {
          const { read, total, percentage } = getProgress(law.id);
          const isCompleted = percentage === 100;

          return (
            <Link 
              key={law.id} 
              href={`/laws/${law.id}`}
              className="group bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-6 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-semibold px-2 py-1 bg-slate-800 text-slate-400 rounded group-hover:bg-blue-900/30 group-hover:text-blue-400 transition-colors">
                    {law.category}
                  </span>
                  {isCompleted && <CheckCircle2 className="text-emerald-500" size={20} />}
                </div>
                <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  {law.name}
                </h2>
                <p className="text-slate-400 text-sm mb-6">{law.description}</p>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">進度</span>
                  <span className="text-slate-300 font-medium">{read} / {total}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-2 rounded-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
