import { Building2 } from 'lucide-react';

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`relative shrink-0 ${compact ? 'w-8 h-8' : 'w-9 h-9'} rounded-lg brand-mark flex items-center justify-center`} aria-hidden="true">
      <Building2 size={compact ? 17 : 19} strokeWidth={1.9} />
    </div>
  );
}
