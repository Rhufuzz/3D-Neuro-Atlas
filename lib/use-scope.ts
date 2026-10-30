'use client';

import { useEffect, useState } from 'react';
import { useStudyStore, maxWeekFor, inScope } from '@/lib/store';
import type { ExamScope } from '@/lib/store';

/** Global exam scope with SSR-safe rehydration (defaults to 'final' until localStorage is read). */
export function useScope(): { scope: ExamScope; setScope: (s: ExamScope) => void; maxWeek: number; hydrated: boolean; isIn: (weeks: number[] | undefined | null) => boolean } {
  const scope = useStudyStore((s) => s.scope);
  const setScope = useStudyStore((s) => s.setScope);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    Promise.resolve(useStudyStore.persist.rehydrate()).finally(() => setHydrated(true));
  }, []);
  return { scope, setScope, maxWeek: maxWeekFor(scope), hydrated, isIn: (w) => inScope(w, scope) };
}
