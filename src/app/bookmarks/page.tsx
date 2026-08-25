import Link from 'next/link';
import { Star, Flag, HelpCircle, AlertTriangle, PenLine, Bookmark } from 'lucide-react';

export default function Bookmarks() {
  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      <header className="border-b border-slate-800 pb-6 flex items-center gap-4">
        <Star size={32} className="text-yellow-400" />
        <div>
          <h1 className="text-3xl font-bold text-white">我的重點</h1>
          <p className="text-slate-400">管理你標記的所有法條與筆記。</p>
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {['全部', '很重要', '我不懂', '必背', '筆記', '收藏'].map((tab, i) => (
          <button key={tab} className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors text-sm font-medium ${i === 0 ? 'bg-blue-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-4 mt-6">
        {/* Item 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold px-2 py-1 bg-slate-800 text-slate-400 rounded">民法 / 物權</span>
                <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded">
                  <Flag size={12} /> 很重要
                </span>
              </div>
              <Link href="/articles/758" className="text-lg font-bold text-white hover:text-blue-400 transition-colors">
                第 758 條
              </Link>
              <p className="text-slate-400 text-sm mt-2 line-clamp-2">不動產物權，依法律行為而取得、設定、喪失及變更者，非經登記，不生效力...</p>
            </div>
          </div>
        </div>

        {/* Item 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold px-2 py-1 bg-slate-800 text-slate-400 rounded">土地法 / 總則</span>
                <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded">
                  <HelpCircle size={12} /> 我不懂
                </span>
              </div>
              <Link href="/articles/land-34-1" className="text-lg font-bold text-white hover:text-blue-400 transition-colors">
                第 34-1 條
              </Link>
              <p className="text-slate-400 text-sm mt-2 line-clamp-2">共有土地或建築改良物，其處分、變更及設定地上權、農育權、不動產役權或典權...</p>
            </div>
          </div>
        </div>
        
        {/* Item 3 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold px-2 py-1 bg-slate-800 text-slate-400 rounded">民法 / 債</span>
                <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                  <PenLine size={12} /> 筆記
                </span>
              </div>
              <Link href="/articles/249" className="text-lg font-bold text-white hover:text-blue-400 transition-colors">
                第 249 條
              </Link>
              <div className="mt-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
                <p className="text-slate-300 text-sm">老師說這條叫做「定金法則」，選擇題很愛考「加倍返還」的情況。要注意是誰違約！</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
