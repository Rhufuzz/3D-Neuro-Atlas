'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Circle, ChevronRight, Map, Target, Sparkles } from 'lucide-react';
import type { LearnStep } from '@/lib/data/learn';

const STEPS_KEY = 'cortex-learn-steps';
const GOALS_KEY = 'cortex-goal-done';

export function LearnPath({ moduleId, steps }: { moduleId: string; steps: LearnStep[] }) {
  const [doneSteps, setDoneSteps] = useState<Record<string, boolean>>({});
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState<number | null>(0);

  useEffect(() => {
    try { setDoneSteps(JSON.parse(localStorage.getItem(STEPS_KEY) ?? '{}')); } catch {}
    setReady(true);
  }, []);
  const toggleStep = (i: number) => {
    const key = `${moduleId}:${i}`;
    const next = { ...doneSteps, [key]: !doneSteps[key] };
    setDoneSteps(next);
    try { localStorage.setItem(STEPS_KEY, JSON.stringify(next)); } catch {}
    window.dispatchEvent(new Event('cortex-xp-change'));
  };
  const doneCount = steps.filter((_, i) => doneSteps[`${moduleId}:${i}`]).length;
  const allDone = doneCount === steps.length;

  return (
    <section className="panel rounded-lg p-4 space-y-3" aria-labelledby="learn-heading">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="learn-heading" className="font-semibold flex items-center gap-2"><Map className="h-4 w-4 text-primary" />Guided path — learn this module step by step</h2>
        <span className={`text-xs px-2 py-0.5 rounded-full ${allDone ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>{doneCount}/{steps.length} steps</span>
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
                    <button type="button" onClick={() => toggleStep(i)} className={`text-xs px-2.5 py-1 rounded-full ${isDone ? 'bg-success/15 text-success' : 'bg-muted hover:bg-muted/70 text-muted-foreground'}`}>
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
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const all = JSON.parse(localStorage.getItem(GOALS_KEY) ?? '{}');
      setDone(Object.fromEntries(goals.map((_, i) => [i, !!all[`${moduleId}:${i}`]])));
    } catch {}
    setReady(true);
  }, [moduleId, goals]);
  const toggle = (i: number) => {
    try {
      const all = JSON.parse(localStorage.getItem(GOALS_KEY) ?? '{}');
      all[`${moduleId}:${i}`] = !done[i];
      localStorage.setItem(GOALS_KEY, JSON.stringify(all));
    } catch {}
    setDone({ ...done, [i]: !done[i] });
    window.dispatchEvent(new Event('cortex-xp-change'));
  };
  const count = goals.filter((_, i) => done[i]).length;

  return (
    <section className="panel rounded-lg p-4 space-y-3" aria-labelledby="goals-heading">
      <div className="flex items-center justify-between gap-2">
        <h2 id="goals-heading" className="font-semibold flex items-center gap-2"><Target className="h-4 w-4 text-primary" />Learning goals — your comprehension checklist</h2>
        <span className={`text-xs px-2 py-0.5 rounded-full ${count === goals.length ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>{count}/{goals.length}</span>
      </div>
      <p className="text-xs text-muted-foreground">These mirror the official course goals for this module — the exam questions cover every one. Tick a goal only when you could explain it to someone else.</p>
      <ul className="space-y-1.5">
        {goals.map((g, i) => {
          const isDone = ready && !!done[i];
          return (
            <li key={i}>
              <button type="button" onClick={() => toggle(i)} className="flex items-start gap-2 text-left text-sm w-full group">
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
