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
    const rows = await prisma.moduleProgress.findMany({ where: { userId } });
    return NextResponse.json({ completed: rows.filter((r) => r.completed).map((r) => r.moduleId) });
  } catch (e) {
    console.error('modules GET', e);
    return NextResponse.json({ error: 'Failed to load module progress' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = (await req.json().catch(() => ({}))) as { moduleId?: string; completed?: boolean };
    const moduleId = String(body?.moduleId ?? '');
    if (!MODULE_MAP[moduleId]) return NextResponse.json({ error: 'Unknown module' }, { status: 400 });
    const completed = !!body?.completed;
    await prisma.moduleProgress.upsert({
      where: { userId_moduleId: { userId, moduleId } },
      create: { userId, moduleId, completed },
      update: { completed },
    });
    return NextResponse.json({ moduleId, completed });
  } catch (e) {
    console.error('modules POST', e);
    return NextResponse.json({ error: 'Failed to save module progress' }, { status: 500 });
  }
}
