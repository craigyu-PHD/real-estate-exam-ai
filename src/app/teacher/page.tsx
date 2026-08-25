'use client';
import { useState } from 'react';
import { Bot, Send, User, Loader2, Sparkles } from 'lucide-react';

type Msg = { role: 'ai' | 'user'; content: string };

export default function AITeacher() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'ai', content: '你好！我是你的不動產經紀人 AI 老師 🧑‍🏫\n\n我會用「一句話→白話→案例→為什麼→易錯→考試提醒」教你，完全零基礎也能懂。試著問：\n• 民法758條沒登記會怎樣？\n• 767跟184差在哪？\n• 幫我出3題 758 的變形題' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const q = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleText: '', question: q, lawName: '', articleId: '' })
      });
      const j = await res.json();
      const reply = j.reply || j.error || '（沒有回覆，請稍後再試）';
      setMessages(prev => [...prev, { role: 'ai', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', content: '連線失敗，請檢查網路或稍後再試。' }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] md:h-screen">
      <header className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white"><Bot size={16} /></span>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-1.5">AI 老師 <span className="text-xs font-normal text-slate-400">Gemini 驅動</span></h1>
            <p className="text-xs text-slate-500">法條原文由本地資料庫提供，AI只負責解釋不捏造</p>
          </div>
        </div>
        <span className="hidden md:inline-flex items-center gap-1 text-xs bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-1 rounded-full"><Sparkles size={12} /> 越詳細越好</span>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2.5 max-w-3xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.role === 'user' ? 'bg-slate-700 text-slate-300' : 'bg-blue-900/40 text-blue-400 border border-blue-500/20'}`}>
              {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && <div className="flex gap-2 items-center text-slate-400 text-sm"><Loader2 size={16} className="animate-spin" /> 老師正在備課...</div>}
      </main>

      <footer className="p-3 bg-slate-900 border-t border-slate-800 shrink-0 mb-14 md:mb-0">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto relative">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="問：758沒登記會怎樣？或 幫我出題" className="w-full bg-slate-800 border border-slate-700 text-white rounded-full py-3.5 pl-5 pr-12 text-sm focus:outline-none focus:border-blue-500" />
          <button type="submit" disabled={loading} className="absolute right-1.5 top-1.5 bottom-1.5 w-9 h-9 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white flex items-center justify-center rounded-full">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className="ml-0.5" />}
          </button>
        </form>
        <div className="max-w-3xl mx-auto mt-2 flex gap-1.5 overflow-x-auto">
          {['用最白話再講一次758','幫我比較767和962','出3題土地法10條的選擇題'].map(s=> (
            <button key={s} onClick={()=>setInput(s)} className="shrink-0 text-xs bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-full hover:bg-slate-700">{s}</button>
          ))}
        </div>
      </footer>
    </div>
  );
}
