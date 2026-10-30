'use client';

import { useEffect, useRef, useState } from 'react';
import { Chip, SimCard, AtlasLink, LabLink, COL } from './sim-ui';

/* ---------------- Module 5: aphasia classifier + word superiority ---------------- */

const APHASIA: Record<string, { name: string; s: string; site: string; speech: string; cites: string[] }> = {
  NCr: { name: 'Broca’s aphasia', s: 'broca', site: 'Left inferior frontal gyrus plus underlying white matter and insula', speech: '“Cookie… jar… uh… boy… fall… mother… water.” Effortful, telegraphic, agrammatic.', cites: ['dronkers2007'] },
  NCR: { name: 'Transcortical motor', s: 'premotor', site: 'Left frontal cortex anterior/superior to Broca’s area (incl. SMA)', speech: 'Little spontaneous speech (“Boy… cookie”), yet repeats long sentences word-perfectly.', cites: [] },
  Ncr: { name: 'Global aphasia', s: 'insula', site: 'Large left perisylvian (MCA territory) lesion', speech: '“Ba… ba… no.” Stereotyped utterances; comprehension and repetition both lost.', cites: [] },
  NcR: { name: 'Mixed transcortical', s: 'ag', site: 'Watershed zones isolating an intact perisylvian loop', speech: 'Examiner: “What is happening here?” — Patient: “What is happening here.” (echolalia)', cites: [] },
  FCr: { name: 'Conduction aphasia', s: 'smg', site: 'Supramarginal gyrus / arcuate fasciculus (dorsal stream, area Spt)', speech: '“The boy is on the stool getting a… a cooper… a coopie… a cookie.” Phonemic errors with self-correction attempts.', cites: ['catani2005', 'hickok2007'] },
  FCR: { name: 'Anomic aphasia', s: 'atl', site: 'Variable: angular gyrus, inferior/anterior temporal cortex', speech: '“The boy is getting the… you know, the thing you keep sweets in…” Fluent with word-finding pauses and circumlocution.', cites: [] },
  Fcr: { name: 'Wernicke’s aphasia', s: 'wernicke', site: 'Left posterior superior temporal gyrus', speech: '“Well the mother is over there doing her working to get it better, and the boy is up on the tooken thing for the…” Fluent, paraphasic, little content.', cites: ['hickok2007'] },
  FcR: { name: 'Transcortical sensory', s: 'ag', site: 'Left temporo-occipito-parietal junction sparing the perisylvian loop', speech: 'Fluent speech with semantic errors; repeats sentences it does not understand.', cites: [] },
};

function Row({ label, v, set, yes, no }: { label: string; v: boolean; set: (b: boolean) => void; yes: string; no: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm"><span className="w-28 text-muted-foreground">{label}</span><Chip active={v} onClick={() => set(true)}>{yes}</Chip><Chip active={!v} onClick={() => set(false)}>{no}</Chip></div>
  );
}

export function M5Aphasia() {
  const [f, setF] = useState(false);
  const [c, setC] = useState(true);
  const [r, setR] = useState(false);
  const a = APHASIA[`${f ? 'F' : 'N'}${c ? 'C' : 'c'}${r ? 'R' : 'r'}`];
  return (
    <SimCard title="Aphasia classifier" subtitle="The classic bedside triad — fluency, comprehension, repetition — yields eight syndromes." cites={a.cites}>
      <div className="space-y-2">
        <Row label="Fluency" v={f} set={setF} yes="Fluent" no="Non-fluent" />
        <Row label="Comprehension" v={c} set={setC} yes="Good" no="Poor" />
        <Row label="Repetition" v={r} set={setR} yes="Good" no="Poor" />
      </div>
      <div className="rounded-md bg-muted/40 p-3 space-y-1">
        <p className="font-semibold text-primary">{a.name}</p>
        <p className="text-sm italic">{a.speech}</p>
        <p className="text-xs"><span className="text-muted-foreground">Typical lesion: </span><AtlasLink s={a.s}>{a.site}</AtlasLink></p>
      </div>
      <p className="text-xs text-muted-foreground">Sample speech: describing the “Cookie Theft” picture (illustrative). The Wernicke–Lichtheim model links syndromes to centres and the arcuate fasciculus; the dual-stream model reframes them as damage to a ventral sound-to-meaning stream (bilateral temporal) versus a left-dominant dorsal sound-to-articulation stream.</p>
    </SimCard>
  );
}

type Cond = 'word' | 'nonword' | 'letter';
const PAIRS = [['WOR', 'D', 'K'], ['FOR', 'D', 'K'], ['COR', 'D', 'K']];
const SCR: Record<string, string> = { WOR: 'ORW', FOR: 'ORF', COR: 'ORC' };
const CONDS: Cond[] = ['word', 'nonword', 'letter'];

export function M5WordSuperiority() {
  const [ms, setMs] = useState(50);
  const [phase, setPhase] = useState<'idle' | 'stim' | 'probe'>('idle');
  const [trial, setTrial] = useState(0);
  const [score, setScore] = useState<Record<Cond, { n: number; ok: number }>>({ word: { n: 0, ok: 0 }, nonword: { n: 0, ok: 0 }, letter: { n: 0, ok: 0 } });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const cond = CONDS[trial % 3];
  const pair = PAIRS[Math.floor(trial / 3) % PAIRS.length];
  const target = (trial * 7 + 3) % 5 < 2 ? pair[1] : pair[2];
  const stim = cond === 'word' ? pair[0] + target : cond === 'nonword' ? SCR[pair[0]] + target : '   ' + target;
  const flash = () => {
    setPhase('stim');
    timer.current = setTimeout(() => setPhase('probe'), ms);
  };
  const answer = (l: string) => {
    setScore((s) => ({ ...s, [cond]: { n: s[cond].n + 1, ok: s[cond].ok + (l === target ? 1 : 0) } }));
    setTrial((t) => t + 1);
    setPhase('idle');
  };
  const pct = (k: Cond) => (score[k].n ? `${Math.round((100 * score[k].ok) / score[k].n)}% (${score[k].n})` : '—');
  return (
    <SimCard title="Word-superiority effect (Reicher–Wheeler)" subtitle="A letter is identified better inside a word than in a non-word or alone — even when both choices make a word." cites={['reicher1969', 'mcclelland1981']}>
      <div className="h-20 rounded-md bg-muted/40 flex items-center justify-center font-mono text-3xl tracking-[0.3em]">
        {phase === 'stim' ? stim : phase === 'probe' ? '####' : <span className="text-sm tracking-normal text-muted-foreground">Trial {trial + 1} · {cond}</span>}
      </div>
      {phase === 'probe' ? (
        <div className="flex items-center justify-center gap-3 text-sm"><span className="text-muted-foreground">Last letter was:</span><Chip onClick={() => answer(pair[1])}>{pair[1]}</Chip><Chip onClick={() => answer(pair[2])}>{pair[2]}</Chip></div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={flash} disabled={phase !== 'idle'} className="text-xs px-3 py-1.5 rounded-full bg-primary text-primary-foreground disabled:opacity-50">Flash stimulus</button>
          <label className="text-xs text-muted-foreground flex-1 min-w-[160px]">Exposure {ms} ms<input type="range" min={20} max={200} step={10} value={ms} onChange={(e) => setMs(Number(e.target.value))} className="range-neuro w-full" aria-label="Exposure" /></label>
        </div>
      )}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        {CONDS.map((k) => <div key={k} className="rounded bg-muted/40 p-2"><p className="text-muted-foreground capitalize">{k}</p><p className="font-mono text-primary">{pct(k)}</p></div>)}
      </div>
      <p className="text-xs text-muted-foreground">Your own accuracy (screen refresh limits very short exposures). The interactive-activation model explains the effect via top-down feedback from word units to letter units. For sentence-level ERPs (N400 semantic, P600 syntactic) see the <a href="/methods#erp" className="text-primary hover:underline">ERP lab</a>.</p>
    </SimCard>
  );
}

/* ---------------- Module 6: memory systems, DRM, RPE, context ---------------- */

const MEM = [
  { id: 'epi', group: 'Declarative', name: 'Episodic', s: 'hippocampus', ex: 'Remembering your last birthday', hm: false, note: 'Hippocampus + MTL bind events in context; H.M. could not form new episodes.' },
  { id: 'sem', group: 'Declarative', name: 'Semantic', s: 'atl', ex: 'Paris is the capital of France', hm: false, note: 'New facts depend on the MTL; established knowledge is stored in neocortex with an anterior-temporal hub (hub-and-spoke).' },
  { id: 'proc', group: 'Nondeclarative', name: 'Procedural skills & habits', s: 'putamen', ex: 'Riding a bike, mirror tracing', hm: true, note: 'Striatum and cerebellum; H.M. improved at mirror tracing without remembering the sessions.' },
  { id: 'prime', group: 'Nondeclarative', name: 'Priming', s: 'v2v3', ex: 'Faster word-stem completion after exposure', hm: true, note: 'Neocortical perceptual/conceptual representations become more fluent.' },
  { id: 'cond', group: 'Nondeclarative', name: 'Classical conditioning', s: 'cerebellum', ex: 'Eyeblink to a tone; fear to a context', hm: true, note: 'Skeletal responses: cerebellum. Emotional responses: amygdala.' },
  { id: 'nonassoc', group: 'Nondeclarative', name: 'Non-associative', s: 'spinal', ex: 'Habituation to a ticking clock', hm: true, note: 'Habituation and sensitisation in reflex pathways.' },
];

export function M6Systems() {
  const [sel, setSel] = useState('epi');
  const [hm, setHm] = useState(false);
  const cur = MEM.find((m) => m.id === sel)!;
  return (
    <SimCard title="Long-term memory systems" subtitle="Squire’s taxonomy — toggle H.M.’s profile to see the declarative/nondeclarative dissociation." cites={['squire2004', 'scoville1957', 'patterson2007', 'lambonralph2017']}>
      <Chip active={hm} onClick={() => setHm(!hm)}>Overlay patient H.M. (new learning)</Chip>
      <div className="grid sm:grid-cols-2 gap-3">
        {['Declarative', 'Nondeclarative'].map((g) => (
          <div key={g} className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground">{g} {g === 'Declarative' ? '(explicit — MTL/diencephalon)' : '(implicit)'}</p>
            {MEM.filter((m) => m.group === g).map((m) => (
              <button key={m.id} type="button" onClick={() => setSel(m.id)}
                className={`w-full text-left text-sm rounded px-2 py-1.5 border transition-colors ${m.id === sel ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/60'}`}
                style={hm ? { borderLeft: `4px solid ${m.hm ? COL.ok : COL.bad}` } : undefined}>
                {m.name}{hm && <span className="text-[10px] ml-2" style={{ color: m.hm ? COL.ok : COL.bad }}>{m.hm ? 'spared' : 'impaired'}</span>}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="rounded-md bg-muted/40 p-3 text-sm space-y-1">
        <p><span className="text-muted-foreground">Example: </span>{cur.ex}</p>
        <p className="text-xs text-muted-foreground">{cur.note}</p>
        <p className="text-xs"><AtlasLink s={cur.s}>Key structure in 3D →</AtlasLink></p>
      </div>
    </SimCard>
  );
}

const DRM_LIST = ['bed', 'rest', 'awake', 'tired', 'dream', 'wake', 'snooze', 'blanket', 'doze', 'slumber', 'snore', 'nap', 'peace', 'yawn', 'drowsy'];
const DRM_TEST: { w: string; kind: 'studied' | 'lure' | 'new' }[] = [
  { w: 'dream', kind: 'studied' }, { w: 'chair', kind: 'new' }, { w: 'sleep', kind: 'lure' }, { w: 'snore', kind: 'studied' },
  { w: 'butter', kind: 'new' }, { w: 'blanket', kind: 'studied' }, { w: 'river', kind: 'new' }, { w: 'rest', kind: 'studied' },
];

export function M6Drm() {
  const [phase, setPhase] = useState<'ready' | 'study' | 'test' | 'done'>('ready');
  const [idx, setIdx] = useState(0);
  const [ans, setAns] = useState<boolean[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);
  useEffect(() => {
    if (phase === 'study' && idx >= DRM_LIST.length) {
      if (timer.current) clearInterval(timer.current);
      setPhase('test');
    }
  }, [phase, idx]);
  const start = () => {
    setPhase('study'); setIdx(0); setAns([]);
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => setIdx((i) => i + 1), 900);
  };
  const respond = (old: boolean) => {
    const next = [...ans, old];
    setAns(next);
    if (next.length >= DRM_TEST.length) setPhase('done');
  };
  const tally = (k: string) => { const items = DRM_TEST.map((t, i) => ({ ...t, a: ans[i] })).filter((t) => t.kind === k); return `${items.filter((t) => t.a).length}/${items.length}`; };
  const lureOld = ans[DRM_TEST.findIndex((t) => t.kind === 'lure')];
  return (
    <SimCard title="False memory: the DRM paradigm" subtitle="Study a list of associates, then decide which test words were on it." cites={['roediger1995']}>
      <div className="h-20 rounded-md bg-muted/40 flex items-center justify-center text-2xl font-medium">
        {phase === 'ready' && <span className="text-sm text-muted-foreground">15 words, ~1 s each</span>}
        {phase === 'study' && <span>{DRM_LIST[idx]}</span>}
        {phase === 'test' && <span className="text-primary">{DRM_TEST[ans.length].w}</span>}
        {phase === 'done' && <span className="text-sm">Lure “sleep”: <span style={{ color: lureOld ? COL.bad : COL.ok }}>{lureOld ? 'falsely remembered' : 'correctly rejected'}</span></span>}
      </div>
      {phase === 'test' && <div className="flex justify-center gap-3"><Chip onClick={() => respond(true)}>Old (studied)</Chip><Chip onClick={() => respond(false)}>New</Chip></div>}
      {phase === 'done' && (
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded bg-muted/40 p-2"><p className="text-muted-foreground">Hits</p><p className="font-mono">{tally('studied')}</p></div>
          <div className="rounded bg-muted/40 p-2"><p className="text-muted-foreground">Critical lure “old”</p><p className="font-mono">{tally('lure')}</p></div>
          <div className="rounded bg-muted/40 p-2"><p className="text-muted-foreground">Unrelated “old”</p><p className="font-mono">{tally('new')}</p></div>
        </div>
      )}
      {(phase === 'ready' || phase === 'done') && <button type="button" onClick={start} className="text-xs px-3 py-1.5 rounded-full bg-primary text-primary-foreground">{phase === 'done' ? 'Run again' : 'Start study list'}</button>}
      <p className="text-xs text-muted-foreground">“Sleep” was never shown. Spreading activation from 15 associates makes the lure feel familiar, and source monitoring fails — memory is reconstructive.</p>
    </SimCard>
  );
}

function lcg(seed: number) { let s = seed; return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }; }
type RpeCase = 'before' | 'after' | 'omit';
const RPE: Record<RpeCase, { label: string; cs: number; us: number; text: string }> = {
  before: { label: 'Before learning', cs: 0, us: 1, text: 'Unpredicted reward → positive prediction error at the reward (δ = r − 0 > 0).' },
  after: { label: 'After learning', cs: 1, us: 0, text: 'The cue now predicts reward: the burst transfers to the CS; the fully predicted reward evokes no change (δ = 0).' },
  omit: { label: 'Reward omitted', cs: 1, us: -1, text: 'Expected reward fails to arrive → firing dips below baseline at the expected time (δ < 0).' },
};
function raster(c: RpeCase) {
  const r = lcg(c === 'before' ? 11 : c === 'after' ? 23 : 37);
  const { cs, us } = RPE[c];
  return Array.from({ length: 8 }, () => {
    const sp: number[] = [];
    for (let t = 0; t < 2; t += 0.01) {
      let rate = 5;
      if (t > 0.55 && t < 0.7) rate += cs * 40;
      if (t > 1.55 && t < 1.75) rate = us >= 0 ? rate + us * 40 : 0.3;
      if (r() < rate * 0.01) sp.push(t);
    }
    return sp;
  });
}
const RASTERS: Record<RpeCase, number[][]> = { before: raster('before'), after: raster('after'), omit: raster('omit') };

export function M6Rpe() {
  const [c, setC] = useState<RpeCase>('before');
  const rows = RASTERS[c];
  const X = (t: number) => 20 + t * 135;
  return (
    <SimCard title="Dopamine reward-prediction error" subtitle="Midbrain dopamine neurons signal the difference between received and expected reward." cites={['schultz1997']}>
      <div className="flex flex-wrap gap-2">{(Object.keys(RPE) as RpeCase[]).map((k) => <Chip key={k} active={k === c} onClick={() => setC(k)}>{RPE[k].label}</Chip>)}</div>
      <svg viewBox="0 0 300 140" className="w-full" role="img" aria-label="Dopamine neuron spike raster">
        <line x1={X(0.5)} y1={8} x2={X(0.5)} y2={118} stroke={COL.primary} strokeDasharray="3 3" /><text x={X(0.5)} y={132} fontSize={9} textAnchor="middle" fill={COL.primary}>CS (cue)</text>
        <line x1={X(1.5)} y1={8} x2={X(1.5)} y2={118} stroke={COL.warn} strokeDasharray="3 3" /><text x={X(1.5)} y={132} fontSize={9} textAnchor="middle" fill={COL.warn}>{c === 'omit' ? 'no reward' : 'reward'}</text>
        {rows.map((sp, i) => sp.map((t, j) => <line key={`${i}-${j}`} x1={X(t)} x2={X(t)} y1={12 + i * 13} y2={21 + i * 13} stroke={COL.fg} strokeWidth={1.2} />))}
      </svg>
      <p className="text-xs text-muted-foreground">{RPE[c].text} Simulated raster (8 trials). This teaching signal underlies reinforcement learning in the striatum.</p>
      <AtlasLink s="vta">VTA / SNc in 3D →</AtlasLink>
    </SimCard>
  );
}

export function M6Context() {
  const [learn, setLearn] = useState<'land' | 'water'>('water');
  const [test, setTest] = useState<'land' | 'water'>('land');
  const match = learn === test;
  return (
    <SimCard title="Encoding specificity" subtitle="Divers learned word lists on land or underwater and recalled them in the same or the other context." cites={['godden1975', 'tulving1973']}>
      <div className="grid grid-cols-[auto_1fr_1fr] gap-1 text-xs text-center">
        <span /><span className="text-muted-foreground">Recall: land</span><span className="text-muted-foreground">Recall: water</span>
        {(['land', 'water'] as const).map((l) => (
          <div key={l} className="contents">
            <span className="text-muted-foreground text-left pr-2 self-center">Learn: {l}</span>
            {(['land', 'water'] as const).map((t) => (
              <button key={t} type="button" onClick={() => { setLearn(l); setTest(t); }}
                className={`rounded p-2 border transition-colors ${learn === l && test === t ? 'border-primary' : 'border-transparent'}`}
                style={{ background: l === t ? 'hsl(var(--success) / 0.18)' : 'hsl(var(--destructive) / 0.12)' }}>
                {l === t ? 'higher recall' : 'lower recall'}
              </button>
            ))}
          </div>
        ))}
      </div>
      <p className="text-sm">{match ? 'Context match: cues present at encoding are reinstated at retrieval, so recall is better.' : 'Context mismatch: the retrieval cues stored with the words are missing, so recall drops.'}</p>
      <p className="text-xs text-muted-foreground">Tulving &amp; Thomson’s principle: a cue helps only if it was encoded with the memory. Recognition (familiarity) is less context-dependent than free recall — cf. dual-process models.</p>
      <LabLink href="/study">Test yourself on Module 6 →</LabLink>
    </SimCard>
  );
}
