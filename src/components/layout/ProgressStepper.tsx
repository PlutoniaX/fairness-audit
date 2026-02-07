'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuditStore } from '@/store/audit-store';
import { Check } from 'lucide-react';

const steps = [
  { href: '/', label: 'Overview', num: 0, section: 'overview' },
  { href: '/c1-historical-context', label: 'Context', num: 1, section: 'c1', color: 'var(--c1)' },
  { href: '/c2-fairness-definitions', label: 'Definitions', num: 2, section: 'c2', color: 'var(--c2)' },
  { href: '/c3-bias-sources', label: 'Bias', num: 3, section: 'c3', color: 'var(--c3)' },
  { href: '/c4-fairness-metrics', label: 'Metrics', num: 4, section: 'c4', color: 'var(--c4)' },
];

export function ProgressStepper() {
  const pathname = usePathname();
  const componentStatus = useAuditStore(s => s.componentStatus);

  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => {
        const isActive = pathname === step.href;
        const isComplete = step.section !== 'overview' && componentStatus[step.section] === 'complete';

        return (
          <div key={step.href} className="flex items-center">
            {i > 0 && <div className="w-6 h-0.5 bg-border flex-shrink-0" />}
            <Link
              href={step.href}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors hover:bg-muted',
                isActive && 'bg-muted'
              )}
            >
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-[0.78rem] font-bold flex-shrink-0 transition-all',
                  isComplete
                    ? 'bg-[var(--pass)] text-white'
                    : isActive
                      ? 'bg-primary text-primary-foreground shadow-[0_0_0_3px_rgba(74,144,217,0.3)]'
                      : 'bg-border text-muted-foreground'
                )}
              >
                {isComplete ? <Check size={14} /> : step.num}
              </div>
              <span
                className={cn(
                  'text-[0.76rem] font-medium max-md:hidden',
                  isActive ? 'text-foreground font-semibold' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
