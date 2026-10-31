'use client';

import { useState } from 'react';
import { Plus, Check } from 'lucide-react';

/** One-click "I got this wrong — schedule it for review": saves a user flashcard
 *  into the SM-2 deck. Shows Added state; duplicate-proofing is left to the user
 *  (delete from Study Tools), keeping the API stateless. */
export default function AddToDeckButton({ front, back, sourceKind, sourceRef, label = 'Add to review deck' }: {
  front: string;
  back: string;
  sourceKind: 'drill' | 'quiz' | 'sample-exam' | 'manual';
  sourceRef?: string;
  label?: string;
}) {
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');
  const add = async () => {
    if (state === 'busy' || state === 'done') return;
    setState('busy');
    try {
      const r = await fetch('/api/progress/custom-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ front, back, sourceKind, sourceRef }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setState('done');
    } catch (e) {
      console.error('add-to-deck failed', e);
      setState('error');
    }
  };
  if (state === 'done') {
    return <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-success/15 text-success"><Check className="h-3 w-3" />Added — it will come back for review</span>;
  }
  return (
    <button type="button" onClick={add} disabled={state === 'busy'}
      className={`text-xs px-2.5 py-1 rounded-full inline-flex items-center gap-1 transition-colors ${state === 'error' ? 'bg-destructive/15 text-destructive' : 'bg-primary/15 text-primary hover:bg-primary/25'} disabled:opacity-50`}>
      <Plus className="h-3 w-3" />{state === 'error' ? 'Failed — retry' : state === 'busy' ? 'Adding…' : label}
    </button>
  );
}
