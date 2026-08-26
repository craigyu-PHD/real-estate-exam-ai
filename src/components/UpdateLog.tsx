'use client';

import { useEffect, useState } from 'react';
import { X, Clock3, GitBranch, CheckCircle2, CircleDashed, Sparkles, ChevronRight } from 'lucide-react';
import { currentVersion, releaseLog, type ReleaseEntry } from '@/data/changelog';

const statusMeta: Record<ReleaseEntry['status'], { label: string; className: string }> = {
  current: { label: '目前版本', className: 'status-current' },
  completed: { label: '已完成', className: 'status-complete' },
  planned: { label: '下一版', className: 'status-planned' },
};

export function UpdateLog() {
  const [open, setOpen] = useState(false);
  const current = releaseLog.find(item => item.version === currentVersion)!;

  useEffect(() => {
    if (!open) return;
    const close = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [open]);

  return (
    <>
      <button onClick={() => setOpen(true)} className="sidebar-release mx-3 mb-2 text-left" aria-label="開啟版本更新日誌">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-8 h-8 rounded-xl release-icon flex items-center justify-center shrink-0"><GitBranch size={14}/></span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5"><span className="text-[10px] font-black tracking-[0.12em] text-tertiary">版本更新</span><span className="status-dot"/></div>
            <div className="text-xs font-black truncate text-primary">V{current.version} · {current.title}</div>
          </div>
          <ChevronRight size={14} className="text-tertiary shrink-0"/>
        </div>
      </button>

      {open && (
        <div className="fixed inset-0 z-[90] flex items-stretch justify-end" role="dialog" aria-modal="true" aria-label="版本更新日誌">
          <button className="absolute inset-0 bg-slate-950/35 backdrop-blur-[2px]" onClick={() => setOpen(false)} aria-label="關閉更新日誌"/>
          <aside className="relative w-full max-w-[430px] h-full update-drawer shadow-2xl flex flex-col">
            <header className="p-5 md:p-6 border-b flex items-start justify-between gap-4" style={{borderColor:'var(--border)'}}>
              <div>
                <div className="text-[10px] tracking-[0.16em] font-black text-indigo-600 flex items-center gap-1.5"><GitBranch size={12}/> PRODUCT CHANGELOG</div>
                <h2 className="text-xl font-black mt-1 text-primary">版本更新日誌</h2>
                <p className="text-xs mt-1 text-tertiary">版本、完成度與下一步集中在這裡，不再占用主要導覽空間。</p>
              </div>
              <button onClick={() => setOpen(false)} className="icon-button"><X size={17}/></button>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-3">
              {releaseLog.map(entry => {
                const meta = statusMeta[entry.status];
                return (
                  <article key={entry.version} className={`release-card ${entry.status === 'current' ? 'release-card-current' : ''}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3 min-w-0">
                        <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${entry.status==='planned'?'bg-amber-500/10 text-amber-600':entry.status==='current'?'bg-indigo-500/10 text-indigo-600':'bg-emerald-500/10 text-emerald-600'}`}>
                          {entry.status === 'planned' ? <CircleDashed size={16}/> : entry.status === 'current' ? <Sparkles size={16}/> : <CheckCircle2 size={16}/>}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap"><span className="font-black text-primary">V{entry.version}</span><span className={`release-status ${meta.className}`}>{meta.label}</span></div>
                          <h3 className="text-sm font-black mt-1 text-primary">{entry.title}</h3>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-tertiary shrink-0">{entry.progress}%</span>
                    </div>
                    <div className="mt-3 h-1.5 rounded-full overflow-hidden progress-track"><div className={`h-full rounded-full ${entry.status==='planned'?'bg-amber-400':entry.status==='current'?'bg-indigo-600':'bg-emerald-500'}`} style={{width:`${entry.progress}%`}}/></div>
                    <div className="mt-3 flex items-center gap-1.5 text-[10px] text-tertiary"><Clock3 size={11}/>{entry.date}</div>
                    <p className="text-xs leading-relaxed mt-2 text-secondary">{entry.summary}</p>
                    <ul className="mt-3 grid gap-1.5">
                      {entry.highlights.map(item => <li key={item} className="text-[11px] flex gap-2 text-secondary"><span className="text-indigo-500">•</span><span>{item}</span></li>)}
                    </ul>
                  </article>
                );
              })}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
