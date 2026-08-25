'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Home, BookOpen, Bot, Settings, PencilRuler, Bookmark, BarChart2, Menu, X, Search, ShieldCheck, GraduationCap } from 'lucide-react';

const mainNavItems = [
  { name: '首頁', href: '/', icon: Home },
  { name: '學習中心', href: '/laws', icon: GraduationCap },
  { name: 'AI 老師', href: '/teacher', icon: Bot },
  { name: '題庫', href: '/exams', icon: PencilRuler },
];
const bottomNavItems = [
  { name: '我的重點', href: '/bookmarks', icon: Bookmark },
  { name: '學習進度', href: '/progress', icon: BarChart2 },
  { name: '設定', href: '/settings', icon: Settings },
];
const allNavItems = [...mainNavItems, ...bottomNavItems];
const mobilePrimary = [mainNavItems[0], mainNavItems[1], mainNavItems[3], bottomNavItems[1], bottomNavItems[2]];

export function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <>
      <aside className="hidden md:flex flex-col w-64 h-screen card fixed shadow-sm">
        <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
          <h1 className="text-[17px] font-black flex items-center gap-2" style={{ color: 'var(--text-1)' }}>
            <span className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow"><BookOpen size={16} className="text-white" /></span>
            不動產法規 AI
          </h1>
          <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: 'var(--text-3)' }}><ShieldCheck size={12} className="text-emerald-600"/> 學習中心：初學＋複習一體</p>
        </div>
        <div className="p-3">
          <Link href="/search" className="flex items-center gap-2 text-sm card rounded-xl px-3 py-2.5 hover:shadow-sm transition" style={{ color: 'var(--text-2)' }}>
            <Search size={14} className="text-indigo-600" /> 搜法條 / 關鍵字 / 白話問句
          </Link>
        </div>
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          <div className="text-[11px] tracking-widest px-2 mt-2 mb-1 font-bold" style={{ color: 'var(--text-3)' }}>學習</div>
          {mainNavItems.map((item) => {
            const active = pathname === item.href || (item.href==='/laws' && (pathname.startsWith('/laws') || pathname.startsWith('/articles') || pathname.startsWith('/review') || pathname.startsWith('/listen')));
            return (
              <Link key={item.name} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition ${active ? 'bg-indigo-600 text-white shadow' : 'hover:opacity-80'}`} style={!active ? { color: 'var(--text-2)' } : undefined}>
                <item.icon size={18} /> {item.name}
              </Link>
            );
          })}
          <div className="text-[11px] tracking-widest px-2 mt-4 mb-1 font-bold" style={{ color: 'var(--text-3)' }}>我的</div>
          {bottomNavItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition ${active ? 'bg-indigo-600 text-white shadow' : 'hover:opacity-80'}`} style={!active ? { color: 'var(--text-2)' } : undefined}>
                <item.icon size={18} /> {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-4 text-white shadow">
            <p className="text-xs font-black">今天先學 10 分鐘？</p>
            <p className="text-xs opacity-80 mt-1">初學看原文，複習用間隔</p>
            <Link href="/laws" className="mt-3 block text-center bg-white text-indigo-700 text-xs font-black py-2.5 rounded-xl">進入學習中心</Link>
          </div>
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 card border-t flex justify-around p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] z-50 shadow-[0_-8px_24px_rgba(0,0,0,0.06)]">
        {mobilePrimary.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} className={`flex flex-col items-center gap-1 px-2 py-1 rounded-xl ${active ? 'text-indigo-600 bg-indigo-50' : ''}`} style={!active ? { color: 'var(--text-3)' } : undefined}>
              <item.icon size={20} />
              <span className="text-[10px] font-bold">{item.name}</span>
            </Link>
          );
        })}
        <button onClick={() => setOpen(true)} className="flex flex-col items-center gap-1 px-2 py-1" style={{ color: 'var(--text-3)' }}>
          <Menu size={20} /><span className="text-[10px] font-bold">更多</span>
        </button>
      </nav>
      {open && (
        <div className="md:hidden fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 card rounded-t-[1.5rem] p-4 shadow-2xl">
            <div className="flex justify-between items-center mb-3">
              <span className="font-black" style={{ color: 'var(--text-1)' }}>更多功能</span>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--muted)', color: 'var(--text-2)' }}><X size={16} /></button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {allNavItems.map((item) => (
                <Link key={item.name} href={item.href} onClick={() => setOpen(false)} className={`flex flex-col items-center gap-2 p-3 rounded-2xl border ${pathname===item.href?'bg-indigo-600 border-indigo-600 text-white':'card'}`}>
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
