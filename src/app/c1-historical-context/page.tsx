'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { Plus, Trash2, HelpCircle, ArrowDownWideNarrow, ClipboardList, X } from 'lucide-react';

import { useAuditStore } from '@/store/audit-store';
import { ROBODEBT_C1 } from '@/lib/data/robodebt';

import { WhyCard } from '@/components/shared/WhyCard';
import { MethodologyPanel } from '@/components/shared/MethodologyPanel';
import { PhaseCard } from '@/components/shared/PhaseCard';
import { WorksheetField } from '@/components/shared/WorksheetField';
import { RiskBadge } from '@/components/shared/RiskBadge';
import { ChartCard } from '@/components/shared/ChartCard';
import { ActionGuidance } from '@/components/shared/ActionGuidance';
import { HandoffCard } from '@/components/shared/HandoffCard';
import { GlossaryTerm } from '@/components/shared/GlossaryTerm';
import { ProgressIndicator } from '@/components/shared/ProgressIndicator';
import { AnalyzeButton } from '@/components/llm/AnalyzeButton';
import { ChatSidebar } from '@/components/llm/ChatSidebar';
import { buildProgressiveContext } from '@/lib/llm/context-builder';
import { PROMPT_TEMPLATES } from '@/lib/llm/prompt-templates';
import { useComponentProgress } from '@/hooks/useComponentProgress';

import type {
  ProtectedGroup,
  FeedbackLoop,
  RiskMatrixEntry,
  RiskClassification,
} from '@/types/audit';

// ---------------------------------------------------------------------------
// Color helpers
// ---------------------------------------------------------------------------

const C1 = '#0d9488';

const RISK_COLORS: Record<RiskClassification, string> = {
  Critical: '#e74c3c',
  Elevated: '#f0ad4e',
  Moderate: '#4a90d9',
  Low: '#27ae60',
};

const DATA_CHECKLIST_ITEMS = [
  { key: 'missingGroups', label: 'Are there demographic groups missing from the training data?' },
  { key: 'temporalGaps', label: 'Are there temporal gaps (e.g. data only from certain periods)?' },
  { key: 'labelBias', label: 'Could labels reflect historical bias rather than ground truth?' },
  { key: 'proxyVars', label: 'Do proxy variables correlate with protected attributes?' },
  { key: 'coverageGaps', label: 'Are there geographic or institutional coverage gaps?' },
];

// ---------------------------------------------------------------------------
// Risk matrix rubrics & templates
// ---------------------------------------------------------------------------

const RISK_RUBRICS: Record<'severity' | 'likelihood' | 'relevance', string[]> = {
  severity: [
    'Minor inconvenience, easily resolved',
    'Noticeable negative impact, reversible',
    'Significant harm, requires effort to reverse',
    'Serious harm, difficult to reverse',
    'Catastrophic or irreversible harm',
  ],
  likelihood: [
    'Highly unlikely, unusual circumstances needed',
    'Unlikely but possible',
    'Moderately likely, has some precedent',
    'Likely, consistent with known patterns',
    'Near certain or already occurring',
  ],
  relevance: [
    'Tangentially related to fairness',
    'Indirectly affects fairness outcomes',
    'Moderately relevant to fairness',
    'Directly affects fairness for some groups',
    'Core fairness issue affecting protected groups',
  ],
};

const RISK_TEMPLATES: Omit<RiskMatrixEntry, 'id' | 'score' | 'classification'>[] = [
  { risk: 'Algorithm relies on flawed or unvalidated assumptions', severity: 3, likelihood: 3, relevance: 3 },
  { risk: 'Training data underrepresents affected groups', severity: 3, likelihood: 3, relevance: 3 },
  { risk: 'Disproportionate negative outcomes for vulnerable populations', severity: 4, likelihood: 3, relevance: 3 },
  { risk: 'Insufficient human oversight of automated decisions', severity: 3, likelihood: 3, relevance: 3 },
  { risk: 'No adequate appeal or redress mechanism', severity: 3, likelihood: 3, relevance: 3 },
];

const RISK_CATEGORIES = [
  { name: 'Methodological', desc: 'flawed algorithms or invalid assumptions' },
  { name: 'Data quality', desc: 'coverage gaps, label errors, proxy variables' },
  { name: 'Disproportionate impact', desc: 'groups harmed more than others' },
  { name: 'Process', desc: 'missing oversight, inadequate appeals' },
  { name: 'Systemic', desc: 'feedback loops, institutional bias' },
];

function classifyScore(score: number): RiskClassification {
  if (score >= 75) return 'Critical';
  if (score >= 40) return 'Elevated';
  if (score >= 15) return 'Moderate';
  return 'Low';
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function C1HistoricalContextPage() {
  const mode = useAuditStore(s => s.mode);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLearn = !mounted || mode === 'learn';

  // Store state (audit mode)
  const storeC1 = useAuditStore(s => s.c1);
  const updateDomainContext = useAuditStore(s => s.updateDomainContext);
  const updateDataRepresentation = useAuditStore(s => s.updateDataRepresentation);
  const updateTechnologyTransition = useAuditStore(s => s.updateTechnologyTransition);
  const addProtectedGroup = useAuditStore(s => s.addProtectedGroup);
  const updateProtectedGroup = useAuditStore(s => s.updateProtectedGroup);
  const removeProtectedGroup = useAuditStore(s => s.removeProtectedGroup);
  const addFeedbackLoop = useAuditStore(s => s.addFeedbackLoop);
  const updateFeedbackLoop = useAuditStore(s => s.updateFeedbackLoop);
  const removeFeedbackLoop = useAuditStore(s => s.removeFeedbackLoop);
  const addIntersection = useAuditStore(s => s.addIntersection);
  const updateIntersection = useAuditStore(s => s.updateIntersection);
  const removeIntersection = useAuditStore(s => s.removeIntersection);
  const setRiskMatrix = useAuditStore(s => s.setRiskMatrix);
  const addRisk = useAuditStore(s => s.addRisk);
  const updateRisk = useAuditStore(s => s.updateRisk);
  const removeRisk = useAuditStore(s => s.removeRisk);

  // Full state for context builder
  const auditState = useAuditStore(s => s);
  const progress = useComponentProgress('c1');

  // Risk matrix UI state
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateChecks, setTemplateChecks] = useState<boolean[]>(RISK_TEMPLATES.map(() => false));
  const [sortByScore, setSortByScore] = useState(false);
  const [rubricOpen, setRubricOpen] = useState<string | null>(null);

  // Choose data source
  const data = isLearn ? ROBODEBT_C1 : storeC1;

  // Helper: add a blank risk
  const handleAddBlank = useCallback(() => {
    addRisk({
      id: `R${data.riskMatrix.length + 1}`,
      risk: '',
      severity: 1,
      likelihood: 1,
      relevance: 1,
      score: 1,
      classification: 'Low',
    });
  }, [addRisk, data.riskMatrix.length]);

  // Helper: add selected template risks
  const handleAddTemplates = useCallback(() => {
    templateChecks.forEach((checked, i) => {
      if (checked) {
        const t = RISK_TEMPLATES[i];
        const score = t.severity * t.likelihood * t.relevance;
        addRisk({
          id: `R${data.riskMatrix.length + 1 + i}`,
          risk: t.risk,
          severity: t.severity,
          likelihood: t.likelihood,
          relevance: t.relevance,
          score,
          classification: classifyScore(score),
        });
      }
    });
    setTemplateChecks(RISK_TEMPLATES.map(() => false));
    setShowTemplates(false);
  }, [addRisk, data.riskMatrix.length, templateChecks]);

  // Helper: update a dimension and recompute score
  const handleDimensionChange = useCallback(
    (index: number, field: 'severity' | 'likelihood' | 'relevance', val: number, r: RiskMatrixEntry) => {
      const s = field === 'severity' ? val : r.severity;
      const l = field === 'likelihood' ? val : r.likelihood;
      const rv = field === 'relevance' ? val : r.relevance;
      const score = s * l * rv;
      updateRisk(index, { [field]: val, score, classification: classifyScore(score) });
    },
    [updateRisk],
  );

  // Risk summary counts
  const riskCounts = useMemo(() => {
    const counts: Record<RiskClassification, number> = { Critical: 0, Elevated: 0, Moderate: 0, Low: 0 };
    data.riskMatrix.forEach(r => { counts[r.classification]++; });
    return counts;
  }, [data.riskMatrix]);

  // Sorted risk indices for audit mode
  const riskDisplayOrder = useMemo(() => {
    const indices = data.riskMatrix.map((_, i) => i);
    if (sortByScore) {
      indices.sort((a, b) => data.riskMatrix[b].score - data.riskMatrix[a].score);
    }
    return indices;
  }, [data.riskMatrix, sortByScore]);

  // --- Risk chart data ---
  const riskChartData = useMemo(
    () =>
      [...data.riskMatrix]
        .sort((a, b) => b.score - a.score)
        .map(r => ({
          name: r.id,
          score: r.score,
          risk: r.risk,
          classification: r.classification,
        })),
    [data.riskMatrix],
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-[1.5rem] font-bold tracking-tight flex items-center gap-2">
          <span
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-[1rem] font-extrabold"
            style={{ backgroundColor: C1 }}
          >
            1
          </span>
          Historical Context Assessment
        </h2>
        <p className="text-muted-foreground mt-1.5 text-[0.88rem] max-w-[720px]">
          Examine the historical and institutional context that shapes how discrimination patterns
          reach automated systems. Context determines which biases are encoded in data and design.
        </p>
      </div>

      {/* Progress (audit mode only) */}
      {!isLearn && <ProgressIndicator progress={progress} color={C1} />}

      {/* Why Card */}
      <WhyCard
        component="c1"
        explanation="Historical context determines whether an algorithm inherits — and amplifies — existing patterns of discrimination. Without this assessment, auditors may treat bias as a purely technical problem and miss the structural forces that created it."
        example="Australia's decades-long 'dole bludger' narrative and punitive welfare culture shaped Robodebt's design toward accusation rather than accuracy. The system inherited institutional assumptions that welfare recipients are likely fraudsters, leading to reversed burden of proof and the elimination of human discretion."
      />

      {/* Methodology Panel */}
      <MethodologyPanel
        component="c1"
        title="6-Phase Historical Context Assessment"
        description="Work through each phase sequentially: identify the domain context, assess data representation, document the technology transition, map protected groups and intersections, analyse feedback loops, and score risks in the risk matrix."
      />

      {/* ================================================================= */}
      {/* Phase 1 — Domain Context */}
      {/* ================================================================= */}
      <PhaseCard
        num={1}
        title="Domain Context"
        color={C1}
        plainLanguage="Describe the system being audited, the type of decisions it makes, who is affected, and what historical patterns of discrimination exist in this domain."
        defaultOpen
      >
        <WorksheetField
          label="System Name"
          value={data.domainContext.system}
          onChange={v => updateDomainContext({ system: v })}
          multiline={false}
          placeholder="e.g. Automated welfare compliance system"
          scaffoldTip="Name the specific system or algorithm being audited."
          learnAnnotation="The Online Compliance Intervention was the official name; 'Robodebt' was the public term for its income-averaging methodology."
        />
        <WorksheetField
          label="Decision Type"
          value={data.domainContext.decisionType}
          onChange={v => updateDomainContext({ decisionType: v })}
          placeholder="e.g. Binary classification, resource allocation, scoring..."
          scaffoldTip="What kind of decision does the system make? Is it binary, a score, a ranking?"
          learnAnnotation="Robodebt made a binary debt/no-debt determination, fully automated without human review."
        />
        <WorksheetField
          label="Affected Population"
          value={data.domainContext.affectedPopulation}
          onChange={v => updateDomainContext({ affectedPopulation: v })}
          rows={3}
          placeholder="Who is subject to the system's decisions? How many people? Which demographics?"
          scaffoldTip="Be specific about scale and demographics. Include anyone indirectly affected."
          learnAnnotation="Approximately 700,000 welfare recipients across multiple payment types were targeted."
        />
        <WorksheetField
          label="Historical Patterns of Discrimination"
          value={data.domainContext.historicalPatterns}
          onChange={v => updateDomainContext({ historicalPatterns: v })}
          rows={4}
          placeholder="What historical discrimination patterns exist in this domain?"
          scaffoldTip="Research the history of this domain. What groups have been systematically disadvantaged?"
          learnAnnotation="The 'dole bludger' narrative since the 1970s created institutional bias toward assuming fraud. Indigenous Australians have been systematically over-surveilled in welfare administration."
          examplePrompt="Example (hiring system): Decades of occupational segregation mean that training data for a resume screener reflects historical exclusion of women from engineering roles. The 'good candidate' pattern learned by the model encodes gender bias."
          formatTemplate="1. Historical pattern: [describe the pattern]\n2. Affected groups: [list groups]\n3. Evidence: [cite sources]\n4. Connection to system: [how does this pattern reach the system?]"
        />
      </PhaseCard>

      {/* AI: Phase 1 review */}
      {!isLearn && (
        <AnalyzeButton
          systemPrompt={PROMPT_TEMPLATES.c1_phase_review(1, 'Domain Context').system}
          userPrompt={PROMPT_TEMPLATES.c1_phase_review(1, 'Domain Context').user(
            '',
            `System: ${data.domainContext.system}\nDecision: ${data.domainContext.decisionType}\nPopulation: ${data.domainContext.affectedPopulation}\nHistorical patterns: ${data.domainContext.historicalPatterns}`
          )}
          component="c1"
          section="phase-1"
          buttonLabel="Analyze Phase 1"
          className="mb-4"
        />
      )}

      {/* ================================================================= */}
      {/* Phase 2 — Data & Representation */}
      {/* ================================================================= */}
      <PhaseCard
        num={2}
        title="Data & Representation"
        color={C1}
        plainLanguage={<>Assess the data sources used by the system. Are they complete, accurate, and representative of all affected groups? Do labels reflect reality or historical bias? Watch for <GlossaryTerm slug="proxyVariable">proxy variables</GlossaryTerm> and unreliable <GlossaryTerm slug="baseRate">base rates</GlossaryTerm>.</>}
      >
        {/* Checklist */}
        <div className="mb-5">
          <h5 className="text-[0.84rem] font-semibold mb-2">Data Source Red-Flag Checklist</h5>
          {DATA_CHECKLIST_ITEMS.map(item => {
            const checked = data.dataRepresentation.dataSourceChecklist[item.key] ?? false;
            return (
              <label
                key={item.key}
                className="flex items-start gap-2.5 py-1.5 text-[0.84rem] cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={isLearn}
                  onChange={() => {
                    if (!isLearn) {
                      updateDataRepresentation({
                        dataSourceChecklist: {
                          ...data.dataRepresentation.dataSourceChecklist,
                          [item.key]: !checked,
                        },
                      });
                    }
                  }}
                  className="mt-0.5 accent-[#0d9488]"
                />
                <span className={isLearn ? 'text-muted-foreground' : ''}>{item.label}</span>
              </label>
            );
          })}
        </div>

        <WorksheetField
          label="Data Sources"
          value={data.dataRepresentation.dataSources}
          onChange={v => updateDataRepresentation({ dataSources: v })}
          rows={3}
          placeholder="List all data sources the system uses..."
          scaffoldTip="Include both primary data and any auxiliary sources. Note the provenance of each."
          learnAnnotation="Robodebt relied on ATO annual income summaries and Centrelink fortnightly records. The mismatch between annual and fortnightly granularity was the root cause of invalid debts."
        />
        <WorksheetField
          label="Coverage Gaps"
          value={data.dataRepresentation.coverageGaps}
          onChange={v => updateDataRepresentation({ coverageGaps: v })}
          rows={3}
          placeholder="Which populations or patterns are underrepresented or missing?"
          scaffoldTip="Think about who is invisible in the data. Whose patterns are not captured accurately?"
          learnAnnotation="Casual workers, Indigenous community employment (CDEP), and gig economy workers were systematically misrepresented by annual averaging."
        />
        <WorksheetField
          label="Label Reliability (how trustworthy are the outcome labels?)"
          value={data.dataRepresentation.labelReliability}
          onChange={v => updateDataRepresentation({ labelReliability: v })}
          rows={3}
          placeholder="How reliable are the outcome labels? Do they measure what they claim to measure?"
          scaffoldTip="Are 'ground truth' labels actually true? Could they reflect historical bias?"
          learnAnnotation="Labels were fundamentally flawed: income averaging created false 'discrepancies' that did not represent actual overpayments. The mathematical basis was legally invalid."
        />
      </PhaseCard>

      {/* ================================================================= */}
      {/* Phase 3 — Technology Transition */}
      {/* ================================================================= */}
      <PhaseCard
        num={3}
        title="Technology Transition"
        color={C1}
        plainLanguage="Document what process the automated system replaced, what changed in the transition, and what oversight or safeguards were lost."
      >
        <WorksheetField
          label="Prior Process"
          value={data.technologyTransition.priorProcess}
          onChange={v => updateTechnologyTransition({ priorProcess: v })}
          rows={3}
          placeholder="What was the previous (often human-driven) process?"
          scaffoldTip="Describe how decisions were made before automation. What role did human judgment play?"
          learnAnnotation="Trained Centrelink officers manually reviewed discrepancies, could request payslips, and exercised discretion in identifying data-matching errors."
        />
        <WorksheetField
          label="What Changed"
          value={data.technologyTransition.whatChanged}
          onChange={v => updateTechnologyTransition({ whatChanged: v })}
          rows={3}
          placeholder="What specifically changed when automation was introduced?"
          scaffoldTip="Focus on the scale change, the removal of human steps, and any new assumptions built into the automated system."
          learnAnnotation="Volume increased from ~20,000 to ~700,000 interventions. Manual verification was replaced by automated income averaging with no human review."
        />
        <WorksheetField
          label="Oversight Lost"
          value={data.technologyTransition.oversightLost}
          onChange={v => updateTechnologyTransition({ oversightLost: v })}
          rows={3}
          placeholder="What safeguards, checks, or human oversight was removed?"
          scaffoldTip="What could the old process catch that the new system cannot? What appeals or review mechanisms changed?"
          learnAnnotation="Human discretion was eliminated. Burden of proof was reversed onto recipients. Internal legal advice warning of unlawfulness was ignored."
        />
      </PhaseCard>

      {/* AI: Phase 3 review */}
      {!isLearn && (
        <AnalyzeButton
          systemPrompt={PROMPT_TEMPLATES.c1_phase_review(3, 'Technology Transition').system}
          userPrompt={PROMPT_TEMPLATES.c1_phase_review(3, 'Technology Transition').user(
            '',
            `Prior process: ${data.technologyTransition.priorProcess}\nWhat changed: ${data.technologyTransition.whatChanged}\nOversight lost: ${data.technologyTransition.oversightLost}`
          )}
          component="c1"
          section="phase-3"
          buttonLabel="Analyze Phase 3"
          className="mb-4"
        />
      )}

      {/* ================================================================= */}
      {/* Phase 4 — Protected Groups */}
      {/* ================================================================= */}
      <PhaseCard
        num={4}
        title="Protected Groups"
        color={C1}
        plainLanguage="Identify which demographic or protected groups may be disproportionately affected. For each, document the historical discrimination pattern, the data pathway through which bias enters, and the expected impact level."
      >
        {isLearn ? (
          /* Learn mode: read-only cards */
          <div className="space-y-3">
            {data.protectedGroups.map((pg, i) => (
              <div
                key={i}
                className="bg-muted rounded-lg p-4 border border-border"
              >
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-[0.88rem] font-semibold">{pg.group}</h5>
                  <RiskBadge level={pg.impact} />
                </div>
                <div className="text-[0.82rem] text-muted-foreground space-y-1.5">
                  <p>
                    <strong className="text-foreground">Pattern:</strong> {pg.pattern}
                  </p>
                  <p>
                    <strong className="text-foreground">Data Pathway:</strong> {pg.dataPathway}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Audit mode: editable dynamic cards */
          <div className="space-y-4">
            {data.protectedGroups.map((pg, i) => (
              <div
                key={i}
                className="bg-card rounded-lg p-4 border border-border relative"
              >
                <button
                  onClick={() => removeProtectedGroup(i)}
                  className="absolute top-3 right-3 text-muted-foreground hover:text-[var(--fail)] transition-colors"
                  title="Remove group"
                >
                  <Trash2 size={16} />
                </button>
                <WorksheetField
                  label="Group"
                  value={pg.group}
                  onChange={v => updateProtectedGroup(i, { group: v })}
                  multiline={false}
                  placeholder="e.g. Indigenous Australians"
                />
                <WorksheetField
                  label="Historical Pattern"
                  value={pg.pattern}
                  onChange={v => updateProtectedGroup(i, { pattern: v })}
                  rows={2}
                  placeholder="What historical discrimination pattern affects this group?"
                />
                <WorksheetField
                  label="Data Pathway"
                  value={pg.dataPathway}
                  onChange={v => updateProtectedGroup(i, { dataPathway: v })}
                  rows={2}
                  placeholder="How does bias enter the system's data for this group?"
                />
                <div className="mb-2">
                  <label className="block text-[0.82rem] font-semibold mb-1.5">Impact Level</label>
                  <select
                    value={pg.impact}
                    onChange={e =>
                      updateProtectedGroup(i, {
                        impact: e.target.value as ProtectedGroup['impact'],
                      })
                    }
                    className="px-3 py-2 border border-border rounded-lg text-[0.86rem] bg-card"
                  >
                    <option value="Strong">Strong</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
            ))}

            <button
              onClick={() =>
                addProtectedGroup({
                  group: '',
                  pattern: '',
                  dataPathway: '',
                  impact: 'Moderate',
                })
              }
              className="flex items-center gap-1.5 px-4 py-2 text-[0.84rem] font-semibold rounded-lg border-2 border-dashed border-[var(--c1)]/40 text-[var(--c1)] hover:bg-[var(--c1)]/5 transition-colors"
            >
              <Plus size={16} /> Add Protected Group
            </button>
          </div>
        )}
      </PhaseCard>

      {/* ================================================================= */}
      {/* Phase 5 — Intersectional Analysis */}
      {/* ================================================================= */}
      <PhaseCard
        num={5}
        title="Intersectional Analysis"
        color={C1}
        plainLanguage="Analyse how multiple group memberships combine to create compounding disadvantage. Intersectional effects are often more severe than any single-group analysis would reveal."
      >
        {isLearn ? (
          <div className="space-y-3">
            {data.intersections.map((ix, i) => (
              <div
                key={i}
                className="bg-muted rounded-lg p-4 border border-border"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <h5 className="text-[0.88rem] font-semibold">{ix.groups}</h5>
                  <span className="text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide">
                    Priority {ix.priority}
                  </span>
                </div>
                <p className="text-[0.82rem] text-muted-foreground">{ix.pattern}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {data.intersections.map((ix, i) => (
              <div
                key={i}
                className="bg-card rounded-lg p-4 border border-border relative"
              >
                <button
                  onClick={() => removeIntersection(i)}
                  className="absolute top-3 right-3 text-muted-foreground hover:text-[var(--fail)] transition-colors"
                  title="Remove intersection"
                >
                  <Trash2 size={16} />
                </button>
                <WorksheetField
                  label="Intersecting Groups"
                  value={ix.groups}
                  onChange={v => updateIntersection(i, { groups: v })}
                  multiline={false}
                  placeholder="e.g. Young + Indigenous"
                />
                <div className="mb-3">
                  <label className="block text-[0.82rem] font-semibold mb-1.5">Priority</label>
                  <input
                    type="number"
                    min={1}
                    value={ix.priority}
                    onChange={e =>
                      updateIntersection(i, { priority: parseInt(e.target.value) || 1 })
                    }
                    className="w-20 px-3 py-2 border border-border rounded-lg text-[0.86rem] bg-card"
                  />
                </div>
                <WorksheetField
                  label="Compounding Pattern"
                  value={ix.pattern}
                  onChange={v => updateIntersection(i, { pattern: v })}
                  rows={3}
                  placeholder="How do these group memberships combine to create compounding disadvantage?"
                />
              </div>
            ))}

            <button
              onClick={() =>
                addIntersection({ groups: '', priority: data.intersections.length + 1, pattern: '' })
              }
              className="flex items-center gap-1.5 px-4 py-2 text-[0.84rem] font-semibold rounded-lg border-2 border-dashed border-[var(--c1)]/40 text-[var(--c1)] hover:bg-[var(--c1)]/5 transition-colors"
            >
              <Plus size={16} /> Add Intersection
            </button>
          </div>
        )}
      </PhaseCard>

      {/* ================================================================= */}
      {/* Phase 6 — Feedback Loops */}
      {/* ================================================================= */}
      <PhaseCard
        num={6}
        title="Feedback Loops"
        color={C1}
        plainLanguage={<>Identify self-reinforcing cycles (<GlossaryTerm slug="feedbackLoop">feedback loops</GlossaryTerm>) where the system&apos;s outputs feed back into its inputs, potentially amplifying bias over time. Each loop has a trigger, mechanism, amplification pathway, and monitoring strategy.</>}
      >
        {isLearn ? (
          <div className="space-y-3">
            {data.feedbackLoops.map((fl, i) => (
              <div
                key={i}
                className="bg-muted rounded-lg p-4 border border-border"
              >
                <h5 className="text-[0.88rem] font-semibold mb-2 flex items-center gap-2">
                  <span className="text-[0.72rem] font-bold px-2 py-0.5 rounded bg-[var(--c1)]/10 text-[var(--c1)]">
                    {fl.id}
                  </span>
                  Feedback Loop
                </h5>
                <div className="text-[0.82rem] text-muted-foreground space-y-1.5">
                  <p>
                    <strong className="text-foreground">Trigger:</strong> {fl.trigger}
                  </p>
                  <p>
                    <strong className="text-foreground">Mechanism:</strong> {fl.mechanism}
                  </p>
                  <p>
                    <strong className="text-foreground">Amplification:</strong> {fl.amplification}
                  </p>
                  <p>
                    <strong className="text-foreground">Monitoring:</strong> {fl.monitoring}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {data.feedbackLoops.map((fl, i) => (
              <div
                key={i}
                className="bg-card rounded-lg p-4 border border-border relative"
              >
                <button
                  onClick={() => removeFeedbackLoop(i)}
                  className="absolute top-3 right-3 text-muted-foreground hover:text-[var(--fail)] transition-colors"
                  title="Remove feedback loop"
                >
                  <Trash2 size={16} />
                </button>
                <WorksheetField
                  label="Trigger"
                  value={fl.trigger}
                  onChange={v => updateFeedbackLoop(i, { trigger: v })}
                  rows={2}
                  placeholder="What event or output starts this loop?"
                />
                <WorksheetField
                  label="Mechanism"
                  value={fl.mechanism}
                  onChange={v => updateFeedbackLoop(i, { mechanism: v })}
                  rows={2}
                  placeholder="How does the trigger lead to a reinforcing effect?"
                />
                <WorksheetField
                  label="Amplification"
                  value={fl.amplification}
                  onChange={v => updateFeedbackLoop(i, { amplification: v })}
                  rows={2}
                  placeholder="How does this effect get amplified over cycles?"
                />
                <WorksheetField
                  label="Monitoring Strategy"
                  value={fl.monitoring}
                  onChange={v => updateFeedbackLoop(i, { monitoring: v })}
                  rows={2}
                  placeholder="How would you detect and measure this loop?"
                />
              </div>
            ))}

            <button
              onClick={() =>
                addFeedbackLoop({
                  id: `FL-${data.feedbackLoops.length + 1}`,
                  trigger: '',
                  mechanism: '',
                  amplification: '',
                  monitoring: '',
                })
              }
              className="flex items-center gap-1.5 px-4 py-2 text-[0.84rem] font-semibold rounded-lg border-2 border-dashed border-[var(--c1)]/40 text-[var(--c1)] hover:bg-[var(--c1)]/5 transition-colors"
            >
              <Plus size={16} /> Add Feedback Loop
            </button>
          </div>
        )}
      </PhaseCard>

      {/* ================================================================= */}
      {/* Risk Matrix */}
      {/* ================================================================= */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6" style={{ borderTopWidth: 3, borderTopColor: C1 }}>
        <h3 className="text-[1.05rem] font-semibold mb-1">Risk Matrix</h3>
        <p className="text-[0.82rem] text-muted-foreground mb-4">
          Each risk is scored on Severity (S), Likelihood (L), and Relevance (R) from 1-5.
          The composite score is S &times; L &times; R. Classification thresholds: Critical &ge; 75, Elevated &ge; 40, Moderate &ge; 15, Low &lt; 15.
        </p>

        {/* ---------- Summary Stats Bar (audit mode, when risks exist) ---------- */}
        {!isLearn && data.riskMatrix.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 mb-4 p-3 rounded-lg bg-muted/50 border border-border text-[0.82rem]">
            <span className="font-semibold">{data.riskMatrix.length} risk{data.riskMatrix.length !== 1 ? 's' : ''}</span>
            <span className="text-border">|</span>
            {(['Critical', 'Elevated', 'Moderate', 'Low'] as const).map(cls =>
              riskCounts[cls] > 0 ? (
                <span key={cls} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: RISK_COLORS[cls] }}
                  />
                  <span style={{ color: RISK_COLORS[cls] }} className="font-semibold">
                    {riskCounts[cls]}
                  </span>
                  <span className="text-muted-foreground">{cls}</span>
                </span>
              ) : null,
            )}
            <div className="ml-auto">
              <button
                onClick={() => setSortByScore(v => !v)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[0.78rem] font-medium transition-colors ${
                  sortByScore
                    ? 'bg-[var(--c1)]/10 text-[var(--c1)]'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Sort risks by score (highest first)"
              >
                <ArrowDownWideNarrow size={14} />
                Sort by score
              </button>
            </div>
          </div>
        )}

        {isLearn ? (
          /* ==================== LEARN MODE: compact table (unchanged) ==================== */
          <div className="overflow-x-auto">
            <table className="w-full text-[0.82rem]">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left py-2 pr-3 font-semibold text-muted-foreground">ID</th>
                  <th className="text-left py-2 pr-3 font-semibold text-muted-foreground">Risk</th>
                  <th className="text-center py-2 px-2 font-semibold text-muted-foreground">S</th>
                  <th className="text-center py-2 px-2 font-semibold text-muted-foreground">L</th>
                  <th className="text-center py-2 px-2 font-semibold text-muted-foreground">R</th>
                  <th className="text-center py-2 px-2 font-semibold text-muted-foreground">Score</th>
                  <th className="text-center py-2 px-2 font-semibold text-muted-foreground">Class</th>
                </tr>
              </thead>
              <tbody>
                {data.riskMatrix.map(r => (
                  <tr key={r.id} className="border-b border-border/60 hover:bg-muted/50 transition-colors">
                    <td className="py-2.5 pr-3 font-mono font-bold text-[0.78rem]">{r.id}</td>
                    <td className="py-2.5 pr-3 max-w-[320px]">{r.risk}</td>
                    <td className="py-2.5 px-2 text-center">{r.severity}</td>
                    <td className="py-2.5 px-2 text-center">{r.likelihood}</td>
                    <td className="py-2.5 px-2 text-center">{r.relevance}</td>
                    <td className="py-2.5 px-2 text-center font-bold">{r.score}</td>
                    <td className="py-2.5 px-2 text-center">
                      <RiskBadge level={r.classification} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : data.riskMatrix.length === 0 && !showTemplates ? (
          /* ==================== AUDIT MODE: Guided Empty State ==================== */
          <div className="rounded-lg border-2 border-dashed border-border p-6 text-center">
            <ClipboardList size={32} className="mx-auto mb-3 text-muted-foreground" />
            <h4 className="text-[0.95rem] font-semibold mb-2">No risks identified yet</h4>
            <p className="text-[0.82rem] text-muted-foreground mb-4 max-w-lg mx-auto">
              Risks describe ways the system could cause unfair outcomes. Consider these categories:
            </p>
            <ul className="text-left inline-block text-[0.82rem] space-y-1.5 mb-5">
              {RISK_CATEGORIES.map(cat => (
                <li key={cat.name} className="flex items-start gap-2">
                  <span className="text-[var(--c1)] font-bold mt-0.5">&#x2022;</span>
                  <span>
                    <strong>{cat.name}</strong>{' '}
                    <span className="text-muted-foreground">&mdash; {cat.desc}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <button
                onClick={() => setShowTemplates(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-[0.84rem] font-semibold rounded-lg bg-[var(--c1)] text-white hover:opacity-90 transition-opacity"
              >
                <Plus size={16} /> Add from templates
              </button>
              <button
                onClick={handleAddBlank}
                className="flex items-center gap-1.5 px-4 py-2 text-[0.84rem] font-semibold rounded-lg border-2 border-dashed border-[var(--c1)]/40 text-[var(--c1)] hover:bg-[var(--c1)]/5 transition-colors"
              >
                <Plus size={16} /> Add blank risk
              </button>
            </div>
          </div>
        ) : (
          /* ==================== AUDIT MODE: Card Layout ==================== */
          <div className="space-y-3">
            {/* Template picker panel (inline, above cards) */}
            {showTemplates && (
              <div className="rounded-lg border border-[var(--c1)]/30 bg-[var(--c1)]/[0.03] p-4 mb-1">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[0.88rem] font-semibold">Select template risks to add</h4>
                  <button
                    onClick={() => { setShowTemplates(false); setTemplateChecks(RISK_TEMPLATES.map(() => false)); }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    title="Close templates"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="space-y-2 mb-4">
                  {RISK_TEMPLATES.map((t, ti) => (
                    <label
                      key={ti}
                      className="flex items-start gap-2.5 py-1.5 text-[0.84rem] cursor-pointer hover:bg-[var(--c1)]/5 rounded px-2 -mx-2 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={templateChecks[ti]}
                        onChange={() =>
                          setTemplateChecks(prev => prev.map((v, j) => (j === ti ? !v : v)))
                        }
                        className="mt-0.5 accent-[#0d9488]"
                      />
                      <span>{t.risk}</span>
                      <span className="ml-auto text-muted-foreground text-[0.76rem] whitespace-nowrap">
                        S{t.severity} L{t.likelihood} R{t.relevance}
                      </span>
                    </label>
                  ))}
                </div>
                <button
                  onClick={handleAddTemplates}
                  disabled={!templateChecks.some(Boolean)}
                  className="px-4 py-2 text-[0.84rem] font-semibold rounded-lg bg-[var(--c1)] text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Add selected ({templateChecks.filter(Boolean).length})
                </button>
              </div>
            )}

            {/* Risk cards */}
            {riskDisplayOrder.map(i => {
              const r = data.riskMatrix[i];
              const scoreColor = RISK_COLORS[r.classification];
              const scorePct = Math.min(100, (r.score / 125) * 100);
              return (
                <div
                  key={r.id}
                  className="rounded-lg border border-border bg-card p-4 relative"
                >
                  {/* Header row */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono font-bold text-[0.82rem] text-muted-foreground">{r.id}</span>
                    <button
                      onClick={() => removeRisk(i)}
                      className="text-muted-foreground hover:text-[var(--fail)] transition-colors flex items-center gap-1 text-[0.78rem]"
                      title="Delete risk"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Risk description */}
                  <input
                    type="text"
                    value={r.risk}
                    onChange={e => updateRisk(i, { risk: e.target.value })}
                    placeholder="Describe the risk..."
                    className="w-full mb-4 px-3 py-2 border border-border rounded-lg text-[0.84rem] bg-muted/30 focus:border-[var(--c1)] focus:outline-none transition-colors"
                  />

                  {/* Dimension score buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    {(['severity', 'likelihood', 'relevance'] as const).map(dim => (
                      <div key={dim}>
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="text-[0.78rem] font-semibold capitalize">{dim}</span>
                          <button
                            onClick={() => setRubricOpen(rubricOpen === `${r.id}-${dim}` ? null : `${r.id}-${dim}`)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            title={`What does each ${dim} level mean?`}
                          >
                            <HelpCircle size={13} />
                          </button>
                        </div>
                        {/* Rubric popover */}
                        {rubricOpen === `${r.id}-${dim}` && (
                          <div className="mb-2 p-2.5 rounded-lg bg-muted border border-border text-[0.76rem] space-y-1">
                            {RISK_RUBRICS[dim].map((desc, lvl) => (
                              <div key={lvl} className="flex gap-2">
                                <span className="font-bold text-[var(--c1)] w-4 shrink-0">{lvl + 1}</span>
                                <span className="text-muted-foreground">{desc}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {/* Button group */}
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(val => {
                            const isSelected = r[dim] === val;
                            return (
                              <button
                                key={val}
                                onClick={() => handleDimensionChange(i, dim, val, r)}
                                title={RISK_RUBRICS[dim][val - 1]}
                                className={`w-9 h-9 rounded-lg text-[0.82rem] font-semibold transition-all ${
                                  isSelected
                                    ? 'bg-[var(--c1)] text-white shadow-sm'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground border border-border'
                                }`}
                              >
                                {val}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Live score display */}
                  <div className="flex items-center gap-3">
                    {/* Score bar */}
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${scorePct}%`, backgroundColor: scoreColor }}
                      />
                    </div>
                    {/* Formula + badge */}
                    <span className="text-[0.78rem] text-muted-foreground whitespace-nowrap">
                      {r.severity} &times; {r.likelihood} &times; {r.relevance} ={' '}
                      <strong style={{ color: scoreColor }}>{r.score}</strong>
                    </span>
                    <RiskBadge level={r.classification} />
                  </div>
                </div>
              );
            })}

            {/* Add buttons */}
            <div className="flex items-center gap-3 flex-wrap pt-1">
              <button
                onClick={handleAddBlank}
                className="flex items-center gap-1.5 px-4 py-2 text-[0.84rem] font-semibold rounded-lg border-2 border-dashed border-[var(--c1)]/40 text-[var(--c1)] hover:bg-[var(--c1)]/5 transition-colors"
              >
                <Plus size={16} /> Add Risk
              </button>
              <button
                onClick={() => setShowTemplates(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-[0.84rem] font-semibold rounded-lg border-2 border-dashed border-[var(--c1)]/40 text-[var(--c1)] hover:bg-[var(--c1)]/5 transition-colors"
              >
                <Plus size={16} /> Add from templates
              </button>
            </div>
          </div>
        )}
      </div>

      {/* AI: Risk Matrix review */}
      {!isLearn && (
        <AnalyzeButton
          systemPrompt={PROMPT_TEMPLATES.c1_risk_matrix_review.system}
          userPrompt={PROMPT_TEMPLATES.c1_risk_matrix_review.user(
            '',
            data.riskMatrix.map(r => `${r.id}: ${r.risk} (S=${r.severity} L=${r.likelihood} R=${r.relevance} = ${r.score} ${r.classification})`).join('\n')
          )}
          component="c1"
          section="risk-matrix"
          buttonLabel="Analyze Risk Matrix"
          className="mb-4"
        />
      )}

      {/* ================================================================= */}
      {/* Risk Chart */}
      {/* ================================================================= */}
      {data.riskMatrix.length > 0 && (
        <ChartCard
          title="Risk Score Distribution"
          description="Horizontal bar chart of composite risk scores (S x L x R), color-coded by classification."
          borderColor={C1}
          interpretation={{
            title: 'Reading this chart',
            text: 'Longer bars indicate higher composite risk. Red bars (Critical) require immediate attention. Orange bars (Elevated) need monitoring and mitigation plans. Blue bars (Moderate) should be documented. Green bars (Low) are acceptable with standard controls.',
          }}
        >
          <div className="h-[320px]" role="img" aria-label="Bar chart showing risk score distribution by classification">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={riskChartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
              >
                <XAxis type="number" domain={[0, 'auto']} tick={{ fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={40}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  content={({ payload }) => {
                    if (!payload?.[0]) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-[0.8rem]">
                        <p className="font-semibold">{d.name}: {d.risk}</p>
                        <p className="text-muted-foreground">
                          Score: <strong>{d.score}</strong> — {d.classification}
                        </p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={22}>
                  {riskChartData.map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={RISK_COLORS[entry.classification as RiskClassification]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      )}

      {/* ================================================================= */}
      {/* Action Guidance */}
      {/* ================================================================= */}
      <ActionGuidance
        title="What Do These Scores Mean?"
        items={[
          {
            level: 'critical',
            title: 'Critical (Score >= 75)',
            description:
              'Mandatory halt or remediation before deployment. These risks indicate fundamental flaws that will cause significant harm if not addressed. In the Robodebt case, the invalid mathematical methodology and reversal of burden of proof were Critical risks that should have prevented deployment.',
          },
          {
            level: 'elevated',
            title: 'Elevated (Score 40-74)',
            description:
              'Requires documented mitigation plan with timeline. Deploy only with explicit risk acceptance from accountable decision-makers. Monitor continuously and establish trigger points for escalation to Critical.',
          },
          {
            level: 'normal',
            title: 'Moderate (Score 15-39) and Low (< 15)',
            description:
              'Document in the audit report. Moderate risks need periodic review and standard controls. Low risks are acceptable with routine monitoring. However, multiple Moderate risks can combine to create an Elevated aggregate risk.',
          },
        ]}
      />

      {/* ================================================================= */}
      {/* Handoff */}
      {/* ================================================================= */}
      <HandoffCard
        title="Handoff to Component 2"
        description="Historical context assessment is complete. Next, select appropriate fairness definitions based on the context you've documented. The risks and protected groups identified here will inform which fairness metrics are most relevant."
        nextHref="/c2-fairness-definitions"
        nextLabel="C2: Fairness Definitions"
        nextColor="#6366f1"
      />

      {/* Chat Sidebar (audit mode only) */}
      {!isLearn && <ChatSidebar component="c1" context={buildProgressiveContext(auditState, 'c1')} />}
    </div>
  );
}
