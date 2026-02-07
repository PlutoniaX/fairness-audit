import type { AuditState } from '@/types/audit';

export function exportAuditAsJSON(state: AuditState): string {
  const exportData = {
    _format: 'fairness-audit-playbook',
    _version: state.metadata.version,
    _exportedAt: new Date().toISOString(),
    ...state,
  };
  return JSON.stringify(exportData, null, 2);
}

export function downloadAuditJSON(state: AuditState): void {
  const json = exportAuditAsJSON(state);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fairness-audit-${state.metadata.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
