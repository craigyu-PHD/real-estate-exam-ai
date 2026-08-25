'use client';
import { useState } from 'react';
import { Bot, Send, User } from 'lucide-react';

export default function AITeacher() {
  const [messages, setMessages] = useState([
    { role: 'ai', content: '你好！我是你的不動產經紀人考試 AI 老師。在閱讀法規時遇到任何困難，都可以隨時問我。我可以幫你舉例子、比較法條，或是出題考考你。' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages([...messages, { role: 'user', content: input }]);
    setInput('');
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', content: '（這是一個模擬回答，未來將串接 Gemini API 進行專業的法規解說）' }]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] md:h-screen">
      <header className="bg-slate-900 border-b border-slate-800 p-4 flex items-center gap-3 shrink-0">
        <Bot size={28} className="text-blue-500" />
        <div>
          <h1 className="text-lg font-bold text-white">AI 老師</h1>
          <p className="text-xs text-slate-400">Gemini 驅動・專業法規解說</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 max-w-3xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-700' : 'bg-blue-900/50 text-blue-400'}`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'}`}>
              {msg.content}
            </div>
          </div>
        ))}
      </main>

      <footer className="p-4 bg-slate-900 border-t border-slate-800 shrink-0 mb-14 md:mb-0">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="問我任何法規問題，例如：民法758條到底在說什麼？" 
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-full py-4 pl-6 pr-14 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <button 
            type="submit"
            className="absolute right-2 top-2 bottom-2 w-10 h-10 bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center rounded-full transition-colors"
          >
            <Send size={18} className="ml-1" />
          </button>
        </form>
      </footer>
    </div>
  );
}
