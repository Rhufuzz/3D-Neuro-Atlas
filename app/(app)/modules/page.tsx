import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { MODULES } from '@/lib/data/curriculum';
import ScopeGate from '@/components/scope-gate';
import { ModuleTick, ModuleProgressBar } from '@/components/modules/module-progress';

export default function ModulesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Curriculum Modules</h1>
      <p className="text-sm text-muted-foreground">Eight modules covering Weeks 1–11. Partial exam = Weeks 1–7, Final = Weeks 1–11. Modules outside the selected exam scope are faded. Each module page has interactive simulations.</p>
      <ModuleProgressBar total={MODULES.length} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {MODULES.map((m) => (
          <ScopeGate key={m.id} weeks={m.weeks} dim>
            <Link href={`/modules/${m.id}`} className="panel panel-hover p-4 rounded-lg space-y-2 block h-full">
              <div className="flex items-center justify-between"><BookOpen className="h-5 w-5" style={{ color: m.color }} /><ModuleTick id={m.id} /></div>
              <p className="text-xs text-muted-foreground">Module {m.number} · {m.weekLabel}</p>
              <h2 className="font-semibold">{m.title}</h2>
              <p className="text-sm text-muted-foreground">{m.tagline}</p>
            </Link>
          </ScopeGate>
        ))}
      </div>
    </div>
  );
}
