'use client';

import { Check } from 'lucide-react';
import type { ComponentProgress } from '@/hooks/useComponentProgress';

interface ProgressIndicatorProps {
  progress: ComponentProgress;
  color: string;
}

export function ProgressIndicator({ progress, color }: ProgressIndicatorProps) {
  const { completed, total, percent, items } = progress;

  return (
    <div className="bg-card rounded-xl border border-border p-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[0.82rem] font-semibold">
          {completed} of {total} sections complete
        </span>
        <span className="text-[0.78rem] font-bold" style={{ color }}>
          {percent}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-muted rounded-full h-2 mb-3 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>

      {/* Checklist */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        {items.map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-1.5 text-[0.78rem] ${
              item.complete ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            {item.complete ? (
              <span
                className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: color }}
              >
                <Check size={10} className="text-white" strokeWidth={3} />
              </span>
            ) : (
              <span className="w-4 h-4 rounded-full border-2 border-border flex-shrink-0" />
            )}
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
