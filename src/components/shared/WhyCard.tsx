interface WhyCardProps {
  component: 'c1' | 'c2' | 'c3' | 'c4';
  explanation: string;
  example: string;
}

const bgMap = {
  c1: 'bg-c1-light border-l-[var(--c1)]',
  c2: 'bg-c2-light border-l-[var(--c2)]',
  c3: 'bg-c3-light border-l-[var(--c3)]',
  c4: 'bg-c4-light border-l-[var(--c4)]',
};

export function WhyCard({ component, explanation, example }: WhyCardProps) {
  return (
    <div className={`flex flex-col gap-2 p-4 rounded-xl border border-border border-l-4 mb-5 text-[0.86rem] leading-relaxed text-muted-foreground ${bgMap[component]}`}>
      <p className="text-foreground font-medium">{explanation}</p>
      <div className="text-muted-foreground text-[0.82rem] border-l-[3px] border-border pl-3 mt-1">
        <strong>Robodebt example:</strong> {example}
      </div>
    </div>
  );
}
