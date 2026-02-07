'use client';

import { useRef, useCallback } from 'react';
import { Lock } from 'lucide-react';
import { useAuditStore } from '@/store/audit-store';

interface WorksheetFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  scaffoldTip?: string;
  learnAnnotation?: string;
  multiline?: boolean;
  examplePrompt?: string;
  formatTemplate?: string;
}

export function WorksheetField({
  label,
  value,
  onChange,
  rows = 2,
  placeholder = '',
  scaffoldTip,
  learnAnnotation,
  multiline = true,
  examplePrompt,
  formatTemplate,
}: WorksheetFieldProps) {
  const mode = useAuditStore(s => s.mode);
  const isLearn = mode === 'learn';
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      const val = e.target.value;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => onChange(val), 500);
    },
    [onChange]
  );

  const effectivePlaceholder = (!isLearn && formatTemplate) ? formatTemplate : (isLearn ? '' : placeholder);

  return (
    <div className={`mb-4 ${isLearn ? 'opacity-75' : ''}`}>
      <label className="block text-[0.82rem] font-semibold text-foreground mb-1.5">
        {label}
        {isLearn && <Lock size={12} className="inline ml-1.5 text-muted-foreground" />}
      </label>

      {!isLearn && scaffoldTip && (
        <div className="border-2 border-dashed border-[var(--c2)]/40 bg-[var(--c2)]/[0.04] rounded-lg p-2.5 text-[0.78rem] text-muted-foreground mb-2">
          <strong className="text-foreground">Tip:</strong> {scaffoldTip}
        </div>
      )}

      {multiline ? (
        <textarea
          className={`w-full px-3.5 py-2.5 border border-border rounded-lg text-[0.86rem] font-[inherit] leading-relaxed bg-card text-foreground resize-y transition-colors focus:outline-none focus:border-[var(--c2)] focus:ring-[3px] focus:ring-[var(--c2)]/10 ${
            isLearn ? 'bg-muted text-muted-foreground border-border cursor-default' : ''
          }`}
          rows={rows}
          readOnly={isLearn}
          aria-readonly={isLearn || undefined}
          defaultValue={value}
          placeholder={effectivePlaceholder}
          onChange={handleChange}
        />
      ) : (
        <input
          type="text"
          className={`w-full px-3.5 py-2.5 border border-border rounded-lg text-[0.86rem] font-[inherit] bg-card text-foreground transition-colors focus:outline-none focus:border-[var(--c2)] focus:ring-[3px] focus:ring-[var(--c2)]/10 ${
            isLearn ? 'bg-muted text-muted-foreground border-border cursor-default' : ''
          }`}
          readOnly={isLearn}
          aria-readonly={isLearn || undefined}
          defaultValue={value}
          placeholder={effectivePlaceholder}
          onChange={handleChange}
        />
      )}

      {!isLearn && examplePrompt && (
        <details className="mt-1.5">
          <summary className="text-[0.78rem] text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
            Show example
          </summary>
          <div className="mt-1.5 p-2.5 bg-muted rounded-lg text-[0.78rem] text-muted-foreground leading-relaxed border border-border/50">
            {examplePrompt}
          </div>
        </details>
      )}

      {isLearn && learnAnnotation && (
        <div className="bg-[var(--c1)]/[0.06] border-l-[3px] border-[var(--c1)] rounded-r-lg p-2 text-[0.78rem] text-muted-foreground mt-1.5 mb-3">
          <span className="font-bold text-foreground">Why this answer? </span>
          {learnAnnotation}
        </div>
      )}
    </div>
  );
}
