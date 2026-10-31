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
  LogOut,
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

const MORE_LINKS = [
  { href: '/exam', label: 'Exam Prep', desc: 'Sample exam, weekly plan & tips', icon: GraduationCap },
  { href: '/exam/cheat-sheet', label: 'Printable Cheat-Sheet', desc: 'Formulas, pharmacology & rules', icon: BookMarked },
  { href: '/micro', label: 'Micro-Scale Lab', desc: 'Axons, synapses & ion channels', icon: Microscope },
  { href: '/methods', label: 'Methods Lab', desc: 'EEG, ERPs, fMRI & chronometry', icon: FlaskConical },
  { href: '/mindmap', label: 'Mind-Map', desc: 'Interactive concept graph', icon: Network },
  { href: '/literature', label: 'Literature', desc: '95 citations with verified DOIs', icon: Library },
];

export default function IosTabBar({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname() || '';
  const [sheetOpen, setSheetOpen] = useState(false);

  const isMoreActive = MORE_LINKS.some((l) => pathname.startsWith(l.href));

  return (
    <>
      {/* Native iOS Bottom Tab Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 ios-glass-bar pb-safe"
        aria-label="Mobile Navigation"
      >
        <div className="flex items-center justify-around h-14 px-1 max-w-lg mx-auto">
          {PRIMARY_TABS.map((tab) => {
            const active = tab.match(pathname) && !sheetOpen;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={() => setSheetOpen(false)}
                className={`ios-touch flex-1 flex flex-col items-center justify-center py-1 select-none transition-colors ${
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="relative">
                  <Icon className={`h-5 w-5 ${active ? 'stroke-[2.25px]' : 'stroke-[1.75px]'}`} />
                  {active && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-[0_0_6px_hsl(var(--primary))]" />
                  )}
                </div>
                <span className={`text-[10px] tracking-tight mt-0.5 ${active ? 'font-semibold' : 'font-normal'}`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}

          {/* More Tab */}
          <button
            type="button"
            onClick={() => setSheetOpen(!sheetOpen)}
            className={`ios-touch flex-1 flex flex-col items-center justify-center py-1 select-none transition-colors ${
              sheetOpen || isMoreActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-expanded={sheetOpen}
            aria-label="More sections"
          >
            <div className="relative">
              <MoreHorizontal className="h-5 w-5 stroke-[1.75px]" />
              {(sheetOpen || isMoreActive) && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-[0_0_6px_hsl(var(--primary))]" />
              )}
            </div>
            <span className={`text-[10px] tracking-tight mt-0.5 ${sheetOpen || isMoreActive ? 'font-semibold' : 'font-normal'}`}>
              More
            </span>
          </button>
        </div>
      </nav>

      {/* iOS More Action Sheet / Drawer */}
      {sheetOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end"
          role="dialog"
          aria-modal="true"
          onClick={() => setSheetOpen(false)}
        >
          <div
            className="ios-glass rounded-t-3xl border-t border-white/10 p-5 space-y-4 max-h-[85vh] overflow-y-auto pb-safe animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grabber pill */}
            <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto -mt-1 mb-3" />

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">More Navigation</h3>
                <p className="text-xs text-muted-foreground">Course tools &amp; settings</p>
              </div>
              <button
                onClick={() => setSheetOpen(false)}
                className="h-8 w-8 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scope selector in drawer */}
            <div className="panel p-3 rounded-xl space-y-1.5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Exam Scope</p>
              <ScopeToggle />
            </div>

            {/* Links List */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1">Labs &amp; Exam Tools</p>
              {MORE_LINKS.map((link) => {
                const Icon = link.icon;
                const active = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setSheetOpen(false)}
                    className={`ios-touch flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                      active
                        ? 'border-primary/40 bg-primary/10 text-primary'
                        : 'border-border/60 bg-muted/20 hover:bg-muted/40 text-foreground'
                    }`}
                  >
                    <div className="h-9 w-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{link.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{link.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Account & Sign out */}
            <div className="pt-2 border-t border-border/60 space-y-2">
              {userEmail && <p className="text-xs text-muted-foreground truncate px-1">{userEmail}</p>}
              <div className="flex gap-2">
                <div className="flex-1">
                  <SignOutButton />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
