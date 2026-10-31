'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Target, Layers, ArrowRight, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { useScope } from '@/lib/use-scope';

interface ModStat {
  id: string;
  number: number;
  title: string;
  color: string;
  pct: number;
  goalsDone: number;
  goalsTotal: number;
}

interface WeakGoal {
  moduleId: string;
  moduleTitle: string;
  goalIndex: number;
  goalText: string;
}

interface ReadinessData {
  readiness: {
    partialPct: number;
    finalPct: number;
    modules: ModStat[];
    weakest: WeakGoal[];
  };
  flashcards: {
    due: number;
    total: number;
  };
  streak?: number;
}

export default function ReadinessPanel() {
  const { scope } = useScope();
  const [data, setData] = useState<ReadinessData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch('/api/progress/readiness', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d: ReadinessData) => { if (alive) { setData(d); setLoading(false); } })
      .catch((e: unknown) => { console.error('readiness load failed', e); if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  if (loading) {
    return <div className="panel rounded-lg p-4 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Analyzing your exam readiness…</div>;
  }
  if (!data?.readiness) return null;

  const { readiness, flashcards } = data;
  const isPartial = scope === 'partial';
  const overallPct = isPartial ? readiness.partialPct : readiness.finalPct;
  const targetExam = isPartial ? 'Midterm (17 Dec · Weeks 1–7)' : 'Final (26 Jan · All weeks)';
  const activeMods = isPartial ? readiness.modules.filter((m) => m.number <= 5) : readiness.modules;

  return (
    <section className="space-y-3" aria-labelledby="readiness-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="readiness-heading" className="text-lg font-semibold flex items-center gap-2"><Target className="h-5 w-5 text-primary" />Exam readiness</h2>
        <span className="text-xs text-muted-foreground">Scope: {targetExam}</span>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {/* Overall score */}
        <div className="panel rounded-lg p-4 space-y-2">
          <p className="text-xs text-muted-foreground">Estimated mastery</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary tabular-nums">{overallPct}%</span>
            <span className="text-xs text-muted-foreground">{overallPct >= 55 ? 'Passing range (≥55%)' : 'Below pass (need ≥55%)'}</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className={`h-full rounded-full transition-all ${overallPct >= 55 ? 'bg-success' : 'bg-warning'}`} style={{ width: `${overallPct}%` }} />
          </div>
          <p className="text-[11px] text-muted-foreground leading-snug">Blended from official goals ticked, guided steps understood, and quiz accuracy.</p>
        </div>

        {/* Due cards widget (F4) */}
        <Link href="/study" className="panel panel-hover rounded-lg p-4 space-y-2 block group">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><Layers className="h-3.5 w-3.5 text-primary" />Spaced repetition</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold tabular-nums ${flashcards.due > 0 ? 'text-warning' : 'text-success'}`}>{flashcards.due}</span>
            <span className="text-xs text-muted-foreground">cards due today</span>
          </div>
          <p className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-1">
            {flashcards.due > 0 ? 'Review now to keep memory sharp' : 'All caught up — click to review ahead'} <ArrowRight className="h-3 w-3 inline group-hover:translate-x-0.5 transition-transform" />
          </p>
          {typeof data.streak === 'number' && (
            <p className="text-[11px] flex items-center gap-1" title="Consecutive days with any saved study activity">
              {data.streak > 0 ? <><span aria-hidden>🔥</span><span className="text-warning font-medium">{data.streak}-day streak</span>{data.streak >= 3 ? ' — keep it alive!' : ''}</> : <span className="text-muted-foreground">Study today to start a streak 🔥</span>}
            </p>
          )}
        </Link>

        {/* Weakest goal / next best action */}
        <div className="panel rounded-lg p-4 space-y-2">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5 text-warning" />Priority focus</p>
          {readiness.weakest.length > 0 ? (
            <div>
              <p className="text-xs font-medium text-foreground">{readiness.weakest[0].moduleTitle}</p>
              <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{readiness.weakest[0].goalText}</p>
              <Link href={`/modules/${readiness.weakest[0].moduleId}`} className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-2">
                Open module goals <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ) : (
            <p className="text-xs text-success flex items-center gap-1"><Sparkles className="h-3.5 w-3.5" />All goals ticked for this scope!</p>
          )}
        </div>
      </div>

      {/* Mini per-module progress bar strip */}
      <div className="panel rounded-lg p-3">
        <p className="text-xs text-muted-foreground mb-2">Mastery by module ({isPartial ? 'Partial exam' : 'Full course'}):</p>
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 gap-2">
          {activeMods.map((m) => (
            <Link key={m.id} href={`/modules/${m.id}`} className="text-center group" title={`${m.title}: ${m.pct}%`}>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-1">
                <div className="h-full transition-all" style={{ width: `${m.pct}%`, background: m.color }} />
              </div>
              <span className="block text-[11px] font-medium group-hover:text-primary">M{m.number}</span>
              <span className="block text-[10px] text-muted-foreground tabular-nums">{m.pct}%</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
