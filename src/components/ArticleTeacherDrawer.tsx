'use client';

import { useEffect, useRef, useState } from 'react';
import { Bot, Loader2, Send, Sparkles, X, RotateCcw, House, Target, Lightbulb, Star, GitCompareArrows } from 'lucide-react';
import type { ArticleDetailData } from '@/data/articleDetailTypes';
import { getStoredAiKeys } from '@/lib/aiKeys';

type Message = { role: 'ai' | 'user'; content: string; provider?: string };

type Props = {
  open: boolean;
  onClose: () => void;
  lawName: string;
  articleId: string;
  detail: ArticleDetailData;
};

export function ArticleTeacherDrawer({ open, onClose, lawName, articleId, detail }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const initialized = useRef(false);
  const endRef = useRef<HTMLDivElement>(null);

  const context = `B 白話解析：${detail.explanation}\nC 為什麼：${detail.why}\nD 案例：${detail.cases.map(c => `${c.title}：${c.content}`).join('\n')}\n易錯：${detail.pitfalls.join('；')}\n易混淆：${(detail.confuseWith || []).map(item => `${item.article}：${item.diff}`).join('；')}\n考點：${detail.examTips.join('；')}`;

  const ask = async (question: string) => {
    const q = question.trim();
    if (!q || loading) return;
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lawName,
          articleId,
          articleText: detail.articleText,
          teachingContext: context,
          question: q,
          keys: getStoredAiKeys(),
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', content: data.reply || data.error || '目前沒有回覆。', provider: data.provider }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', content: '外部 AI 連線失敗；請稍後重試。即使沒有 API Key，六個快捷問題仍可使用本機教材模式。' }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open || initialized.current) return;
    initialized.current = true;
    void ask(`我現在正在學${lawName}第${articleId}條。請先自動讀取目前條文與教材，用 5 句以內告訴我：這條到底在管什麼、最重要要記什麼，並主動提醒一個最常考的陷阱。`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [open, onClose]);

  if (!open) return null;
  const quick = [
    { label: '再講白一點', icon: Sparkles, prompt: '請不要重複法條原文。把這一條拆成「誰、在什麼情況、可以或必須做什麼、最後法律效果是什麼」，用完全零法律基礎也聽得懂的方式講一次。' },
    { label: '換一個例子', icon: House, prompt: '請換一個全新的台灣房屋、土地、仲介或地政實務案例。要有人物、具體事實，再逐步指出本條每個要件如何套用。' },
    { label: '為什麼？', icon: Lightbulb, prompt: '請專門解釋這條的制度目的：法律到底想解決什麼現實問題？如果沒有這條會發生什麼問題？不要只說維護交易秩序。' },
    { label: '這條重要嗎？', icon: Star, prompt: '請以不動產經紀人國考角度評估這條重要度（1到5星），說明理由，並列出我最低限度一定要背的內容。' },
    { label: '容易搞混？', icon: GitCompareArrows, prompt: '請找出這條最容易和哪一條或哪個概念搞混，做成「本條 vs 易混淆內容」對照，明確指出主體、要件、效果或期限差異。' },
    { label: '考試怎麼考？', icon: Target, prompt: '請用國考老師方式告訴我這條最常怎麼出題，列出3個陷阱，再現場出1題四選一題目並附答案解析。' },
  ];

  return (
    <div className="fixed inset-0 z-[95] flex justify-end" role="dialog" aria-modal="true" aria-label="AI 法規老師">
      <button aria-label="關閉 AI 老師" onClick={onClose} className="absolute inset-0 bg-slate-950/35 backdrop-blur-[2px]" />
      <aside className="relative w-full sm:max-w-[520px] h-full ai-drawer flex flex-col shadow-2xl border-l" style={{ borderColor: 'var(--border)' }}>
        <header className="px-4 py-4 border-b flex items-start justify-between gap-3" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0"><Bot size={19}/></div>
            <div className="min-w-0"><div className="text-[10px] font-black tracking-[.14em] text-indigo-600">CONTEXT-AWARE TUTOR</div><h2 className="text-sm font-black text-primary truncate">AI 老師 · {lawName}第 {articleId} 條</h2><p className="text-[10px] mt-0.5 text-tertiary">條文與 B/C/D 已自動帶入，不必再複製貼上。</p></div>
          </div>
          <button onClick={onClose} className="icon-button shrink-0"><X size={16}/></button>
        </header>

        <div className="px-4 py-3 border-b grid grid-cols-2 sm:grid-cols-3 gap-2" style={{ borderColor: 'var(--border)' }}>
          {quick.map(item => <button key={item.label} onClick={() => void ask(item.prompt)} disabled={loading} className="surface rounded-xl px-3 py-2.5 text-[10px] font-black text-secondary flex items-center justify-center gap-1.5 text-center card-hover"><item.icon size={12}/>{item.label}</button>)}
        </div>

        <main className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
          {messages.map((message, index) => <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${message.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'card text-secondary rounded-tl-sm'}`}>{message.role==='ai' && message.provider && <div className="text-[9px] font-black text-indigo-600 mb-1.5">{message.provider} · 備援路由</div>}{message.content}</div></div>)}
          {loading && <div className="flex items-center gap-2 text-xs text-tertiary"><Loader2 size={14} className="animate-spin"/>老師正在讀這一條的脈絡…</div>}
          <div ref={endRef}/>
        </main>

        <footer className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="card rounded-2xl p-2 flex items-end gap-2">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void ask(input);
                }
              }}
              rows={2}
              placeholder="直接問這一條… Enter 送出，Shift+Enter 換行"
              className="flex-1 bg-transparent resize-none outline-none px-2 py-2 text-sm text-primary placeholder:text-tertiary"
            />
            <button onClick={() => void ask(input)} disabled={!input.trim() || loading} className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center disabled:opacity-40"><Send size={16}/></button>
          </div>
          <button onClick={() => { setMessages([]); initialized.current = false; }} className="mt-2 text-[10px] font-bold text-tertiary flex items-center gap-1"><RotateCcw size={11}/>清除本次對話</button>
        </footer>
      </aside>
    </div>
  );
}
