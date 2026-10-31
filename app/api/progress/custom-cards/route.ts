import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const MAX_FRONT = 500;
const MAX_BACK = 2000;

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const cards = await prisma.userFlashcard.findMany({ where: { userId }, orderBy: { createdAt: 'asc' }, take: 500 });
    return NextResponse.json({ cards });
  } catch (e) {
    console.error('custom-cards GET', e);
    return NextResponse.json({ error: 'Failed to load custom cards' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = (await req.json().catch(() => ({}))) as { front?: string; back?: string; sourceKind?: string; sourceRef?: string };
    const front = String(body?.front ?? '').trim().slice(0, MAX_FRONT);
    const back = String(body?.back ?? '').trim().slice(0, MAX_BACK);
    if (!front || !back) return NextResponse.json({ error: 'front and back are required' }, { status: 400 });
    const sourceKind = ['manual', 'drill', 'quiz', 'sample-exam'].includes(String(body?.sourceKind)) ? String(body.sourceKind) : 'manual';
    const sourceRef = body?.sourceRef ? String(body.sourceRef).slice(0, 100) : null;
    const card = await prisma.userFlashcard.create({ data: { userId, front, back, sourceKind, sourceRef } });
    return NextResponse.json({ card }, { status: 201 });
  } catch (e) {
    console.error('custom-cards POST', e);
    return NextResponse.json({ error: 'Failed to save card' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const id = new URL(req.url).searchParams.get('id') ?? '';
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const row = await prisma.userFlashcard.findUnique({ where: { id } });
    if (!row || row.userId !== userId) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await prisma.userFlashcard.delete({ where: { id } });
    return NextResponse.json({ deleted: id });
  } catch (e) {
    console.error('custom-cards DELETE', e);
    return NextResponse.json({ error: 'Failed to delete card' }, { status: 500 });
  }
}
