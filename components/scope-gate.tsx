'use client';

import { useScope } from '@/lib/use-scope';

/** Renders children only when `weeks` falls inside the current exam scope; `dim` keeps it visible but faded with a badge. */
export default function ScopeGate({ weeks, dim = false, children }: { weeks: number[]; dim?: boolean; children: React.ReactNode }) {
  const { isIn } = useScope();
  if (isIn(weeks)) return <>{children}</>;
  if (!dim) return null;
  return (
    <div className="relative opacity-40 hover:opacity-70 transition">
      <span className="absolute right-2 top-2 z-10 text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Final only</span>
      {children}
    </div>
  );
}
