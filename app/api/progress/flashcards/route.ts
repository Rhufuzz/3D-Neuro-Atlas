import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { FLASHCARD_MAP } from '@/lib/data/flashcards';
import { sm2 } from '@/lib/sm2';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const rows = await prisma.flashcardProgress.findMany({ where: { userId } });
    return NextResponse.json({ progress: rows });
  } catch (e) {
    console.error('flashcards GET', e);
    return NextResponse.json({ error: 'Failed to load progress' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = (await req.json().catch(() => ({}))) as { cardId?: string; grade?: number };
    const cardId = String(body?.cardId ?? '');
    const grade = Number(body?.grade);
    if (!FLASHCARD_MAP[cardId]) return NextResponse.json({ error: 'Unknown card' }, { status: 400 });
    if (!Number.isFinite(grade) || grade < 0 || grade > 5) return NextResponse.json({ error: 'Grade must be 0–5' }, { status: 400 });
    const prev = await prisma.flashcardProgress.findUnique({ where: { userId_cardId: { userId, cardId } } });
    const next = sm2(prev, grade);
    const now = new Date();
    const dueAt = new Date(now.getTime() + next.dueInMinutes * 60000);
    const data = { easeFactor: next.easeFactor, interval: next.interval, repetitions: next.repetitions, lapses: next.lapses, dueAt, lastReviewed: now, lastGrade: Math.round(grade) };
    const row = await prisma.flashcardProgress.upsert({
      where: { userId_cardId: { userId, cardId } },
      create: { userId, cardId, reviews: 1, ...data },
      update: { ...data, reviews: { increment: 1 } },
    });
    return NextResponse.json({ progress: row });
  } catch (e) {
    console.error('flashcards POST', e);
    return NextResponse.json({ error: 'Failed to save review' }, { status: 500 });
  }
}
