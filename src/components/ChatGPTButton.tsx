'use client';
import { Share, Check } from 'lucide-react';
import { useState } from 'react';

export function ChatGPTButton({ article, text }: { article: string; text: string }) {
  const [copied,setCopied]=useState(false);
  const handle=async()=>{const prompt=`我是準備台灣不動產經紀人考試的初學者。\n\n目前正在學：\n${article}\n\n法條原文與我目前已看過的白話解釋：\n${text}\n\n請扮演不動產經紀人補習班老師，用口語、簡單案例一步一步教我，並回答追問。`;try{await navigator.clipboard.writeText(prompt);setCopied(true);setTimeout(()=>setCopied(false),1800);window.open('https://chatgpt.com','_blank','noopener,noreferrer');}catch{window.open('https://chatgpt.com','_blank','noopener,noreferrer');}};
  return <button onClick={handle} className="surface px-4 py-2.5 rounded-xl text-sm font-black text-primary hover:border-indigo-300 transition flex items-center justify-center gap-2">{copied?<Check size={14} className="text-emerald-600"/>:<Share size={14} className="text-indigo-600"/>}{copied?'已複製提示詞':'帶去 ChatGPT 問'}</button>;
}
