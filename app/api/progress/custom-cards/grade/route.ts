import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { sm2 } from '@/lib/sm2';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = (await req.json().catch(() => ({}))) as { id?: string; grade?: number };
    const id = String(body?.id ?? '');
    const grade = Number(body?.grade);
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    if (!Number.isFinite(grade) || grade < 0 || grade > 5) return NextResponse.json({ error: 'Grade must be 0–5' }, { status: 400 });
    const prev = await prisma.userFlashcard.findUnique({ where: { id } });
    if (!prev || prev.userId !== userId) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const next = sm2(prev, grade);
    const now = new Date();
    const card = await prisma.userFlashcard.update({
      where: { id },
      data: {
        easeFactor: next.easeFactor,
        interval: next.interval,
        repetitions: next.repetitions,
        lapses: next.lapses,
        dueAt: new Date(now.getTime() + next.dueInMinutes * 60000),
        lastGrade: Math.round(grade),
        reviews: { increment: 1 },
      },
    });
    return NextResponse.json({ card });
  } catch (e) {
    console.error('custom-cards grade POST', e);
    return NextResponse.json({ error: 'Failed to save review' }, { status: 500 });
  }
}
