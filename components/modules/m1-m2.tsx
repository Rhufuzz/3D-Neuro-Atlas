'use client';

import { useState } from 'react';
import { Chip, SimCard, AtlasLink, LabLink, COL } from './sim-ui';

/* ---------------- Module 1: history timeline + levels of analysis ---------------- */

const EVENTS = [
  { year: 1810, who: 'Gall & Spurzheim', what: 'Phrenology: mental faculties localised to skull “bumps”. Wrong method (no lesion or physiological evidence), but it seeded the idea of cortical localisation.', cites: [] as string[] },
  { year: 1861, who: 'Broca', what: 'Patient Leborgne (“Tan”) lost speech production after a left inferior frontal lesion — the first convincing case of localised language function. Modern MRI of the preserved brains shows the damage extended deeper than Broca’s area itself.', cites: ['dronkers2007'], s: 'broca' },
  { year: 1868, who: 'Donders', what: 'Subtractive method: choice RT − simple RT estimates the duration of a mental stage — the logic later borrowed by PET/fMRI subtraction designs.', cites: ['donders1969'], lab: '/methods#rt' },
  { year: 1874, who: 'Wernicke', what: 'Posterior superior temporal lesions cause fluent but empty speech with poor comprehension; proposed a sensory–motor language circuit (Wernicke–Lichtheim model).', cites: [], s: 'wernicke' },
  { year: 1906, who: 'Golgi & Cajal', what: 'Shared Nobel Prize. Golgi’s silver stain let Cajal argue for the neuron doctrine (discrete cells, polarised signalling) against Golgi’s reticular theory.', cites: [], lab: '/micro#cells' },
  { year: 1937, who: 'Penfield & Boldrey', what: 'Electrical stimulation of the awake human cortex mapped motor and sensory homunculi — causal mapping during epilepsy surgery.', cites: ['penfield1937'], s: 'm1' },
  { year: 1952, who: 'Hodgkin & Huxley', what: 'Voltage-clamp of the squid giant axon gave a quantitative Na⁺/K⁺ conductance model of the action potential.', cites: ['hodgkin1952'], lab: '/micro#action-potential' },
  { year: 1957, who: 'Scoville & Milner', what: 'Bilateral medial temporal resection in H.M. caused dense anterograde amnesia with intact skill learning — memory is not one system.', cites: ['scoville1957'], s: 'hippocampus' },
  { year: 1959, who: 'Hubel & Wiesel', what: 'Single-unit recordings in cat V1 revealed orientation-selective simple and complex cells.', cites: ['hubel1959'], lab: '/methods#single-cell' },
  { year: 1990, who: 'Ogawa et al.', what: 'Blood-oxygenation-level-dependent (BOLD) contrast made non-invasive functional MRI possible.', cites: ['ogawa1990'], lab: '/methods#compare' },
  { year: 1994, who: 'Basser et al.', what: 'Diffusion tensor imaging: water diffusion anisotropy reveals white-matter tract orientation in vivo.', cites: ['basser1994'], lab: '/methods#compare' },
  { year: 2005, who: 'Network era', what: 'From single “centres” to distributed, interacting networks (connectomics, resting-state networks); the localisation debate becomes a question of levels and interactions.', cites: ['gazzaniga2005'] },
];

const LEVELS = [
  { name: 'CNS', scale: '1 m', ex: 'Whole brain + spinal cord', href: '/atlas' },
  { name: 'Systems', scale: '10 cm', ex: 'Visual system, basal-ganglia motor loop', href: '/atlas?s=putamen' },
  { name: 'Maps', scale: '1 cm', ex: 'Retinotopic V1, somatotopic M1', href: '/atlas?s=v1' },
  { name: 'Networks', scale: '1 mm', ex: 'Cortical column, local circuits', href: '/mindmap' },
  { name: 'Neurons', scale: '100 µm', ex: 'Pyramidal cell, Purkinje cell', href: '/micro#cells' },
  { name: 'Synapses', scale: '1 µm', ex: 'Glutamatergic spine synapse', href: '/micro#synapse' },
  { name: 'Molecules', scale: '1 Å', ex: 'Na⁺ channel, NMDA receptor', href: '/micro#ltp' },
];

export function M1History() {
  const [i, setI] = useState(6);
  const e = EVENTS[i];
  const min = EVENTS[0].year, max = EVENTS[EVENTS.length - 1].year;
  return (
    <SimCard title="From phrenology to networks" subtitle="Scrub the timeline of landmark discoveries; each links to the part of the app that simulates it." cites={e.cites}>
      <div className="relative h-8">
        <div className="absolute top-1/2 left-0 right-0 h-px bg-border" />
        {EVENTS.map((ev, k) => (
          <button key={ev.year} type="button" onClick={() => setI(k)} title={`${ev.year} ${ev.who}`}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3 w-3 rounded-full transition-transform"
            style={{ left: `${((ev.year - min) / (max - min)) * 100}%`, background: k === i ? COL.primary : COL.muted, transform: `translate(-50%,-50%) scale(${k === i ? 1.5 : 1})` }} />
        ))}
      </div>
      <input type="range" min={0} max={EVENTS.length - 1} value={i} onChange={(ev) => setI(Number(ev.target.value))} className="range-neuro w-full" aria-label="Timeline event" />
      <div className="rounded-md bg-muted/40 p-3">
        <p className="text-sm"><span className="font-mono text-primary mr-2">{e.year}</span><span className="font-medium">{e.who}</span></p>
        <p className="text-sm text-muted-foreground mt-1">{e.what}</p>
        <div className="flex flex-wrap gap-2 mt-2 text-xs">
          {e.s && <AtlasLink s={e.s}>Show in 3D atlas →</AtlasLink>}
          {e.lab && <LabLink href={e.lab}>Open simulation →</LabLink>}
        </div>
      </div>
    </SimCard>
  );
}

export function M1Levels() {
  const [k, setK] = useState(4);
  return (
    <SimCard title="Levels of analysis" subtitle="Churchland & Sejnowski’s spatial scales — each explanation lives at a level, and methods sample different levels." cites={['churchland1988']}>
      <div className="space-y-1">
        {LEVELS.map((l, j) => (
          <button key={l.name} type="button" onClick={() => setK(j)}
            className={`w-full flex items-center gap-3 rounded px-2 py-1.5 text-left text-sm transition-colors ${j === k ? 'bg-primary/15 text-primary' : 'hover:bg-muted/50'}`}
            style={{ paddingLeft: `${8 + j * 10}px` }}>
            <span className="font-mono text-xs w-14 text-muted-foreground">{l.scale}</span><span className="font-medium">{l.name}</span>
          </button>
        ))}
      </div>
      <div className="rounded-md bg-muted/40 p-3 text-sm flex flex-wrap items-center justify-between gap-2">
        <span><span className="text-muted-foreground">Example: </span>{LEVELS[k].ex}</span>
        <LabLink href={LEVELS[k].href}>Explore →</LabLink>
      </div>
      <p className="text-xs text-muted-foreground">Compare which levels each method can reach on the <a href="/methods#compare" className="text-primary hover:underline">methods radar</a>.</p>
    </SimCard>
  );
}

/* ---------------- Module 2: top-down context, agnosias, Thatcher, rotation ---------------- */

function AmbiguousGlyph({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x},${y})`} stroke={COL.fg} strokeWidth={4} fill="none" strokeLinecap="round">
      <line x1={4} y1={2} x2={4} y2={46} />
      <path d="M12 2 Q34 2 34 13 Q34 24 14 24 Q34 24 34 35 Q34 46 12 46" />
    </g>
  );
}

export function M2Context() {
  const [ctx, setCtx] = useState<'none' | 'letters' | 'numbers'>('none');
  const read = ctx === 'letters' ? 'B' : ctx === 'numbers' ? '13' : '“B” or “13”?';
  const flank = (t: string, x: number, y: number) => <text x={x} y={y} fontSize={40} fill={COL.muted} textAnchor="middle" fontFamily="ui-sans-serif, system-ui">{t}</text>;
  return (
    <SimCard title="Bottom-up vs top-down: the B / 13 figure" subtitle="The centre glyph is physically identical in every condition — only the context changes." cites={['gilbert2013']}>
      <div className="flex flex-wrap gap-2">
        <Chip active={ctx === 'none'} onClick={() => setCtx('none')}>No context</Chip>
        <Chip active={ctx === 'letters'} onClick={() => setCtx('letters')}>A _ C</Chip>
        <Chip active={ctx === 'numbers'} onClick={() => setCtx('numbers')}>12 _ 14</Chip>
      </div>
      <svg viewBox="0 0 240 160" className="w-full max-w-xs mx-auto" role="img" aria-label="Ambiguous glyph in context">
        {ctx === 'letters' && <>{flank('A', 50, 96)}{flank('C', 190, 96)}</>}
        {ctx === 'numbers' && <>{flank('12', 120, 36)}{flank('14', 120, 154)}</>}
        <AmbiguousGlyph x={101} y={56} />
      </svg>
      <p className="text-sm">Most readers see: <span className="font-semibold text-primary">{read}</span></p>
      <p className="text-xs text-muted-foreground">Bottom-up processing builds the percept from features (a vertical bar + two curves). Top-down expectations from context bias which interpretation wins; feedback from higher areas modulates even early visual cortex.</p>
    </SimCard>
  );
}

const AGNOSIAS = [
  { id: 'pros', name: 'Prosopagnosia', s: 'ffa', site: 'Fusiform face area (right > left)', lost: 'Recognising familiar faces (identity), often including one’s own.', kept: 'Recognising people by voice, gait, clothing; recognising objects.', cites: ['kanwisher1997'] },
  { id: 'akin', name: 'Akinetopsia', s: 'mt', site: 'Area MT / V5 (bilateral)', lost: 'Perceiving smooth motion — the world appears as successive frozen snapshots.', kept: 'Colour, form and static object recognition.', cites: ['felleman1991'] },
  { id: 'achrom', name: 'Cerebral achromatopsia', s: 'v4', site: 'V4 complex (ventral occipito-temporal)', lost: 'Colour perception; the world looks in shades of grey despite normal cones.', kept: 'Motion, depth and form.', cites: ['felleman1991'] },
  { id: 'apper', name: 'Apperceptive agnosia', s: 'v2v3', site: 'Lateral occipital / early ventral stream (often diffuse, e.g. CO poisoning)', lost: 'Building a coherent shape percept: cannot copy or match simple shapes.', kept: 'Elementary vision (acuity, colour); patient D.F. still scaled her grasp to object size via the dorsal stream.', cites: ['goodale1992'] },
  { id: 'assoc', name: 'Associative agnosia', s: 'it', site: 'Inferotemporal / anterior ventral stream', lost: 'Linking an intact percept to meaning — can copy a drawing but cannot say what it is.', kept: 'Shape perception and copying; recognition through touch or sound.', cites: ['felleman1991'] },
];

export function M2Agnosia() {
  const [id, setId] = useState('pros');
  const a = AGNOSIAS.find((x) => x.id === id)!;
  return (
    <SimCard title="Visual agnosia explorer" subtitle="Select a lesion — note the double dissociations between ventral-stream specialisations." cites={a.cites}>
      <div className="flex flex-wrap gap-2">{AGNOSIAS.map((x) => <Chip key={x.id} active={x.id === id} onClick={() => setId(x.id)}>{x.name}</Chip>)}</div>
      <dl className="grid gap-2 text-sm">
        <div><dt className="text-xs text-muted-foreground">Lesion site</dt><dd><AtlasLink s={a.s}>{a.site}</AtlasLink></dd></div>
        <div><dt className="text-xs text-destructive">Impaired</dt><dd>{a.lost}</dd></div>
        <div><dt className="text-xs text-success">Preserved</dt><dd>{a.kept}</dd></div>
      </dl>
    </SimCard>
  );
}

function Face({ thatcher, inverted }: { thatcher: boolean; inverted: boolean }) {
  const flip = (cx: number, cy: number) => (thatcher ? `rotate(180 ${cx} ${cy})` : undefined);
  const eye = (cx: number) => (
    <g transform={flip(cx, 62)}>
      <path d={`M${cx - 14} ${50} Q${cx} ${42} ${cx + 14} ${50}`} stroke={COL.fg} strokeWidth={3} fill="none" />
      <ellipse cx={cx} cy={64} rx={11} ry={6} fill={COL.bg} stroke={COL.fg} strokeWidth={2} />
      <circle cx={cx} cy={64} r={4} fill={COL.fg} />
    </g>
  );
  return (
    <svg viewBox="0 0 140 170" className="w-32 h-40" role="img" aria-label="Schematic face">
      <g transform={inverted ? 'rotate(180 70 85)' : undefined} style={{ transition: 'transform .4s' }}>
        <ellipse cx={70} cy={85} rx={52} ry={70} fill={COL.mutedBg} stroke={COL.muted} strokeWidth={2} />
        {eye(48)}{eye(92)}
        <path d="M70 74 L64 100 L74 102" stroke={COL.muted} strokeWidth={2} fill="none" />
        <g transform={flip(70, 124)}>
          <path d="M50 120 Q70 136 90 120" stroke={COL.bad} strokeWidth={4} fill="none" strokeLinecap="round" />
          <path d="M50 120 Q70 126 90 120" stroke={COL.bad} strokeWidth={2} fill="none" />
        </g>
      </g>
    </svg>
  );
}

export function M2Thatcher() {
  const [th, setTh] = useState(true);
  const [inv, setInv] = useState(true);
  return (
    <SimCard title="Thatcher illusion & face inversion" subtitle="Upright faces are processed configurally; inversion disrupts this, so grotesque local changes go unnoticed." cites={['thompson1980', 'yin1969']}>
      <div className="flex flex-wrap gap-2">
        <Chip active={th} onClick={() => setTh(!th)}>Thatcherise eyes + mouth</Chip>
        <Chip active={inv} onClick={() => setInv(!inv)}>Invert face</Chip>
      </div>
      <div className="flex justify-center"><Face thatcher={th} inverted={inv} /></div>
      <p className="text-xs text-muted-foreground">{th && inv ? 'Inverted, the altered face looks fairly normal. Now un-invert it.' : th ? 'Upright, the flipped features look grotesque — configural processing detects the broken relations.' : 'Unaltered face. Inversion alone slows face recognition far more than object recognition (Yin, 1969).'}</p>
    </SimCard>
  );
}

export function M2Rotation() {
  const [deg, setDeg] = useState(120);
  const [mirror, setMirror] = useState(false);
  const rt = 1000 + (Math.min(deg, 360 - deg) / 60) * 1000;
  return (
    <SimCard title="Mental rotation" subtitle="Same or mirror-image? Decision time grows linearly with angular disparity, as if the image were rotated at a constant rate." cites={['shepard1971']}>
      <div className="flex items-center justify-center gap-8">
        <span className="text-5xl font-bold" style={{ color: COL.muted }}>R</span>
        <span className="text-5xl font-bold inline-block text-primary transition-transform" style={{ transform: `rotate(${deg}deg) scaleX(${mirror ? -1 : 1})` }}>R</span>
      </div>
      <input type="range" min={0} max={180} step={10} value={deg} onChange={(e) => setDeg(Number(e.target.value))} className="range-neuro w-full" aria-label="Rotation angle" />
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <Chip active={mirror} onClick={() => setMirror(!mirror)}>Mirror image</Chip>
        <span>Angle {deg}° → illustrative RT ≈ <span className="font-mono text-primary">{(rt / 1000).toFixed(1)} s</span></span>
      </div>
      <p className="text-xs text-muted-foreground">Illustrative slope of ~60°/s for complex 3D block figures (Shepard &amp; Metzler); exact intercept and slope vary by stimulus and observer.</p>
    </SimCard>
  );
}
