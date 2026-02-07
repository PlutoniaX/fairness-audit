'use client';

import { useState } from 'react';
import { Settings, Download, Upload, Trash2, Check, AlertTriangle } from 'lucide-react';
import { useSettingsStore } from '@/store/settings-store';
import { useAuditStore } from '@/store/audit-store';
import { ApiKeyInput } from '@/components/llm/ApiKeyInput';
import { ProviderSelector } from '@/components/llm/ProviderSelector';
import { exportAuditAsJSON, downloadAuditJSON } from '@/lib/export/json-export';
import { importAuditFromFile } from '@/lib/export/json-import';

export default function SettingsPage() {
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const activeProvider = useSettingsStore(s => s.activeProvider);
  const resetAudit = useAuditStore(s => s.resetAudit);

  async function handleExport() {
    const state = useAuditStore.getState();
    const json = exportAuditAsJSON(state);
    downloadAuditJSON(json, `fairness-audit-${new Date().toISOString().slice(0, 10)}.json`);
  }

  async function handleImport() {
    try {
      const imported = await importAuditFromFile();
      if (imported) {
        useAuditStore.getState().loadAudit(imported);
        setImportStatus({ type: 'success', message: 'Audit data imported successfully.' });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Import failed';
      setImportStatus({ type: 'error', message });
    }
  }

  function handleReset() {
    if (window.confirm('Are you sure you want to reset all audit data? This cannot be undone.')) {
      resetAudit();
      setImportStatus({ type: 'success', message: 'Audit data has been reset.' });
    }
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-[1.6rem] font-bold tracking-tight flex items-center gap-2">
          <Settings size={28} className="text-muted-foreground" />
          Settings
        </h2>
        <p className="text-muted-foreground text-[0.92rem] mt-1.5">
          Configure LLM providers, manage your audit data, and set preferences.
        </p>
      </div>

      {/* LLM Provider Section */}
      <section className="bg-card rounded-xl border border-border p-6 mb-6">
        <h3 className="text-[1.05rem] font-semibold mb-1">LLM Provider</h3>
        <p className="text-[0.82rem] text-muted-foreground mb-4">
          Choose which AI provider to use for analysis and chat. API keys are stored in your browser only and never sent to our servers.
        </p>

        <div className="mb-6">
          <ProviderSelector />
        </div>

        <div className="space-y-2">
          <ApiKeyInput
            provider="gemini"
            label="Google Gemini API Key"
            placeholder="AIza..."
          />
          <ApiKeyInput
            provider="claude"
            label="Anthropic Claude API Key"
            placeholder="sk-ant-..."
          />
          <ApiKeyInput
            provider="openai"
            label="OpenAI API Key"
            placeholder="sk-..."
          />
        </div>

        <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-[0.82rem]">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-800 dark:text-amber-300">Privacy notice:</strong>{' '}
              <span className="text-amber-700 dark:text-amber-400">
                Your API key is stored in localStorage and sent directly from your browser to the selected provider via our API proxy route. We do not log, store, or have access to your keys or prompts on the server side.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Data Management Section */}
      <section className="bg-card rounded-xl border border-border p-6 mb-6">
        <h3 className="text-[1.05rem] font-semibold mb-1">Data Management</h3>
        <p className="text-[0.82rem] text-muted-foreground mb-4">
          Export your audit as JSON for backup or sharing, or import a previously exported audit.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[0.84rem] font-semibold bg-indigo-500 text-white hover:bg-indigo-600 transition-colors cursor-pointer"
          >
            <Download size={16} />
            Export Audit as JSON
          </button>

          <button
            onClick={handleImport}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[0.84rem] font-semibold border border-border bg-card hover:bg-muted transition-colors cursor-pointer"
          >
            <Upload size={16} />
            Import Audit from JSON
          </button>

          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[0.84rem] font-semibold border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
          >
            <Trash2 size={16} />
            Reset All Data
          </button>
        </div>

        {importStatus && (
          <div
            className={`mt-4 p-3 rounded-lg text-[0.82rem] flex items-center gap-2 ${
              importStatus.type === 'success'
                ? 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                : 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
            }`}
          >
            {importStatus.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
            {importStatus.message}
          </div>
        )}
      </section>

      {/* About Section */}
      <section className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-[1.05rem] font-semibold mb-1">About</h3>
        <p className="text-[0.82rem] text-muted-foreground leading-relaxed">
          The Fairness Audit Playbook is a structured tool for conducting fairness audits of automated decision-making systems.
          It follows a 4-component methodology: Historical Context Assessment, Fairness Definition Selection,
          Bias Source Identification, and Fairness Metrics & Reporting. The Robodebt case study demonstrates
          the methodology applied to a real-world system.
        </p>
        <p className="text-[0.78rem] text-muted-foreground mt-3">
          All data is stored locally in your browser. No audit data is sent to any server except for LLM analysis requests,
          which are sent directly to your chosen provider.
        </p>
      </section>
    </div>
  );
}
