import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Brain, BookOpen, Library, GraduationCap, Network, FlaskConical, Microscope, Home } from 'lucide-react';
import { auth } from '@/auth';
import { MODULES } from '@/lib/data/curriculum';
import ScopeToggle from '@/components/scope-toggle';
import SignOutButton from './sign-out-button';
import IosTopBar from '@/components/mobile/ios-top-bar';
import IosTabBar from '@/components/mobile/ios-tab-bar';

export const dynamic = 'force-dynamic';

const LINKS = [
  { href: '/home', label: 'Home', short: 'Home', icon: Home },
  { href: '/atlas', label: '3D Atlas', short: 'Atlas', icon: Brain },
  { href: '/exam', label: 'Exam Prep', short: 'Exam', icon: GraduationCap },
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
        <Link href="/home" className="text-lg font-bold glow-text mb-3">CORTEX-AETHER</Link>
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
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <IosTopBar />
        <main className="flex-1 p-3.5 sm:p-5 md:p-6 max-w-[1400px] w-full mx-auto pb-28 md:pb-6">
          {children}
        </main>
        <IosTabBar userEmail={session?.user?.email ?? ''} />
      </div>
    </div>
  );
}
