'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Brain,
  BookOpen,
  GraduationCap,
  Layers,
  MoreHorizontal,
  X,
  Microscope,
  FlaskConical,
  Network,
  Library,
  BookMarked,
  ChevronRight,
} from 'lucide-react';
import ScopeToggle from '@/components/scope-toggle';
import SignOutButton from '@/app/(app)/sign-out-button';

interface Tab {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  match: (path: string) => boolean;
}

const PRIMARY_TABS: Tab[] = [
  { href: '/home', label: 'Home', icon: Home, match: (p) => p === '/home' || p === '/' },
  { href: '/atlas', label: 'Atlas', icon: Brain, match: (p) => p.startsWith('/atlas') },
  { href: '/modules', label: 'Modules', icon: BookOpen, match: (p) => p.startsWith('/modules') },
  { href: '/study', label: 'Study', icon: Layers, match: (p) => p.startsWith('/study') },
];

const MORE_GROUPS = [
  {
    title: 'Exam & Reference',
    items: [
      { href: '/exam', label: 'Exam Prep', desc: 'Sample exam, dates & learning goals', icon: GraduationCap, color: 'text-sky-400 bg-sky-500/15' },
      { href: '/exam/cheat-sheet', label: 'Printable Reference Sheet', desc: 'Formulas, pharmacology & rules', icon: BookMarked, color: 'text-indigo-400 bg-indigo-500/15' },
    ],
  },
  {
    title: 'Interactive Labs',
    items: [
      { href: '/micro', label: 'Micro-Scale Lab', desc: 'Neurons, synapses & Hodgkin-Huxley', icon: Microscope, color: 'text-cyan-400 bg-cyan-500/15' },
      { href: '/methods', label: 'Methods Lab', desc: 'EEG, ERPs, fMRI & mental chronometry', icon: FlaskConical, color: 'text-emerald-400 bg-emerald-500/15' },
      { href: '/mindmap', label: 'Concept Mind-Map', desc: 'Force-directed curriculum graph', icon: Network, color: 'text-amber-400 bg-amber-500/15' },
      { href: '/literature', label: 'Literature Database', desc: '95 papers with verified DOIs', icon: Library, color: 'text-purple-400 bg-purple-500/15' },
    ],
  },
];

export default function IosTabBar({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname() || '';
  const [sheetOpen, setSheetOpen] = useState(false);

  const isMoreActive = MORE_GROUPS.some((g) => g.items.some((i) => pathname.startsWith(i.href)));

  return (
    <>
      {/* Floating / docked iOS Glass Tab Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 ios-glass-bar pb-safe"
        aria-label="Mobile Navigation"
      >
        <div className="flex items-center justify-around h-[54px] px-2 max-w-md mx-auto">
          {PRIMARY_TABS.map((tab) => {
            const active = tab.match(pathname) && !sheetOpen;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={() => setSheetOpen(false)}
                className={`ios-touch relative flex-1 flex flex-col items-center justify-center py-1 select-none transition-all ${
                  active ? 'text-primary' : 'text-muted-foreground/80 hover:text-foreground'
                }`}
              >
                <div className={`relative px-3 py-0.5 rounded-full transition-all ${active ? 'bg-primary/15' : ''}`}>
                  <Icon className={`h-5 w-5 transition-transform ${active ? 'scale-105 stroke-[2.2px]' : 'stroke-[1.8px]'}`} />
                </div>
                <span className={`text-[10px] tracking-tight transition-all ${active ? 'font-bold text-primary' : 'font-medium'}`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}

          {/* More Tab */}
          <button
            type="button"
            onClick={() => setSheetOpen(!sheetOpen)}
            className={`ios-touch relative flex-1 flex flex-col items-center justify-center py-1 select-none transition-all ${
              sheetOpen || isMoreActive ? 'text-primary' : 'text-muted-foreground/80 hover:text-foreground'
            }`}
            aria-expanded={sheetOpen}
            aria-label="More navigation"
          >
            <div className={`relative px-3 py-0.5 rounded-full transition-all ${sheetOpen || isMoreActive ? 'bg-primary/15' : ''}`}>
              <MoreHorizontal className={`h-5 w-5 transition-transform ${sheetOpen || isMoreActive ? 'scale-105 stroke-[2.2px]' : 'stroke-[1.8px]'}`} />
            </div>
            <span className={`text-[10px] tracking-tight transition-all ${sheetOpen || isMoreActive ? 'font-bold text-primary' : 'font-medium'}`}>
              More
            </span>
          </button>
        </div>
      </nav>

      {/* iOS Modal Action Sheet */}
      {sheetOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/65 backdrop-blur-md flex flex-col justify-end animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          onClick={() => setSheetOpen(false)}
        >
          <div
            className="ios-glass rounded-t-[32px] border-t border-white/15 p-5 space-y-4 max-h-[88vh] overflow-y-auto pb-safe shadow-2xl animate-in slide-in-from-bottom duration-250 ease-out"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Native Drag Pill */}
            <div className="w-9 h-1.5 bg-muted-foreground/35 rounded-full mx-auto -mt-1.5 mb-2" />

            {/* Header */}
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="text-lg font-bold tracking-tight">More Tools</h3>
                <p className="text-xs text-muted-foreground">Labs, reference and settings</p>
              </div>
              <button
                onClick={() => setSheetOpen(false)}
                className="h-8 w-8 rounded-full bg-white/10 active:bg-white/20 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Inset Group: Scope */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2">Exam Scope</p>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <ScopeToggle />
              </div>
            </div>

            {/* Inset Groups: Navigation Items */}
            {MORE_GROUPS.map((group) => (
              <div key={group.title} className="space-y-1.5">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2">{group.title}</p>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden divide-y divide-white/5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSheetOpen(false)}
                        className={`ios-cell flex items-center gap-3.5 p-3.5 transition-colors ${
                          active ? 'bg-primary/10 text-primary' : 'text-foreground'
                        }`}
                      >
                        <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate leading-snug">{item.label}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{item.desc}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Inset Group: Account & Sign out */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2">Account</p>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 space-y-2">
                {userEmail && (
                  <p className="text-xs text-muted-foreground font-mono truncate px-1">{userEmail}</p>
                )}
                <SignOutButton />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
