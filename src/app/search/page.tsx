'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { generatedArticlesFlat } from '@/data/generatedArticles';
import { lawsData } from '@/data/lawsData';

export default function SearchPage() {
  const [q, setQ] = useState('');
  const results = q.trim().length < 1 ? [] : generatedArticlesFlat.filter(a => {
    const lawName = lawsData.find(l=>l.id===a.lawId)?.name || '';
    return a.articleNumber.includes(q) || a.text.includes(q) || lawName.includes(q) || `${a.lawId}${a.articleNumber}`.includes(q);
  }).slice(0, 50);

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-6 relative z-10">
      <header className="border-b border-slate-800 pb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Search size={20} /> 搜尋法條</h1>
        <p className="text-sm text-slate-400 mt-1">支援 法條號 / 關鍵字 / 白話問句（前兩者本地搜尋，白話可轉 AI）</p>
      </header>
      <div className="relative">
        <Search size={16} className="absolute left-3 top-3.5 text-slate-500" />
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="例如：民法758 / 抵押權 / 房屋買了沒登記算誰的" className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-slate-500 focus:border-blue-500 outline-none" />
      </div>
      {q && <p className="text-xs text-slate-500">找到 {results.length} 筆（最多顯示 50）</p>}
      <div className="space-y-3">
        {results.map(r=> (
          <Link key={`${r.lawId}-${r.articleNumber}`} href={`/articles/${r.lawId}-${r.articleNumber}`} className="block bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-blue-500/30">
            <div className="text-xs text-slate-500">{lawsData.find(l=>l.id===r.lawId)?.name} · 第 {r.articleNumber} 條</div>
            <div className="text-sm text-slate-200 line-clamp-2 mt-1">{r.text.slice(0,120)}…</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
