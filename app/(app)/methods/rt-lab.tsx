'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import CiteChips from '@/components/cite-chips';

type Task = 'simple' | 'choice' | 'posner';
type Phase = 'idle' | 'wait' | 'cue' | 'go' | 'feedback' | 'done';
type Side = 'L' | 'R';
interface Trial { task: Task; rt: number; correct: boolean; valid?: boolean }

const N: Record<Task, number> = { simple: 8, choice: 8, posner: 16 };
const TASKS: { id: Task; label: string; how: string }[] = [
  { id: 'simple', label: 'Donders A: simple RT', how: 'Press Space (or tap the box) as soon as ANY square appears.' },
  { id: 'choice', label: 'Donders B: choice RT', how: 'Press F if the square is on the LEFT, J if on the RIGHT (or tap the side buttons).' },
  { id: 'posner', label: 'Posner cueing', how: 'Keep your eyes on the centre. An arrow cues a side (75 % valid). Press Space as soon as the target appears.' },
];
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : NaN);
const fmt = (v: number) => (Number.isFinite(v) ? `${Math.round(v)} ms` : '—');

export default function RtLab() {
  const [task, setTask] = useState<Task>('simple');
  const [phase, setPhase] = useState<Phase>('idle');
  const [stim, setStim] = useState<{ side: Side; cue?: Side }>({ side: 'L' });
  const [results, setResults] = useState<Trial[]>([]);
  const [msg, setMsg] = useState('');
  const [count, setCount] = useState(0);
  const timers = useRef<number[]>([]);
  const live = useRef({ phase: 'idle' as Phase, task: 'simple' as Task, t0: 0, side: 'L' as Side, valid: true, i: 0, plan: [] as boolean[] });

  const clear = () => { timers.current.forEach((t) => window.clearTimeout(t)); timers.current = []; };
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };
  const go = (p: Phase) => { live.current.phase = p; setPhase(p); };
  useEffect(() => clear, []);

  const runTrial = useCallback(() => {
    const L = live.current;
    const side: Side = Math.random() < 0.5 ? 'L' : 'R';
    L.side = side; setMsg(''); go('wait');
    if (L.task === 'posner') {
      const valid = L.plan[L.i] ?? true; L.valid = valid;
      const cue: Side = valid ? side : side === 'L' ? 'R' : 'L';
      later(() => { setStim({ side, cue }); go('cue'); later(() => { L.t0 = performance.now(); go('go'); }, 250 + Math.random() * 200); }, 500 + Math.random() * 400);
    } else {
      setStim({ side });
      later(() => { L.t0 = performance.now(); go('go'); }, 900 + Math.random() * 1300);
    }
  }, []);

  const start = (t: Task) => {
    clear();
    const L = live.current; L.task = t; L.i = 0;
    const n = N[t]; const nInvalid = Math.round(n / 4);
    const plan = Array.from({ length: n }, (_, i) => i >= nInvalid);
    for (let i = plan.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [plan[i], plan[j]] = [plan[j], plan[i]]; }
    L.plan = plan;
    setTask(t); setResults((r) => r.filter((x) => x.task !== t)); setCount(0);
    runTrial();
  };

  const respond = useCallback((side?: Side) => {
    const L = live.current;
    if (L.phase === 'wait' || L.phase === 'cue') {
      clear(); setMsg('Too early — wait for the target.'); go('feedback'); later(runTrial, 900); return;
    }
    if (L.phase !== 'go') return;
    const rt = performance.now() - L.t0;
    const correct = L.task === 'choice' ? side === L.side : true;
    const trial: Trial = { task: L.task, rt, correct, valid: L.task === 'posner' ? L.valid : undefined };
    setResults((r) => [...r, trial]);
    setMsg(correct ? `${Math.round(rt)} ms` : `Wrong side (${Math.round(rt)} ms)`);
    go('feedback');
    L.i += 1; setCount(L.i);
    later(() => { if (L.i >= N[L.task]) { go('done'); setMsg('Block complete.'); } else runTrial(); }, 700);
  }, [runTrial]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const L = live.current;
      if (L.phase === 'idle' || L.phase === 'done') return;
      const k = e.key.toLowerCase();
      if (L.task === 'choice' && (k === 'f' || k === 'j')) { e.preventDefault(); respond(k === 'f' ? 'L' : 'R'); }
      else if (L.task !== 'choice' && e.code === 'Space') { e.preventDefault(); respond(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [respond]);

  const ok = (t: Task, f?: (x: Trial) => boolean) => results.filter((r) => r.task === t && r.correct && r.rt > 120 && r.rt < 1500 && (!f || f(r))).map((r) => r.rt);
  const simple = mean(ok('simple')), choice = mean(ok('choice'));
  const valid = mean(ok('posner', (r) => r.valid === true)), invalid = mean(ok('posner', (r) => r.valid === false));
  const errors = results.filter((r) => r.task === 'choice' && !r.correct).length;
  const active = phase !== 'idle' && phase !== 'done';
  const info = TASKS.find((t) => t.id === task) ?? TASKS[0];
  const showTarget = phase === 'go' || (phase === 'feedback' && !msg.startsWith('Too'));

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {TASKS.map((t) => (
            <button key={t.id} onClick={() => start(t.id)} disabled={active}
              className={`text-xs px-3 py-1.5 rounded-md inline-flex items-center gap-1.5 transition-colors disabled:opacity-40 ${task === t.id ? 'bg-primary/20 text-primary' : 'bg-muted/50 text-muted-foreground hover:text-foreground'}`}>
              <Play className="h-3 w-3" />{t.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{info.how}</p>
        <div onPointerDown={() => { if (active && task !== 'choice') respond(); }}
          className="relative panel rounded-lg h-56 select-none touch-manipulation overflow-hidden" role="application" aria-label="Reaction-time stimulus display">
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl text-muted-foreground">
            {phase === 'cue' || (task === 'posner' && showTarget) ? (stim.cue === 'L' ? '←' : '→') : '+'}
          </span>
          {task === 'posner' && active && <>
            <span className="absolute left-[18%] top-1/2 -translate-y-1/2 h-14 w-14 rounded border border-muted-foreground/40" />
            <span className="absolute right-[18%] top-1/2 -translate-y-1/2 h-14 w-14 rounded border border-muted-foreground/40" />
          </>}
          {showTarget && (
            <span className={`absolute top-1/2 -translate-y-1/2 h-14 w-14 rounded ${task === 'posner' ? 'scale-50 bg-warning' : 'bg-primary'} ${stim.side === 'L' ? 'left-[18%]' : 'right-[18%]'}`} />
          )}
          {phase === 'idle' && <span className="absolute inset-x-0 bottom-4 text-center text-sm text-muted-foreground">Choose a task above to begin.</span>}
          {msg && <span className="absolute inset-x-0 top-3 text-center text-sm font-medium text-primary">{msg}</span>}
          {active && <span className="absolute right-3 bottom-2 text-[11px] text-muted-foreground">Trial {Math.min(count + 1, N[task])}/{N[task]}</span>}
        </div>
        {task === 'choice' && active && (
          <div className="grid grid-cols-2 gap-2">
            <button onPointerDown={() => respond('L')} className="py-3 rounded-md bg-muted hover:bg-muted/70 text-sm">Left (F)</button>
            <button onPointerDown={() => respond('R')} className="py-3 rounded-md bg-muted hover:bg-muted/70 text-sm">Right (J)</button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="panel rounded-lg p-4 space-y-2 text-sm">
          <h4 className="font-semibold">Donders’ subtraction</h4>
          <div className="flex justify-between"><span className="text-muted-foreground">Simple RT (A)</span><span className="tabular-nums">{fmt(simple)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Choice RT (B)</span><span className="tabular-nums">{fmt(choice)}</span></div>
          <div className="flex justify-between border-t border-border pt-2"><span>Decision time (B − A)</span><span className="font-semibold text-primary tabular-nums">{fmt(choice - simple)}</span></div>
          {errors > 0 && <p className="text-[11px] text-warning">{errors} choice error(s) excluded.</p>}
        </div>
        <div className="panel rounded-lg p-4 space-y-2 text-sm">
          <h4 className="font-semibold">Posner cueing</h4>
          <div className="flex justify-between"><span className="text-muted-foreground">Valid cue</span><span className="tabular-nums">{fmt(valid)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Invalid cue</span><span className="tabular-nums">{fmt(invalid)}</span></div>
          <div className="flex justify-between border-t border-border pt-2"><span>Validity effect</span><span className="font-semibold text-primary tabular-nums">{fmt(invalid - valid)}</span></div>
        </div>
        <p className="text-xs text-muted-foreground">Typical: simple ~220–280 ms, choice ~350–450 ms; invalid cues cost ~20–50 ms (reorienting via the right TPJ / ventral network). Trials &lt;120 ms or &gt;1500 ms are excluded. Results stay in this browser tab only.</p>
        {results.length > 0 && !active && (
          <button onClick={() => { setResults([]); setPhase('idle'); live.current.phase = 'idle'; setMsg(''); }} className="text-xs inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"><RotateCcw className="h-3 w-3" />Reset all</button>
        )}
        <CiteChips ids={['donders1969', 'posner1980', 'corbetta2002']} />
      </div>
    </div>
  );
}
