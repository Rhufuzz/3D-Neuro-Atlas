'use client';

import { useState } from 'react';
import { Sparkles, Check, Loader2 } from 'lucide-react';

interface Props {
  challenge: string;
  solutionHint?: string;
}

export default function SimChallenge({ challenge, solutionHint }: Props) {
  const [solved, setSolved] = useState(false);
  const [checking, setChecking] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const verify = () => {
    setChecking(true);
    setTimeout(() => {
      setSolved(true);
      setChecking(false);
    }, 400);
  };

  if (solved) {
    return (
      <div className="rounded-lg border border-success/40 bg-success/10 px-3 py-2.5 flex items-center justify-between text-xs text-success">
        <span className="flex items-center gap-1.5 font-medium"><Check className="h-4 w-4" /> Challenge completed! Great intuition.</span>
        <button onClick={() => setSolved(false)} className="text-[11px] underline opacity-80 hover:opacity-100">Try again</button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-warning/30 bg-warning/5 px-3 py-2.5 space-y-2 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-warning flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Interactive Challenge</span>
        <div className="flex items-center gap-2">
          {solutionHint && (
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-[11px] text-muted-foreground hover:text-foreground underline"
            >
              {showHint ? 'Hide hint' : 'Hint'}
            </button>
          )}
          <button
            onClick={verify}
            disabled={checking}
            className="px-2.5 py-1 rounded bg-warning/20 hover:bg-warning/30 text-foreground font-medium transition-colors inline-flex items-center gap-1 disabled:opacity-50"
          >
            {checking ? <><Loader2 className="h-3 w-3 animate-spin" /> Verifying…</> : 'Mark solved'}
          </button>
        </div>
      </div>
      <p className="text-muted-foreground leading-relaxed">{challenge}</p>
      {showHint && solutionHint && (
        <p className="text-[11px] text-warning/90 border-t border-warning/20 pt-1.5 leading-snug">
          💡 {solutionHint}
        </p>
      )}
    </div>
  );
}
