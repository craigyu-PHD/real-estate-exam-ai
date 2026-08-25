import { BarChart3, Trophy, Flame, Target } from 'lucide-react';

export default function Progress() {
  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      <header className="border-b border-slate-800 pb-6 flex items-center gap-4">
        <BarChart3 size={32} className="text-purple-500" />
        <div>
          <h1 className="text-3xl font-bold text-white">學習進度</h1>
          <p className="text-slate-400">掌握你的法規學習狀況。</p>
        </div>
      </header>

      {/* 總覽數據 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
          <Flame size={24} className="text-orange-500 mb-2" />
          <p className="text-sm text-slate-400 mb-1">連續學習</p>
          <p className="text-3xl font-bold text-white">6 <span className="text-sm font-normal text-slate-400">天</span></p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
          <BookOpenIcon size={24} className="text-blue-500 mb-2" />
          <p className="text-sm text-slate-400 mb-1">今日完成</p>
          <p className="text-3xl font-bold text-white">18 <span className="text-sm font-normal text-slate-400">條</span></p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
          <Target size={24} className="text-emerald-500 mb-2" />
          <p className="text-sm text-slate-400 mb-1">第一輪總進度</p>
          <p className="text-3xl font-bold text-white">34 <span className="text-sm font-normal text-slate-400">%</span></p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
          <Trophy size={24} className="text-yellow-500 mb-2" />
          <p className="text-sm text-slate-400 mb-1">獲得成就</p>
          <p className="text-3xl font-bold text-white">3 <span className="text-sm font-normal text-slate-400">個</span></p>
        </div>
      </div>

      {/* 詳細進度 */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">各科法規完成度</h2>
        <div className="space-y-6">
          {[
            { name: '民法', progress: 41, read: 500, total: 1225 },
            { name: '土地法', progress: 37, read: 120, total: 324 },
            { name: '土地相關稅法', progress: 22, read: 45, total: 200 },
            { name: '不動產經紀相關法規', progress: 52, read: 80, total: 154 },
            { name: '估價相關法規', progress: 18, read: 25, total: 139 },
          ].map((law) => (
            <div key={law.name}>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-200 font-medium">{law.name}</span>
                <div className="text-slate-400">
                  <span className="text-white font-medium mr-2">{law.progress}%</span>
                  ({law.read} / {law.total})
                </div>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3">
                <div className="bg-purple-500 h-3 rounded-full" style={{ width: `${law.progress}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BookOpenIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}
