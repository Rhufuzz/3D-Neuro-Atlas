import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Brain, BookOpen, Library, GraduationCap, Network, FlaskConical, Microscope } from 'lucide-react';
import { auth } from '@/auth';
import { MODULES } from '@/lib/data/curriculum';
import ScopeToggle from '@/components/scope-toggle';
import SignOutButton from './sign-out-button';

export const dynamic = 'force-dynamic';

const LINKS = [
  { href: '/atlas', label: '3D Atlas', short: 'Atlas', icon: Brain },
  { href: '/micro', label: 'Micro-Scale Lab', short: 'Micro', icon: Microscope },
  { href: '/modules', label: 'Modules', short: 'Modules', icon: BookOpen },
  { href: '/methods', label: 'Methods Lab', short: 'Methods', icon: FlaskConical },
  { href: '/mindmap', label: 'Mind-Map', short: 'Mind-map', icon: Network },
  { href: '/literature', label: 'Literature', short: 'Literature', icon: Library },
  { href: '/study', label: 'Study Tools', short: 'Study', icon: GraduationCap },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  return (
    <div className="min-h-screen neuro-bg flex">
      <nav className="hidden md:flex w-60 shrink-0 flex-col gap-1 p-4 glass-panel sticky top-0 h-screen overflow-y-auto">
        <Link href="/atlas" className="text-lg font-bold glow-text mb-3">CORTEX-AETHER</Link>
        <div className="mb-3"><ScopeToggle /></div>
        {LINKS.map((l) => (
          <div key={l.href}>
            <Link href={l.href} className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted"><l.icon className="h-4 w-4 text-primary" />{l.label}</Link>
            {l.href === '/modules' && MODULES.map((m) => (
              <Link key={m.id} href={`/modules/${m.id}`} className="block pl-9 pr-3 py-1 text-xs text-muted-foreground hover:text-foreground">M{m.number} · {m.weekLabel}</Link>
            ))}
          </div>
        ))}
        <div className="mt-auto pt-4 text-xs text-muted-foreground space-y-2">
          <p className="truncate">{session?.user?.email ?? ''}</p>
          <SignOutButton />
        </div>
      </nav>
      <div className="flex-1 min-w-0">
        <header className="md:hidden glass-panel p-3 space-y-2 text-sm">
          <div className="flex items-center justify-between gap-2">
            <Link href="/atlas" className="font-bold glow-text">CORTEX-AETHER</Link>
            <ScopeToggle compact />
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {LINKS.map((l) => <Link key={l.href} href={l.href} className="shrink-0 hover:text-primary">{l.short}</Link>)}
          </div>
        </header>
        <main className="p-4 md:p-6 max-w-[1400px] mx-auto">{children}</main>
      </div>
    </div>
  );
}
