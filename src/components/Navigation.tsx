'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useProgress } from '@/hooks/useProgress';
import { UpdateLog } from '@/components/UpdateLog';
import { BrandMark } from '@/components/BrandMark';
import { Home, Bot, Settings, PencilRuler, Bookmark, BarChart2, Menu, X, Search, GraduationCap, Trophy, Zap, Headphones, RefreshCcw } from 'lucide-react';

const mainNavItems = [
  { name: '首頁', href: '/', icon: Home },
  { name: '學習中心', href: '/laws', icon: GraduationCap },
  { name: 'AI 老師', href: '/teacher', icon: Bot },
  { name: '題庫', href: '/exams', icon: PencilRuler },
];
const utilityItems = [
  { name: '聽課模式', href: '/listen', icon: Headphones },
  { name: '間隔複習', href: '/review', icon: RefreshCcw },
];
const bottomNavItems = [
  { name: '我的重點', href: '/bookmarks', icon: Bookmark },
  { name: '學習進度', href: '/progress', icon: BarChart2 },
  { name: '設定', href: '/settings', icon: Settings },
];
const allNavItems = [...mainNavItems, ...utilityItems, ...bottomNavItems];
const mobilePrimary = [mainNavItems[0], mainNavItems[1], mainNavItems[3], bottomNavItems[1]];

function NavLink({ item, active, onClick }: { item: typeof mainNavItems[number]; active: boolean; onClick?: () => void }) {
  return (
    <Link onClick={onClick} href={item.href} className={`sidebar-link ${active ? 'sidebar-link-active' : ''}`}>
      <item.icon size={18}/><span>{item.name}</span>
    </Link>
  );
}

export function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { isLoaded, getGamificationStats } = useProgress();
  const game = getGamificationStats();
  const isActive = (href: string) => pathname === href || (href === '/laws' && (pathname.startsWith('/laws') || pathname.startsWith('/articles')));

  return (
    <>
      <aside className="hidden md:flex flex-col w-[280px] h-dvh fixed left-0 top-0 sidebar-shell z-50">
        <div className="px-4 pt-5 pb-4 border-b" style={{borderColor:'var(--border)'}}>
          <Link href="/" className="flex items-center gap-3 group">
            <BrandMark />
            <div className="min-w-0">
              <div className="text-[15px] font-black tracking-tight text-primary">不動產法規 AI</div>
              <div className="text-[10px] mt-0.5 text-tertiary">Real Estate Exam Tutor</div>
            </div>
          </Link>
        </div>

        <div className="px-3 pt-3">
          <Link href="/search" className="sidebar-search"><Search size={15}/><span>搜尋法條與關鍵字</span><kbd>⌘K</kbd></Link>
        </div>

        <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-4 sidebar-scroll">
          <section>
            <div className="sidebar-section-label">主要功能</div>
            <div className="space-y-1">{mainNavItems.map(item => <NavLink key={item.href} item={item} active={isActive(item.href)}/>)}</div>
          </section>
          <section>
            <div className="sidebar-section-label">學習工具</div>
            <div className="space-y-1">{utilityItems.map(item => <NavLink key={item.href} item={item} active={isActive(item.href)}/>)}</div>
          </section>
          <section>
            <div className="sidebar-section-label">我的</div>
            <div className="space-y-1">{bottomNavItems.map(item => <NavLink key={item.href} item={item} active={isActive(item.href)}/>)}</div>
          </section>
        </nav>

        <div className="shrink-0 border-t pt-2" style={{borderColor:'var(--border)'}}>
          <UpdateLog />
          <div className="mx-3 mb-3 quest-mini">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-[11px] font-black"><Trophy size={13} className="text-amber-500"/>{isLoaded ? `LV.${game.level} ${game.title}` : '學習等級'}</span>
              <span className="flex items-center gap-1 text-[10px] font-black text-tertiary"><Zap size={11} className="text-indigo-500"/>{isLoaded ? game.xp : 0} XP</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] text-tertiary"><span>今日任務</span><span>{isLoaded ? `${Math.min(game.today, game.dailyGoal)}/${game.dailyGoal}` : '0/8'} 條</span></div>
            <div className="mt-1.5 h-1.5 rounded-full progress-track overflow-hidden"><div className="h-full rounded-full bg-indigo-600" style={{width:`${isLoaded ? game.questProgress : 0}%`}}/></div>
          </div>
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-0 inset-x-0 mobile-nav z-50 pb-[max(.45rem,env(safe-area-inset-bottom))]">
        <div className="grid grid-cols-5 px-2 pt-2">
          {mobilePrimary.map(item => {
            const active = isActive(item.href);
            return <Link key={item.href} href={item.href} className={`mobile-nav-item ${active?'mobile-nav-active':''}`}><item.icon size={19}/><span>{item.name}</span></Link>;
          })}
          <button onClick={() => setOpen(true)} className="mobile-nav-item"><Menu size={19}/><span>更多</span></button>
        </div>
      </nav>

      {open && (
        <div className="md:hidden fixed inset-0 z-[80]">
          <button className="absolute inset-0 bg-slate-950/35 backdrop-blur-[2px]" onClick={() => setOpen(false)} aria-label="關閉選單"/>
          <div className="absolute bottom-0 inset-x-0 mobile-sheet rounded-t-[28px] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl">
            <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2"><BrandMark compact/><div><div className="text-sm font-black text-primary">全部功能</div><div className="text-[10px] text-tertiary">不動產法規 AI</div></div></div><button onClick={() => setOpen(false)} className="icon-button"><X size={17}/></button></div>
            <div className="grid grid-cols-3 gap-2">{allNavItems.map(item => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={`mobile-sheet-item ${isActive(item.href)?'mobile-sheet-active':''}`}><item.icon size={20}/><span>{item.name}</span></Link>)}</div>
          </div>
        </div>
      )}
    </>
  );
}
