import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { LEARN } from '@/lib/data/learn';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const rows = await prisma.learnStepProgress.findMany({ where: { userId } });
    return NextResponse.json({ steps: rows.map((r) => ({ moduleId: r.moduleId, stepIndex: r.stepIndex, done: r.done })) });
  } catch (e) {
    console.error('learn GET', e);
    return NextResponse.json({ error: 'Failed to load guided-path progress' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = (await req.json().catch(() => ({}))) as { moduleId?: string; stepIndex?: number; done?: boolean };
    const moduleId = String(body?.moduleId ?? '');
    const steps = LEARN[moduleId];
    if (!steps) return NextResponse.json({ error: 'Unknown module' }, { status: 400 });
    const stepIndex = Number(body?.stepIndex);
    if (!Number.isInteger(stepIndex) || stepIndex < 0 || stepIndex >= steps.length) {
      return NextResponse.json({ error: 'stepIndex out of range' }, { status: 400 });
    }
    const done = !!body?.done;
    await prisma.learnStepProgress.upsert({
      where: { userId_moduleId_stepIndex: { userId, moduleId, stepIndex } },
      create: { userId, moduleId, stepIndex, done },
      update: { done },
    });
    return NextResponse.json({ moduleId, stepIndex, done });
  } catch (e) {
    console.error('learn POST', e);
    return NextResponse.json({ error: 'Failed to save guided-path progress' }, { status: 500 });
  }
}
