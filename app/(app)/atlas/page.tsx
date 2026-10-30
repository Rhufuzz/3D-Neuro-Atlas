import AtlasClient from './atlas-client';

export default function AtlasPage() {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">3D Neuro-Atlas</h1>
      <p className="text-muted-foreground text-sm">Explore cortical areas, nuclei and the ventricular system at MNI152 positions, with X-ray opacity, a stereotaxic grid and pathway stages.</p>
      <AtlasClient />
    </div>
  );
}
