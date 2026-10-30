'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Layers, Box, Loader2 } from 'lucide-react';
import { FLASHCARDS } from '@/lib/data/flashcards';
import { STRUCTURE_MAP } from '@/lib/data/structures';
import type { Flashcard } from '@/lib/data/types';
import { GRADES, sm2, formatInterval } from '@/lib/sm2';

interface Progress { cardId: string; easeFactor: number; interval: number; repetitions: number; lapses: number; dueAt: string; reviews: number }

export default function FlashcardDeck({ maxWeek, onFocus }: { maxWeek: number; onFocus: (id: string | null, label: string | null) => void }) {
  const [prog, setProg] = useState<Record<string, Progress>>({});
  const [state, setState] = useState<'loading' | 'synced' | 'offline'>('loading');
  const [now, setNow] = useState<number>(0);
  const [flip, setFlip] = useState(false);
  const [ahead, setAhead] = useState(false);
  const [busy, setBusy] = useState(false);
  const [skip, setSkip] = useState<string[]>([]);

  useEffect(() => {
    setNow(Date.now());
    fetch('/api/progress/flashcards')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d: { progress?: Progress[] }) => {
        const m: Record<string, Progress> = {};
        (d?.progress ?? []).forEach((p: Progress) => { m[p.cardId] = p; });
        setProg(m); setState('synced');
      })
      .catch((e: unknown) => { console.error('Flashcard progress load failed', e); setState('offline'); });
  }, []);

  const cards = useMemo(() => FLASHCARDS.filter((c: Flashcard) => c.week <= maxWeek), [maxWeek]);
  const due = (c: Flashcard) => { const p = prog[c.id]; return !!p && new Date(p.dueAt).getTime() <= now; };
  const stats = useMemo(() => {
    let d = 0, n = 0, l = 0;
    cards.forEach((c: Flashcard) => { const p = prog[c.id]; if (!p) n++; else if (new Date(p.dueAt).getTime() <= now) d++; else l++; });
    return { due: d, fresh: n, learned: l };
  }, [cards, prog, now]);

  const queue = useMemo(() => {
    const pool = cards.filter((c: Flashcard) => !skip.includes(c.id));
    const dueCards = pool.filter(due).sort((a, b) => new Date(prog[a.id].dueAt).getTime() - new Date(prog[b.id].dueAt).getTime());
    const fresh = pool.filter((c: Flashcard) => !prog[c.id]);
    if (dueCards.length || fresh.length) return [...dueCards, ...fresh];
    return ahead ? pool.slice().sort((a, b) => new Date(prog[a.id]?.dueAt ?? 0).getTime() - new Date(prog[b.id]?.dueAt ?? 0).getTime()) : [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards, prog, now, ahead, skip]);
  const card = queue[0];

  useEffect(() => {
    const sid = card?.structureId ?? null;
    onFocus(sid, flip && sid ? STRUCTURE_MAP[sid]?.name ?? null : null);
  }, [card?.id, card?.structureId, flip, onFocus]);

  const grade = useCallback(async (q: number) => {
    if (!card || busy) return;
    setBusy(true);
    const local = sm2(prog[card.id] ?? null, q);
    const optimistic: Progress = { cardId: card.id, easeFactor: local.easeFactor, interval: local.interval, repetitions: local.repetitions, lapses: local.lapses, dueAt: new Date(Date.now() + local.dueInMinutes * 60000).toISOString(), reviews: (prog[card.id]?.reviews ?? 0) + 1 };
    if (state === 'synced') {
      try {
        const r = await fetch('/api/progress/flashcards', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cardId: card.id, grade: q }) });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const d = (await r.json()) as { progress?: Progress };
        setProg((m) => ({ ...m, [card.id]: d?.progress ?? optimistic }));
      } catch (e) {
        console.error('Flashcard review save failed', e);
        setProg((m) => ({ ...m, [card.id]: optimistic }));
        setState('offline');
      }
    } else setProg((m) => ({ ...m, [card.id]: optimistic }));
    if (ahead) setSkip((s) => [...s, card.id]);
    setFlip(false); setNow(Date.now()); setBusy(false);
  }, [card, busy, prog, state, ahead]);

  return (
    <section className="panel p-4 rounded-lg space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold flex items-center gap-2"><Layers className="h-4 w-4 text-primary" />Spaced-repetition deck</h2>
        <span className="text-[11px] text-muted-foreground">{state === 'loading' ? 'Loading…' : state === 'synced' ? 'Synced to your account' : 'Offline – this session only'}</span>
      </div>
      <div className="flex gap-2 text-xs">
        <span className="px-2 py-0.5 rounded bg-warning/20 text-warning">{stats.due} due</span>
        <span className="px-2 py-0.5 rounded bg-primary/15 text-primary">{stats.fresh} new</span>
        <span className="px-2 py-0.5 rounded bg-success/15 text-success">{stats.learned} scheduled</span>
      </div>
      {state === 'loading' ? (
        <div className="min-h-[180px] flex items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
      ) : card ? (
        <>
          <button onClick={() => setFlip(!flip)} className="w-full min-h-[180px] glass-panel rounded-lg p-5 text-left hover:shadow-lg transition">
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-2">Week {card.week} · {card.tag} · {flip ? 'Answer' : 'Question (tap to reveal)'}{card.structureId && <Box className="h-3 w-3 text-primary" aria-label="Shown in 3D" />}</p>
            <p className={flip ? 'text-sm' : 'font-medium'}>{flip ? card.back : card.front}</p>
          </button>
          {flip ? (
            <div className="grid grid-cols-4 gap-2">
              {GRADES.map((g) => (
                <button key={g.label} disabled={busy} onClick={() => grade(g.q)} className={`px-2 py-1.5 rounded-md text-sm disabled:opacity-50 ${g.tone}`}>
                  <span className="block font-medium">{g.label}</span>
                  <span className="block text-[10px] opacity-80">{formatInterval(sm2(prog[card.id] ?? null, g.q).dueInMinutes)}</span>
                </button>
              ))}
            </div>
          ) : (
            <button onClick={() => setFlip(true)} className="w-full px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm">Reveal answer</button>
          )}
        </>
      ) : (
        <div className="min-h-[180px] glass-panel rounded-lg p-5 flex flex-col items-center justify-center gap-3 text-center">
          <p className="font-medium">All caught up for this scope.</p>
          <p className="text-xs text-muted-foreground">Every card is scheduled for later. You can review ahead without waiting.</p>
          <button onClick={() => { setSkip([]); setAhead(true); }} className="px-3 py-1.5 rounded-md bg-muted text-sm hover:bg-muted/70">Study ahead</button>
        </div>
      )}
    </section>
  );
}
