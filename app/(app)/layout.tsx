import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Brain, BookOpen, Library, GraduationCap } from 'lucide-react';
import { auth } from '@/auth';
import { MODULES } from '@/lib/data/curriculum';
import SignOutButton from './sign-out-button';

export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  return (
    <div className="min-h-screen neuro-bg flex">
      <nav className="hidden md:flex w-60 shrink-0 flex-col gap-1 p-4 glass-panel sticky top-0 h-screen overflow-y-auto">
        <Link href="/atlas" className="text-lg font-bold glow-text mb-4">CORTEX-AETHER</Link>
        <Link href="/atlas" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted"><Brain className="h-4 w-4 text-primary" />3D Atlas</Link>
        <Link href="/modules" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted"><BookOpen className="h-4 w-4 text-primary" />Modules</Link>
        {MODULES.map((m) => (
          <Link key={m.id} href={`/modules/${m.id}`} className="pl-9 pr-3 py-1 text-xs text-muted-foreground hover:text-foreground">M{m.number} · {m.weekLabel}</Link>
        ))}
        <Link href="/literature" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted"><Library className="h-4 w-4 text-primary" />Literature</Link>
        <Link href="/study" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted"><GraduationCap className="h-4 w-4 text-primary" />Study Tools</Link>
        <div className="mt-auto pt-4 text-xs text-muted-foreground space-y-2">
          <p className="truncate">{session?.user?.email ?? ''}</p>
          <SignOutButton />
        </div>
      </nav>
      <div className="flex-1 min-w-0">
        <header className="md:hidden flex gap-3 p-3 glass-panel text-sm overflow-x-auto">
          <Link href="/atlas">Atlas</Link><Link href="/modules">Modules</Link><Link href="/literature">Literature</Link><Link href="/study">Study</Link>
        </header>
        <main className="p-4 md:p-6 max-w-[1400px] mx-auto">{children}</main>
      </div>
    </div>
  );
}
