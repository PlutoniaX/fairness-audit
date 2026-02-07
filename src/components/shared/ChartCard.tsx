import { cn } from '@/lib/utils';

interface ChartCardProps {
  title: string;
  description?: string;
  borderColor?: string;
  interpretation?: { title: string; text: string };
  children: React.ReactNode;
  className?: string;
}

export function ChartCard({ title, description, borderColor, interpretation, children, className }: ChartCardProps) {
  return (
    <div
      className={cn('bg-card rounded-xl p-6 shadow-sm border border-border mb-6', className)}
      style={borderColor ? { borderTopWidth: 3, borderTopColor: borderColor } : undefined}
    >
      <h3 className="text-[1.05rem] font-semibold mb-1">{title}</h3>
      {description && (
        <p className="text-[0.82rem] text-muted-foreground mb-5">{description}</p>
      )}
      {children}
      {interpretation && (
        <div className="bg-[rgba(74,144,217,0.06)] border-l-[3px] border-[#4a90d9] rounded-r-lg p-3 text-[0.84rem] text-muted-foreground mt-3.5 leading-relaxed">
          <strong className="text-foreground block mb-1">{interpretation.title}</strong>
          {interpretation.text}
        </div>
      )}
    </div>
  );
}
