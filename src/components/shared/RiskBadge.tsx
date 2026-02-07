import type { RiskClassification, BiasPriority } from '@/types/audit';
import { cn } from '@/lib/utils';

interface RiskBadgeProps {
  level: RiskClassification | BiasPriority | string;
  className?: string;
}

const colorMap: Record<string, string> = {
  Critical: 'bg-[var(--fail-light)] text-[var(--fail)]',
  Elevated: 'bg-[var(--warn-light)] text-[#b8860b]',
  Moderate: 'bg-[rgba(74,144,217,0.1)] text-[#4a90d9]',
  Low: 'bg-[var(--pass-light)] text-[var(--pass)]',
  High: 'bg-[var(--fail-light)] text-[var(--fail)]',
  Medium: 'bg-[var(--warn-light)] text-[#b8860b]',
  Ref: 'bg-[var(--pass-light)] text-[var(--pass)]',
  Strong: 'bg-[var(--fail-light)] text-[var(--fail)]',
};

export function RiskBadge({ level, className }: RiskBadgeProps) {
  return (
    <span
      role="status"
      aria-label={`Risk level: ${level}`}
      className={cn(
        'inline-block px-2.5 py-0.5 rounded-xl text-[0.72rem] font-bold uppercase tracking-wide',
        colorMap[level] ?? 'bg-muted text-muted-foreground',
        className
      )}
    >
      {level}
    </span>
  );
}
