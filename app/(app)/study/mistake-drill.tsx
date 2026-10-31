'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, RotateCcw, Trophy, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface Card {
  id: string;
  front: string;
  back: string;
  sourceKind: string;
  sourceRef?: string;
  reviews: number;
  lastGrade?: number;
}

export default function MistakeDrill() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [phase, setPhase] = useState<'drill' | 'done'>('drill');

  useEffect(() => {
    let alive = true;
    fetch('/api/progress/custom-cards', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d: { cards?: Card[] }) => {
        if (!alive) return;
        setCards(d?.cards ?? []);
        setLoading(false);
      })
      .catch((e) => {
        console.error('Failed to load mistake cards', e);
        if (alive) setLoading(false);
      });
    return () => { alive = false; };
  }, []);

  const reset = () => {
    setIdx(0);
    setRevealed(false);
    setCorrect(0);
    setPhase('drill');
  };

  const grade = async (score: 5 | 1) => {
    const card = cards[idx];
    if (score === 5) setCorrect((c) => c + 1);
    fetch('/api/progress/custom-cards/grade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: card.id, grade: score }),
    }).catch(() => {});

    setRevealed(false);
    if (idx + 1 >= cards.length) {
      setPhase('done');
    } else {
      setIdx((i) => i + 1);
    }
  };

  if (loading) {
    return (
      <div className="panel p-6 rounded-lg flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-primary" /> Loading your mistake deck…
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="panel p-6 rounded-lg text-center space-y-2">
        <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
        <h3 className="font-semibold text-sm">No mistakes in your review deck yet</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          When you miss a question on a module drill, quiz, or sample exam, tap <strong>&ldquo;Add to review deck&rdquo;</strong> to save it here for targeted drilling.
        </p>
      </div>
    );
  }

  const card = cards[idx];

  if (phase === 'done') {
    const pct = Math.round((100 * correct) / cards.length);
    return (
      <section className="panel p-6 rounded-lg space-y-4 text-center">
        <Trophy className="h-10 w-10 text-warning mx-auto" />
        <h3 className="text-xl font-bold">Mistake Drill Complete</h3>
        <p className="text-3xl font-extrabold text-primary tabular-nums">
          {correct} / {cards.length} ({pct}%)
        </p>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          {pct >= 80
            ? 'Great job clearing your weak spots! These cards will space further apart in your daily reviews.'
            : 'Keep reviewing — these are questions you previously missed. Consistent repetition turns them into easy points.'}
        </p>
        <button
          onClick={reset}
          className="text-xs px-4 py-2 rounded-full bg-primary text-primary-foreground font-medium inline-flex items-center gap-1.5"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Drill mistakes again
        </button>
      </section>
    );
  }

  return (
    <section className="panel p-5 rounded-lg space-y-4" aria-label="Mistake drill">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-medium flex items-center gap-1.5 text-warning">
          <AlertCircle className="h-3.5 w-3.5" /> Card {idx + 1} of {cards.length} · from {card.sourceKind}
        </span>
        <button onClick={reset} className="hover:text-foreground inline-flex items-center gap-1">
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>

      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full bg-warning rounded-full transition-all" style={{ width: `${((idx + 1) / cards.length) * 100}%` }} />
      </div>

      <div className="glass-panel p-5 rounded-lg space-y-3">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Question / Prompt</p>
        <p className="text-sm font-medium">{card.front}</p>

        {revealed && (
          <div className="pt-3 border-t border-border/60 space-y-2">
            <p className="text-xs uppercase tracking-wide text-primary">Answer / Explanation</p>
            <p className="text-sm text-foreground leading-relaxed">{card.back}</p>
          </div>
        )}
      </div>

      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          className="w-full py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium"
        >
          Reveal answer
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => grade(1)}
            className="py-2 px-3 rounded-md bg-destructive/15 hover:bg-destructive/25 text-destructive text-sm font-medium flex items-center justify-center gap-1.5"
          >
            <XCircle className="h-4 w-4" /> Still shaky (Review soon)
          </button>
          <button
            onClick={() => grade(5)}
            className="py-2 px-3 rounded-md bg-success/15 hover:bg-success/25 text-success text-sm font-medium flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="h-4 w-4" /> Got it! (Mark learned)
          </button>
        </div>
      )}
    </section>
  );
}
