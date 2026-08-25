'use client';
import { Share, Check } from 'lucide-react';
import { useState } from 'react';

export function ChatGPTButton({ article, text }: { article: string, text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopyAndOpen = async () => {
    const prompt = `我是準備台灣不動產經紀人考試的初學者。\n\n目前正在學：\n${article}\n\n法條原文與我目前已經看過的白話解釋：\n${text}\n\n請你扮演不動產經紀人補習班老師，用口語、簡單案例一步一步教我，並回答我的追問。`;
    
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      window.open('https://chatgpt.com', '_blank');
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <button 
      onClick={handleCopyAndOpen}
      className="px-4 py-2 bg-blue-900/30 border border-blue-500/50 text-blue-400 rounded-full text-sm font-medium hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-2"
    >
      {copied ? <Check size={14} /> : <Share size={14} />} 
      {copied ? '已複製，即將前往' : '帶去 ChatGPT 問'}
    </button>
  );
}
