'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ExamScope = 'partial' | 'final';

interface StudyState {
  scope: ExamScope;
  setScope: (s: ExamScope) => void;
}

/** Global exam scope (Partial = Weeks 1–7, Final = Weeks 1–11), persisted in localStorage. */
export const useStudyStore = create<StudyState>()(
  persist(
    (set) => ({
      scope: 'final',
      setScope: (s: ExamScope) => set({ scope: s }),
    }),
    { name: 'cortex-aether-study', skipHydration: true }
  )
);

export function maxWeekFor(scope: ExamScope | undefined | null): number {
  return scope === 'partial' ? 7 : 11;
}

export function inScope(weeks: number[] | undefined | null, scope: ExamScope | undefined | null): boolean {
  const max = maxWeekFor(scope);
  const w = weeks ?? [];
  if ((w?.length ?? 0) === 0) return true;
  return w.some((x: number) => x <= max);
}
