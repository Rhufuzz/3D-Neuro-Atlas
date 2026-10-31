import Link from 'next/link';
import { auth } from '@/auth';
import { Brain, BookOpen, FlaskConical, GraduationCap, Layers, Library, Microscope, Network, Sparkles } from 'lucide-react';
import { MODULES } from '@/lib/data/curriculum';
import { ModuleTick } from '@/components/modules/module-progress';
import ExamCountdowns from '@/components/exam-countdowns';
import ContinueCard from './continue-card';
import OnboardingTour from '@/components/onboarding-tour';

export const dynamic = 'force-dynamic';

const STEPS = [
  { icon: BookOpen, title: '1 · Learn the ideas', body: 'Open a module and follow the Guided Path — each step explains one idea in plain language, then sends you to a simulation to experience it. Tick steps as they click.' },
  { icon: Microscope, title: '2 · See it work', body: 'The 3D Atlas, Micro-Scale Lab and Methods Lab are the labs: rotate the brain, inject current into an axon, record an EEG. The Try-this boxes give you a concrete thing to do in each one.' },
  { icon: Layers, title: '3 · Lock it in', body: 'Finish each module with the drill and the arcade games, then let the SM-2 flashcards schedule your reviews. Your progress is saved to your account.' },
  { icon: GraduationCap, title: '4 · Test yourself', body: 'Exam Prep has the real 65-question sample exam with the official answer key, exam-mode and study-mode, plus every weekly learning goal as a checklist.' },
];

const QUICK = [
  { href: '/atlas', icon: Brain, title: '3D Atlas', body: '66 structures, pathways, development — rotate and inspect.' },
  { href: '/micro', icon: Microscope, title: 'Micro-Scale Lab', body: 'Neurons, action potentials, synapses, drugs, LTP.' },
  { href: '/methods', icon: FlaskConical, title: 'Methods Lab', body: 'EEG, ERPs, fMRI/DTI, reaction-time experiments.' },
  { href: '/study', icon: Layers, title: 'Study Tools', body: 'Spaced-repetition flashcards and quiz, saved per user.' },
  { href: '/mindmap', icon: Network, title: 'Mind-Map', body: 'The whole course as one connected concept graph.' },
  { href: '/literature', icon: Library, title: 'Literature', body: '95 citations with DOI links, grouped by week.' },
];

export default async function HomePage() {
  const session = await auth();
  const name = session?.user?.name || session?.user?.email?.split('@')[0] || 'there';
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Biological &amp; Cognitive Psychology · 2026–2027</p>
        <h1 className="text-2xl font-bold glow-text">Welcome back, {name}</h1>
        <p className="text-sm text-muted-foreground max-w-3xl">This is your study cockpit. Work module by module — the guided paths teach, the labs let you experience, the drills and flashcards make it stick.</p>
      </div>

      <ContinueCard />

      <section className="space-y-3" aria-labelledby="countdown-heading">
        <h2 id="countdown-heading" className="text-lg font-semibold flex items-center gap-2"><GraduationCap className="h-5 w-5 text-primary" />Exam countdown</h2>
        <ExamCountdowns />
        <p className="text-xs text-muted-foreground">Two partial exams of 60 MC questions each; average ≥ 5.5 passes. Full logistics and the sample exam are in <Link href="/exam" className="text-primary hover:underline">Exam Prep</Link>.</p>
      </section>

      <section className="space-y-3" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-lg font-semibold flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" />How to use this app</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.title} className="panel rounded-lg p-4 space-y-1.5">
              <p className="font-semibold text-sm flex items-center gap-2"><s.icon className="h-4 w-4 text-primary" />{s.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3" aria-labelledby="modules-heading">
        <h2 id="modules-heading" className="text-lg font-semibold flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" />Your modules</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map((m) => (
            <Link key={m.id} href={`/modules/${m.id}`} className="panel panel-hover rounded-lg p-4 space-y-1.5 block">
              <div className="flex items-center justify-between"><BookOpen className="h-4 w-4" style={{ color: m.color }} /><ModuleTick id={m.id} /></div>
              <p className="text-xs text-muted-foreground">Module {m.number} · {m.weekLabel}</p>
              <p className="text-sm font-medium leading-snug">{m.title}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-3" aria-labelledby="quick-heading">
        <h2 id="quick-heading" className="text-lg font-semibold flex items-center gap-2"><Brain className="h-5 w-5 text-primary" />Labs &amp; tools</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK.map((q) => (
            <Link key={q.href} href={q.href} className="panel panel-hover rounded-lg p-4 flex items-start gap-3">
              <q.icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span>
                <span className="block text-sm font-medium">{q.title}</span>
                <span className="block text-xs text-muted-foreground mt-0.5">{q.body}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <OnboardingTour />
    </div>
  );
}

