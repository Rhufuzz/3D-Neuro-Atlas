'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

type Result = { completed: string[] } | { anon: true } | { error: true };
let cache: Promise<Result> | null = null;

export function invalidateModuleProgress() {
  cache = null;
}

export function loadModuleProgress(): Promise<Result> {
  if (!cache) {
    cache = fetch('/api/progress/modules', { cache: 'no-store' })
      .then(async (r): Promise<Result> => {
        if (r.status === 401) return { anon: true };
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = (await r.json()) as { completed?: string[] };
        return { completed: Array.isArray(j.completed) ? j.completed : [] };
      })
      .catch((e: unknown): Result => {
        console.error('Failed to load module progress', e);
        cache = null;
        return { error: true };
      });
  }
  return cache;
}

export function useCompletedModules() {
  const [res, setRes] = useState<Result | null>(null);
  useEffect(() => {
    let alive = true;
    loadModuleProgress().then((r) => { if (alive) setRes(r); });
    return () => { alive = false; };
  }, []);
  return res;
}

export function ModuleTick({ id }: { id: string }) {
  const res = useCompletedModules();
  if (!res || !('completed' in res) || !res.completed.includes(id)) return null;
  return <CheckCircle2 className="h-4 w-4 text-success" aria-label="Completed" />;
}

export function ModuleProgressBar({ total }: { total: number }) {
  const res = useCompletedModules();
  if (!res || !('completed' in res)) return null;
  const n = res.completed.length;
  return (
    <div className="panel rounded-lg p-3 flex items-center gap-3 text-sm">
      <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
      <span className="shrink-0">{n}/{total} modules completed</span>
      <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden"><div className="h-full bg-success transition-all" style={{ width: `${(n / total) * 100}%` }} /></div>
    </div>
  );
}
