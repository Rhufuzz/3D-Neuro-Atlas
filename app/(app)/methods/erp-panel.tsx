'use client';

import { useMemo, useState } from 'react';
import CiteChips from '@/components/cite-chips';

type Kind = 'semantic' | 'syntactic';
const g = (t: number, mu: number, sd: number) => Math.exp(-((t - mu) ** 2) / (2 * sd * sd));
const base = (t: number) => 1.6 * g(t, 100, 22) - 3.2 * g(t, 165, 28) + 2.8 * g(t, 240, 38) + 0.8 * g(t, 330, 60);

const SEM = [
  { word: 'butter', cloze: 0.95 },
  { word: 'jam', cloze: 0.3 },
  { word: 'socks', cloze: 0 },
];
const W = 620, H = 260, PX = 46, PY = 18, YMAX = 8;
const x = (ms: number) => PX + ((ms + 100) / 1100) * (W - PX - 10);
const yOf = (uv: number, negUp: boolean) => H / 2 + (negUp ? 1 : -1) * (uv / YMAX) * (H / 2 - PY);

export default function ErpPanel() {
  const [kind, setKind] = useState<Kind>('semantic');
  const [semIdx, setSemIdx] = useState(2);
  const [negUp, setNegUp] = useState(true);
  const y = (uv: number) => yOf(uv, negUp);

  const { ctrl, viol, n400, p600 } = useMemo(() => {
    const n4 = kind === 'semantic' ? -6 * (1 - SEM[semIdx].cloze) : -0.6;
    const p6 = kind === 'syntactic' ? 5.5 : 0.4 * (1 - SEM[semIdx].cloze);
    const lan = kind === 'syntactic' ? -1.6 : 0;
    const c: string[] = []; const v: string[] = [];
    for (let t = -100; t <= 1000; t += 4) {
      const b = base(t) - 1.2 * g(t, 400, 90);
      c.push(`${x(t).toFixed(1)},${yOf(b, negUp).toFixed(1)}`);
      const vv = b + n4 * g(t, 400, 85) + lan * g(t, 360, 60) + p6 * g(t, 680, 130);
      v.push(`${x(t).toFixed(1)},${yOf(vv, negUp).toFixed(1)}`);
    }
    return { ctrl: c.join(' '), viol: v.join(' '), n400: n4, p600: p6 };
  }, [kind, semIdx, negUp]);

  const color = kind === 'semantic' ? '#f472b6' : '#fbbf24';
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {(['semantic', 'syntactic'] as Kind[]).map((k) => (
          <button key={k} onClick={() => setKind(k)} aria-pressed={kind === k}
            className={`text-xs px-3 py-1.5 rounded-md transition-colors ${kind === k ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-muted/50'}`}>
            {k === 'semantic' ? 'Semantic anomaly (N400)' : 'Syntactic violation (P600)'}
          </button>
        ))}
        <span className="flex-1" />
        <label className="text-xs text-muted-foreground inline-flex items-center gap-1.5 cursor-pointer">
          <input type="checkbox" checked={negUp} onChange={(e) => setNegUp(e.target.checked)} className="accent-[hsl(var(--primary))]" />Negative plotted up
        </label>
      </div>

      <div className="panel rounded-lg p-3 text-sm">
        {kind === 'semantic' ? (
          <div className="space-y-2">
            <p>He spread the warm bread with <span className="font-semibold" style={{ color }}>{SEM[semIdx].word}</span>.</p>
            <div className="flex flex-wrap gap-1.5">
              {SEM.map((s, i) => (
                <button key={s.word} onClick={() => setSemIdx(i)} className={`text-xs px-2 py-0.5 rounded ${i === semIdx ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50'}`}>
                  {s.word} <span className="opacity-60">(cloze {s.cloze.toFixed(2)})</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p>The cats won&apos;t <span className="font-semibold" style={{ color }}>eats</span> the food. <span className="text-muted-foreground">vs. “The cats won&apos;t eat the food.”</span></p>
        )}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full panel rounded-lg" role="img" aria-label="Event-related potential waveforms at Pz">
        <rect x={x(300)} y={PY} width={x(500) - x(300)} height={H - 2 * PY} fill="#f472b6" opacity={0.07} />
        <rect x={x(500)} y={PY} width={x(850) - x(500)} height={H - 2 * PY} fill="#fbbf24" opacity={0.06} />
        <text x={x(400)} y={PY + 12} fontSize={11} textAnchor="middle" fill="#f472b6">N400 window</text>
        <text x={x(675)} y={PY + 12} fontSize={11} textAnchor="middle" fill="#fbbf24">P600 window</text>
        <line x1={PX} y1={H / 2} x2={W - 10} y2={H / 2} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.4} />
        <line x1={x(0)} y1={PY} x2={x(0)} y2={H - PY} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.4} />
        {[0, 200, 400, 600, 800, 1000].map((ms) => <text key={ms} x={x(ms)} y={H - 4} fontSize={10} textAnchor="middle" fill="hsl(var(--muted-foreground))">{ms}</text>)}
        {[-5, 5].map((uv) => <text key={uv} x={PX - 6} y={y(uv)} fontSize={10} textAnchor="end" dominantBaseline="middle" fill="hsl(var(--muted-foreground))">{uv > 0 ? `+${uv}` : uv} µV</text>)}
        <polyline points={ctrl} fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth={2} />
        <polyline points={viol} fill="none" stroke={color} strokeWidth={2.2} />
        <g fontSize={11}>
          <line x1={W - 170} y1={PY + 30} x2={W - 150} y2={PY + 30} stroke="hsl(var(--muted-foreground))" strokeWidth={2} />
          <text x={W - 145} y={PY + 34} fill="hsl(var(--muted-foreground))">{kind === 'semantic' ? 'Expected (butter)' : 'Grammatical'}</text>
          <line x1={W - 170} y1={PY + 48} x2={W - 150} y2={PY + 48} stroke={color} strokeWidth={2} />
          <text x={W - 145} y={PY + 52} fill={color}>{kind === 'semantic' ? `“${SEM[semIdx].word}”` : 'Agreement error'}</text>
        </g>
        <text x={PX + 4} y={PY + 12} fontSize={10} fill="hsl(var(--muted-foreground))">Pz · ms after critical word</text>
      </svg>

      <div className="grid gap-2 sm:grid-cols-2 text-xs">
        <div className="panel rounded-md p-2.5"><span className="text-muted-foreground">N400 effect (300–500 ms): </span><span className="font-semibold" style={{ color: '#f472b6' }}>{n400.toFixed(1)} µV</span></div>
        <div className="panel rounded-md p-2.5"><span className="text-muted-foreground">P600 effect (500–850 ms): </span><span className="font-semibold" style={{ color: '#fbbf24' }}>+{p600.toFixed(1)} µV</span></div>
      </div>
      <p className="text-sm text-muted-foreground">
        The N400 is a centro-parietal negativity whose amplitude grows as a word becomes less predictable (lower cloze probability) — it indexes semantic access and integration, not anomaly per se. Syntactic violations instead elicit a late posterior positivity (P600), sometimes preceded by a left anterior negativity (LAN). Waveforms here are idealised simulations.
      </p>
      <CiteChips ids={['kutas1980', 'kutas2011', 'osterhout1992']} />
    </div>
  );
}
