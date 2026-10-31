import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { MODULES, MODULE_MAP } from '@/lib/data/curriculum';
import { LEARN } from '@/lib/data/learn';
import { FLASHCARDS } from '@/lib/data/flashcards';

export const dynamic = 'force-dynamic';

export interface ReadinessWeek {
  week: number;
  module: string;
  moduleTitle: string;
  goalsDone: number;
  goalsTotal: number;
  stepsDone: number;
  stepsTotal: number;
  quizScore: number;
  quizTotal: number;
  pct: number;
}

export interface WeakGoal {
  moduleId: string;
  moduleTitle: string;
  goalIndex: number;
  goalText: string;
}

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const [goalRows, stepRows, quizRows, cardRows, customRows, sampleRows, elabRows] = await Promise.all([
      prisma.goalProgress.findMany({ where: { userId, done: true } }),
      prisma.learnStepProgress.findMany({ where: { userId, done: true } }),
      prisma.quizAttempt.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 100 }),
      prisma.flashcardProgress.findMany({ where: { userId } }),
      prisma.userFlashcard.findMany({ where: { userId } }),
      prisma.sampleExamAttempt.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 50 }),
      prisma.goalElaboration.findMany({ where: { userId } }),
    ]);

    // Study streak: consecutive UTC days (ending today, with a 1-day grace) with any
    // saved activity — reviews, quiz/drill attempts, sample exams, ticks, elaborations.
    const activityDays = new Set<string>();
    const addDay = (d: Date | null | undefined) => { if (d) activityDays.add(new Date(d).toISOString().slice(0, 10)); };
    cardRows.forEach((r) => addDay(r.lastReviewed));
    customRows.forEach((r) => addDay(r.updatedAt));
    quizRows.forEach((r) => addDay(r.createdAt));
    sampleRows.forEach((r) => addDay(r.createdAt));
    stepRows.forEach((r) => addDay(r.updatedAt));
    goalRows.forEach((r) => addDay(r.updatedAt));
    elabRows.forEach((r) => addDay(r.updatedAt));
    let streak = 0;
    if (activityDays.size > 0) {
      const day = (d: Date) => d.toISOString().slice(0, 10);
      let cursor = new Date();
      if (!activityDays.has(day(cursor))) cursor = new Date(Date.now() - 86400000);
      while (activityDays.has(day(cursor))) { streak += 1; cursor = new Date(cursor.getTime() - 86400000); }
    }

    // Flashcard stats
    const now = Date.now();
    const flashcardsDue = cardRows.filter((r) => new Date(r.dueAt).getTime() <= now).length
      + customRows.filter((r) => new Date(r.dueAt).getTime() <= now).length;
    const flashcardsTotal = FLASHCARDS.length + customRows.length;

    // Per-module goal and step sets
    const goalsSet = new Set(goalRows.map((r) => `${r.moduleId}:${r.goalIndex}`));
    const stepsSet = new Set(stepRows.map((r) => `${r.moduleId}:${r.stepIndex}`));

    // Quiz accuracy by week
    const weekAccuracy: Record<number, { correct: number; total: number }> = {};
    quizRows.forEach((r) => {
      const answers = Array.isArray(r.answers) ? r.answers : [];
      (answers as { qid?: string; correct?: boolean }[]).forEach((a) => {
        // week is inferred from qid prefix if possible (e.g. q1-01 -> 1)
        const m = (a?.qid ?? '').match(/^q(\d+)-/);
        if (m) {
          const w = Number(m[1]);
          const slot = (weekAccuracy[w] ??= { correct: 0, total: 0 });
          slot.total += 1;
          if (a?.correct) slot.correct += 1;
        }
      });
    });

    // Per-module aggregation (1-8)
    const modules = MODULES.map((m) => {
      const gDone = m.goals.filter((_, i) => goalsSet.has(`${m.id}:${i}`)).length;
      const gTotal = m.goals.length;
      const sTotal = LEARN[m.id]?.length ?? 0;
      const sDone = Array.from({ length: sTotal }, (_, i) => i).filter((i) => stepsSet.has(`${m.id}:${i}`)).length;
      let qCorrect = 0, qTotal = 0;
      m.weeks.forEach((w) => {
        const a = weekAccuracy[w];
        if (a) { qCorrect += a.correct; qTotal += a.total; }
      });
      // Composite mastery: 50% goals + 30% steps + 20% quiz (or reweighted if no quiz taken)
      const gRatio = gTotal > 0 ? gDone / gTotal : 0;
      const sRatio = sTotal > 0 ? sDone / sTotal : 0;
      const qRatio = qTotal > 0 ? qCorrect / qTotal : 0;
      const pct = qTotal > 0
        ? Math.round((gRatio * 0.5 + sRatio * 0.3 + qRatio * 0.2) * 100)
        : Math.round((gRatio * 0.65 + sRatio * 0.35) * 100);
      return {
        id: m.id,
        number: m.number,
        title: m.title,
        weekLabel: m.weekLabel,
        weeks: m.weeks,
        color: m.color,
        goalsDone: gDone,
        goalsTotal: gTotal,
        stepsDone: sDone,
        stepsTotal: sTotal,
        quizScore: qCorrect,
        quizTotal: qTotal,
        pct,
      };
    });

    // Overall readiness (Partial = weeks 1-7 = modules 1-5; Final = all 8)
    const partialMods = modules.filter((m) => m.number <= 5);
    const partialPct = Math.round(partialMods.reduce((s, m) => s + m.pct, 0) / Math.max(1, partialMods.length));
    const finalPct = Math.round(modules.reduce((s, m) => s + m.pct, 0) / Math.max(1, modules.length));

    // Weakest goals in Partial exam scope (un-ticked goals from lowest-pct modules)
    const weakest: WeakGoal[] = [];
    const sorted = partialMods.slice().sort((a, b) => a.pct - b.pct);
    for (const mod of sorted) {
      const def = MODULE_MAP[mod.id];
      if (!def) continue;
      for (let i = 0; i < def.goals.length; i++) {
        if (!goalsSet.has(`${mod.id}:${i}`)) {
          weakest.push({ moduleId: mod.id, moduleTitle: mod.title, goalIndex: i, goalText: def.goals[i] });
          if (weakest.length >= 3) break;
        }
      }
      if (weakest.length >= 3) break;
    }

    return NextResponse.json({
      readiness: { partialPct, finalPct, modules, weakest },
      flashcards: { due: flashcardsDue, total: flashcardsTotal },
      streak,
    });
  } catch (e) {
    console.error('readiness GET', e);
    return NextResponse.json({ error: 'Failed to compute readiness' }, { status: 500 });
  }
}
