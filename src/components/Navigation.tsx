'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Home, BookOpen, Headphones, Bot, Settings, Clock, PencilRuler, Bookmark, BarChart2, Menu, X, Search } from 'lucide-react';

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
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen bg-slate-900/80 backdrop-blur border-r border-slate-800 text-slate-300 fixed">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center"><BookOpen size={16} className="text-white" /></span>
            不動產法規 AI
          </h1>
          <p className="text-xs text-slate-500 mt-2">零基礎 → 考上的家教系統</p>
        </div>
        <div className="p-3">
          <Link href="/laws" className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/60 hover:bg-slate-800 border border-slate-700 rounded-lg px-3 py-2">
            <Search size={14} /> 搜法條 / 關鍵字 / 白話問句
          </Link>
        </div>
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          <div className="text-[11px] tracking-widest text-slate-500 px-2 mt-2 mb-1">學習</div>
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'hover:bg-slate-800 hover:text-white text-slate-400'}`}>
                <item.icon size={18} /> {item.name}
              </Link>
            );
          })}
          <div className="text-[11px] tracking-widest text-slate-500 px-2 mt-4 mb-1">我的</div>
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white text-slate-400'}`}>
                <item.icon size={18} /> {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border border-blue-500/20 rounded-xl p-3">
            <p className="text-xs text-blue-200 font-semibold">今天先學 10 分鐘？</p>
            <p className="text-xs text-slate-400 mt-1">系統已為你排好待複習</p>
            <Link href="/review" className="mt-2 block text-center bg-white text-slate-900 text-xs font-bold py-2 rounded-lg">開始複習</Link>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-800 flex justify-around p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] z-50">
        {mobilePrimary.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg ${isActive ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400'}`}>
              <item.icon size={20} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
        <button onClick={() => setOpen(true)} className="flex flex-col items-center gap-1 px-2 py-1 text-slate-400">
          <Menu size={20} /><span className="text-[10px]">更多</span>
        </button>
      </nav>
      {open && (
        <div className="md:hidden fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 rounded-t-2xl p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-white font-bold">更多功能</span>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400"><X size={16} /></button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {allNavItems.map((item) => (
                <Link key={item.name} href={item.href} onClick={() => setOpen(false)} className={`flex flex-col items-center gap-2 p-3 rounded-xl border ${pathname===item.href?'bg-blue-600 border-blue-500 text-white':'bg-slate-800 border-slate-700 text-slate-300'}`}>
                  <item.icon size={20} /><span className="text-xs">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
