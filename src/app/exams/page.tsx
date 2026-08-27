'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronDown, RotateCcw, X } from 'lucide-react';
import { WorkspacePageHeader } from '@/components/WorkspacePageHeader';
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

const countOptions: CountChoice[] = [5, 10, 20, 30, 50, 'all'];
const difficultyLabels: Record<Difficulty, string> = { all: '全部難度', '1': '基礎', '2': '中等', '3': '進階' };
const sourceLabels: Record<SourceFilter, string> = { all: '全部來源', past: '歷屆題', ai: 'AI 變形' };
const typeLabels: Record<TypeFilter, string> = { all: '全部題型', single: '單條', scenario: '情境', cross: '跨條' };
const stateLabels: Record<StateFilter, string> = { all: '全部狀態', learned: '已學過', unlearned: '未學', wrong: '錯題', confusing: '我不懂', memorize: '必背', bookmark: '已標記' };

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
}

function chapterFor(question: ExamQuestion) {
  if (!question.articleId) return null;
  const law = lawsData.find(item => item.id === question.lawId);
  const articleNumber = Number.parseInt(question.articleId, 10);
  if (!law || Number.isNaN(articleNumber)) return null;
  return law.chapters.find(chapter => articleNumber >= chapter.startArticle && articleNumber <= chapter.endArticle) || null;
}

export default function ExamsIndex() {
  const [examMode, setExamMode] = useState<ExamMode>('custom');
  const [subject, setSubject] = useState('all');
  const [lawId, setLawId] = useState('all');
  const [chapterId, setChapterId] = useState('all');
  const [difficulty, setDifficulty] = useState<Difficulty>('all');
  const [source, setSource] = useState<SourceFilter>('all');
  const [type, setType] = useState<TypeFilter>('all');
  const [learningState, setLearningState] = useState<StateFilter>('all');
  const [count, setCount] = useState<CountChoice>(10);
  const [started, setStarted] = useState(false);
  const [pool, setPool] = useState<ExamQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [show, setShow] = useState(false);
  const [score, setScore] = useState(0);
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

  const effectiveCount = examMode === 'formal'
    ? Math.min(20, examQuestions.length)
    : count === 'all'
      ? filtered.length
      : Math.min(count, filtered.length);

  const startExam = () => {
    const sourcePool = examMode === 'formal' ? examQuestions : filtered;
    const next = shuffle(sourcePool).slice(0, examMode === 'formal'
      ? Math.min(20, sourcePool.length)
      : count === 'all'
        ? sourcePool.length
        : Math.min(count, sourcePool.length));
    if (!next.length) return;
    setPool(next);
    setIdx(0);
    setSelected(null);
    setShow(false);
    setScore(0);
    setStarted(true);
  };

  const restart = () => {
    setStarted(false);
    setPool([]);
    setIdx(0);
    setSelected(null);
    setShow(false);
    setScore(0);
  };

  if (!started) {
    return (
      <div className="page-shell max-w-6xl space-y-5">
        <WorkspacePageHeader
          eyebrow="QUESTION WORKSPACE"
          title="題庫與模擬考"
          description={`${examQuestions.length} 題可用題庫。用一列篩選器組合科目、法規、章節、來源、難度、學習狀態與題型，再開始練習。`}
          actions={
            <div className="surface rounded-lg p-1 flex gap-1">
              <button type="button" aria-pressed={examMode === 'custom'} onClick={() => setExamMode('custom')} className={`min-h-9 px-3 rounded-md text-xs font-medium ${examMode === 'custom' ? 'text-white' : 'text-secondary'}`} style={examMode === 'custom' ? { background: 'var(--primary)' } : undefined}>自訂練習</button>
              <button type="button" aria-pressed={examMode === 'formal'} onClick={() => setExamMode('formal')} className={`min-h-9 px-3 rounded-md text-xs font-medium ${examMode === 'formal' ? 'text-white' : 'text-secondary'}`} style={examMode === 'formal' ? { background: 'var(--primary)' } : undefined}>模擬正式</button>
            </div>
          }
        />

        {examMode === 'formal' ? (
          <section className="card rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <div className="text-xs font-medium tracking-[0.1em] text-tertiary">FORMAL MIX</div>
              <h2 className="text-xl font-semibold mt-2 text-primary">20 題跨法規混合練習</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-secondary">依現有題庫隨機混合來源與題型，適合檢查整體辨識能力；不宣稱等同官方考試科目配題比例。</p>
            </div>
            <button type="button" onClick={startExam} className="workspace-primary-action md:min-w-32">開始模擬</button>
          </section>
        ) : (
          <>
            <section className="card rounded-2xl p-4">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-2.5">
                <SelectBox label="題量" value={String(count)} onChange={value => setCount(value === 'all' ? 'all' : Number(value) as CountChoice)} options={countOptions.map(value => [String(value), value === 'all' ? '全部題目' : `${value} 題`])}/>
                <SelectBox label="科目" value={subject} onChange={value => { setSubject(value); setLawId('all'); setChapterId('all'); }} options={[['all', '全部科目'], ...subjects.map(item => [item, item])]}/>
                <SelectBox label="法規" value={lawId} onChange={value => { setLawId(value); setChapterId('all'); }} options={[['all', '全部法規'], ...subjectLaws.map(law => [law.id, law.name])]}/>
                <SelectBox label="章節" value={chapterId} onChange={setChapterId} disabled={lawId === 'all'} options={[['all', lawId === 'all' ? '先選法規' : '全部章節'], ...chapterOptions.map(chapter => [chapter.id, chapter.name])]}/>
                <SelectBox label="來源" value={source} onChange={value => setSource(value as SourceFilter)} options={Object.entries(sourceLabels)}/>
                <SelectBox label="難度" value={difficulty} onChange={value => setDifficulty(value as Difficulty)} options={Object.entries(difficultyLabels)}/>
                <SelectBox label="學習狀態" value={learningState} onChange={value => setLearningState(value as StateFilter)} options={Object.entries(stateLabels)}/>
                <SelectBox label="題型" value={type} onChange={value => setType(value as TypeFilter)} options={Object.entries(typeLabels)}/>
              </div>
            </section>

            <section className="surface rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-sm text-secondary">
                符合 <span className="font-semibold text-primary">{filtered.length}</span> 題，本次抽取 <span className="font-semibold text-primary">{effectiveCount}</span> 題
              </div>
              <button type="button" onClick={startExam} disabled={!filtered.length} className="workspace-primary-action disabled:opacity-40">開始練習</button>
            </section>
          </>
        )}

        <section className="border-t pt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-tertiary" style={{ borderColor: 'var(--border)' }}>
          <span className="font-medium text-secondary">建議節奏</span>
          <span>第一輪：5–10 題基礎</span>
          <span>第二輪：錯題＋情境題</span>
          <span>考前：20–50 題跨法規混合</span>
        </section>
      </div>
    );
  }

  if (idx >= pool.length) {
    const accuracy = pool.length ? Math.round((score / pool.length) * 100) : 0;
    return (
      <div className="page-shell max-w-3xl">
        <section className="card rounded-2xl p-7 md:p-8 mt-8">
          <div className="text-xs font-medium tracking-[0.1em] text-tertiary">SESSION COMPLETE</div>
          <div className="mt-5 grid sm:grid-cols-[1fr_auto] gap-6 items-end">
            <div>
              <h1 className="text-[28px] font-bold text-primary">本輪完成</h1>
              <p className="mt-2 text-sm text-secondary">把錯題與不確定題目留給下一輪複習，不需要靠一次測驗證明全部都會。</p>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-3xl font-bold text-primary">{score} / {pool.length}</div>
              <div className="text-sm mt-1 text-tertiary">正確率 {accuracy}%</div>
            </div>
          </div>
          <div className="mt-6 h-2 rounded-full progress-track overflow-hidden"><div className="h-full rounded-full" style={{ width: `${accuracy}%`, background: 'var(--primary)' }}/></div>
          <button type="button" onClick={restart} className="workspace-secondary-action mt-6"><RotateCcw size={15} strokeWidth={1.9}/> 回到題庫設定</button>
        </section>
      </div>
    );
  }

  const question = pool[idx];
  const pick = (choice: number) => {
    if (show) return;
    const correct = choice === question.answer;
    setSelected(choice);
    setShow(true);
    recordAnswer(question.id, correct);
    if (correct) setScore(value => value + 1);
  };

  const next = () => {
    if (idx < pool.length - 1) {
      setIdx(value => value + 1);
      setSelected(null);
      setShow(false);
      return;
    }
    add({ id: Date.now().toString(), date: new Date().toISOString(), mode: examMode === 'formal' ? '模擬正式' : '自訂題庫', score, total: pool.length });
    setIdx(pool.length);
  };

  const lawName = lawsData.find(law => law.id === question.lawId)?.name || question.lawId;

  return (
    <div className="page-shell max-w-4xl space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-medium tracking-[0.1em] text-tertiary">QUESTION {String(idx + 1).padStart(2, '0')} / {String(pool.length).padStart(2, '0')}</div>
          <div className="mt-1 text-sm font-medium text-secondary">{examMode === 'formal' ? '模擬正式' : lawName} · {typeLabels[question.type]}</div>
        </div>
        <div className="text-sm font-medium text-tertiary">目前 {score} 分</div>
      </div>

      <div className="h-1.5 progress-track rounded-full overflow-hidden"><div className="h-full rounded-full transition-[width] duration-200" style={{ width: `${((idx + 1) / pool.length) * 100}%`, background: 'var(--primary)' }}/></div>

      <section className="card rounded-2xl p-5 md:p-7">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-tertiary">
          <span>{question.year}</span>
          <span>{lawName}{question.articleId ? ` · 第${question.articleId}條` : ''}</span>
          <span>{difficultyLabels[String(question.difficulty) as Difficulty]}</span>
          <span>{sourceLabels[question.source]}</span>
        </div>

        <h1 className="text-lg md:text-xl font-semibold mt-5 leading-8 text-primary">{question.question}</h1>

        <div className="mt-6 border rounded-xl overflow-hidden divide-y" style={{ borderColor: 'var(--border)' }}>
          {question.options.map((option, optionIndex) => {
            const correct = show && optionIndex === question.answer;
            const wrong = show && selected === optionIndex && optionIndex !== question.answer;
            const selectedOption = selected === optionIndex;
            const semanticStyle = correct
              ? { background: 'color-mix(in srgb,var(--success) 8%,var(--card))', borderColor: 'var(--success)' }
              : wrong
                ? { background: 'color-mix(in srgb,var(--danger) 8%,var(--card))', borderColor: 'var(--danger)' }
                : selectedOption
                  ? { background: 'color-mix(in srgb,var(--primary) 7%,var(--card))' }
                  : undefined;
            return (
              <button
                key={optionIndex}
                type="button"
                onClick={() => pick(optionIndex)}
                disabled={show}
                className="w-full min-h-14 px-4 py-3 flex items-center gap-3 text-left text-sm text-secondary hover:bg-white/[0.025] transition-colors disabled:cursor-default"
                style={semanticStyle}
              >
                <span className="w-8 h-8 rounded-lg border shrink-0 flex items-center justify-center text-xs font-semibold" style={{ borderColor: correct ? 'var(--success)' : wrong ? 'var(--danger)' : 'var(--border)', color: correct ? 'var(--success)' : wrong ? 'var(--danger)' : 'var(--text-2)' }}>
                  {String.fromCharCode(65 + optionIndex)}
                </span>
                <span className="flex-1 leading-6">{option}</span>
                {correct && <Check size={17} strokeWidth={1.9} className="shrink-0" style={{ color: 'var(--success)' }}/>}
                {wrong && <X size={17} strokeWidth={1.9} className="shrink-0" style={{ color: 'var(--danger)' }}/>}
              </button>
            );
          })}
        </div>

        {show && (
          <section className="mt-6 reader-ai-panel rounded-xl p-4 md:p-5">
            <div className="text-xs font-medium tracking-[0.1em] text-tertiary">ANSWER REVIEW</div>
            <h2 className="text-base font-semibold mt-2 text-primary">解析</h2>
            <p className="text-sm leading-7 mt-2 text-secondary">{question.explanation}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {question.articleId && <a href={`/articles/${question.lawId}-${question.articleId}`} className="workspace-secondary-action">回看這條教材</a>}
              <button type="button" onClick={next} className="workspace-primary-action">{idx === pool.length - 1 ? '完成測驗' : '下一題'}</button>
            </div>
          </section>
        )}
      </section>
    </div>
  );
}

function SelectBox({
  label,
  value,
  onChange,
  options,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[][];
  disabled?: boolean;
}) {
  return (
    <label className="block min-w-0">
      <span className="text-xs font-medium text-tertiary">{label}</span>
      <div className="relative mt-1.5">
        <select value={value} onChange={event => onChange(event.target.value)} disabled={disabled} className="input-shell appearance-none w-full rounded-lg px-3 py-2.5 pr-8 text-xs font-medium outline-none disabled:opacity-50">
          {options.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
        </select>
        <ChevronDown size={14} strokeWidth={1.9} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-tertiary pointer-events-none"/>
      </div>
    </label>
  );
}
