'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Network, RotateCcw, X } from 'lucide-react';
import { CONCEPT_NODES, CONCEPT_EDGES } from '@/lib/data/concept-graph';
import type { ConceptNode, ConceptType } from '@/lib/data/concept-graph';
import { forceLayout } from '@/lib/force-layout';
import type { Pt } from '@/lib/force-layout';
import { useScope } from '@/lib/use-scope';
import { useMounted } from '@/components/client-only';

const W = 1000, H = 680;
const TYPES: { id: ConceptType; label: string; color: string }[] = [
  { id: 'structure', label: 'Structures', color: '#22d3ee' },
  { id: 'concept', label: 'Concepts', color: '#a78bfa' },
  { id: 'disorder', label: 'Disorders', color: '#f87171' },
  { id: 'method', label: 'Methods', color: '#fbbf24' },
];
const COLOR: Record<string, string> = Object.fromEntries(TYPES.map((t) => [t.id, t.color]));

export default function MindmapClient() {
  const { maxWeek, scope } = useScope();
  const mounted = useMounted();
  const [types, setTypes] = useState<ConceptType[]>(TYPES.map((t) => t.id));
  const [hover, setHover] = useState<string | null>(null);
  const [sel, setSel] = useState<string | null>(null);
  const [moved, setMoved] = useState<Record<string, Pt>>({});
  const drag = useRef<{ id: string; moved: boolean } | null>(null);
  const svg = useRef<SVGSVGElement | null>(null);

  const nodes = useMemo(() => CONCEPT_NODES.filter((n: ConceptNode) => (n.weeks.length === 0 || n.weeks.some((w: number) => w <= maxWeek)) && types.includes(n.type)), [maxWeek, types]);
  const ids = useMemo(() => new Set(nodes.map((n) => n.id)), [nodes]);
  const edges = useMemo(() => CONCEPT_EDGES.filter(([a, b]) => ids.has(a) && ids.has(b)), [ids]);
  const base = useMemo(() => forceLayout(nodes.map((n) => ({ id: n.id, group: TYPES.findIndex((t) => t.id === n.type) })), edges, { width: W, height: H, groups: 4 }), [nodes, edges]);
  const pos = (id: string): Pt => moved[id] ?? base[id] ?? { x: W / 2, y: H / 2 };
  const degree = useMemo(() => { const d: Record<string, number> = {}; edges.forEach(([a, b]) => { d[a] = (d[a] ?? 0) + 1; d[b] = (d[b] ?? 0) + 1; }); return d; }, [edges]);
  const focus = hover ?? sel;
  const nbrs = useMemo(() => { const s = new Set<string>(); if (focus) { s.add(focus); edges.forEach(([a, b]) => { if (a === focus) s.add(b); if (b === focus) s.add(a); }); } return s; }, [focus, edges]);
  const selNode = sel ? CONCEPT_NODES.find((n) => n.id === sel) : undefined;

  const toSvg = (e: React.PointerEvent): Pt => {
    const r = svg.current?.getBoundingClientRect();
    if (!r) return { x: 0, y: 0 };
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    d.moved = true;
    const p = toSvg(e);
    setMoved((m) => ({ ...m, [d.id]: { x: Math.max(10, Math.min(W - 10, p.x)), y: Math.max(10, Math.min(H - 10, p.y)) } }));
  };
  const onUp = () => { const d = drag.current; drag.current = null; if (d && !d.moved) setSel((s) => (s === d.id ? null : d.id)); };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      <section className="panel p-2 rounded-lg space-y-2">
        <div className="flex flex-wrap items-center gap-2 px-2 pt-1">
          {TYPES.map((t) => {
            const on = types.includes(t.id);
            return (
              <button key={t.id} onClick={() => setTypes((ts) => (on ? ts.filter((x) => x !== t.id) : [...ts, t.id]))} aria-pressed={on} className={`text-xs px-2 py-1 rounded-md flex items-center gap-1.5 ${on ? 'bg-muted' : 'opacity-40'}`}>
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: t.color }} />{t.label}
              </button>
            );
          })}
          <button onClick={() => setMoved({})} className="ml-auto text-xs px-2 py-1 rounded-md bg-muted flex items-center gap-1"><RotateCcw className="h-3 w-3" />Reset layout</button>
        </div>
        <p className="px-2 text-[11px] text-muted-foreground">{nodes.length} nodes · {edges.length} links · scope {scope === 'partial' ? 'Weeks 1–7' : 'Weeks 1–11'}</p>
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto touch-none select-none rounded-md bg-black/20" onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp} role="img" aria-label="Concept mind-map">
          <defs>
            <filter id="mm-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
          {mounted && edges.map(([a, b]) => {
            const pa = pos(a), pb = pos(b);
            const lit = !!focus && (a === focus || b === focus);
            return <line key={`${a}-${b}`} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke={lit ? '#e2e8f0' : '#64748b'} strokeOpacity={focus ? (lit ? 0.9 : 0.08) : 0.35} strokeWidth={lit ? 1.8 : 1} />;
          })}
          {mounted && nodes.map((n) => {
            const p = pos(n.id); const r = 6 + Math.min(8, (degree[n.id] ?? 0) * 1.2);
            const dim = !!focus && !nbrs.has(n.id);
            return (
              <g key={n.id} transform={`translate(${p.x},${p.y})`} opacity={dim ? 0.18 : 1} className="cursor-pointer"
                onPointerDown={(e) => { svg.current?.setPointerCapture?.(e.pointerId); drag.current = { id: n.id, moved: false }; }}
                onPointerEnter={() => setHover(n.id)} onPointerLeave={() => setHover(null)}>
                <circle r={r} fill={COLOR[n.type]} fillOpacity={0.85} stroke={sel === n.id ? '#fff' : 'none'} strokeWidth={2} filter={focus === n.id ? 'url(#mm-glow)' : undefined} />
                <text y={-r - 4} textAnchor="middle" fontSize={11} fill="#e2e8f0" style={{ paintOrder: 'stroke', stroke: '#05070B', strokeWidth: 3 }}>{n.label}</text>
              </g>
            );
          })}
        </svg>
      </section>
      <aside className="panel p-4 rounded-lg space-y-3 text-sm">
        <h2 className="font-semibold flex items-center gap-2"><Network className="h-4 w-4 text-primary" />Node details</h2>
        {selNode ? (
          <div className="space-y-2">
            <div className="flex items-start justify-between"><p className="text-lg font-semibold" style={{ color: COLOR[selNode.type] }}>{selNode.label}</p><button aria-label="Clear selection" onClick={() => setSel(null)}><X className="h-4 w-4" /></button></div>
            <p className="text-xs text-muted-foreground capitalize">{selNode.type} · Weeks {selNode.weeks.join(', ')}</p>
            <p>{selNode.note}</p>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Connected to</p>
              <div className="flex flex-wrap gap-1">
                {CONCEPT_EDGES.filter(([a, b]) => a === selNode.id || b === selNode.id).map(([a, b]) => { const o = CONCEPT_NODES.find((x) => x.id === (a === selNode.id ? b : a)); return o ? <button key={o.id} onClick={() => setSel(o.id)} className="text-xs px-2 py-0.5 rounded bg-muted hover:bg-muted/70" style={{ color: COLOR[o.type] }}>{o.label}</button> : null; })}
              </div>
            </div>
            {selNode.structureId && <Link href={`/atlas?s=${selNode.structureId}`} className="inline-block px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs">Show in 3D atlas</Link>}
          </div>
        ) : <p className="text-muted-foreground">Click a node to see its note, course weeks and links. Structure nodes open directly in the 3D atlas.</p>}
      </aside>
    </div>
  );
}
