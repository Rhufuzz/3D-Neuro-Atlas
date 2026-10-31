import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { MODULE_MAP } from '@/lib/data/curriculum';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const rows = await prisma.goalProgress.findMany({ where: { userId } });
    return NextResponse.json({ goals: rows.map((r) => ({ moduleId: r.moduleId, goalIndex: r.goalIndex, done: r.done })) });
  } catch (e) {
    console.error('goals GET', e);
    return NextResponse.json({ error: 'Failed to load goal progress' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = (await req.json().catch(() => ({}))) as { moduleId?: string; goalIndex?: number; done?: boolean };
    const moduleId = String(body?.moduleId ?? '');
    const mod = MODULE_MAP[moduleId];
    if (!mod) return NextResponse.json({ error: 'Unknown module' }, { status: 400 });
    const goalIndex = Number(body?.goalIndex);
    if (!Number.isInteger(goalIndex) || goalIndex < 0 || goalIndex >= mod.goals.length) {
      return NextResponse.json({ error: 'goalIndex out of range' }, { status: 400 });
    }
    const done = !!body?.done;
    await prisma.goalProgress.upsert({
      where: { userId_moduleId_goalIndex: { userId, moduleId, goalIndex } },
      create: { userId, moduleId, goalIndex, done },
      update: { done },
    });
    return NextResponse.json({ moduleId, goalIndex, done });
  } catch (e) {
    console.error('goals POST', e);
    return NextResponse.json({ error: 'Failed to save goal progress' }, { status: 500 });
  }
}
