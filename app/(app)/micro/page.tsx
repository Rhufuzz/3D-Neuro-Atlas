'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Zap, Cable, Microscope, FlaskConical, Sparkles, ArrowLeft, Orbit } from 'lucide-react';
import dynamic from 'next/dynamic';
import HhSim from './hh-sim';
import Conduction from './conduction';
import CellExplorer from './cell-explorer';
import SynapseSim from './synapse-sim';
import LtpSteps from './ltp-steps';

const ZoomScene = dynamic(() => import('./zoom-scene'), {
  ssr: false,
  loading: () => <div className="h-[420px] grid place-items-center text-muted-foreground text-sm">Loading zoom scene…</div>,
});

const SECTIONS: { id: string; title: string; icon: ReactNode; blurb: string; body: ReactNode }[] = [
  {
    id: 'zoom', title: 'Zoom through scales', icon: <Orbit className="h-4 w-4" />,
    blurb: 'A continuous 3D dive from the whole brain down to single ion channels — scroll (or drag the slider) to move between scales. Metaphor, not measurement: the quantitative models are the sections below.',
    body: <ZoomScene />,
  },
  { id: 'cells', title: 'Neurons & glia', icon: <Microscope className="h-4 w-4" />, blurb: 'The cast of cells that make up the tissue you saw in the atlas — and what each one does.', body: <CellExplorer /> },
  { id: 'action-potential', title: 'Action potential (Hodgkin–Huxley)', icon: <Zap className="h-4 w-4" />, blurb: 'Inject current into a simulated squid axon membrane and watch Na⁺ and K⁺ gates produce an all-or-none spike, refractoriness and rate coding.', body: <HhSim /> },
  { id: 'conduction', title: 'Conduction & myelin', icon: <Cable className="h-4 w-4" />, blurb: 'Continuous vs saltatory propagation, and what demyelination does to it.', body: <Conduction /> },
  { id: 'synapse', title: 'Synapses, transmitters & drugs', icon: <FlaskConical className="h-4 w-4" />, blurb: 'Six key neurotransmitter systems, then a cleft model showing how drugs change release, reuptake and receptor action.', body: <SynapseSim /> },
  { id: 'ltp', title: 'Long-term potentiation', icon: <Sparkles className="h-4 w-4" />, blurb: 'Step through NMDA-dependent LTP at the CA3→CA1 synapse — the cellular basis of memory covered in Week 9.', body: <LtpSteps /> },
];

export default function MicroPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Link href="/atlas" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"><ArrowLeft className="h-3.5 w-3.5" />Back to the 3D atlas</Link>
        <h1 className="text-2xl font-bold">Micro-Scale Lab</h1>
        <p className="text-sm text-muted-foreground max-w-3xl">Zoom from brain regions down to cells, membranes and synapses. These are interactive 2D teaching models (SVG and numerical simulation), each linked to its primary sources.</p>
        <div className="flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground pt-1" aria-label="Scale">
          {['Brain ≈ 15 cm', 'Neuron ≈ 20 µm soma', 'Synaptic cleft ≈ 20 nm', 'Ion channel ≈ 1 nm'].map((s, i) => (
            <span key={s} className="inline-flex items-center gap-1">{i > 0 && <span className="text-primary">›</span>}<span className="px-2 py-0.5 rounded bg-muted/50">{s}</span></span>
          ))}
        </div>
        <nav className="flex flex-wrap gap-1.5 pt-1" aria-label="Micro-scale lab sections">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="text-xs px-2.5 py-1 rounded-full bg-muted/60 text-muted-foreground hover:text-primary hover:bg-primary/10 inline-flex items-center gap-1.5">{s.icon}{s.title}</a>
          ))}
        </nav>
      </div>
      {SECTIONS.map((s) => (
        <section key={s.id} id={s.id} className="glass-panel rounded-xl p-4 md:p-5 space-y-4 scroll-mt-20">
          <div>
            <h2 className="font-semibold flex items-center gap-2 text-lg"><span className="text-primary">{s.icon}</span>{s.title}</h2>
            <p className="text-sm text-muted-foreground">{s.blurb}</p>
          </div>
          {s.body}
        </section>
      ))}
    </div>
  );
}
