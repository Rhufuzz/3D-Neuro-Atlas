'use client';

import { useEffect, useState } from 'react';
import { CalendarClock } from 'lucide-react';
import { EXAMS, EXAM_DATE_ISO } from '@/lib/data/exam';

interface Left { d: number; h: number }

export default function ExamCountdowns() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);
  const targets = EXAMS.filter((e) => e.id !== 'resit' && EXAM_DATE_ISO[e.id]);
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {targets.map((e) => {
        const to = new Date(EXAM_DATE_ISO[e.id]!).getTime();
        const left: Left | null = now === null ? null : Math.max(0, to - now) > 0
          ? { d: Math.floor((to - now) / 86400000), h: Math.floor(((to - now) % 86400000) / 3600000) }
          : { d: 0, h: 0 };
        return (
          <div key={e.id} className="panel rounded-lg p-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <CalendarClock className="h-3.5 w-3.5 text-primary" />{e.name} · {e.weeks}
            </p>
            <p className="text-2xl font-bold text-primary mt-1 tabular-nums" aria-live="polite">
              {left === null ? '—' : to - (now ?? 0) <= 0 ? 'done!' : `${left.d}d ${left.h}h`}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{e.date}</p>
          </div>
        );
      })}
    </div>
  );
}
