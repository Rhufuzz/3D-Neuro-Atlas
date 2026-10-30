'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import CiteChips from '@/components/cite-chips';

export const COL = {
  primary: 'hsl(var(--primary))',
  muted: 'hsl(var(--muted-foreground))',
  mutedBg: 'hsl(var(--muted))',
  border: 'hsl(var(--border))',
  fg: 'hsl(var(--foreground))',
  bg: 'hsl(var(--background))',
  ok: 'hsl(var(--success))',
  warn: 'hsl(var(--warning))',
  bad: 'hsl(var(--destructive))',
  sec: 'hsl(var(--secondary))',
};

export function Chip({ active, onClick, children, title }: { active?: boolean; onClick: () => void; children: ReactNode; title?: string }) {
  return (
    <button type="button" onClick={onClick} title={title} aria-pressed={!!active}
      className={`text-xs px-2.5 py-1 rounded-full transition-colors ${active ? 'bg-primary text-primary-foreground' : 'bg-muted/60 text-muted-foreground hover:text-primary'}`}>
      {children}
    </button>
  );
}

export function SimCard({ title, subtitle, cites = [], children }: { title: string; subtitle?: string; cites?: string[]; children: ReactNode }) {
  return (
    <div className="panel rounded-lg p-4 space-y-3 min-w-0">
      <div>
        <h3 className="font-semibold">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {children}
      {cites.length > 0 && <CiteChips ids={cites} className="pt-1" />}
    </div>
  );
}

/** Horizontal 0..1 meter. */
export function Meter({ label, value, color = COL.primary, right }: { label: string; value: number; color?: string; right?: string }) {
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className="text-xs">
      <div className="flex justify-between text-muted-foreground"><span>{label}</span><span>{right ?? `${Math.round(v * 100)}%`}</span></div>
      <div className="h-2 rounded-full bg-muted overflow-hidden mt-0.5"><div className="h-full rounded-full transition-all duration-300" style={{ width: `${v * 100}%`, background: color }} /></div>
    </div>
  );
}

export function AtlasLink({ s, children }: { s: string; children: ReactNode }) {
  return <Link href={`/atlas?s=${s}`} className="text-primary hover:underline">{children}</Link>;
}

export function LabLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="inline-flex text-xs px-2.5 py-1 rounded-full bg-primary/15 text-primary hover:bg-primary/25 transition-colors">{children}</Link>;
}
