'use client';
import { useState, use } from 'react';
import Link from 'next/link';
import { MessageCircleQuestion, Lightbulb, BookText, Bookmark, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, Scale, GraduationCap, HelpCircle, Sparkles, ArrowLeft, Copy } from 'lucide-react';
import { AudioPlayer } from '@/components/AudioPlayer';
import { ChatGPTButton } from '@/components/ChatGPTButton';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useProgress } from '@/hooks/useProgress';
import { getArticleDetail } from '@/data/articleExplanations';
import { lawsData } from '@/data/lawsData';

export default function ArticleDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { markAsRead } = useProgress();
  const { hasBookmark, toggleBookmark } = useBookmarks();
  const [isMarked, setIsMarked] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);
  const [activeHelp, setActiveHelp] = useState<string | null>(null);

  const rawId = resolvedParams.id;
  const lawId = rawId.includes('-') ? rawId.split('-')[0] : 'civil';
  const articleId = rawId.includes('-') ? rawId.split('-')[1] : rawId;
  const detail = getArticleDetail(lawId, articleId)!;
  const lawName = lawsData.find(l => l.id === lawId)?.name || lawId;

  const num = parseInt(articleId, 10);
  const prevId = Number.isFinite(num) && num > 1 ? `${lawId}-${num - 1}` : null;
  const nextId = Number.isFinite(num) ? `${lawId}-${num + 1}` : null;

  const handleMarkAsRead = () => {
    if (isMarked) { // undo
      setIsMarked(false);
      setShowToast('已取消已讀');
      setTimeout(()=>setShowToast(null), 1500);
      return;
    }
    markAsRead(lawId, articleId);
    setIsMarked(true);
    setShowToast('已標為已讀，進度已更新');
    setTimeout(()=>setShowToast(null), 1500);
  };

  const isImportant = hasBookmark(lawId, articleId, 'important');
  const isMemorize = hasBookmark(lawId, articleId, 'memorize');
  const isConfusing = hasBookmark(lawId, articleId, 'confusing');

  const fullTextForAudio = `${lawName}第${articleId}條。${detail.articleText}。一句話：${detail.oneLiner}。講解：${detail.explanation}`;

  return (
    <div className="max-w-3xl mx-auto pb-28 relative z-10">
      <div className="sticky top-0 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 p-3 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <Link href={`/laws/${lawId}`} className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white"><ArrowLeft size={16} /></Link>
          <span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded-full border border-slate-700">{lawName}</span>
          <h1 className="font-bold text-white">第 {articleId} 條</h1>
          {detail.importance >= 4 && <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">★ 重要</span>}
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => toggleBookmark(lawId, articleId, 'important')} title="重要" className={`w-9 h-9 flex items-center justify-center rounded-full border transition ${isImportant ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'}`}><Bookmark size={16} className={isImportant ? 'fill-current' : ''} /></button>
          <button onClick={() => toggleBookmark(lawId, articleId, 'memorize')} title="必背" className={`w-9 h-9 flex items-center justify-center rounded-full border text-xs font-bold transition ${isMemorize ? 'bg-rose-500 text-white border-rose-500' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'}`}>必</button>
          <button onClick={() => toggleBookmark(lawId, articleId, 'confusing')} title="不懂" className={`w-9 h-9 flex items-center justify-center rounded-full border transition ${isConfusing ? 'bg-orange-500 text-white border-orange-500' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'}`}><HelpCircle size={16} /></button>
        </div>
      </div>

      <div className="px-4 py-3">
        <nav className="text-xs text-slate-500 flex items-center gap-1">
          <Link href="/laws" className="hover:text-slate-300">法規</Link> <ChevronRight size={12} /> <Link href={`/laws/${lawId}`} className="hover:text-slate-300">{lawName}</Link> <ChevronRight size={12} /> <span className="text-slate-300">第{articleId}條</span>
        </nav>
      </div>

      <main className="px-4 md:px-6 space-y-6">
        {/* Audio always visible & easy to tap */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-emerald-300 text-sm font-semibold"><Sparkles size={16} /> 老師講給你聽</div>
          <AudioPlayer text={fullTextForAudio} />
        </div>

        <section className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border border-blue-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-2 text-blue-300 mb-3 font-semibold text-sm"><Lightbulb size={18} /> 一句話抓住重點</div>
          <p className="text-xl md:text-2xl font-bold text-white leading-relaxed">{detail.oneLiner}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {detail.keywords.map(k => <span key={k} className="text-xs bg-white/10 text-blue-100 border border-white/10 px-2 py-1 rounded-full">#{k}</span>)}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 text-slate-400 mb-3 font-semibold text-sm"><BookText size={18} /> 法條原文（不得由 AI 改寫）</div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-[15px] md:text-lg text-slate-200 leading-loose tracking-wide font-serif whitespace-pre-wrap">{detail.articleText}</div>
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1"><Scale size={12} /> 來源：全國法規資料庫，版本追蹤見設定頁</p>
        </section>

        <section>
          <div className="flex items-center gap-2 text-emerald-400 mb-3 font-semibold text-sm"><MessageCircleQuestion size={18} /> 老師白話講解</div>
          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-2xl p-6 text-slate-200 leading-loose text-[15px] md:text-base">{detail.explanation}</div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 text-amber-300 mb-3 font-semibold text-sm"><AlertTriangle size={18} /> 為什麼這樣規定</div>
          <p className="text-slate-300 leading-relaxed text-sm md:text-base">{detail.why}</p>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2 text-sky-300 font-semibold text-sm"><GraduationCap size={18} /> 生活案例</div>
          {detail.cases.map((c, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="text-sm font-bold text-white mb-2">{c.title}</div>
              <p className="text-slate-300 text-sm leading-relaxed">{c.content}</p>
            </div>
          ))}
        </section>

        {/* 我還是不懂 */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-sm font-bold text-white mb-3">我還是不懂</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[
              { k: 'simpler', l: '再講白一點' },
              { k: 'example', l: '換一個例子' },
              { k: 'why2', l: '為什麼？' },
              { k: 'important', l: '這條重要嗎？' },
              { k: 'confuse', l: '跟哪條搞混？' },
              { k: 'exam', l: '考試怎麼考？' },
            ].map(b => (
              <button key={b.k} onClick={() => setActiveHelp(activeHelp===b.k?null:b.k)} className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition ${activeHelp===b.k?'bg-blue-600 border-blue-500 text-white':'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`}>{b.l}</button>
            ))}
          </div>
          {activeHelp && (
            <div className="mt-3 bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-300 leading-relaxed">
              {activeHelp==='simpler' && '白話再簡化：用「登記＝拿到鑰匙＋戶口名簿改名」的比喻，沒改名就還不是你家。'}
              {activeHelp==='example' && detail.cases[0]?.content}
              {activeHelp==='why2' && detail.why}
              {activeHelp==='important' && `重要度 ${'★'.repeat(detail.importance)}：${detail.examTips.join('；')}`}
              {activeHelp==='confuse' && (detail.confuseWith?.map(c=>`${c.article}：${c.diff}`).join('；') || '本條暫無易混淆對照，建議對照前後條文。')}
              {activeHelp==='exam' && detail.examTips.join('；')}
            </div>
          )}
          <div className="mt-3">
            <Link href="/teacher" className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300"><MessageCircleQuestion size={14} /> 直接問 AI 老師 →</Link>
          </div>
        </section>

        {/* 易錯＆考試提醒 */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-rose-900/10 border border-rose-500/20 rounded-2xl p-5">
            <div className="text-rose-300 font-semibold text-sm mb-2 flex items-center gap-1.5"><AlertTriangle size={16} /> 容易誤會</div>
            <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">{detail.pitfalls.map((p,i)=><li key={i}>{p}</li>)}</ul>
          </div>
          <div className="bg-amber-900/10 border border-amber-500/20 rounded-2xl p-5">
            <div className="text-amber-300 font-semibold text-sm mb-2 flex items-center gap-1.5"><GraduationCap size={16} /> 考試提醒</div>
            <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">{detail.examTips.map((p,i)=><li key={i}>{p}</li>)}</ul>
          </div>
        </div>

        {detail.relatedArticles.length>0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="text-slate-400 text-sm font-semibold mb-2">相關法條</div>
            <div className="flex flex-wrap gap-2">{detail.relatedArticles.map(r=> <span key={r} className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-2 py-1 rounded-full">{r}</span>)}</div>
          </div>
        )}

        <section className="pt-4 border-t border-slate-800">
          <div className="flex flex-col md:flex-row gap-3">
            <button onClick={handleMarkAsRead} className={`flex-1 px-6 py-4 rounded-xl font-bold text-base flex justify-center items-center gap-2 transition ${isMarked ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'}`}>
              {isMarked ? <><CheckCircle2 size={20} /> 已完成（再按可取消）</> : '大致懂了，標為已讀'}
            </button>
            <ChatGPTButton article={`${lawName}第 ${articleId} 條`} text={`${detail.articleText}\n\n白話：${detail.oneLiner}\n講解：${detail.explanation}`} />
          </div>
          <p className="text-xs text-slate-500 mt-2 text-center">已讀會更新首頁進度與連續天數；可隨時取消，不怕誤觸</p>
        </section>
      </main>

      <footer className="fixed bottom-0 left-0 md:left-64 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-800 p-3 flex justify-between z-20 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {prevId ? <Link href={`/articles/${prevId}`} className="flex items-center gap-1.5 text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800 text-sm"><ChevronLeft size={18} /> 上一條</Link> : <span className="px-3 py-2 text-slate-600 text-sm">已是首條</span>}
        <Link href={`/laws/${lawId}`} className="text-xs text-slate-500 hover:text-slate-300 px-2 py-2">回目錄</Link>
        {nextId ? <Link href={`/articles/${nextId}`} className="flex items-center gap-1.5 text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800 text-sm">下一條 <ChevronRight size={18} /></Link> : <span className="px-3 py-2 text-slate-600 text-sm">已是末條</span>}
      </footer>

      {showToast && <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-sm px-4 py-2 rounded-full border border-slate-700 shadow-xl z-30">{showToast}</div>}
    </div>
  );
}
