'use client';

import { useMemo, useState } from 'react';
import CiteChips from '@/components/cite-chips';

/* Classic Hodgkin–Huxley squid-axon model (rest ≈ −65 mV), forward Euler, dt = 0.01 ms. */
const T_END = 50, DT = 0.01, EVERY = 10, T_ON = 5;
const G_NA = 120, G_K = 36, G_L = 0.3, E_NA = 50, E_K = -77, E_L = -54.4;
const am = (v: number) => { const x = v + 40; return Math.abs(x) < 1e-6 ? 1 : (0.1 * x) / (1 - Math.exp(-x / 10)); };
const bm = (v: number) => 4 * Math.exp(-(v + 65) / 18);
const ah = (v: number) => 0.07 * Math.exp(-(v + 65) / 20);
const bh = (v: number) => 1 / (1 + Math.exp(-(v + 35) / 10));
const an = (v: number) => { const x = v + 55; return Math.abs(x) < 1e-6 ? 0.1 : (0.01 * x) / (1 - Math.exp(-x / 10)); };
const bn = (v: number) => 0.125 * Math.exp(-(v + 65) / 80);

interface Params { amp: number; dur: number; pair: boolean; delay: number; amp2: number; ttx: boolean }
interface Sample { t: number; v: number; m: number; h: number; n: number; i: number }

function simulate(p: Params) {
  let v = -65;
  let m = am(v) / (am(v) + bm(v)), h = ah(v) / (ah(v) + bh(v)), n = an(v) / (an(v) + bn(v));
  const gNa = p.ttx ? 0 : G_NA;
  const out: Sample[] = [];
  const spikes: number[] = [];
  let above = false, peak = -100;
  const steps = Math.round(T_END / DT);
  for (let k = 0; k <= steps; k++) {
    const t = k * DT;
    const i = (t >= T_ON && t < T_ON + p.dur ? p.amp : 0) + (p.pair && t >= T_ON + p.delay && t < T_ON + p.delay + p.dur ? p.amp2 : 0);
    if (k % EVERY === 0) out.push({ t, v, m, h, n, i });
    const iNa = gNa * m ** 3 * h * (v - E_NA), iK = G_K * n ** 4 * (v - E_K), iL = G_L * (v - E_L);
    const a1 = am(v), b1 = bm(v), a2 = ah(v), b2 = bh(v), a3 = an(v), b3 = bn(v);
    v += DT * (i - iNa - iK - iL);
    m += DT * (a1 * (1 - m) - b1 * m);
    h += DT * (a2 * (1 - h) - b2 * h);
    n += DT * (a3 * (1 - n) - b3 * n);
    peak = Math.max(peak, v);
    if (v > 0 && !above) { above = true; spikes.push(t); }
    if (v < -20) above = false;
  }
  return { out, spikes, peak };
}

const PRESETS: { label: string; p: Params; note: string }[] = [
  { label: 'Subthreshold', p: { amp: 5, dur: 1, pair: false, delay: 10, amp2: 20, ttx: false }, note: 'A small pulse depolarises the membrane passively and it decays back — no regenerative Na⁺ current, no spike.' },
  { label: 'Single spike', p: { amp: 20, dur: 1, pair: false, delay: 10, amp2: 20, ttx: false }, note: 'Crossing threshold (≈ −55 mV) opens Na⁺ channels (m) faster than they inactivate (h): an all-or-none spike, then K⁺ (n) repolarises and overshoots into the after-hyperpolarisation.' },
  { label: 'Absolute refractory', p: { amp: 20, dur: 1, pair: true, delay: 5, amp2: 60, ttx: false }, note: 'A second pulse 5 ms later fails even at 3× strength: Na⁺ channels are still inactivated (h low).' },
  { label: 'Relative refractory', p: { amp: 20, dur: 1, pair: true, delay: 9, amp2: 40, ttx: false }, note: 'At 9 ms a strong second pulse fires a smaller spike, but a normal 20 µA/cm² pulse would fail — try lowering pulse 2.' },
  { label: 'Tonic firing', p: { amp: 15, dur: 40, pair: false, delay: 10, amp2: 20, ttx: false }, note: 'Sustained current produces repetitive firing; stronger current → higher rate (rate coding).' },
  { label: 'TTX', p: { amp: 20, dur: 1, pair: false, delay: 10, amp2: 20, ttx: true }, note: 'Tetrodotoxin blocks voltage-gated Na⁺ channels — the same stimulus now gives only a passive bump.' },
];

const W = 520, PX = 36, VH = 200, GH = 96;
const xs = (t: number) => PX + (t / T_END) * (W - PX - 8);
const vy = (v: number) => 10 + ((60 - v) / 150) * (VH - 24);
const gy = (g: number) => 6 + (1 - g) * (GH - 16);
const line = (pts: Sample[], f: (s: Sample) => number) => pts.map((s) => `${xs(s.t).toFixed(1)},${f(s).toFixed(1)}`).join(' ');

export default function HhSim() {
  const [p, setP] = useState<Params>(PRESETS[1].p);
  const [note, setNote] = useState(PRESETS[1].note);
  const sim = useMemo(() => simulate(p), [p]);
  const set = (k: keyof Params, val: number | boolean) => { setP((o) => ({ ...o, [k]: val })); setNote(''); };
  const second = p.pair ? sim.spikes.some((t) => t >= T_ON + p.delay) : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((pr) => (
          <button key={pr.label} onClick={() => { setP(pr.p); setNote(pr.note); }} className={`text-xs px-2.5 py-1 rounded-full transition-colors ${JSON.stringify(pr.p) === JSON.stringify(p) ? 'bg-primary text-primary-foreground' : 'bg-muted/60 text-muted-foreground hover:text-primary'}`}>{pr.label}</button>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
        <div className="space-y-2 min-w-0">
          <svg viewBox={`0 0 ${W} ${VH}`} className="w-full panel rounded-lg" role="img" aria-label="Membrane potential over time">
            {[40, 0, -40, -80].map((v) => (
              <g key={v}><line x1={PX} x2={W - 8} y1={vy(v)} y2={vy(v)} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.15} />
                <text x={4} y={vy(v) + 3} fontSize={9} fill="hsl(var(--muted-foreground))">{v}</text></g>
            ))}
            <line x1={PX} x2={W - 8} y1={vy(-55)} y2={vy(-55)} stroke="#fbbf24" strokeOpacity={0.5} strokeDasharray="4 3" />
            <text x={W - 10} y={vy(-55) - 3} fontSize={8} textAnchor="end" fill="#fbbf24">≈ threshold</text>
            <text x={4} y={VH - 4} fontSize={9} fill="hsl(var(--muted-foreground))">mV</text>
            <polyline points={line(sim.out, (s) => vy(s.v))} fill="none" stroke="#22d3ee" strokeWidth={2} />
            <polyline points={line(sim.out, (s) => VH - 6 - Math.min(s.i, 60) * 0.25)} fill="none" stroke="#f472b6" strokeWidth={1.2} strokeOpacity={0.8} />
          </svg>
          <svg viewBox={`0 0 ${W} ${GH}`} className="w-full panel rounded-lg" role="img" aria-label="Gating variables m, h and n">
            <polyline points={line(sim.out, (s) => gy(s.m))} fill="none" stroke="#f97316" strokeWidth={1.5} />
            <polyline points={line(sim.out, (s) => gy(s.h))} fill="none" stroke="#a78bfa" strokeWidth={1.5} />
            <polyline points={line(sim.out, (s) => gy(s.n))} fill="none" stroke="#34d399" strokeWidth={1.5} />
            {[0, 10, 20, 30, 40, 50].map((t) => <text key={t} x={xs(t)} y={GH - 1} fontSize={8} textAnchor="middle" fill="hsl(var(--muted-foreground))">{t} ms</text>)}
            <text x={4} y={12} fontSize={8} fill="hsl(var(--muted-foreground))">1</text>
            <text x={4} y={GH - 10} fontSize={8} fill="hsl(var(--muted-foreground))">0</text>
          </svg>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            <span><i className="inline-block w-3 h-0.5 bg-[#22d3ee] align-middle mr-1" />V<sub>m</sub></span>
            <span><i className="inline-block w-3 h-0.5 bg-[#f472b6] align-middle mr-1" />injected current</span>
            <span><i className="inline-block w-3 h-0.5 bg-[#f97316] align-middle mr-1" />m · Na⁺ activation</span>
            <span><i className="inline-block w-3 h-0.5 bg-[#a78bfa] align-middle mr-1" />h · Na⁺ inactivation</span>
            <span><i className="inline-block w-3 h-0.5 bg-[#34d399] align-middle mr-1" />n · K⁺ activation</span>
          </div>
        </div>
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="panel rounded-lg p-2"><p className="text-2xl font-bold text-primary tabular-nums">{sim.spikes.length}</p><p className="text-muted-foreground">spikes</p></div>
            <div className="panel rounded-lg p-2"><p className="text-2xl font-bold tabular-nums">{sim.peak.toFixed(0)}</p><p className="text-muted-foreground">peak mV</p></div>
          </div>
          {second !== null && <p className={`rounded-md px-2 py-1.5 ${second ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'}`}>Pulse 2 {second ? 'fired a spike' : 'failed — refractory'}</p>}
          <label className="block space-y-1"><span className="text-muted-foreground">Pulse amplitude: {p.amp} µA/cm²</span>
            <input type="range" min={0} max={40} value={p.amp} onChange={(e) => set('amp', Number(e.target.value))} className="range-neuro w-full" /></label>
          <label className="block space-y-1"><span className="text-muted-foreground">Pulse duration: {p.dur} ms</span>
            <input type="range" min={0.5} max={40} step={0.5} value={p.dur} onChange={(e) => set('dur', Number(e.target.value))} className="range-neuro w-full" /></label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={p.pair} onChange={(e) => set('pair', e.target.checked)} className="accent-[hsl(var(--primary))]" />Second pulse (paired-pulse)</label>
          {p.pair && (<>
            <label className="block space-y-1"><span className="text-muted-foreground">Inter-pulse interval: {p.delay} ms</span>
              <input type="range" min={2} max={30} value={p.delay} onChange={(e) => set('delay', Number(e.target.value))} className="range-neuro w-full" /></label>
            <label className="block space-y-1"><span className="text-muted-foreground">Pulse 2 amplitude: {p.amp2} µA/cm²</span>
              <input type="range" min={0} max={80} value={p.amp2} onChange={(e) => set('amp2', Number(e.target.value))} className="range-neuro w-full" /></label>
          </>)}
          <label className="flex items-center gap-2"><input type="checkbox" checked={p.ttx} onChange={(e) => set('ttx', e.target.checked)} className="accent-[hsl(var(--primary))]" />TTX (block Na⁺ channels)</label>
        </div>
      </div>
      {note && <p className="text-sm rounded-lg bg-primary/10 text-foreground px-3 py-2">{note}</p>}
      <p className="text-sm text-muted-foreground">
        The membrane obeys C·dV/dt = I − g<sub>Na</sub>m³h(V−E<sub>Na</sub>) − g<sub>K</sub>n⁴(V−E<sub>K</sub>) − g<sub>L</sub>(V−E<sub>L</sub>), with g<sub>Na</sub> = 120, g<sub>K</sub> = 36, g<sub>L</sub> = 0.3 mS/cm² and E<sub>Na</sub> = +50, E<sub>K</sub> = −77 mV. Hodgkin and Huxley fitted these equations to voltage-clamp data from the squid giant axon and predicted the shape and speed of the action potential before ion channels were ever seen.
      </p>
      <CiteChips ids={['hodgkin1952']} />
    </div>
  );
}
