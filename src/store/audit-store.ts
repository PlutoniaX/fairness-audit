import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type {
  AuditState,
  AuditMode,
  AuditMetadata,
  ComponentStatus,
  C1Data,
  C2Data,
  C3Data,
  C4Data,
  RiskClassification,
  RiskMatrixEntry,
  ProtectedGroup,
  Intersection,
  FeedbackLoop,
  BiasSource,
  DecisionStep,
  DefinitionSelection,
  TradeoffDoc,
  LLMAnalysis,
  SystemDescription,
  ExecutiveSummary,
  AuditLimitations,
} from '@/types/audit';
import { createLocalStoragePersistence } from './middleware/persistence';

function createEmptyC1(): C1Data {
  return {
    domainContext: { system: '', decisionType: '', affectedPopulation: '', historicalPatterns: '' },
    dataRepresentation: {
      dataSources: '', coverageGaps: '', labelReliability: '',
      dataSourceChecklist: { missingGroups: false, temporalGaps: false, labelBias: false, proxyVars: false, coverageGaps: false },
    },
    technologyTransition: { priorProcess: '', whatChanged: '', oversightLost: '' },
    protectedGroups: [],
    intersections: [],
    feedbackLoops: [],
    riskMatrix: [],
    timeline: [],
  };
}

function createEmptyC2(): C2Data {
  return {
    decisionFramework: [
      { step: 1, question: 'How reliable are outcome labels?', inputType: 'radio', options: ['High', 'Medium', 'Low'], answer: '', explanation: '' },
      { step: 2, question: 'Which errors cause more harm?', inputType: 'radio', options: ['False Positives', 'False Negatives', 'Both equally'], answer: '', explanation: '' },
      { step: 3, question: 'Do base rates differ across groups?', inputType: 'radio', options: ['Yes', 'No', 'Unknown'], answer: '', explanation: '' },
      { step: 4, question: 'Is score calibration critical?', inputType: 'radio', options: ['Yes', 'No', 'N/A'], answer: '', explanation: '' },
      { step: 5, question: 'What legal requirements apply?', inputType: 'checklist', options: [], answer: [], explanation: '' },
      { step: 6, question: 'Which intersections require evaluation?', inputType: 'multiselect', options: [], answer: [], explanation: '' },
      { step: 7, question: 'Are there feedback loops?', inputType: 'radio', options: ['Yes — High', 'Yes — Medium', 'Yes — Low', 'No'], answer: '', explanation: '' },
    ],
    primarySelection: { definition: '', justification: '' },
    secondarySelection: { definition: '', justification: '' },
    tradeoff: { title: '', description: '', resolution: '' },
  };
}

function createEmptyC3(): C3Data {
  return {
    biasSources: [
      { type: 'Historical', description: '', indicators: [], indicatorChecks: [], evidence: '', severityScore: 1, dimensions: { severity: 1, scope: 1, persistence: 1, historicalAlignment: 1, feasibility: 1 }, weightedScore: 1.0, priority: 'Low' },
      { type: 'Representation', description: '', indicators: [], indicatorChecks: [], evidence: '', severityScore: 1, dimensions: { severity: 1, scope: 1, persistence: 1, historicalAlignment: 1, feasibility: 1 }, weightedScore: 1.0, priority: 'Low' },
      { type: 'Measurement', description: '', indicators: [], indicatorChecks: [], evidence: '', severityScore: 1, dimensions: { severity: 1, scope: 1, persistence: 1, historicalAlignment: 1, feasibility: 1 }, weightedScore: 1.0, priority: 'Low' },
      { type: 'Aggregation', description: '', indicators: [], indicatorChecks: [], evidence: '', severityScore: 1, dimensions: { severity: 1, scope: 1, persistence: 1, historicalAlignment: 1, feasibility: 1 }, weightedScore: 1.0, priority: 'Low' },
      { type: 'Learning', description: '', indicators: [], indicatorChecks: [], evidence: '', severityScore: 1, dimensions: { severity: 1, scope: 1, persistence: 1, historicalAlignment: 1, feasibility: 1 }, weightedScore: 1.0, priority: 'Low' },
      { type: 'Evaluation', description: '', indicators: [], indicatorChecks: [], evidence: '', severityScore: 1, dimensions: { severity: 1, scope: 1, persistence: 1, historicalAlignment: 1, feasibility: 1 }, weightedScore: 1.0, priority: 'Low' },
      { type: 'Deployment', description: '', indicators: [], indicatorChecks: [], evidence: '', severityScore: 1, dimensions: { severity: 1, scope: 1, persistence: 1, historicalAlignment: 1, feasibility: 1 }, weightedScore: 1.0, priority: 'Low' },
    ],
  };
}

function createEmptyC4(): C4Data {
  return {
    debtNoticeRates: { byAge: [], byIndigenous: [], byRegion: [] },
    spd: [],
    errorRates: { overall: 0, byGroup: [] },
    intersectional: [],
    thresholdSensitivity: [],
    statisticalValidation: { bootstrap: '', permutation: '', effectSize: '', bayesian: '' },
    recommendations: [],
    auditDimensions: [],
    groupOutcomeRates: '',
    errorRateAnalysis: '',
    intersectionalAnalysis: '',
    thresholdAnalysis: '',
    validationBootstrap: '',
    validationPermutation: '',
    validationEffectSize: '',
    validationBayesian: '',
    preDeploymentRecs: '',
    postDeploymentRecs: '',
    auditDimensionScores: '',
    metricSummary: { highestGroupRate: '', lowestGroupRate: '', worstSPD: '', overallErrorRate: '' },
  };
}

function createDefaultState(): AuditState {
  return {
    metadata: {
      id: uuidv4(),
      name: 'New Audit',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
    },
    mode: 'learn',
    activeComponent: 'overview',
    componentStatus: {
      c1: 'not-started',
      c2: 'not-started',
      c3: 'not-started',
      c4: 'not-started',
    },
    system: { name: '', operator: '', period: '', scale: '', algorithm: '', decision: '', outcome: '' },
    c1: createEmptyC1(),
    c2: createEmptyC2(),
    c3: createEmptyC3(),
    c4: createEmptyC4(),
    executiveSummary: {
      overallRiskLevel: 'Low' as RiskClassification,
      keyFindings: [],
      topDisparities: [],
      primaryRecommendation: '',
      deploymentReadiness: 'No-Go' as const,
    },
    limitations: {
      dataGaps: '',
      methodologicalLimitations: '',
      scopeExclusions: '',
      confidenceStatement: '',
    },
    llmAnalyses: [],
  };
}

interface AuditActions {
  // Mode
  setMode: (mode: AuditMode) => void;
  setActiveComponent: (component: string) => void;
  setComponentStatus: (component: string, status: ComponentStatus) => void;

  // System
  updateSystem: (updates: Partial<SystemDescription>) => void;

  // C1
  updateDomainContext: (updates: Partial<C1Data['domainContext']>) => void;
  updateDataRepresentation: (updates: Partial<C1Data['dataRepresentation']>) => void;
  updateTechnologyTransition: (updates: Partial<C1Data['technologyTransition']>) => void;
  addProtectedGroup: (group: ProtectedGroup) => void;
  updateProtectedGroup: (index: number, updates: Partial<ProtectedGroup>) => void;
  removeProtectedGroup: (index: number) => void;
  addIntersection: (intersection: Intersection) => void;
  updateIntersection: (index: number, updates: Partial<Intersection>) => void;
  removeIntersection: (index: number) => void;
  addFeedbackLoop: (loop: FeedbackLoop) => void;
  updateFeedbackLoop: (index: number, updates: Partial<FeedbackLoop>) => void;
  removeFeedbackLoop: (index: number) => void;
  addRisk: (risk: RiskMatrixEntry) => void;
  updateRisk: (index: number, updates: Partial<RiskMatrixEntry>) => void;
  removeRisk: (index: number) => void;
  setRiskMatrix: (matrix: RiskMatrixEntry[]) => void;

  // C2
  updateDecisionStep: (stepIndex: number, updates: Partial<DecisionStep>) => void;
  updatePrimarySelection: (updates: Partial<DefinitionSelection>) => void;
  updateSecondarySelection: (updates: Partial<DefinitionSelection>) => void;
  updateTradeoff: (updates: Partial<TradeoffDoc>) => void;

  // C3
  updateBiasSource: (index: number, updates: Partial<BiasSource>) => void;

  // C4
  updateC4Field: <K extends keyof C4Data>(field: K, value: C4Data[K]) => void;
  updateMetricSummary: (updates: Partial<C4Data['metricSummary']>) => void;
  updateStatisticalValidation: (updates: Partial<C4Data['statisticalValidation']>) => void;

  // LLM
  addLLMAnalysis: (analysis: LLMAnalysis) => void;

  // Executive Summary & Limitations
  updateExecutiveSummary: (updates: Partial<ExecutiveSummary>) => void;
  updateLimitations: (updates: Partial<AuditLimitations>) => void;
  updateAuditMetadata: (updates: Partial<AuditMetadata>) => void;

  // Audit management
  resetAudit: () => void;
  loadAudit: (state: AuditState) => void;
  getExportData: () => AuditState;

  // Internal
  _persist: () => void;
}

type AuditStore = AuditState & AuditActions;

const persistence = createLocalStoragePersistence<AuditState>({
  name: 'fairness-audit-current',
  debounceMs: 500,
});

export const useAuditStore = create<AuditStore>((set, get) => {
  // Try to load from localStorage on init, merging with defaults for newly added fields
  const saved = typeof window !== 'undefined' ? persistence.load() : null;
  const defaults = createDefaultState();
  const initialState = saved ? { ...defaults, ...saved } : defaults;

  return {
    ...initialState,

    _persist() {
      const state = get();
      const { _persist, setMode, setActiveComponent, setComponentStatus, updateSystem, updateDomainContext, updateDataRepresentation, updateTechnologyTransition, addProtectedGroup, updateProtectedGroup, removeProtectedGroup, addIntersection, updateIntersection, removeIntersection, addFeedbackLoop, updateFeedbackLoop, removeFeedbackLoop, addRisk, updateRisk, removeRisk, setRiskMatrix, updateDecisionStep, updatePrimarySelection, updateSecondarySelection, updateTradeoff, updateBiasSource, updateC4Field, updateMetricSummary, updateStatisticalValidation, addLLMAnalysis, updateExecutiveSummary, updateLimitations, updateAuditMetadata, resetAudit, loadAudit, getExportData, ...data } = state;
      persistence.save(data as AuditState);
    },

    setMode(mode) {
      set({ mode });
      get()._persist();
    },

    setActiveComponent(component) {
      set({ activeComponent: component });
      get()._persist();
    },

    setComponentStatus(component, status) {
      set(s => ({
        componentStatus: { ...s.componentStatus, [component]: status },
      }));
      get()._persist();
    },

    updateSystem(updates) {
      set(s => ({
        system: { ...s.system, ...updates },
        metadata: { ...s.metadata, updatedAt: Date.now() },
      }));
      get()._persist();
    },

    // C1 actions
    updateDomainContext(updates) {
      set(s => ({
        c1: { ...s.c1, domainContext: { ...s.c1.domainContext, ...updates } },
        metadata: { ...s.metadata, updatedAt: Date.now() },
      }));
      get()._persist();
    },

    updateDataRepresentation(updates) {
      set(s => ({
        c1: { ...s.c1, dataRepresentation: { ...s.c1.dataRepresentation, ...updates } },
        metadata: { ...s.metadata, updatedAt: Date.now() },
      }));
      get()._persist();
    },

    updateTechnologyTransition(updates) {
      set(s => ({
        c1: { ...s.c1, technologyTransition: { ...s.c1.technologyTransition, ...updates } },
        metadata: { ...s.metadata, updatedAt: Date.now() },
      }));
      get()._persist();
    },

    addProtectedGroup(group) {
      set(s => ({
        c1: { ...s.c1, protectedGroups: [...s.c1.protectedGroups, group] },
        metadata: { ...s.metadata, updatedAt: Date.now() },
      }));
      get()._persist();
    },

    updateProtectedGroup(index, updates) {
      set(s => ({
        c1: {
          ...s.c1,
          protectedGroups: s.c1.protectedGroups.map((g, i) => i === index ? { ...g, ...updates } : g),
        },
        metadata: { ...s.metadata, updatedAt: Date.now() },
      }));
      get()._persist();
    },

    removeProtectedGroup(index) {
      set(s => ({
        c1: { ...s.c1, protectedGroups: s.c1.protectedGroups.filter((_, i) => i !== index) },
        metadata: { ...s.metadata, updatedAt: Date.now() },
      }));
      get()._persist();
    },

    addIntersection(intersection) {
      set(s => ({
        c1: { ...s.c1, intersections: [...s.c1.intersections, intersection] },
        metadata: { ...s.metadata, updatedAt: Date.now() },
      }));
      get()._persist();
    },

    updateIntersection(index, updates) {
      set(s => ({
        c1: {
          ...s.c1,
          intersections: s.c1.intersections.map((ix, i) => i === index ? { ...ix, ...updates } : ix),
        },
        metadata: { ...s.metadata, updatedAt: Date.now() },
      }));
      get()._persist();
    },

    removeIntersection(index) {
      set(s => ({
        c1: { ...s.c1, intersections: s.c1.intersections.filter((_, i) => i !== index) },
        metadata: { ...s.metadata, updatedAt: Date.now() },
      }));
      get()._persist();
    },

    addFeedbackLoop(loop) {
      set(s => ({
        c1: { ...s.c1, feedbackLoops: [...s.c1.feedbackLoops, loop] },
        metadata: { ...s.metadata, updatedAt: Date.now() },
      }));
      get()._persist();
    },

    updateFeedbackLoop(index, updates) {
      set(s => ({
        c1: {
          ...s.c1,
          feedbackLoops: s.c1.feedbackLoops.map((fl, i) => i === index ? { ...fl, ...updates } : fl),
        },
        metadata: { ...s.metadata, updatedAt: Date.now() },
      }));
      get()._persist();
    },

    removeFeedbackLoop(index) {
      set(s => ({
        c1: { ...s.c1, feedbackLoops: s.c1.feedbackLoops.filter((_, i) => i !== index) },
        metadata: { ...s.metadata, updatedAt: Date.now() },
      }));
      get()._persist();
    },

    addRisk(risk) {
      set(s => ({
        c1: { ...s.c1, riskMatrix: [...s.c1.riskMatrix, risk] },
        metadata: { ...s.metadata, updatedAt: Date.now() },
      }));
      get()._persist();
    },

    updateRisk(index, updates) {
      set(s => ({
        c1: {
          ...s.c1,
          riskMatrix: s.c1.riskMatrix.map((r, i) => i === index ? { ...r, ...updates } : r),
        },
        metadata: { ...s.metadata, updatedAt: Date.now() },
      }));
      get()._persist();
    },

    removeRisk(index) {
      set(s => ({
        c1: { ...s.c1, riskMatrix: s.c1.riskMatrix.filter((_, i) => i !== index) },
        metadata: { ...s.metadata, updatedAt: Date.now() },
      }));
      get()._persist();
    },

    setRiskMatrix(matrix) {
      set(s => ({
        c1: { ...s.c1, riskMatrix: matrix },
        metadata: { ...s.metadata, updatedAt: Date.now() },
      }));
      get()._persist();
    },

    // C2 actions
    updateDecisionStep(stepIndex, updates) {
      set(s => ({
        c2: {
          ...s.c2,
          decisionFramework: s.c2.decisionFramework.map((step, i) =>
            i === stepIndex ? { ...step, ...updates } : step
          ),
        },
        metadata: { ...s.metadata, updatedAt: Date.now() },
      }));
      get()._persist();
    },

    updatePrimarySelection(updates) {
      set(s => ({
        c2: { ...s.c2, primarySelection: { ...s.c2.primarySelection, ...updates } },
        metadata: { ...s.metadata, updatedAt: Date.now() },
      }));
      get()._persist();
    },

    updateSecondarySelection(updates) {
      set(s => ({
        c2: { ...s.c2, secondarySelection: { ...s.c2.secondarySelection, ...updates } },
        metadata: { ...s.metadata, updatedAt: Date.now() },
      }));
      get()._persist();
    },

    updateTradeoff(updates) {
      set(s => ({
        c2: { ...s.c2, tradeoff: { ...s.c2.tradeoff, ...updates } },
        metadata: { ...s.metadata, updatedAt: Date.now() },
      }));
      get()._persist();
    },

    // C3 actions
    updateBiasSource(index, updates) {
      set(s => ({
        c3: {
          ...s.c3,
          biasSources: s.c3.biasSources.map((bs, i) => i === index ? { ...bs, ...updates } : bs),
        },
        metadata: { ...s.metadata, updatedAt: Date.now() },
      }));
      get()._persist();
    },

    // C4 actions
    updateC4Field(field, value) {
      set(s => ({
        c4: { ...s.c4, [field]: value },
        metadata: { ...s.metadata, updatedAt: Date.now() },
      }));
      get()._persist();
    },

    updateMetricSummary(updates) {
      set(s => ({
        c4: { ...s.c4, metricSummary: { ...s.c4.metricSummary, ...updates } },
        metadata: { ...s.metadata, updatedAt: Date.now() },
      }));
      get()._persist();
    },

    updateStatisticalValidation(updates) {
      set(s => ({
        c4: { ...s.c4, statisticalValidation: { ...s.c4.statisticalValidation, ...updates } },
        metadata: { ...s.metadata, updatedAt: Date.now() },
      }));
      get()._persist();
    },

    // LLM
    addLLMAnalysis(analysis) {
      set(s => ({
        llmAnalyses: [...s.llmAnalyses, analysis],
        metadata: { ...s.metadata, updatedAt: Date.now() },
      }));
      get()._persist();
    },

    // Executive Summary & Limitations
    updateExecutiveSummary(updates) {
      set(s => ({
        executiveSummary: { ...s.executiveSummary, ...updates },
        metadata: { ...s.metadata, updatedAt: Date.now() },
      }));
      get()._persist();
    },

    updateLimitations(updates) {
      set(s => ({
        limitations: { ...s.limitations, ...updates },
        metadata: { ...s.metadata, updatedAt: Date.now() },
      }));
      get()._persist();
    },

    updateAuditMetadata(updates) {
      set(s => ({
        metadata: { ...s.metadata, ...updates, updatedAt: Date.now() },
      }));
      get()._persist();
    },

    // Audit management
    resetAudit() {
      const newState = createDefaultState();
      set(newState);
      get()._persist();
    },

    loadAudit(state) {
      set(state);
      get()._persist();
    },

    getExportData() {
      const state = get();
      return {
        metadata: state.metadata,
        mode: state.mode,
        activeComponent: state.activeComponent,
        componentStatus: state.componentStatus,
        system: state.system,
        c1: state.c1,
        c2: state.c2,
        c3: state.c3,
        c4: state.c4,
        executiveSummary: state.executiveSummary,
        limitations: state.limitations,
        llmAnalyses: state.llmAnalyses,
      };
    },
  };
});
