'use client';

import { useState } from 'react';
import { Chip, SimCard, AtlasLink, LabLink, COL, Meter } from './sim-ui';

/* ---------------- Module 3: illusions, streams, receptive fields ---------------- */

type Ill = 'muller' | 'ponzo' | 'kanizsa' | 'contrast';
const ILL: Record<Ill, { name: string; cites: string[]; text: string; reveal: string }> = {
  muller: { name: 'Müller-Lyer', cites: ['gregory1963'], text: 'The shafts are equal, yet the one with outward fins looks longer. Gregory proposed misapplied size constancy: fins act like depth cues (inside vs outside corners).', reveal: 'Guides show both shafts span exactly the same distance.' },
  ponzo: { name: 'Ponzo', cites: ['gregory1963'], text: 'Converging lines signal linear perspective; the upper bar is “further away”, so size constancy scales it up.', reveal: 'Without the rails both bars look — and are — equal.' },
  kanizsa: { name: 'Kanizsa triangle', cites: ['kanizsa1976'], text: 'A bright triangle with sharp edges is seen where none is drawn. Neurons in V2 respond to such illusory contours — inference fills in the most likely occluder.', reveal: 'Rotate the inducers and the triangle vanishes: the contour was constructed, not sensed.' },
  contrast: { name: 'Lightness (checker-shadow principle)', cites: ['adelson1993'], text: 'Both patches have the identical grey value. The visual system discounts the illumination/surround and reports surface lightness, not luminance — the principle behind Adelson’s checker-shadow illusion (simplified here).', reveal: 'On a uniform surround the two patches match.' },
};

function pacman(cx: number, cy: number, r: number, aim: number) {
  const a1 = aim + Math.PI / 6, a2 = aim - Math.PI / 6;
  const p = (a: number) => `${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`;
  return `M${cx} ${cy} L${p(a1)} A${r} ${r} 0 1 1 ${p(a2)} Z`;
}

function IllusionSvg({ id, reveal }: { id: Ill; reveal: boolean }) {
  const stroke = { stroke: COL.fg, strokeWidth: 3, fill: 'none', strokeLinecap: 'round' as const };
  if (id === 'muller') {
    const fin = (x: number, y: number, dir: number) => <path d={`M${x + 18 * dir} ${y - 16} L${x} ${y} L${x + 18 * dir} ${y + 16}`} {...stroke} />;
    return (
      <g>
        <line x1={80} y1={60} x2={220} y2={60} {...stroke} style={{ stroke: reveal ? COL.primary : COL.fg }} />{fin(80, 60, 1)}{fin(220, 60, -1)}
        <line x1={80} y1={140} x2={220} y2={140} {...stroke} style={{ stroke: reveal ? COL.primary : COL.fg }} />{fin(80, 140, -1)}{fin(220, 140, 1)}
        {reveal && <><line x1={80} y1={20} x2={80} y2={180} stroke={COL.warn} strokeDasharray="4 4" /><line x1={220} y1={20} x2={220} y2={180} stroke={COL.warn} strokeDasharray="4 4" /></>}
      </g>
    );
  }
  if (id === 'ponzo') {
    return (
      <g>
        {!reveal && <><line x1={95} y1={195} x2={140} y2={5} {...stroke} strokeWidth={2} /><line x1={205} y1={195} x2={160} y2={5} {...stroke} strokeWidth={2} /></>}
        <line x1={120} y1={50} x2={180} y2={50} stroke={COL.primary} strokeWidth={6} />
        <line x1={120} y1={160} x2={180} y2={160} stroke={COL.primary} strokeWidth={6} />
        {reveal && <><line x1={120} y1={30} x2={120} y2={180} stroke={COL.warn} strokeDasharray="4 4" /><line x1={180} y1={30} x2={180} y2={180} stroke={COL.warn} strokeDasharray="4 4" /></>}
      </g>
    );
  }
  if (id === 'kanizsa') {
    const v = [[150, 28], [62, 178], [238, 178]];
    return (
      <g>
        {v.map(([x, y], k) => {
          const aim = Math.atan2(128 - y, 150 - x) + (reveal ? Math.PI : 0);
          return <path key={k} d={pacman(x, y, 26, aim)} fill={COL.fg} style={{ transition: 'd .4s' }} />;
        })}
      </g>
    );
  }
  return (
    <g>
      <rect x={0} y={0} width={150} height={200} fill={reveal ? '#7a7a7a' : '#1f1f1f'} />
      <rect x={150} y={0} width={150} height={200} fill={reveal ? '#7a7a7a' : '#e2e2e2'} />
      <rect x={50} y={75} width={50} height={50} fill="#808080" />
      <rect x={200} y={75} width={50} height={50} fill="#808080" />
    </g>
  );
}

export function M3Illusions() {
  const [id, setId] = useState<Ill>('muller');
  const [reveal, setReveal] = useState(false);
  const d = ILL[id];
  return (
    <SimCard title="Illusions as inference" subtitle="Perception is an active best guess about the world; illusions expose its assumptions." cites={d.cites}>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(ILL) as Ill[]).map((k) => <Chip key={k} active={k === id} onClick={() => { setId(k); setReveal(false); }}>{ILL[k].name}</Chip>)}
      </div>
      <svg viewBox="0 0 300 200" className="w-full max-w-sm mx-auto rounded bg-muted/20" role="img" aria-label={`${d.name} illusion`}><IllusionSvg id={id} reveal={reveal} /></svg>
      <div className="flex justify-center"><Chip active={reveal} onClick={() => setReveal(!reveal)}>{reveal ? 'Hide reveal' : 'Reveal'}</Chip></div>
      <p className="text-xs text-muted-foreground">{reveal ? d.reveal : d.text}</p>
    </SimCard>
  );
}

const STAGES = [
  { id: 'ret', name: 'Retina (RGC)', st: 'both', s: 'optic', rf: 'Centre–surround (ON/OFF) receptive fields signal local contrast.', cites: ['kuffler1953'] },
  { id: 'lgn', name: 'LGN', st: 'both', s: 'lgn', rf: 'Centre–surround; 6 layers split magnocellular (motion, low acuity) and parvocellular (colour, detail).', cites: ['kuffler1953'] },
  { id: 'v1', name: 'V1', st: 'both', s: 'v1', rf: 'Simple cells (oriented bars at a position) → complex cells (orientation, position-invariant, direction).', cites: ['hubel1959', 'hubel1962'] },
  { id: 'v2', name: 'V2/V3', st: 'both', s: 'v2v3', rf: 'Larger RFs; illusory contours, border ownership, binocular disparity.', cites: ['felleman1991'] },
  { id: 'v4', name: 'V4', st: 'ventral', s: 'v4', rf: 'Colour constancy, curvature and intermediate shape.', cites: ['felleman1991'] },
  { id: 'it', name: 'IT / FFA', st: 'ventral', s: 'it', rf: 'Whole objects and faces, invariant to size, position and viewpoint.', cites: ['kanwisher1997'] },
  { id: 'mt', name: 'MT / V5', st: 'dorsal', s: 'mt', rf: 'Motion direction and speed; integrates local motion into global flow.', cites: ['felleman1991'] },
  { id: 'ppc', name: 'Posterior parietal', st: 'dorsal', s: 'spl', rf: 'Egocentric space and visually guided action (reaching, grasp scaling).', cites: ['goodale1992'] },
];

export function M3Streams() {
  const [stream, setStream] = useState<'ventral' | 'dorsal'>('ventral');
  const [sel, setSel] = useState('v1');
  const path = STAGES.filter((s) => s.st === 'both' || s.st === stream);
  const cur = STAGES.find((s) => s.id === sel) ?? path[0];
  return (
    <SimCard title="Retino-geniculo-striate pathway & two streams" subtitle="Receptive fields grow larger and more abstract at each stage." cites={cur.cites}>
      <div className="flex flex-wrap gap-2">
        <Chip active={stream === 'ventral'} onClick={() => { setStream('ventral'); if (STAGES.find((s) => s.id === sel)?.st === 'dorsal') setSel('v4'); }}>Ventral — “what” / perception</Chip>
        <Chip active={stream === 'dorsal'} onClick={() => { setStream('dorsal'); if (STAGES.find((s) => s.id === sel)?.st === 'ventral') setSel('mt'); }}>Dorsal — “where/how” / action</Chip>
      </div>
      <div className="flex flex-wrap items-center gap-1 text-xs">
        {path.map((s, k) => (
          <span key={s.id} className="flex items-center gap-1">
            <button type="button" onClick={() => setSel(s.id)} className={`px-2 py-1 rounded border transition-colors ${s.id === cur.id ? 'border-primary bg-primary/15 text-primary' : 'border-border hover:border-primary/60'}`}>{s.name}</button>
            {k < path.length - 1 && <span className="text-muted-foreground">→</span>}
          </span>
        ))}
      </div>
      <div className="rounded-md bg-muted/40 p-3 text-sm">
        <p>{cur.rf}</p>
        <p className="text-xs mt-1"><AtlasLink s={cur.s}>Locate {cur.name} in 3D →</AtlasLink></p>
      </div>
      <p className="text-xs text-muted-foreground">Patient D.F. (ventral damage) could not report a slot’s orientation yet posted a card through it accurately — perception and action dissociate (Goodale &amp; Milner).</p>
    </SimCard>
  );
}

export function M3Receptive() {
  const [r, setR] = useState(1.5);
  const [on, setOn] = useState(true);
  const resp = (x: number) => (1 - Math.exp(-(x * x))) - 0.85 * (1 - Math.exp(-(x * x) / 9));
  const rate = (x: number) => Math.max(0, 15 + (on ? 1 : -1) * 70 * resp(x));
  const pts = Array.from({ length: 61 }, (_, k) => { const x = (k / 60) * 8; return `${20 + x * 32},${120 - rate(x) * 1.6}`; }).join(' ');
  return (
    <SimCard title="Centre–surround receptive field" subtitle="Grow a light spot over an ON- or OFF-centre ganglion cell and watch the firing rate." cites={['kuffler1953']}>
      <div className="flex flex-wrap gap-2"><Chip active={on} onClick={() => setOn(true)}>ON-centre</Chip><Chip active={!on} onClick={() => setOn(false)}>OFF-centre</Chip></div>
      <div className="grid grid-cols-[110px_1fr] gap-3 items-center">
        <svg viewBox="0 0 110 110" className="w-full" role="img" aria-label="Receptive field with light spot">
          <circle cx={55} cy={55} r={50} fill={on ? 'rgba(239,68,68,.18)' : 'rgba(34,197,94,.18)'} stroke={COL.border} />
          <circle cx={55} cy={55} r={17} fill={on ? 'rgba(34,197,94,.3)' : 'rgba(239,68,68,.3)'} stroke={COL.border} />
          <circle cx={55} cy={55} r={Math.min(54, r * 11.5)} fill="rgba(253,224,71,.45)" />
          <text x={55} y={58} fontSize={9} textAnchor="middle" fill={COL.fg}>{on ? '+' : '−'}</text>
        </svg>
        <svg viewBox="0 0 290 130" className="w-full" role="img" aria-label="Firing rate vs spot size">
          <line x1={20} y1={120} x2={280} y2={120} stroke={COL.border} />
          <line x1={20} y1={120 - 15 * 1.6} x2={280} y2={120 - 15 * 1.6} stroke={COL.muted} strokeDasharray="3 3" />
          <polyline points={pts} fill="none" stroke={COL.primary} strokeWidth={2} />
          <circle cx={20 + r * 32} cy={120 - rate(r) * 1.6} r={4} fill={COL.warn} />
          <text x={24} y={12} fontSize={9} fill={COL.muted}>spikes/s</text><text x={240} y={116} fontSize={9} fill={COL.muted}>spot size</text>
        </svg>
      </div>
      <input type="range" min={0} max={8} step={0.1} value={r} onChange={(e) => setR(Number(e.target.value))} className="range-neuro w-full" aria-label="Spot size" />
      <p className="text-xs text-muted-foreground">Rate: <span className="font-mono text-primary">{Math.round(rate(r))}</span> spikes/s (baseline 15, dashed). A spot filling the centre is optimal; spreading into the surround cancels it — the cell signals contrast, not absolute light. (Difference-of-Gaussians model, illustrative units.)</p>
    </SimCard>
  );
}

/* ---------------- Module 4: basal ganglia rate model + neglect ---------------- */

type Mode = 'normal' | 'pd' | 'hd' | 'ldopa' | 'dbs';
const MODES: Record<Mode, { label: string; da: number; d2: number; dbs: boolean; note: string }> = {
  normal: { label: 'Healthy', da: 1, d2: 1, dbs: false, note: 'Balanced direct (go) and indirect (no-go) pathways keep GPi output intermediate.' },
  pd: { label: 'Parkinson’s', da: 0.2, d2: 1, dbs: false, note: 'SNc dopamine loss weakens D1 (direct) and disinhibits D2 (indirect) → GPi overactive → thalamus suppressed → bradykinesia.' },
  hd: { label: 'Huntington’s', da: 1, d2: 0.3, dbs: false, note: 'Early loss of D2 indirect-pathway striatal neurons → GPe disinhibited, STN and GPi underactive → thalamus released → chorea.' },
  ldopa: { label: 'PD + L-DOPA', da: 0.8, d2: 1, dbs: false, note: 'L-DOPA restores striatal dopamine; overshooting the slider (>1.3) mimics levodopa-induced dyskinesia.' },
  dbs: { label: 'PD + STN-DBS', da: 0.2, d2: 1, dbs: true, note: 'High-frequency STN stimulation functionally reduces STN drive to GPi, re-opening the thalamic gate.' },
};
const clamp = (v: number) => Math.max(0, Math.min(1.5, v));
function bgModel(da: number, d2h: number, dbs: boolean) {
  const ctx = 1;
  const d1 = ctx * (0.5 + 0.5 * da);
  const d2 = ctx * (1.5 - 0.5 * da) * d2h;
  const gpe = clamp(1 - 0.6 * d2);
  const stn = clamp(1.2 - 0.6 * gpe) * (dbs ? 0.5 : 1);
  const gpi = clamp(0.4 + 0.6 * stn - 0.5 * d1);
  const thal = clamp(1 - 0.8 * gpi);
  return { ctx, d1, d2, gpe, stn, gpi, thal, snc: da };
}
const NODES: { id: keyof ReturnType<typeof bgModel>; label: string; x: number; y: number }[] = [
  { id: 'ctx', label: 'Cortex', x: 210, y: 28 }, { id: 'thal', label: 'Thalamus', x: 70, y: 28 },
  { id: 'd1', label: 'Str D1', x: 140, y: 100 }, { id: 'd2', label: 'Str D2', x: 280, y: 100 },
  { id: 'snc', label: 'SNc (DA)', x: 210, y: 160 }, { id: 'gpe', label: 'GPe', x: 300, y: 178 },
  { id: 'stn', label: 'STN', x: 230, y: 238 }, { id: 'gpi', label: 'GPi/SNr', x: 70, y: 178 },
];
const EDGES: [string, string, 'e' | 'i'][] = [['ctx', 'd1', 'e'], ['ctx', 'd2', 'e'], ['d1', 'gpi', 'i'], ['d2', 'gpe', 'i'], ['gpe', 'stn', 'i'], ['stn', 'gpi', 'e'], ['gpi', 'thal', 'i'], ['thal', 'ctx', 'e'], ['snc', 'd1', 'e'], ['snc', 'd2', 'i']];

function edgePts(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len;
  const cut = Math.min(Math.abs(36 / (ux || 1e-6)), Math.abs(15 / (uy || 1e-6))) + 3;
  return { x1: a.x + ux * cut, y1: a.y + uy * cut, x2: b.x - ux * cut, y2: b.y - uy * cut };
}

export function M4BasalGanglia() {
  const [mode, setMode] = useState<Mode>('normal');
  const [da, setDa] = useState(1);
  const m = MODES[mode];
  const v = bgModel(da, m.d2, m.dbs);
  const state = v.thal < 0.5 ? { t: 'Hypokinetic', c: COL.bad } : v.thal > 0.7 ? { t: 'Hyperkinetic', c: COL.warn } : { t: 'Normal movement', c: COL.ok };
  const pick = (k: Mode) => { setMode(k); setDa(MODES[k].da); };
  const pos = Object.fromEntries(NODES.map((n) => [n.id, n]));
  return (
    <SimCard title="Basal-ganglia circuit simulator" subtitle="Albin–DeLong rate model: edge thickness = presynaptic activity; green excites, red inhibits." cites={['albin1989', 'delong1990', 'cotzias1967', 'benabid2009']}>
      <div className="flex flex-wrap gap-2">{(Object.keys(MODES) as Mode[]).map((k) => <Chip key={k} active={k === mode} onClick={() => pick(k)}>{MODES[k].label}</Chip>)}</div>
      <svg viewBox="0 0 370 262" className="w-full" role="img" aria-label="Basal ganglia circuit">
        <defs>
          <marker id="bg-ex" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill={COL.ok} /></marker>
          <marker id="bg-in" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto"><rect x="3" y="0" width="4" height="10" fill={COL.bad} /></marker>
        </defs>
        {EDGES.map(([a, b, t]) => {
          const p = edgePts(pos[a], pos[b]);
          const act = v[a as keyof typeof v];
          return <line key={a + b} {...p} stroke={t === 'e' ? COL.ok : COL.bad} strokeWidth={1 + 3.5 * Math.min(1.5, act)} strokeOpacity={0.8} markerEnd={`url(#bg-${t === 'e' ? 'ex' : 'in'})`} style={{ transition: 'stroke-width .3s' }} />;
        })}
        {NODES.map((n) => {
          const act = v[n.id];
          return (
            <g key={n.id}>
              <rect x={n.x - 36} y={n.y - 15} width={72} height={30} rx={8} fill={COL.primary} fillOpacity={0.1 + 0.45 * Math.min(1.5, act) / 1.5} stroke={n.id === 'thal' ? state.c : COL.border} strokeWidth={n.id === 'thal' ? 2 : 1} />
              <text x={n.x} y={n.y - 2} fontSize={10} textAnchor="middle" fill={COL.fg}>{n.label}</text>
              <text x={n.x} y={n.y + 10} fontSize={9} textAnchor="middle" fill={COL.muted}>{act.toFixed(2)}</text>
            </g>
          );
        })}
      </svg>
      <label className="block text-xs text-muted-foreground">Striatal dopamine: <span className="font-mono text-primary">{da.toFixed(2)}</span>
        <input type="range" min={0} max={1.8} step={0.05} value={da} onChange={(e) => setDa(Number(e.target.value))} className="range-neuro w-full" aria-label="Dopamine level" />
      </label>
      <div className="grid sm:grid-cols-2 gap-3 items-center">
        <Meter label="Thalamocortical drive" value={v.thal / 1.2} color={state.c} right={v.thal.toFixed(2)} />
        <p className="text-sm font-semibold" style={{ color: state.c }}>{state.t}</p>
      </div>
      <p className="text-xs text-muted-foreground">{m.note} Model values are illustrative, not physiological firing rates. Structures: <AtlasLink s="putamen">striatum</AtlasLink>, <AtlasLink s="gpi">GPi</AtlasLink>, <AtlasLink s="stn">STN</AtlasLink>, <AtlasLink s="sn">SN</AtlasLink>.</p>
    </SimCard>
  );
}

function lcg(seed: number) { let s = seed; return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }; }
const TARGETS = (() => { const r = lcg(7); return Array.from({ length: 36 }, () => ({ x: 14 + r() * 272, y: 92 + r() * 96 })); })();
const LINES = [{ x1: 30, x2: 190, y: 20 }, { x1: 90, x2: 280, y: 45 }, { x1: 50, x2: 230, y: 70 }];

export function M4Neglect() {
  const [lesion, setLesion] = useState(true);
  return (
    <SimCard title="Hemispatial neglect" subtitle="Right temporo-parietal damage disrupts the ventral attention network and the balance between hemispheres." cites={['corbetta2002', 'corbetta2011', 'posner1980']}>
      <div className="flex flex-wrap gap-2"><Chip active={!lesion} onClick={() => setLesion(false)}>Healthy observer</Chip><Chip active={lesion} onClick={() => setLesion(true)}>Right-hemisphere lesion</Chip></div>
      <svg viewBox="0 0 300 200" className="w-full max-w-md mx-auto rounded bg-muted/20" role="img" aria-label="Line bisection and cancellation tasks">
        {lesion && <rect x={0} y={0} width={110} height={200} fill={COL.bg} fillOpacity={0.55} />}
        {LINES.map((l, k) => {
          const mid = (l.x1 + l.x2) / 2 + (lesion ? 0.2 * (l.x2 - l.x1) : 0);
          return <g key={k}><line x1={l.x1} y1={l.y} x2={l.x2} y2={l.y} stroke={COL.fg} strokeWidth={2} /><line x1={mid} y1={l.y - 7} x2={mid} y2={l.y + 7} stroke={COL.bad} strokeWidth={2.5} /></g>;
        })}
        {TARGETS.map((t, k) => {
          const hit = !lesion || t.x > 125;
          return <g key={k}><circle cx={t.x} cy={t.y} r={5} fill="none" stroke={COL.fg} strokeWidth={1.5} />{hit && <path d={`M${t.x - 6} ${t.y - 6} L${t.x + 6} ${t.y + 6}`} stroke={COL.bad} strokeWidth={2} />}</g>;
        })}
      </svg>
      <p className="text-xs text-muted-foreground">{lesion ? 'Bisection marks drift right of centre and left-side targets are left uncancelled — not because they are unseen (V1 is intact) but because they fail to capture attention.' : 'Lines bisected at the true midpoint; every target cancelled.'}</p>
      <div className="flex flex-wrap gap-2 text-xs"><AtlasLink s="ipl">Inferior parietal lobule</AtlasLink><span className="text-muted-foreground">·</span><AtlasLink s="spl">Superior parietal (dorsal network)</AtlasLink></div>
      <LabLink href="/methods#rt">Run the Posner cueing task →</LabLink>
    </SimCard>
  );
}
