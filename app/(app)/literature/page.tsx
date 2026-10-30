import { CITATIONS } from '@/lib/data/citations';
import type { Citation } from '@/lib/data/types';

export default function LiteraturePage() {
  const sorted = [...CITATIONS].sort((a: Citation, b: Citation) => (a.weeks?.[0] ?? 0) - (b.weeks?.[0] ?? 0));
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Scientific Literature</h1>
      <p className="text-sm text-muted-foreground">{CITATIONS.length} peer-reviewed sources mapped to course weeks, each with a DOI link.</p>
      <div className="grid gap-3 md:grid-cols-2">
        {sorted.map((c: Citation) => (
          <a key={c.id} href={`https://doi.org/${c.doi}`} target="_blank" rel="noreferrer" className="panel panel-hover p-4 rounded-lg block">
            <p className="text-xs text-primary">Weeks {(c.weeks ?? []).join(', ')} · {c.journal}</p>
            <p className="font-medium">{c.title}</p>
            <p className="text-sm text-muted-foreground">{c.authors} ({c.year})</p>
            <p className="text-xs text-muted-foreground mt-1">{c.summary}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
