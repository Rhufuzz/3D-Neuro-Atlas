import type { ReactNode } from 'react';
import { Radar, Box, Activity, Waves, Crosshair, Timer } from 'lucide-react';
import MethodsRadar from './methods-radar';
import Methods3D from './methods-3d';
import EegLab from './eeg-lab';
import ErpPanel from './erp-panel';
import TuningCurve from './tuning-curve';
import RtLab from './rt-lab';
import TryThis from '@/components/try-this';

const SECTIONS: { id: string; title: string; icon: ReactNode; blurb: string; body: ReactNode }[] = [
  { id: 'compare', title: 'Compare methods', icon: <Radar className="h-4 w-4" />, blurb: 'Spatial vs temporal resolution, invasiveness, cost and causal inference — no single method wins on every axis.', body: <MethodsRadar /> },
  { id: 'in-3d', title: 'Methods on the 3D brain', icon: <Box className="h-4 w-4" />, blurb: 'fMRI contrasts, DTI tractography, TMS and DBS targets and classic lesion cases rendered on the MNI brain.', body: <Methods3D /> },
  { id: 'eeg', title: 'EEG: 10–20 system & rhythms', icon: <Waves className="h-4 w-4" />, blurb: 'Click an electrode to see the cortex beneath it; switch between oscillation bands and sleep stages.', body: <EegLab /> },
  { id: 'erp', title: 'ERPs: N400 & P600', icon: <Activity className="h-4 w-4" />, blurb: 'Averaged brain responses time-locked to a critical word reveal semantic vs syntactic processing.', body: <ErpPanel /> },
  { id: 'single-cell', title: 'Single-cell recording: orientation tuning', icon: <Crosshair className="h-4 w-4" />, blurb: 'Rotate a bar across a V1 receptive field and watch the firing rate follow the tuning curve.', body: <TuningCurve /> },
  { id: 'rt', title: 'Mental chronometry mini-lab', icon: <Timer className="h-4 w-4" />, blurb: 'Measure your own reaction times: Donders’ subtraction method and Posner’s spatial cueing paradigm.', body: <RtLab /> },
];

export default function MethodsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Methods Lab</h1>
        <p className="text-sm text-muted-foreground max-w-3xl">How cognitive neuroscientists measure and manipulate the brain — from millisecond scalp potentials to causal stimulation and lesions. Every simulation here is a simplified teaching model with its primary sources linked.</p>
        <nav className="flex flex-wrap gap-1.5 pt-1" aria-label="Methods lab sections">
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
          <TryThis id={`methods:${s.id}`} />
          {s.body}
        </section>
      ))}
    </div>
  );
}
