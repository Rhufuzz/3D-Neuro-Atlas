'use client';

import { useEffect, useState } from 'react';
import { PenLine, Check, Loader2 } from 'lucide-react';

interface Props {
  moduleId: string;
  goalIndex: number;
}

const CONFIDENCES = [
  { id: 'clear', label: 'Clear — I could teach it', tone: 'bg-success/20 text-success border-success/40' },
  { id: 'shaky', label: 'Shaky — know the basics', tone: 'bg-warning/20 text-warning border-warning/40' },
  { id: 'lost', label: 'Lost — need to review', tone: 'bg-destructive/20 text-destructive border-destructive/40' },
] as const;

export default function ElaborationBox({ moduleId, goalIndex }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [confidence, setConfidence] = useState<'clear' | 'shaky' | 'lost'>('shaky');
  const [status, setStatus] = useState<'idle' | 'loading' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    if (!open) return;
    setStatus('loading');
    fetch(`/api/progress/elaborations?moduleId=${moduleId}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d: { elaborations?: { goalIndex: number; text: string; confidence: string }[] }) => {
        const found = (d?.elaborations ?? []).find((e) => e.goalIndex === goalIndex);
        if (found) {
          setText(found.text);
          setConfidence(found.confidence as 'clear' | 'shaky' | 'lost');
        }
        setStatus('idle');
      })
      .catch((e) => {
        console.error('Failed to load elaboration', e);
        setStatus('idle');
      });
  }, [open, moduleId, goalIndex]);

  const save = async () => {
    setStatus('saving');
    try {
      const r = await fetch('/api/progress/elaborations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId, goalIndex, text, confidence }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (e) {
      console.error('Failed to save elaboration', e);
      setStatus('idle');
    }
  };

  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-[11px] text-muted-foreground hover:text-primary inline-flex items-center gap-1 transition-colors"
      >
        <PenLine className="h-3 w-3" />
        {open ? 'Hide explanation' : text ? 'View your explanation' : 'Explain in your own words'}
      </button>

      {open && (
        <div className="mt-2 p-3 rounded-lg border border-border/60 bg-muted/20 space-y-2 text-xs">
          <p className="text-muted-foreground">
            <strong>The generation effect:</strong> Explaining a concept without looking at the book builds 2–3× stronger recall than re-reading.
          </p>

          {status === 'loading' ? (
            <div className="flex items-center gap-2 text-muted-foreground py-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading your notes…
            </div>
          ) : (
            <>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                placeholder="How would you explain this to another student in 2-3 sentences?"
                className="w-full bg-background/80 border border-border rounded p-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex gap-1">
                  {CONFIDENCES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setConfidence(c.id)}
                      className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                        confidence === c.id ? c.tone : 'bg-muted/40 text-muted-foreground border-transparent'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={save}
                  disabled={status === 'saving' || !text.trim()}
                  className="px-2.5 py-1 rounded bg-primary text-primary-foreground font-medium inline-flex items-center gap-1 disabled:opacity-40"
                >
                  {status === 'saving' ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" /> Saving…
                    </>
                  ) : status === 'saved' ? (
                    <>
                      <Check className="h-3 w-3" /> Saved!
                    </>
                  ) : (
                    'Save explanation'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
