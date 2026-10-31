'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Brain, Grid3x3, Droplets, Layers, X, Microscope } from 'lucide-react';
import { useScope } from '@/lib/use-scope';
import type { StreamSpec } from '@/components/atlas/brain-viewer';
import { ATLAS_SECTIONS, structuresInSection, getStructure, formatMni } from '@/lib/data/structures';
import type { GroupInfo } from '@/lib/data/structures';
import { getCitation } from '@/lib/data/citations';
import { PATHWAYS } from '@/lib/data/pathways';
import { PARADIGMS, TRACTS } from '@/lib/data/imaging';
import { devStageAt } from '@/lib/data/methods';
import type { BrainStructure, Pathway, PathwayStage } from '@/lib/data/types';

const BrainViewer = dynamic(() => import('@/components/atlas/brain-viewer'), { ssr: false, loading: () => <div className="h-[60vh] grid place-items-center text-muted-foreground">Loading 3D atlas…</div> });

export default function AtlasClient({ initial = null }: { initial?: string | null }) {
  const { isIn, scope } = useScope();
  const [opacity, setOpacity] = useState(0.3);
  const [grid, setGrid] = useState(true);
  const [csf, setCsf] = useState(true);
  const [dev, setDev] = useState(1);
  const [selected, setSelected] = useState<string | null>(initial);
  const [pathway, setPathway] = useState<string>('');
  const [stage, setStage] = useState(0);
  const [para, setPara] = useState<string>('');
  const [dtiOn, setDtiOn] = useState(false);
  const s = getStructure(selected);
  const pw = PATHWAYS.find((p: Pathway) => p.id === pathway);
  const st: PathwayStage | undefined = pw?.stages?.[stage];
  const ds = devStageAt(dev);
  const streams = useMemo<StreamSpec[]>(() => (st && pw ? [{ paths: st.paths ?? [], color: st.color ?? pw.color, bilateral: st.bilateral }] : []), [st, pw]);
  const pd = PARADIGMS.find((x) => x.id === para);
  const bold = useMemo(() => (pd ? { color: pd.color, clusters: pd.clusters } : null), [pd]);
  const dti = useMemo(() => (dtiOn ? TRACTS.map((t) => ({ color: t.color, paths: t.paths, bilateral: t.bilateral })) : null), [dtiOn]);

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr_320px]">
      <aside className="panel p-3 max-h-[calc(100vh-8rem)] overflow-y-auto space-y-3">
        <h2 className="font-semibold flex items-center gap-2"><Layers className="h-4 w-4 text-primary" />Structures</h2>
        <p className="text-[11px] text-muted-foreground">Showing structures taught in {scope === 'partial' ? 'Weeks 1–7 (Partial)' : 'Weeks 1–11 (Final)'}.</p>
        {ATLAS_SECTIONS.map((sec: GroupInfo) => ({ sec, items: structuresInSection(sec).filter((x: BrainStructure) => isIn(x.weeks)) })).filter((g) => g.items.length > 0).map(({ sec, items }) => (
          <div key={sec.id}>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{sec.label}</p>
            <div className="flex flex-wrap gap-1">
              {items.map((x: BrainStructure) => (
                <button key={x.id} onClick={() => setSelected(x.id)} className={`text-xs px-2 py-1 rounded-md transition ${selected === x.id ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/70'}`}>{x.abbr ?? x.name}</button>
              ))}
            </div>
          </div>
        ))}
      </aside>
      <section className="panel p-2 relative">
        <BrainViewer opacity={opacity} showGrid={grid} showCsf={csf} showDeep dev={dev} selected={selected} highlight={st?.highlight ?? []} streams={streams} bold={bold} dti={dti} onSelect={setSelected} />
        <Link href="/micro" className="absolute right-3 top-3 glass-panel px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 hover:text-primary"><Microscope className="h-3.5 w-3.5 text-primary" />Zoom to Micro-Scale</Link>
        <div className="absolute left-3 top-3 glass-panel p-3 rounded-lg space-y-2 text-xs w-60">
          <label className="block">X-ray cortical opacity: {opacity.toFixed(2)}<input aria-label="Cortical opacity" type="range" min={0.05} max={1} step={0.01} value={opacity} onChange={(e) => setOpacity(parseFloat(e.target.value))} className="range-neuro w-full" /></label>
          <label className="block">Development: {ds?.label} ({ds?.age})<input aria-label="Development" type="range" min={0} max={1} step={0.01} value={dev} onChange={(e) => setDev(parseFloat(e.target.value))} className="range-neuro w-full" /></label>
          <div className="flex gap-2">
            <button onClick={() => setGrid(!grid)} className={`flex items-center gap-1 px-2 py-1 rounded ${grid ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}><Grid3x3 className="h-3 w-3" />Grid</button>
            <button onClick={() => setCsf(!csf)} className={`flex items-center gap-1 px-2 py-1 rounded ${csf ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}><Droplets className="h-3 w-3" />CSF</button>
          </div>
          <div className="pt-1 border-t border-border/50 space-y-1.5">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">fMRI overlay (BOLD)</p>
            <div className="flex flex-wrap gap-1">
              <button onClick={() => setPara('')} className={`text-[11px] px-1.5 py-0.5 rounded ${!para ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/70'}`}>None</button>
              {PARADIGMS.map((x) => (
                <button key={x.id} onClick={() => setPara(x.id === para ? '' : x.id)} title={x.desc} className={`text-[11px] px-1.5 py-0.5 rounded ${para === x.id ? 'text-white' : 'bg-muted hover:bg-muted/70'}`} style={para === x.id ? { background: x.color } : undefined}>{x.name}</button>
              ))}
            </div>
            <button onClick={() => setDtiOn(!dtiOn)} className={`text-[11px] px-2 py-0.5 rounded ${dtiOn ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/70'}`}>DTI bundles {dtiOn ? 'on' : 'off'}</button>
            {(pd || dtiOn) && <p className="text-[10px] text-muted-foreground">{pd ? pd.desc : 'Five major white-matter bundles — schematic courses, not tractography.'} {pd && <span className="text-muted-foreground">(BOLD blobs are illustrative, not real data.)</span>}</p>}
          </div>
          {dev < 1 && <p className="text-muted-foreground">{ds?.text}</p>}
        </div>
      </section>
      <aside className="panel p-4 space-y-4 max-h-[calc(100vh-8rem)] overflow-y-auto">
        <div>
          <h2 className="font-semibold flex items-center gap-2 mb-2"><Brain className="h-4 w-4 text-primary" />Meso-scale pathways</h2>
          <select aria-label="Pathway" value={pathway} onChange={(e) => { setPathway(e.target.value); setStage(0); }} className="w-full bg-muted rounded p-2 text-sm">
            <option value="">None</option>
            {PATHWAYS.map((p: Pathway) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          {pw && (
            <div className="mt-2 space-y-2 text-sm">
              <div className="flex flex-wrap gap-1">{(pw?.stages ?? []).map((x: PathwayStage, i: number) => <button key={i} onClick={() => setStage(i)} className={`text-xs px-2 py-1 rounded ${i === stage ? 'bg-secondary text-secondary-foreground' : 'bg-muted'}`}>{i + 1}</button>)}</div>
              <p className="font-medium">{st?.title}</p>
              <p className="text-muted-foreground">{st?.text}</p>
            </div>
          )}
        </div>
        {s ? (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-start"><h3 className="text-lg font-semibold glow-text">{s.name}</h3><button aria-label="Clear selection" onClick={() => setSelected(null)}><X className="h-4 w-4" /></button></div>
            <p className="text-xs text-muted-foreground">MNI {formatMni(s.mni)}{s.brodmann ? ` · BA ${s.brodmann}` : ''} · Weeks {(s.weeks ?? []).join(', ')}</p>
            <p>{s.description}</p>
            <ul className="list-disc pl-4 text-muted-foreground">{(s.functions ?? []).map((f: string) => <li key={f}>{f}</li>)}</ul>
            <p><span className="text-warning font-medium">Clinical: </span>{s.clinical}</p>
            {(s.citations ?? []).map((c: string) => { const ci = getCitation(c); return ci ? <a key={c} href={`https://doi.org/${ci.doi}`} target="_blank" rel="noreferrer" className="block text-xs text-primary hover:underline">{ci.authors} ({ci.year})</a> : null; })}
          </div>
        ) : <p className="text-sm text-muted-foreground">Click a structure in the 3D view or the list to inspect it.</p>}
      </aside>
    </div>
  );
}
