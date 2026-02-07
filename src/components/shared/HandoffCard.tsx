import Link from 'next/link';

interface HandoffCardProps {
  title: string;
  description: string;
  nextHref: string;
  nextLabel: string;
  nextColor: string;
}

export function HandoffCard({ title, description, nextHref, nextLabel, nextColor }: HandoffCardProps) {
  return (
    <div className="bg-card rounded-xl p-5 border border-border mt-6 flex items-center justify-between gap-4">
      <div>
        <h4 className="text-[0.92rem] font-semibold">{title}</h4>
        <p className="text-[0.82rem] text-muted-foreground mt-1">{description}</p>
      </div>
      <Link
        href={nextHref}
        className="px-6 py-2.5 rounded-lg text-[0.86rem] font-semibold text-white flex-shrink-0 hover:opacity-90 hover:translate-x-0.5 transition-all"
        style={{ backgroundColor: nextColor }}
      >
        {nextLabel} &rarr;
      </Link>
    </div>
  );
}
