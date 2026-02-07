'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, Copy, Check, ChevronDown } from 'lucide-react';

interface AnalysisPanelProps {
  content: string;
  isStreaming: boolean;
  component: string;
  section: string;
}

export function AnalysisPanel({ content, isStreaming, component, section }: AnalysisPanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);

  const componentColors: Record<string, string> = {
    c1: 'var(--c1)',
    c2: 'var(--c2)',
    c3: 'var(--c3)',
    c4: 'var(--c4)',
  };
  const borderColor = componentColors[component] || 'var(--c2)';

  function handleCopy() {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div
      className="mt-4 rounded-xl border overflow-hidden"
      style={{ borderColor, borderWidth: '1px', borderTopWidth: '3px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/50">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-2 text-[0.84rem] font-semibold cursor-pointer"
        >
          <Bot size={16} style={{ color: borderColor }} />
          AI Analysis — {section}
          {isStreaming && (
            <span className="inline-flex items-center gap-1 text-[0.72rem] font-normal text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              streaming
            </span>
          )}
          <ChevronDown
            size={14}
            className={`text-muted-foreground transition-transform ${collapsed ? '-rotate-90' : ''}`}
          />
        </button>

        <button
          onClick={handleCopy}
          disabled={!content}
          className="inline-flex items-center gap-1 px-2 py-1 rounded text-[0.72rem] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          title="Copy to clipboard"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {/* Content */}
      {!collapsed && (
        <div className="px-5 py-4 text-[0.84rem] leading-relaxed prose prose-sm dark:prose-invert max-w-none">
          {content ? (
            <ReactMarkdown>{content}</ReactMarkdown>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-pulse" />
              Waiting for response...
            </div>
          )}
          {isStreaming && (
            <span className="inline-block w-2 h-4 bg-foreground/60 animate-pulse ml-0.5" />
          )}
        </div>
      )}
    </div>
  );
}
