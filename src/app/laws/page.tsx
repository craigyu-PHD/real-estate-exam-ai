'use client';

import Link from 'next/link';
import { CheckCircle2, ChevronRight, Clock3, Headphones } from 'lucide-react';
import { useState } from 'react';
import { WorkspacePageHeader } from '@/components/WorkspacePageHeader';
import { useProgress } from '@/hooks/useProgress';
import { useReview } from '@/hooks/useReview';
import { lawsData } from '@/data/lawsData';

export default function LawsIndex() {
  const { isLoaded, getProgress } = useProgress();
  const { isLoaded: reviewLoaded, dueToday } = useReview();
  const [category, setCategory] = useState('全部');

  if (!isLoaded || !reviewLoaded) return <div className="p-10 text-center text-sm text-tertiary">載入學習中心…</div>;

  const categories = ['全部', ...Array.from(new Set(lawsData.map(law => law.category)))];
  const visible = category === '全部' ? lawsData : lawsData.filter(law => law.category === category);

  return (
    <div className="page-shell space-y-5">
      <WorkspacePageHeader
        eyebrow="LEARNING CENTER"
        title="學習中心"
        description="以同一套知識工作台管理全部法規。先看進度與科目，再進入條文、聽課或複習，不讓視覺裝飾干擾閱讀節奏。"
        actions={
          <>
            <Link href="/review" className="workspace-secondary-action">
              <Clock3 size={15} strokeWidth={1.9}/> 待複習 {dueToday.length}
            </Link>
            <Link href="/listen" className="workspace-secondary-action">
              <Headphones size={15} strokeWidth={1.9}/> 聽課模式
            </Link>
          </>
        }
      />

      <div className="flex gap-2 overflow-x-auto pb-1" aria-label="法規分類">
        {categories.map(item => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            className={`whitespace-nowrap min-h-9 px-3 rounded-lg border text-xs font-medium transition-colors ${category === item ? 'text-white border-transparent' : 'text-secondary'}`}
            style={category === item ? { background: 'var(--primary)' } : { background: 'transparent', borderColor: 'var(--border)' }}
          >
            {item}
          </button>
        ))}
      </div>

      <section className="card rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between gap-4" style={{ borderColor: 'var(--border)' }}>
          <div>
            <div className="text-xs font-medium tracking-[0.1em] text-tertiary">KNOWLEDGE LIBRARY</div>
            <h2 className="text-lg font-semibold mt-1 text-primary">{category === '全部' ? '全部法規' : category}</h2>
          </div>
          <span className="text-xs text-tertiary">{visible.length} 部法規</span>
        </div>

        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {visible.map(law => {
            const { read, total, percentage } = getProgress(law.id);
            const done = percentage === 100;
            return (
              <Link key={law.id} href={`/laws/${law.id}`} className="group flex items-center gap-4 px-5 py-4 hover:bg-white/[0.025] transition-colors">
                <span className="w-1.5 h-9 rounded-full shrink-0" style={{ background: done ? 'var(--success)' : 'var(--primary)' }}/>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-primary group-hover:text-[var(--primary)] transition-colors">{law.name}</h3>
                    <span className="text-xs text-tertiary">{law.category}</span>
                    {done && <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--success)' }}><CheckCircle2 size={13} strokeWidth={1.9}/> 已完成</span>}
                  </div>
                  <p className="mt-1 text-sm leading-5 text-secondary line-clamp-1">{law.description}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-1.5 flex-1 max-w-md rounded-full progress-track overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${percentage}%`, background: done ? 'var(--success)' : 'var(--primary)' }}/>
                    </div>
                    <span className="text-xs text-tertiary whitespace-nowrap">{read} / {total} · {percentage}%</span>
                  </div>
                </div>
                <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                  <span className="text-xs text-tertiary">共 {law.totalArticles} 條</span>
                  <span className="text-sm font-medium text-secondary group-hover:text-primary">{done ? '再複習' : read > 0 ? '繼續' : '開始'}</span>
                </div>
                <ChevronRight size={16} strokeWidth={1.9} className="text-tertiary shrink-0"/>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
