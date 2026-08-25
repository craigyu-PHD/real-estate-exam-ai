import Link from 'next/link';
import { BrainCircuit, Clock, HelpCircle, Star, AlertTriangle } from 'lucide-react';

export default function ReviewCenter() {
  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      <header className="border-b border-slate-800 pb-6 flex items-center gap-4">
        <BrainCircuit size={32} className="text-emerald-500" />
        <div>
          <h1 className="text-3xl font-bold text-white">複習中心</h1>
          <p className="text-slate-400">間隔複習，幫助你把短期記憶轉化為長期記憶。</p>
        </div>
      </header>

      {/* 複習佇列狀態 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-2xl p-4 text-center">
          <p className="text-sm text-emerald-400 mb-1">今日待複習</p>
          <p className="text-3xl font-bold text-white">12 <span className="text-sm font-normal text-slate-400">條</span></p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
          <p className="text-sm text-slate-400 mb-1">明日預計</p>
          <p className="text-3xl font-bold text-white">18 <span className="text-sm font-normal text-slate-400">條</span></p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
          <p className="text-sm text-slate-400 mb-1">記憶穩定度</p>
          <p className="text-3xl font-bold text-white">74 <span className="text-sm font-normal text-slate-400">%</span></p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
          <p className="text-sm text-slate-400 mb-1">連續複習</p>
          <p className="text-3xl font-bold text-white">6 <span className="text-sm font-normal text-slate-400">天</span></p>
        </div>
      </div>

      <div className="mt-8">
        <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-emerald-900/50 flex justify-center items-center gap-2">
          <Clock size={20} /> 開始今日複習 (約 10 分鐘)
        </button>
      </div>

      <h2 className="text-xl font-bold text-white mt-12 mb-6">特定狀態篩選</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/bookmarks?type=important" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-yellow-500/50 transition-colors">
          <Star size={24} className="text-yellow-400 mb-3" />
          <h3 className="text-lg font-semibold text-white">我標記的「重要」</h3>
          <p className="text-slate-400 mt-2">共 42 條</p>
        </Link>
        <Link href="/bookmarks?type=confusing" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-orange-500/50 transition-colors">
          <HelpCircle size={24} className="text-orange-400 mb-3" />
          <h3 className="text-lg font-semibold text-white">我標記的「不懂」</h3>
          <p className="text-slate-400 mt-2">共 15 條</p>
        </Link>
        <Link href="/bookmarks?type=memorize" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-rose-500/50 transition-colors">
          <AlertTriangle size={24} className="text-rose-500 mb-3" />
          <h3 className="text-lg font-semibold text-white">我標記的「必背」</h3>
          <p className="text-slate-400 mt-2">共 28 條</p>
        </Link>
      </div>
    </div>
  );
}
