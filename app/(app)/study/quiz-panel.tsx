'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, XCircle, RotateCcw, Timer, Save } from 'lucide-react';
import { QUIZ } from '@/lib/data/quiz';
import { STRUCTURE_MAP } from '@/lib/data/structures';
import type { QuizQuestion } from '@/lib/data/types';
import type { ExamScope } from '@/lib/store';

type Mode = 'practice' | 'exam';
const EXAM_LEN = 20;

function shuffle<T>(arr: T[], seed: number): T[] {
  const a = arr.slice();
  let s = seed || 1;
  for (let i = a.length - 1; i > 0; i--) { s = (s * 16807) % 2147483647; const j = s % (i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export default function QuizPanel({ maxWeek, scope, onFocus, onSaved }: { maxWeek: number; scope: ExamScope; onFocus: (id: string | null, label: string | null) => void; onSaved: () => void }) {
  const [mode, setMode] = useState<Mode>('practice');
  const [seed, setSeed] = useState(0);
  const [picks, setPicks] = useState<Record<string, number>>({});
  const [qi, setQi] = useState(0);
  const [done, setDone] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const started = useRef<number>(0);

  const qs = useMemo(() => {
    const pool = QUIZ.filter((q: QuizQuestion) => q.week <= maxWeek);
    const s = seed ? shuffle(pool, seed) : pool;
    return mode === 'exam' ? s.slice(0, EXAM_LEN) : s;
  }, [maxWeek, seed, mode]);

  const reset = (m: Mode = mode) => {
    setMode(m); setSeed(Math.floor(Math.random() * 1e9) + 1); setPicks({}); setQi(0); setDone(false); setSaveMsg(null);
    started.current = Date.now(); setElapsed(0);
  };
  useEffect(() => { reset(mode); /* new scope → new run */ // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxWeek]);
  useEffect(() => {
    if (done) return;
    const t = setInterval(() => setElapsed(Math.round((Date.now() - started.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, [done, seed]);

  const q = qs[qi];
  const pick = q ? picks[q.id] : undefined;
  const answered = Object.keys(picks).filter((k: string) => qs.some((x: QuizQuestion) => x.id === k));
  const correct = answered.filter((k: string) => qs.find((x: QuizQuestion) => x.id === k)?.answer === picks[k]).length;
  const reveal = q && pick !== undefined && (mode === 'practice' || done);

  useEffect(() => {
    const sid = reveal ? q?.structureId ?? null : null;
    if (sid) onFocus(sid, STRUCTURE_MAP[sid]?.name ?? null);
  }, [reveal, q?.id, q?.structureId, onFocus]);

  const choose = (i: number) => {
    if (!q || done) return;
    if (mode === 'practice' && pick !== undefined) return;
    setPicks((p) => ({ ...p, [q.id]: i }));
  };

  const finish = async () => {
    setDone(true);
    const answers = answered.map((k: string) => ({ qid: k, pick: picks[k] }));
    if (!answers.length) { setSaveMsg('Answer at least one question to save an attempt.'); return; }
    try {
      const r = await fetch('/api/progress/quiz', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode, scope, durationS: Math.round((Date.now() - started.current) / 1000), answers }) });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = (await r.json()) as { score: number; total: number };
      setSaveMsg(`Saved: ${d.score}/${d.total} correct.`);
      onSaved();
    } catch (e) {
      console.error('Quiz attempt save failed', e);
      setSaveMsg('Could not save this attempt. Your score is shown below.');
    }
  };

  const mm = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}`;

  return (
    <section className="panel p-4 rounded-lg space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1 bg-muted/60 rounded-md p-0.5" role="group" aria-label="Quiz mode">
          {(['practice', 'exam'] as const).map((m) => (
            <button key={m} onClick={() => reset(m)} aria-pressed={mode === m} className={`px-2.5 py-1 rounded text-xs ${mode === m ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>{m === 'practice' ? 'Practice' : `Mock exam (${EXAM_LEN})`}</button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground flex items-center gap-1"><Timer className="h-3 w-3" />{mm} · {correct}/{answered.length} correct</span>
      </div>
      {q ? (
        <>
          <p className="text-xs text-muted-foreground">Q{qi + 1}/{qs.length} · Week {q.week} · {q.goal}</p>
          <p className="font-medium">{q.question}</p>
          <div className="space-y-2">
            {q.options.map((o: string, i: number) => {
              const cls = !reveal ? (pick === i ? 'bg-primary/25 ring-1 ring-primary' : 'bg-muted hover:bg-muted/70') : i === q.answer ? 'bg-success/30' : i === pick ? 'bg-destructive/30' : 'bg-muted';
              return (
                <button key={o} onClick={() => choose(i)} className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 ${cls}`}>
                  {reveal && i === q.answer && <CheckCircle2 className="h-4 w-4 text-success shrink-0" />}
                  {reveal && pick === i && i !== q.answer && <XCircle className="h-4 w-4 text-destructive shrink-0" />}
                  {o}
                </button>
              );
            })}
          </div>
          {reveal && <p className="text-sm text-muted-foreground">{q.explanation}</p>}
          <div className="flex flex-wrap gap-2">
            <button disabled={qi === 0} onClick={() => setQi(qi - 1)} className="px-3 py-1.5 rounded-md bg-muted text-sm disabled:opacity-40">Back</button>
            <button disabled={qi >= qs.length - 1 || (mode === 'practice' && pick === undefined)} onClick={() => setQi(qi + 1)} className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm disabled:opacity-40">Next</button>
            {!done && <button onClick={finish} className="px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground text-sm flex items-center gap-1"><Save className="h-3 w-3" />Finish & save</button>}
            <button onClick={() => reset()} className="px-3 py-1.5 rounded-md bg-muted text-sm flex items-center gap-1"><RotateCcw className="h-3 w-3" />New run</button>
          </div>
          {saveMsg && <p className="text-xs text-primary">{saveMsg}{done && mode === 'exam' ? ' Use Back/Next to review each answer.' : ''}</p>}
        </>
      ) : (
        <p className="text-sm text-muted-foreground">No questions in this scope.</p>
      )}
    </section>
  );
}
