'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { invalidateModuleProgress, loadModuleProgress } from './module-progress';

export default function ModuleCompleteButton({ moduleId }: { moduleId: string }) {
  const [state, setState] = useState<'loading' | 'ready' | 'anon' | 'error'>('loading');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    loadModuleProgress().then((r) => {
      if (!alive) return;
      if ('anon' in r) setState('anon');
      else if ('error' in r) setState('error');
      else { setDone(r.completed.includes(moduleId)); setState('ready'); }
    });
    return () => { alive = false; };
  }, [moduleId]);

  const toggle = async () => {
    setBusy(true);
    try {
      const r = await fetch('/api/progress/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId, completed: !done }),
      });
      if (r.status === 401) { setState('anon'); return; }
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setDone(!done);
      setState('ready');
      invalidateModuleProgress();
    } catch (e) {
      console.error('Failed to save module progress', e);
      setState('error');
    } finally {
      setBusy(false);
    }
  };

  if (state === 'anon') return <p className="text-xs text-muted-foreground">Sign in to track module completion.</p>;
  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={toggle} disabled={busy || state === 'loading'}
        className={`inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full transition-colors disabled:opacity-60 ${done ? 'bg-success/20 text-success hover:bg-success/30' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>
        {busy || state === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : done ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
        {done ? 'Completed — click to undo' : 'Mark module as completed'}
      </button>
      {state === 'error' && <span className="text-xs text-destructive">Could not reach the server — try again.</span>}
    </div>
  );
}
