'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Pause, Play, Eye, EyeOff, Box } from 'lucide-react';
import CiteChips from '@/components/cite-chips';

/* ---------------- 10-20 electrode map ---------------- */
interface Electrode { id: string; x: number; y: number; region: string; structure: string; note: string }
const polar = (deg: number, r = 0.8): [number, number] => [Math.cos((deg * Math.PI) / 180) * r, Math.sin((deg * Math.PI) / 180) * r];
const E = (id: string, [x, y]: [number, number], region: string, structure: string, note: string): Electrode => ({ id, x, y, region, structure, note });
const ELECTRODES: Electrode[] = [
  E('Fp1', polar(108), 'Left frontopolar / orbitofrontal', 'ofc', 'Eye-blink and eye-movement artefacts dominate here.'),
  E('Fp2', polar(72), 'Right frontopolar / orbitofrontal', 'ofc', 'Eye-blink and eye-movement artefacts dominate here.'),
  E('F7', polar(144), 'Left inferior frontal gyrus (Broca)', 'broca', 'Left anterior negativity (LAN) to syntactic violations is often largest at left frontal sites.'),
  E('F8', polar(36), 'Right inferior frontal gyrus', 'broca', 'Right IFG supports response inhibition (stop-signal tasks).'),
  E('F3', [-0.33, 0.44], 'Left dorsolateral prefrontal cortex', 'dlpfc', 'Frontal alpha asymmetry; target for rTMS in depression.'),
  E('Fz', [0, 0.4], 'Medial frontal cortex / ACC', 'acc', 'Frontal-midline theta and the error-related negativity (ERN) peak here.'),
  E('F4', [0.33, 0.44], 'Right dorsolateral prefrontal cortex', 'dlpfc', 'Working-memory load modulates frontal theta and alpha.'),
  E('T3', polar(180), 'Left mid temporal / superior temporal gyrus', 'a1', 'Auditory N1 and mismatch negativity have temporal contributions.'),
  E('C3', [-0.4, 0], 'Left sensorimotor cortex (hand)', 'm1', 'Mu rhythm (8–13 Hz) desynchronises with right-hand movement or motor imagery.'),
  E('Cz', [0, 0], 'Vertex: medial motor / SMA (leg)', 'm1', 'Vertex waves (N1 sleep), K-complexes (N2) and the N400 are prominent near Cz.'),
  E('C4', [0.4, 0], 'Right sensorimotor cortex (hand)', 'm1', 'Mu rhythm desynchronises with left-hand movement.'),
  E('T4', polar(0), 'Right mid temporal / superior temporal gyrus', 'a1', 'Auditory processing; temporal lobe epileptiform spikes.'),
  E('T5', polar(216), 'Left posterior temporal (Wernicke)', 'wernicke', 'Language comprehension area; N400 has temporal generators.'),
  E('P3', [-0.33, -0.44], 'Left inferior parietal / angular gyrus', 'ag', 'Reading and semantic integration.'),
  E('Pz', [0, -0.4], 'Precuneus / superior parietal', 'spl', 'P300 (oddball) and P600 are maximal over midline parietal sites.'),
  E('P4', [0.33, -0.44], 'Right inferior parietal lobule', 'ipl', 'Spatial attention; lesions here produce left neglect.'),
  E('T6', polar(-36), 'Right posterior temporal / fusiform', 'ffa', 'Face-sensitive N170 is largest at right occipito-temporal sites.'),
  E('O1', polar(252), 'Left occipital (V1/V2)', 'v1', 'Posterior alpha is largest here with eyes closed.'),
  E('O2', polar(-72), 'Right occipital (V1/V2)', 'v1', 'Posterior alpha is largest here with eyes closed.'),
];

/* ---------------- Rhythm generator ---------------- */
type Preset = 'delta' | 'theta' | 'alpha' | 'beta' | 'gamma' | 'n2' | 'rem';
const PRESETS: { id: Preset; label: string; band: string; amp: string; state: string; color: string }[] = [
  { id: 'delta', label: 'Delta', band: '0.5–4 Hz', amp: '75–200 µV', state: 'Slow-wave sleep (N3); pathological when awake in adults.', color: '#a78bfa' },
  { id: 'theta', label: 'Theta', band: '4–8 Hz', amp: '20–60 µV', state: 'Drowsiness / N1 sleep; frontal-midline theta during working memory; hippocampal theta in navigation.', color: '#60a5fa' },
  { id: 'alpha', label: 'Alpha', band: '8–12 Hz', amp: '20–50 µV', state: 'Relaxed wakefulness with eyes closed, posterior. Blocked by eye opening or attention (Berger effect).', color: '#34d399' },
  { id: 'beta', label: 'Beta', band: '13–30 Hz', amp: '5–20 µV', state: 'Alert, active concentration; sensorimotor beta suppressed during movement. Enhanced by benzodiazepines.', color: '#fbbf24' },
  { id: 'gamma', label: 'Gamma', band: '30–80 Hz', amp: '< 10 µV', state: 'Local cortical synchrony linked to attention and feature binding.', color: '#f472b6' },
  { id: 'n2', label: 'N2 sleep', band: 'Theta + spindles 12–14 Hz', amp: 'K-complex > 75 µV', state: 'Sleep spindles (thalamic reticular nucleus) and K-complexes; spindles predict overnight memory gains.', color: '#22d3ee' },
  { id: 'rem', label: 'REM sleep', band: 'Mixed, low amplitude', amp: '10–30 µV', state: 'Desynchronised “paradoxical” EEG with sawtooth waves, rapid eye movements and muscle atonia.', color: '#fb7185' },
];
const TAU = Math.PI * 2;
const noise = (t: number, a = 1) => a * (Math.sin(TAU * 3.7 * t + 1.3) * 0.5 + Math.sin(TAU * 7.3 * t + 0.4) * 0.35 + Math.sin(TAU * 11.9 * t + 2.2) * 0.25 + Math.sin(TAU * 17.1 * t + 4.1) * 0.2 + Math.sin(TAU * 23.3 * t + 5.3) * 0.15);
const gauss = (t: number, mu: number, sd: number) => Math.exp(-((t - mu) ** 2) / (2 * sd * sd));
const periodic = (t: number, period: number) => ((t % period) + period) % period;

function signal(p: Preset, t: number, eyesOpen: boolean): number {
  switch (p) {
    case 'delta': return 70 * Math.sin(TAU * 1.1 * t) + 35 * Math.sin(TAU * 2.4 * t + 1) + 18 * Math.sin(TAU * 0.6 * t + 2) + noise(t, 6);
    case 'theta': return 32 * Math.sin(TAU * 5.8 * t) + 14 * Math.sin(TAU * 4.3 * t + 0.7) + noise(t, 7);
    case 'alpha': {
      if (eyesOpen) return 6 * Math.sin(TAU * 19 * t) + 4 * Math.sin(TAU * 24 * t + 1) + noise(t, 5);
      const env = 0.65 + 0.35 * Math.sin(TAU * 0.4 * t);
      return 38 * env * Math.sin(TAU * 10 * t) + noise(t, 5);
    }
    case 'beta': return 9 * Math.sin(TAU * 18 * t) + 6 * Math.sin(TAU * 23.5 * t + 1.1) + 4 * Math.sin(TAU * 27 * t + 2) + noise(t, 3);
    case 'gamma': return 4 * Math.sin(TAU * 40 * t) + 2.5 * Math.sin(TAU * 52 * t + 0.6) + noise(t, 2.5);
    case 'n2': {
      const ph = periodic(t, 5.3);
      const spindle = 22 * gauss(ph, 1.4, 0.28) * Math.sin(TAU * 13 * t);
      const k = -95 * gauss(ph, 3.6, 0.09) + 55 * gauss(ph, 3.95, 0.16);
      return 22 * Math.sin(TAU * 5 * t) + 8 * Math.sin(TAU * 3.1 * t + 2) + spindle + k + noise(t, 6);
    }
    case 'rem': {
      const ph = periodic(t, 3.1);
      const saw = gauss(ph, 1.2, 0.5) * 18 * (2 * periodic(t * 3.5, 1) - 1);
      return saw + 8 * Math.sin(TAU * 6.5 * t) + 5 * Math.sin(TAU * 21 * t + 0.4) + noise(t, 6);
    }
  }
}

const WIN = 4; // seconds on screen
const CW = 800, CH = 200, UV = 0.75; // px per µV

export default function EegLab() {
  const [el, setEl] = useState<Electrode>(ELECTRODES[17]);
  const [preset, setPreset] = useState<Preset>('alpha');
  const [eyesOpen, setEyesOpen] = useState(false);
  const [playing, setPlaying] = useState(true);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const tRef = useRef(0);
  const cfg = useRef({ preset, eyesOpen, color: '#34d399' });
  const meta = PRESETS.find((x) => x.id === preset) ?? PRESETS[0];
  useEffect(() => { cfg.current = { preset, eyesOpen, color: meta.color }; }, [preset, eyesOpen, meta.color]);

  useEffect(() => {
    const cv = canvas.current; if (!cv) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = CW * dpr; cv.height = CH * dpr;
    const ctx = cv.getContext('2d'); if (!ctx) return;
    ctx.scale(dpr, dpr);
    let raf = 0; let last = performance.now();
    const draw = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      if (playing) tRef.current += dt;
      const { preset: p, eyesOpen: eo, color } = cfg.current;
      ctx.clearRect(0, 0, CW, CH);
      ctx.strokeStyle = 'rgba(148,163,184,0.15)'; ctx.lineWidth = 1;
      for (let s = 0; s <= WIN; s++) { const x = (s / WIN) * CW; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CH); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(0, CH / 2); ctx.lineTo(CW, CH / 2); ctx.stroke();
      ctx.strokeStyle = 'rgba(226,232,240,0.7)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(CW - 14, CH - 12); ctx.lineTo(CW - 14, CH - 12 - 50 * UV); ctx.stroke();
      ctx.fillStyle = 'rgba(226,232,240,0.7)'; ctx.font = '11px sans-serif'; ctx.fillText('50 µV', CW - 58, CH - 18); ctx.fillText('1 s / div', 8, CH - 8);
      ctx.strokeStyle = color; ctx.lineWidth = 1.6; ctx.beginPath();
      const t0 = tRef.current;
      for (let px = 0; px <= CW; px += 1) {
        const t = t0 + (px / CW) * WIN;
        const y = CH / 2 - signal(p, t, eo) * UV;
        if (px === 0) ctx.moveTo(px, y); else ctx.lineTo(px, y);
      }
      ctx.stroke();
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  return (
    <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
      <div className="space-y-3">
        <svg viewBox="-1.15 -1.2 2.3 2.35" className="w-full max-w-[300px] mx-auto" role="img" aria-label="International 10-20 electrode map">
          <path d="M -0.12 -0.99 L 0 -1.13 L 0.12 -0.99" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth={0.02} />
          <ellipse cx={-1.02} cy={0} rx={0.06} ry={0.16} fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth={0.02} />
          <ellipse cx={1.02} cy={0} rx={0.06} ry={0.16} fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth={0.02} />
          <circle cx={0} cy={0} r={1} fill="hsl(var(--muted) / 0.25)" stroke="hsl(var(--muted-foreground))" strokeWidth={0.02} />
          <circle cx={0} cy={0} r={0.8} fill="none" stroke="hsl(var(--muted-foreground))" strokeOpacity={0.25} strokeWidth={0.01} strokeDasharray="0.03 0.03" />
          <line x1={0} y1={-0.8} x2={0} y2={0.8} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.25} strokeWidth={0.01} strokeDasharray="0.03 0.03" />
          <line x1={-0.8} y1={0} x2={0.8} y2={0} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.25} strokeWidth={0.01} strokeDasharray="0.03 0.03" />
          {ELECTRODES.map((e) => {
            const on = e.id === el.id;
            return (
              <g key={e.id} onClick={() => setEl(e)} className="cursor-pointer" role="button" aria-label={`Electrode ${e.id}`}>
                <circle cx={e.x} cy={-e.y} r={0.105} fill={on ? 'hsl(var(--primary))' : 'hsl(var(--background))'} stroke="hsl(var(--primary))" strokeWidth={0.02} />
                <text x={e.x} y={-e.y} fontSize={0.075} textAnchor="middle" dominantBaseline="central" fill={on ? 'hsl(var(--background))' : 'hsl(var(--foreground))'} style={{ pointerEvents: 'none' }}>{e.id}</text>
              </g>
            );
          })}
        </svg>
        <div className="panel rounded-lg p-3 space-y-1.5">
          <p className="text-sm"><span className="font-semibold text-primary">{el.id}</span> · {el.region}</p>
          <p className="text-xs text-muted-foreground">{el.note}</p>
          <p className="text-[11px] text-muted-foreground">Odd = left, even = right, z = midline. Electrodes sit at 10 % / 20 % of nasion–inion and ear-to-ear distances.</p>
          <Link href={`/atlas?s=${el.structure}`} className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"><Box className="h-3.5 w-3.5" />Underlying cortex in 3D</Link>
        </div>
      </div>

      <div className="space-y-3 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          {PRESETS.map((p) => (
            <button key={p.id} onClick={() => setPreset(p.id)} aria-pressed={preset === p.id}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${preset === p.id ? 'text-background font-medium' : 'text-muted-foreground border-border hover:text-foreground'}`}
              style={preset === p.id ? { background: p.color, borderColor: p.color } : undefined}>{p.label}</button>
          ))}
          <span className="flex-1" />
          {preset === 'alpha' && (
            <button onClick={() => setEyesOpen((v) => !v)} className="text-xs px-2.5 py-1 rounded-md bg-muted hover:bg-muted/70 inline-flex items-center gap-1">
              {eyesOpen ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}{eyesOpen ? 'Close eyes' : 'Open eyes'}
            </button>
          )}
          <button onClick={() => setPlaying((v) => !v)} className="text-xs px-2.5 py-1 rounded-md bg-muted hover:bg-muted/70 inline-flex items-center gap-1" aria-label={playing ? 'Pause trace' : 'Play trace'}>
            {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}{playing ? 'Pause' : 'Play'}
          </button>
        </div>
        <div className="panel rounded-lg p-2">
          <div className="flex justify-between text-[11px] text-muted-foreground px-1 pb-1"><span>Channel {el.id} (referential)</span><span>Simulated trace</span></div>
          <canvas ref={canvas} className="w-full h-auto block rounded" style={{ aspectRatio: `${CW} / ${CH}` }} aria-label={`Simulated ${meta.label} EEG trace`} />
        </div>
        <div className="grid gap-2 sm:grid-cols-3 text-xs">
          <div className="panel rounded-md p-2.5"><p className="text-muted-foreground">Frequency</p><p className="font-medium" style={{ color: meta.color }}>{meta.band}</p></div>
          <div className="panel rounded-md p-2.5"><p className="text-muted-foreground">Typical amplitude</p><p className="font-medium">{meta.amp}</p></div>
          <div className="panel rounded-md p-2.5 sm:col-span-1"><p className="text-muted-foreground">Generator</p><p className="font-medium">Synchronised pyramidal-cell PSPs</p></div>
        </div>
        <p className="text-sm text-muted-foreground">{meta.state}{preset === 'alpha' && eyesOpen ? ' Eyes open: alpha is replaced by low-amplitude beta.' : ''}</p>
        <CiteChips ids={['aserinsky1953', 'rasch2013', 'diekelmann2010']} />
      </div>
    </div>
  );
}
