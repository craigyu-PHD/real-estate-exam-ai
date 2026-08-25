import Link from 'next/link';
import { BookOpen, Target, RotateCcw, AlertTriangle, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">下午好，今天繼續建立法律地圖。</h1>
        <p className="text-slate-400">這是您的個人法規學習中心。</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 繼續上次學習 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg hover:border-blue-500/50 transition-colors">
          <div className="flex items-center gap-3 text-blue-400 mb-4">
            <BookOpen size={24} />
            <h2 className="text-xl font-semibold text-white">繼續上次學習</h2>
          </div>
          <div className="mb-6">
            <h3 className="text-lg font-medium text-slate-200">民法｜物權編</h3>
            <p className="text-slate-400">上次讀到：第 758 條</p>
          </div>
          <Link href="/articles/758" className="inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-colors">
            繼續學習 <ArrowRight size={18} className="ml-2" />
          </Link>
        </div>

        {/* 今天複習 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg hover:border-emerald-500/50 transition-colors">
          <div className="flex items-center gap-3 text-emerald-400 mb-4">
            <RotateCcw size={24} />
            <h2 className="text-xl font-semibold text-white">今天複習</h2>
          </div>
          <div className="mb-6">
            <p className="text-slate-300 text-lg">有 <span className="text-emerald-400 font-bold text-2xl mx-1">12</span> 條法規需要重新看一次。</p>
          </div>
          <Link href="/review" className="inline-flex items-center justify-center w-full bg-slate-800 hover:bg-slate-700 text-emerald-400 font-medium py-3 px-4 rounded-xl transition-colors">
            開始 10 分鐘複習
          </Link>
        </div>

        {/* 第一輪總進度 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg md:col-span-2">
          <div className="flex items-center gap-3 text-purple-400 mb-6">
            <Target size={24} />
            <h2 className="text-xl font-semibold text-white">第一輪總進度</h2>
            <span className="ml-auto text-2xl font-bold text-white">34%</span>
          </div>
          
          <div className="space-y-4">
            {[
              { name: '民法', progress: 41 },
              { name: '土地法', progress: 37 },
              { name: '土地相關稅法', progress: 22 },
              { name: '不動產經紀相關法規', progress: 52 },
              { name: '估價相關法規', progress: 18 },
            ].map((law) => (
              <div key={law.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">{law.name}</span>
                  <span className="text-slate-400">{law.progress}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${law.progress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 我的困難區 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg md:col-span-2">
          <div className="flex items-center gap-3 text-rose-400 mb-6">
            <AlertTriangle size={24} />
            <h2 className="text-xl font-semibold text-white">我的困難區</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/laws/civil/property-changes" className="px-4 py-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg hover:bg-rose-500/20 transition-colors">
              🔴 物權變動
            </Link>
            <Link href="/laws/civil/mortgage" className="px-4 py-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg hover:bg-rose-500/20 transition-colors">
              🔴 抵押權
            </Link>
            <Link href="/laws/civil/agency" className="px-4 py-2 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-lg hover:bg-orange-500/20 transition-colors">
              🟠 代理
            </Link>
            <Link href="/laws/civil/contract-termination" className="px-4 py-2 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-lg hover:bg-yellow-500/20 transition-colors">
              🟡 契約解除
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
