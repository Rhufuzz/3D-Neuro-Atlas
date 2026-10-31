import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import AuthForm from '../login/auth-form';

export const dynamic = 'force-dynamic';

export default async function SignupPage() {
  const session = await auth();
  if (session?.user) redirect('/home');
  return <AuthForm mode="signup" />;
}
