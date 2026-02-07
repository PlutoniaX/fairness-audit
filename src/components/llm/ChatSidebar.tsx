'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, X, Send, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useSettingsStore } from '@/store/settings-store';
import { PROMPT_TEMPLATES } from '@/lib/llm/prompt-templates';
import { v4 as uuid } from 'uuid';
import type { ChatMessage } from '@/types/llm';

interface ChatSidebarProps {
  component: string;
  context: string;
}

export function ChatSidebar({ component, context }: ChatSidebarProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const apiKey = useSettingsStore(s => s.apiKeys[s.activeProvider]);
  const provider = useSettingsStore(s => s.activeProvider);
  const hasKey = apiKey.length > 0;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming || !hasKey) return;

    const userMsg: ChatMessage = {
      id: uuid(),
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);

    const systemPrompt = PROMPT_TEMPLATES.chat.system(component);

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
          userPrompt: `Context from the audit:\n${context}\n\nUser question: ${trimmed}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No stream');

      const decoder = new TextDecoder();
      let accumulated = '';
      const assistantId = uuid();

      // Add placeholder assistant message
      setMessages(prev => [
        ...prev,
        { id: assistantId, role: 'assistant', content: '', timestamp: Date.now(), provider },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setMessages(prev =>
          prev.map(m => (m.id === assistantId ? { ...m, content: accumulated } : m)),
        );
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: uuid(),
          role: 'assistant',
          content: 'Sorry, an error occurred. Please check your API key and try again.',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  }, [input, isStreaming, hasKey, apiKey, provider, component, context]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-105 z-50 cursor-pointer"
        title="Ask a follow-up question"
      >
        <MessageSquare size={20} />
      </button>
    );
  }

  return (
    <div className="fixed right-0 top-0 h-full w-[380px] bg-card border-l border-border shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-indigo-500" />
          <span className="text-[0.88rem] font-semibold">Follow-up Chat</span>
          <span className="text-[0.72rem] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
            {component.toUpperCase()}
          </span>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="p-1 hover:bg-muted rounded transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground text-[0.82rem] mt-8">
            <MessageSquare size={24} className="mx-auto mb-2 opacity-40" />
            <p>Ask follow-up questions about the methodology, your findings, or next steps.</p>
          </div>
        )}
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-[0.82rem] leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-muted text-foreground'
              }`}
            >
              {msg.role === 'assistant' ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{msg.content || '...'}</ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-border px-4 py-3">
        {!hasKey ? (
          <p className="text-[0.78rem] text-muted-foreground text-center">
            Set your API key in{' '}
            <a href="/settings" className="text-indigo-500 underline">
              Settings
            </a>{' '}
            to enable chat.
          </p>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask a question..."
              disabled={isStreaming}
              className="flex-1 px-3 py-2 border border-border rounded-lg text-[0.84rem] bg-card focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <button
              onClick={handleSend}
              disabled={isStreaming || !input.trim()}
              className="p-2 rounded-lg bg-indigo-500 text-white disabled:opacity-40 hover:bg-indigo-600 transition-colors cursor-pointer"
            >
              {isStreaming ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
