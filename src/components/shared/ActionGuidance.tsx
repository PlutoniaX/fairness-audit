import { cn } from '@/lib/utils';

interface ActionItem {
  level?: 'critical' | 'elevated' | 'normal';
  title: string;
  description: string;
}

interface ActionGuidanceProps {
  title: string;
  items: ActionItem[];
  className?: string;
}

const levelStyles: Record<string, string> = {
  critical: 'border-l-[var(--fail)] bg-[rgba(231,76,60,0.04)]',
  elevated: 'border-l-[var(--warn)] bg-[rgba(240,173,78,0.04)]',
  normal: 'border-l-border bg-muted',
};

export function ActionGuidance({ title, items, className }: ActionGuidanceProps) {
  return (
    <div className={cn('bg-card border border-border rounded-xl p-5 my-5', className)}>
      <h4 className="text-[0.95rem] font-semibold mb-3">{title}</h4>
      {items.map((item, i) => (
        <div
          key={i}
          className={cn(
            'p-3 border-l-[3px] rounded-r-lg mb-2 text-[0.84rem]',
            levelStyles[item.level ?? 'normal']
          )}
        >
          <strong className="block mb-0.5">{item.title}</strong>
          {item.description}
        </div>
      ))}
    </div>
  );
}
