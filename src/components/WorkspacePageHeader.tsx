import type { ReactNode } from 'react';

export function WorkspacePageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="text-xs font-medium tracking-[0.1em] text-tertiary">{eyebrow}</div>
        <h1 className="text-[28px] leading-tight font-bold mt-1 text-primary">{title}</h1>
        {description && <p className="mt-2 max-w-3xl text-sm leading-6 text-secondary">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </header>
  );
}
