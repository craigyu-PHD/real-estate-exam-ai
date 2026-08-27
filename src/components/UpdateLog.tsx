'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Clock3, GitBranch, CheckCircle2, CircleDashed, Sparkles, ChevronRight } from 'lucide-react';
import { currentVersion, releaseLog, type ReleaseEntry } from '@/data/changelog';

const statusMeta: Record<ReleaseEntry['status'], { label: string; className: string }> = {
  current: { label: '目前版本', className: 'status-current' },
  completed: { label: '已完成', className: 'status-complete' },
  planned: { label: '下一版', className: 'status-planned' },
};

export function UpdateLog() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const current = releaseLog.find(item => item.version === currentVersion)!;

  useEffect(() => {
    if (!open) return;
    const opener = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const getFocusable = () => Array.from(drawerRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])') || []);
    const focusTimer = window.requestAnimationFrame(() => drawerRef.current?.querySelector<HTMLElement>('[data-dialog-close]')?.focus());
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = getFocusable();
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      window.requestAnimationFrame(() => opener?.isConnected && opener.focus());
    };
  }, [open]);

  return (
    <>
      <button ref={triggerRef} type="button" onClick={() => setOpen(true)} className="sidebar-release mx-3 mb-2 text-left" aria-label="開啟版本更新日誌" aria-haspopup="dialog" aria-expanded={open}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-8 h-8 rounded-xl release-icon flex items-center justify-center shrink-0"><GitBranch size={14}/></span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5"><span className="text-xs font-medium tracking-[0.1em] text-tertiary">版本更新</span><span className="status-dot"/></div>
            <div className="text-xs font-semibold truncate text-primary">V{current.version} · {current.title}</div>
          </div>
          <ChevronRight size={14} className="text-tertiary shrink-0"/>
        </div>
      </button>

      {open && (
        <div className="fixed inset-0 z-[90] flex items-stretch justify-end">
          <button type="button" className="absolute inset-0 bg-slate-950/45" onClick={() => setOpen(false)} aria-label="關閉更新日誌"/>
          <aside ref={drawerRef} role="dialog" aria-modal="true" aria-labelledby="update-log-title" className="relative w-full max-w-[430px] h-full update-drawer shadow-[0_16px_40px_rgba(0,0,0,.25)] flex flex-col">
            <header className="p-5 md:p-6 border-b flex items-start justify-between gap-4" style={{borderColor:'var(--border)'}}>
              <div>
                <div className="text-xs tracking-[0.1em] font-medium flex items-center gap-1.5" style={{ color: 'var(--primary)' }}><GitBranch size={12}/> PRODUCT CHANGELOG</div>
                <h2 id="update-log-title" className="text-xl font-bold mt-1 text-primary">版本更新日誌</h2>
                <p className="text-xs mt-1 text-tertiary">版本、完成度與下一步集中在這裡，不再占用主要導覽空間。</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="icon-button" aria-label="關閉更新日誌" data-dialog-close><X size={17}/></button>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-3">
              {releaseLog.map(entry => {
                const meta = statusMeta[entry.status];
                return (
                  <article key={entry.version} className={`release-card ${entry.status === 'current' ? 'release-card-current' : ''}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3 min-w-0">
                        <span className={`release-entry-icon release-entry-icon-${entry.status} w-9 h-9 rounded-xl flex items-center justify-center shrink-0`}>
                          {entry.status === 'planned' ? <CircleDashed size={16}/> : entry.status === 'current' ? <Sparkles size={16}/> : <CheckCircle2 size={16}/>}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap"><span className="font-semibold text-primary">V{entry.version}</span><span className={`release-status ${meta.className}`}>{meta.label}</span></div>
                          <h3 className="text-sm font-semibold mt-1 text-primary">{entry.title}</h3>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-tertiary shrink-0">{entry.progress}%</span>
                    </div>
                    <div className="mt-3 h-1.5 rounded-full overflow-hidden progress-track"><div className="h-full rounded-full" style={{ width: `${entry.progress}%`, background: entry.status === 'planned' ? 'var(--warning)' : entry.status === 'current' ? 'var(--primary)' : 'var(--success)' }}/></div>
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-tertiary"><Clock3 size={12}/>{entry.date}</div>
                    <p className="text-xs leading-relaxed mt-2 text-secondary">{entry.summary}</p>
                    <ul className="mt-3 grid gap-1.5">
                      {entry.highlights.map(item => <li key={item} className="text-xs flex gap-2 text-secondary"><span style={{ color: 'var(--primary)' }}>•</span><span>{item}</span></li>)}
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
