import { notFound } from 'next/navigation';
import { Target, Lightbulb, Brain, Library } from 'lucide-react';
import { getModule } from '@/lib/data/curriculum';
import { getStructure } from '@/lib/data/structures';
import { getCitation } from '@/lib/data/citations';
import ModuleSim from '@/components/modules/module-sim';
import ModuleCompleteButton from '@/components/modules/module-complete-button';

export default async function ModulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const m = getModule(id);
  if (!m) notFound();
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm" style={{ color: m.color }}>Module {m.number} · {m.weekLabel}</p>
        <h1 className="text-2xl font-bold">{m.title}</h1>
        <p className="text-muted-foreground">{m.tagline}</p>
        <div className="mt-3"><ModuleCompleteButton moduleId={m.id} /></div>
      </div>
      <section className="panel p-4 rounded-lg">
        <h2 className="font-semibold flex items-center gap-2 mb-2"><Target className="h-4 w-4 text-primary" />Learning goals</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm">{m.goals.map((g: string) => <li key={g}>{g}</li>)}</ul>
      </section>
      <section className="grid gap-3 md:grid-cols-2">
        {m.keyConcepts.map((k) => (
          <div key={k.term} className="panel p-4 rounded-lg">
            <h3 className="font-medium flex items-center gap-2"><Lightbulb className="h-4 w-4 text-warning" />{k.term}</h3>
            <p className="text-sm text-muted-foreground mt-1">{k.def}</p>
          </div>
        ))}
      </section>
      <ModuleSim id={m.id} />
      <section className="panel p-4 rounded-lg">
        <h2 className="font-semibold flex items-center gap-2 mb-2"><Brain className="h-4 w-4 text-primary" />Key structures</h2>
        <div className="flex flex-wrap gap-2">{m.structures.map((s: string) => <span key={s} className="text-xs bg-muted px-2 py-1 rounded">{getStructure(s)?.name ?? s}</span>)}</div>
      </section>
      <section className="panel p-4 rounded-lg">
        <h2 className="font-semibold flex items-center gap-2 mb-2"><Library className="h-4 w-4 text-primary" />Readings</h2>
        <ul className="space-y-2 text-sm">
          {m.citations.map((c: string) => { const ci = getCitation(c); return ci ? (
            <li key={c}>{ci.authors} ({ci.year}). {ci.title}. <i>{ci.journal}</i>. <a href={`https://doi.org/${ci.doi}`} target="_blank" rel="noreferrer" className="text-primary hover:underline">doi:{ci.doi}</a></li>
          ) : null; })}
        </ul>
      </section>
    </div>
  );
}
