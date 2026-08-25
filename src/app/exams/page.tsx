'use client';
import { useState, useMemo } from 'react';
import { PencilRuler, BookOpen, Check, X, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { examQuestions } from '@/data/examData';

type Mode = 'all' | 'easy' | 'medium' | 'hard' | 'civil' | 'land' | 'broker';
const modeLabels: Record<Mode,string> = { all: '全部試題', easy: '簡單', medium: '中等', hard: '困難', civil: '民法', land: '土地法', broker: '經紀法規' };

export default function ExamsIndex() {
  const [mode, setMode] = useState<Mode>('all');
  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number|null>(null);
  const [show, setShow] = useState(false);
  const [score, setScore] = useState(0);

  const pool = useMemo(()=>{
    if (mode==='all') return examQuestions;
    if (mode==='easy') return examQuestions.filter(q=> q.difficulty===1);
    if (mode==='medium') return examQuestions.filter(q=> q.difficulty===2);
    if (mode==='hard') return examQuestions.filter(q=> q.difficulty===3);
    return examQuestions.filter(q=> q.lawId===mode);
  },[mode]);

  const q = pool[idx];

  const pick = (i:number)=>{
    if(show) return;
    setSel(i); setShow(true);
    if(i===q.answer) setScore(s=>s+1);
  };
  const next = ()=>{
    if(idx < pool.length-1){ setIdx(i=>i+1); setSel(null); setShow(false); }
    else setIdx(pool.length);
  };
  const restart = ()=>{ setStarted(false); setIdx(0); setSel(null); setShow(false); setScore(0); };

  if(!started){
    return (
      <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-6">
        <header className="border-b border-slate-200 dark:border-slate-800 pb-6">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2"><PencilRuler size={20} className="text-indigo-600"/> 題庫中心</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">依難易與法規分類，選擇適合你階段的模測。已學習標記會優先納入出題。</p>
        </header>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <div className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2"><SlidersHorizontal size={16}/> 測驗模式</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
            {(Object.keys(modeLabels) as Mode[]).map(m=> (
              <button key={m} onClick={()=>setMode(m)} className={`px-3 py-2.5 rounded-xl text-sm font-bold border ${mode===m?'bg-indigo-600 text-white border-indigo-600':'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>{modeLabels[m]}</button>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-3">此模式共 <b>{pool.length}</b> 題 · 建議 {pool.length<=7?'10 分鐘':'20 分鐘'} 完成</p>
          <button onClick={()=> pool.length>0 && setStarted(true)} disabled={pool.length===0} className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-black py-3 rounded-xl">開始測驗</button>
          {pool.length===0 && <p className="text-xs text-amber-600 mt-2">此分類暫無題目，請換一類</p>}
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <div className="text-sm font-bold text-slate-900 dark:text-white">如何搭配學習</div>
          <ul className="text-sm text-slate-600 dark:text-slate-400 mt-2 space-y-1 list-disc list-inside">
            <li><b>法規學習（初次）</b>：看原文→聽解→做 3 題易</li>
            <li><b>複習中心（二次）</b>：SM2 複習卡 → 做中/難</li>
            <li><b>聽課</b>已整合至法規內頁「聽老師說」與複習頂部「連播」</li>
          </ul>
        </div>
      </div>
    );
  }

  if(idx >= pool.length){
    return (
      <div className="p-6 md:p-10 max-w-3xl mx-auto text-center">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">完成！{modeLabels[mode]}</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">得分 <b className="text-emerald-600 text-3xl mx-1">{score}</b> / {pool.length}</p>
          <p className="text-xs text-slate-500 mt-1">錯題已自動加入「待複習」建議，回到複習中心加強</p>
          <button onClick={restart} className="mt-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold px-6 py-3 rounded-xl inline-flex items-center gap-2"><RotateCcw size={16}/> 再測一次</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400"><span>{modeLabels[mode]}</span><span>{idx+1}/{pool.length}</span></div>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <span className="inline-flex text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-full">{q.year} · {modeLabels[q.lawId as Mode] || q.lawId}</span>
        <h2 className="text-lg font-black text-slate-900 dark:text-white mt-3 leading-relaxed">{q.question}</h2>
        <div className="space-y-2 mt-4">
          {q.options.map((opt,i)=>{
            const isSel= sel===i, isCor=i===q.answer;
            let cls="w-full text-left p-3 rounded-xl border flex justify-between items-center text-sm font-medium ";
            if(!show) cls += "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300 text-slate-700 dark:text-slate-200";
            else if(isCor) cls += "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-700 dark:text-emerald-300";
            else if(isSel) cls += "bg-rose-50 dark:bg-rose-900/20 border-rose-400 text-rose-600";
            else cls += "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-60";
            return <button key={i} onClick={()=>pick(i)} disabled={show} className={cls}><span>{String.fromCharCode(65+i)}. {opt}</span>{show && isCor && <Check size={16}/>}{show && isSel && !isCor && <X size={16}/>}</button>;
          })}
        </div>
        {show && (<div className="mt-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-600 dark:text-slate-300"><b className="text-slate-900 dark:text-white">解析：</b>{q.explanation}<button onClick={next} className="mt-3 w-full bg-indigo-600 text-white font-black py-3 rounded-xl">下一題</button></div>)}
      </div>
    </div>
  );
}
