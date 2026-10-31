'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Circle, CalendarDays, BookOpen } from 'lucide-react';
import { WEEK_PLAN } from '@/lib/data/exam';

const DONE_KEY = 'cortex-goal-done';

function loadDone(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(DONE_KEY) ?? '{}'); } catch { return {}; }
}

export default function WeeklyPlan() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [ready, setReady] = useState(false);
  useEffect(() => { setDone(loadDone()); setReady(true); }, []);
  const toggle = (key: string) => {
    const next = { ...done, [key]: !done[key] };
    setDone(next);
    try { localStorage.setItem(DONE_KEY, JSON.stringify(next)); } catch {}
  };
  const allGoals = WEEK_PLAN.flatMap((w) => w.goals.map((_, i) => `${w.week}:${i}`));
  const doneCount = allGoals.filter((k) => done[k]).length;
  const pct = Math.round((100 * doneCount) / Math.max(1, allGoals.length));

  return (
    <section className="space-y-4" aria-labelledby="weekly-heading">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="weekly-heading" className="text-xl font-semibold flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary" />Weekly plan &amp; learning goals</h2>
          <p className="text-sm text-muted-foreground">The official per-week goals (“I know / I understand…”). Tick each one as you master it — the exam covers all of them.</p>
        </div>
        <div className="text-right min-w-40">
          <p className="text-2xl font-bold text-primary tabular-nums">{pct}%</p>
          <div className="h-2 rounded-full bg-muted overflow-hidden mt-1"><div className="h-full bg-gradient-to-r from-primary to-cyan-300 rounded-full" style={{ width: `${pct}%` }} /></div>
          <p className="text-[11px] text-muted-foreground">{doneCount} of {allGoals.length} goals ticked (saved on this device)</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {WEEK_PLAN.map((w) => (
          <div key={w.week} className={`panel rounded-lg p-4 space-y-3 ${w.week === 8 || w.week === 12 ? 'border border-primary/40' : ''}`}>
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="font-semibold">Week {w.week}<span className="text-muted-foreground font-normal text-sm"> · {w.dates}</span></h3>
              {w.module && <Link href={`/modules/${w.module}`} className="text-xs text-primary hover:underline">Open module →</Link>}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" />{w.lectures} · <span className="font-mono">{w.book}</span></p>
            <ul className="space-y-1.5">
              {w.goals.map((g, i) => {
                const key = `${w.week}:${i}`;
                const isDone = ready && !!done[key];
                return (
                  <li key={key}>
                    <button type="button" onClick={() => toggle(key)} className="flex items-start gap-2 text-left text-xs w-full group">
                      {isDone ? <CheckCircle2 className="h-4 w-4 shrink-0 text-success mt-0.5" /> : <Circle className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary mt-0.5" />}
                      <span className={isDone ? 'text-muted-foreground line-through' : ''}>{g}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
