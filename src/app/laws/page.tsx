import Link from 'next/link';
import { Scale, Book, Building2, Map, Calculator } from 'lucide-react';

const mockLaws = [
  { id: 'civil', name: '民法', progress: 42, read: 500, total: 1225, icon: Scale, color: 'text-blue-400' },
  { id: 'land', name: '土地法', progress: 37, read: 120, total: 324, icon: Map, color: 'text-emerald-400' },
  { id: 'tax', name: '土地相關稅法', progress: 22, read: 45, total: 200, icon: Calculator, color: 'text-yellow-400' },
  { id: 'broker', name: '不動產經紀相關法規', progress: 52, read: 80, total: 154, icon: Building2, color: 'text-purple-400' },
  { id: 'appraisal', name: '估價相關法規', progress: 18, read: 25, total: 139, icon: Book, color: 'text-orange-400' },
];

export default function LawsOverview() {
  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">法規學習</h1>
        <p className="text-slate-400">選擇你想學習的法規。</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockLaws.map((law) => (
          <div key={law.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-3 mb-6">
              <law.icon size={28} className={law.color} />
              <h2 className="text-2xl font-bold text-white">{law.name}</h2>
            </div>
            
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">目前進度 {law.progress}%</span>
                <span className="text-slate-400">已讀 {law.read} / {law.total}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3">
                <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${law.progress}%` }}></div>
              </div>
            </div>

            <div className="mt-auto pt-6 flex gap-3">
              <Link href={`/laws/${law.id}`} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2.5 rounded-lg transition-colors font-medium">
                繼續學習
              </Link>
              <Link href={`/laws/${law.id}/index`} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-center py-2.5 rounded-lg transition-colors font-medium">
                查看目錄
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
