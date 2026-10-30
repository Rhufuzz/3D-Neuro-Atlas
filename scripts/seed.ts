import bcrypt from 'bcryptjs';
import { prisma } from '../lib/db';

// Optional admin bootstrap. Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env, then run `npm run seed`.
// Upsert only (never deletes); skipped entirely when the variables are not set.
async function main() {
  const email = (process.env.SEED_ADMIN_EMAIL ?? '').trim().toLowerCase();
  const plain = process.env.SEED_ADMIN_PASSWORD ?? '';
  if (!email || !plain) {
    console.log('seed: SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set, nothing to do');
    return;
  }
  const password = await bcrypt.hash(plain, 10);
  await prisma.user.upsert({
    where: { email },
    update: { role: 'admin' },
    create: { email, name: 'Admin', password, role: 'admin' },
  });
  console.log(`seed: admin user ${email} ready`);
}

main()
  .catch((e: unknown) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
