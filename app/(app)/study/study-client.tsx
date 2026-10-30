'use client';

import { useMemo, useState } from 'react';
import { Layers, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { FLASHCARDS } from '@/lib/data/flashcards';
import { QUIZ } from '@/lib/data/quiz';
import type { Flashcard, QuizQuestion } from '@/lib/data/types';

export default function StudyClient() {
  const [scope, setScope] = useState<'partial' | 'final'>('final');
  const max = scope === 'partial' ? 7 : 11;
  const cards = useMemo(() => FLASHCARDS.filter((c: Flashcard) => c.week <= max), [max]);
  const qs = useMemo(() => QUIZ.filter((q: QuizQuestion) => q.week <= max), [max]);
  const [ci, setCi] = useState(0);
  const [flip, setFlip] = useState(false);
  const [qi, setQi] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const card = cards?.[ci % Math.max(1, cards?.length ?? 1)];
  const q = qs?.[qi % Math.max(1, qs?.length ?? 1)];

  const answer = (i: number) => {
    if (pick !== null) return;
    setPick(i);
    if (i === q?.answer) setScore((s: number) => s + 1);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(['partial', 'final'] as const).map((s) => (
          <button key={s} onClick={() => { setScope(s); setCi(0); setQi(0); setPick(null); setScore(0); }} className={`px-3 py-1.5 rounded-md text-sm ${scope === s ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{s === 'partial' ? 'Partial (Wk 1–7)' : 'Final (Wk 1–11)'}</button>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="panel p-4 rounded-lg space-y-3">
          <h2 className="font-semibold flex items-center gap-2"><Layers className="h-4 w-4 text-primary" />Flashcards ({(ci % Math.max(1, cards.length)) + 1}/{cards.length})</h2>
          <button onClick={() => setFlip(!flip)} className="w-full min-h-[180px] glass-panel rounded-lg p-5 text-left hover:shadow-lg transition">
            <p className="text-xs text-muted-foreground mb-2">Week {card?.week} · {card?.tag} · {flip ? 'Answer' : 'Question (tap to flip)'}</p>
            <p className={flip ? 'text-sm' : 'font-medium'}>{flip ? card?.back : card?.front}</p>
          </button>
          <div className="flex gap-2">
            <button onClick={() => { setFlip(false); setCi(ci + 1); }} className="px-3 py-1.5 rounded-md bg-destructive/80 text-destructive-foreground text-sm">Again</button>
            <button onClick={() => { setFlip(false); setCi(ci + 1); }} className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm">Good</button>
          </div>
        </section>
        <section className="panel p-4 rounded-lg space-y-3">
          <h2 className="font-semibold">Practice exam — score {score}/{qi + (pick !== null ? 1 : 0)}</h2>
          <p className="text-xs text-muted-foreground">Week {q?.week} · {q?.goal}</p>
          <p className="font-medium">{q?.question}</p>
          <div className="space-y-2">
            {(q?.options ?? []).map((o: string, i: number) => (
              <button key={o} onClick={() => answer(i)} className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 ${pick === null ? 'bg-muted hover:bg-muted/70' : i === q?.answer ? 'bg-success/30' : i === pick ? 'bg-destructive/30' : 'bg-muted'}`}>
                {pick !== null && i === q?.answer && <CheckCircle2 className="h-4 w-4 text-success" />}
                {pick === i && i !== q?.answer && <XCircle className="h-4 w-4 text-destructive" />}
                {o}
              </button>
            ))}
          </div>
          {pick !== null && <p className="text-sm text-muted-foreground">{q?.explanation}</p>}
          <div className="flex gap-2">
            <button disabled={pick === null} onClick={() => { setPick(null); setQi(qi + 1); }} className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm disabled:opacity-50">Next question</button>
            <button onClick={() => { setPick(null); setQi(0); setScore(0); }} className="px-3 py-1.5 rounded-md bg-muted text-sm flex items-center gap-1"><RotateCcw className="h-3 w-3" />Restart</button>
          </div>
        </section>
      </div>
    </div>
  );
}
