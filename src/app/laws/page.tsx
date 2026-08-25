'use client';
import Link from 'next/link';
import { Book, ChevronRight } from 'lucide-react';
import { useProgress } from '@/hooks/useProgress';

export default function LawsOverview() {
  const { isLoaded, getProgress } = useProgress();

  const laws = [
    { id: 'civil', name: '民法', description: '包含總則、債編、物權編、親屬編與繼承編' },
    { id: 'land', name: '土地法', description: '包含土地法、平均地權條例、土地徵收條例等' },
    { id: 'tax', name: '土地相關稅法', description: '土地稅法、房屋稅條例、契稅條例等' },
    { id: 'broker', name: '不動產經紀相關法規', description: '不動產經紀業管理條例、消費者保護法等' },
    { id: 'appraisal', name: '估價相關法規', description: '不動產估價技術規則' }
  ];

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 relative z-10">
      <header className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-bold text-white mb-2">法規總覽</h1>
        <p className="text-slate-400">不動產經紀人考試核心法規地圖</p>
      </header>

      <div className="grid gap-6">
        {laws.map((law) => {
          const prog = getProgress(law.id);
          
          return (
            <div key={law.id} className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-6 hover:border-blue-500/50 transition-colors flex flex-col md:flex-row gap-6 items-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-900/30 text-blue-400 flex items-center justify-center shrink-0">
                <Book size={32} />
              </div>
              <div className="flex-1 w-full text-center md:text-left">
                <h2 className="text-2xl font-bold text-white mb-2">{law.name}</h2>
                <p className="text-slate-400 text-sm mb-4">{law.description}</p>
                <div className="flex items-center gap-3">
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-1000" 
                      style={{ width: `${isLoaded ? prog.percentage : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-slate-300 w-12 text-right">{isLoaded ? prog.percentage : 0}%</span>
                </div>
              </div>
              <div className="w-full md:w-auto shrink-0 mt-4 md:mt-0">
                <Link href={`/laws/${law.id}`} className="w-full inline-flex items-center justify-center bg-slate-800 hover:bg-blue-600 text-white px-6 py-3 rounded-xl transition-colors font-medium">
                  查看目錄 <ChevronRight size={18} className="ml-1" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
