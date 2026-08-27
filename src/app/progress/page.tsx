'use client';

import { Award, BookOpen, CalendarDays, CheckCircle2, Flame, Lock, Map, Rocket, Sprout, Target, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { WorkspacePageHeader } from '@/components/WorkspacePageHeader';
import { useProgress } from '@/hooks/useProgress';
import { lawsData } from '@/data/lawsData';
import { useExamHistory } from '@/hooks/useExamHistory';

export default function ProgressPage() {
  const { isLoaded, getProgress, getTotalProgress, streak } = useProgress();
  const { records } = useExamHistory();
  const [daily, setDaily] = useState<Record<string, number>>({});

  useEffect(() => {
    queueMicrotask(() => {
      try {
        setDaily(JSON.parse(localStorage.getItem('app_progress') || '{}').dailyCounts || {});
      } catch {}
    });
  }, [isLoaded]);

  if (!isLoaded) return <div className="p-10 text-center text-tertiary">載入中…</div>;

  const totalPct = getTotalProgress();
  let totalRead = 0;
  let totalAll = 0;
  lawsData.forEach(law => {
    const progress = getProgress(law.id);
    totalRead += progress.read;
    totalAll += progress.total;
  });

  const days = Array.from({ length: 14 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - index));
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  });
  const maxValue = Math.max(1, ...days.map(day => daily[day] || 0));

  const achievements = [
    { id: 'first', label: '初學者', unlocked: totalRead >= 1, desc: '完成第 1 條', icon: Sprout },
    { id: 'ten', label: '起步', unlocked: totalRead >= 10, desc: '累積完成 10 條', icon: Rocket },
    { id: 'streak3', label: '三日連續', unlocked: streak >= 3, desc: '連續學習 3 天', icon: Flame },
    { id: 'streak7', label: '一週不輟', unlocked: streak >= 7, desc: '連續學習 7 天', icon: Award },
    { id: 'half', label: '半程攻略', unlocked: totalPct >= 50, desc: '總進度達 50%', icon: Map },
    { id: 'exam', label: '首測完成', unlocked: records.length >= 1, desc: '完成一次模擬測驗', icon: Target },
  ];

  const stats = [
    { label: '總進度', value: `${totalPct}%` },
    { label: '已讀法條', value: `${totalRead} / ${totalAll}` },
    { label: '連續學習', value: `${streak} 天` },
    { label: '已解鎖成就', value: `${achievements.filter(item => item.unlocked).length} / ${achievements.length}` },
  ];

  return (
    <div className="page-shell max-w-6xl space-y-5">
      <WorkspacePageHeader eyebrow="LEARNING ANALYTICS" title="學習進度" description="用低干擾的 KPI、學習量與各科覆蓋率追蹤備考進度。"/>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(stat => (
          <div key={stat.label} className="card rounded-xl p-4">
            <div className="text-xs text-tertiary">{stat.label}</div>
            <div className="text-2xl font-bold mt-2 text-primary">{stat.value}</div>
          </div>
        ))}
      </section>

      <section className="grid lg:grid-cols-[1.25fr_.75fr] gap-4">
        <div className="card rounded-2xl p-5 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div><div className="text-xs font-medium tracking-[0.1em] text-tertiary">14 DAY ACTIVITY</div><h2 className="text-lg font-semibold mt-1 text-primary">近 14 日學習量</h2></div>
            <TrendingUp size={18} strokeWidth={1.9} style={{ color: 'var(--primary)' }}/>
          </div>
          <div className="mt-6 h-40 flex items-end gap-2">
            {days.map(day => {
              const value = daily[day] || 0;
              const height = Math.max(4, Math.round((value / maxValue) * 128));
              return (
                <div key={day} className="flex-1 min-w-0 flex flex-col items-center gap-2">
                  <div className="w-full rounded-t-sm" style={{ height: `${height}px`, background: value ? 'var(--primary)' : 'var(--surface-strong)', opacity: value ? 0.88 : 0.55 }} title={`${day}: ${value} 條`}/>
                  <span className="text-xs text-tertiary hidden sm:block">{day.slice(8)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card rounded-2xl p-5 md:p-6">
          <div className="text-xs font-medium tracking-[0.1em] text-tertiary">SUBJECT COVERAGE</div>
          <h2 className="text-lg font-semibold mt-1 text-primary">各科完成率</h2>
          <div className="mt-5 space-y-4">
            {lawsData.slice(0, 7).map(law => {
              const progress = getProgress(law.id);
              return (
                <div key={law.id}>
                  <div className="flex items-center justify-between gap-3 text-xs"><span className="text-secondary truncate">{law.name}</span><span className="text-tertiary">{progress.percentage}%</span></div>
                  <div className="mt-2 h-1.5 progress-track rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${progress.percentage}%`, background: 'var(--primary)' }}/></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="card rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}><BookOpen size={16} strokeWidth={1.9} style={{ color: 'var(--primary)' }}/><h2 className="text-base font-semibold text-primary">全部法規詳細進度</h2></div>
        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {lawsData.map(law => {
            const progress = getProgress(law.id);
            return (
              <div key={law.id} className="px-5 py-3.5 grid sm:grid-cols-[minmax(170px,.65fr)_1fr_64px] items-center gap-3">
                <span className="text-sm text-secondary truncate">{law.name}</span>
                <div className="h-1.5 progress-track rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${progress.percentage}%`, background: 'var(--primary)' }}/></div>
                <span className="text-xs text-tertiary sm:text-right">{progress.percentage}%</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="card rounded-2xl p-5 md:p-6">
        <div className="flex items-center gap-2"><Award size={16} strokeWidth={1.9} style={{ color: 'var(--primary)' }}/><h2 className="text-base font-semibold text-primary">成就</h2></div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
          {achievements.map(achievement => {
            const Icon = achievement.unlocked ? achievement.icon : Lock;
            return (
              <div key={achievement.id} className="surface rounded-xl p-4">
                <Icon size={18} strokeWidth={1.9} style={{ color: achievement.unlocked ? 'var(--primary)' : 'var(--text-3)' }}/>
                <div className="text-sm font-semibold mt-3 text-primary">{achievement.label}</div>
                <div className="text-xs mt-1 text-tertiary">{achievement.desc}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="card rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}><CalendarDays size={16} strokeWidth={1.9} style={{ color: 'var(--primary)' }}/><h2 className="text-base font-semibold text-primary">測驗紀錄</h2></div>
        {records.length === 0 ? (
          <p className="p-5 text-sm text-tertiary">尚無紀錄。完成題庫測驗後，分數會顯示在這裡。</p>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {records.slice(0, 10).map(record => {
              const accuracy = Math.round((record.score / record.total) * 100);
              return (
                <div key={record.id} className="px-5 py-3.5 flex items-center justify-between gap-4 text-sm">
                  <div className="min-w-0"><div className="text-secondary truncate">{record.mode}</div><div className="text-xs mt-1 text-tertiary">{new Date(record.date).toLocaleString('zh-TW')}</div></div>
                  <div className="flex items-center gap-2 shrink-0"><CheckCircle2 size={14} strokeWidth={1.9} style={{ color: 'var(--primary)' }}/><span className="font-medium text-primary">{record.score}/{record.total} · {accuracy}%</span></div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
