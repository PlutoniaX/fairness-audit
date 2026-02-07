'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhaseCardProps {
  num: number;
  title: string;
  color: string;
  plainLanguage: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function PhaseCard({ num, title, color, plainLanguage, defaultOpen = false, children }: PhaseCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-card rounded-xl border border-border mb-4 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-muted transition-colors cursor-pointer"
      >
        <h4 className="text-[0.92rem] font-semibold flex items-center gap-2.5">
          <span
            className="w-7 h-7 rounded-full flex items-center justify-center text-[0.78rem] font-bold text-white flex-shrink-0"
            style={{ backgroundColor: color }}
          >
            {num}
          </span>
          {title}
        </h4>
        <ChevronDown
          size={18}
          className={cn(
            'text-muted-foreground transition-transform',
            open && 'rotate-180'
          )}
        />
      </button>
      {open && (
        <div className="px-5 pb-5">
          <div className="bg-muted rounded-lg p-2.5 text-[0.82rem] text-muted-foreground mb-3.5 border-l-[3px] border-border italic">
            {plainLanguage}
          </div>
          {children}
        </div>
      )}
    </div>
  );
}
