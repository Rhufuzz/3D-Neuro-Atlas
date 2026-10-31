import { ListChecks } from 'lucide-react';
import { TRY_THIS } from '@/lib/data/try-this';

/** Guided micro-instructions for a simulation; renders nothing when the id has no entry. */
export default function TryThis({ id }: { id: string }) {
  const steps = TRY_THIS[id];
  if (!steps?.length) return null;
  return (
    <div className="rounded-lg border border-primary/25 bg-primary/5 px-3 py-2.5 space-y-1.5">
      <p className="font-semibold text-primary flex items-center gap-1.5 text-xs"><ListChecks className="h-3.5 w-3.5" />Try this</p>
      <ol className="list-decimal pl-4 space-y-1">
        {steps.map((s, i) => <li key={i} className="text-xs text-muted-foreground leading-relaxed">{s}</li>)}
      </ol>
    </div>
  );
}
