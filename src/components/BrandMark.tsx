import { Building2, Sparkles } from 'lucide-react';

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`relative shrink-0 ${compact ? 'w-9 h-9' : 'w-11 h-11'} rounded-2xl brand-mark flex items-center justify-center`} aria-hidden="true">
      <Building2 size={compact ? 18 : 21} strokeWidth={2.2} />
      <span className="absolute -right-1 -top-1 w-4 h-4 rounded-full bg-amber-300 text-indigo-950 flex items-center justify-center shadow-sm border-2 border-[var(--sidebar)]">
        <Sparkles size={9} strokeWidth={2.5} />
      </span>
    </div>
  );
}
