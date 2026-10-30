import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { MODULES } from '@/lib/data/curriculum';

export default function ModulesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Curriculum Modules</h1>
      <p className="text-sm text-muted-foreground">Eight modules covering Weeks 1–11. Partial exam = Weeks 1–7, Final = Weeks 1–11.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {MODULES.map((m) => (
          <Link key={m.id} href={`/modules/${m.id}`} className="panel panel-hover p-4 rounded-lg space-y-2 block">
            <BookOpen className="h-5 w-5" style={{ color: m.color }} />
            <p className="text-xs text-muted-foreground">Module {m.number} · {m.weekLabel}</p>
            <h2 className="font-semibold">{m.title}</h2>
            <p className="text-sm text-muted-foreground">{m.tagline}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
