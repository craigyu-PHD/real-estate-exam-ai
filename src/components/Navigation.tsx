'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Home, BookOpen, Headphones, Bot, Settings, Clock, PencilRuler, Bookmark, BarChart2, Menu, X, Search, ShieldCheck } from 'lucide-react';

const mainNavItems = [
  { name: '首頁', href: '/', icon: Home },
  { name: '法規學習', href: '/laws', icon: BookOpen },
  { name: '複習中心', href: '/review', icon: Clock },
  { name: '聽課模式', href: '/listen', icon: Headphones },
  { name: 'AI 老師', href: '/teacher', icon: Bot },
  { name: '題庫', href: '/exams', icon: PencilRuler },
];
const bottomNavItems = [
  { name: '我的重點', href: '/bookmarks', icon: Bookmark },
  { name: '學習進度', href: '/progress', icon: BarChart2 },
  { name: '設定', href: '/settings', icon: Settings },
];
const allNavItems = [...mainNavItems, ...bottomNavItems];
const mobilePrimary = [mainNavItems[0], mainNavItems[1], mainNavItems[2], mainNavItems[5], bottomNavItems[1]];

export function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <>
      <aside className="hidden md:flex flex-col w-64 h-screen bg-white border-r border-slate-200 fixed shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-[17px] font-black text-slate-900 flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow"><BookOpen size={16} className="text-white" /></span>
            不動產法規 AI
          </h1>
          <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1"><ShieldCheck size={12} className="text-emerald-500"/> 補習班級・零基礎到考上</p>
        </div>
        <div className="p-3">
          <Link href="/search" className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl px-3 py-2.5 shadow-sm">
            <Search size={14} className="text-indigo-500" /> 搜法條 / 關鍵字 / 白話問句
          </Link>
        </div>
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          <div className="text-[11px] tracking-widest text-slate-400 px-2 mt-2 mb-1 font-bold">學習</div>
          {mainNavItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition ${active ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                <item.icon size={18} /> {item.name}
              </Link>
            );
          })}
          <div className="text-[11px] tracking-widest text-slate-400 px-2 mt-4 mb-1 font-bold">我的</div>
          {bottomNavItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition ${active ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                <item.icon size={18} /> {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-4 text-white shadow">
            <p className="text-xs font-black">今天先學 10 分鐘？</p>
            <p className="text-xs opacity-80 mt-1">系統已為你排好待複習</p>
            <Link href="/review" className="mt-3 block text-center bg-white text-indigo-700 text-xs font-black py-2.5 rounded-xl">開始複習</Link>
          </div>
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200 flex justify-around p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] z-50 shadow-[0_-8px_24px_rgba(0,0,0,0.06)]">
        {mobilePrimary.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} className={`flex flex-col items-center gap-1 px-2 py-1 rounded-xl ${active ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500'}`}>
              <item.icon size={20} />
              <span className="text-[10px] font-bold">{item.name}</span>
            </Link>
          );
        })}
        <button onClick={() => setOpen(true)} className="flex flex-col items-center gap-1 px-2 py-1 text-slate-500">
          <Menu size={20} /><span className="text-[10px] font-bold">更多</span>
        </button>
      </nav>
      {open && (
        <div className="md:hidden fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 rounded-t-[1.5rem] p-4 shadow-2xl">
            <div className="flex justify-between items-center mb-3">
              <span className="text-slate-900 font-black">更多功能</span>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"><X size={16} /></button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {allNavItems.map((item) => (
                <Link key={item.name} href={item.href} onClick={() => setOpen(false)} className={`flex flex-col items-center gap-2 p-3 rounded-2xl border ${pathname===item.href?'bg-indigo-600 border-indigo-600 text-white':'bg-slate-50 border-slate-200 text-slate-700'}`}>
                  <item.icon size={20} /><span className="text-xs font-bold">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
