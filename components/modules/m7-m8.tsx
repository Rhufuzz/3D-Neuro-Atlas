'use client';

import { useState } from 'react';
import { Chip, SimCard, AtlasLink, COL, Meter } from './sim-ui';

function lcg(seed: number) { let s = seed; return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }; }

/* ---------------- Module 7: HPA axis, reconsolidation, IGT ---------------- */

const HPA = [
  { t: 0, name: 'Threat detected', s: 'amygdala', text: 'The amygdala receives a fast, crude thalamic “low road” and a slower, detailed cortical “high road”; either can trigger the stress response.' },
  { t: 4, name: 'Hypothalamus: CRH', s: 'hypothalamus', text: 'Paraventricular nucleus neurons release corticotropin-releasing hormone into the hypophyseal portal system (the sympathetic–adrenal medullary route releases adrenaline within seconds).' },
  { t: 10, name: 'Pituitary: ACTH', s: 'hypothalamus', text: 'The anterior pituitary secretes adrenocorticotropic hormone into the bloodstream.' },
  { t: 20, name: 'Adrenal cortex: cortisol', s: 'hypothalamus', text: 'Cortisol peaks ~20–30 min after stressor onset: mobilises glucose, suppresses digestion and immune function.' },
  { t: 35, name: 'Brain receptors', s: 'hippocampus', text: 'Cortisol binds mineralocorticoid and glucocorticoid receptors densely expressed in hippocampus, prefrontal cortex and amygdala.' },
  { t: 90, name: 'Negative feedback', s: 'hippocampus', text: 'Hippocampal and prefrontal GR activation inhibits the PVN; cortisol suppresses CRH and ACTH — levels return to baseline.' },
];
const cort = (t: number, chronic: boolean) => {
  const g = (t / 25) * Math.exp(1 - t / 25);
  return chronic ? 2.1 + 1.6 * g + 0.9 * (1 - Math.exp(-t / 40)) : 1 + 3 * g;
};

export function M7Hpa() {
  const [k, setK] = useState(0);
  const [chronic, setChronic] = useState(false);
  const st = HPA[k];
  const X = (t: number) => 30 + (t / 180) * 260, Y = (v: number) => 120 - v * 24;
  const pts = (ch: boolean) => Array.from({ length: 91 }, (_, i) => `${X(i * 2)},${Y(cort(i * 2, ch))}`).join(' ');
  return (
    <SimCard title="HPA axis stepper" subtitle="Step through the stress cascade; toggle chronic stress to see a raised baseline and blunted recovery." cites={['ledoux2000', 'mcewen1998', 'lupien2009']}>
      <div className="flex flex-wrap gap-1">{HPA.map((h, i) => <Chip key={h.name} active={i === k} onClick={() => setK(i)}>{i + 1}. {h.name}</Chip>)}</div>
      <svg viewBox="0 0 300 140" className="w-full" role="img" aria-label="Cortisol time course">
        <line x1={30} y1={120} x2={290} y2={120} stroke={COL.border} /><line x1={30} y1={10} x2={30} y2={120} stroke={COL.border} />
        <polyline points={pts(false)} fill="none" stroke={chronic ? COL.muted : COL.primary} strokeWidth={chronic ? 1 : 2} strokeDasharray={chronic ? '4 3' : undefined} />
        {chronic && <polyline points={pts(true)} fill="none" stroke={COL.bad} strokeWidth={2} />}
        <circle cx={X(st.t)} cy={Y(cort(st.t, chronic))} r={5} fill={COL.warn} />
        <text x={34} y={18} fontSize={9} fill={COL.muted}>cortisol (illustrative)</text><text x={250} y={134} fontSize={9} fill={COL.muted}>minutes</text>
        {[0, 60, 120, 180].map((t) => <text key={t} x={X(t)} y={134} fontSize={8} textAnchor="middle" fill={COL.muted}>{t}</text>)}
      </svg>
      <div className="flex flex-wrap gap-2"><Chip active={!chronic} onClick={() => setChronic(false)}>Acute stress</Chip><Chip active={chronic} onClick={() => setChronic(true)}>Chronic stress</Chip></div>
      <div className="rounded-md bg-muted/40 p-3 text-sm space-y-1">
        <p>{st.text}</p>
        <p className="text-xs"><AtlasLink s={st.s}>Show {st.s} in 3D →</AtlasLink></p>
      </div>
      {chronic && <p className="text-xs text-destructive">Allostatic load: sustained glucocorticoids are linked to hippocampal dendritic atrophy, amygdala hypertrophy and prefrontal impairment, which further weakens feedback.</p>}
    </SimCard>
  );
}

type Rc = 'immediate' | 'noreact' | 'delay' | 'vehicle';
const RC: Record<Rc, { label: string; react: boolean; drug: string; when: string; frozen: number; text: string }> = {
  immediate: { label: 'Reactivate → anisomycin', react: true, drug: 'Anisomycin', when: 'immediately', frozen: 0.2, text: 'Retrieval returned the memory to a labile state; blocking protein synthesis prevented its re-storage → amnesia for the tone.' },
  noreact: { label: 'No reactivation', react: false, drug: 'Anisomycin', when: 'without retrieval', frozen: 0.8, text: 'A consolidated memory that is not retrieved is insensitive to protein-synthesis inhibition.' },
  delay: { label: 'Reactivate → drug 6 h later', react: true, drug: 'Anisomycin', when: '6 h after retrieval', frozen: 0.8, text: 'The reconsolidation window had closed; the memory was already re-stabilised.' },
  vehicle: { label: 'Reactivate → vehicle', react: true, drug: 'Vehicle', when: 'immediately', frozen: 0.8, text: 'Control: retrieval alone does not weaken the memory.' },
};

export function M7Reconsolidation() {
  const [c, setC] = useState<Rc>('immediate');
  const d = RC[c];
  const box = (x: number, label: string, sub: string, on = true) => (
    <g transform={`translate(${x},20)`} opacity={on ? 1 : 0.3}>
      <rect width={66} height={44} rx={6} fill={COL.primary} fillOpacity={0.12} stroke={COL.border} />
      <text x={33} y={19} fontSize={9} textAnchor="middle" fill={COL.fg}>{label}</text>
      <text x={33} y={33} fontSize={8} textAnchor="middle" fill={COL.muted}>{sub}</text>
    </g>
  );
  return (
    <SimCard title="Reconsolidation (Nader et al., 2000)" subtitle="Rats learned tone → shock; anisomycin was infused into the lateral/basal amygdala around a reactivation trial." cites={['nader2000']}>
      <div className="flex flex-wrap gap-2">{(Object.keys(RC) as Rc[]).map((k) => <Chip key={k} active={k === c} onClick={() => setC(k)}>{RC[k].label}</Chip>)}</div>
      <svg viewBox="0 0 300 90" className="w-full" role="img" aria-label="Reconsolidation experiment timeline">
        <line x1={10} y1={42} x2={290} y2={42} stroke={COL.border} />
        {box(6, 'Day 1', 'tone + shock')}
        {box(80, 'Day 2', 'tone alone', d.react)}
        {box(154, d.drug, d.when)}
        {box(228, 'Day 3', 'test: tone')}
        <text x={150} y={84} fontSize={9} textAnchor="middle" fill={COL.muted}>timeline</text>
      </svg>
      <Meter label="Freezing to the tone at test (qualitative)" value={d.frozen} color={d.frozen < 0.5 ? COL.bad : COL.ok} right={d.frozen < 0.5 ? 'low' : 'high'} />
      <p className="text-xs text-muted-foreground">{d.text} Retrieval is not read-only: memories can be updated (or disrupted) each time they are recalled — relevant to PTSD therapy.</p>
    </SimCard>
  );
}

const DECKS = {
  A: { gain: 100, loss: [0, 0, 150, 0, 300, 0, 200, 0, 250, 350] },
  B: { gain: 100, loss: [0, 0, 0, 0, 0, 0, 0, 0, 1250, 0] },
  C: { gain: 50, loss: [0, 0, 50, 0, 50, 0, 50, 0, 50, 50] },
  D: { gain: 50, loss: [0, 0, 0, 0, 0, 0, 0, 0, 0, 250] },
} as const;
type Deck = keyof typeof DECKS;

export function M7Igt() {
  const [n, setN] = useState<Record<Deck, number>>({ A: 0, B: 0, C: 0, D: 0 });
  const [cash, setCash] = useState(2000);
  const [last, setLast] = useState<string>('Pick a deck. You start with $2000.');
  const total = n.A + n.B + n.C + n.D;
  const draw = (k: Deck) => {
    if (total >= 50) return;
    const d = DECKS[k], loss = d.loss[n[k] % 10];
    setN({ ...n, [k]: n[k] + 1 });
    setCash(cash + d.gain - loss);
    setLast(`Deck ${k}: +$${d.gain}${loss ? `, −$${loss}` : ''}`);
  };
  const reset = () => { setN({ A: 0, B: 0, C: 0, D: 0 }); setCash(2000); setLast('Pick a deck. You start with $2000.'); };
  const good = n.C + n.D;
  return (
    <SimCard title="Iowa Gambling Task" subtitle="Decks A/B pay more per card but lose money over time; C/D pay less but win. 50 draws." cites={['bechara1994', 'damasio1994']}>
      <div className="grid grid-cols-4 gap-2">
        {(Object.keys(DECKS) as Deck[]).map((k) => (
          <button key={k} type="button" onClick={() => draw(k)} disabled={total >= 50}
            className="aspect-[3/4] rounded-lg border border-border bg-muted/40 hover:border-primary hover:bg-primary/10 transition-colors flex flex-col items-center justify-center disabled:opacity-50">
            <span className="text-xl font-bold">{k}</span><span className="text-[10px] text-muted-foreground">{n[k]} drawn</span>
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span>{last}</span>
        <span>Total: <span className="font-mono" style={{ color: cash >= 2000 ? COL.ok : COL.bad }}>${cash}</span> · {total}/50</span>
      </div>
      <Meter label="Advantageous choices (C + D)" value={total ? good / total : 0} color={COL.ok} />
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">Healthy players drift to C/D and show anticipatory skin-conductance responses before risky picks, often before they can explain why. Patients with vmPFC damage keep choosing A/B — the somatic-marker hypothesis.</p>
        <button type="button" onClick={reset} className="text-xs px-2.5 py-1 rounded-full bg-muted/60 text-muted-foreground hover:text-primary shrink-0">Reset</button>
      </div>
      <AtlasLink s="vmpfc">vmPFC in 3D →</AtlasLink>
    </SimCard>
  );
}

/* ---------------- Module 8: hypnogram, two-process flip-flop, SCN ---------------- */

type Stage = 'W' | 'N1' | 'N2' | 'N3' | 'REM';
const SEG: [Stage, number][] = [['W', 10], ['N1', 5], ['N2', 20], ['N3', 40], ['N2', 10], ['REM', 10], ['N2', 25], ['N3', 30], ['N2', 10], ['REM', 20], ['W', 3], ['N1', 4], ['N2', 35], ['N3', 10], ['N2', 15], ['REM', 25], ['N2', 45], ['REM', 30], ['W', 2], ['N1', 5], ['N2', 40], ['REM', 38], ['N2', 20], ['REM', 20], ['W', 8]];
const MINUTES: Stage[] = SEG.flatMap(([s, m]) => Array.from({ length: m }, () => s));
const LEVEL: Record<Stage, number> = { W: 0, REM: 1, N1: 2, N2: 3, N3: 4 };
const STAGE_INFO: Record<Stage, { name: string; eeg: string; body: string }> = {
  W: { name: 'Wake', eeg: 'Low-amplitude, high-frequency beta; alpha (8–12 Hz) with eyes closed.', body: 'High muscle tone, voluntary eye movements.' },
  N1: { name: 'N1 (light)', eeg: 'Alpha gives way to low-amplitude theta (4–7 Hz); vertex sharp waves.', body: 'Slow rolling eye movements; hypnic jerks possible.' },
  N2: { name: 'N2', eeg: 'Theta background with sleep spindles (11–16 Hz bursts) and K-complexes.', body: 'Reduced tone; ~50 % of the night.' },
  N3: { name: 'N3 (slow-wave)', eeg: 'High-amplitude delta (0.5–2 Hz) for >20 % of the epoch.', body: 'Hardest to wake; growth hormone release; dominates early cycles.' },
  REM: { name: 'REM', eeg: 'Low-amplitude mixed frequency, sawtooth theta — “paradoxical” wake-like EEG.', body: 'Rapid eye movements, skeletal muscle atonia, vivid dreams; lengthens towards morning.' },
};
const EEG: Record<Stage, string> = (() => {
  const out = {} as Record<Stage, string>;
  (Object.keys(STAGE_INFO) as Stage[]).forEach((s, si) => {
    const r = lcg(101 + si);
    out[s] = Array.from({ length: 240 }, (_, i) => {
      const t = i / 120;
      const n = (r() - 0.5) * 0.15;
      let v = 0;
      if (s === 'W') v = 0.15 * Math.sin(2 * Math.PI * 21 * t) + 0.2 * Math.sin(2 * Math.PI * 10 * t);
      if (s === 'N1') v = 0.35 * Math.sin(2 * Math.PI * 5 * t) + 0.1 * Math.sin(2 * Math.PI * 9 * t);
      if (s === 'N2') v = 0.3 * Math.sin(2 * Math.PI * 5 * t) + (t > 0.5 && t < 1 ? 0.45 * Math.sin(2 * Math.PI * 13 * t) * Math.sin((Math.PI * (t - 0.5)) / 0.5) : 0) - (t > 1.4 && t < 1.8 ? 1.3 * Math.sin((Math.PI * (t - 1.4)) / 0.4) * Math.cos((Math.PI * (t - 1.4)) / 0.4) * 1.6 : 0);
      if (s === 'N3') v = 0.9 * Math.sin(2 * Math.PI * 1.2 * t) + 0.35 * Math.sin(2 * Math.PI * 0.7 * t + 1);
      if (s === 'REM') v = 0.3 * (((t * 4) % 1) * 2 - 1) + 0.1 * Math.sin(2 * Math.PI * 18 * t);
      return `${(i / 239) * 290 + 5},${40 - (v + n) * 22}`;
    }).join(' ');
  });
  return out;
})();
const HYP_PATH = MINUTES.map((s, i) => `${i === 0 ? 'M' : 'L'}${(5 + (i / 480) * 290).toFixed(1)} ${12 + LEVEL[s] * 18}`).join(' ');

export function M8Hypnogram() {
  const [m, setM] = useState(60);
  const s = MINUTES[Math.min(479, m)];
  const info = STAGE_INFO[s];
  const clock = `${String((23 + Math.floor(m / 60)) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  return (
    <SimCard title="Hypnogram & sleep-stage EEG" subtitle="Scrub through an idealised 8-hour night (~90-min cycles: N3 early, REM late)." cites={['aserinsky1953']}>
      <svg viewBox="0 0 300 100" className="w-full" role="img" aria-label="Hypnogram">
        {(['W', 'REM', 'N1', 'N2', 'N3'] as Stage[]).map((st) => <text key={st} x={0} y={14 + LEVEL[st] * 18} fontSize={7} fill={COL.muted}>{st}</text>)}
        <g transform="translate(12,0) scale(0.96,1)"><path d={HYP_PATH} fill="none" stroke={COL.primary} strokeWidth={1.5} /><line x1={5 + (m / 480) * 290} y1={4} x2={5 + (m / 480) * 290} y2={92} stroke={COL.warn} strokeWidth={1.5} /></g>
      </svg>
      <input type="range" min={0} max={479} value={m} onChange={(e) => setM(Number(e.target.value))} className="range-neuro w-full" aria-label="Time of night" />
      <div className="flex items-center justify-between text-sm"><span className="font-semibold text-primary">{info.name}</span><span className="font-mono text-muted-foreground">{clock}</span></div>
      <svg viewBox="0 0 300 80" className="w-full rounded bg-muted/30" role="img" aria-label={`Synthetic EEG for ${info.name}`}><polyline points={EEG[s]} fill="none" stroke={COL.fg} strokeWidth={1} /></svg>
      <p className="text-xs"><span className="text-muted-foreground">EEG: </span>{info.eeg}</p>
      <p className="text-xs"><span className="text-muted-foreground">Body: </span>{info.body}</p>
      <p className="text-[11px] text-muted-foreground">Synthetic 2-s traces for illustration, not recorded data.</p>
    </SimCard>
  );
}

function twoProcess(orexin: boolean) {
  let S = 0.22, awake = true;
  const pts: { h: number; S: number; up: number; lo: number; awake: boolean }[] = [];
  for (let i = 0; i <= 720; i++) {
    const h = 7 + i * 0.1;
    const C = 0.1 * Math.sin((2 * Math.PI * (h - 11)) / 24);
    const up = orexin ? 0.67 + C : 0.44 + 0.5 * C;
    const lo = orexin ? 0.2 + C : 0.36 + 0.5 * C;
    if (awake) { S += ((1 - S) * 0.1) / 18.2; if (S > up) awake = false; }
    else { S -= (S * 0.1) / 4.2; if (S < lo) awake = true; }
    pts.push({ h, S, up, lo, awake });
  }
  return pts;
}
const TP = { on: twoProcess(true), off: twoProcess(false) };

export function M8FlipFlop() {
  const [orexin, setOrexin] = useState(true);
  const [i, setI] = useState(170);
  const pts = orexin ? TP.on : TP.off;
  const p = pts[i];
  const X = (k: number) => 10 + (k / 720) * 280, Y = (v: number) => 100 - v * 110;
  const line = (f: (q: typeof p) => number) => pts.map((q, k) => `${X(k)},${Y(f(q))}`).join(' ');
  const switches = pts.reduce((a, q, k) => a + (k && q.awake !== pts[k - 1].awake ? 1 : 0), 0);
  const tilt = p.awake ? -12 : 12;
  return (
    <SimCard title="Two-process model & the VLPO flip-flop" subtitle="Homeostatic pressure (Process S) rises awake and dissipates asleep; circadian Process C sets the switching thresholds." cites={['borbely2016', 'saper2001', 'lin1999']}>
      <div className="flex flex-wrap gap-2"><Chip active={orexin} onClick={() => setOrexin(true)}>Orexin intact</Chip><Chip active={!orexin} onClick={() => setOrexin(false)}>Orexin loss (narcolepsy)</Chip></div>
      <svg viewBox="0 0 300 112" className="w-full" role="img" aria-label="Sleep pressure over 72 hours">
        {pts.map((q, k) => (!q.awake && k % 2 === 0 ? <rect key={k} x={X(k)} y={4} width={0.8} height={98} fill={COL.primary} fillOpacity={0.15} /> : null))}
        <polyline points={line((q) => q.up)} fill="none" stroke={COL.muted} strokeDasharray="3 3" />
        <polyline points={line((q) => q.lo)} fill="none" stroke={COL.muted} strokeDasharray="3 3" />
        <polyline points={line((q) => q.S)} fill="none" stroke={COL.primary} strokeWidth={1.8} />
        <line x1={X(i)} y1={4} x2={X(i)} y2={102} stroke={COL.warn} />
        <text x={12} y={110} fontSize={8} fill={COL.muted}>07:00 day 1</text><text x={238} y={110} fontSize={8} fill={COL.muted}>72 h</text>
      </svg>
      <input type="range" min={0} max={720} value={i} onChange={(e) => setI(Number(e.target.value))} className="range-neuro w-full" aria-label="Time" />
      <div className="grid sm:grid-cols-[1fr_150px] gap-3 items-center">
        <div className="text-sm space-y-1">
          <p>Time <span className="font-mono">{String(Math.floor(p.h % 24)).padStart(2, '0')}:{String(Math.round((p.h % 1) * 60) % 60).padStart(2, '0')}</span> · S = <span className="font-mono text-primary">{p.S.toFixed(2)}</span> · <span className="font-semibold" style={{ color: p.awake ? COL.warn : COL.primary }}>{p.awake ? 'Awake' : 'Asleep'}</span></p>
          <p className="text-xs text-muted-foreground">{switches} state switches in 72 h. {orexin ? 'Mutual inhibition between VLPO and arousal nuclei gives clean, stable transitions; orexin reinforces the wake side.' : 'Without orexin the switch is unstable: thresholds collapse together, so wake and sleep fragment into many short bouts (sleep attacks, intrusions of REM such as cataplexy).'}</p>
        </div>
        <svg viewBox="0 0 150 70" className="w-full" role="img" aria-label="Flip-flop switch">
          <polygon points="70,62 80,62 75,50" fill={COL.muted} />
          <g transform={`rotate(${tilt} 75 48)`} style={{ transition: 'transform .3s' }}>
            <rect x={10} y={45} width={130} height={5} rx={2} fill={COL.fg} />
            <rect x={8} y={26} width={52} height={18} rx={4} fill={COL.primary} fillOpacity={p.awake ? 0.2 : 0.7} /><text x={34} y={38} fontSize={8} textAnchor="middle" fill={COL.fg}>VLPO</text>
            <rect x={90} y={26} width={52} height={18} rx={4} fill={COL.warn} fillOpacity={p.awake ? 0.7 : 0.2} /><text x={116} y={38} fontSize={7} textAnchor="middle" fill={COL.fg}>LC/TMN/raphe</text>
          </g>
          {orexin && <text x={116} y={14} fontSize={7} textAnchor="middle" fill={COL.ok}>+ orexin (LH)</text>}
        </svg>
      </div>
      <div className="flex flex-wrap gap-2 text-xs"><AtlasLink s="vlpo">VLPO</AtlasLink><AtlasLink s="lh">Lateral hypothalamus</AtlasLink><AtlasLink s="lc">Locus coeruleus</AtlasLink><AtlasLink s="tmn">TMN</AtlasLink></div>
    </SimCard>
  );
}

const mel = (h: number, lan: boolean) => {
  const night = h >= 21 || h < 7;
  const lit = lan && h >= 22;
  if (!night || lit) return 0.05;
  const x = h >= 21 ? h - 21 : h + 3;
  return Math.max(0.05, Math.sin((Math.PI * x) / 10));
};

export function M8Clock() {
  const [h, setH] = useState(23);
  const [lan, setLan] = useState(false);
  const light = (h >= 7 && h < 21) || (lan && h >= 22 && h < 24);
  const m = mel(h, lan);
  const chain = ['ipRGC (melanopsin)', 'Retinohypothalamic tract', 'SCN', 'PVN → spinal cord → SCG', 'Pineal: melatonin'];
  const pts = Array.from({ length: 97 }, (_, k) => `${10 + k * 2.9},${70 - mel(k / 4, lan) * 55}`).join(' ');
  return (
    <SimCard title="SCN master clock & melatonin" subtitle="Light reaching melanopsin ganglion cells entrains the suprachiasmatic nucleus, which gates nocturnal melatonin release." cites={['moore1972', 'ralph1990', 'berson2002']}>
      <svg viewBox="0 0 300 86" className="w-full" role="img" aria-label="Melatonin over 24 hours">
        <rect x={10 + 7 * 4 * 2.9} y={10} width={14 * 4 * 2.9} height={62} fill={COL.warn} fillOpacity={0.1} />
        <polyline points={pts} fill="none" stroke={COL.primary} strokeWidth={2} />
        <line x1={10 + h * 4 * 2.9} y1={8} x2={10 + h * 4 * 2.9} y2={74} stroke={COL.warn} strokeWidth={1.5} />
        {[0, 6, 12, 18, 24].map((t) => <text key={t} x={10 + t * 4 * 2.9} y={84} fontSize={8} textAnchor="middle" fill={COL.muted}>{t}h</text>)}
        <text x={14} y={18} fontSize={8} fill={COL.muted}>melatonin</text>
      </svg>
      <input type="range" min={0} max={23.75} step={0.25} value={h} onChange={(e) => setH(Number(e.target.value))} className="range-neuro w-full" aria-label="Clock time" />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Chip active={lan} onClick={() => setLan(!lan)}>Bright screen 22:00–00:00</Chip>
        <span className="text-sm">{String(Math.floor(h)).padStart(2, '0')}:{String((h % 1) * 60).padStart(2, '0')} · {light ? 'light' : 'dark'} · melatonin <span className="font-mono text-primary">{Math.round(m * 100)}%</span></span>
      </div>
      <div className="flex flex-wrap items-center gap-1 text-[11px]">
        {chain.map((c, k) => (
          <span key={c} className="flex items-center gap-1">
            <span className="px-2 py-0.5 rounded" style={{ background: (k < 3 ? light : !light) ? 'hsl(var(--primary) / 0.2)' : 'hsl(var(--muted))' }}>{c}</span>
            {k < chain.length - 1 && <span className="text-muted-foreground">→</span>}
          </span>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Light drives SCN activity, which (via a multisynaptic sympathetic route) suppresses pineal melatonin; darkness releases it. SCN-lesioned hamsters lose rhythms that SCN transplants restore with the donor’s period. Curve is illustrative. <AtlasLink s="scn">SCN</AtlasLink> · <AtlasLink s="pineal">Pineal</AtlasLink></p>
    </SimCard>
  );
}

const DISORDERS = [
  { name: 'Narcolepsy type 1', s: 'lh', text: 'Loss of hypothalamic orexin/hypocretin neurons: sleep attacks, cataplexy (REM atonia during wake, triggered by emotion), sleep-onset REM. Canine narcolepsy maps to the hypocretin receptor-2 gene.', cites: ['lin1999'] },
  { name: 'REM sleep behaviour disorder', s: 'pons', text: 'Brainstem circuits that impose REM atonia fail, so patients act out dreams. Strongly predicts later synucleinopathy (Parkinson’s, Lewy body dementia).', cites: ['schenck1986'] },
  { name: 'Insomnia', s: 'hypothalamus', text: 'Persistent difficulty initiating or maintaining sleep; often hyperarousal of the wake-promoting system. CBT-I is first-line treatment.', cites: [] },
  { name: 'Obstructive sleep apnoea', s: 'pons', text: 'Upper-airway collapse during sleep → repeated arousals and hypoxia; fragments N3/REM and causes daytime sleepiness.', cites: [] },
];

export function M8Disorders() {
  const [k, setK] = useState(0);
  const d = DISORDERS[k];
  return (
    <SimCard title="Sleep disorders" subtitle="Each disorder exposes a component of the sleep–wake machinery." cites={d.cites}>
      <div className="flex flex-wrap gap-2">{DISORDERS.map((x, j) => <Chip key={x.name} active={j === k} onClick={() => setK(j)}>{x.name}</Chip>)}</div>
      <p className="text-sm">{d.text}</p>
      <AtlasLink s={d.s}>Related structure in 3D →</AtlasLink>
    </SimCard>
  );
}
