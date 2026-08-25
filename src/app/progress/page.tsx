'use client';
import { BarChart3, Trophy, Flame, Target, Book, Award, Calendar } from 'lucide-react';
import { useProgress } from '@/hooks/useProgress';
import { lawsData } from '@/data/lawsData';
import { useExamHistory } from '@/hooks/useExamHistory';
import { useEffect, useState } from 'react';

export default function ProgressPage() {
  const { isLoaded, getProgress, getTotalProgress, streak } = useProgress();
  const { records } = useExamHistory();
  const [daily, setDaily] = useState<Record<string,number>>({});
  useEffect(()=>{ try{ setDaily(JSON.parse(localStorage.getItem('app_progress')||'{}').dailyCounts||{});}catch{} },[isLoaded]);

  if (!isLoaded) return <div className="p-10 text-center text-slate-500">載入中...</div>;

  const totalPct = getTotalProgress();
  let totalRead=0, totalAll=0;
  lawsData.forEach(l=>{ const p=getProgress(l.id); totalRead+=p.read; totalAll+=p.total; });

  // last 14 days for curve
  const days = Array.from({length:14},(_,i)=>{ const d=new Date(); d.setDate(d.getDate()-(13-i)); return d.toISOString().slice(0,10); });
  const maxV = Math.max(1, ...days.map(d=> daily[d]||0));
  const achievements = [
    { id:'first', label:'初學者', need: totalRead>=1, desc:'完成第1條' },
    { id:'ten', label:'起步', need: totalRead>=10, desc:'累積10條' },
    { id:'streak3', label:'3日連續', need: streak>=3, desc:'連續3天' },
    { id:'streak7', label:'一週不輟', need: streak>=7, desc:'連續7天' },
    { id:'half', label:'半程', need: totalPct>=50, desc:'總進度50%' },
    { id:'exam', label:'首測', need: records.length>=1, desc:'完成一次模測' },
  ];

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <header className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-center gap-3">
        <BarChart3 size={24} className="text-indigo-600"/>
        <div><h1 className="text-xl font-black text-slate-900 dark:text-white">學習進度</h1><p className="text-sm text-slate-500 dark:text-slate-400">雲端同步：localStorage 即時寫入，Supabase 可跨裝置（若已設定）</p></div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4"><div className="text-xs text-slate-500 flex items-center gap-1"><Target size={14}/> 總進度</div><div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalPct}%</div><div className="mt-2 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"><div className="h-1.5 bg-indigo-600 rounded-full" style={{width:`${totalPct}%`}}/></div></div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4"><div className="text-xs text-slate-500 flex items-center gap-1"><Book size={14}/> 已讀</div><div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalRead}<span className="text-sm text-slate-500">/{totalAll}</span></div></div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4"><div className="text-xs text-slate-500 flex items-center gap-1"><Flame size={14} className="text-orange-500"/> 連續</div><div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{streak}<span className="text-sm text-slate-500">天</span></div></div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4"><div className="text-xs text-slate-500 flex items-center gap-1"><Trophy size={14} className="text-amber-500"/> 成就</div><div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{achievements.filter(a=>a.need).length}/{achievements.length}</div></div>
      </div>

      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
        <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2"><Calendar size={16}/> 學習曲線（近14日每日已讀）</h2>
        <div className="mt-4 flex items-end gap-1 h-24">
          {days.map(d=>{
            const v = daily[d]||0;
            const h = Math.round((v / maxV) * 96);
            return <div key={d} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-indigo-600 rounded-t" style={{height: `${h}px`, opacity: v?1:0.15}} title={`${d}: ${v}條`}/>
              <span className="text-[10px] text-slate-500">{d.slice(5).replace('-','/')}</span>
            </div>;
          })}
        </div>
        <div className="text-xs text-slate-500 mt-2">深色柱=當天有學習，高度=條數，配合首頁月曆熱力圖</div>
      </section>

      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
        <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2"><Award size={16} className="text-amber-500"/> 成就解鎖</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
          {achievements.map(a=> (
            <div key={a.id} className={`rounded-xl p-3 border flex items-center gap-2 ${a.need ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'}`}>
              <Trophy size={16}/> <div><div className="text-sm font-black">{a.label}</div><div className="text-xs opacity-80">{a.desc}</div></div>
              {a.need && <span className="ml-auto text-xs font-black">✓</span>}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
        <h2 className="text-sm font-black text-slate-900 dark:text-white mb-3">各科詳細進度</h2>
        <div className="space-y-3">
          {lawsData.map(l=>{
            const p=getProgress(l.id);
            return <div key={l.id} className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-28 truncate">{l.name}</span>
              <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden"><div className="h-2 bg-indigo-600 rounded-full" style={{width:`${p.percentage}%`}}/></div>
              <span className="text-xs text-slate-500 w-16 text-right">{p.read}/{p.total}</span>
              <span className="text-xs font-black w-10 text-right">{p.percentage}%</span>
            </div>;
          })}
        </div>
      </section>

      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
        <h2 className="text-sm font-black text-slate-900 dark:text-white">考試紀錄（雲端）</h2>
        {records.length===0 ? <p className="text-sm text-slate-500 mt-2">尚無紀錄，完成一次模測後會在此顯示時間、內容與分數，並嘗試同步至 Supabase</p> :
          <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
            {records.slice(0,10).map(r=> (
              <div key={r.id} className="py-2 flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">{new Date(r.date).toLocaleString('zh-TW')} · {r.mode} · {r.score}/{r.total}</span>
                <span className={`font-black ${r.score/r.total>=0.6 ? 'text-emerald-600' : 'text-amber-600'}`}>{Math.round(r.score/r.total*100)}%</span>
              </div>
            ))}
          </div>
        }
      </section>
    </div>
  );
}
