import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { QUIZ_MAP } from '@/lib/data/quiz';

export const dynamic = 'force-dynamic';

interface Answer { qid: string; pick: number; correct: boolean }

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const rows = await prisma.quizAttempt.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 200 });
    const goals: Record<string, { correct: number; total: number }> = {};
    const weeks: Record<string, { correct: number; total: number }> = {};
    rows.forEach((r) => {
      const answers = (Array.isArray(r.answers) ? r.answers : []) as unknown as Answer[];
      answers.forEach((a: Answer) => {
        const q = QUIZ_MAP[a?.qid ?? ''];
        if (!q) return;
        const g = (goals[q.goal] ??= { correct: 0, total: 0 });
        const w = (weeks[String(q.week)] ??= { correct: 0, total: 0 });
        g.total += 1; w.total += 1;
        if (a?.correct) { g.correct += 1; w.correct += 1; }
      });
    });
    const attempts = rows.slice(0, 20).map((r) => ({ id: r.id, mode: r.mode, scope: r.scope, score: r.score, total: r.total, durationS: r.durationS, createdAt: r.createdAt }));
    return NextResponse.json({ attempts, goals, weeks });
  } catch (e) {
    console.error('quiz GET', e);
    return NextResponse.json({ error: 'Failed to load attempts' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = (await req.json().catch(() => ({}))) as { mode?: string; scope?: string; durationS?: number; answers?: Answer[] };
    const raw = Array.isArray(body?.answers) ? body.answers : [];
    const answers: Answer[] = raw
      .filter((a: Answer) => !!QUIZ_MAP[a?.qid ?? ''])
      .slice(0, 200)
      .map((a: Answer) => ({ qid: a.qid, pick: Number(a.pick), correct: Number(a.pick) === QUIZ_MAP[a.qid].answer }));
    if (answers.length === 0) return NextResponse.json({ error: 'No valid answers' }, { status: 400 });
    const mode = body?.mode === 'exam' ? 'exam' : 'practice';
    const scope = body?.scope === 'partial' ? 'partial' : 'final';
    const score = answers.filter((a: Answer) => a.correct).length;
    const row = await prisma.quizAttempt.create({
      data: { userId, mode, scope, score, total: answers.length, durationS: Math.max(0, Math.min(86400, Math.round(Number(body?.durationS) || 0))), answers: answers as unknown as object },
    });
    return NextResponse.json({ id: row.id, score, total: answers.length }, { status: 201 });
  } catch (e) {
    console.error('quiz POST', e);
    return NextResponse.json({ error: 'Failed to save attempt' }, { status: 500 });
  }
}
