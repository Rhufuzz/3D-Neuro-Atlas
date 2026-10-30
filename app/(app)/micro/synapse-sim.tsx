'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import CiteChips from '@/components/cite-chips';
import { DRUGS, TRANSMITTERS, type Drug } from '@/lib/data/micro';

/* One-compartment cleft model (arbitrary units): each spike releases a quantum, transporters clear it,
   receptors saturate, and the postsynaptic potential low-pass filters receptor activation. */
const T = 120, DT = 0.25, K_UPTAKE = 0.12, TAU_PSP = 6, KD = 0.6;
const SPIKES = [10, 45, 80];
type Knobs = Pick<Drug, 'release' | 'reuptake' | 'efficacy' | 'efflux'>;
const CONTROL: Knobs = { release: 1, reuptake: 1, efficacy: 1, efflux: 0 };

type Pt = { t: number; c: number; p: number };

function run(d: Knobs) {
  const pts: Pt[] = [];
  let c = 0, p = 0;
  for (let k = 0; k <= T / DT; k++) {
    const t = k * DT;
    if (SPIKES.some((s) => Math.round(s / DT) === k)) c += d.release;
    c += DT * (d.efflux * 0.03 - K_UPTAKE * d.reuptake * c);
    const act = (d.efficacy * c) / (c + KD);
    p += (DT * (act - p)) / TAU_PSP;
    pts.push({ t, c, p });
  }
  const area = pts.reduce((a, s) => a + s.c * DT, 0);
  const peak = Math.max(...pts.map((s) => s.p));
  return { pts, area, peak };
}

const txFor = (d: Drug) => TRANSMITTERS.find((t) => d.system.toLowerCase().startsWith(t.name.split(' ')[0].toLowerCase().slice(0, 5))) ?? TRANSMITTERS[0];

// Deterministic dot positions inside the cleft (LCG, SSR-safe).
const DOTS = (() => { let s = 7; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647); return Array.from({ length: 48 }, () => [62 + r() * 136, 96 + r() * 22] as const); })();

const CW = 300, CH = 92;
const cx = (t: number) => 26 + (t / T) * (CW - 32);

export default function SynapseSim() {
  const [id, setId] = useState('ssri');
  const [playing, setPlaying] = useState(true);
  const [cur, setCur] = useState(0);
  const curRef = useRef(0);
  const drug = DRUGS.find((d) => d.id === id) ?? DRUGS[0];
  const tx = txFor(drug);
  const ctl = useMemo(() => run(CONTROL), []);
  const sim = useMemo(() => run(drug), [drug]);

  useEffect(() => {
    if (!playing) return;
    let raf = 0; let last: number | null = null;
    const step = (now: number) => {
      if (last !== null) { curRef.current = (curRef.current + ((now - last) / 6000) * T) % T; setCur(curRef.current); }
      last = now; raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const idx = Math.min(sim.pts.length - 1, Math.round(cur / DT));
  const now = sim.pts[idx];
  const dots = Math.min(DOTS.length, Math.round(now.c * 22));
  const firing = SPIKES.some((s) => cur >= s && cur < s + 3);
  const cMax = Math.max(1.2, ...sim.pts.map((s) => s.c));
  const pMax = Math.max(ctl.peak, sim.peak) * 1.15;
  const cy = (c: number) => CH - 12 - (c / cMax) * (CH - 22);
  const py = (p: number) => CH - 12 - (p / pMax) * (CH - 22);
  const poly = (f: (s: Pt) => number, pts = sim.pts) => pts.filter((_, i) => i % 2 === 0).map((s) => `${cx(s.t).toFixed(1)},${f(s).toFixed(1)}`).join(' ');
  const inhib = drug.sign === -1;

  return (
    <div className="space-y-5">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {TRANSMITTERS.map((t) => (
          <div key={t.id} className="panel rounded-lg p-3 text-xs space-y-1" style={{ borderLeft: `3px solid ${t.color}` }}>
            <p className="font-semibold text-sm" style={{ color: t.color }}>{t.name}</p>
            <p className="text-muted-foreground">{t.type}</p>
            <p><span className="text-muted-foreground">Receptors:</span> {t.receptors}</p>
            <p><span className="text-muted-foreground">Source:</span> {t.source}</p>
            <p>{t.role}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {DRUGS.map((d) => (
          <button key={d.id} onClick={() => setId(d.id)} className={`text-xs px-2.5 py-1 rounded-full transition-colors ${d.id === id ? 'bg-primary text-primary-foreground' : 'bg-muted/60 text-muted-foreground hover:text-primary'}`}>{d.name}</button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-2">
          <svg viewBox="0 0 260 200" className="w-full panel rounded-lg" role="img" aria-label={`Synapse under ${drug.name}`}>
            <path d="M40 10 h180 v60 q0 22 -22 22 h-136 q-22 0 -22 -22 z" fill="#1e293b" stroke="#475569" />
            <text x={130} y={24} fontSize={9} textAnchor="middle" fill="hsl(var(--muted-foreground))">presynaptic terminal</text>
            {[0, 1, 2, 3, 4, 5].map((k) => { const x = 70 + k * 24, y = k % 2 ? 50 : 66, docked = k === 2 || k === 3;
              const fuse = docked && firing && drug.release > 0.2;
              return <circle key={k} cx={x} cy={docked ? 80 : y} r={drug.id === 'ldopa' ? 9 : 7.5} fill={tx.color} opacity={fuse ? 0.2 : 0.75} stroke={fuse ? tx.color : 'none'} />; })}
            {drug.id === 'botox' && <text x={130} y={100} fontSize={8} textAnchor="middle" fill="#f87171">SNAREs cleaved — no fusion</text>}
            <g transform="translate(206 70)">
              <rect x={-9} y={-8} width={18} height={20} rx={3} fill="#334155" stroke={drug.site === 'reuptake' || drug.efflux ? '#fbbf24' : '#64748b'} />
              <text x={0} y={5} fontSize={7} textAnchor="middle" fill="#e2e8f0">T</text>
              {drug.reuptake < 1 && <path d="M-8 -7 L8 11 M8 -7 L-8 11" stroke="#f87171" strokeWidth={2} />}
              {drug.efflux > 0 && <path d="M0 14 v14 m-4 -4 l4 4 l4 -4" stroke="#fbbf24" strokeWidth={1.5} fill="none" />}
            </g>
            {DOTS.slice(0, dots).map(([x, y], i) => <circle key={i} cx={x} cy={y} r={1.9} fill={tx.color} />)}
            <path d="M40 190 h180 v-52 q0 -14 -14 -14 h-152 q-14 0 -14 14 z" fill="#1e293b" stroke="#475569" />
            <text x={130} y={182} fontSize={9} textAnchor="middle" fill="hsl(var(--muted-foreground))">postsynaptic membrane</text>
            {[0, 1, 2, 3].map((k) => { const x = 82 + k * 32; const occ = Math.min(1, now.c / (now.c + KD));
              return (<g key={k} transform={`translate(${x} 128)`}>
                <path d="M-7 0 v-6 q7 -6 14 0 v6" fill={tx.color} fillOpacity={0.25 + 0.7 * occ * Math.min(drug.efficacy, 1)} stroke={tx.color} />
                {drug.efficacy < 0.5 && <circle cx={0} cy={-8} r={3.2} fill="#f87171" />}
                {drug.efficacy > 1 && <circle cx={9} cy={-3} r={2.6} fill="#34d399" />}
              </g>); })}
            <text x={8} y={110} fontSize={8} fill="hsl(var(--muted-foreground))">cleft</text>
            <text x={252} y={110} fontSize={8} textAnchor="end" fill={firing ? '#fbbf24' : 'hsl(var(--muted-foreground))'}>{firing ? '⚡ spike' : `t ${cur.toFixed(0)}`}</text>
          </svg>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button onClick={() => setPlaying((v) => !v)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/15 text-primary hover:bg-primary/25">
              {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}{playing ? 'Pause' : 'Play'}
            </button>
            <span className="px-2 py-1 rounded bg-warning/15 text-warning">Acts at: {drug.site}</span>
            <span className="text-muted-foreground">System: {drug.system}</span>
          </div>
        </div>
        <div className="space-y-2 min-w-0">
          {([
            { title: 'Transmitter in the cleft', f: (s: Pt) => cy(s.c) },
            { title: inhib ? 'Postsynaptic inhibition (IPSP size)' : 'Postsynaptic response (PSP size)', f: (s: Pt) => py(s.p) },
          ]).map((g, gi) => (
            <svg key={g.title} viewBox={`0 0 ${CW} ${CH}`} className="w-full panel rounded-lg" role="img" aria-label={g.title}>
              <text x={26} y={11} fontSize={9} fill="hsl(var(--muted-foreground))">{g.title}</text>
              <line x1={26} x2={CW - 6} y1={CH - 12} y2={CH - 12} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.4} />
              {SPIKES.map((s) => <line key={s} x1={cx(s)} x2={cx(s)} y1={CH - 12} y2={CH - 6} stroke="#fbbf24" />)}
              <polyline points={poly(g.f, ctl.pts)} fill="none" stroke="hsl(var(--muted-foreground))" strokeDasharray="4 3" strokeWidth={1.3} />
              <polyline points={poly(g.f)} fill="none" stroke={gi === 0 ? tx.color : inhib ? '#a78bfa' : '#22d3ee'} strokeWidth={2} />
              <line x1={cx(cur)} x2={cx(cur)} y1={14} y2={CH - 12} stroke="#f8fafc" strokeOpacity={0.3} />
            </svg>
          ))}
          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="panel rounded-lg p-2"><p className="text-xl font-bold text-primary tabular-nums">{(sim.area / ctl.area).toFixed(1)}×</p><p className="text-muted-foreground">cleft exposure vs control</p></div>
            <div className="panel rounded-lg p-2"><p className="text-xl font-bold text-primary tabular-nums">{(sim.peak / ctl.peak).toFixed(1)}×</p><p className="text-muted-foreground">peak postsynaptic effect</p></div>
          </div>
          <p className="text-[11px] text-muted-foreground">Dashed = untreated synapse; yellow ticks = presynaptic spikes. Arbitrary units — a qualitative model.</p>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 text-sm">
        <p><span className="font-semibold text-primary">Mechanism. </span>{drug.mechanism}</p>
        <p><span className="font-semibold text-primary">Effect. </span>{drug.effect}</p>
      </div>
      {drug.citations.length > 0 && <CiteChips ids={drug.citations} />}
    </div>
  );
}
