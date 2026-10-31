'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Brain, Mail, Lock, User } from 'lucide-react';

export default function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'signup') {
        const r = await fetch('/api/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) });
        if (!r.ok) {
          const d = await r.json().catch(() => ({}));
          setError((d as { error?: string })?.error ?? 'Sign-up failed');
          setBusy(false);
          return;
        }
      }
      const res = await signIn('credentials', { email, password, redirect: false });
      if (res?.error) setError('Invalid email or password.');
      else router.replace('/home');
    } catch (err) {
      console.error(err);
      setError('Something went wrong');
    }
    setBusy(false);
  };

  const field = 'w-full bg-muted rounded-md py-2 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary';
  return (
    <div className="min-h-screen neuro-bg grid place-items-center p-4">
      <form onSubmit={submit} className="glass-panel rounded-xl p-8 w-full max-w-sm space-y-4">
        <div className="text-center space-y-1">
          <Brain className="h-10 w-10 text-primary mx-auto" />
          <h1 className="text-2xl font-bold glow-text">CORTEX-AETHER</h1>
          <p className="text-sm text-muted-foreground">{mode === 'login' ? 'Sign in to your neuro-atlas' : 'Create your study account'}</p>
        </div>
        {mode === 'signup' && (
          <div className="relative"><User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><input aria-label="Name" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className={field} /></div>
        )}
        <div className="relative"><Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><input aria-label="Email" type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} /></div>
        <div className="relative"><Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><input aria-label="Password" type="password" required minLength={6} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={field} /></div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button disabled={busy} className="w-full bg-primary text-primary-foreground rounded-md py-2 font-medium hover:opacity-90 disabled:opacity-50">{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Sign up'}</button>
        <p className="text-center text-sm text-muted-foreground">
          {mode === 'login' ? <>No account? <Link href="/signup" className="text-primary hover:underline">Sign up</Link></> : <>Have an account? <Link href="/login" className="text-primary hover:underline">Sign in</Link></>}
        </p>
      </form>
    </div>
  );
}
