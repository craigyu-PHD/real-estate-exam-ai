'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Bot, KeyRound, Loader2, Send, User } from 'lucide-react';
import { WorkspacePageHeader } from '@/components/WorkspacePageHeader';
import { getStoredAiKeys } from '@/lib/aiKeys';

type Msg = { role: 'ai' | 'user'; content: string; provider?: string };

const quickPrompts = [
  { label: '解釋概念', prompt: '請用白話解釋這個不動產法規概念，先講核心規則，再補充適用情境。' },
  { label: '比較差異', prompt: '請幫我比較兩個容易混淆的不動產法規概念，整理成立即看得懂的差異。' },
  { label: '舉例說明', prompt: '請用一個具體的不動產交易案例，示範法規如何實際適用。' },
  { label: '國考考點', prompt: '請整理這個主題在不動產經紀人國考最常見的考法、陷阱與判斷順序。' },
  { label: '出題測驗', prompt: '請針對我現在問的主題出 3 題單選題，作答後再公布答案與解析。' },
];

export default function AITeacher() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'ai',
      content: '你好，我是不動產法規 AI 老師。你可以直接輸入法規名稱、條號或概念，我會先確認規則，再用白話、案例與國考角度拆解。',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async (query: string) => {
    if (!query.trim() || loading) return;
    const text = query.trim();
    setMessages(value => [...value, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);
    try {
      const response = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleText: '', question: text, lawName: '', articleId: '', keys: getStoredAiKeys() }),
      });
      const data = await response.json();
      setMessages(value => [...value, { role: 'ai', content: data.reply || data.error || '目前沒有回覆', provider: data.provider }]);
    } catch {
      setMessages(value => [...value, { role: 'ai', content: '連線失敗，請稍後再試。' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell max-w-6xl min-h-[calc(100dvh-4rem)] flex flex-col gap-5">
      <WorkspacePageHeader
        eyebrow="AI TUTOR"
        title="AI 老師"
        description="法規原文與 AI 解讀分離。直接輸入法規、條號、概念或考題，系統會優先使用可用 Provider，必要時回到 Local Tutor。"
        actions={
          <Link href="/settings" className="workspace-secondary-action">
            <KeyRound size={15} strokeWidth={1.9}/> AI 設定
          </Link>
        }
      />

      <div className="grid lg:grid-cols-[minmax(0,1fr)_280px] gap-5 flex-1 min-h-0 items-stretch">
        <section className="card rounded-2xl min-h-[620px] flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between gap-4" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                <Bot size={18} strokeWidth={1.9}/>
              </span>
              <div>
                <div className="text-sm font-semibold text-primary">Conversation Workspace</div>
                <div className="text-xs mt-1 text-tertiary">5 API Providers + Local Tutor</div>
              </div>
            </div>
            <span className="text-xs font-medium text-tertiary">{messages.length} 則訊息</span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-4 md:px-6 py-5 space-y-6 sidebar-scroll">
            {messages.map((message, index) => (
              <div key={index} className={`max-w-3xl ${message.role === 'user' ? 'ml-auto' : ''}`}>
                {message.role === 'ai' ? (
                  <div className="flex gap-3">
                    <span className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                      <Bot size={15} strokeWidth={1.9}/>
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-tertiary">
                        <span className="font-medium text-secondary">AI 老師</span>
                        {message.provider && <span>· {message.provider}</span>}
                      </div>
                      <div className="mt-2 text-[15px] leading-7 whitespace-pre-wrap text-secondary">{message.content}</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3 justify-end">
                    <div className="max-w-[86%] rounded-xl border px-4 py-3 text-sm leading-6 whitespace-pre-wrap text-primary" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
                      {message.content}
                    </div>
                    <span className="w-8 h-8 rounded-lg surface shrink-0 flex items-center justify-center text-secondary">
                      <User size={15} strokeWidth={1.9}/>
                    </span>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-sm text-tertiary">
                <Loader2 size={15} strokeWidth={1.9} className="animate-spin"/> 正在整理規則與考點…
              </div>
            )}
          </div>

          <div className="shrink-0 border-t p-4" style={{ borderColor: 'var(--border)' }}>
            <form
              onSubmit={event => {
                event.preventDefault();
                void send(input);
              }}
              className="rounded-xl border p-2 flex items-end gap-2"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
            >
              <textarea
                value={input}
                onChange={event => setInput(event.target.value)}
                onKeyDown={event => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    void send(input);
                  }
                }}
                rows={2}
                aria-label="向 AI 老師提問"
                placeholder="例如：民法第 758 條沒有登記會怎樣？"
                className="flex-1 bg-transparent resize-none outline-none px-2 py-2 text-sm leading-6 text-primary placeholder:text-tertiary"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white disabled:opacity-40"
                style={{ background: 'var(--primary)' }}
                aria-label="送出問題"
              >
                {loading ? <Loader2 size={16} strokeWidth={1.9} className="animate-spin"/> : <Send size={16} strokeWidth={1.9}/>}
              </button>
            </form>
            <div className="mt-2 text-xs text-tertiary">Enter 送出 · Shift + Enter 換行</div>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="surface rounded-2xl p-4">
            <div className="text-xs font-medium tracking-[0.1em] text-tertiary">CURRENT CONTEXT</div>
            <h2 className="text-base font-semibold mt-2 text-primary">全站法規模式</h2>
            <p className="mt-2 text-sm leading-6 text-secondary">目前沒有綁定特定條文。輸入「民法第758條」或其他法名、條號，AI 會自動從本地教材與可用 Provider 組織回答。</p>
          </section>

          <section className="card rounded-2xl p-4">
            <div className="text-xs font-medium tracking-[0.1em] text-tertiary">QUICK ACTIONS</div>
            <h2 className="text-base font-semibold mt-2 text-primary">快速提問</h2>
            <div className="mt-3 grid gap-2">
              {quickPrompts.map(item => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setInput(item.prompt)}
                  className="workspace-secondary-action w-full justify-start"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </section>

          <section className="reader-ai-panel rounded-2xl p-4">
            <div className="text-sm font-semibold text-primary">回答原則</div>
            <ul className="mt-3 space-y-2 text-xs leading-5 text-secondary">
              <li>正式法條與 AI 解讀分離。</li>
              <li>優先白話說明，再補制度目的與案例。</li>
              <li>需要時整理國考陷阱與易混概念。</li>
              <li>外部 Provider 不可用時保留 Local Tutor。</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
