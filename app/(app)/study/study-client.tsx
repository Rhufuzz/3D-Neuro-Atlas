'use client';

import { useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Box, EyeOff } from 'lucide-react';
import { useScope } from '@/lib/use-scope';
import FlashcardDeck from './flashcard-deck';
import QuizPanel from './quiz-panel';
import ProgressTracker from './progress-tracker';

const BrainViewer = dynamic(() => import('@/components/atlas/brain-viewer'), {
  ssr: false,
  loading: () => <div className="h-[280px] rounded-lg bg-muted/30 animate-pulse" />,
});

export default function StudyClient() {
  const { scope, maxWeek, hydrated } = useScope();
  const [show3d, setShow3d] = useState(false);
  const [focus, setFocus] = useState<{ id: string | null; label: string | null }>({ id: null, label: null });
  const [refreshKey, setRefreshKey] = useState(0);
  const onFocus = useCallback((id: string | null, label: string | null) => setFocus({ id, label }), []);
  const onSaved = useCallback(() => setRefreshKey((k: number) => k + 1), []);

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">Scope: <span className="text-primary">{scope === 'partial' ? 'Partial exam · Weeks 1–7' : 'Final exam · Weeks 1–11'}</span> (change it in the sidebar or header).</p>
      {hydrated ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <FlashcardDeck maxWeek={maxWeek} onFocus={onFocus} />
          <QuizPanel maxWeek={maxWeek} scope={scope} onFocus={onFocus} onSaved={onSaved} />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2"><div className="panel h-72 rounded-lg animate-pulse" /><div className="panel h-72 rounded-lg animate-pulse" /></div>
      )}
      <section className="panel p-4 rounded-lg space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold flex items-center gap-2"><Box className="h-4 w-4 text-primary" />Show in 3D</h2>
          <button onClick={() => setShow3d(!show3d)} className="px-3 py-1.5 rounded-md bg-muted text-sm hover:bg-muted/70">{show3d ? 'Hide viewer' : 'Open viewer'}</button>
        </div>
        <p className="text-xs text-muted-foreground">
          The viewer highlights the structure linked to the current flashcard (name hidden until you reveal the answer) and flies to the structure behind each answered quiz question.
        </p>
        {show3d && (
          <div className="space-y-2">
            <BrainViewer opacity={0.35} showGrid={false} showCsf={false} showDeep dev={1} selected={focus.id} compact heightClass="h-[300px] md:h-[360px]" />
            <div className="flex items-center justify-between text-xs">
              {focus.id ? (
                focus.label ? <span>Highlighted: <span className="text-primary font-medium">{focus.label}</span></span> : <span className="flex items-center gap-1 text-muted-foreground"><EyeOff className="h-3 w-3" />Which structure is glowing? Reveal the card to check.</span>
              ) : <span className="text-muted-foreground">No structure linked to the current item.</span>}
              {focus.id && focus.label && <Link href={`/atlas?s=${focus.id}`} className="text-primary hover:underline">Open in atlas</Link>}
            </div>
          </div>
        )}
      </section>
      {hydrated && <ProgressTracker refreshKey={refreshKey} maxWeek={maxWeek} />}
    </div>
  );
}
