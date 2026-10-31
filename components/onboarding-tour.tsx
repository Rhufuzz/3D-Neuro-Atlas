'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Brain, Layers, GraduationCap, X, ArrowRight, ArrowLeft, Check } from 'lucide-react';

const KEY = 'cortex-onboarded';

const STEPS = [
  {
    icon: BookOpen,
    title: 'Learn it module by module',
    body: <>Modules are the spine of this app (Weeks 1–11). Each one has a <strong>Guided Path</strong>: plain-language steps that each send you to a simulation to experience the idea. Tick a step when it clicks, then finish with the drill and the arcade games.</>,
    link: { href: '/modules', label: 'Open Modules' },
  },
  {
    icon: Brain,
    title: 'The labs let you see it work',
    body: <>The <strong>3D Atlas</strong> (rotate the brain, trace pathways), the <strong>Micro-Scale Lab</strong> (fire a real Hodgkin–Huxley axon, play with synapses and drugs) and the <strong>Methods Lab</strong> (EEG, ERPs, reaction-time tasks). Every lab has a <em>Try this</em> box telling you exactly what to do.</>,
    link: { href: '/atlas', label: 'Open the Atlas' },
  },
  {
    icon: Layers,
    title: 'Make it stick',
    body: <>The <strong>Study Tools</strong> schedule your reviews with SM-2 spaced repetition — flashcards and quizzes saved to your account, on any device. Cards linked to a brain structure highlight it in 3D while you answer.</>,
    link: { href: '/study', label: 'Open Study Tools' },
  },
  {
    icon: GraduationCap,
    title: 'Train for the real exam',
    body: <>Exam Prep has the official <strong>65-question sample exam</strong> with the published answer key (exam mode + check-as-you-go study mode), every weekly learning goal as a checklist, and the exam dates. Use the <strong>Partial/Final</strong> scope toggle in the sidebar to focus on Weeks 1–7 or the full course.</>,
    link: { href: '/exam', label: 'Open Exam Prep' },
  },
];

export default function OnboardingTour() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try { if (!localStorage.getItem(KEY)) setShow(true); } catch {}
  }, []);

  const finish = useCallback(() => {
    try { localStorage.setItem(KEY, '1'); } catch {}
    setShow(false);
  }, []);

  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish();
      if (e.key === 'ArrowRight' && step < STEPS.length - 1) setStep((s) => s + 1);
      if (e.key === 'ArrowLeft' && step > 0) setStep((s) => s - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [show, step, finish]);

  if (!show) return null;
  const S = STEPS[step];
  const last = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[60] bg-[#04060b]/90 backdrop-blur-sm grid place-items-center p-4" role="dialog" aria-modal="true" aria-label="Welcome tour">
      <div className="panel rounded-xl max-w-lg w-full p-6 space-y-4 relative">
        <button onClick={finish} aria-label="Skip tour" className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        <div className="flex items-center gap-3">
          <span className="h-10 w-10 rounded-full bg-primary/15 grid place-items-center shrink-0"><S.icon className="h-5 w-5 text-primary" /></span>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Welcome · {step + 1} of {STEPS.length}</p>
            <h2 className="text-lg font-bold glow-text">{S.title}</h2>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{S.body}</p>
        <div className="flex items-center justify-between pt-1">
          <div className="flex gap-1.5" aria-hidden>
            {STEPS.map((_, i) => <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-5 bg-primary' : 'w-1.5 bg-muted-foreground/40'}`} />)}
          </div>
          <div className="flex items-center gap-2">
            {step > 0 && <button onClick={() => setStep(step - 1)} className="px-3 py-1.5 rounded-md bg-muted text-sm hover:bg-muted/70 inline-flex items-center gap-1"><ArrowLeft className="h-3.5 w-3.5" />Back</button>}
            <Link href={S.link.href} onClick={finish} className="px-3 py-1.5 rounded-md bg-primary/15 text-primary text-sm hover:bg-primary/25">{S.link.label} →</Link>
            {last ? (
              <button onClick={finish} className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm inline-flex items-center gap-1"><Check className="h-3.5 w-3.5" />Start studying</button>
            ) : (
              <button onClick={() => setStep(step + 1)} className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm inline-flex items-center gap-1">Next<ArrowRight className="h-3.5 w-3.5" /></button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
