'use client';
import { Play, Pause, SkipForward, SkipBack, ListMusic } from 'lucide-react';
import { useState } from 'react';
import { lawsData } from '@/data/lawsData';
import { generatedArticles } from '@/data/generatedArticles';
import { AudioPlayer } from '@/components/AudioPlayer';

export default function ListenPage() {
  const [lawId, setLawId] = useState('civil');
  const [idx, setIdx] = useState(0);
  const arts = generatedArticles[lawId] || [];
  const cur = arts[idx];

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-6 relative z-10">
      <header className="border-b border-slate-800 pb-6">
        <h1 className="text-2xl font-bold text-white">聽課模式</h1>
        <p className="text-sm text-slate-400 mt-1">選 5/10/20 分鐘，系統自動串播「一句話→白話→案例」。離線也能用系統語音。</p>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {lawsData.slice(0,6).map(l=> (
          <button key={l.id} onClick={()=>{setLawId(l.id); setIdx(0);}} className={`px-3 py-2 rounded-full text-xs font-medium border whitespace-nowrap ${lawId===l.id?'bg-blue-600 border-blue-500 text-white':'bg-slate-800 border-slate-700 text-slate-400'}`}>{l.name}</button>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col items-center">
        <div className="w-48 h-48 bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-full flex items-center justify-center border border-slate-800 mb-4"><ListMusic size={48} className="text-white/60" /></div>
        <h2 className="text-lg font-bold text-white">{cur ? `${lawsData.find(l=>l.id===lawId)?.name} 第 ${cur.articleNumber} 條` : '無資料'}</h2>
        <p className="text-xs text-slate-500 mt-1 line-clamp-2 text-center max-w-md">{cur?.text.slice(0,80)}…</p>
        <div className="mt-4 w-full max-w-md">
          {cur && <AudioPlayer text={`${cur.text}`} />}
        </div>
        <div className="flex items-center gap-4 mt-4">
          <button onClick={()=>setIdx(Math.max(0, idx-1))} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300"><SkipBack size={18} /></button>
          <span className="text-xs text-slate-500">{idx+1} / {arts.length}</span>
          <button onClick={()=>setIdx(Math.min(arts.length-1, idx+1))} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300"><SkipForward size={18} /></button>
        </div>
      </div>

      <div className="flex gap-2">
        {['5分鐘','10分鐘','20分鐘','30分鐘'].map(t=> (
          <button key={t} onClick={()=>setIdx(0)} className="flex-1 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl py-2 text-sm">{t}</button>
        ))}
      </div>
    </div>
  );
}
