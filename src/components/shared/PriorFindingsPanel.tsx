'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, FileText } from 'lucide-react';

interface PriorFindingsPanelProps {
  title: string;
  summary: string;
  color: string;
}

// Component colors by keyword in section title
const SECTION_COLORS: Record<string, string> = {
  'Component 1': '#0d9488',
  'Historical Context': '#0d9488',
  'C1': '#0d9488',
  'Component 2': '#6366f1',
  'Fairness Definition': '#6366f1',
  'C2': '#6366f1',
  'Component 3': '#d97706',
  'Bias Source': '#d97706',
  'C3': '#d97706',
};

function sectionColor(heading: string): string {
  for (const [key, color] of Object.entries(SECTION_COLORS)) {
    if (heading.includes(key)) return color;
  }
  return '#6b7280';
}

interface ParsedSection {
  heading: string;
  lines: { type: 'kv' | 'bullet' | 'text'; key?: string; value: string }[];
}

function parseSummary(raw: string): ParsedSection[] {
  const sections: ParsedSection[] = [];
  let current: ParsedSection = { heading: '', lines: [] };

  for (const line of raw.split('\n')) {
    // Section header: === Title ===
    const headerMatch = line.match(/^===\s+(.+?)\s+===$/);
    if (headerMatch) {
      if (current.heading || current.lines.length > 0) {
        sections.push(current);
      }
      current = { heading: headerMatch[1], lines: [] };
      continue;
    }

    const trimmed = line.trim();
    if (!trimmed) continue;

    // Bullet / sub-item lines
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      current.lines.push({ type: 'bullet', value: trimmed.replace(/^[-•]\s+/, '') });
      continue;
    }

    // Step lines (e.g. "  Step 1: ...")
    if (/^\s*Step\s+\d/i.test(line)) {
      const colonIdx = trimmed.indexOf(':');
      if (colonIdx > 0) {
        current.lines.push({
          type: 'kv',
          key: trimmed.slice(0, colonIdx),
          value: trimmed.slice(colonIdx + 1).trim(),
        });
      } else {
        current.lines.push({ type: 'text', value: trimmed });
      }
      continue;
    }

    // Key: Value lines
    const kvMatch = trimmed.match(/^([A-Z][A-Za-z\s/&]+?):\s+(.+)$/);
    if (kvMatch) {
      current.lines.push({ type: 'kv', key: kvMatch[1], value: kvMatch[2] });
      continue;
    }

    // Plain text
    current.lines.push({ type: 'text', value: trimmed });
  }

  if (current.heading || current.lines.length > 0) {
    sections.push(current);
  }

  return sections;
}

export function PriorFindingsPanel({ title, summary, color }: PriorFindingsPanelProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const hasContent = summary && !summary.includes('No Component') && summary.trim().length > 20;

  if (!mounted || !hasContent) return null;

  const sections = parseSummary(summary);

  return (
    <div
      className="bg-card rounded-xl border border-border mb-6 overflow-hidden"
      style={{ borderLeftWidth: 4, borderLeftColor: color }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-muted/50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <FileText size={16} style={{ color }} />
          <span className="text-[0.86rem] font-semibold">{title}</span>
          <span className="text-[0.72rem] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            Prior findings
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="px-5 pb-4 border-t border-border pt-3">
          {/* Banner */}
          <p className="text-[0.75rem] text-muted-foreground italic mb-3">
            From your prior audit work
          </p>

          <div className="space-y-4">
            {sections.map((section, sIdx) => {
              const sc = section.heading ? sectionColor(section.heading) : color;
              return (
                <div key={sIdx}>
                  {/* Section heading */}
                  {section.heading && (
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-1 h-4 rounded-full"
                        style={{ backgroundColor: sc }}
                      />
                      <span
                        className="text-[0.78rem] font-bold uppercase tracking-wide"
                        style={{ color: sc }}
                      >
                        {section.heading}
                      </span>
                    </div>
                  )}

                  {/* Lines */}
                  <div className="space-y-1 pl-3">
                    {section.lines.map((line, lIdx) => {
                      if (line.type === 'kv') {
                        return (
                          <div key={lIdx} className="text-[0.82rem] leading-relaxed">
                            <span className="font-semibold text-foreground">{line.key}: </span>
                            <span className="text-muted-foreground">{line.value}</span>
                          </div>
                        );
                      }
                      if (line.type === 'bullet') {
                        return (
                          <div key={lIdx} className="text-[0.82rem] text-muted-foreground leading-relaxed flex gap-2">
                            <span className="text-muted-foreground/60 flex-shrink-0">•</span>
                            <span>{line.value}</span>
                          </div>
                        );
                      }
                      return (
                        <p key={lIdx} className="text-[0.82rem] text-muted-foreground leading-relaxed">
                          {line.value}
                        </p>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
