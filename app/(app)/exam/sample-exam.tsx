'use client';

import { useMemo, useState } from 'react';
import { SAMPLE_EXAM, SAMPLE_PARTS } from '@/lib/data/sample-exam';
import { CheckCircle2, XCircle, RotateCcw, ListChecks } from 'lucide-react';
import AddToDeckButton from '@/components/add-to-deck-button';

interface Answer { n: number; pick: number }

export default function SampleExam() {
  const [started, setStarted] = useState(false);
  const [part, setPart] = useState<'pre' | 'post' | 'all'>('all');
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [review, setReview] = useState(false);
  const [reveal, setReveal] = useState(false);

  const pool = useMemo(() => SAMPLE_EXAM.filter((q) => part === 'all' || q.part === part), [part]);
  const q = pool[idx];
  const picked = answers.find((a) => a.n === q?.n)?.pick ?? -1;

  const start = (p: 'pre' | 'post' | 'all') => { setPart(p); setIdx(0); setAnswers([]); setReview(false); setReveal(false); setStarted(true); };
  const pick = (i: number) => setAnswers((a) => [...a.filter((x) => x.n !== q.n), { n: q.n, pick: i }]);
  const next = () => { setReveal(false); if (idx + 1 >= pool.length) setReview(true); else setIdx(idx + 1); };
  const score = pool.filter((qq) => answers.find((a) => a.n === qq.n)?.pick === qq.answer).length;
  const answered = pool.filter((qq) => answers.some((a) => a.n === qq.n)).length;

  if (!started) {
    return (
      <section className="space-y-4" aria-labelledby="sample-heading">
        <div>
          <h2 id="sample-heading" className="text-xl font-semibold flex items-center gap-2"><ListChecks className="h-5 w-5 text-primary" />Practice exam</h2>
          <p className="text-sm text-muted-foreground">The official sample exam — all 65 questions with the published answer key. The real exams have 60 questions and the same style. Answers are checked when you finish (like the real thing).</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <button onClick={() => start('all')} className="panel panel-hover rounded-lg p-4 text-left">
            <p className="font-semibold">Full sample</p><p className="text-xs text-muted-foreground mt-1">65 questions · midterm + post-midterm material</p>
          </button>
          <button onClick={() => start('pre')} className="panel panel-hover rounded-lg p-4 text-left">
            <p className="font-semibold">Midterm material</p><p className="text-xs text-muted-foreground mt-1">46 questions · {SAMPLE_PARTS.pre.material}</p>
          </button>
          <button onClick={() => start('post')} className="panel panel-hover rounded-lg p-4 text-left">
            <p className="font-semibold">Post-midterm material</p><p className="text-xs text-muted-foreground mt-1">19 questions · {SAMPLE_PARTS.post.material}</p>
          </button>
        </div>
      </section>
    );
  }

  if (review) {
    const pct = Math.round((100 * score) / pool.length);
    return (
      <section className="space-y-4" aria-labelledby="result-heading">
        <div className="panel rounded-lg p-5 space-y-3">
          <h2 id="result-heading" className="text-xl font-semibold">Result: {score} / {pool.length} ({pct}%)</h2>
          <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-gradient-to-r from-primary to-cyan-300 rounded-full" style={{ width: `${pct}%` }} /></div>
          <p className="text-sm text-muted-foreground">On the real exam 60 of these style questions count toward your grade; 5.5/10 (≈ 55%) is a pass per exam, and your midterm and final average decides the course grade.</p>
          <div className="flex gap-2">
            <button onClick={() => setStarted(false)} className="text-xs px-3 py-1.5 rounded-full bg-primary text-primary-foreground flex items-center gap-1.5"><RotateCcw className="h-3.5 w-3.5" />Back to overview</button>
            <button onClick={() => start(part)} className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/70">Retry this set</button>
          </div>
        </div>
        <div className="space-y-3">
          {pool.map((qq, k) => {
            const my = answers.find((a) => a.n === qq.n)?.pick ?? -1;
            const ok = my === qq.answer;
            return (
              <div key={qq.n} className={`panel rounded-lg p-4 space-y-2 ${ok ? '' : 'border border-destructive/30'}`}>
                <p className="text-sm font-medium flex gap-2"><span className="text-muted-foreground">{k + 1}.</span>{qq.question}</p>
                <div className="grid gap-1 text-xs">
                  {qq.options.map((o, i) => (
                    <p key={i} className={`px-2 py-1 rounded ${i === qq.answer ? 'bg-success/15 text-success font-medium' : ''} ${i === my && i !== qq.answer ? 'bg-destructive/15 text-destructive' : ''}`}>
                      {String.fromCharCode(97 + i)}. {o}{i === qq.answer ? ' ✓ correct' : ''}{i === my && i !== qq.answer ? ' ✗ your answer' : ''}
                    </p>
                  ))}
                  {my === -1 && <p className="text-[11px] text-warning px-2">not answered</p>}
                </div>
                {!ok && (
                  <AddToDeckButton front={qq.question} back={`${qq.options[qq.answer]} (correct answer)`} sourceKind="sample-exam" sourceRef={`q${qq.n}`} />
                )}
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4" aria-label="Practice exam question">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Question {idx + 1} of {pool.length} · {SAMPLE_PARTS[q.part].label}</span>
        <span>{answered} answered</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary/60 rounded-full transition-all" style={{ width: `${((idx + 1) / pool.length) * 100}%` }} /></div>
      <div className="panel rounded-lg p-5 space-y-4">
        <p className="text-base font-medium">{q.question}</p>
        <div className="grid gap-2">
          {q.options.map((o, i) => {
            const isPicked = picked === i;
            const showState = reveal;
            const correct = i === q.answer;
            return (
              <button key={i} onClick={() => pick(i)}
                className={`text-left text-sm px-3 py-2 rounded-md border transition-colors ${
                  showState && correct ? 'border-success bg-success/15 text-success'
                  : showState && isPicked ? 'border-destructive bg-destructive/15'
                  : isPicked ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
                <span className="font-mono text-xs mr-2">{String.fromCharCode(97 + i)}.</span>{o}
                {showState && correct && <CheckCircle2 className="inline h-4 w-4 ml-2 -mt-0.5" />}
                {showState && isPicked && !correct && <XCircle className="inline h-4 w-4 ml-2 -mt-0.5" />}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground">{reveal ? 'Answer checked — study mode' : 'Answers are checked at the end (exam mode). Check-as-you-go is a study aid.'}</p>
        <div className="flex gap-2">
          {!reveal && picked >= 0 && <button onClick={() => setReveal(true)} className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/70">Check now</button>}
          <button onClick={next} disabled={picked < 0 && !reveal} className="text-xs px-4 py-1.5 rounded-full bg-primary text-primary-foreground disabled:opacity-40">{idx + 1 >= pool.length ? 'Finish' : 'Next'}</button>
        </div>
      </div>
    </section>
  );
}
