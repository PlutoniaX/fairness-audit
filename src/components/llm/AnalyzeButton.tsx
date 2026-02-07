'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { useSettingsStore } from '@/store/settings-store';
import { AnalysisPanel } from './AnalysisPanel';

interface AnalyzeButtonProps {
  systemPrompt: string;
  userPrompt: string;
  component: string;
  section: string;
  buttonLabel?: string;
  className?: string;
}

export function AnalyzeButton({
  systemPrompt,
  userPrompt,
  component,
  section,
  buttonLabel = 'Analyze with AI',
  className = '',
}: AnalyzeButtonProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasResult, setHasResult] = useState(false);

  const apiKey = useSettingsStore(s => s.apiKeys[s.activeProvider]);
  const provider = useSettingsStore(s => s.activeProvider);
  const hasKey = apiKey.length > 0;

  async function handleAnalyze() {
    if (!hasKey) {
      setError('Please set your API key in Settings before using AI analysis.');
      return;
    }

    setIsStreaming(true);
    setStreamedContent('');
    setError(null);
    setHasResult(false);

    try {
      const response = await fetch('/api/llm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-LLM-API-Key': apiKey,
        },
        body: JSON.stringify({
          provider,
          systemPrompt,
          userPrompt,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || `HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setStreamedContent(accumulated);
      }

      setHasResult(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Analysis failed';
      setError(message);
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <div className={className}>
      <button
        onClick={handleAnalyze}
        disabled={isStreaming}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[0.84rem] font-semibold transition-all ${
          isStreaming
            ? 'bg-muted text-muted-foreground cursor-wait'
            : hasKey
            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 shadow-sm hover:shadow-md cursor-pointer'
            : 'bg-muted text-muted-foreground border border-dashed border-border cursor-pointer'
        }`}
      >
        {isStreaming ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Sparkles size={16} />
            {buttonLabel}
          </>
        )}
      </button>

      {!hasKey && !error && (
        <div className="mt-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Sparkles size={20} className="text-indigo-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-[0.86rem] font-semibold mb-1">Enable AI Assistance</h4>
              <p className="text-[0.78rem] text-muted-foreground leading-relaxed mb-2">
                Get AI-powered analysis of your audit work. Your API key is stored only in your browser and never sent to our servers.
              </p>
              <a
                href="/settings"
                className="inline-flex items-center gap-1 text-[0.82rem] font-semibold text-indigo-500 hover:text-indigo-600 transition-colors"
              >
                Go to Settings <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-[0.82rem] text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {(streamedContent || isStreaming) && (
        <AnalysisPanel
          content={streamedContent}
          isStreaming={isStreaming}
          component={component}
          section={section}
        />
      )}
    </div>
  );
}
