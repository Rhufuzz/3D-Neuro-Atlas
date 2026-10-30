'use client';

import { useMemo, useState, type ReactNode } from 'react';
import CiteChips from '@/components/cite-chips';
import { CELL_TYPES } from '@/lib/data/micro';

type Seg = [number, number, number, number, number];
const PI = Math.PI;

/** Deterministic binary branching tree (SVG y points down; −PI/2 = up). */
function tree(out: Seg[], x: number, y: number, ang: number, len: number, depth: number, spread: number, w = 2, shrink = 0.72) {
  const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
  out.push([x, y, x2, y2, w]);
  if (depth <= 0) return;
  tree(out, x2, y2, ang - spread, len * shrink, depth - 1, spread, w * 0.7, shrink);
  tree(out, x2, y2, ang + spread * 0.85, len * shrink, depth - 1, spread, w * 0.7, shrink);
}

const NEURON = '#22d3ee', GLIA = '#a78bfa', MYELIN = '#e2e8f0';
const Segs = ({ s, c }: { s: Seg[]; c: string }) => (
  <g stroke={c} strokeLinecap="round">{s.map(([a, b, x, y, w], i) => <line key={i} x1={a} y1={b} x2={x} y2={y} strokeWidth={Math.max(w, 0.5)} />)}</g>
);
const Myelin = ({ xs, y, w = 24 }: { xs: number[]; y: number; w?: number }) => (
  <g>{xs.map((x) => <rect key={x} x={x} y={y - 4} width={w} height={8} rx={4} fill={MYELIN} opacity={0.85} />)}</g>
);
const Label = ({ x, y, children, anchor = 'middle' }: { x: number; y: number; children: ReactNode; anchor?: 'start' | 'middle' | 'end' }) => (
  <text x={x} y={y} fontSize={8} textAnchor={anchor} fill="hsl(var(--muted-foreground))">{children}</text>
);

function drawing(id: string): ReactNode {
  const s: Seg[] = [];
  switch (id) {
    case 'multipolar':
      [-2.5, -1.7, -3.05, 2.4, 1.75, 2.95].forEach((a) => tree(s, 50 + Math.cos(a) * 9, 90 + Math.sin(a) * 9, a, 22, 2, 0.45));
      tree(s, 205, 90, 0, 12, 2, 0.6, 1.2);
      return (<><Segs s={s} c={NEURON} /><line x1={60} y1={90} x2={205} y2={90} stroke={NEURON} strokeWidth={1.6} /><Myelin xs={[78, 108, 138, 168]} y={90} />
        <circle cx={50} cy={90} r={11} fill={NEURON} opacity={0.85} /><circle cx={50} cy={90} r={4} fill="#0e7490" />
        <Label x={50} y={130}>dendrites + soma</Label><Label x={140} y={110}>myelinated axon</Label><Label x={215} y={130}>terminals → muscle</Label></>);
    case 'pyramidal':
      tree(s, 120, 42, -PI / 2, 18, 3, 0.5, 1.6);
      tree(s, 120, 82, -PI / 2 - 0.95, 18, 1, 0.4, 1.2); tree(s, 120, 64, -PI / 2 + 0.95, 18, 1, 0.4, 1.2);
      tree(s, 110, 130, PI * 0.82, 20, 2, 0.4, 1.6); tree(s, 130, 130, PI * 0.18, 20, 2, 0.4, 1.6);
      tree(s, 120, 160, PI * 0.25, 18, 1, 0.3, 0.8);
      return (<><Segs s={s} c={NEURON} /><line x1={120} y1={110} x2={120} y2={42} stroke={NEURON} strokeWidth={2.4} /><line x1={120} y1={132} x2={120} y2={178} stroke={NEURON} strokeWidth={1.1} />
        <polygon points="120,106 106,134 134,134" fill={NEURON} opacity={0.85} />
        <Label x={162} y={30}>apical tuft (layer I)</Label><Label x={60} y={170}>basal dendrites</Label><Label x={150} y={176}>axon → white matter</Label></>);
    case 'bipolar':
      tree(s, 50, 90, PI, 12, 2, 0.5, 1.4); tree(s, 195, 90, 0, 10, 2, 0.6, 1.2);
      return (<><Segs s={s} c={NEURON} /><line x1={50} y1={90} x2={195} y2={90} stroke={NEURON} strokeWidth={1.6} />
        <ellipse cx={120} cy={90} rx={11} ry={15} fill={NEURON} opacity={0.85} />
        <Label x={45} y={122}>dendrite (photoreceptors)</Label><Label x={195} y={122}>axon (ganglion cells)</Label></>);
    case 'unipolar':
      tree(s, 22, 100, PI, 10, 2, 0.6, 1.2); tree(s, 218, 100, 0, 10, 2, 0.6, 1.2);
      return (<><Segs s={s} c={NEURON} /><line x1={120} y1={57} x2={120} y2={100} stroke={NEURON} strokeWidth={1.6} /><line x1={22} y1={100} x2={218} y2={100} stroke={NEURON} strokeWidth={1.6} />
        <Myelin xs={[34, 62, 90, 132, 160, 188]} y={100} w={20} /><circle cx={120} cy={45} r={13} fill={NEURON} opacity={0.85} />
        <Label x={40} y={130}>peripheral branch (skin)</Label><Label x={200} y={130}>central branch (spinal cord)</Label><Label x={160} y={40}>soma in DRG</Label></>);
    case 'purkinje':
      tree(s, 120, 128, -PI / 2, 30, 6, 0.42, 2.4, 0.74);
      return (<><Segs s={s} c={NEURON} /><line x1={120} y1={150} x2={120} y2={128} stroke={NEURON} strokeWidth={2.6} /><line x1={120} y1={158} x2={120} y2={180} stroke={NEURON} strokeWidth={1.1} />
        <circle cx={120} cy={152} r={9} fill={NEURON} opacity={0.85} /><Label x={185} y={170}>axon → deep nuclei</Label></>);
    case 'astrocyte':
      for (let k = 0; k < 9; k++) { const a = PI * 0.45 + (k * 2 * PI * 0.85) / 9; tree(s, 100, 90, a, 20, 2, 0.5, 1.6); }
      return (<><rect x={190} y={8} width={26} height={164} rx={13} fill="#7f1d1d" opacity={0.7} /><Segs s={s} c={GLIA} />
        <line x1={100} y1={90} x2={186} y2={90} stroke={GLIA} strokeWidth={2} /><ellipse cx={188} cy={90} rx={4} ry={10} fill={GLIA} />
        <line x1={100} y1={90} x2={186} y2={45} stroke={GLIA} strokeWidth={1.4} /><ellipse cx={188} cy={45} rx={3.5} ry={8} fill={GLIA} />
        <circle cx={100} cy={90} r={9} fill={GLIA} opacity={0.9} />
        <Label x={203} y={180}>capillary</Label><Label x={150} y={110}>end-feet</Label></>);
    case 'oligodendrocyte': {
      const ends: [number, number][] = [[60, 28], [175, 28], [70, 152], [170, 152]];
      return (<><line x1={8} y1={28} x2={232} y2={28} stroke={NEURON} strokeWidth={1.4} /><line x1={8} y1={152} x2={232} y2={152} stroke={NEURON} strokeWidth={1.4} />
        {ends.map(([x, y]) => <g key={x + y}><line x1={120} y1={90} x2={x} y2={y} stroke={GLIA} strokeWidth={1.6} /><rect x={x - 22} y={y - 6} width={44} height={12} rx={6} fill={MYELIN} opacity={0.9} /></g>)}
        <circle cx={120} cy={90} r={10} fill={GLIA} opacity={0.9} /><Label x={120} y={118}>one cell → many internodes</Label><Label x={212} y={20}>CNS axons</Label></>);
    }
    case 'schwann':
      return (<><line x1={8} y1={95} x2={232} y2={95} stroke={NEURON} strokeWidth={2} />
        {[0, 1, 2, 3].map((k) => <rect key={k} x={62 - k * 3} y={95 - 8 - k * 4} width={116 + k * 6} height={16 + k * 8} rx={8 + k * 4} fill="none" stroke={MYELIN} strokeOpacity={0.9 - k * 0.15} strokeWidth={2} />)}
        <ellipse cx={120} cy={66} rx={16} ry={6} fill={GLIA} opacity={0.9} />
        <rect x={8} y={87} width={36} height={16} rx={8} fill={MYELIN} opacity={0.5} /><rect x={196} y={87} width={36} height={16} rx={8} fill={MYELIN} opacity={0.5} />
        <Label x={50} y={126}>node</Label><Label x={190} y={126}>node</Label><Label x={120} y={52}>Schwann nucleus</Label><Label x={120} y={140}>one cell = one internode</Label></>);
    case 'microglia':
      for (let k = 0; k < 7; k++) tree(s, 120, 90, (k * 2 * PI) / 7 + 0.3, 16, 3, 0.6, 1.2);
      return (<><Segs s={s} c={GLIA} /><ellipse cx={120} cy={90} rx={10} ry={6} fill={GLIA} opacity={0.9} /><Label x={120} y={170}>ramified (resting) state</Label></>);
    case 'ependymal':
      return (<><rect x={8} y={20} width={224} height={50} fill="#0c4a6e" opacity={0.35} />
        {Array.from({ length: 6 }, (_, i) => { const x = 14 + i * 36; return (
          <g key={i}><rect x={x} y={80} width={34} height={42} rx={3} fill={GLIA} opacity={0.75} /><circle cx={x + 17} cy={103} r={6} fill="#4c1d95" />
            {[6, 13, 20, 27].map((d) => <path key={d} d={`M${x + d} 80 q 3 -8 0 -16`} fill="none" stroke={GLIA} strokeWidth={1} />)}</g>); })}
        <Label x={120} y={42}>ventricle (CSF flow →)</Label><Label x={120} y={148}>brain parenchyma</Label></>);
    default:
      return null;
  }
}

export default function CellExplorer() {
  const [sel, setSel] = useState('pyramidal');
  const cell = CELL_TYPES.find((c) => c.id === sel) ?? CELL_TYPES[0];
  const art = useMemo(() => drawing(cell.id), [cell.id]);

  return (
    <div className="grid gap-5 md:grid-cols-[220px_1fr]">
      <div className="space-y-3">
        {(['neuron', 'glia'] as const).map((kind) => (
          <div key={kind} className="space-y-1">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{kind === 'neuron' ? 'Neurons' : 'Glia'}</p>
            {CELL_TYPES.filter((c) => c.kind === kind).map((c) => (
              <button key={c.id} onClick={() => setSel(c.id)} className={`w-full text-left text-sm px-2.5 py-1.5 rounded-md transition-colors ${c.id === sel ? 'bg-primary/15 text-primary' : 'hover:bg-muted/60 text-foreground/80'}`}>{c.name}</button>
            ))}
          </div>
        ))}
      </div>
      <div className="space-y-3 min-w-0">
        <svg viewBox="0 0 240 185" className="w-full max-h-[340px] panel rounded-lg" role="img" aria-label={`Schematic of a ${cell.name}`}>{art}</svg>
        <div>
          <h3 className="font-semibold">{cell.name} <span className={`ml-1 text-[11px] px-1.5 py-0.5 rounded ${cell.kind === 'neuron' ? 'bg-primary/15 text-primary' : 'bg-secondary/20 text-secondary'}`}>{cell.kind}</span></h3>
          <p className="text-xs text-muted-foreground">{cell.where}</p>
          <p className="text-sm mt-2">{cell.text}</p>
        </div>
        {cell.citations.length > 0 && <CiteChips ids={cell.citations} />}
        <p className="text-[11px] text-muted-foreground">Schematics are simplified, not to scale.</p>
      </div>
    </div>
  );
}
