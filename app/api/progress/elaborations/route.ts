import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { MODULE_MAP } from '@/lib/data/curriculum';

export const dynamic = 'force-dynamic';

const MAX_LEN = 4000;
const CONFIDENCE_VALUES = ['clear', 'shaky', 'lost'] as const;

export async function GET(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const url = new URL(req.url);
    const moduleId = url.searchParams.get('moduleId');
    const where = moduleId ? { userId, moduleId } : { userId };
    const rows = await prisma.goalElaboration.findMany({ where });
    return NextResponse.json({
      elaborations: rows.map((r) => ({
        moduleId: r.moduleId,
        goalIndex: r.goalIndex,
        text: r.text,
        confidence: r.confidence,
        updatedAt: r.updatedAt.toISOString(),
      })),
    });
  } catch (e) {
    console.error('elaborations GET', e);
    return NextResponse.json({ error: 'Failed to load elaborations' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = (await req.json().catch(() => ({}))) as {
      moduleId?: string;
      goalIndex?: number;
      text?: string;
      confidence?: string;
    };
    const moduleId = String(body?.moduleId ?? '');
    const mod = MODULE_MAP[moduleId];
    if (!mod) return NextResponse.json({ error: 'Unknown module' }, { status: 400 });
    const goalIndex = Number(body?.goalIndex);
    if (!Number.isInteger(goalIndex) || goalIndex < 0 || goalIndex >= mod.goals.length) {
      return NextResponse.json({ error: 'goalIndex out of range' }, { status: 400 });
    }
    const text = String(body?.text ?? '').trim().slice(0, MAX_LEN);
    const confidence = CONFIDENCE_VALUES.includes(body?.confidence as never) ? String(body.confidence) : 'shaky';

    const row = await prisma.goalElaboration.upsert({
      where: { userId_moduleId_goalIndex: { userId, moduleId, goalIndex } },
      create: { userId, moduleId, goalIndex, text, confidence },
      update: { text, confidence },
    });
    return NextResponse.json({
      elaboration: {
        moduleId: row.moduleId,
        goalIndex: row.goalIndex,
        text: row.text,
        confidence: row.confidence,
      },
    });
  } catch (e) {
    console.error('elaborations POST', e);
    return NextResponse.json({ error: 'Failed to save elaboration' }, { status: 500 });
  }
}
