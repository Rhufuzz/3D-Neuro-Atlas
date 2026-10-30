'use client';

import { useScope } from '@/lib/use-scope';

export default function ScopeToggle({ compact = false }: { compact?: boolean }) {
  const { scope, setScope } = useScope();
  return (
    <div className={compact ? 'flex gap-1 shrink-0' : 'space-y-1'}>
      {!compact && <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-1">Exam scope</p>}
      <div className="flex gap-1 bg-muted/60 rounded-md p-0.5" role="group" aria-label="Exam scope">
        {(['partial', 'final'] as const).map((s) => (
          <button key={s} onClick={() => setScope(s)} aria-pressed={scope === s} className={`flex-1 px-2 py-1 rounded text-xs transition ${scope === s ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}>
            {s === 'partial' ? (compact ? 'Wk 1–7' : 'Partial · Wk 1–7') : (compact ? 'Wk 1–11' : 'Final · Wk 1–11')}
          </button>
        ))}
      </div>
    </div>
  );
}
