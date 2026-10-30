'use client';

import { useState } from 'react';
import { Chip, SimCard, COL, Meter } from './sim-ui';

/* -------- Module 4: sliding-filament sarcomere lab -------- */

const PX = 150; // px per µm in the filament drawing
const CX = 330; // M-line x (660-wide viewBox)
const ACT_Y = [110, 150]; // top / bottom actin row y
const THICK_Y = 129; // thick filament centre y
const ACT = 1.0; // thin-filament length from each Z-disc (µm)
const THICK = 0.8; // myosin half-length (µm)
const HEAD_D = [0.15, 0.3, 0.45, 0.6, 0.75]; // cross-bridge positions from the M-line (µm)

// Deterministic scatter positions for Ca²⁺ dots (hydration-safe, no Math.random).
const CA_DOTS = (() => {
  let s = 42;
  const r = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
  return Array.from({ length: 16 }, () => ({ x: 70 + r() * 520, y: 52 + r() * 148, r: 1.6 + r() * 1.6 }));
})();

interface CycleStep { name: string; ca: number; trop: number; attach: number; stroke: number; atp: number; serca: number; ap: number; text: string }

const CYCLE: CycleStep[] = [
  { name: 'Rest', ca: 0, trop: 0, attach: 0, stroke: 0, atp: 0, serca: 0, ap: 0, text: 'Resting fibre: cytosolic Ca²⁺ ≈ 100 nM. Tropomyosin (red) blocks the myosin-binding sites on actin. Every myosin head is already energised — it hydrolysed ATP and keeps ADP+Pᵢ (the cocked spring).' },
  { name: 'Muscle AP', ca: 0, trop: 0, attach: 0, stroke: 0, atp: 0, serca: 0, ap: 1, text: 'The α-motor neuron releases ACh at the neuromuscular junction; the muscle action potential races over the sarcolemma and dives into the T-tubules.' },
  { name: 'Ca²⁺ release', ca: 1, trop: 0, attach: 0, stroke: 0, atp: 0, serca: 0, ap: 0, text: 'Voltage-sensing DHP receptors in the T-tubule trigger ryanodine receptors on the sarcoplasmic reticulum → Ca²⁺ floods out and the cytosol jumps to ~10 µM.' },
  { name: 'Troponin shift', ca: 1, trop: 1, attach: 0, stroke: 0, atp: 0, serca: 0, ap: 0, text: 'Ca²⁺ binds troponin C → the troponin–tropomyosin complex shifts, uncovering the myosin-binding sites (green) on the thin filaments.' },
  { name: 'Cross-bridge', ca: 1, trop: 1, attach: 1, stroke: 0, atp: 0, serca: 0, ap: 0, text: 'An energised myosin head binds an exposed site: the cross-bridge forms. ADP+Pᵢ are still attached to the head.' },
  { name: 'Power stroke', ca: 1, trop: 1, attach: 1, stroke: 1, atp: 0, serca: 0, ap: 0, text: 'Pᵢ then ADP leave; the head pivots ~45° toward the M-line, dragging the thin filament with it — the Z-discs move closer: the sarcomere shortens.' },
  { name: 'ATP detaches', ca: 1, trop: 1, attach: 0, stroke: 1, atp: 1, serca: 0, ap: 0, text: 'A fresh ATP binds the head → its affinity for actin drops and it lets go. No ATP = no detachment: this is rigor (rigor mortis).' },
  { name: 'Re-cock', ca: 1, trop: 1, attach: 0, stroke: 0, atp: 1, serca: 0, ap: 0, text: 'ATP is hydrolysed to ADP+Pᵢ, re-energising the head. While Ca²⁺ stays high the cycle repeats — hundreds of heads out of phase with each other.' },
  { name: 'Relaxation', ca: 0, trop: 0, attach: 0, stroke: 0, atp: 0, serca: 1, ap: 0, text: 'SERCA pumps Ca²⁺ back into the SR; troponin releases Ca²⁺, tropomyosin recovers the sites, and the fibre lengthens passively (titin springs it back).' },
];

function activeTension(L: number): number {
  if (L < 1.27 || L >= 3.65) return 0;
  if (L < 1.67) return ((L - 1.27) / 0.4) * 0.85;
  if (L < 2.0) return 0.85 + ((L - 1.67) / 0.33) * 0.15;
  if (L < 2.25) return 1;
  return (3.65 - L) / 1.4;
}
const passiveTension = (L: number) => (L <= 2.4 ? 0 : Math.min(0.55, Math.exp((L - 2.4) * 1.2) - 1));

const twitch = (t: number) => (t <= 0 ? 0 : (t / 45) * Math.exp(1 - t / 45)); // peak 1 at ~45 ms
const forceAt = (t: number, f: number) => { let F = 0; for (let t0 = 0; t0 <= t; t0 += 1000 / f) F += twitch(t - t0); return F; };

/**
 * Sarcomere schematic. Z-discs slide with `stroke`; heads attach only where actin
 * overlaps the myosin filament; Ca²⁺/troponin/tropomyosin/SERCA states follow the props.
 */
function SarcomereSvg(p: { L: number; ca: number; trop: number; attach: number; stroke: number; atp: number; serca: number; ap: number; label: string }) {
  const { L, ca, trop, attach, stroke, atp, serca, ap } = p;
  const half = (L / 2) * PX;
  const thickHalfUm = Math.min(THICK, L / 2);
  const thickHalf = thickHalfUm * PX;
  const slide = 12 * stroke;
  const zl = CX - half + slide;
  const zr = CX + half - slide;
  const bindFrom = L / 2 - ACT; // inner reach of actin, µm from the M-line
  const canBind = (d: number) => d >= Math.max(0, bindFrom) && d <= Math.min(thickHalfUm, L / 2) - 0.02;

  const head = (side: number, top: boolean, d: number, k: number) => {
    const bx = CX + side * d * PX;
    const by = top ? THICK_Y - 7 : THICK_Y + 7;
    const bound = attach && canBind(d) ? 1 : 0;
    let ang: number;
    if (bound) ang = p.stroke !== undefined && p.stroke > 0 ? side * (20 - 45 * p.stroke) : -side * 10;
    else ang = side * 20;
    if (!top) ang = -ang;
    const tipY = top ? -13 : 13;
    const col = bound ? COL.primary : COL.warn;
    return (
      <g key={`${side > 0 ? 'r' : 'l'}${top ? 't' : 'b'}${k}`} transform={`translate(${bx.toFixed(1)} ${by})`}>
        <g transform={`rotate(${ang.toFixed(1)})`}>
          <line x1={0} y1={0} x2={0} y2={tipY} stroke={col} strokeWidth={3} strokeLinecap="round" />
          <circle cx={0} cy={tipY} r={2.7} fill={col} />
        </g>
        {atp ? <text x={side * 12} y={top ? -4 : 12} fontSize={8} textAnchor="middle" fill={COL.ok}>ATP</text> : null}
      </g>
    );
  };

  const actinRow = (side: number, top: boolean) => {
    const y = top ? ACT_Y[0] : ACT_Y[1];
    const outer = side > 0 ? zr : zl;
    const inner = outer - side * ACT * PX;
    const n = 12;
    const sites = Array.from({ length: n + 1 }, (_, k) => outer - (side * ACT * PX * k) / n);
    return (
      <g key={`act${side > 0 ? 'r' : 'l'}${top ? 't' : 'b'}`}>
        <line x1={outer} y1={y} x2={inner} y2={y} stroke={COL.primary} strokeWidth={2.5} strokeLinecap="round" />
        <line x1={outer} y1={y - 3.5} x2={inner} y2={y - 3.5} stroke={COL.bad} strokeWidth={2.5} style={{ opacity: (1 - trop) * 0.85, transition: 'opacity .4s' }} />
        {sites.map((x, k) => (
          <circle key={k} cx={x} cy={y} r={1.8} fill={trop ? COL.ok : 'rgba(148,163,184,.35)'} style={{ transition: 'fill .35s' }} />
        ))}
        {sites.filter((_, k) => k % 3 === 1).map((x, k) => (
          <rect key={k} x={x - 3} y={top ? y - 10 : y + 4} width={6} height={6} rx={1.5} fill={ca ? COL.warn : 'transparent'} stroke={COL.border} strokeWidth={0.8} style={{ transition: 'fill .35s' }} />
        ))}
      </g>
    );
  };

  const ttX = 0.4 * half;
  return (
    <svg viewBox="0 0 660 252" className="w-full rounded bg-muted/20" role="img" aria-label={p.label}>
      {/* sarcoplasmic reticulum bands */}
      <rect x={55} y={18} width={550} height={18} rx={6} fill="rgba(255,79,163,.08)" stroke={COL.border} />
      <rect x={55} y={218} width={550} height={18} rx={6} fill="rgba(255,79,163,.08)" stroke={COL.border} />
      <text x={64} y={31} fontSize={9} fill={COL.muted}>sarcoplasmic reticulum</text>
      <text x={64} y={231} fontSize={9} fill={COL.muted}>sarcoplasmic reticulum</text>
      {/* SERCA uptake arrows */}
      <g style={{ opacity: serca, transition: 'opacity .4s' }}>
        {[CX - 140, CX + 140].map((x, k) => (
          <g key={k} stroke={COL.ok} strokeWidth={2} fill="none">
            <path d={`M${x} 52 L${x} 38 M${x - 4} 43 L${x} 38 L${x + 4} 43`} />
            <path d={`M${x} 204 L${x} 218 M${x - 4} 213 L${x} 218 L${x + 4} 213`} />
          </g>
        ))}
        <text x={CX - 140} y={48} fontSize={8.5} textAnchor="middle" fill={COL.ok}>SERCA</text>
        <text x={CX + 140} y={212} fontSize={8.5} textAnchor="middle" fill={COL.ok}>SERCA</text>
      </g>
      {/* T-tubules */}
      {[CX - ttX, CX + ttX].map((x, k) => (
        <rect key={k} x={x - 7} y={36} width={14} height={182} rx={4} fill={COL.primary} style={{ opacity: ap ? 0.25 : 0.07, transition: 'opacity .4s' }} stroke={ap ? COL.warn : 'none'} />
      ))}
      {ap ? <text x={CX + ttX + 12} y={46} fontSize={8.5} fill={COL.warn}>action potential ↓</text> : null}
      {/* free Ca²⁺ */}
      <g style={{ opacity: ca, transition: 'opacity .4s' }}>
        {CA_DOTS.map((d, k) => <circle key={k} cx={d.x} cy={d.y} r={d.r} fill={COL.warn} />)}
      </g>
      {/* titin (behind everything else) */}
      <path d={`M${zl.toFixed(1)} ${THICK_Y} Q${(zl + CX) / 2} ${THICK_Y + 7} ${CX - 2} ${THICK_Y}`} stroke={COL.muted} strokeWidth={1.2} strokeDasharray="3 3" fill="none" opacity={0.55} />
      <path d={`M${zr.toFixed(1)} ${THICK_Y} Q${(zr + CX) / 2} ${THICK_Y + 7} ${CX + 2} ${THICK_Y}`} stroke={COL.muted} strokeWidth={1.2} strokeDasharray="3 3" fill="none" opacity={0.55} />
      {/* M-line */}
      <line x1={CX} y1={56} x2={CX} y2={212} stroke={COL.muted} strokeWidth={1.5} strokeDasharray="4 4" />
      <text x={CX} y={206} fontSize={9} textAnchor="middle" fill={COL.muted}>M-line</text>
      {/* Z-discs */}
      <rect x={zl - 5} y={84} width={10} height={94} rx={4} fill={COL.sec} stroke={COL.border} />
      <rect x={zr - 5} y={84} width={10} height={94} rx={4} fill={COL.sec} stroke={COL.border} />
      <text x={zl - 5} y={78} fontSize={9} fill={COL.muted}>Z-disc</text>
      <text x={zr + 5} y={78} fontSize={9} textAnchor="end" fill={COL.muted}>Z-disc</text>
      {/* thin filaments */}
      {actinRow(1, true)}{actinRow(-1, true)}{actinRow(1, false)}{actinRow(-1, false)}
      {/* thick filament */}
      <rect x={CX - thickHalf} y={THICK_Y - 7} width={2 * thickHalf} height={14} rx={7} fill="#ff4fa3" fillOpacity={0.75} stroke="rgba(255,79,163,.9)" />
      {/* cross-bridges */}
      {HEAD_D.filter((d) => d <= thickHalfUm - 0.02).map((d, k) => (
        <g key={k}>{head(1, true, d, k)}{head(-1, true, d, k)}{head(1, false, d, k)}{head(-1, false, d, k)}</g>
      ))}
    </svg>
  );
}

const LEGEND = (
  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
    <span><span style={{ color: '#ff4fa3' }}>━</span> myosin (thick) + cross-bridges</span>
    <span><span style={{ color: COL.primary }}>━</span> actin (thin); <span style={{ color: COL.ok }}>●</span> binding sites</span>
    <span><span style={{ color: COL.bad }}>━</span> tropomyosin (blocking)</span>
    <span><span style={{ color: COL.warn }}>●</span> Ca²⁺ / troponin</span>
    <span><span style={{ color: COL.muted }}>┅</span> titin</span>
  </div>
);

export function M4Sarcomere() {
  const [mode, setMode] = useState<'cycle' | 'length' | 'tetanus'>('cycle');
  const [step, setStep] = useState(0);
  const [L, setL] = useState(2.2);
  const [freq, setFreq] = useState(5);
  const s = CYCLE[step];

  const ltText = L < 1.67
    ? 'Too short — thin filaments from opposite sides crash into each other at the M-line and the myosin filament is pressed against the Z-discs. Active force falls steeply.'
    : L < 2.0
      ? 'Sub-optimal — thin filaments double-overlap in the middle of the sarcomere; interference between them reduces force below the plateau.'
      : L < 2.25
        ? 'Optimal plateau — maximal cross-bridge overlap without interference. Resting sarcomeres in vivo sit near 2.0–2.2 µm.'
        : L < 3.65
          ? 'Descending limb — less overlap means fewer attached cross-bridges; active force drops roughly linearly with sarcomere length.'
          : 'No overlap — actin is pulled past the myosin filament entirely; active force is zero. Only passive titin tension remains.';

  const peak = Math.max(1.001, Array.from({ length: 301 }, (_, k) => forceAt(k * 2, freq)).reduce((a, b) => Math.max(a, b)));
  const yMax = Math.max(1.5, peak * 1.08);
  const regime = freq < 5
    ? { t: 'Single twitches', c: COL.ok, note: 'each twitch fully relaxes before the next stimulus arrives' }
    : freq < 18
      ? { t: 'Unfused tetanus', c: COL.warn, note: 'temporal summation — twitches ride on the tail of the previous one and force ripples' }
      : { t: 'Fused tetanus', c: COL.primary, note: 'Ca²⁺ stays elevated between pulses, so cross-bridges keep cycling and force is smooth and maximal' };

  const fx = (t: number) => 50 + (t / 600) * 560;
  const fy = (F: number) => 170 - (F / yMax) * 135;
  const trace = Array.from({ length: 301 }, (_, k) => `${fx(k * 2).toFixed(1)},${fy(forceAt(k * 2, freq)).toFixed(1)}`).join(' ');
  const pulses: number[] = [];
  for (let t0 = 0; t0 <= 600; t0 += 1000 / freq) pulses.push(t0);

  const lx = (l: number) => 50 + ((l - 1.2) / 2.6) * 560;
  const ly = (F: number) => 190 - F * 150;
  const activeCurve = Array.from({ length: 131 }, (_, k) => { const l = 1.2 + k * 0.02; return `${lx(l).toFixed(1)},${ly(activeTension(l)).toFixed(1)}`; }).join(' ');
  const passiveCurve = Array.from({ length: 131 }, (_, k) => { const l = 1.2 + k * 0.02; return `${lx(l).toFixed(1)},${ly(passiveTension(l)).toFixed(1)}`; }).join(' ');
  const at = activeTension(L);

  return (
    <SimCard title="Sarcomere: the sliding-filament machine" subtitle="From an α-motor-neuron spike to shortening — the contractile unit every muscle fibre is built from." cites={['huxley1954', 'huxley1971', 'gordon1966']}>
      <div className="flex flex-wrap gap-2">
        <Chip active={mode === 'cycle'} onClick={() => setMode('cycle')}>Cross-bridge cycle</Chip>
        <Chip active={mode === 'length'} onClick={() => setMode('length')}>Length–tension</Chip>
        <Chip active={mode === 'tetanus'} onClick={() => setMode('tetanus')}>Twitch &amp; tetanus</Chip>
      </div>

      {mode === 'cycle' && (
        <div className="space-y-3">
          <SarcomereSvg L={2.2} ca={s.ca} trop={s.trop} attach={s.attach} stroke={s.stroke} atp={s.atp} serca={s.serca} ap={s.ap} label={`Sarcomere: ${s.name}`} />
          {LEGEND}
          <div className="flex flex-wrap gap-2">
            {CYCLE.map((c, k) => <Chip key={c.name} active={k === step} onClick={() => setStep(k)}>{k + 1}. {c.name}</Chip>)}
          </div>
          <p className="text-xs text-muted-foreground min-h-[3rem]">{s.text}</p>
        </div>
      )}

      {mode === 'length' && (
        <div className="space-y-3">
          <SarcomereSvg L={L} ca={1} trop={1} attach={1} stroke={0} atp={0} serca={0} ap={0} label={`Sarcomere at ${L.toFixed(2)} µm`} />
          {LEGEND}
          <label className="block text-xs text-muted-foreground">Sarcomere length: <span className="font-mono text-primary">{L.toFixed(2)} µm</span> · active force <span className="font-mono text-primary">{(at * 100).toFixed(0)}%</span> · passive (titin) <span className="font-mono text-primary">{(passiveTension(L) * 100).toFixed(0)}%</span>
            <input type="range" min={1.3} max={3.8} step={0.05} value={L} onChange={(e) => setL(Number(e.target.value))} className="range-neuro w-full" aria-label="Sarcomere length in micrometres" />
          </label>
          <svg viewBox="0 0 660 210" className="w-full rounded bg-muted/20" role="img" aria-label="Length–tension relation">
            <rect x={lx(2.0)} y={ly(1.13)} width={lx(2.25) - lx(2.0)} height={190 - ly(1.13)} fill={COL.primary} opacity={0.08} />
            <line x1={50} y1={190} x2={610} y2={190} stroke={COL.border} />
            <line x1={50} y1={20} x2={50} y2={190} stroke={COL.border} />
            {[1.5, 2, 2.5, 3, 3.5].map((l) => (
              <g key={l}><line x1={lx(l)} y1={190} x2={lx(l)} y2={194} stroke={COL.border} /><text x={lx(l)} y={203} fontSize={9} textAnchor="middle" fill={COL.muted}>{l.toFixed(1)}</text></g>
            ))}
            <polyline points={passiveCurve} fill="none" stroke={COL.muted} strokeWidth={1.5} strokeDasharray="4 3" />
            <polyline points={activeCurve} fill="none" stroke={COL.primary} strokeWidth={2.5} />
            <line x1={lx(L)} y1={20} x2={lx(L)} y2={190} stroke={COL.warn} strokeDasharray="3 3" opacity={0.7} />
            <circle cx={lx(L)} cy={ly(at)} r={4.5} fill={COL.warn} />
            <text x={56} y={16} fontSize={9} fill={COL.muted}>force (normalised)</text>
            <text x={604} y={186} fontSize={9} textAnchor="end" fill={COL.muted}>sarcomere length (µm)</text>
            <text x={lx(2.125)} y={ly(1.13) - 4} fontSize={8.5} textAnchor="middle" fill={COL.muted}>optimal plateau</text>
          </svg>
          <p className="text-xs text-muted-foreground">{ltText} Dashed: passive titin tension at long lengths. Solid: active force (Gordon–Huxley–Julian, illustrative).</p>
        </div>
      )}

      {mode === 'tetanus' && (
        <div className="space-y-3">
          <svg viewBox="0 0 660 200" className="w-full rounded bg-muted/20" role="img" aria-label={`Force trace at ${freq} Hz stimulation`}>
            <line x1={50} y1={170} x2={610} y2={170} stroke={COL.border} />
            <line x1={50} y1={20} x2={50} y2={170} stroke={COL.border} />
            <line x1={50} y1={fy(1)} x2={610} y2={fy(1)} stroke={COL.muted} strokeDasharray="4 3" opacity={0.7} />
            <text x={46} y={fy(1) + 3} fontSize={9} textAnchor="end" fill={COL.muted}>1×</text>
            {[0, 200, 400, 600].map((t) => (
              <g key={t}><line x1={fx(t)} y1={170} x2={fx(t)} y2={174} stroke={COL.border} /><text x={fx(t)} y={184} fontSize={9} textAnchor="middle" fill={COL.muted}>{t}</text></g>
            ))}
            {pulses.map((t, k) => <line key={k} x1={fx(t)} y1={166} x2={fx(t)} y2={174} stroke={COL.warn} strokeWidth={1.5} />)}
            <polyline points={trace} fill="none" stroke={COL.primary} strokeWidth={2.5} />
            <text x={56} y={18} fontSize={10} fontWeight={600} fill={regime.c}>{regime.t}</text>
            <text x={604} y={196} fontSize={9} textAnchor="end" fill={COL.muted}>time (ms)</text>
            <text x={56} y={34} fontSize={9} fill={COL.muted}>force</text>
          </svg>
          <label className="block text-xs text-muted-foreground">Stimulation frequency: <span className="font-mono text-primary">{freq} Hz</span> (amber ticks = stimuli)
            <input type="range" min={1} max={50} step={1} value={freq} onChange={(e) => setFreq(Number(e.target.value))} className="range-neuro w-full" aria-label="Stimulation frequency in hertz" />
          </label>
          <Meter label="Peak force (× single twitch)" value={Math.min(1, peak / 5)} color={regime.c} right={`${peak.toFixed(1)}×`} />
          <p className="text-xs text-muted-foreground">{regime.note}. In vivo, motor units fire asynchronously and take turns (fatigue resistance); the model drives all cross-bridges in phase and omits metabolic fatigue.</p>
        </div>
      )}

      <p className="text-xs text-muted-foreground">Teaching model, geometry and forces illustrative (not to scale). In vivo: sarcomere ≈ 1.6–3.6 µm, thin filament ≈ 1.0 µm, thick filament ≈ 1.6 µm with a ~0.15 µm bare zone.</p>
    </SimCard>
  );
}
