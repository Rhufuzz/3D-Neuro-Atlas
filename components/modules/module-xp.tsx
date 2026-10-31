'use client';

import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

const RANKS: [number, string][] = [
  [0, 'Rookie'],
  [25, 'Explorer'],
  [50, 'Apprentice'],
  [75, 'Scholar'],
  [95, 'Brainiac'],
];

/** Module XP: rewards every playful activity on the page. Recomputes when games fire
 *  'cortex-xp-change' or localStorage changes elsewhere (drill, path, goals). */
export function ModuleXP({ moduleId, steps, goals }: { moduleId: string; steps: number; goals: number }) {
  const [xp, setXp] = useState(0);

  useEffect(() => {
    const compute = () => {
      let v = 0;
      try {
        const stepData = JSON.parse(localStorage.getItem('cortex-learn-steps') ?? '{}') as Record<string, boolean>;
        for (let i = 0; i < steps; i++) { if (stepData[`${moduleId}:${i}`]) v += 10; }
        const goalData = JSON.parse(localStorage.getItem('cortex-goal-done') ?? '{}') as Record<string, boolean>;
        for (let i = 0; i < goals; i++) { if (goalData[`${moduleId}:${i}`]) v += 10; }
        const games = JSON.parse(localStorage.getItem('cortex-games') ?? '{}') as Record<string, boolean>;
        if (games[`match:${moduleId}`]) v += 15;
        if (games[`finder:${moduleId}`]) v += 15;
        if (games[`sprint:${moduleId}`]) v += 15;
      } catch {}
      setXp(Math.min(100, v));
    };
    compute();
    window.addEventListener('cortex-xp-change', compute);
    window.addEventListener('storage', compute);
    return () => { window.removeEventListener('cortex-xp-change', compute); window.removeEventListener('storage', compute); };
  }, [moduleId, steps, goals]);

  const rank = [...RANKS].reverse().find(([t]) => xp >= t)?.[1] ?? 'Rookie';
  return (
    <div className="flex items-center gap-2.5 glass-panel rounded-lg px-3 py-2" title="XP from guided steps, goals, and arcade games on this page">
      <Zap className={`h-4 w-4 ${xp >= 95 ? 'text-warning' : 'text-primary'}`} />
      <div className="min-w-36">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs font-semibold">{rank}</span>
          <span className="text-[10px] text-muted-foreground tabular-nums">{xp} XP</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-0.5"><div className="h-full bg-gradient-to-r from-primary to-warning rounded-full transition-all" style={{ width: `${xp}%` }} /></div>
      </div>
    </div>
  );
}
