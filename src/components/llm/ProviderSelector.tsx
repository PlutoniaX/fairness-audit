'use client';

import { useSettingsStore } from '@/store/settings-store';
import { PROVIDERS } from '@/lib/llm/provider-config';
import type { LLMProvider } from '@/types/llm';

export function ProviderSelector() {
  const activeProvider = useSettingsStore(s => s.activeProvider);
  const setActiveProvider = useSettingsStore(s => s.setActiveProvider);

  return (
    <div className="flex items-center gap-2">
      <label className="text-[0.82rem] font-medium text-muted-foreground">Provider:</label>
      <select
        value={activeProvider}
        onChange={e => setActiveProvider(e.target.value as LLMProvider)}
        className="px-3 py-1.5 border border-border rounded-lg text-[0.84rem] bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
      >
        {Object.values(PROVIDERS).map(p => (
          <option key={p.id} value={p.id}>
            {p.name} ({p.model})
          </option>
        ))}
      </select>
    </div>
  );
}
