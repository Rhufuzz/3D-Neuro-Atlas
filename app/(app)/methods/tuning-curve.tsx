'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import CiteChips from '@/components/cite-chips';

const BASE = 4, PEAK = 60; // spikes/s
const circDiff = (a: number, b: number) => { const d = Math.abs(a - b) % 180; return Math.min(d, 180 - d); };
const rate = (stim: number, pref: number, sd: number) => BASE + PEAK * Math.exp(-(circDiff(stim, pref) ** 2) / (2 * sd * sd));
const W = 360, H = 200, PX = 34, PY = 14;
const sx = (deg: number) => PX + (deg / 180) * (W - PX - 8);
const sy = (r: number) => H - PY - (r / (BASE + PEAK + 6)) * (H - 2 * PY);

export default function TuningCurve() {
  const [pref, setPref] = useState(90);
  const [stim, setStim] = useState(60);
  const [sd, setSd] = useState(20);
  const [raster, setRaster] = useState<{ t: number; s: number[] }>({ t: 2, s: [] });
  const r = rate(stim, pref, sd);
  const rRef = useRef(r);
  useEffect(() => { rRef.current = r; }, [r]);

  // Poisson spike train (5 ms bins) for the raster; client-only, effect-driven.
  useEffect(() => {
    let t = 0;
    const id = window.setInterval(() => {
      const n: number[] = [];
      for (let k = 0; k < 10; k++) if (Math.random() < rRef.current * 0.005) n.push(t + k * 0.005);
      t += 0.05;
      const now = t;
      setRaster((p) => ({ t: Math.max(now, 2), s: [...p.s.filter((x) => x > now - 2), ...n] }));
    }, 50);
    return () => window.clearInterval(id);
  }, []);

  const curve = useMemo(() => {
    const pts: string[] = [];
    for (let d = 0; d <= 180; d += 2) pts.push(`${sx(d).toFixed(1)},${sy(rate(d, pref, sd)).toFixed(1)}`);
    return pts.join(' ');
  }, [pref, sd]);

  return (
    <div className="grid gap-5 md:grid-cols-[220px_1fr]">
      <div className="space-y-3">
        <svg viewBox="-60 -60 120 120" className="w-full max-w-[220px] mx-auto panel rounded-lg" role="img" aria-label="Bar stimulus in the receptive field">
          <circle r={46} fill="none" stroke="hsl(var(--muted-foreground))" strokeOpacity={0.4} strokeDasharray="3 3" />
          <g transform={`rotate(${-stim})`}>
            <rect x={-38} y={-4} width={76} height={8} rx={2} fill="#f8fafc" />
          </g>
          <g transform={`rotate(${-pref})`} opacity={0.35}>
            <line x1={-52} x2={52} y1={0} y2={0} stroke="#22d3ee" strokeWidth={1.5} strokeDasharray="4 3" />
          </g>
          <text y={56} fontSize={8} textAnchor="middle" fill="hsl(var(--muted-foreground))">dashed = preferred</text>
        </svg>
        <div className="text-center">
          <p className="text-3xl font-bold text-primary tabular-nums">{r.toFixed(0)}</p>
          <p className="text-xs text-muted-foreground">spikes / s</p>
        </div>
      </div>
      <div className="space-y-3 min-w-0">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full panel rounded-lg" role="img" aria-label="Orientation tuning curve">
          <line x1={PX} y1={H - PY} x2={W - 8} y2={H - PY} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.5} />
          <line x1={PX} y1={PY} x2={PX} y2={H - PY} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.5} />
          {[0, 45, 90, 135, 180].map((d) => <text key={d} x={sx(d)} y={H - 2} fontSize={9} textAnchor="middle" fill="hsl(var(--muted-foreground))">{d}°</text>)}
          <text x={6} y={PY + 4} fontSize={9} fill="hsl(var(--muted-foreground))">Hz</text>
          <polyline points={curve} fill="none" stroke="#22d3ee" strokeWidth={2} />
          <line x1={sx(stim)} x2={sx(stim)} y1={PY} y2={H - PY} stroke="#f8fafc" strokeOpacity={0.35} strokeDasharray="3 3" />
          <circle cx={sx(stim)} cy={sy(r)} r={4.5} fill="#f8fafc" />
        </svg>
        <svg viewBox="0 0 360 26" className="w-full" role="img" aria-label="Spike raster for the last two seconds">
          <rect width={360} height={26} rx={4} fill="hsl(var(--muted) / 0.3)" />
          {raster.s.map((t) => { const xx = 360 - ((raster.t - t) / 2) * 360; return <line key={t} x1={xx} x2={xx} y1={4} y2={22} stroke="#22d3ee" strokeWidth={1.4} />; })}
        </svg>
        <div className="grid gap-3 sm:grid-cols-3 text-xs">
          <label className="space-y-1"><span className="text-muted-foreground">Stimulus orientation: {stim}°</span>
            <input type="range" min={0} max={179} value={stim} onChange={(e) => setStim(Number(e.target.value))} className="range-neuro w-full" /></label>
          <label className="space-y-1"><span className="text-muted-foreground">Preferred orientation: {pref}°</span>
            <input type="range" min={0} max={179} value={pref} onChange={(e) => setPref(Number(e.target.value))} className="range-neuro w-full" /></label>
          <label className="space-y-1"><span className="text-muted-foreground">Tuning width (σ): {sd}°</span>
            <input type="range" min={8} max={50} value={sd} onChange={(e) => setSd(Number(e.target.value))} className="range-neuro w-full" /></label>
        </div>
        <p className="text-sm text-muted-foreground">
          Hubel &amp; Wiesel recorded single V1 simple cells that fire vigorously only to bars of a particular orientation in a small receptive field. Tuning is roughly Gaussian (here {BASE} + {PEAK}·e<sup>−Δθ²/2σ²</sup> spikes/s); a population of such cells with different preferences encodes any orientation.
        </p>
        <CiteChips ids={['hubel1959', 'hubel1962', 'kuffler1953']} />
      </div>
    </div>
  );
}
