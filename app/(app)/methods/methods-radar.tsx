'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { METHODS } from '@/lib/data/methods';
import type { MethodInfo } from '@/lib/data/methods';
import CiteChips from '@/components/cite-chips';

const AXES: { key: keyof MethodInfo['scores']; label: string }[] = [
  { key: 'spatial', label: 'Spatial res.' },
  { key: 'temporal', label: 'Temporal res.' },
  { key: 'invasiveness', label: 'Non-invasive' },
  { key: 'cost', label: 'Affordable' },
  { key: 'causal', label: 'Causal power' },
];
const C = 170, R = 118;
const pt = (i: number, v: number): [number, number] => {
  const a = (-90 + i * (360 / AXES.length)) * (Math.PI / 180);
  return [C + Math.cos(a) * R * (v / 10), C + Math.sin(a) * R * (v / 10)];
};
const poly = (vals: number[]) => vals.map((v, i) => pt(i, v).map((n) => n.toFixed(1)).join(',')).join(' ');

export default function MethodsRadar() {
  const [sel, setSel] = useState<string[]>(['fmri', 'eeg', 'tms']);
  const toggle = (id: string) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const chosen = METHODS.filter((m) => sel.includes(m.id));

  return (
    <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {METHODS.map((m) => {
            const on = sel.includes(m.id);
            return (
              <button key={m.id} onClick={() => toggle(m.id)} aria-pressed={on}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${on ? 'text-background font-medium' : 'text-muted-foreground border-border hover:text-foreground'}`}
                style={on ? { background: m.color, borderColor: m.color } : undefined}>
                {m.name}
              </button>
            );
          })}
        </div>
        <svg viewBox="0 0 340 340" className="w-full max-w-[360px] mx-auto" role="img" aria-label="Radar chart comparing selected methods">
          {[2, 4, 6, 8, 10].map((r) => <polygon key={r} points={poly(AXES.map(() => r))} fill="none" stroke="hsl(var(--muted-foreground))" strokeOpacity={0.3} strokeWidth={r === 10 ? 1.2 : 0.6} />)}
          {AXES.map((a, i) => {
            const [x, y] = pt(i, 10); const [lx, ly] = pt(i, 12.2);
            return (
              <g key={a.key}>
                <line x1={C} y1={C} x2={x} y2={y} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.3} strokeWidth={0.6} />
                <text x={lx} y={ly} fontSize={11} textAnchor="middle" dominantBaseline="middle" fill="hsl(var(--muted-foreground))">{a.label}</text>
              </g>
            );
          })}
          {chosen.map((m) => (
            <polygon key={m.id} points={poly(AXES.map((a) => m.scores[a.key]))} fill={m.color} fillOpacity={0.14} stroke={m.color} strokeWidth={2} strokeLinejoin="round" />
          ))}
          {chosen.map((m) => AXES.map((a, i) => { const [x, y] = pt(i, m.scores[a.key]); return <circle key={m.id + a.key} cx={x} cy={y} r={3} fill={m.color}><title>{`${m.name} · ${a.label}: ${m.scores[a.key]}/10`}</title></circle>; }))}
        </svg>
        <p className="text-[11px] text-muted-foreground text-center">Outer ring = 10 (best). Ratings are teaching approximations, not absolute benchmarks.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 content-start">
        {chosen.length === 0 && <p className="text-sm text-muted-foreground">Select one or more methods to compare.</p>}
        {chosen.map((m) => (
          <article key={m.id} className="panel rounded-lg p-4 space-y-2" style={{ borderTop: `3px solid ${m.color}` }}>
            <h3 className="font-semibold" style={{ color: m.color }}>{m.name}</h3>
            <p className="text-xs text-muted-foreground"><span className="text-foreground">Measures:</span> {m.measures}</p>
            <ul className="text-xs space-y-1">
              {m.pros.map((p) => <li key={p} className="flex gap-1.5"><Check className="h-3.5 w-3.5 text-success shrink-0 mt-px" />{p}</li>)}
              {m.cons.map((p) => <li key={p} className="flex gap-1.5 text-muted-foreground"><X className="h-3.5 w-3.5 text-destructive shrink-0 mt-px" />{p}</li>)}
            </ul>
            <CiteChips ids={m.citations} />
          </article>
        ))}
      </div>
    </div>
  );
}
