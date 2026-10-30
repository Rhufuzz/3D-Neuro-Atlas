'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Box } from 'lucide-react';
import { FMRI_CONTRASTS, DTI_TRACTS, TMS_TARGETS, DBS_TARGETS, LESION_CASES } from '@/lib/data/methods-lab';
import type { StreamSpec } from '@/components/atlas/brain-viewer';
import CiteChips from '@/components/cite-chips';

const BrainViewer = dynamic(() => import('@/components/atlas/brain-viewer'), {
  ssr: false,
  loading: () => <div className="h-[380px] md:h-[460px] rounded-lg bg-muted/30 animate-pulse" />,
});

type Tab = 'fmri' | 'dti' | 'tms' | 'dbs' | 'lesion';
interface Item { id: string; label: string; text: string; highlight: string[]; focus: string | null; citations: string[]; streams?: StreamSpec[]; color?: string }

const TABS: { id: Tab; label: string; hint: string; items: Item[] }[] = [
  { id: 'fmri', label: 'fMRI contrasts', hint: 'Glowing regions = voxels where condition A > condition B (BOLD).', items: FMRI_CONTRASTS.map((c) => ({ ...c })) },
  { id: 'dti', label: 'DTI tracts', hint: 'Particles flow along schematic streamlines reconstructed from water diffusion.', items: DTI_TRACTS.map((t) => ({ id: t.id, label: t.label, text: t.text, highlight: t.highlight, focus: null, citations: t.citations, color: t.color, streams: [{ paths: t.paths, color: t.color, bilateral: t.bilateral }] })) },
  { id: 'tms', label: 'TMS targets', hint: 'Coil target = transiently disrupted (or excited) cortex.', items: TMS_TARGETS.map((c) => ({ ...c })) },
  { id: 'dbs', label: 'DBS targets', hint: 'Electrode target nucleus for chronic high-frequency stimulation.', items: DBS_TARGETS.map((c) => ({ ...c })) },
  { id: 'lesion', label: 'Lesion cases', hint: 'Damaged tissue and the deficit it revealed.', items: LESION_CASES.map((c) => ({ ...c })) },
];

export default function Methods3D() {
  const [tab, setTab] = useState<Tab>('fmri');
  const [pick, setPick] = useState<Record<Tab, number>>({ fmri: 0, dti: 0, tms: 0, dbs: 0, lesion: 0 });
  const t = TABS.find((x) => x.id === tab) ?? TABS[0];
  const item = t.items[pick[tab]] ?? t.items[0];
  const streams = useMemo(() => item.streams ?? [], [item]);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <div className="space-y-2 min-w-0">
        <div className="flex gap-1 overflow-x-auto pb-1" role="tablist">
          {TABS.map((x) => (
            <button key={x.id} role="tab" aria-selected={tab === x.id} onClick={() => setTab(x.id)}
              className={`text-xs px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${tab === x.id ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
              {x.label}
            </button>
          ))}
        </div>
        <div className="panel rounded-lg p-1 relative">
          <BrainViewer opacity={tab === 'dti' ? 0.18 : 0.32} showGrid={false} showCsf={false} showDeep dev={1}
            selected={item.focus} highlight={item.highlight} streams={streams} autoOrbit={tab !== 'dti'} compact heightClass="h-[380px] md:h-[460px]" />
          <span className="absolute left-3 bottom-3 text-[11px] text-muted-foreground bg-background/70 px-2 py-0.5 rounded">{t.hint}</span>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex flex-col gap-1">
          {t.items.map((it, i) => (
            <button key={it.id} onClick={() => setPick((p) => ({ ...p, [tab]: i }))}
              className={`text-left text-sm px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${item.id === it.id ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}>
              {it.color && <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: it.color }} />}
              {it.label}
            </button>
          ))}
        </div>
        <article className="panel rounded-lg p-4 space-y-2">
          <h3 className="font-semibold text-primary">{item.label}</h3>
          <p className="text-sm text-muted-foreground">{item.text}</p>
          <CiteChips ids={item.citations} />
          {(item.focus ?? item.highlight[0]) && (
            <Link href={`/atlas?s=${item.focus ?? item.highlight[0]}`} className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline">
              <Box className="h-3.5 w-3.5" />Open in full atlas
            </Link>
          )}
        </article>
      </div>
    </div>
  );
}
