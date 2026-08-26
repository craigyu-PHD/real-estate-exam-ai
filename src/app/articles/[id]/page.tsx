'use client';
import { useState, use } from 'react';
import Link from 'next/link';
import { MessageCircleQuestion, Lightbulb, BookText, Bookmark, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, Scale, GraduationCap, HelpCircle, ArrowLeft, Trophy, Zap, Headphones, Flag, BrainCircuit } from 'lucide-react';
import { AudioPlayer } from '@/components/AudioPlayer';
import { ChatGPTButton } from '@/components/ChatGPTButton';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useProgress } from '@/hooks/useProgress';
import { getArticleDetail } from '@/data/articleExplanations';
import { lawsData } from '@/data/lawsData';
import { generatedArticles } from '@/data/generatedArticles';

export default function ArticleDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { markAsRead, unmarkAsRead, isArticleRead, getGamificationStats } = useProgress();
  const { hasBookmark, toggleBookmark } = useBookmarks();
  const [showToast, setShowToast] = useState<string | null>(null);
  const [activeHelp, setActiveHelp] = useState<string | null>(null);
  const [showReward, setShowReward] = useState(false);

  const rawId = resolvedParams.id;
  const idParts = rawId.split('-');
  const lawId = idParts[0] || 'civil';
  const articleId = idParts.slice(1).join('-') || rawId;
  const detail = getArticleDetail(lawId, articleId);
  const lawName = lawsData.find(l => l.id === lawId)?.name || lawId;
  const game = getGamificationStats();

  const articles = generatedArticles[lawId] || [];
  const currentIndex = articles.findIndex(article => article.articleNumber === articleId);
  const prevArticle = currentIndex > 0 ? articles[currentIndex - 1] : null;
  const nextArticle = currentIndex >= 0 && currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null;
  const prevId = prevArticle ? `${lawId}-${prevArticle.articleNumber}` : null;
  const nextId = nextArticle ? `${lawId}-${nextArticle.articleNumber}` : null;
  const isMarked = isArticleRead(lawId, articleId);

  if (!detail) {
    return <div className="max-w-3xl mx-auto p-8"><div className="card rounded-2xl p-6"><h1 className="font-black" style={{color:'var(--text-1)'}}>找不到這條法規</h1><Link href={`/laws/${lawId}`} className="text-indigo-600 text-sm mt-3 inline-block">回到法規目錄</Link></div></div>;
  }

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
  const fullTextForAudio = `${lawName}第${articleId}條。${detail.articleText}。先抓一句話重點：${detail.oneLiner}。接著老師白話講解：${detail.explanation}`;
  const lawProgress = currentIndex >= 0 && articles.length > 0 ? Math.round(((currentIndex + 1) / articles.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto pb-32 relative z-10">
      <div className="sticky top-0 glass border-b px-3 md:px-5 py-3 flex items-center justify-between z-30" style={{borderColor:'var(--border)'}}>
        <div className="flex items-center gap-2 min-w-0">
          <Link href={`/laws/${lawId}`} className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center transition hover:bg-indigo-500/10" style={{background:'var(--muted)', color:'var(--text-2)'}}><ArrowLeft size={16}/></Link>
          <div className="min-w-0"><div className="text-[10px] font-black tracking-wider uppercase" style={{color:'var(--text-3)'}}>Learning Quest</div><div className="flex items-center gap-2"><h1 className="font-black truncate" style={{color:'var(--text-1)'}}>{lawName} · 第 {articleId} 條</h1>{detail.importance >= 4 && <span className="hidden sm:inline text-[10px] font-black bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-full">高頻考點</span>}</div></div>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <button onClick={() => toggleBookmark(lawId, articleId, 'important')} title="重要" className={`w-9 h-9 flex items-center justify-center rounded-full border transition ${isImportant?'bg-amber-500 text-white border-amber-500':'card'}`} style={!isImportant?{color:'var(--text-3)'}:undefined}><Bookmark size={15} className={isImportant?'fill-current':''}/></button>
          <button onClick={() => toggleBookmark(lawId, articleId, 'memorize')} title="必背" className={`w-9 h-9 flex items-center justify-center rounded-full border text-xs font-black transition ${isMemorize?'bg-rose-500 text-white border-rose-500':'card'}`} style={!isMemorize?{color:'var(--text-3)'}:undefined}>背</button>
          <button onClick={() => toggleBookmark(lawId, articleId, 'confusing')} title="不懂" className={`w-9 h-9 flex items-center justify-center rounded-full border transition ${isConfusing?'bg-orange-500 text-white border-orange-500':'card'}`} style={!isConfusing?{color:'var(--text-3)'}:undefined}><HelpCircle size={15}/></button>
        </div>
      </div>

      <div className="px-4 md:px-6 pt-5 space-y-5">
        <section className="card rounded-[1.6rem] p-5 md:p-6 shadow-sm soft-grid relative overflow-hidden">
          <div className="absolute right-5 top-4 text-4xl opacity-90">⚖️</div>
          <div className="relative pr-14">
            <div className="flex flex-wrap gap-2 text-[11px] font-black">
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300">第一輪 · 建立印象</span>
              <span className="px-2.5 py-1 rounded-full" style={{background:'var(--muted)', color:'var(--text-3)'}}>{currentIndex >= 0 ? `本法第 ${currentIndex + 1}/${articles.length} 關` : `第 ${articleId} 條`}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black mt-4 leading-relaxed" style={{color:'var(--text-1)'}}>{detail.oneLiner}</h2>
            <div className="mt-4 flex flex-wrap gap-2">{detail.keywords.map(k => <span key={k} className="text-xs px-2.5 py-1 rounded-full border" style={{borderColor:'var(--border)', color:'var(--text-2)', background:'var(--card)'}}>#{k}</span>)}</div>
          </div>
          <div className="mt-5 flex items-center gap-3"><div className="flex-1 h-2 rounded-full xp-track overflow-hidden"><div className="h-full bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full transition-all" style={{width:`${lawProgress}%`}}/></div><span className="text-xs font-black" style={{color:'var(--text-3)'}}>{lawProgress}%</span></div>
        </section>

        <section className="card rounded-[1.6rem] p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3"><div className="w-11 h-11 rounded-2xl bg-violet-500/10 text-violet-600 flex items-center justify-center"><Headphones size={20}/></div><div><div className="text-sm font-black" style={{color:'var(--text-1)'}}>讓老師講給你聽</div><div className="text-xs mt-0.5" style={{color:'var(--text-3)'}}>自然 AI 語音優先，失敗自動使用裝置最佳中文聲線</div></div></div>
          <AudioPlayer text={fullTextForAudio}/>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-2 text-xs font-black" style={{color:'var(--text-2)'}}><BookText size={16} className="text-slate-500"/> A. 法條原文 <span className="font-normal" style={{color:'var(--text-3)'}}>官方文字，不由 AI 改寫</span></div>
          <div className="card rounded-[1.6rem] p-5 md:p-7 text-[15px] md:text-lg leading-loose tracking-wide font-serif whitespace-pre-wrap shadow-sm" style={{color:'var(--text-1)'}}>{detail.articleText}</div>
          <p className="text-[11px] mt-2 flex items-center gap-1.5" style={{color:'var(--text-3)'}}><Scale size={12}/> 資料來源以官方法規資料為準；版本資訊依資料更新流程追蹤。</p>
        </section>

        <section className="rounded-[1.6rem] p-5 md:p-6 border bg-indigo-500/[0.045] border-indigo-500/15">
          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 mb-3 font-black text-sm"><MessageCircleQuestion size={18}/> B. 老師白話講解</div>
          <p className="leading-loose text-[15px] md:text-base" style={{color:'var(--text-1)'}}>{detail.explanation}</p>
        </section>

        <section className="grid md:grid-cols-2 gap-4">
          <div className="card rounded-[1.6rem] p-5">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-black text-sm"><Lightbulb size={17}/> C. 為什麼這樣規定</div>
            <p className="mt-3 leading-relaxed text-sm" style={{color:'var(--text-2)'}}>{detail.why}</p>
          </div>
          <div className="card rounded-[1.6rem] p-5">
            <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300 font-black text-sm"><GraduationCap size={17}/> D. 生活案例</div>
            {detail.cases.slice(0,1).map((c, i) => <div key={i} className="mt-3"><div className="text-sm font-black" style={{color:'var(--text-1)'}}>{c.title}</div><p className="text-sm mt-1 leading-relaxed" style={{color:'var(--text-2)'}}>{c.content}</p></div>)}
          </div>
        </section>

        <section className="card rounded-[1.6rem] p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-3"><div><div className="text-sm font-black flex items-center gap-2" style={{color:'var(--text-1)'}}><BrainCircuit size={17} className="text-violet-600"/> 卡住就點，不用硬撐</div><div className="text-xs mt-1" style={{color:'var(--text-3)'}}>第一輪只要把疑問拆小，不需要一次學成法律人。</div></div><span className="text-2xl">🧠</span></div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[
              { k:'simpler', l:'再講白一點', emoji:'🗣️' },
              { k:'example', l:'換一個例子', emoji:'🏠' },
              { k:'why2', l:'為什麼？', emoji:'💡' },
              { k:'important', l:'這條重要嗎？', emoji:'⭐' },
              { k:'confuse', l:'跟哪條搞混？', emoji:'🔀' },
              { k:'exam', l:'考試怎麼考？', emoji:'🎯' },
            ].map(button => <button key={button.k} onClick={() => setActiveHelp(activeHelp===button.k?null:button.k)} className={`px-3 py-3 rounded-xl border text-sm font-black transition text-left ${activeHelp===button.k?'bg-indigo-600 border-indigo-600 text-white':'card card-hover'}`} style={activeHelp!==button.k?{color:'var(--text-2)'}:undefined}><span className="mr-1.5">{button.emoji}</span>{button.l}</button>)}
          </div>
          {activeHelp && <div className="mt-3 rounded-xl p-4 text-sm leading-relaxed border" style={{background:'var(--muted)', borderColor:'var(--border)', color:'var(--text-2)'}}>
            {activeHelp==='simpler' && `最簡單的抓法：${detail.oneLiner}`}
            {activeHelp==='example' && detail.cases[0]?.content}
            {activeHelp==='why2' && detail.why}
            {activeHelp==='important' && `重要度 ${'★'.repeat(detail.importance)}。${detail.examTips.join('；')}`}
            {activeHelp==='confuse' && (detail.confuseWith?.map(c => `${c.article}：${c.diff}`).join('；') || '目前沒有整理好的易混淆對照，可先看前後條文。')}
            {activeHelp==='exam' && detail.examTips.join('；')}
          </div>}
          <Link href="/teacher" className="mt-3 inline-flex items-center gap-1.5 text-sm font-black text-indigo-600"><MessageCircleQuestion size={14}/> 還是不懂，直接問 AI 老師 →</Link>
        </section>

        <section className="grid md:grid-cols-2 gap-4">
          <div className="rounded-[1.6rem] p-5 border bg-rose-500/[0.04] border-rose-500/15"><div className="text-rose-700 dark:text-rose-300 font-black text-sm mb-2 flex items-center gap-1.5"><AlertTriangle size={16}/> 容易誤會</div><ul className="space-y-2 text-sm" style={{color:'var(--text-2)'}}>{detail.pitfalls.map((p,i) => <li key={i} className="flex gap-2"><span className="text-rose-500">•</span><span>{p}</span></li>)}</ul></div>
          <div className="rounded-[1.6rem] p-5 border bg-amber-500/[0.04] border-amber-500/15"><div className="text-amber-700 dark:text-amber-300 font-black text-sm mb-2 flex items-center gap-1.5"><Flag size={16}/> 考試提醒</div><ul className="space-y-2 text-sm" style={{color:'var(--text-2)'}}>{detail.examTips.map((p,i) => <li key={i} className="flex gap-2"><span className="text-amber-500">•</span><span>{p}</span></li>)}</ul></div>
        </section>

        {detail.relatedArticles.length > 0 && <section className="card rounded-[1.6rem] p-5"><div className="text-xs font-black mb-3" style={{color:'var(--text-3)'}}>相關法條節點</div><div className="flex flex-wrap gap-2">{detail.relatedArticles.map(r => <span key={r} className="text-xs px-2.5 py-1 rounded-full border" style={{borderColor:'var(--border)', color:'var(--text-2)', background:'var(--muted)'}}>{r}</span>)}</div></section>}

        <section className="card rounded-[1.8rem] p-5 md:p-6 quest-glow relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-28 h-28 bg-emerald-500/10 blur-2xl rounded-full"/>
          <div className="relative flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1"><div className="text-xs font-black text-emerald-600">完成本關</div><h3 className="text-lg font-black mt-1" style={{color:'var(--text-1)'}}>{isMarked ? '這一條已經走過，可以放心往前。' : '大致懂了就過關，不必等到百分之百。'}</h3><div className="mt-2 flex flex-wrap gap-2 text-[11px]"><span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300"><Trophy size={12}/> LV.{game.level}</span><span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"><Zap size={12}/> 完成 +12 XP</span></div></div>
            <div className="flex flex-col gap-2 md:min-w-64"><button onClick={handleMarkAsRead} className={`px-6 py-4 rounded-xl font-black text-base flex justify-center items-center gap-2 transition active:scale-[0.99] ${isMarked?'bg-emerald-600 text-white':'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'}`}>{isMarked ? <><CheckCircle2 size={20}/> 已完成 · 點擊取消</> : <>✅ 大致懂了，完成這關</>}</button><ChatGPTButton article={`${lawName}第 ${articleId} 條`} text={`${detail.articleText}\n\n白話：${detail.oneLiner}\n講解：${detail.explanation}`}/></div>
          </div>
        </section>
      </div>

      <footer className="fixed bottom-0 left-0 md:left-[280px] right-0 glass border-t p-3 flex justify-between z-30 pb-[max(0.75rem,env(safe-area-inset-bottom))]" style={{borderColor:'var(--border)'}}>
        {prevId ? <Link href={`/articles/${prevId}`} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold hover:bg-indigo-500/10" style={{color:'var(--text-2)'}}><ChevronLeft size={18}/> 上一條</Link> : <span className="px-3 py-2 text-sm" style={{color:'var(--text-3)'}}>已是首條</span>}
        <Link href={`/laws/${lawId}`} className="text-xs font-bold px-2 py-2" style={{color:'var(--text-3)'}}>回目錄</Link>
        {nextId ? <Link href={`/articles/${nextId}`} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-black bg-indigo-600 text-white shadow-sm">下一條 <ChevronRight size={18}/></Link> : <span className="px-3 py-2 text-sm" style={{color:'var(--text-3)'}}>已是末條</span>}
      </footer>

      {showToast && <div className="fixed bottom-24 left-1/2 -translate-x-1/2 card text-sm font-black px-4 py-2.5 rounded-full shadow-xl z-40" style={{color:'var(--text-1)'}}>{showToast}</div>}
      {showReward && <div className="fixed bottom-36 left-1/2 -translate-x-1/2 z-50 reward-burst pointer-events-none"><div className="bg-amber-300 text-amber-950 font-black px-5 py-3 rounded-full shadow-xl whitespace-nowrap">✨ +12 XP · 過關！ 🏆</div></div>}
    </div>
  );
}
