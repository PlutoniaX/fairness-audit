// Core audit types for all 4 components

export type AuditMode = 'learn' | 'audit';
export type ComponentStatus = 'not-started' | 'in-progress' | 'complete';
export type RiskClassification = 'Critical' | 'Elevated' | 'Moderate' | 'Low';
export type ImpactLevel = 'Strong' | 'Moderate' | 'Low';
export type BiasPriority = 'High' | 'Medium' | 'Low';
export type AmplificationSpeed = 'Fast (weeks)' | 'Medium (months)' | 'Slow (years)';

// ===== Component 1: Historical Context =====

export interface TimelineEvent {
  year: string;
  event: string;
  type: 'cultural' | 'policy' | 'system' | 'legal';
}

export interface RiskMatrixEntry {
  id: string;
  risk: string;
  severity: number;
  likelihood: number;
  relevance: number;
  score: number;
  classification: RiskClassification;
}

export interface ProtectedGroup {
  group: string;
  pattern: string;
  dataPathway: string;
  impact: ImpactLevel;
}

export interface Intersection {
  groups: string;
  priority: number;
  pattern: string;
}

export interface FeedbackLoop {
  id: string;
  trigger: string;
  mechanism: string;
  amplification: string;
  monitoring: string;
}

export interface DomainContext {
  system: string;
  decisionType: string;
  affectedPopulation: string;
  historicalPatterns: string;
}

export interface DataRepresentation {
  dataSources: string;
  coverageGaps: string;
  labelReliability: string;
  dataSourceChecklist: Record<string, boolean>;
}

export interface TechnologyTransition {
  priorProcess: string;
  whatChanged: string;
  oversightLost: string;
}

export interface C1Data {
  domainContext: DomainContext;
  dataRepresentation: DataRepresentation;
  technologyTransition: TechnologyTransition;
  protectedGroups: ProtectedGroup[];
  intersections: Intersection[];
  feedbackLoops: FeedbackLoop[];
  riskMatrix: RiskMatrixEntry[];
  timeline: TimelineEvent[];
}

// ===== Component 2: Fairness Definitions =====

export interface FairnessDefinition {
  id: string;
  name: string;
  formula: string;
  plainLanguage: string;
  whenToUse: string;
  limitations: string;
  selected: boolean;
  selectedReason?: string;
}

export type DecisionStepInputType = 'radio' | 'checklist' | 'multiselect';

export interface DecisionStep {
  step: number;
  question: string;
  inputType: DecisionStepInputType;
  options: string[];
  answer: string | string[];
  explanation: string;
}

export interface DefinitionSelection {
  definition: string;
  justification: string;
}

export interface TradeoffDoc {
  title: string;
  description: string;
  resolution: string;
}

export interface C2Data {
  decisionFramework: DecisionStep[];
  primarySelection: DefinitionSelection;
  secondarySelection: DefinitionSelection;
  tradeoff: TradeoffDoc;
}

// ===== Component 3: Bias Sources =====

export type BiasType =
  | 'Historical'
  | 'Representation'
  | 'Measurement'
  | 'Aggregation'
  | 'Learning'
  | 'Evaluation'
  | 'Deployment';

export interface BiasDimensions {
  severity: number;
  scope: number;
  persistence: number;
  historicalAlignment: number;
  feasibility: number;
}

export interface BiasSource {
  type: BiasType;
  description: string;
  indicators: string[];
  indicatorChecks: boolean[];
  evidence: string;
  severityScore: number;
  dimensions: BiasDimensions;
  weightedScore: number;
  priority: BiasPriority;
  accountableParty?: 'Data Team' | 'Model Team' | 'Product Team' | 'Legal/Compliance' | 'Leadership' | 'External';
}

export interface C3Data {
  biasSources: BiasSource[];
}

// ===== Component 4: Fairness Metrics =====

export interface GroupRate {
  group: string;
  rate: number;
  spd: string;
  ci: [number, number];
  color: string;
}

export interface SPDComparison {
  comparison: string;
  spd: number;
  ci: [number, number];
  significant: boolean;
}

export interface ErrorRateEntry {
  group: string;
  rate: number;
  label: string;
}

export interface IntersectionalRow {
  subgroup: string;
  rate: number;
  spd: string;
  errorRate: number;
  status: 'Ref' | 'Elevated' | 'High' | 'Critical';
}

export interface ThresholdPoint {
  tolerance: string;
  falsePositiveRate: number;
  truePositiveRate: number;
  label: string;
}

export interface StatisticalValidation {
  bootstrap: string;
  permutation: string;
  effectSize: string;
  bayesian: string;
}

export interface Recommendation {
  id: string;
  horizon: string;
  action: string;
  impact: string;
  effort?: 'Low' | 'Medium' | 'High';
  timeline?: string;
  estimatedImpact?: string;
}

export interface AuditDimension {
  dimension: string;
  score: number;
  max: number;
  tooltip: string;
}

export interface DebtNoticeRates {
  byAge: GroupRate[];
  byIndigenous: GroupRate[];
  byRegion: GroupRate[];
}

export interface C4Data {
  debtNoticeRates: DebtNoticeRates;
  spd: SPDComparison[];
  errorRates: {
    overall: number;
    byGroup: ErrorRateEntry[];
  };
  intersectional: IntersectionalRow[];
  thresholdSensitivity: ThresholdPoint[];
  statisticalValidation: StatisticalValidation;
  recommendations: Recommendation[];
  auditDimensions: AuditDimension[];
  // Audit mode free-text fields
  groupOutcomeRates: string;
  errorRateAnalysis: string;
  intersectionalAnalysis: string;
  thresholdAnalysis: string;
  validationBootstrap: string;
  validationPermutation: string;
  validationEffectSize: string;
  validationBayesian: string;
  preDeploymentRecs: string;
  postDeploymentRecs: string;
  auditDimensionScores: string;
  metricSummary: {
    highestGroupRate: string;
    lowestGroupRate: string;
    worstSPD: string;
    overallErrorRate: string;
  };
}

// ===== System Description (overview) =====

export interface SystemDescription {
  name: string;
  operator: string;
  period: string;
  scale: string;
  algorithm: string;
  decision: string;
  outcome: string;
}

// ===== LLM Analysis Results =====

export interface LLMAnalysis {
  id: string;
  component: string;
  section: string;
  timestamp: number;
  provider: string;
  prompt: string;
  response: string;
}

// ===== Executive Summary & Limitations =====

export interface ExecutiveSummary {
  overallRiskLevel: RiskClassification;
  keyFindings: string[];
  topDisparities: string[];
  primaryRecommendation: string;
  deploymentReadiness: 'Go' | 'Conditional' | 'No-Go';
}

export interface AuditLimitations {
  dataGaps: string;
  methodologicalLimitations: string;
  scopeExclusions: string;
  confidenceStatement: string;
}

// ===== Full Audit State =====

export interface AuditMetadata {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  version: number;
  auditorName?: string;
  auditorRole?: string;
  auditorOrganization?: string;
  signedOffAt?: number;
  signoffStatement?: string;
}

export interface AuditState {
  metadata: AuditMetadata;
  mode: AuditMode;
  activeComponent: string;
  componentStatus: Record<string, ComponentStatus>;
  system: SystemDescription;
  c1: C1Data;
  c2: C2Data;
  c3: C3Data;
  c4: C4Data;
  executiveSummary: ExecutiveSummary;
  limitations: AuditLimitations;
  llmAnalyses: LLMAnalysis[];
}
