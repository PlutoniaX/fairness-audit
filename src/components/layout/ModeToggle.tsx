'use client';

import { useState, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
import { useAuditStore } from '@/store/audit-store';
import { cn } from '@/lib/utils';
import type { AuditMode } from '@/types/audit';

export function ModeToggle() {
  const mode = useAuditStore(s => s.mode);
  const setMode = useAuditStore(s => s.setMode);
  const [showHelp, setShowHelp] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Before hydration, always show 'learn' as active to match SSR default
  const activeMode = mounted ? mode : 'learn';

  const modes: { value: AuditMode; label: string }[] = [
    { value: 'learn', label: 'Learn' },
    { value: 'audit', label: 'Audit' },
  ];

  return (
    <div className="flex items-center gap-2">
      <div className="flex bg-muted rounded-full p-0.5 border border-border">
        {modes.map(m => (
          <button
            key={m.value}
            onClick={() => setMode(m.value)}
            title={m.value === 'learn' ? 'Explore the Robodebt case study (read-only)' : 'Conduct your own audit (editable, auto-saves)'}
            className={cn(
              'px-4 py-1.5 rounded-full text-[0.82rem] font-semibold transition-all cursor-pointer',
              activeMode === m.value
                ? 'bg-[#1a1a2e] text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Help popover */}
      <div className="relative">
        <button
          onClick={() => setShowHelp(!showHelp)}
          onBlur={() => setTimeout(() => setShowHelp(false), 150)}
          className="p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          aria-label="What are Learn and Audit modes?"
        >
          <HelpCircle size={16} />
        </button>

        {showHelp && (
          <div className="absolute top-full right-0 mt-2 w-72 bg-card border border-border rounded-xl p-4 shadow-lg z-50 text-[0.82rem]">
            <div className="mb-3">
              <h4 className="font-semibold mb-1">Learn Mode</h4>
              <p className="text-muted-foreground leading-relaxed">
                Explore the Robodebt case study with pre-filled data. All worksheets are read-only so you can understand the methodology by seeing a completed audit.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Audit Mode</h4>
              <p className="text-muted-foreground leading-relaxed">
                Conduct your own fairness audit with blank worksheets. Your work auto-saves to your browser. Optionally enable AI assistance with an API key.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
