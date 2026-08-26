'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock3, GitBranch, CheckCircle2, CircleDashed, Sparkles } from 'lucide-react';
import { currentVersion, releaseLog, type ReleaseEntry } from '@/data/changelog';

const statusMeta: Record<ReleaseEntry['status'], { label: string; className: string }> = {
  current: { label: '目前版本', className: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20' },
  completed: { label: '已完成', className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20' },
  planned: { label: '下一版', className: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20' },
};

export function UpdateLog() {
  const [expanded, setExpanded] = useState(false);
  const current = releaseLog.find(item => item.version === currentVersion)!;
  const visible = expanded ? releaseLog : releaseLog.filter(item => item.status === 'current' || item.status === 'planned');

  return (
    <section className="mx-3 mb-3 rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
      <button onClick={() => setExpanded(v => !v)} className="w-full px-3.5 py-3 text-left hover:bg-indigo-500/[0.035] transition">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-black tracking-[0.16em] uppercase text-indigo-600"><GitBranch size={12}/> Update Log</div>
            <div className="mt-1 flex items-center gap-2 min-w-0">
              <span className="text-sm font-black truncate" style={{ color: 'var(--text-1)' }}>V{current.version}</span>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full border bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20">目前版本</span>
            </div>
          </div>
          {expanded ? <ChevronUp size={15} style={{ color: 'var(--text-3)' }} /> : <ChevronDown size={15} style={{ color: 'var(--text-3)' }} />}
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px]" style={{ color: 'var(--text-3)' }}>
          <span className="inline-flex items-center gap-1"><Clock3 size={10}/>{current.date}</span>
          <span>{current.progress}% 完成</span>
        </div>
        <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}><div className="h-full rounded-full bg-indigo-600" style={{ width: `${current.progress}%` }}/></div>
      </button>

      <div className="border-t px-3 py-2.5 space-y-2.5 max-h-64 overflow-y-auto" style={{ borderColor: 'var(--border)' }}>
        {visible.map(entry => {
          const meta = statusMeta[entry.status];
          return (
            <div key={entry.version} className="rounded-xl p-2.5" style={{ background: 'var(--muted)' }}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    {entry.status === 'planned' ? <CircleDashed size={12} className="text-amber-500"/> : entry.status === 'current' ? <Sparkles size={12} className="text-indigo-600"/> : <CheckCircle2 size={12} className="text-emerald-600"/>}
                    <span className="text-[11px] font-black" style={{ color: 'var(--text-1)' }}>V{entry.version}</span>
                  </div>
                  <div className="text-[10px] font-bold mt-1 leading-snug" style={{ color: 'var(--text-2)' }}>{entry.title}</div>
                </div>
                <span className={`shrink-0 text-[8px] font-black px-1.5 py-0.5 rounded-full border ${meta.className}`}>{meta.label}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[9px]" style={{ color: 'var(--text-3)' }}><span>{entry.date}</span><span>{entry.progress}%</span></div>
              <div className="mt-1 h-1 rounded-full overflow-hidden" style={{ background: 'color-mix(in srgb, var(--border) 70%, transparent)' }}><div className={`h-full rounded-full ${entry.status === 'planned' ? 'bg-amber-400' : entry.status === 'current' ? 'bg-indigo-600' : 'bg-emerald-500'}`} style={{ width: `${entry.progress}%` }}/></div>
              {expanded && <div className="mt-2 text-[9px] leading-relaxed" style={{ color: 'var(--text-3)' }}>{entry.summary}</div>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
