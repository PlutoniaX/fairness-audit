import { z } from 'zod';
import type { AuditState } from '@/types/audit';

// Basic validation schema - checks structure without being overly strict
const auditImportSchema = z.object({
  _format: z.literal('fairness-audit-playbook').optional(),
  _version: z.number().optional(),
  metadata: z.object({
    id: z.string(),
    name: z.string(),
    createdAt: z.number(),
    updatedAt: z.number(),
    version: z.number(),
  }),
  mode: z.enum(['learn', 'audit']),
  activeComponent: z.string(),
  componentStatus: z.record(z.string()),
  system: z.object({
    name: z.string(),
    operator: z.string(),
    period: z.string(),
    scale: z.string(),
    algorithm: z.string(),
    decision: z.string(),
    outcome: z.string(),
  }),
  c1: z.object({}).passthrough(),
  c2: z.object({}).passthrough(),
  c3: z.object({}).passthrough(),
  c4: z.object({}).passthrough(),
  llmAnalyses: z.array(z.object({}).passthrough()),
});

export type ImportResult =
  | { success: true; data: AuditState }
  | { success: false; error: string };

export function parseAuditJSON(jsonString: string): ImportResult {
  try {
    const parsed = JSON.parse(jsonString);
    const result = auditImportSchema.safeParse(parsed);

    if (!result.success) {
      const issues = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
      return { success: false, error: `Invalid audit file: ${issues}` };
    }

    // Strip export-only fields
    const { _format, _version, ...auditData } = result.data as Record<string, unknown>;

    return { success: true, data: auditData as unknown as AuditState };
  } catch {
    return { success: false, error: 'Invalid JSON format' };
  }
}

export function importAuditFromFile(): Promise<ImportResult> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        resolve({ success: false, error: 'No file selected' });
        return;
      }

      try {
        const text = await file.text();
        resolve(parseAuditJSON(text));
      } catch {
        resolve({ success: false, error: 'Failed to read file' });
      }
    };

    input.click();
  });
}
