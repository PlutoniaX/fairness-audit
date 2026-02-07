interface MethodologyPanelProps {
  component: 'c1' | 'c2' | 'c3' | 'c4';
  title: string;
  description: string;
}

const borderColorMap = {
  c1: 'border-l-[var(--c1)] bg-c1-light',
  c2: 'border-l-[var(--c2)] bg-c2-light',
  c3: 'border-l-[var(--c3)] bg-c3-light',
  c4: 'border-l-[var(--c4)] bg-c4-light',
};

export function MethodologyPanel({ component, title, description }: MethodologyPanelProps) {
  return (
    <div className={`bg-card rounded-xl p-5 mb-6 border border-border border-l-4 ${borderColorMap[component]}`}>
      <h3 className="text-[0.92rem] font-semibold mb-1.5">{title}</h3>
      <p className="text-[0.84rem] text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
