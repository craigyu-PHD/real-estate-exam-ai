'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Flame,
  Headphones,
  Moon,
  Palette,
  RotateCcw,
  Search,
  Sun,
} from 'lucide-react';
import { useProgress } from '@/hooks/useProgress';
import { useReview } from '@/hooks/useReview';
import { useSettings } from '@/hooks/useSettings';
import { lawsData } from '@/data/lawsData';
import { StudyCalendar, ExamCountdown } from '@/components/StudyCalendar';
import { ActiveThemeArtwork } from '@/components/ThemeArtwork';
import { dateFromKey } from '@/hooks/useStudyDate';

export default function Home() {
  const { isLoaded, getTotalProgress, streak, todayKey, getProgress, getGamificationStats } = useProgress();
  const { isLoaded: reviewLoaded, dueToday } = useReview();
  const { isLoaded: settingsLoaded, settings, updateSettings } = useSettings();
  const total = getTotalProgress();
  const game = getGamificationStats();
  const todayStr = dateFromKey(todayKey).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  if (!isLoaded || !reviewLoaded || !settingsLoaded) {
    return <div className="p-10 text-center text-sm text-tertiary">正在整理今日學習工作台…</div>;
  }

  const inProgress = lawsData.filter(law => {
    const progress = getProgress(law.id);
    return progress.read > 0 && progress.percentage < 100;
  });
  const nextLaw = inProgress.sort((a, b) => getProgress(b.id).percentage - getProgress(a.id).percentage)[0]
    || lawsData.find(law => getProgress(law.id).percentage < 100)
    || lawsData[0];
  const nextProgress = getProgress(nextLaw.id);

  const categories = Array.from(new Set(lawsData.map(law => law.category))).map(category => {
    const categoryLaws = lawsData.filter(law => law.category === category);
    const totals = categoryLaws.reduce((acc, law) => {
      const progress = getProgress(law.id);
      acc.read += progress.read;
      acc.total += progress.total;
      return acc;
    }, { read: 0, total: 0 });
    const target = categoryLaws.find(law => getProgress(law.id).percentage > 0 && getProgress(law.id).percentage < 100)
      || categoryLaws.find(law => getProgress(law.id).percentage < 100)
      || categoryLaws[0];
    return {
      category,
      read: totals.read,
      total: totals.total,
      percentage: totals.total ? Math.round((totals.read / totals.total) * 100) : 0,
      target,
    };
  });

  const kpis = [
    { label: '今日進度', value: `${Math.min(game.today, game.dailyGoal)} / ${game.dailyGoal}`, meta: '條', icon: BookOpen },
    { label: '整體進度', value: `${total}%`, meta: '全站教材', icon: BarChart3 },
    { label: '待複習', value: `${dueToday.length}`, meta: '條', icon: RotateCcw },
    { label: '連續學習', value: `${streak}`, meta: '天', icon: Flame },
  ];

  const isDark = settings.appearance === 'dark';

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-7 py-6 md:py-8 pb-28 md:pb-10 space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-medium tracking-[0.1em] text-tertiary">WORKSPACE</div>
          <h1 className="text-[28px] leading-tight font-bold mt-1 text-primary">備考總覽</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-secondary">
            <span>Real Estate Exam Intelligence Workspace</span>
            <span className="hidden sm:inline text-tertiary">·</span>
            <span className="inline-flex items-center gap-1.5 text-tertiary"><CalendarDays size={14} strokeWidth={1.9}/>{todayStr}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/search" className="workspace-tool" aria-label="搜尋法條"><Search size={16} strokeWidth={1.9}/><span className="hidden sm:inline">搜尋</span></Link>
          <Link href="/settings" className="workspace-tool" aria-label="主題與設定"><Palette size={16} strokeWidth={1.9}/><span className="hidden sm:inline">主題</span></Link>
          <button
            type="button"
            onClick={() => updateSettings({ appearance: isDark ? 'light' : 'dark' })}
            className="workspace-tool"
            aria-label={isDark ? '切換淺色模式' : '切換深色模式'}
          >
            {isDark ? <Sun size={16} strokeWidth={1.9}/> : <Moon size={16} strokeWidth={1.9}/>}
            <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
          </button>
        </div>
      </header>

      <section className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {kpis.map(item => (
          <div key={item.label} className="card rounded-xl p-4 min-h-[112px] flex flex-col justify-between">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-secondary">{item.label}</span>
              <item.icon size={17} strokeWidth={1.9} style={{ color: 'var(--primary)' }}/>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl md:text-[28px] leading-none font-bold text-primary">{item.value}</span>
              <span className="text-xs font-medium text-tertiary">{item.meta}</span>
            </div>
          </div>
        ))}
      </section>

      <section className="home-focus rounded-2xl relative overflow-hidden p-5 md:p-7">
        <ActiveThemeArtwork className="theme-focus-art" />
        <div className="relative z-10 max-w-3xl">
          <div className="text-xs font-medium tracking-[0.1em] text-tertiary">TODAY · FOCUS</div>
          <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-primary">今日學習計畫</h2>
              <div className="mt-3 text-lg font-semibold text-primary">{nextLaw.name}</div>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-secondary">{nextLaw.description}</p>
            </div>
            <span className="rounded-full border px-3 py-1.5 text-xs font-medium text-secondary" style={{borderColor:'var(--border)'}}>
              {nextProgress.read} / {nextProgress.total} 條
            </span>
          </div>

          <div className="mt-5 max-w-2xl">
            <div className="flex items-center justify-between gap-3 text-xs text-tertiary">
              <span>本法規完成度</span>
              <span>{nextProgress.percentage}%</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full progress-track overflow-hidden">
              <div className="h-full rounded-full progress-fill" style={{ width: `${nextProgress.percentage}%`, background: 'var(--primary)' }} />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2.5">
            <Link href={`/laws/${nextLaw.id}`} className="workspace-primary-action">
              繼續學習 <ArrowRight size={15} strokeWidth={1.9}/>
            </Link>
            <Link href="/listen" className="workspace-secondary-action">
              <Headphones size={15} strokeWidth={1.9}/> 開始聽課
            </Link>
          </div>
        </div>
      </section>

      <section className="grid xl:grid-cols-[minmax(0,1.4fr)_minmax(310px,.6fr)] gap-5 items-start">
        <div className="card rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between gap-4" style={{borderColor:'var(--border)'}}>
            <div>
              <div className="text-xs font-medium tracking-[0.1em] text-tertiary">LEARNING AREAS</div>
              <h2 className="text-lg font-semibold mt-1 text-primary">學習科目</h2>
            </div>
            <Link href="/laws" className="text-sm font-medium inline-flex items-center gap-1.5" style={{color:'var(--primary)'}}>
              全部法規 <ChevronRight size={14} strokeWidth={1.9}/>
            </Link>
          </div>
          <div className="divide-y" style={{borderColor:'var(--border)'}}>
            {categories.map(item => (
              <Link key={item.category} href={`/laws/${item.target.id}`} className="subject-row group">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{background:'var(--primary)'}}/>
                    <span className="text-sm font-semibold text-primary truncate">{item.category}</span>
                  </div>
                  <div className="mt-2 ml-3.5 flex items-center gap-3">
                    <div className="h-1.5 flex-1 max-w-sm rounded-full progress-track overflow-hidden">
                      <div className="h-full rounded-full" style={{width:`${item.percentage}%`,background:'var(--primary)'}}/>
                    </div>
                    <span className="text-xs text-tertiary whitespace-nowrap">{item.read} / {item.total} 條 · {item.percentage}%</span>
                  </div>
                </div>
                <span className="text-sm font-medium text-secondary group-hover:text-primary transition-colors">{item.read > 0 ? '繼續' : '開始'}</span>
                <ChevronRight size={15} strokeWidth={1.9} className="text-tertiary group-hover:text-primary transition-colors"/>
              </Link>
            ))}
          </div>
          <div className="px-5 py-3 border-t flex flex-wrap gap-x-5 gap-y-2 text-sm" style={{borderColor:'var(--border)'}}>
            <Link href="/teacher" className="text-secondary hover:text-primary transition-colors">AI 老師</Link>
            <Link href="/review" className="text-secondary hover:text-primary transition-colors">間隔複習</Link>
            <Link href="/bookmarks" className="text-secondary hover:text-primary transition-colors">我的重點</Link>
          </div>
        </div>

        <div className="space-y-4">
          <ExamCountdown />
          <StudyCalendar />
        </div>
      </section>
    </div>
  );
}
