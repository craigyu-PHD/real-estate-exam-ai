'use client';

import { useEffect, useRef, useState } from 'react';
import { Bot, Loader2, Send, Sparkles, X, WandSparkles, RotateCcw, House, Target } from 'lucide-react';
import type { ArticleDetailData } from '@/data/articleDetailTypes';
import { getStoredGeminiKey } from '@/lib/geminiKey';

type Message = { role: 'ai' | 'user'; content: string };

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

  const context = `一句話：${detail.oneLiner}\nB 白話解析：${detail.explanation}\nC 為什麼：${detail.why}\nD 案例：${detail.cases.map(c => `${c.title}：${c.content}`).join('\n')}\n易錯：${detail.pitfalls.join('；')}\n考點：${detail.examTips.join('；')}`;

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
          apiKey: getStoredGeminiKey() || undefined,
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', content: data.reply || data.error || '目前沒有回覆。' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', content: '連線失敗。請先確認 Gemini API 設定與網路連線。' }]);
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
    { label: '再白話一點', icon: Sparkles, prompt: '把這條重新講成國中生也聽得懂的版本，不要只重複原句。' },
    { label: '換房仲案例', icon: House, prompt: '請針對這條換一個全新的房仲、買賣或社區實務案例，並指出案例中每個要件。' },
    { label: '重做考點', icon: Target, prompt: '請重新整理這條最可能怎麼考，列出 3 個具體陷阱與判斷方式。' },
    { label: 'AI 重整教材', icon: WandSparkles, prompt: '請審查目前 B/C/D 教材是否有空泛或不精確之處，然後給我一版更精準的 B 白話解析、C 制度目的、D 實務案例。' },
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

        <div className="px-4 py-3 border-b overflow-x-auto flex gap-2" style={{ borderColor: 'var(--border)' }}>
          {quick.map(item => <button key={item.label} onClick={() => void ask(item.prompt)} disabled={loading} className="surface whitespace-nowrap rounded-full px-3 py-2 text-[10px] font-black text-secondary flex items-center gap-1.5"><item.icon size={12}/>{item.label}</button>)}
        </div>

        <main className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
          {messages.map((message, index) => <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${message.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'card text-secondary rounded-tl-sm'}`}>{message.content}</div></div>)}
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
