'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Brain, Grid3x3, Droplets, Layers, X } from 'lucide-react';
import { ATLAS_SECTIONS, structuresInSection, getStructure, formatMni } from '@/lib/data/structures';
import type { GroupInfo } from '@/lib/data/structures';
import { getCitation } from '@/lib/data/citations';
import { PATHWAYS } from '@/lib/data/pathways';
import { devStageAt } from '@/lib/data/methods';
import type { BrainStructure, Pathway, PathwayStage } from '@/lib/data/types';

const BrainViewer = dynamic(() => import('@/components/atlas/brain-viewer'), { ssr: false, loading: () => <div className="h-[60vh] grid place-items-center text-muted-foreground">Loading 3D atlas…</div> });

export default function AtlasClient() {
  const [opacity, setOpacity] = useState(0.3);
  const [grid, setGrid] = useState(true);
  const [csf, setCsf] = useState(true);
  const [dev, setDev] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const [pathway, setPathway] = useState<string>('');
  const [stage, setStage] = useState(0);
  const s = getStructure(selected);
  const pw = PATHWAYS.find((p: Pathway) => p.id === pathway);
  const st: PathwayStage | undefined = pw?.stages?.[stage];
  const ds = devStageAt(dev);

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr_320px]">
      <aside className="panel p-3 max-h-[calc(100vh-8rem)] overflow-y-auto space-y-3">
        <h2 className="font-semibold flex items-center gap-2"><Layers className="h-4 w-4 text-primary" />Structures</h2>
        {ATLAS_SECTIONS.map((sec: GroupInfo) => (
          <div key={sec.id}>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{sec.label}</p>
            <div className="flex flex-wrap gap-1">
              {structuresInSection(sec).map((x: BrainStructure) => (
                <button key={x.id} onClick={() => setSelected(x.id)} className={`text-xs px-2 py-1 rounded-md transition ${selected === x.id ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/70'}`}>{x.abbr ?? x.name}</button>
              ))}
            </div>
          </div>
        ))}
      </aside>
      <section className="panel p-2 relative">
        <BrainViewer opacity={opacity} showGrid={grid} showCsf={csf} showDeep dev={dev} selected={selected} highlight={st?.highlight ?? []} onSelect={setSelected} />
        <div className="absolute left-3 top-3 glass-panel p-3 rounded-lg space-y-2 text-xs w-60">
          <label className="block">X-ray cortical opacity: {opacity.toFixed(2)}<input aria-label="Cortical opacity" type="range" min={0.05} max={1} step={0.01} value={opacity} onChange={(e) => setOpacity(parseFloat(e.target.value))} className="range-neuro w-full" /></label>
          <label className="block">Development: {ds?.label} ({ds?.age})<input aria-label="Development" type="range" min={0} max={1} step={0.01} value={dev} onChange={(e) => setDev(parseFloat(e.target.value))} className="range-neuro w-full" /></label>
          <div className="flex gap-2">
            <button onClick={() => setGrid(!grid)} className={`flex items-center gap-1 px-2 py-1 rounded ${grid ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}><Grid3x3 className="h-3 w-3" />Grid</button>
            <button onClick={() => setCsf(!csf)} className={`flex items-center gap-1 px-2 py-1 rounded ${csf ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}><Droplets className="h-3 w-3" />CSF</button>
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
