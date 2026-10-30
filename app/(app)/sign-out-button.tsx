'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

export default function SignOutButton() {
  return (
    <button onClick={() => signOut({ redirectTo: '/login' })} className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted hover:bg-muted/70 text-foreground w-full">
      <LogOut className="h-4 w-4" />Sign out
    </button>
  );
}
