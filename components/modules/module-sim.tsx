import type { ComponentType } from 'react';
import Link from 'next/link';
import { FlaskConical } from 'lucide-react';
import { M1History, M1Levels, M2Context, M2Agnosia, M2Thatcher, M2Rotation } from './m1-m2';
import { M3Illusions, M3Streams, M3Receptive, M4BasalGanglia, M4Neglect } from './m3-m4';
import { M5Aphasia, M5WordSuperiority, M6Systems, M6Drm, M6Rpe, M6Context } from './m5-m6';
import { M7Hpa, M7Reconsolidation, M7Igt, M8Hypnogram, M8FlipFlop, M8Clock, M8Disorders } from './m7-m8';

const SIMS: Record<string, ComponentType[]> = {
  m1: [M1History, M1Levels],
  m2: [M2Context, M2Agnosia, M2Thatcher, M2Rotation],
  m3: [M3Illusions, M3Streams, M3Receptive],
  m4: [M4BasalGanglia, M4Neglect],
  m5: [M5Aphasia, M5WordSuperiority],
  m6: [M6Systems, M6Drm, M6Rpe, M6Context],
  m7: [M7Hpa, M7Reconsolidation, M7Igt],
  m8: [M8Hypnogram, M8FlipFlop, M8Clock, M8Disorders],
};

const EXTRA: Record<string, { href: string; label: string }[]> = {
  m1: [{ href: '/micro#action-potential', label: 'Hodgkin–Huxley simulator' }, { href: '/methods#compare', label: 'Methods comparison' }, { href: '/micro#synapse', label: 'Synapse & drugs' }],
  m3: [{ href: '/methods#single-cell', label: 'V1 tuning curves' }, { href: '/atlas?s=v1', label: 'Visual pathway in 3D' }],
  m4: [{ href: '/methods#rt', label: 'Posner cueing task' }],
  m5: [{ href: '/methods#erp', label: 'N400 / P600 ERP lab' }],
  m6: [{ href: '/micro#ltp', label: 'LTP stepper' }],
};

export default function ModuleSim({ id }: { id: string }) {
  const list = SIMS[id];
  if (!list?.length) return null;
  return (
    <section className="space-y-3" aria-labelledby="sims-heading">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="sims-heading" className="font-semibold flex items-center gap-2"><FlaskConical className="h-4 w-4 text-primary" />Interactive simulations</h2>
        {EXTRA[id] && (
          <div className="flex flex-wrap gap-2">
            {EXTRA[id].map((e) => <Link key={e.href} href={e.href} className="text-xs px-2.5 py-1 rounded-full bg-primary/15 text-primary hover:bg-primary/25 transition-colors">{e.label} →</Link>)}
          </div>
        )}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">{list.map((C, i) => <C key={i} />)}</div>
    </section>
  );
}
