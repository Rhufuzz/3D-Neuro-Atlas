'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Circle, ChevronRight, Map, Target, Sparkles } from 'lucide-react';
import type { LearnStep } from '@/lib/data/learn';

const STEPS_KEY = 'cortex-learn-steps';
const GOALS_KEY = 'cortex-goal-done';

type SyncState = 'loading' | 'synced' | 'offline';

interface TickRow { moduleId: string; done: boolean; stepIndex?: number; goalIndex?: number }

function readLocal(key: string): Record<string, boolean> {
  try { const v = JSON.parse(localStorage.getItem(key) ?? '{}'); return v && typeof v === 'object' ? v : {}; } catch { return {}; }
}
function writeLocal(key: string, val: Record<string, boolean>) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

/**
 * Tick-state synced to the account: loads from the API, unions in any ticks that
 * only exist in localStorage and pushes those up once — existing users keep their
 * progress and it becomes cross-device. Falls back to localStorage when offline.
 */
function useSyncedTicks(apiPath: string, localKey: string, idField: 'stepIndex' | 'goalIndex') {
  const [ticks, setTicks] = useState<Record<string, boolean>>({});
  const [ready, setReady] = useState(false);
  const [sync, setSync] = useState<SyncState>('loading');

  useEffect(() => {
    setTicks(readLocal(localKey));
    setReady(true);
    let alive = true;
    fetch(apiPath, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(async (d: { steps?: TickRow[]; goals?: TickRow[] }) => {
        if (!alive) return;
        const rows = d.steps ?? d.goals ?? [];
        const server: Record<string, boolean> = {};
        rows.forEach((r) => { server[`${r.moduleId}:${r[idField]}`] = r.done; });
        const local = readLocal(localKey);
        const merged = { ...server };
        const deltas: TickRow[] = [];
        for (const [k, v] of Object.entries(local)) {
          if (v && merged[k] !== true) {
            merged[k] = true;
            const [mid, idx] = k.split(':');
            deltas.push({ moduleId: mid, [idField]: Number(idx), done: true });
          }
        }
        setTicks(merged);
        writeLocal(localKey, merged);
        for (const p of deltas) {
          await fetch(apiPath, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) }).catch(() => {});
        }
        if (alive) setSync('synced');
      })
      .catch((e: unknown) => { console.error(`${apiPath} load failed`, e); if (alive) setSync('offline'); });
    return () => { alive = false; };
  }, [apiPath, localKey, idField]);

  const toggle = (moduleId: string, index: number) => {
    const key = `${moduleId}:${index}`;
    const next = { ...ticks, [key]: !ticks[key] };
    setTicks(next);
    writeLocal(localKey, next);
    window.dispatchEvent(new Event('cortex-xp-change'));
    if (sync === 'synced') {
      fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId, [idField]: index, done: next[key] }),
      }).catch((e: unknown) => { console.error(`${apiPath} save failed`, e); setSync('offline'); });
    }
  };

  return { ticks, ready, sync, toggle };
}

function SyncBadge({ state }: { state: SyncState }) {
  return (
    <span className="text-[11px] text-muted-foreground">{state === 'loading' ? 'Loading…' : state === 'synced' ? 'Synced to your account' : 'Offline – this session only'}</span>
  );
}

export function LearnPath({ moduleId, steps }: { moduleId: string; steps: LearnStep[] }) {
  const { ticks: doneSteps, ready, sync, toggle } = useSyncedTicks('/api/progress/learn', STEPS_KEY, 'stepIndex');
  const [open, setOpen] = useState<number | null>(0);
  const doneCount = steps.filter((_, i) => doneSteps[`${moduleId}:${i}`]).length;
  const allDone = doneCount === steps.length;

  return (
    <section className="panel rounded-lg p-4 space-y-3" aria-labelledby="learn-heading">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="learn-heading" className="font-semibold flex items-center gap-2"><Map className="h-4 w-4 text-primary" />Guided path — learn this module step by step</h2>
        <div className="flex items-center gap-2">
          <SyncBadge state={sync} />
          <span className={`text-xs px-2 py-0.5 rounded-full ${allDone ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>{doneCount}/{steps.length} steps</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Follow the route: each step explains an idea in plain language and sends you somewhere in the app to <em>experience</em> it. Tick a step when the idea clicks.</p>
      <ol className="space-y-2">
        {steps.map((s, i) => {
          const key = `${moduleId}:${i}`;
          const isDone = ready && !!doneSteps[key];
          const isOpen = open === i;
          return (
            <li key={i} className={`rounded-lg border transition-colors ${isDone ? 'border-success/40 bg-success/5' : 'border-border'} ${isOpen ? 'bg-muted/20' : ''}`}>
              <button type="button" onClick={() => setOpen(isOpen ? null : i)} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left" aria-expanded={isOpen}>
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${isDone ? 'bg-success text-success-foreground' : 'bg-primary/15 text-primary'}`}>{isDone ? '✓' : i + 1}</span>
                <span className={`text-sm font-medium flex-1 ${isDone ? 'text-muted-foreground' : ''}`}>{s.title}</span>
                <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-90' : ''}`} />
              </button>
              {isOpen && (
                <div className="px-3 pb-3 pl-[46px] space-y-2.5">
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {s.link && <Link href={s.link.href} className="text-xs px-2.5 py-1 rounded-full bg-primary/15 text-primary hover:bg-primary/25">{s.link.label}</Link>}
                    <button type="button" onClick={() => toggle(moduleId, i)} className={`text-xs px-2.5 py-1 rounded-full ${isDone ? 'bg-success/15 text-success' : 'bg-muted hover:bg-muted/70 text-muted-foreground'}`}>
                      {isDone ? '✓ clicked — untick' : 'Mark as understood'}
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>
      {allDone && (
        <p className="text-sm text-success flex items-center gap-2"><Sparkles className="h-4 w-4" />Path complete — every idea in this module has clicked. Lock it in with the drill below.</p>
      )}
    </section>
  );
}

export function GoalTracker({ moduleId, goals }: { moduleId: string; goals: string[] }) {
  const { ticks, ready, sync, toggle } = useSyncedTicks('/api/progress/goals', GOALS_KEY, 'goalIndex');
  const count = goals.filter((_, i) => ticks[`${moduleId}:${i}`]).length;

  return (
    <section className="panel p-4 rounded-lg space-y-3" aria-labelledby="goals-heading">
      <div className="flex items-center justify-between gap-2">
        <h2 id="goals-heading" className="font-semibold flex items-center gap-2"><Target className="h-4 w-4 text-primary" />Learning goals — your comprehension checklist</h2>
        <div className="flex items-center gap-2">
          <SyncBadge state={sync} />
          <span className={`text-xs px-2 py-0.5 rounded-full ${count === goals.length ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>{count}/{goals.length}</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">These mirror the official course goals for this module — the exam questions cover every one. Tick a goal only when you could explain it to someone else.</p>
      <ul className="space-y-1.5">
        {goals.map((g, i) => {
          const isDone = ready && !!ticks[`${moduleId}:${i}`];
          return (
            <li key={i}>
              <button type="button" onClick={() => toggle(moduleId, i)} className="flex items-start gap-2 text-left text-sm w-full group">
                {isDone ? <CheckCircle2 className="h-4 w-4 shrink-0 text-success mt-0.5" /> : <Circle className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary mt-0.5" />}
                <span className={isDone ? 'text-muted-foreground line-through' : ''}>{g}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
