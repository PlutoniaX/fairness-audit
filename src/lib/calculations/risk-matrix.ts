import type { RiskClassification, RiskMatrixEntry } from '@/types/audit';

export function calculateRiskScore(severity: number, likelihood: number, relevance: number): number {
  return Math.round(severity * likelihood * relevance * 100) / 100;
}

export function classifyRisk(score: number): RiskClassification {
  if (score >= 90) return 'Critical';
  if (score >= 40) return 'Elevated';
  if (score >= 15) return 'Moderate';
  return 'Low';
}

export function createRiskEntry(
  id: string,
  risk: string,
  severity: number,
  likelihood: number,
  relevance: number
): RiskMatrixEntry {
  const score = calculateRiskScore(severity, likelihood, relevance);
  return {
    id,
    risk,
    severity,
    likelihood,
    relevance,
    score,
    classification: classifyRisk(score),
  };
}

export function sortRiskMatrix(matrix: RiskMatrixEntry[]): RiskMatrixEntry[] {
  return [...matrix].sort((a, b) => b.score - a.score);
}

export function getRiskColor(classification: RiskClassification): string {
  switch (classification) {
    case 'Critical': return '#e74c3c';
    case 'Elevated': return '#f0ad4e';
    case 'Moderate': return '#4a90d9';
    case 'Low': return '#27ae60';
  }
}

export function getRiskBgColor(classification: RiskClassification): string {
  switch (classification) {
    case 'Critical': return 'rgba(231,76,60,0.06)';
    case 'Elevated': return 'rgba(240,173,78,0.06)';
    case 'Moderate': return 'rgba(74,144,217,0.06)';
    case 'Low': return 'rgba(39,174,96,0.06)';
  }
}
