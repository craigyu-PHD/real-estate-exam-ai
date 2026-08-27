'use client';

import { useEffect, useRef, useState } from 'react';
import { Bot, GitCompareArrows, House, Lightbulb, Loader2, RotateCcw, Send, Sparkles, Star, Target, X } from 'lucide-react';
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
  const drawerRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const context = `B 白話解析：${detail.explanation}\nC 為什麼：${detail.why}\nD 案例：${detail.cases.map(c => `${c.title}：${c.content}`).join('\n')}\n易錯：${detail.pitfalls.join('；')}\n易混淆：${(detail.confuseWith || []).map(item => `${item.article}：${item.diff}`).join('；')}\n考點：${detail.examTips.join('；')}`;

  const ask = async (question: string) => {
    const q = question.trim();
    if (!q || loading) return;
    setMessages(previous => [...previous, { role: 'user', content: q }]);
    setInput('');
    setLoading(true);
    try {
      const response = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lawName, articleId, articleText: detail.articleText, teachingContext: context, question: q, keys: getStoredAiKeys() }),
      });
      const data = await response.json();
      setMessages(previous => [...previous, { role: 'ai', content: data.reply || data.error || '目前沒有回覆。', provider: data.provider }]);
    } catch {
      setMessages(previous => [...previous, { role: 'ai', content: '外部 AI 連線失敗；請稍後重試。即使沒有 API Key，快捷問題仍可使用本機教材模式。' }]);
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

  useEffect(() => {
    const reduceMotion = document.documentElement.dataset.motion === 'calm' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    endRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [messages, loading]);
  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const getFocusable = () => Array.from(drawerRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])') || []);
    const focusTimer = window.requestAnimationFrame(() => drawerRef.current?.querySelector<HTMLElement>('[data-dialog-close]')?.focus());
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = getFocusable();
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      const previousFocus = previousFocusRef.current;
      window.requestAnimationFrame(() => previousFocus?.isConnected && previousFocus.focus());
    };
  }, [open, onClose]);

  if (!open) return null;

  const quick = [
    { label: '再講白一點', icon: Sparkles, prompt: '請不要重複法條原文。把這一條拆成「誰、在什麼情況、可以或必須做什麼、最後法律效果是什麼」，用完全零法律基礎也聽得懂的方式講一次。' },
    { label: '換一個例子', icon: House, prompt: '請換一個全新的台灣房屋、土地、仲介或地政實務案例。要有人物、具體事實，再逐步指出本條每個要件如何套用。' },
    { label: '制度目的', icon: Lightbulb, prompt: '請專門解釋這條的制度目的：法律到底想解決什麼現實問題？如果沒有這條會發生什麼問題？不要只說維護交易秩序。' },
    { label: '重要度', icon: Star, prompt: '請以不動產經紀人國考角度評估這條重要度（1到5星），說明理由，並列出我最低限度一定要背的內容。' },
    { label: '比較差異', icon: GitCompareArrows, prompt: '請找出這條最容易和哪一條或哪個概念搞混，做成「本條 vs 易混淆內容」對照，明確指出主體、要件、效果或期限差異。' },
    { label: '考試怎麼考', icon: Target, prompt: '請用國考老師方式告訴我這條最常怎麼出題，列出3個陷阱，再現場出1題四選一題目並附答案解析。' },
  ];

  return (
    <div className="fixed inset-0 z-[95] flex justify-end">
      <button type="button" aria-label="關閉 AI 老師" onClick={onClose} className="absolute inset-0 bg-slate-950/45"/>
      <aside ref={drawerRef} role="dialog" aria-modal="true" aria-labelledby="article-teacher-title" className="relative w-full sm:max-w-[540px] h-full ai-drawer flex flex-col border-l" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
        <header className="px-4 md:px-5 py-4 border-b flex items-start justify-between gap-3" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg surface flex items-center justify-center shrink-0"><Bot size={17} strokeWidth={1.9} style={{ color: 'var(--primary)' }}/></div>
            <div className="min-w-0"><div className="text-xs font-medium tracking-[0.1em] text-tertiary">CONTEXT-AWARE TUTOR</div><h2 id="article-teacher-title" className="text-base font-semibold mt-1 text-primary truncate">AI 老師 · {lawName}第 {articleId} 條</h2><p className="text-xs mt-1 text-tertiary">條文與教學脈絡已自動帶入。</p></div>
          </div>
          <button type="button" onClick={onClose} className="icon-button shrink-0" aria-label="關閉 AI 老師" data-dialog-close><X size={16} strokeWidth={1.9}/></button>
        </header>

        <div className="px-4 md:px-5 py-3 border-b flex flex-wrap gap-2" style={{ borderColor: 'var(--border)' }}>
          {quick.map(item => <button key={item.label} type="button" onClick={() => void ask(item.prompt)} disabled={loading} className="workspace-secondary-action !min-h-9 !px-3 !text-xs disabled:opacity-50"><item.icon size={13} strokeWidth={1.9}/>{item.label}</button>)}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 md:px-5 py-5 space-y-5">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={message.role === 'user' ? 'ml-auto max-w-[88%]' : 'max-w-full'}>
              {message.role === 'ai' ? (
                <div className="text-sm leading-7 whitespace-pre-wrap text-secondary">
                  {message.provider && <div className="text-xs font-medium mb-2" style={{ color: 'var(--primary)' }}>{message.provider} · Provider route</div>}
                  {message.content}
                </div>
              ) : (
                <div className="surface rounded-xl px-4 py-3 text-sm leading-6 text-primary whitespace-pre-wrap">{message.content}</div>
              )}
            </div>
          ))}
          {loading && <div className="flex items-center gap-2 text-sm text-tertiary"><Loader2 size={14} strokeWidth={1.9} className="animate-spin"/>老師正在讀取本條脈絡…</div>}
          <div ref={endRef}/>
        </div>

        <footer className="p-3 md:p-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="surface rounded-xl p-2 flex items-end gap-2">
            <textarea
              value={input}
              onChange={event => setInput(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  void ask(input);
                }
              }}
              rows={2}
              aria-label="向 AI 老師提問"
              placeholder="直接問這一條… Enter 送出，Shift+Enter 換行"
              className="flex-1 bg-transparent resize-none outline-none px-2 py-2 text-sm text-primary placeholder:text-tertiary"
            />
            <button type="button" onClick={() => void ask(input)} disabled={!input.trim() || loading} className="w-10 h-10 rounded-lg text-white flex items-center justify-center disabled:opacity-40" aria-label="送出問題" style={{ background: 'var(--primary)' }}><Send size={16} strokeWidth={1.9}/></button>
          </div>
          <button type="button" onClick={() => { setMessages([]); initialized.current = false; }} className="mt-3 text-xs font-medium text-tertiary flex items-center gap-1.5"><RotateCcw size={13} strokeWidth={1.9}/>清除本次對話</button>
        </footer>
      </aside>
    </div>
  );
}
