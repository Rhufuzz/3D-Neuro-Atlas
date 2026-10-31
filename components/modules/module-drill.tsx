'use client';

import { useMemo, useRef, useState } from 'react';
import { Swords, RotateCcw, Trophy, Flame } from 'lucide-react';
import { QUIZ } from '@/lib/data/quiz';
import { FLASHCARDS } from '@/lib/data/flashcards';

interface Answer { qid: string; pick: number; correct: boolean }

const RANKS: [number, string][] = [
  [0, 'Warming up'],
  [60, 'Getting there'],
  [80, 'Solid grasp'],
  [100, 'Module mastered'],
];

/** Playful self-drill: exam-style MC questions for this module's weeks with instant
 *  feedback + explanation, then a flashcard flip round. Correct picks are saved as a
 *  practice attempt via the existing quiz progress API. */
export default function ModuleDrill({ moduleId, weeks }: { moduleId: string; weeks: number[] }) {
  const pool = useMemo(() => QUIZ.filter((q) => weeks.includes(q.week)), [weeks]);
  const cards = useMemo(() => FLASHCARDS.filter((f) => weeks.includes(f.week)), [weeks]);
  const [phase, setPhase] = useState<'quiz' | 'cards' | 'done'>('quiz');
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  const lastScore = useRef<{ score: number; total: number } | null>(null);

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    const q = pool[idx];
    const correct = i === q.answer;
    setAnswers((a) => [...a, { qid: q.id, pick: i, correct }]);
  };
  const next = () => {
    setPicked(null);
    if (idx + 1 >= pool.length) {
      // save attempt (fire and forget)
      if (answers.length > 0) {
        lastScore.current = { score, total: pool.length };
        fetch('/api/progress/quiz', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ mode: 'practice', scope: 'final', answers, durationS: 0 }),
        }).catch(() => {});
      }
      setPhase('cards');
    } else setIdx(idx + 1);
  };
  const restart = () => {
    setIdx(0); setPicked(null); setAnswers([]); setPhase('quiz'); setFlipped({});
  };

  if (pool.length === 0) return null;
  const q = pool[idx];
  const score = answers.filter((a) => a.correct).length;
  const pct = Math.round((100 * score) / Math.max(1, pool.length));
  const rank = [...RANKS].reverse().find(([t]) => pct >= t)?.[1] ?? RANKS[0][1];
  const flippedCount = cards.filter((_, i) => flipped[i]).length;

  return (
    <section className="panel rounded-lg p-4 space-y-3" aria-labelledby="drill-heading">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="drill-heading" className="font-semibold flex items-center gap-2"><Swords className="h-4 w-4 text-primary" />Drill: prove it playfully</h2>
        <button onClick={restart} className="text-xs px-2.5 py-1 rounded-full bg-muted hover:bg-muted/70 text-muted-foreground flex items-center gap-1.5"><RotateCcw className="h-3 w-3" />Restart</button>
      </div>

      {phase === 'quiz' && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>Question {idx + 1}/{pool.length}</span>
            <span className="flex items-center gap-1 text-warning"><Flame className="h-3.5 w-3.5" />score {score}</span>
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary/60 rounded-full transition-all" style={{ width: `${((idx + 1) / pool.length) * 100}%` }} /></div>
          </div>
          <p className="text-sm font-medium">{q.question}</p>
          <div className="grid gap-2">
            {q.options.map((o, i) => {
              const isPicked = picked === i;
              const correct = i === q.answer;
              const show = picked !== null;
              return (
                <button key={i} onClick={() => choose(i)}
                  className={`text-left text-sm px-3 py-2 rounded-md border transition-colors ${
                    show && correct ? 'border-success bg-success/10 text-success'
                    : show && isPicked ? 'border-destructive bg-destructive/10'
                    : 'border-border hover:border-primary/50'}`}>
                  {o}
                </button>
              );
            })}
          </div>
          {picked !== null && (
            <div className="space-y-2">
              <p className={`text-sm font-medium ${picked === q.answer ? 'text-success' : 'text-destructive'}`}>
                {picked === q.answer ? '✓ Correct!' : '✗ Not this one.'}
              </p>
              <p className="text-xs text-muted-foreground">{q.explanation}</p>
              <button onClick={next} className="text-xs px-3 py-1.5 rounded-full bg-primary text-primary-foreground">{idx + 1 >= pool.length ? 'To the flashcards →' : 'Next question'}</button>
            </div>
          )}
        </div>
      )}

      {phase === 'cards' && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Round 2 — flip each card and say the answer out loud before flipping. {flippedCount}/{cards.length} flipped.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {cards.map((c, i) => (
              <button key={c.id} onClick={() => setFlipped((f) => ({ ...f, [i]: !f[i] }))}
                className={`text-left text-xs rounded-lg border p-3 min-h-24 transition-colors ${flipped[i] ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/40'}`}>
                <p className="font-medium">{flipped[i] ? c.back : c.front}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">{flipped[i] ? '← question' : 'tap to reveal →'}</p>
              </button>
            ))}
          </div>
          <button onClick={() => setPhase('done')} className="text-xs px-3 py-1.5 rounded-full bg-primary text-primary-foreground">See my score →</button>
        </div>
      )}

      {phase === 'done' && (
        <div className="space-y-3 text-center py-4">
          <Trophy className={`h-10 w-10 mx-auto ${pct >= 80 ? 'text-warning' : 'text-muted-foreground'}`} />
          <p className="text-3xl font-bold text-primary tabular-nums">{score}/{pool.length}</p>
          <p className="text-sm font-semibold" style={{ color: pct >= 80 ? 'hsl(var(--success))' : 'hsl(var(--foreground))' }}>{rank} {pct >= 80 ? '🎉' : ''}</p>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">{pct >= 80
            ? 'This module is locked in. The attempt is saved to your progress tracker — now tick the remaining goals and move to the next module.'
            : 'Not yet mastered — skim the guided path again (the steps you haven’t ticked are the weak spots), then restart the drill. Repetition is the point.'}</p>
          <div className="flex justify-center gap-2">
            <button onClick={restart} className="text-xs px-3 py-1.5 rounded-full bg-primary text-primary-foreground">Drill again</button>
          </div>
        </div>
      )}
    </section>
  );
}
