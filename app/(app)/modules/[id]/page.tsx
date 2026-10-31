import { notFound } from 'next/navigation';
import { Target, Lightbulb, Brain, Library } from 'lucide-react';
import { getModule } from '@/lib/data/curriculum';
import { getStructure } from '@/lib/data/structures';
import { getCitation } from '@/lib/data/citations';
import { LEARN } from '@/lib/data/learn';
import { QUIZ } from '@/lib/data/quiz';
import ModuleSim from '@/components/modules/module-sim';
import ModuleCompleteButton from '@/components/modules/module-complete-button';
import { LearnPath, GoalTracker } from '@/components/modules/learn-path';
import ModuleDrill from '@/components/modules/module-drill';
import { ModuleArcade } from '@/components/modules/module-games';
import { ModuleXP } from '@/components/modules/module-xp';
import TryThis from '@/components/try-this';

export default async function ModulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const m = getModule(id);
  if (!m) notFound();
  const pairs = m.keyConcepts.map((k) => ({ term: k.term, def: k.def }));
  const structures = m.structures
    .map((s: string) => { const st = getStructure(s); return st ? { id: s, name: st.name, fn: st.functions[0] ?? '' } : null; })
    .filter((s): s is { id: string; name: string; fn: string } => !!s);
  const quizPool = QUIZ.filter((q) => m.weeks.includes(q.week)).map((q) => ({ id: q.id, question: q.question, options: q.options, answer: q.answer, explanation: q.explanation }));
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm" style={{ color: m.color }}>Module {m.number} · {m.weekLabel}</p>
        <h1 className="text-2xl font-bold">{m.title}</h1>
        <p className="text-muted-foreground">{m.tagline}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <ModuleCompleteButton moduleId={m.id} />
          <ModuleXP moduleId={m.id} steps={LEARN[m.id]?.length ?? 0} goals={m.goals.length} />
        </div>
      </div>
      <section className="panel p-4 rounded-lg">
        <h2 className="font-semibold flex items-center gap-2 mb-2"><Target className="h-4 w-4 text-primary" />Learning goals</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm">{m.goals.map((g: string) => <li key={g}>{g}</li>)}</ul>
      </section>
      {LEARN[m.id] && <LearnPath moduleId={m.id} steps={LEARN[m.id]} />}
      <GoalTracker moduleId={m.id} goals={m.goals} />
      <section className="grid gap-3 md:grid-cols-2">
        {m.keyConcepts.map((k) => (
          <div key={k.term} className="panel p-4 rounded-lg">
            <h3 className="font-medium flex items-center gap-2"><Lightbulb className="h-4 w-4 text-warning" />{k.term}</h3>
            <p className="text-sm text-muted-foreground mt-1">{k.def}</p>
          </div>
        ))}
      </section>
      <ModuleSim id={m.id} />
      <TryThis id={`module:${m.id}`} />
      <ModuleDrill moduleId={m.id} weeks={m.weeks} />
      <ModuleArcade moduleId={m.id} pairs={pairs} structures={structures} questions={quizPool} />
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
