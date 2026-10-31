import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/** Operational health probe: 200 when the app + database are serving, 503 otherwise. */
export async function GET() {
  try {
    const users = await prisma.user.count();
    return NextResponse.json({ ok: true, db: 'up', users });
  } catch {
    return NextResponse.json({ ok: false, db: 'down' }, { status: 503 });
  }
}
