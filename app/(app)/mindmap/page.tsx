import MindmapClient from './mindmap-client';

export default function MindmapPage() {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">Concept Mind-Map</h1>
      <p className="text-sm text-muted-foreground">How structures, concepts, disorders and methods connect across the course. Drag nodes to untangle, hover to trace neighbours, click to inspect and jump into the 3D atlas.</p>
      <MindmapClient />
    </div>
  );
}
