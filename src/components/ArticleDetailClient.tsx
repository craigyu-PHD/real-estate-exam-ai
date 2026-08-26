'use client';
import { useState } from 'react';
import Link from 'next/link';
import { MessageCircleQuestion, Lightbulb, BookText, Bookmark, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, Scale, GraduationCap, HelpCircle, ArrowLeft, Trophy, Zap, Headphones, Flag, BrainCircuit, ChevronDown, ChevronUp, Bot } from 'lucide-react';
import { AudioPlayer } from '@/components/AudioPlayer';
import { ChatGPTButton } from '@/components/ChatGPTButton';
import { ArticleTeacherDrawer } from '@/components/ArticleTeacherDrawer';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useProgress } from '@/hooks/useProgress';
import type { ArticleDetailData } from '@/data/articleDetailTypes';
import { lawsData } from '@/data/lawsData';
import { generatedArticles } from '@/data/generatedArticles';

export function ArticleDetailClient({ rawId, detail }: { rawId: string; detail: ArticleDetailData }) {
  const { markAsRead, unmarkAsRead, isArticleRead, getGamificationStats } = useProgress();
  const { hasBookmark, toggleBookmark } = useBookmarks();
  const [showToast, setShowToast] = useState<string | null>(null);
  const [activeHelp, setActiveHelp] = useState<string | null>(null);
  const [showReward, setShowReward] = useState(false);
  const [teacherOpen, setTeacherOpen] = useState(false);
  const [expanded, setExpanded] = useState<'why' | 'cases' | null>('cases');

  const idParts = rawId.split('-');
  const lawId = idParts[0] || 'civil';
  const articleId = idParts.slice(1).join('-') || rawId;
  const lawName = lawsData.find(l => l.id === lawId)?.name || lawId;
  const game = getGamificationStats();
  const articles = generatedArticles[lawId] || [];
  const currentIndex = articles.findIndex(article => article.articleNumber === articleId);
  const prevArticle = currentIndex > 0 ? articles[currentIndex - 1] : null;
  const nextArticle = currentIndex >= 0 && currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null;
  const prevId = prevArticle ? `${lawId}-${prevArticle.articleNumber}` : null;
  const nextId = nextArticle ? `${lawId}-${nextArticle.articleNumber}` : null;
  const isMarked = isArticleRead(lawId, articleId);

  const handleMarkAsRead = () => {
    if (isMarked) {
      unmarkAsRead(lawId, articleId);
      setShowToast('已取消完成標記');
    } else {
      markAsRead(lawId, articleId);
      setShowReward(true);
      setShowToast('完成一關 · +12 XP');
      setTimeout(() => setShowReward(false), 1000);
    }
    setTimeout(() => setShowToast(null), 1800);
  };

  const isImportant = hasBookmark(lawId, articleId, 'important');
  const isMemorize = hasBookmark(lawId, articleId, 'memorize');
  const isConfusing = hasBookmark(lawId, articleId, 'confusing');
  const lectureText = detail.lectureScript || `${lawName}第${articleId}條。先聽法條原文。${detail.articleText}。老師白話解析：${detail.explanation}。為什麼這樣規定：${detail.why}。實務案例：${detail.cases[0]?.content || ''}。考試提醒：${detail.examTips.join(' ')}`;
  const lawProgress = currentIndex >= 0 && articles.length > 0 ? Math.round(((currentIndex + 1) / articles.length) * 100) : 0;

  const helpItems = [
    { k:'simpler', l:'再講白一點', sub:'國中程度', emoji:'🗣️' },
    { k:'example', l:'換一個例子', sub:'房仲情境', emoji:'🏠' },
    { k:'why2', l:'為什麼？', sub:'制度目的', emoji:'💡' },
    { k:'important', l:'這條重要嗎？', sub:'重要性', emoji:'⭐' },
    { k:'confuse', l:'容易搞混？', sub:'相鄰條文', emoji:'🔀' },
    { k:'exam', l:'考試怎麼考？', sub:'題型陷阱', emoji:'🎯' },
  ];

  return (
    <div className="max-w-[900px] mx-auto pb-28 relative z-10">
      <div className="sticky top-0 glass border-b px-3 md:px-5 py-2.5 flex items-center justify-between z-30" style={{borderColor:'var(--border)'}}>
        <div className="flex items-center gap-2 min-w-0">
          <Link href={`/laws/${lawId}`} className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center hover:bg-indigo-500/10" style={{background:'var(--muted)', color:'var(--text-2)'}}><ArrowLeft size={15}/></Link>
          <div className="min-w-0"><div className="text-[9px] font-black tracking-wider uppercase text-tertiary">Article Quest</div><div className="flex items-center gap-2"><h1 className="text-sm font-black truncate text-primary">{lawName} · 第 {articleId} 條</h1>{detail.importance >= 4 && <span className="hidden sm:inline text-[9px] font-black status-planned">高頻</span>}</div></div>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <button onClick={() => toggleBookmark(lawId, articleId, 'important')} title="重要" className={`w-8 h-8 flex items-center justify-center rounded-full border transition ${isImportant?'bg-amber-500 text-white border-amber-500':'card text-tertiary'}`}><Bookmark size={14} className={isImportant?'fill-current':''}/></button>
          <button onClick={() => toggleBookmark(lawId, articleId, 'memorize')} title="必背" className={`w-8 h-8 flex items-center justify-center rounded-full border text-[10px] font-black transition ${isMemorize?'bg-rose-500 text-white border-rose-500':'card text-tertiary'}`}>背</button>
          <button onClick={() => toggleBookmark(lawId, articleId, 'confusing')} title="不懂" className={`w-8 h-8 flex items-center justify-center rounded-full border transition ${isConfusing?'bg-orange-500 text-white border-orange-500':'card text-tertiary'}`}><HelpCircle size={14}/></button>
        </div>
      </div>

      <div className="px-3 md:px-5 pt-4 space-y-3.5">
        <section className="card rounded-[1.35rem] p-4 md:p-5 soft-grid relative overflow-hidden">
          <div className="flex items-center justify-between gap-3"><div className="flex flex-wrap gap-1.5 text-[9px] font-black"><span className="px-2 py-1 rounded-full status-current">第一輪 · 建立印象</span><span className="surface px-2 py-1 rounded-full text-tertiary">{currentIndex >= 0 ? `第 ${currentIndex + 1}/${articles.length} 關` : `第 ${articleId} 條`}</span></div><span className="text-xl">⚖️</span></div>
          <h2 className="text-xl md:text-2xl font-black mt-3 leading-relaxed text-primary">{detail.oneLiner}</h2>
          <div className="mt-3 flex flex-wrap gap-1.5">{detail.keywords.slice(0,6).map(k => <span key={k} className="text-[10px] px-2 py-1 rounded-full surface text-secondary">#{k}</span>)}</div>
          <div className="mt-4 flex items-center gap-2"><div className="flex-1 h-1.5 rounded-full progress-track overflow-hidden"><div className="h-full bg-indigo-600 rounded-full" style={{width:`${lawProgress}%`}}/></div><span className="text-[10px] font-black text-tertiary">{lawProgress}%</span></div>
        </section>

        <section className="card rounded-[1.25rem] p-3.5 md:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-violet-500/10 text-violet-600 flex items-center justify-center"><Headphones size={17}/></div><div><div className="text-sm font-black text-primary">Mini Lecture · 聽老師說</div><div className="text-[10px] mt-0.5 text-tertiary">法條原文 → 白話解析 → 制度目的 → 案例 → 考點</div></div></div>
          <AudioPlayer text={lectureText}/>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-1.5 text-[11px] font-black text-secondary"><BookText size={14}/> A. 官方法條原文 <span className="font-normal text-tertiary">不由 AI 改寫</span></div>
          <div className="card rounded-[1.25rem] p-4 md:p-5 text-[14px] md:text-base leading-[1.95] tracking-wide font-serif whitespace-pre-wrap text-primary">{detail.articleText}</div>
          <p className="text-[9px] mt-1.5 flex items-center gap-1.5 text-tertiary"><Scale size={10}/> 正式文字來自本地法規資料；AI 只處理教學層。</p>
        </section>

        <section className="rounded-[1.25rem] p-4 md:p-5 border bg-indigo-500/[0.04] border-indigo-500/15">
          <div className="flex items-center justify-between gap-3 mb-2"><div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-black text-sm"><MessageCircleQuestion size={16}/> B. 老師白話解析</div><span className="text-[9px] text-tertiary">逐條客製教材</span></div>
          <p className="leading-[1.85] text-[14px] md:text-[15px] text-primary">{detail.explanation}</p>
        </section>

        <section className="grid md:grid-cols-2 gap-3">
          <button onClick={() => setExpanded(expanded === 'why' ? null : 'why')} className="card rounded-[1.25rem] p-4 text-left card-hover self-start">
            <div className="flex items-center justify-between gap-2"><div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-black text-sm"><Lightbulb size={16}/> C. 為什麼這樣規定</div>{expanded==='why'?<ChevronUp size={15} className="text-tertiary"/>:<ChevronDown size={15} className="text-tertiary"/>}</div>
            <p className={`mt-2 text-xs leading-relaxed text-secondary ${expanded==='why'?'':'line-clamp-3'}`}>{detail.why}</p>
            <div className="text-[9px] mt-2 text-amber-600">{expanded==='why'?'收合制度脈絡':'展開完整制度脈絡'}</div>
          </button>
          <button onClick={() => setExpanded(expanded === 'cases' ? null : 'cases')} className="card rounded-[1.25rem] p-4 text-left card-hover self-start">
            <div className="flex items-center justify-between gap-2"><div className="flex items-center gap-2 text-sky-700 dark:text-sky-300 font-black text-sm"><GraduationCap size={16}/> D. 實務與考場案例</div>{expanded==='cases'?<ChevronUp size={15} className="text-tertiary"/>:<ChevronDown size={15} className="text-tertiary"/>}</div>
            <div className="mt-2"><div className="text-xs font-black text-primary">{detail.cases[0]?.title}</div><p className={`text-xs mt-1 leading-relaxed text-secondary ${expanded==='cases'?'':'line-clamp-3'}`}>{detail.cases[0]?.content}</p></div>
            {expanded==='cases' && detail.cases.slice(1).map((c,i)=><div key={i} className="mt-3 pt-3 border-t" style={{borderColor:'var(--border)'}}><div className="text-xs font-black text-primary">{c.title}</div><p className="text-xs mt-1 leading-relaxed text-secondary">{c.content}</p></div>)}
            <div className="text-[9px] mt-2 text-sky-600">{expanded==='cases'?'收合案例':'展開第二個案例'}</div>
          </button>
        </section>

        <section className="card rounded-[1.25rem] p-4">
          <div className="flex items-start justify-between gap-3 mb-3"><div><div className="text-sm font-black flex items-center gap-2 text-primary"><BrainCircuit size={16} className="text-violet-600"/> 卡住就點，不用硬撐</div><div className="text-[10px] mt-1 text-tertiary">每顆按鈕解決不同問題；不是換句話說而已。</div></div><span className="text-lg">🧠</span></div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">{helpItems.map(button => <button key={button.k} onClick={() => setActiveHelp(activeHelp===button.k?null:button.k)} className={`px-3 py-2.5 rounded-xl border text-left transition ${activeHelp===button.k?'bg-indigo-600 border-indigo-600 text-white':'surface card-hover'}`}><div className="flex items-center gap-1.5"><span>{button.emoji}</span><span className="text-xs font-black">{button.l}</span></div><div className={`text-[9px] mt-0.5 ${activeHelp===button.k?'text-white/65':'text-tertiary'}`}>{button.sub}</div></button>)}</div>
          {activeHelp && <div className="mt-3 rounded-xl p-3.5 text-xs leading-[1.8] border surface text-secondary">
            {activeHelp==='simpler' && <><b className="text-primary">只記這一句：</b> {detail.oneLiner}<div className="mt-2 text-tertiary">先不用背例外與細節，能用自己的話重講一次就算過關。</div></>}
            {activeHelp==='example' && <><b className="text-primary">換一個角度：</b> {detail.cases[1]?.content || detail.cases[0]?.content}</>}
            {activeHelp==='why2' && <><b className="text-primary">制度目的：</b> {detail.why}</>}
            {activeHelp==='important' && <><b className="text-primary">重要度：</b> {'★'.repeat(detail.importance)}{'☆'.repeat(Math.max(0,5-detail.importance))}<div className="mt-2">{detail.examTips.join('；')}</div></>}
            {activeHelp==='confuse' && (detail.confuseWith?.length ? detail.confuseWith.map((c,i)=><div key={i} className={i?'mt-2':''}><b className="text-primary">{c.article}</b>：{c.diff}</div>) : '這條目前沒有需要優先對照的相鄰條文。')}
            {activeHelp==='exam' && <ul className="space-y-1">{detail.examTips.map((tip,i)=><li key={i}>• {tip}</li>)}</ul>}
          </div>}
          <button onClick={() => setTeacherOpen(true)} className="mt-3 w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2.5 text-xs font-black transition"><Bot size={14}/>直接問 AI 老師 · 已帶入本條</button>
        </section>

        <section className="grid md:grid-cols-2 gap-3">
          <div className="rounded-[1.25rem] p-4 border bg-rose-500/[0.035] border-rose-500/15"><div className="text-rose-700 dark:text-rose-300 font-black text-xs mb-2 flex items-center gap-1.5"><AlertTriangle size={14}/> 容易誤會</div><ul className="space-y-1.5 text-xs text-secondary">{detail.pitfalls.map((p,i) => <li key={i} className="flex gap-2"><span className="text-rose-500">•</span><span>{p}</span></li>)}</ul></div>
          <div className="rounded-[1.25rem] p-4 border bg-amber-500/[0.035] border-amber-500/15"><div className="text-amber-700 dark:text-amber-300 font-black text-xs mb-2 flex items-center gap-1.5"><Flag size={14}/> 考試提醒</div><ul className="space-y-1.5 text-xs text-secondary">{detail.examTips.map((p,i) => <li key={i} className="flex gap-2"><span className="text-amber-500">•</span><span>{p}</span></li>)}</ul></div>
        </section>

        <section className="card rounded-[1.35rem] p-4 md:p-5 quest-glow relative overflow-hidden">
          <div className="relative flex flex-col md:flex-row md:items-center gap-3"><div className="flex-1"><div className="text-[10px] font-black text-emerald-600">完成本關</div><h3 className="text-base font-black mt-1 text-primary">{isMarked ? '這一條已完成，可以往下一關。' : '大致懂了就過關，不必等到百分之百。'}</h3><div className="mt-2 flex gap-2 text-[9px]"><span className="surface px-2 py-1 rounded-full text-secondary"><Trophy size={10} className="inline mr-1"/>LV.{game.level}</span><span className="surface px-2 py-1 rounded-full text-secondary"><Zap size={10} className="inline mr-1"/>+12 XP</span></div></div><div className="flex flex-col gap-2 md:min-w-56"><button onClick={handleMarkAsRead} className={`px-5 py-3 rounded-xl font-black text-sm flex justify-center items-center gap-2 ${isMarked?'bg-emerald-600 text-white':'bg-indigo-600 text-white'}`}>{isMarked?<><CheckCircle2 size={17}/>已完成 · 點擊取消</>:<>✅ 大致懂了，完成這關</>}</button><ChatGPTButton article={`${lawName}第 ${articleId} 條`} text={`${detail.articleText}\n\n白話：${detail.oneLiner}\n講解：${detail.explanation}`}/></div></div>
        </section>
      </div>

      <footer className="fixed bottom-0 left-0 md:left-[280px] right-0 glass border-t px-3 py-2.5 flex justify-between z-30 pb-[max(.65rem,env(safe-area-inset-bottom))]" style={{borderColor:'var(--border)'}}>
        {prevId ? <Link href={`/articles/${prevId}`} className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold text-secondary"><ChevronLeft size={16}/>上一條</Link> : <span className="px-3 py-2 text-xs text-tertiary">已是首條</span>}
        <Link href={`/laws/${lawId}`} className="text-[10px] font-bold px-2 py-2 text-tertiary">回目錄</Link>
        {nextId ? <Link href={`/articles/${nextId}`} className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-black bg-indigo-600 text-white">下一條 <ChevronRight size={16}/></Link> : <span className="px-3 py-2 text-xs text-tertiary">已是末條</span>}
      </footer>

      <ArticleTeacherDrawer open={teacherOpen} onClose={() => setTeacherOpen(false)} lawName={lawName} articleId={articleId} detail={detail}/>
      {showToast && <div className="fixed bottom-20 left-1/2 -translate-x-1/2 card text-xs font-black px-4 py-2 rounded-full shadow-xl z-40 text-primary">{showToast}</div>}
      {showReward && <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 reward-burst pointer-events-none"><div className="bg-amber-300 text-amber-950 font-black px-4 py-2.5 rounded-full shadow-xl whitespace-nowrap">✨ +12 XP · 過關！ 🏆</div></div>}
    </div>
  );
}
