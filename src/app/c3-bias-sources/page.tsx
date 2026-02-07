'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useAuditStore } from '@/store/audit-store';
import { ROBODEBT_C3, ROBODEBT_C1, ROBODEBT_C2, ROBODEBT_ACCOUNTABILITY } from '@/lib/data/robodebt';
import { getAdaptiveWeights } from '@/lib/calculations/bias-prioritization';
import {
  calculateWeightedScore,
  classifyBiasPriority,
  getPriorityColor,
  getPriorityBgColor,
} from '@/lib/calculations/bias-prioritization';
import type { BiasSource, BiasDimensions, FeedbackLoop } from '@/types/audit';

import { WhyCard } from '@/components/shared/WhyCard';
import { MethodologyPanel } from '@/components/shared/MethodologyPanel';
import { HandoffCard } from '@/components/shared/HandoffCard';
import { ChartCard } from '@/components/shared/ChartCard';
import { RiskBadge } from '@/components/shared/RiskBadge';
import { GlossaryTerm } from '@/components/shared/GlossaryTerm';
import { ProgressIndicator } from '@/components/shared/ProgressIndicator';
import { PriorFindingsPanel } from '@/components/shared/PriorFindingsPanel';
import { AnalyzeButton } from '@/components/llm/AnalyzeButton';
import { ChatSidebar } from '@/components/llm/ChatSidebar';
import { buildProgressiveContext } from '@/lib/llm/context-builder';
import { PROMPT_TEMPLATES } from '@/lib/llm/prompt-templates';
import { useComponentProgress } from '@/hooks/useComponentProgress';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { ChevronDown, AlertTriangle, HelpCircle, Info } from 'lucide-react';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';

/* ------------------------------------------------------------------ */
/*  Plain-language subtitles for each bias type                        */
/* ------------------------------------------------------------------ */
const BIAS_SUBTITLES: Record<string, string> = {
  Historical:
    'Past societal patterns of discrimination are embedded in the data or objectives the system uses.',
  Representation:
    'The training data does not accurately reflect the population the system will make decisions about.',
  Measurement:
    'The features or labels used to quantify real-world concepts are systematically inaccurate for some groups.',
  Aggregation:
    'One model or rule is applied to groups that actually have different underlying patterns.',
  Learning:
    'The model amplifies biases present in the data through its optimisation objective or architecture.',
  Evaluation:
    'The benchmarks or evaluation metrics used to assess the system mask group-level disparities.',
  Deployment:
    'Bias is introduced or amplified when the system is used in a context different from its design assumptions.',
};

/* ------------------------------------------------------------------ */
/*  Dimension labels and weights for the prioritisation table          */
/* ------------------------------------------------------------------ */
const DIMENSION_META: { key: keyof BiasDimensions; label: string; weight: string }[] = [
  { key: 'severity', label: 'Severity', weight: '30%' },
  { key: 'scope', label: 'Scope', weight: '20%' },
  { key: 'persistence', label: 'Persistence', weight: '20%' },
  { key: 'historicalAlignment', label: 'Historical Alignment', weight: '20%' },
  { key: 'feasibility', label: 'Feasibility of Mitigation', weight: '10%' },
];

/* ------------------------------------------------------------------ */
/*  Scoring rubrics for the 5 dimensions                               */
/* ------------------------------------------------------------------ */
const RUBRICS: Record<string, string[]> = {
  severity: [
    '1 — Minor inconvenience, easily resolved',
    '2 — Moderate inconvenience, some effort to resolve',
    '3 — Significant harm, requires intervention',
    '4 — Severe harm, long-lasting consequences',
    '5 — Critical harm, irreversible damage',
  ],
  scope: [
    '1 — Affects a small subset of one group',
    '2 — Affects a moderate portion of one group',
    '3 — Affects most of one group or multiple groups partially',
    '4 — Affects multiple groups substantially',
    '5 — Affects the majority of all protected groups',
  ],
  persistence: [
    '1 — Temporary, resolves naturally',
    '2 — Short-term, resolves with minor intervention',
    '3 — Medium-term, requires sustained effort',
    '4 — Long-term, deeply embedded in process',
    '5 — Permanent without structural reform',
  ],
  historicalAlignment: [
    '1 — No connection to known discrimination patterns',
    '2 — Weak or indirect connection',
    '3 — Moderate connection to historical patterns',
    '4 — Strong alignment with known discrimination',
    '5 — Directly replicates documented discrimination',
  ],
  feasibility: [
    '1 — Easily mitigated with minor changes',
    '2 — Mitigated with moderate effort',
    '3 — Requires significant effort or resources',
    '4 — Very difficult, requires systemic changes',
    '5 — Extremely difficult, fundamental redesign needed',
  ],
};

function RubricPopover({ dimKey }: { dimKey: string }) {
  const [show, setShow] = useState(false);
  const rubric = RUBRICS[dimKey];
  if (!rubric) return null;

  return (
    <span className="relative inline-block">
      <button
        onClick={() => setShow(!show)}
        onBlur={() => setTimeout(() => setShow(false), 150)}
        className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer ml-1"
        aria-label={`Scoring rubric for ${dimKey}`}
      >
        <HelpCircle size={12} />
      </button>
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-card border border-border rounded-lg p-3 shadow-lg text-[0.78rem] leading-relaxed z-50">
          {rubric.map((level, i) => (
            <span key={i} className="block mb-1 last:mb-0">{level}</span>
          ))}
        </span>
      )}
    </span>
  );
}

/* ================================================================== */
/*  Page Component                                                     */
/* ================================================================== */
export default function C3BiasSourcesPage() {
  const mode = useAuditStore(s => s.mode);
  const storeSources = useAuditStore(s => s.c3.biasSources);
  const updateBiasSource = useAuditStore(s => s.updateBiasSource);
  const auditState = useAuditStore(s => s);
  const progress = useComponentProgress('c3');

  const storeC1 = useAuditStore(s => s.c1);
  const storeC2 = useAuditStore(s => s.c2);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLearn = !mounted || mode === 'learn';
  const c1 = isLearn ? ROBODEBT_C1 : storeC1;
  const c2 = isLearn ? ROBODEBT_C2 : storeC2;
  const primaryDefinition = c2.primarySelection.definition;
  const adaptiveResult = primaryDefinition ? getAdaptiveWeights(primaryDefinition) : null;
  const sources: BiasSource[] = isLearn ? ROBODEBT_C3.biasSources : storeSources;

  /* Sort by weighted score descending */
  const sorted = useMemo(() => {
    const indexed = sources.map((s, i) => ({ ...s, _origIdx: i }));
    return [...indexed].sort((a, b) => b.weightedScore - a.weightedScore);
  }, [sources]);

  /* Show all / show fewer toggle */
  const [showAll, setShowAll] = useState(false);
  const visibleSorted = showAll ? sorted : sorted.slice(0, 3);
  const hiddenCount = sorted.length - 3;

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-[1.6rem] font-bold tracking-tight flex items-center gap-2">
          <span
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[0.9rem] font-bold flex-shrink-0"
            style={{ backgroundColor: 'var(--c3)' }}
          >
            3
          </span>
          Bias Source Identification
        </h2>
        <p className="text-muted-foreground text-[0.92rem] mt-1.5 max-w-[720px]">
          Systematically identify and prioritise the seven types of algorithmic bias using a structured taxonomy. Each source receives a <GlossaryTerm slug="proxyVariable">weighted score</GlossaryTerm> based on severity, scope, persistence, historical alignment, and mitigation feasibility.
        </p>
      </div>

      {/* Prior Findings (audit mode only) */}
      {!isLearn && (
        <PriorFindingsPanel
          title="C1 + C2 Findings"
          summary={buildProgressiveContext(auditState, 'c3')}
          color="#d97706"
        />
      )}

      {/* Progress (audit mode only) */}
      {!isLearn && <ProgressIndicator progress={progress} color="#d97706" />}

      {/* Adaptive Weights Banner */}
      {primaryDefinition && adaptiveResult && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-[var(--c2)] bg-[var(--c2)]/[0.04] mb-6">
          <Info size={20} className="text-[var(--c2)] flex-shrink-0 mt-0.5" />
          <div className="text-[0.84rem]">
            <strong className="text-[var(--c2)]">Adaptive Weights Active:</strong>{' '}
            Based on your C2 selection of <strong>{primaryDefinition}</strong>, bias dimension weights have been adjusted.
            <span className="block mt-1 text-muted-foreground">{adaptiveResult.rationale}</span>
          </div>
        </div>
      )}

      {/* Why Card */}
      <WhyCard
        component="c3"
        explanation="Before you can fix unfairness, you need to find where it comes from. Bias does not appear from nowhere -- it enters through specific, identifiable pathways in the data pipeline, model design, and deployment context."
        example="Robodebt's bias was not just 'bad data.' It entered through at least seven distinct channels: historical welfare stigma, non-representative income data, invalid measurement methodology, one-size-fits-all aggregation, self-reinforcing feedback loops, absence of accuracy evaluation, and reckless scale-up without safeguards."
      />

      {/* Methodology Panel */}
      <MethodologyPanel
        component="c3"
        title="Methodology: 7-Type Bias Taxonomy + 4-Phase Detection"
        description="We use Suresh & Guttag's (2021) seven-source taxonomy to ensure comprehensive coverage: Historical, Representation, Measurement, Aggregation, Learning, Evaluation, and Deployment bias. Each source is scored across five dimensions (severity, scope, persistence, historical alignment, feasibility of mitigation) and combined into a weighted priority score."
      />

      {/* ====== Bias Source Cards ====== */}
      <h3 className="text-[1.1rem] font-semibold mb-3">Bias Sources</h3>

      {visibleSorted.map((source, visIdx) => (
        <BiasSourceCard
          key={source.type}
          source={source}
          origIndex={source._origIdx}
          rank={visIdx + 1}
          isLearn={isLearn}
          defaultOpen={visIdx < 3 && !showAll}
          updateBiasSource={updateBiasSource}
          c1FeedbackLoops={c1.feedbackLoops}
        />
      ))}

      {!showAll && hiddenCount > 0 && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full py-3 rounded-xl border border-border bg-card hover:bg-muted text-[0.86rem] font-medium text-muted-foreground transition-colors mb-6 cursor-pointer"
        >
          Show {hiddenCount} more bias source{hiddenCount > 1 ? 's' : ''}
        </button>
      )}

      {showAll && hiddenCount > 0 && (
        <button
          onClick={() => setShowAll(false)}
          className="w-full py-3 rounded-xl border border-border bg-card hover:bg-muted text-[0.86rem] font-medium text-muted-foreground transition-colors mb-6 cursor-pointer"
        >
          Show fewer
        </button>
      )}

      {/* AI: Bias inventory review */}
      {!isLearn && (
        <AnalyzeButton
          systemPrompt={PROMPT_TEMPLATES.c3_inventory_review.system}
          userPrompt={PROMPT_TEMPLATES.c3_inventory_review.user(
            buildProgressiveContext(auditState, 'c3'),
            sources.map(s => `${s.type}: score=${s.weightedScore.toFixed(1)} (${s.priority}) evidence="${s.evidence || 'none'}"`).join('\n')
          )}
          component="c3"
          section="inventory-review"
          buttonLabel="Review Bias Inventory"
          className="mb-6"
        />
      )}

      {/* ====== Prioritisation Table ====== */}
      <PrioritisationTable
        sources={sources}
        isLearn={isLearn}
        updateBiasSource={updateBiasSource}
      />

      {/* ====== Bias Prioritisation Chart ====== */}
      <BiasBarChart sources={sorted} />

      {/* ====== Handoff ====== */}
      <HandoffCard
        title="Next: Fairness Metrics & Reporting"
        description="With bias sources identified and prioritised, quantify the disparities using statistical metrics and build actionable recommendations."
        nextHref="/c4-fairness-metrics"
        nextLabel="C4 Fairness Metrics"
        nextColor="var(--c4)"
      />

      {/* Chat Sidebar (audit mode only) */}
      {!isLearn && <ChatSidebar component="c3" context={buildProgressiveContext(auditState, 'c3')} />}
    </div>
  );
}

/* ================================================================== */
/*  Bias Source Card                                                    */
/* ================================================================== */
interface BiasSourceCardProps {
  source: BiasSource & { _origIdx: number };
  origIndex: number;
  rank: number;
  isLearn: boolean;
  defaultOpen: boolean;
  updateBiasSource: (index: number, updates: Partial<BiasSource>) => void;
  c1FeedbackLoops: FeedbackLoop[];
}

function BiasSourceCard({
  source,
  origIndex,
  rank,
  isLearn,
  defaultOpen,
  updateBiasSource,
  c1FeedbackLoops,
}: BiasSourceCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  const handleIndicatorToggle = useCallback(
    (checkIdx: number) => {
      if (isLearn) return;
      const next = [...source.indicatorChecks];
      next[checkIdx] = !next[checkIdx];
      updateBiasSource(origIndex, { indicatorChecks: next });
    },
    [isLearn, source.indicatorChecks, origIndex, updateBiasSource],
  );

  const handleEvidenceChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (isLearn) return;
      updateBiasSource(origIndex, { evidence: e.target.value });
    },
    [isLearn, origIndex, updateBiasSource],
  );

  const handleSeverityChange = useCallback(
    (val: number[]) => {
      if (isLearn) return;
      updateBiasSource(origIndex, { severityScore: val[0] });
    },
    [isLearn, origIndex, updateBiasSource],
  );

  const priorityColor = getPriorityColor(source.priority);
  const priorityBg = getPriorityBgColor(source.priority);

  return (
    <div className="bg-card rounded-xl border border-border mb-4 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-muted transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <span
            className="w-7 h-7 rounded-full flex items-center justify-center text-[0.72rem] font-bold text-white flex-shrink-0"
            style={{ backgroundColor: 'var(--c3)' }}
          >
            {rank}
          </span>
          <div className="text-left">
            <h4 className="text-[0.92rem] font-semibold">{source.type} Bias</h4>
            <p className="text-[0.78rem] text-muted-foreground mt-0.5">
              {BIAS_SUBTITLES[source.type]}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Score + Priority Badge */}
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[0.78rem] font-bold"
            style={{ backgroundColor: priorityBg, color: priorityColor }}
          >
            {source.weightedScore.toFixed(1)}
            <RiskBadge level={source.priority} />
          </span>
          <ChevronDown
            size={18}
            className={`text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Expanded Content */}
      {open && (
        <div className="px-5 pb-5 border-t border-border pt-4">
          {/* Description */}
          <p className="text-[0.84rem] text-muted-foreground leading-relaxed mb-4">
            {source.description}
          </p>

          {/* Indicator Checklist */}
          <div className="mb-4">
            <h5 className="text-[0.82rem] font-semibold mb-2">Indicator Checklist</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {source.indicators.map((indicator, idx) => (
                <label
                  key={idx}
                  className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-[0.82rem] leading-snug ${
                    source.indicatorChecks[idx]
                      ? 'border-[var(--c3)] bg-[var(--c3-bg)]'
                      : 'border-border bg-card'
                  } ${isLearn ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <Checkbox
                    checked={source.indicatorChecks[idx] ?? false}
                    onCheckedChange={() => handleIndicatorToggle(idx)}
                    disabled={isLearn}
                    className="mt-0.5"
                  />
                  <span>{indicator}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Evidence */}
          <div className="mb-4">
            <h5 className="text-[0.82rem] font-semibold mb-1.5">Evidence</h5>
            <textarea
              className={`w-full px-3.5 py-2.5 border border-border rounded-lg text-[0.84rem] leading-relaxed bg-card text-foreground resize-y transition-colors focus:outline-none focus:border-[var(--c3)] focus:ring-[3px] focus:ring-[var(--c3)]/10 ${
                isLearn ? 'bg-muted text-muted-foreground cursor-default' : ''
              }`}
              rows={3}
              readOnly={isLearn}
              defaultValue={source.evidence}
              placeholder={isLearn ? '' : 'Describe the evidence for this bias source...'}
              onChange={handleEvidenceChange}
            />
          </div>

          {/* Feedback Loop Callout (Deployment bias only) */}
          {source.type === 'Deployment' && c1FeedbackLoops.length > 0 && (
            <div className="mb-4 p-3 rounded-lg border-l-[3px] border-[var(--c1)] bg-[var(--c1)]/[0.04]">
              <div className="flex items-center gap-2 mb-1.5">
                <AlertTriangle size={14} className="text-[var(--c1)]" />
                <span className="text-[0.82rem] font-semibold">
                  C1 identified {c1FeedbackLoops.length} feedback loop{c1FeedbackLoops.length > 1 ? 's' : ''} that may amplify deployment bias:
                </span>
              </div>
              <ul className="text-[0.78rem] text-muted-foreground space-y-1 ml-5">
                {c1FeedbackLoops.map(fl => (
                  <li key={fl.id} className="list-disc">{fl.trigger}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Accountable Party */}
          <div className="mb-4">
            <h5 className="text-[0.82rem] font-semibold mb-1.5">Accountable Party</h5>
            {isLearn ? (
              <div className="px-3.5 py-2.5 border border-border rounded-lg text-[0.84rem] bg-muted text-muted-foreground">
                {ROBODEBT_ACCOUNTABILITY[source.type] || 'Not assigned'}
              </div>
            ) : (
              <select
                className="w-full px-3.5 py-2.5 border border-border rounded-lg text-[0.84rem] bg-card text-foreground transition-colors focus:outline-none focus:border-[var(--c3)] focus:ring-[3px] focus:ring-[var(--c3)]/10"
                value={source.accountableParty || ''}
                onChange={(e) => {
                  if (!isLearn) {
                    updateBiasSource(origIndex, { accountableParty: e.target.value as BiasSource['accountableParty'] });
                  }
                }}
              >
                <option value="">Select accountable party...</option>
                <option value="Data Team">Data Team</option>
                <option value="Model Team">Model Team</option>
                <option value="Product Team">Product Team</option>
                <option value="Legal/Compliance">Legal/Compliance</option>
                <option value="Leadership">Leadership</option>
                <option value="External">External</option>
              </select>
            )}
          </div>

          {/* Severity Slider */}
          <div className="mb-2">
            <h5 className="text-[0.82rem] font-semibold mb-2">
              Severity Score: <span style={{ color: 'var(--c3)' }}>{source.severityScore}/5</span>
            </h5>
            <Slider
              min={1}
              max={5}
              step={1}
              value={[source.severityScore]}
              onValueChange={handleSeverityChange}
              disabled={isLearn}
              className="max-w-[300px]"
            />
            <div className="flex justify-between text-[0.72rem] text-muted-foreground max-w-[300px] mt-1">
              <span>1 - Minor</span>
              <span>5 - Critical</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Prioritisation Table                                               */
/* ================================================================== */
interface PrioritisationTableProps {
  sources: BiasSource[];
  isLearn: boolean;
  updateBiasSource: (index: number, updates: Partial<BiasSource>) => void;
}

function PrioritisationTable({ sources, isLearn, updateBiasSource }: PrioritisationTableProps) {
  const handleDimensionChange = useCallback(
    (sourceIdx: number, dimKey: keyof BiasDimensions, value: number) => {
      if (isLearn) return;
      const current = sources[sourceIdx];
      const newDims = { ...current.dimensions, [dimKey]: value };
      const newScore = calculateWeightedScore(newDims);
      const newPriority = classifyBiasPriority(newScore);
      updateBiasSource(sourceIdx, {
        dimensions: newDims,
        weightedScore: newScore,
        priority: newPriority,
      });
    },
    [isLearn, sources, updateBiasSource],
  );

  return (
    <ChartCard
      title="Bias Prioritisation Table"
      description="Five dimension scores combined with weighted formula. Severity 30%, Scope 20%, Persistence 20%, Historical Alignment 20%, Feasibility 10%."
      borderColor="var(--c3)"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-[0.82rem]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-3 font-semibold text-muted-foreground">
                Bias Type
              </th>
              {DIMENSION_META.map(d => (
                <th key={d.key} className="text-center py-2 px-2 font-semibold text-muted-foreground">
                  <div className="flex items-center justify-center gap-0.5">
                    {d.label}
                    <RubricPopover dimKey={d.key} />
                  </div>
                  <div className="text-[0.68rem] font-normal">{d.weight}</div>
                </th>
              ))}
              <th className="text-center py-2 px-2 font-semibold text-muted-foreground">
                Weighted
              </th>
              <th className="text-center py-2 px-2 font-semibold text-muted-foreground">
                Priority
              </th>
            </tr>
          </thead>
          <tbody>
            {sources.map((source, idx) => (
              <tr key={source.type} className="border-b border-border/50 hover:bg-muted/50">
                <td className="py-3 pr-3 font-medium">{source.type}</td>
                {DIMENSION_META.map(d => (
                  <td key={d.key} className="py-3 px-2 text-center">
                    {isLearn ? (
                      <span className="font-mono text-[0.84rem]">
                        {source.dimensions[d.key]}
                      </span>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <Slider
                          min={1}
                          max={5}
                          step={1}
                          value={[source.dimensions[d.key]]}
                          onValueChange={(val) => handleDimensionChange(idx, d.key, val[0])}
                          className="w-16"
                        />
                        <span className="text-[0.72rem] font-mono text-muted-foreground">
                          {source.dimensions[d.key]}
                        </span>
                      </div>
                    )}
                  </td>
                ))}
                <td className="py-3 px-2 text-center">
                  <span className="font-bold text-[0.9rem]" style={{ color: getPriorityColor(source.priority) }}>
                    {source.weightedScore.toFixed(1)}
                  </span>
                </td>
                <td className="py-3 px-2 text-center">
                  <RiskBadge level={source.priority} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartCard>
  );
}

/* ================================================================== */
/*  Bias Prioritisation Bar Chart                                      */
/* ================================================================== */
interface BiasBarChartProps {
  sources: (BiasSource & { _origIdx: number })[];
}

function BiasBarChart({ sources }: BiasBarChartProps) {
  const chartData = useMemo(
    () =>
      sources.map(s => ({
        type: s.type,
        weightedScore: s.weightedScore,
        priority: s.priority,
        color: getPriorityColor(s.priority),
      })),
    [sources],
  );

  return (
    <ChartCard
      title="Bias Prioritisation Chart"
      description="Weighted scores by bias type, colored by priority classification."
      borderColor="var(--c3)"
      interpretation={{
        title: 'How to read this chart',
        text: 'Longer bars indicate higher overall priority. Red bars (High) demand immediate attention. Orange bars (Medium) should be addressed in the short term. Green bars (Low) can be monitored.',
      }}
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 5, right: 40, left: 10, bottom: 5 }}
          role="img"
          aria-label="Bias prioritisation bar chart showing weighted scores by bias type"
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 12 }} />
          <YAxis
            type="category"
            dataKey="type"
            width={110}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number, _name: string, props: { payload: { priority: string } }) => [
              `${value.toFixed(1)} (${props.payload.priority})`,
              'Weighted Score',
            ]}
            contentStyle={{ fontSize: '0.82rem', borderRadius: '8px' }}
          />
          <Bar dataKey="weightedScore" radius={[0, 6, 6, 0]} maxBarSize={28}>
            {chartData.map((entry, idx) => (
              <Cell key={idx} fill={entry.color} />
            ))}
            <LabelList
              dataKey="weightedScore"
              position="right"
              formatter={(v: number) => v.toFixed(1)}
              style={{ fontSize: '0.78rem', fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
