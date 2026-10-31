'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { MODULES } from '@/lib/data/curriculum';

type State = { kind: 'loading' } | { kind: 'error' } | { kind: 'next'; moduleId: string } | { kind: 'done' };

export default function ContinueCard() {
  const [state, setState] = useState<State>({ kind: 'loading' });
  useEffect(() => {
    let alive = true;
    fetch('/api/progress/modules', { cache: 'no-store' })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = (await r.json()) as { completed?: string[] };
        if (!alive) return;
        const done = new Set(Array.isArray(j.completed) ? j.completed : []);
        const next = MODULES.find((m) => !done.has(m.id));
        setState(next ? { kind: 'next', moduleId: next.id } : { kind: 'done' });
      })
      .catch((e: unknown) => { console.error('continue-card load failed', e); if (alive) setState({ kind: 'error' }); });
    return () => { alive = false; };
  }, []);

  if (state.kind === 'loading') {
    return <div className="panel rounded-lg p-4 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Checking where you left off…</div>;
  }
  if (state.kind === 'error' || state.kind === 'done') {
    const target = state.kind === 'done' ? '/exam' : '/modules/m1';
    const label = state.kind === 'done' ? 'All modules complete — drill the official sample exam' : 'Start Module 1 — Foundations: History, Methods & the Neuron';
    const icon = state.kind === 'done' ? <CheckCircle2 className="h-4 w-4 text-success" /> : <ArrowRight className="h-4 w-4" />;
    return (
      <Link href={target} className="panel panel-hover rounded-lg p-4 flex items-center justify-between gap-3 group">
        <span className="text-sm font-medium flex items-center gap-2">{icon}{label}</span>
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
      </Link>
    );
  }
  const m = MODULES.find((x) => x.id === state.moduleId)!;
  return (
    <Link href={`/modules/${m.id}`} className="panel panel-hover rounded-lg p-4 flex items-center justify-between gap-3 group">
      <span className="min-w-0">
        <span className="block text-xs text-muted-foreground">Continue where you left off · Module {m.number} · {m.weekLabel}</span>
        <span className="block text-sm font-medium truncate" style={{ color: m.color }}>{m.title}</span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}
