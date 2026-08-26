'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronDown, Filter, PencilRuler, RotateCcw, SlidersHorizontal, Sparkles, Target, X } from 'lucide-react';
import { examQuestions, type ExamQuestion, type ExamQuestionType, type ExamSource } from '@/data/examData';
import { lawsData } from '@/data/lawsData';
import { useExamHistory } from '@/hooks/useExamHistory';
import { useProgress } from '@/hooks/useProgress';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useQuestionProgress } from '@/hooks/useQuestionProgress';

type Difficulty = 'all' | '1' | '2' | '3';
type SourceFilter = 'all' | ExamSource;
type TypeFilter = 'all' | ExamQuestionType;
type StateFilter = 'all' | 'learned' | 'unlearned' | 'wrong' | 'confusing' | 'memorize' | 'bookmark';
type CountChoice = 5 | 10 | 20 | 30 | 50 | 'all';
type ExamMode = 'custom' | 'formal';

const countOptions: CountChoice[] = [5,10,20,30,50,'all'];
const difficultyLabels: Record<Difficulty,string> = { all:'全部難度', '1':'基礎', '2':'中等', '3':'進階' };
const sourceLabels: Record<SourceFilter,string> = { all:'全部來源', past:'歷屆題', ai:'AI 變形' };
const typeLabels: Record<TypeFilter,string> = { all:'全部題型', single:'單條', scenario:'情境', cross:'跨條' };
const stateLabels: Record<StateFilter,string> = { all:'全部狀態', learned:'已學過', unlearned:'未學', wrong:'錯題', confusing:'我不懂', memorize:'必背', bookmark:'已標記' };

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function chapterFor(question: ExamQuestion) {
  if (!question.articleId) return null;
  const law = lawsData.find(item => item.id === question.lawId);
  const n = Number.parseInt(question.articleId, 10);
  if (!law || Number.isNaN(n)) return null;
  return law.chapters.find(chapter => n >= chapter.startArticle && n <= chapter.endArticle) || null;
}

export default function ExamsIndex() {
  const [examMode,setExamMode] = useState<ExamMode>('custom');
  const [subject,setSubject] = useState('all');
  const [lawId,setLawId] = useState('all');
  const [chapterId,setChapterId] = useState('all');
  const [difficulty,setDifficulty] = useState<Difficulty>('all');
  const [source,setSource] = useState<SourceFilter>('all');
  const [type,setType] = useState<TypeFilter>('all');
  const [learningState,setLearningState] = useState<StateFilter>('all');
  const [count,setCount] = useState<CountChoice>(10);
  const [started,setStarted] = useState(false);
  const [pool,setPool] = useState<ExamQuestion[]>([]);
  const [idx,setIdx] = useState(0);
  const [selected,setSelected] = useState<number|null>(null);
  const [show,setShow] = useState(false);
  const [score,setScore] = useState(0);
  const { add } = useExamHistory();
  const { isArticleRead } = useProgress();
  const { bookmarks } = useBookmarks();
  const { wrongIds, recordAnswer } = useQuestionProgress();

  const subjects = Array.from(new Set(lawsData.map(law => law.category)));
  const subjectLaws = subject === 'all' ? lawsData : lawsData.filter(law => law.category === subject);
  const selectedLaw = lawsData.find(law => law.id === lawId);
  const chapterOptions = selectedLaw?.chapters || [];

  const filtered = useMemo(() => examQuestions.filter(question => {
    if (examMode === 'formal') return true;
    if (subject !== 'all') {
      const questionLaw = lawsData.find(law => law.id === question.lawId);
      if (!questionLaw || questionLaw.category !== subject) return false;
    }
    if (lawId !== 'all' && question.lawId !== lawId) return false;
    if (chapterId !== 'all') {
      const chapter = chapterFor(question);
      if (!chapter || chapter.id !== chapterId) return false;
    }
    if (difficulty !== 'all' && question.difficulty !== Number(difficulty)) return false;
    if (source !== 'all' && question.source !== source) return false;
    if (type !== 'all' && question.type !== type) return false;
    if (learningState !== 'all') {
      const articleId = question.articleId;
      const learned = articleId ? isArticleRead(question.lawId, articleId) : false;
      const matchingBookmarks = articleId ? bookmarks.filter(item => item.lawId === question.lawId && item.articleId === articleId) : [];
      if (learningState === 'learned' && !learned) return false;
      if (learningState === 'unlearned' && learned) return false;
      if (learningState === 'wrong' && !wrongIds.includes(question.id)) return false;
      if (learningState === 'confusing' && !matchingBookmarks.some(item => item.type === 'confusing')) return false;
      if (learningState === 'memorize' && !matchingBookmarks.some(item => item.type === 'memorize')) return false;
      if (learningState === 'bookmark' && matchingBookmarks.length === 0) return false;
    }
    return true;
  }), [examMode, subject, lawId, chapterId, difficulty, source, type, learningState, isArticleRead, bookmarks, wrongIds]);

  const effectiveCount = examMode === 'formal' ? Math.min(20, examQuestions.length) : count === 'all' ? filtered.length : Math.min(count, filtered.length);

  const startExam = () => {
    const sourcePool = examMode === 'formal' ? examQuestions : filtered;
    const next = shuffle(sourcePool).slice(0, examMode === 'formal' ? Math.min(20, sourcePool.length) : count === 'all' ? sourcePool.length : Math.min(count, sourcePool.length));
    if (!next.length) return;
    setPool(next); setIdx(0); setSelected(null); setShow(false); setScore(0); setStarted(true);
  };
  const restart = () => { setStarted(false); setPool([]); setIdx(0); setSelected(null); setShow(false); setScore(0); };

  if (!started) return (
    <div className="page-shell max-w-6xl space-y-4">
      <header className="page-header flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4"><div className="w-11 h-11 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center"><PencilRuler size={20}/></div><div><div className="text-[10px] font-black tracking-[.16em] text-rose-600">QUESTION LAB</div><h1 className="text-2xl font-black mt-1 text-primary">題庫與模擬考</h1><p className="text-sm mt-1 text-secondary">50 題可用題庫，支援題量、法規、章節、來源、難度、學習狀態與題型交叉篩選。</p></div></div>
        <div className="surface rounded-xl p-1 flex gap-1"><button onClick={()=>setExamMode('custom')} className={`px-4 py-2 rounded-lg text-xs font-black ${examMode==='custom'?'bg-indigo-600 text-white':'text-secondary'}`}>自訂練習</button><button onClick={()=>setExamMode('formal')} className={`px-4 py-2 rounded-lg text-xs font-black ${examMode==='formal'?'bg-indigo-600 text-white':'text-secondary'}`}>模擬正式</button></div>
      </header>

      {examMode === 'formal' ? <section className="card rounded-[1.35rem] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"><div><div className="text-xs font-black text-indigo-600 flex items-center gap-1.5"><Target size={14}/>混合模擬模式</div><h2 className="text-lg font-black mt-1 text-primary">20 題 · 隨機混合來源與題型</h2><p className="text-xs mt-1 text-secondary">目前是學習型模擬，不宣稱等同官方考試科目配題比例；V2.2 先用現有題庫做跨法規綜合測驗。</p></div><button onClick={startExam} className="bg-indigo-600 text-white rounded-xl px-6 py-3 text-sm font-black">開始模擬</button></section> : <>
        <section className="card rounded-[1.35rem] p-4 md:p-5">
          <div className="flex items-center gap-2 text-sm font-black text-primary mb-4"><SlidersHorizontal size={16} className="text-indigo-600"/>題量</div>
          <div className="flex gap-2 overflow-x-auto">{countOptions.map(value => <button key={String(value)} onClick={()=>setCount(value)} className={`min-w-14 px-4 py-2.5 rounded-xl border text-xs font-black ${count===value?'bg-indigo-600 text-white border-indigo-600':'surface text-secondary'}`}>{value==='all'?'全部':`${value} 題`}</button>)}</div>
        </section>

        <section className="card rounded-[1.35rem] p-4 md:p-5">
          <div className="flex items-center justify-between gap-3 mb-4"><div className="flex items-center gap-2 text-sm font-black text-primary"><Filter size={16} className="text-violet-600"/>篩選條件</div><span className="text-[10px] font-black text-tertiary">符合 {filtered.length} 題 · 本次抽 {effectiveCount} 題</span></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <SelectBox label="科目" value={subject} onChange={value=>{setSubject(value);setLawId('all');setChapterId('all');}} options={[['all','全部科目'],...subjects.map(item=>[item,item])]} />
            <SelectBox label="法規" value={lawId} onChange={value=>{setLawId(value);setChapterId('all');}} options={[['all','全部法規'],...subjectLaws.map(law=>[law.id,law.name])]} />
            <SelectBox label="章節" value={chapterId} onChange={setChapterId} disabled={lawId==='all'} options={[['all',lawId==='all'?'先選法規':'全部章節'],...chapterOptions.map(ch=>[ch.id,ch.name])]} />
            <SelectBox label="來源" value={source} onChange={value=>setSource(value as SourceFilter)} options={Object.entries(sourceLabels)} />
            <SelectBox label="難度" value={difficulty} onChange={value=>setDifficulty(value as Difficulty)} options={Object.entries(difficultyLabels)} />
            <SelectBox label="學習狀態" value={learningState} onChange={value=>setLearningState(value as StateFilter)} options={Object.entries(stateLabels)} />
            <SelectBox label="題型" value={type} onChange={value=>setType(value as TypeFilter)} options={Object.entries(typeLabels)} />
          </div>
          <button onClick={startExam} disabled={!filtered.length} className="mt-5 w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-black py-3.5 rounded-xl transition">開始 {effectiveCount} 題練習</button>
        </section>
      </>}

      <section className="card rounded-[1.2rem] px-4 py-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] text-tertiary"><span className="font-black text-primary flex items-center gap-1"><Sparkles size={12} className="text-amber-500"/>建議節奏</span><span>第一輪：5～10 題基礎</span><span>第二輪：錯題＋情境題</span><span>考前：20～50 題跨法規混合</span></section>
    </div>
  );

  if (idx >= pool.length) return (
    <div className="page-shell max-w-2xl"><div className="card rounded-[1.5rem] p-8 text-center mt-10"><div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto"><Target size={28}/></div><h1 className="text-2xl font-black mt-4 text-primary">本輪完成</h1><div className="text-5xl font-black text-indigo-600 mt-4">{score}<span className="text-lg text-tertiary">/{pool.length}</span></div><div className="text-sm mt-2 text-secondary">正確率 {pool.length?Math.round(score/pool.length*100):0}%</div><button onClick={restart} className="mt-6 surface rounded-xl px-6 py-3 text-sm font-black text-primary inline-flex items-center gap-2"><RotateCcw size={15}/>回到題庫設定</button></div></div>
  );

  const q = pool[idx];
  const pick = (choice:number) => {
    if (show) return;
    const correct = choice === q.answer;
    setSelected(choice); setShow(true); recordAnswer(q.id, correct); if (correct) setScore(value=>value+1);
  };
  const next = () => { if (idx < pool.length - 1) { setIdx(value=>value+1); setSelected(null); setShow(false); } else { add({ id:Date.now().toString(), date:new Date().toISOString(), mode: examMode==='formal'?'模擬正式':'自訂題庫', score, total:pool.length }); setIdx(pool.length); } };
  const lawName = lawsData.find(law=>law.id===q.lawId)?.name || q.lawId;

  return (
    <div className="page-shell max-w-3xl space-y-4">
      <div className="flex items-center justify-between text-xs font-black text-tertiary"><span>{examMode==='formal'?'模擬正式':lawName} · {typeLabels[q.type]}</span><span>{idx+1}/{pool.length} · {score} 分</span></div>
      <div className="h-1.5 progress-track rounded-full overflow-hidden"><div className="h-full bg-indigo-600 rounded-full transition-all" style={{width:`${((idx+1)/pool.length)*100}%`}}/></div>
      <section className="card rounded-[1.5rem] p-6 md:p-7">
        <div className="flex flex-wrap gap-2"><span className="surface rounded-full px-2.5 py-1 text-[10px] font-bold text-tertiary">{q.year}</span><span className="surface rounded-full px-2.5 py-1 text-[10px] font-bold text-tertiary">{lawName}{q.articleId?` · 第${q.articleId}條`:''}</span><span className="surface rounded-full px-2.5 py-1 text-[10px] font-bold text-tertiary">{difficultyLabels[String(q.difficulty) as Difficulty]}</span></div>
        <h2 className="text-lg md:text-xl font-black mt-4 leading-relaxed text-primary">{q.question}</h2>
        <div className="space-y-2.5 mt-5">{q.options.map((option,i)=>{const correct=show&&i===q.answer, wrong=show&&selected===i&&i!==q.answer;return <button key={i} onClick={()=>pick(i)} disabled={show} className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between gap-3 text-sm font-bold transition ${correct?'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300':wrong?'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-300':'surface text-secondary hover:border-indigo-300'}`}><span>{String.fromCharCode(65+i)}. {option}</span>{correct&&<Check size={16}/>} {wrong&&<X size={16}/>}</button>;})}</div>
        {show&&<div className="mt-5 surface rounded-2xl p-4"><div className="text-[10px] font-black text-indigo-600">解析</div><p className="text-sm leading-relaxed mt-1 text-secondary">{q.explanation}</p>{q.articleId&&<a href={`/articles/${q.lawId}-${q.articleId}`} className="inline-flex mt-3 text-xs font-black text-indigo-600">回看這條教材 →</a>}<button onClick={next} className="mt-4 w-full bg-indigo-600 text-white py-3 rounded-xl text-sm font-black">{idx===pool.length-1?'完成測驗':'下一題'}</button></div>}
      </section>
    </div>
  );
}

function SelectBox({ label, value, onChange, options, disabled = false }: { label:string; value:string; onChange:(value:string)=>void; options:string[][]; disabled?:boolean }) {
  return <label className="block"><span className="text-[10px] font-black text-tertiary">{label}</span><div className="relative mt-1.5"><select value={value} onChange={event=>onChange(event.target.value)} disabled={disabled} className="input-shell appearance-none w-full rounded-xl px-3 py-2.5 pr-9 text-xs font-bold outline-none disabled:opacity-50">{options.map(([id,name])=><option key={id} value={id}>{name}</option>)}</select><ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-tertiary pointer-events-none"/></div></label>;
}
