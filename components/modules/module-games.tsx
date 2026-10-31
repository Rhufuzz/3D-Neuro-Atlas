'use client';

import { useEffect, useMemo, useState } from 'react';
import { Puzzle, Crosshair, Timer, RotateCcw, Trophy } from 'lucide-react';

/* Shared completion-flag helpers (also drive the XP meter). */
export function markGame(key: string) {
  try {
    const all = JSON.parse(localStorage.getItem('cortex-games') ?? '{}');
    all[key] = true;
    localStorage.setItem('cortex-games', JSON.stringify(all));
    window.dispatchEvent(new Event('cortex-xp-change'));
  } catch {}
}
export function isGameDone(key: string): boolean {
  try { return !!JSON.parse(localStorage.getItem('cortex-games') ?? '{}')[key]; } catch { return false; }
}

/* ---------------- Pair matching: term <-> description ---------------- */

export function MatchGame({ moduleId, pairs }: { moduleId: string; pairs: { term: string; def: string }[] }) {
  const key = `match:${moduleId}`;
  const [done, setDone] = useState(false);
  const [selTerm, setSelTerm] = useState<number | null>(null);
  const [matched, setMatched] = useState<Record<number, boolean>>({});
  const [wrong, setWrong] = useState<number | null>(null);
  const [seed, setSeed] = useState(1);

  // deterministic shuffle so SSR and client agree
  const shuffled = useMemo(() => {
    const arr = pairs.map((_, i) => i);
    let s = seed * 7919 + 13;
    const rnd = () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return arr;
  }, [pairs, seed]);

  useEffect(() => { setDone(isGameDone(key)); }, [key]);

  const tryMatch = (defIdx: number) => {
    if (selTerm === null) return;
    if (selTerm === defIdx) {
      const m = { ...matched, [defIdx]: true };
      setMatched(m); setSelTerm(null);
      if (Object.keys(m).length === pairs.length) { setDone(true); markGame(key); }
    } else {
      setWrong(defIdx);
      setTimeout(() => setWrong(null), 450);
    }
  };

  const matchedCount = Object.keys(matched).length;

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Click a term, then its matching description. {matchedCount}/{pairs.length} paired.</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          {pairs.map((p, i) => (
            <button key={p.term} onClick={() => setSelTerm(i)} disabled={!!matched[i]}
              className={`w-full text-left text-xs px-2.5 py-2 rounded-md border transition-colors ${matched[i] ? 'border-success/50 bg-success/10 text-success' : selTerm === i ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
              <span className="font-medium">{p.term}</span>
            </button>
          ))}
        </div>
        <div className="space-y-1.5">
          {shuffled.map((origIdx) => {
            const p = pairs[origIdx];
            const isMatched = !!matched[origIdx];
            const isWrong = wrong === origIdx;
            return (
              <button key={p.term} onClick={() => tryMatch(origIdx)} disabled={isMatched}
                className={`w-full text-left text-[11px] leading-snug px-2.5 py-2 rounded-md border transition-colors ${isMatched ? 'border-success/50 bg-success/10 text-success/80' : isWrong ? 'border-destructive bg-destructive/10 animate-pulse' : 'border-border hover:border-primary/50'}`}
                title={p.def}>
                {p.def.length > 120 ? p.def.slice(0, 117) + '…' : p.def}
              </button>
            );
          })}
        </div>
      </div>
      {done ? (
        <p className="text-xs text-success flex items-center gap-1.5"><Trophy className="h-3.5 w-3.5" />All paired — nicely done!</p>
      ) : (
        <button onClick={() => { setSeed((s) => s + 1); setMatched({}); setSelTerm(null); }} className="text-xs px-2.5 py-1 rounded-full bg-muted hover:bg-muted/70 text-muted-foreground flex items-center gap-1.5"><RotateCcw className="h-3 w-3" />Reshuffle</button>
      )}
    </div>
  );
}

/* ---------------- Structure finder: function -> name ---------------- */

export interface StructureQ { id: string; name: string; fn: string }

export function StructureFinder({ moduleId, structures }: { moduleId: string; structures: StructureQ[] }) {
  const key = `finder:${moduleId}`;
  const usable = structures.filter((s) => s.fn);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => { setDone(isGameDone(key)); }, [key]);

  const total = Math.min(6, usable.length);
  const target = usable[round % usable.length];
  const options = useMemo(() => {
    if (!target) return [];
    const others = usable.filter((s) => s.id !== target.id).map((s) => s.id);
    // deterministic pick of 3 distractors based on round
    const picks: string[] = [];
    let s = (round + 1) * 31 + moduleId.length;
    while (picks.length < Math.min(3, others.length)) {
      s = (s * 1103515245 + 12345) % 2147483648;
      const cand = others[Math.floor((s / 2147483648) * others.length)];
      if (!picks.includes(cand)) picks.push(cand);
    }
    return [target, ...picks.map((id) => usable.find((u) => u.id === id)!)].sort((a, b) => a.name.localeCompare(b.name));
  }, [target, usable, round, moduleId]);

  if (usable.length < 4) return <p className="text-xs text-muted-foreground">Not enough structures in this module for the finder game.</p>;

  const choose = (id: string) => {
    if (picked) return;
    setPicked(id);
    if (id === target.id) setScore((s) => s + 1);
  };
  const nextRound = () => {
    setPicked(null);
    if (round + 1 >= total) { setDone(true); markGame(key); }
    setRound((r) => r + 1);
  };
  const restart = () => { setRound(0); setScore(0); setPicked(null); setDone(false); };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Round {Math.min(round + 1, total)}/{total} · score {score}. Which structure does this job?</p>
      <div className="rounded-md bg-muted/40 p-3 text-sm">&ldquo;{target.fn}&rdquo;</div>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((o) => {
          const show = picked !== null;
          const correct = o.id === target.id;
          return (
            <button key={o.id} onClick={() => choose(o.id)} disabled={show}
              className={`text-left text-xs px-2.5 py-2 rounded-md border transition-colors ${
                show && correct ? 'border-success bg-success/10 text-success font-medium'
                : show && picked === o.id ? 'border-destructive bg-destructive/10'
                : 'border-border hover:border-primary/50'}`}>
              {o.name}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="flex items-center justify-between">
          <p className={`text-xs font-medium ${picked === target.id ? 'text-success' : 'text-destructive'}`}>{picked === target.id ? '✓ Found it!' : `✗ That was the ${target.name}.`}</p>
          {round + 1 < total || !done ? (
            <button onClick={nextRound} className="text-xs px-3 py-1.5 rounded-full bg-primary text-primary-foreground">{round + 1 >= total ? (done ? 'Play again' : 'Finish') : 'Next'}</button>
          ) : null}
        </div>
      )}
      {done && picked !== null && round + 1 >= total && (
        <p className="text-xs text-success flex items-center gap-1.5"><Trophy className="h-3.5 w-3.5" />Score {score}/{total} — anatomy spotting complete!</p>
      )}
    </div>
  );
}

/* ---------------- 60-second sprint (the manual's "Quiz/60 Seconds") ---------------- */

export function RapidFire({ moduleId, questions }: { moduleId: string; questions: { id: string; question: string; options: string[]; answer: number; explanation: string }[] }) {
  const key = `sprint:${moduleId}`;
  const [running, setRunning] = useState(false);
  const [left, setLeft] = useState(60);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<{ id: string; pick: number }[]>([]);
  const [finished, setFinished] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => { setDone(isGameDone(key)); }, [key]);

  useEffect(() => {
    if (!running) return;
    if (left <= 0) {
      setRunning(false); setFinished(true); markGame(key);
      return;
    }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [running, left, key]);

  const start = () => {
    // shuffle questions deterministically per run index using Date-free counter
    setLeft(60); setIdx(0); setAnswers([]); setFinished(false); setRunning(true);
  };

  const order = useMemo(() => {
    const arr = questions.map((_, i) => i);
    let s = moduleId.length * 1337 + 7;
    const rnd = () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return arr;
  }, [questions, moduleId]);

  if (questions.length < 2) return null;
  const q = questions[order[idx % questions.length]];
  const score = answers.filter((a) => a.pick === questions.find((qq) => qq.id === a.id)!.answer).length;

  const answer = (i: number) => {
    setAnswers((a) => [...a, { id: q.id, pick: i }]);
    setIdx((x) => x + 1);
  };

  if (finished) {
    const wrongOnes = answers.filter((a) => a.pick !== questions.find((qq) => qq.id === a.id)!.answer);
    const pct = Math.round((100 * score) / Math.max(1, answers.length));
    return (
      <div className="space-y-3">
        <p className="text-2xl font-bold text-primary tabular-nums">{score} correct in 60 s</p>
        <p className="text-xs text-muted-foreground">{answers.length} answered · {pct}% accuracy · {done ? 'personal best saved' : ''}</p>
        {wrongOnes.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Review the misses:</p>
            {wrongOnes.map((a) => {
              const qq = questions.find((x) => x.id === a.id)!;
              return (
                <div key={a.id} className="rounded-md border border-border p-2.5 space-y-1">
                  <p className="text-xs font-medium">{qq.question}</p>
                  <p className="text-xs text-success">✓ {qq.options[qq.answer]}</p>
                  <p className="text-[11px] text-muted-foreground">{qq.explanation}</p>
                </div>
              );
            })}
          </div>
        )}
        <button onClick={start} className="text-xs px-2.5 py-1 rounded-full bg-muted hover:bg-muted/70 text-muted-foreground flex items-center gap-1.5"><RotateCcw className="h-3 w-3" />Another sprint</button>
      </div>
    );
  }

  if (!running) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">The tutorial game: answer as many questions as you can in 60 seconds. Speed first — explanations come at the end.</p>
        <button onClick={start} className="text-xs px-3 py-1.5 rounded-full bg-primary text-primary-foreground flex items-center gap-1.5"><Timer className="h-3.5 w-3.5" />Start the 60-second sprint</button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className={`text-lg font-bold tabular-nums ${left <= 10 ? 'text-destructive' : 'text-primary'}`}>{left}s</span>
        <span className="text-xs text-muted-foreground">{score} correct · {idx} answered</span>
        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full bg-destructive/60 rounded-full transition-all duration-1000" style={{ width: `${(left / 60) * 100}%` }} /></div>
      </div>
      <p className="text-sm font-medium">{q.question}</p>
      <div className="grid gap-2">
        {q.options.map((o, i) => (
          <button key={i} onClick={() => answer(i)} className="text-left text-sm px-3 py-2 rounded-md border border-border hover:border-primary/50 transition-colors">{o}</button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Arcade: tabbed wrapper ---------------- */

type Tab = 'match' | 'finder' | 'sprint';

export function ModuleArcade({ moduleId, pairs, structures, questions }: {
  moduleId: string;
  pairs: { term: string; def: string }[];
  structures: StructureQ[];
  questions: { id: string; question: string; options: string[]; answer: number; explanation: string }[];
}) {
  const [tab, setTab] = useState<Tab>('match');
  const tabs: { id: Tab; label: string; icon: typeof Puzzle }[] = [
    { id: 'match', label: 'Pair them up', icon: Puzzle },
    { id: 'finder', label: 'Find the structure', icon: Crosshair },
    { id: 'sprint', label: '60-second sprint', icon: Timer },
  ];
  return (
    <section className="panel rounded-lg p-4 space-y-3" aria-labelledby="arcade-heading">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="arcade-heading" className="font-semibold flex items-center gap-2"><Puzzle className="h-4 w-4 text-primary" />Game arcade</h2>
        <div className="flex gap-1.5">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 ${tab === t.id ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/70 text-muted-foreground'}`}><t.icon className="h-3.5 w-3.5" />{t.label}</button>
          ))}
        </div>
      </div>
      {tab === 'match' && <MatchGame moduleId={moduleId} pairs={pairs} />}
      {tab === 'finder' && <StructureFinder moduleId={moduleId} structures={structures} />}
      {tab === 'sprint' && <RapidFire moduleId={moduleId} questions={questions} />}
    </section>
  );
}
