/** SM-2 spaced repetition (Wozniak 1990) with a short relearning step for failed cards. */
export interface Sm2State {
  easeFactor: number;
  interval: number; // days
  repetitions: number;
  lapses: number;
}

export const GRADES = [
  { label: 'Again', q: 1, tone: 'bg-destructive/80 text-destructive-foreground' },
  { label: 'Hard', q: 3, tone: 'bg-warning/80 text-black' },
  { label: 'Good', q: 4, tone: 'bg-primary text-primary-foreground' },
  { label: 'Easy', q: 5, tone: 'bg-success/80 text-black' },
] as const;

export const NEW_CARD: Sm2State = { easeFactor: 2.5, interval: 0, repetitions: 0, lapses: 0 };

export function sm2(prev: Sm2State | null | undefined, grade: number): Sm2State & { dueInMinutes: number } {
  const p = prev ?? NEW_CARD;
  const q = Math.max(0, Math.min(5, Math.round(grade)));
  let { easeFactor, interval, repetitions, lapses } = p;
  if (q < 3) {
    repetitions = 0;
    interval = 0;
    lapses += 1;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
    return { easeFactor, interval, repetitions, lapses, dueInMinutes: 10 };
  }
  if (repetitions === 0) interval = q === 3 ? 1 : q === 5 ? 3 : 1;
  else if (repetitions === 1) interval = q === 3 ? 3 : 6;
  else interval = Math.max(1, Math.round(interval * easeFactor * (q === 3 ? 0.8 : q === 5 ? 1.3 : 1)));
  repetitions += 1;
  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
  return { easeFactor, interval, repetitions, lapses, dueInMinutes: interval * 1440 };
}

export function formatInterval(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const d = Math.round(minutes / 1440);
  if (d < 31) return `${d} d`;
  return `${Math.round(d / 30)} mo`;
}
