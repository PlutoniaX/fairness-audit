'use client';

import { useState } from 'react';
import { Eye, EyeOff, Check } from 'lucide-react';
import { useSettingsStore } from '@/store/settings-store';
import type { LLMProvider } from '@/types/llm';

interface ApiKeyInputProps {
  provider: LLMProvider;
  label: string;
  placeholder?: string;
}

export function ApiKeyInput({ provider, label, placeholder }: ApiKeyInputProps) {
  const apiKey = useSettingsStore(s => s.apiKeys[provider]);
  const setApiKey = useSettingsStore(s => s.setApiKey);
  const [visible, setVisible] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  function handleChange(value: string) {
    setApiKey(provider, value);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1500);
  }

  const hasKey = apiKey.length > 0;
  const maskedKey = hasKey
    ? apiKey.slice(0, 8) + '...' + apiKey.slice(-4)
    : '';

  return (
    <div className="mb-4">
      <label className="block text-[0.84rem] font-semibold mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type={visible ? 'text' : 'password'}
            value={apiKey}
            onChange={e => handleChange(e.target.value)}
            placeholder={placeholder || `Enter your ${label}`}
            className="w-full px-3.5 py-2.5 border border-border rounded-lg text-[0.84rem] bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 pr-20"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {justSaved && (
              <span className="text-green-500 text-[0.72rem] flex items-center gap-0.5">
                <Check size={12} /> Saved
              </span>
            )}
            <button
              onClick={() => setVisible(!visible)}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title={visible ? 'Hide key' : 'Show key'}
              type="button"
            >
              {visible ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>
      {hasKey && !visible && (
        <p className="text-[0.72rem] text-muted-foreground mt-1 font-mono">{maskedKey}</p>
      )}
      <p className="text-[0.72rem] text-muted-foreground mt-1">
        Stored in your browser only. Never sent to our servers.
      </p>
    </div>
  );
}
