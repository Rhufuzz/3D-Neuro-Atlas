import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { SAMPLE_EXAM } from '@/lib/data/sample-exam';

export const dynamic = 'force-dynamic';

interface Answer { n: number; pick: number }

const EXAM_MAP = new Map(SAMPLE_EXAM.map((q) => [q.n, q]));

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const rows = await prisma.sampleExamAttempt.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 50 });
    const byPart: Record<string, { attempts: { score: number; total: number; createdAt: string }[] }> = {};
    rows.forEach((r) => {
      (byPart[r.part] ??= { attempts: [] });
      if (byPart[r.part].attempts.length < 10) byPart[r.part].attempts.push({ score: r.score, total: r.total, createdAt: r.createdAt.toISOString() });
    });
    return NextResponse.json({ attempts: rows.map((r) => ({ id: r.id, part: r.part, score: r.score, total: r.total, createdAt: r.createdAt.toISOString() })), byPart });
  } catch (e) {
    console.error('sample-exam GET', e);
    return NextResponse.json({ error: 'Failed to load attempts' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = (await req.json().catch(() => ({}))) as { part?: string; durationS?: number; answers?: Answer[] };
    const part = ['pre', 'post', 'all'].includes(String(body?.part)) ? String(body.part) : 'all';
    const allowed = new Set(SAMPLE_EXAM.filter((q) => part === 'all' || q.part === part).map((q) => q.n));
    const raw = Array.isArray(body?.answers) ? body.answers : [];
    const answers = raw
      .filter((a) => EXAM_MAP.has(Number(a?.n)))
      .filter((a) => allowed.has(Number(a.n)))
      .slice(0, 100)
      .map((a) => ({ n: Number(a.n), pick: Number(a.pick), correct: Number(a.pick) === EXAM_MAP.get(Number(a.n))!.answer }));
    if (answers.length === 0) return NextResponse.json({ error: 'No valid answers' }, { status: 400 });
    const score = answers.filter((a) => a.correct).length;
    const total = allowed.size;
    const row = await prisma.sampleExamAttempt.create({
      data: { userId, part, score, total, answers: answers as unknown as object },
    });
    return NextResponse.json({ id: row.id, score, total, answered: answers.length }, { status: 201 });
  } catch (e) {
    console.error('sample-exam POST', e);
    return NextResponse.json({ error: 'Failed to save attempt' }, { status: 500 });
  }
}
