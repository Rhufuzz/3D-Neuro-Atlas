'use client';

import { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { SafeDate } from '@/components/safe-format';

interface Tally { correct: number; total: number }
interface Attempt { id: string; mode: string; scope: string; score: number; total: number; durationS: number; createdAt: string }

function Bar({ label, t }: { label: string; t: Tally }) {
  const pct = t.total ? Math.round((t.correct / t.total) * 100) : 0;
  const tone = pct >= 80 ? 'bg-success' : pct >= 60 ? 'bg-primary' : pct >= 40 ? 'bg-warning' : 'bg-destructive';
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-xs"><span className="truncate pr-2">{label}</span><span className="text-muted-foreground shrink-0">{t.correct}/{t.total} · {pct}%</span></div>
      <div className="h-1.5 rounded bg-muted overflow-hidden"><div className={`h-full ${tone}`} style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

export default function ProgressTracker({ refreshKey, maxWeek }: { refreshKey: number; maxWeek: number }) {
  const [data, setData] = useState<{ attempts: Attempt[]; goals: Record<string, Tally>; weeks: Record<string, Tally> } | null>(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    fetch('/api/progress/quiz')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d) => { setData(d); setErr(false); })
      .catch((e: unknown) => { console.error('Quiz progress load failed', e); setErr(true); });
  }, [refreshKey]);

  const goals = Object.entries(data?.goals ?? {}).sort((a, b) => a[0].localeCompare(b[0]));
  const weeks = Object.entries(data?.weeks ?? {}).filter(([w]) => Number(w) <= maxWeek).sort((a, b) => Number(a[0]) - Number(b[0]));

  return (
    <section className="panel p-4 rounded-lg space-y-4">
      <h2 className="font-semibold flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" />Progress tracker</h2>
      {err && <p className="text-xs text-destructive">Could not load your saved attempts.</p>}
      {!err && !data && <p className="text-xs text-muted-foreground">Loading…</p>}
      {data && (data.attempts?.length ?? 0) === 0 && <p className="text-sm text-muted-foreground">No saved attempts yet. Finish a practice run or mock exam to start tracking accuracy by learning goal and week.</p>}
      {data && (data.attempts?.length ?? 0) > 0 && (
        <div className="grid gap-5 md:grid-cols-3">
          <div className="space-y-2"><h3 className="text-xs uppercase tracking-wider text-muted-foreground">By learning goal</h3>{goals.map(([g, t]) => <Bar key={g} label={g} t={t} />)}</div>
          <div className="space-y-2"><h3 className="text-xs uppercase tracking-wider text-muted-foreground">By week</h3>{weeks.map(([w, t]) => <Bar key={w} label={`Week ${w}`} t={t} />)}</div>
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground">Recent attempts</h3>
            <ul className="space-y-1.5">
              {data.attempts.slice(0, 8).map((a: Attempt) => (
                <li key={a.id} className="flex justify-between text-xs bg-muted/40 rounded px-2 py-1">
                  <span><SafeDate date={a.createdAt} options={{ month: 'short', day: 'numeric' }} /> · {a.mode === 'exam' ? 'Mock exam' : 'Practice'} · {a.scope === 'partial' ? 'Wk 1–7' : 'Wk 1–11'}</span>
                  <span className="font-medium">{a.score}/{a.total}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
