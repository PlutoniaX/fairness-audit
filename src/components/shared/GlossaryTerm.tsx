'use client';

import { useState } from 'react';
import { GLOSSARY } from '@/lib/data/glossary';

interface GlossaryTermProps {
  slug: string;
  children?: React.ReactNode;
}

export function GlossaryTerm({ slug, children }: GlossaryTermProps) {
  const [open, setOpen] = useState(false);
  const entry = GLOSSARY[slug];
  if (!entry) return <span>{children ?? slug}</span>;

  return (
    <span
      className="glossary-term relative inline"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      tabIndex={0}
    >
      {children ?? entry.term}
      {open && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 w-80 bg-card border border-border rounded-lg p-3 shadow-lg text-[0.82rem] leading-relaxed text-foreground z-[1000] pointer-events-none">
          <strong className="text-[0.84rem] block mb-1">{entry.term}</strong>
          {entry.short}
          <span className="block mt-1.5 text-muted-foreground text-[0.78rem]">{entry.long}</span>
          {entry.citation && (
            <span className="block mt-1.5 text-[0.72rem] italic text-muted-foreground">
              Source: {entry.citation}
            </span>
          )}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-card" />
        </span>
      )}
    </span>
  );
}
