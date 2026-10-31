import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { MODULE_MAP } from '@/lib/data/curriculum';

/** "Part of Module N" back-links so every lab section points back to its curriculum module. */
export default function SectionModuleLinks({ ids, className = '' }: { ids: string[]; className?: string }) {
  const mods = ids.map((id) => MODULE_MAP[id]).filter(Boolean);
  if (!mods.length) return null;
  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground inline-flex items-center gap-1"><BookOpen className="h-3 w-3" />Part of</span>
      {mods.map((m) => (
        <Link key={m.id} href={`/modules/${m.id}`} className="text-[11px] px-2 py-0.5 rounded-full bg-primary/15 text-primary hover:bg-primary/25 transition-colors">
          Module {m.number}: {m.title} →
        </Link>
      ))}
    </div>
  );
}
