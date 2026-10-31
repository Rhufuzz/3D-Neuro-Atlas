import Link from 'next/link';
import { GraduationCap, CalendarClock, BookMarked, Lightbulb, Timer } from 'lucide-react';
import { EXAMS, COURSE_INFO, STUDY_TIPS, EXAM_DATE_ISO } from '@/lib/data/exam';
import WeeklyPlan from './weekly-plan';
import SampleExam from './sample-exam';

export const dynamic = 'force-dynamic';

const COUNTDOWN_TARGETS = EXAMS.filter((e) => e.id !== 'resit');

function Countdown() {
  const targets = COUNTDOWN_TARGETS.map((e) => ({
    id: e.id,
    name: e.name,
    date: new Date(EXAM_DATE_ISO[e.id]!),
    label: e.date,
  }));
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {targets.map((t) => (
        <div key={t.id} className="panel rounded-lg p-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5 text-primary" />{t.name} · {t.label}</p>
          <CountdownInner to={t.date.getTime()} />
        </div>
      ))}
    </div>
  );
}

function CountdownInner({ to }: { to: number }) {
  // computed client-side to keep SSR deterministic
  if (typeof window === 'undefined') return <p className="text-2xl font-bold text-primary mt-1">—</p>;
  const ms = to - Date.now();
  if (ms <= 0) return <p className="text-2xl font-bold text-success mt-1">done!</p>;
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  return <p className="text-2xl font-bold text-primary mt-1 tabular-nums">{d}d {h}h</p>;
}

export default function ExamPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2"><GraduationCap className="h-6 w-6 text-primary" />Exam Prep</h1>
          <Link
            href="/exam/cheat-sheet"
            className="text-xs px-3 py-1.5 rounded-full bg-primary/15 text-primary hover:bg-primary/25 font-medium transition-colors inline-flex items-center gap-1.5"
          >
            <BookMarked className="h-3.5 w-3.5" /> Exam Reference Sheet (Printable) →
          </Link>
        </div>
        <p className="text-sm text-muted-foreground max-w-3xl">{COURSE_INFO.name} · {COURSE_INFO.year} · {COURSE_INFO.lecturers}. Two partial exams of 60 multiple-choice questions each; your average decides the course grade (pass ≥ 5.5, one exam may compensate the other). Built from the official course manual and study guide.</p>
      </div>

      <section className="space-y-3" aria-labelledby="exams-heading">
        <h2 id="exams-heading" className="text-xl font-semibold flex items-center gap-2"><CalendarClock className="h-5 w-5 text-primary" />Exams &amp; material</h2>
        <Countdown />
        <div className="grid gap-4 lg:grid-cols-3">
          {EXAMS.map((e) => (
            <div key={e.id} className={`panel rounded-lg p-4 space-y-2 ${e.id !== 'resit' ? 'border border-primary/30' : ''}`}>
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-semibold">{e.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary flex items-center gap-1"><Timer className="h-3 w-3" />{e.questions} MC</span>
              </div>
              <p className="text-sm text-primary">{e.date}</p>
              <p className="text-xs text-muted-foreground">{e.time} · {e.weeks}</p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                {e.material.map((m, i) => <li key={i}>{m}</li>)}
              </ul>
              <p className="text-[11px] text-muted-foreground">{e.note}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1.5"><BookMarked className="h-3.5 w-3.5" />{COURSE_INFO.book} · {COURSE_INFO.syllabus} · {COURSE_INFO.format}</p>
      </section>

      <SampleExam />

      <WeeklyPlan />

      <section className="space-y-3" aria-labelledby="tips-heading">
        <h2 id="tips-heading" className="text-xl font-semibold flex items-center gap-2"><Lightbulb className="h-5 w-5 text-primary" />How to study for this course</h2>
        <p className="text-sm text-muted-foreground">Condensed from the official study guide (“How should I study for this course and prepare for the exam?”).</p>
        <div className="grid gap-3 md:grid-cols-2">
          {STUDY_TIPS.map((t) => (
            <div key={t.title} className="panel rounded-lg p-4">
              <p className="font-semibold text-sm">{t.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{t.body}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Put the tools to work: rehearse with <Link href="/study" className="text-primary hover:underline">flashcards</Link>, study anatomy in the <Link href="/atlas" className="text-primary hover:underline">3D atlas</Link>, organise the big picture in the <Link href="/mindmap" className="text-primary hover:underline">mind-map</Link>, and drill the sims on each module page.</p>
      </section>
    </div>
  );
}
