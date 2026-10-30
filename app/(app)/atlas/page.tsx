import AtlasClient from './atlas-client';
import { STRUCTURE_MAP } from '@/lib/data/structures';

export default async function AtlasPage({ searchParams }: { searchParams: Promise<{ s?: string | string[] }> }) {
  const sp = await searchParams;
  const raw = Array.isArray(sp?.s) ? sp.s[0] : sp?.s;
  const initial = raw && STRUCTURE_MAP[raw] ? raw : null;
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">3D Neuro-Atlas</h1>
      <p className="text-muted-foreground text-sm">Explore MNI152-derived cortex, subcortical nuclei and the ventricular system with X-ray opacity, a stereotaxic grid, CSF flow and animated pathway streams.</p>
      <AtlasClient key={initial ?? 'none'} initial={initial} />
    </div>
  );
}
