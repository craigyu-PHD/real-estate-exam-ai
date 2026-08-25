'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Headphones, Bot, BrainCircuit, PenTool, Star, BarChart3, Settings, Clock, PencilRuler, Bookmark, BarChart2 } from 'lucide-react';

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

export function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen bg-slate-900 border-r border-slate-800 text-slate-300 fixed">
        <div className="p-6">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="text-blue-500" />
            不動產法規 AI
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {allNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex justify-around p-3 z-50">
        {allNavItems.slice(0, 5).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 ${
                isActive ? 'text-blue-400' : 'text-slate-400'
              }`}
            >
              <item.icon size={20} />
              <span className="text-[10px]">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
