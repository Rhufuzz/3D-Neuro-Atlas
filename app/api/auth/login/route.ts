import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Credential pre-check used by the login form for clear error messages.
// The actual session is established through Auth.js signIn('credentials').
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const email = String(body?.email ?? '').trim().toLowerCase();
    const password = String(body?.password ?? '');
    if (!email || !password) return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { email } });
    const ok = user?.password ? await bcrypt.compare(password, user.password) : false;
    if (!ok) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('login check error', e);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
