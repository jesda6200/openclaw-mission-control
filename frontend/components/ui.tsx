import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export function Shell({ children }: { children: ReactNode }) {
  return <main className="min-h-screen bg-grid px-4 py-8 sm:px-6 lg:px-8">{children}</main>;
}

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn('card p-6 shadow-glow', className)}>{children}</section>;
}

export function Pill({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'success' | 'warning' }) {
  const tones = {
    default: 'bg-white/8 text-slate-200',
    success: 'bg-emerald-400/10 text-emerald-300',
    warning: 'bg-amber-400/10 text-amber-300',
  } as const;
  return <span className={cn('inline-flex rounded-full px-3 py-1 text-xs font-medium', tones[tone])}>{children}</span>;
}

export function SectionTitle({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">{eyebrow}</p>
      <h2 className="text-2xl font-semibold text-white sm:text-3xl">{title}</h2>
      <p className="max-w-2xl text-sm text-slate-300 sm:text-base">{subtitle}</p>
    </div>
  );
}
