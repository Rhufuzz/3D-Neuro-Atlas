'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import ScopeToggle from '@/components/scope-toggle';

const TITLE_MAP: Record<string, string> = {
  '/home': 'Overview',
  '/atlas': '3D Neuro-Atlas',
  '/modules': 'Modules',
  '/study': 'Study Engine',
  '/exam': 'Exam Prep',
  '/exam/cheat-sheet': 'Reference Sheet',
  '/micro': 'Micro-Scale Lab',
  '/methods': 'Methods Lab',
  '/mindmap': 'Mind-Map',
  '/literature': 'Literature',
};

export default function IosTopBar() {
  const pathname = usePathname() || '';
  const router = useRouter();

  // Determine title
  let title = TITLE_MAP[pathname];
  if (!title) {
    if (pathname.startsWith('/modules/m')) {
      const num = pathname.replace('/modules/m', '');
      title = `Module ${num}`;
    } else {
      title = 'CORTEX-AETHER';
    }
  }

  // Determine if back button is appropriate
  const isDeep = pathname.startsWith('/modules/m') || pathname === '/exam/cheat-sheet';

  return (
    <header className="md:hidden sticky top-0 z-30 ios-glass border-b border-white/5 pt-safe select-none">
      <div className="flex items-center justify-between h-12 px-3">
        {/* Left: Back button or Logo */}
        <div className="w-20 flex items-center">
          {isDeep ? (
            <button
              onClick={() => router.back()}
              className="ios-touch inline-flex items-center text-xs font-medium text-primary -ml-1 py-1 pr-2"
              aria-label="Back"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
          ) : (
            <Link href="/home" className="text-xs font-bold glow-text tracking-wider truncate">
              CORTEX
            </Link>
          )}
        </div>

        {/* Center: Title */}
        <h1 className="text-xs font-bold text-foreground text-center truncate max-w-[170px] tracking-tight">
          {title}
        </h1>

        {/* Right: Scope toggle compact */}
        <div className="w-20 flex items-center justify-end">
          <ScopeToggle compact />
        </div>
      </div>
    </header>
  );
}
