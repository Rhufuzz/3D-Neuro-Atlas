'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CiteChips from '@/components/cite-chips';
import { LTP_STEPS } from '@/lib/data/micro';

const GLU = '#22d3ee', CA = '#fbbf24', AMPA = '#34d399', NMDA = '#a78bfa', CAMK = '#f472b6', NO = '#fb923c';
const GLU_DOTS: [number, number][] = [[96, 96], [112, 102], [128, 94], [140, 104], [156, 97], [170, 103], [104, 108], [150, 108], [120, 106], [164, 92]];
const CA_DOTS: [number, number][] = [[150, 140], [160, 152], [142, 158], [170, 146], [156, 166], [134, 148], [176, 160], [146, 172]];

function epsp(gain: number) {
  const pts: string[] = [];
  for (let t = 0; t <= 60; t += 1) {
    const v = t < 5 ? 0 : gain * (Math.exp(-(t - 5) / 12) - Math.exp(-(t - 5) / 2.5));
    pts.push(`${(10 + t * 3).toFixed(1)},${(70 - v * 62).toFixed(1)}`);
  }
  return pts.join(' ');
}

export default function LtpSteps() {
  const [i, setI] = useState(0);
  const step = LTP_STEPS[i];
  const s = i + 1; // 1-based stage
  const nAmpa = s >= 6 ? 4 : 2;
  const gluCount = s >= 2 ? GLU_DOTS.length : 4;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="space-y-3 min-w-0">
        <svg viewBox="0 0 260 220" className="w-full max-h-[380px] panel rounded-lg" role="img" aria-label={`Dendritic spine, ${step.title}`}>
          <path d="M60 8 h140 v62 q0 18 -18 18 h-104 q-18 0 -18 -18 z" fill="#1e293b" stroke={s === 7 ? NO : '#475569'} />
          <text x={130} y={22} fontSize={9} textAnchor="middle" fill="hsl(var(--muted-foreground))">CA3 Schaffer collateral terminal</text>
          {[90, 115, 140, 165].map((x) => <circle key={x} cx={x} cy={58} r={8} fill={GLU} opacity={0.6} />)}
          {GLU_DOTS.slice(0, gluCount).map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={2} fill={GLU} />)}
          <path d="M70 214 v-70 q0 -30 30 -30 h60 q30 0 30 30 v70" fill={s >= 2 ? '#3b1d2e' : '#1e293b'} stroke={s >= 2 ? '#f472b6' : '#475569'} />
          <text x={130} y={208} fontSize={9} textAnchor="middle" fill="hsl(var(--muted-foreground))">CA1 dendritic spine {s >= 7 ? '(enlarged)' : ''}</text>
          {Array.from({ length: nAmpa }, (_, k) => { const x = [100, 160, 114, 146][k] ?? 100; const ins = k >= 2;
            return <g key={k} transform={`translate(${x} 117)`}><rect x={-6} y={-6} width={12} height={12} rx={2} fill={AMPA} opacity={ins ? 0.95 : 0.75} stroke={ins ? '#f8fafc' : 'none'} /></g>; })}
          <g transform="translate(130 117)">
            <rect x={-8} y={-7} width={16} height={14} rx={2} fill={NMDA} opacity={0.85} />
            {s < 3 && <circle cx={0} cy={-1} r={4.5} fill="#e2e8f0" />}
            {s < 3 && <text y={1.5} fontSize={5} textAnchor="middle" fill="#0f172a">Mg</text>}
            {s === 3 && <circle cx={0} cy={-18} r={4.5} fill="#e2e8f0" opacity={0.6} />}
          </g>
          {s >= 4 && CA_DOTS.map(([x, y]) => <circle key={`${x}-${y}`} cx={x - 20} cy={y} r={2.4} fill={CA} />)}
          {s >= 4 && <text x={130} y={186} fontSize={8} textAnchor="middle" fill={CA}>Ca²⁺</text>}
          {s >= 5 && [[96, 160], [164, 168], [110, 178]].map(([x, y]) => <g key={x} transform={`translate(${x} ${y})`}><circle r={6} fill={CAMK} opacity={0.8} /><text y={2} fontSize={5} textAnchor="middle" fill="#0f172a">CaMKII</text></g>)}
          {s >= 6 && <path d="M182 170 q8 -20 0 -40" stroke={AMPA} strokeDasharray="3 2" fill="none" markerEnd="url(#ltp-arrow)" />}
          {s === 7 && <path d="M200 150 q30 -40 0 -80" stroke={NO} strokeWidth={1.6} fill="none" markerEnd="url(#ltp-arrow-no)" />}
          {s === 7 && <text x={232} y={116} fontSize={8} fill={NO}>NO</text>}
          {s === 2 && <text x={232} y={150} fontSize={8} textAnchor="end" fill="#f472b6">depolarised</text>}
          <defs>
            <marker id="ltp-arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 z" fill={AMPA} /></marker>
            <marker id="ltp-arrow-no" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 z" fill={NO} /></marker>
          </defs>
        </svg>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          <span><i className="inline-block w-2.5 h-2.5 rounded-sm align-middle mr-1" style={{ background: AMPA }} />AMPA receptor</span>
          <span><i className="inline-block w-2.5 h-2.5 rounded-sm align-middle mr-1" style={{ background: NMDA }} />NMDA receptor (Mg²⁺ plug)</span>
          <span><i className="inline-block w-2.5 h-2.5 rounded-full align-middle mr-1" style={{ background: GLU }} />glutamate</span>
          <span><i className="inline-block w-2.5 h-2.5 rounded-full align-middle mr-1" style={{ background: CA }} />Ca²⁺</span>
          <span><i className="inline-block w-2.5 h-2.5 rounded-full align-middle mr-1" style={{ background: CAMK }} />CaMKII</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setI((v) => Math.max(0, v - 1))} disabled={i === 0} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs bg-muted/60 hover:text-primary disabled:opacity-40"><ChevronLeft className="h-3.5 w-3.5" />Back</button>
          <div className="flex-1 flex gap-1">{LTP_STEPS.map((x, k) => <button key={x.id} aria-label={x.title} onClick={() => setI(k)} className={`h-1.5 flex-1 rounded-full ${k <= i ? 'bg-primary' : 'bg-muted'}`} />)}</div>
          <button onClick={() => setI((v) => Math.min(LTP_STEPS.length - 1, v + 1))} disabled={i === LTP_STEPS.length - 1} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs bg-primary/15 text-primary hover:bg-primary/25 disabled:opacity-40">Next<ChevronRight className="h-3.5 w-3.5" /></button>
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="font-semibold text-primary">{step.title}</h3>
        <p className="text-sm">{step.text}</p>
        <svg viewBox="0 0 200 80" className="w-full panel rounded-lg" role="img" aria-label="Test EPSP before and after LTP">
          <polyline points={epsp(0.55)} fill="none" stroke="hsl(var(--muted-foreground))" strokeDasharray="4 3" strokeWidth={1.4} />
          {s >= 6 && <polyline points={epsp(s >= 7 ? 1 : 0.85)} fill="none" stroke={AMPA} strokeWidth={2} />}
          <text x={8} y={12} fontSize={8} fill="hsl(var(--muted-foreground))">test EPSP: dashed = baseline{s >= 6 ? ', green = potentiated' : ''}</text>
        </svg>
        <p className="text-xs text-muted-foreground">Bliss &amp; Lømo first showed that brief tetanic stimulation of the perforant path produced lasting potentiation in the rabbit hippocampus; NMDA-receptor blockade prevents its induction. LTP is the leading cellular model of learning and memory, with properties of cooperativity, associativity and input specificity.</p>
        <CiteChips ids={['bliss1973', 'collingridge1983', 'malenka2004', 'lisman2012', 'schuman1991', 'kandel2001']} />
      </div>
    </div>
  );
}
