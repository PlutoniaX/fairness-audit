import type { BiasDimensions, BiasPriority, BiasSource, BiasType } from '@/types/audit';

// Weights: Severity 30%, Scope 20%, Persistence 20%, Historical 20%, Feasibility 10%
const WEIGHTS = {
  severity: 0.30,
  scope: 0.20,
  persistence: 0.20,
  historicalAlignment: 0.20,
  feasibility: 0.10,
} as const;

export type WeightOverrides = Partial<typeof WEIGHTS>;

export const ADAPTIVE_WEIGHT_PROFILES: Record<string, { weights: WeightOverrides; rationale: string }> = {
  'Calibration': {
    weights: { severity: 0.35, scope: 0.15, historicalAlignment: 0.25 },
    rationale: 'Calibration prioritises severity and historical alignment — a miscalibrated system that replicates historical patterns is the primary risk.',
  },
  'Demographic Parity': {
    weights: { scope: 0.30, feasibility: 0.05 },
    rationale: 'Demographic Parity focuses on scope — how many groups are affected matters most when the goal is equal outcome rates.',
  },
  'Equal Opportunity': {
    weights: { severity: 0.35, scope: 0.15, persistence: 0.25 },
    rationale: 'Equal Opportunity emphasises severity and persistence — persistent errors in detecting true positives across groups are the key concern.',
  },
  'Equalized Odds': {
    weights: { severity: 0.30, scope: 0.25, persistence: 0.20, historicalAlignment: 0.15, feasibility: 0.10 },
    rationale: 'Equalized Odds balances severity and scope — both false positive and false negative disparities must be tracked broadly.',
  },
  'Predictive Parity': {
    weights: { severity: 0.35, historicalAlignment: 0.25, scope: 0.15 },
    rationale: 'Predictive Parity focuses on whether predictions mean the same thing across groups — severity and historical patterns drive miscalibration.',
  },
};

export function getAdaptiveWeights(primaryDefinition: string): { weights: typeof WEIGHTS; rationale: string } {
  const profile = ADAPTIVE_WEIGHT_PROFILES[primaryDefinition];
  if (!profile) {
    return { weights: { ...WEIGHTS }, rationale: 'Using default weights — no definition-specific adjustments.' };
  }
  return {
    weights: { ...WEIGHTS, ...profile.weights },
    rationale: profile.rationale,
  };
}

export function calculateWeightedScore(dimensions: BiasDimensions, overrideWeights?: WeightOverrides): number {
  const w = overrideWeights ? { ...WEIGHTS, ...overrideWeights } : WEIGHTS;
  const score =
    dimensions.severity * w.severity +
    dimensions.scope * w.scope +
    dimensions.persistence * w.persistence +
    dimensions.historicalAlignment * w.historicalAlignment +
    dimensions.feasibility * w.feasibility;
  return Math.round(score * 10) / 10;
}

export function classifyBiasPriority(weightedScore: number): BiasPriority {
  if (weightedScore >= 3.5) return 'High';
  if (weightedScore >= 2.5) return 'Medium';
  return 'Low';
}

export function getPriorityColor(priority: BiasPriority): string {
  switch (priority) {
    case 'High': return '#e74c3c';
    case 'Medium': return '#d97706';
    case 'Low': return '#27ae60';
  }
}

export function getPriorityBgColor(priority: BiasPriority): string {
  switch (priority) {
    case 'High': return '#fde8e8';
    case 'Medium': return '#fef3c7';
    case 'Low': return '#e8f8ef';
  }
}

interface RecommendedMetric {
  metric: string;
  formula: string;
  reason: string;
  biasSource: string;
}

const BIAS_METRIC_MAP: Record<BiasType, RecommendedMetric[]> = {
  Historical: [
    { metric: 'Statistical Parity Difference', formula: 'P(Y=1|G=a) - P(Y=1|G=b)', reason: 'Detects outcome rate disparities rooted in historical discrimination patterns', biasSource: 'Historical' },
    { metric: 'Disparate Impact Ratio', formula: 'P(Y=1|G=a) / P(Y=1|G=b)', reason: 'Four-fifths rule compliance check for historically disadvantaged groups', biasSource: 'Historical' },
  ],
  Representation: [
    { metric: 'Coverage Ratio', formula: 'n_group / N_population_group', reason: 'Measures whether training data represents each group proportionally', biasSource: 'Representation' },
    { metric: 'Representation Gap', formula: '|p_data - p_population|', reason: 'Quantifies deviation between data composition and true population', biasSource: 'Representation' },
  ],
  Measurement: [
    { metric: 'Calibration by Group', formula: 'E[Y|S=s, G=g] = s for all g', reason: 'Tests whether scores mean the same thing across groups', biasSource: 'Measurement' },
    { metric: 'Disaggregated FPR/FNR', formula: 'FP_g/(FP_g+TN_g) per group', reason: 'Reveals measurement errors that fall disproportionately on specific groups', biasSource: 'Measurement' },
  ],
  Aggregation: [
    { metric: 'Subgroup Accuracy', formula: 'Accuracy_g for each subgroup g', reason: 'Detects whether one-size-fits-all models underperform for specific subgroups', biasSource: 'Aggregation' },
  ],
  Learning: [
    { metric: 'Prediction Drift', formula: 'KL(P_t || P_t+1) per group', reason: 'Monitors whether model predictions shift disproportionately for some groups', biasSource: 'Learning' },
  ],
  Evaluation: [
    { metric: 'Disaggregated Accuracy', formula: 'Accuracy_g for all groups', reason: 'Ensures evaluation metrics are not masking group-level performance gaps', biasSource: 'Evaluation' },
  ],
  Deployment: [
    { metric: 'Outcome Drift', formula: 'SPD_t+1 - SPD_t', reason: 'Tracks whether deployment context introduces new or worsening disparities', biasSource: 'Deployment' },
    { metric: 'Appeal/Override Rate by Group', formula: 'appeals_g / decisions_g', reason: 'Higher appeal rates in specific groups signal deployment-context bias', biasSource: 'Deployment' },
  ],
};

export function getRecommendedMetrics(topBiasSources: BiasSource[], primaryDefinition: string): RecommendedMetric[] {
  const metrics: RecommendedMetric[] = [];
  const seen = new Set<string>();

  // Add metrics based on top bias sources (sorted by score)
  const sorted = [...topBiasSources].sort((a, b) => b.weightedScore - a.weightedScore);
  for (const source of sorted) {
    const sourceMetrics = BIAS_METRIC_MAP[source.type] ?? [];
    for (const m of sourceMetrics) {
      if (!seen.has(m.metric)) {
        seen.add(m.metric);
        metrics.push(m);
      }
    }
  }

  return metrics;
}

export function interpretMetric(
  metricName: string,
  value: number,
  groupA: string,
  groupB: string,
  threshold = 0.05
): string {
  const absVal = Math.abs(value);
  const pctPoints = (absVal * 100).toFixed(0);
  const ratio = threshold > 0 ? (absVal / threshold).toFixed(1) : 'N/A';
  const direction = value > 0 ? 'more' : 'less';

  if (metricName === 'SPD' || metricName === 'Statistical Parity Difference') {
    return `${groupA} is ${pctPoints} percentage points ${direction} likely to receive the outcome than ${groupB} (${ratio}x the ${(threshold * 100).toFixed(0)}pp regulatory threshold).`;
  }
  if (metricName === 'FPR' || metricName === 'False Positive Rate') {
    return `${groupA} faces a ${pctPoints}% false positive rate vs ${groupB}, a difference of ${pctPoints}pp.`;
  }
  if (metricName === 'Error Rate') {
    return `${(absVal * 100).toFixed(0)}% of decisions for ${groupA} were incorrect — ${ratio}x the acceptable threshold.`;
  }
  return `${metricName}: ${value.toFixed(3)} for ${groupA} vs ${groupB} (threshold: ${threshold}).`;
}
