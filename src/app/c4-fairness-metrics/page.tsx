'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAuditStore } from '@/store/audit-store';
import { ROBODEBT_C4 } from '@/lib/data/robodebt';
import type { C4Data, GroupRate } from '@/types/audit';

import { WhyCard } from '@/components/shared/WhyCard';
import { MethodologyPanel } from '@/components/shared/MethodologyPanel';
import { HandoffCard } from '@/components/shared/HandoffCard';
import { ChartCard } from '@/components/shared/ChartCard';
import { RiskBadge } from '@/components/shared/RiskBadge';
import { ActionGuidance } from '@/components/shared/ActionGuidance';
import { WorksheetField } from '@/components/shared/WorksheetField';
import { GlossaryTerm } from '@/components/shared/GlossaryTerm';
import { ProgressIndicator } from '@/components/shared/ProgressIndicator';
import { PriorFindingsPanel } from '@/components/shared/PriorFindingsPanel';
import { AnalyzeButton } from '@/components/llm/AnalyzeButton';
import { ChatSidebar } from '@/components/llm/ChatSidebar';
import { buildProgressiveContext } from '@/lib/llm/context-builder';
import { PROMPT_TEMPLATES } from '@/lib/llm/prompt-templates';
import { useComponentProgress } from '@/hooks/useComponentProgress';
import { AlertTriangle, BarChart3, TrendingUp, Target, Activity, CheckCircle2, Download, HelpCircle, Info } from 'lucide-react';
import { getRecommendedMetrics } from '@/lib/calculations/bias-prioritization';
import { Slider } from '@/components/ui/slider';

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
  ErrorBar,
  LineChart,
  Line,
  Legend,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';

/* ================================================================== */
/*  Page Component                                                     */
/* ================================================================== */
export default function C4FairnessMetricsPage() {
  const mode = useAuditStore(s => s.mode);
  const auditState = useAuditStore(s => s);
  const progress = useComponentProgress('c4');
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLearn = !mounted || mode === 'learn';

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-[1.6rem] font-bold tracking-tight flex items-center gap-2">
          <span
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[0.9rem] font-bold flex-shrink-0"
            style={{ backgroundColor: 'var(--c4)' }}
          >
            4
          </span>
          Fairness Metrics &amp; Reporting
        </h2>
        <p className="text-muted-foreground text-[0.92rem] mt-1.5 max-w-[720px]">
          Quantify fairness disparities with statistical validation, visualisation, and actionable recommendations.
          Key metrics include <GlossaryTerm slug="spd">SPD</GlossaryTerm>, <GlossaryTerm slug="confidenceInterval">confidence intervals</GlossaryTerm>, and <GlossaryTerm slug="effectSize">effect sizes</GlossaryTerm>.
        </p>
      </div>

      {/* Prior Findings (audit mode only) */}
      {!isLearn && (
        <PriorFindingsPanel
          title="C1 + C2 + C3 Findings"
          summary={buildProgressiveContext(auditState, 'c4')}
          color="#e11d48"
        />
      )}

      {/* Progress (audit mode only) */}
      {!isLearn && <ProgressIndicator progress={progress} color="#e11d48" />}

      {isLearn ? <LearnModeContent /> : <AuditModeContent auditState={auditState} />}

      {/* Chat Sidebar (audit mode only) */}
      {!isLearn && <ChatSidebar component="c4" context={buildProgressiveContext(auditState, 'c4')} />}
    </div>
  );
}

/* ================================================================== */
/*  LEARN MODE                                                         */
/* ================================================================== */
function LearnModeContent() {
  const data = ROBODEBT_C4;

  return (
    <>
      {/* Why Card */}
      <WhyCard
        component="c4"
        explanation="Words like 'unfair' can be debated endlessly. Numbers make it concrete. Fairness metrics translate the bias sources identified in C3 into measurable disparities -- letting you prove exactly how much certain groups are harmed and track whether interventions work."
        example="Robodebt was defended for years as 'efficient' until statistical analysis showed that 74% of debts were invalid, Indigenous Australians were flagged at nearly double the rate of non-Indigenous recipients, and the youngest adults bore the highest false-positive burden."
      />

      {/* Methodology */}
      <MethodologyPanel
        component="c4"
        title="Methodology: Statistical Parity Difference + Error Rate Analysis"
        description="We compute Statistical Parity Difference (SPD) to measure outcome rate disparities across groups, disaggregated error rates to identify which groups bear the highest false-positive burden, intersectional analysis for compounding disadvantage, and threshold sensitivity to show how design choices amplify or reduce unfairness."
      />

      {/* Illustrative Notice */}
      <div className="flex items-start gap-3 p-4 rounded-xl border border-[var(--warn)] bg-[var(--warn-light)] mb-6">
        <AlertTriangle size={20} className="text-[#b8860b] flex-shrink-0 mt-0.5" />
        <div className="text-[0.84rem]">
          <strong className="text-[#b8860b]">Illustrative Data Notice:</strong>{' '}
          The metrics below are constructed from Royal Commission findings, Senate inquiry data, and published analyses.
          Exact individual-level data was never released. These figures represent best estimates consistent
          with the public record and are used for educational purposes.
        </div>
      </div>

      {/* Stats Row */}
      <StatsRow data={data} />

      {/* Action Guidance - What the numbers mean */}
      <ActionGuidance
        title="What These Numbers Mean"
        items={[
          {
            level: 'critical',
            title: 'Massive Disparity in Debt Notice Rates',
            description:
              'Indigenous Australians received debt notices at 48% vs 27% for non-Indigenous recipients (SPD = +0.21). This exceeds the commonly used 0.05 threshold by more than four times.',
          },
          {
            level: 'critical',
            title: 'Catastrophic Error Rate',
            description:
              'Approximately 74% of all debts raised were invalid. For Indigenous Australians in remote areas aged 18-24, the error rate reached 91% -- meaning 9 out of 10 debt notices were wrong.',
          },
          {
            level: 'critical',
            title: 'Age-Based Discrimination Embedded in Methodology',
            description:
              'Young adults (18-24) were flagged at 42% vs 14% for the 55+ group. The income averaging methodology was inherently biased against anyone with variable employment patterns.',
          },
        ]}
      />

      {/* Debt Notice Rates Chart with Toggle */}
      <DebtNoticeRatesChart data={data} />

      {/* SPD Chart */}
      <SPDChart data={data} />

      {/* Error Rates Chart */}
      <ErrorRatesChart data={data} />

      {/* Intersectional Table */}
      <IntersectionalTable data={data} />

      {/* Threshold Sensitivity Chart */}
      <ThresholdSensitivityChart data={data} />

      {/* Statistical Validation Panel */}
      <StatisticalValidationPanel data={data} />

      {/* Recommendations */}
      <RecommendationsPanel data={data} />

      {/* Radar Chart */}
      <AuditRadarChart data={data} />

      {/* Final Action Guidance */}
      <ActionGuidance
        title="What Now? -- Turning Findings Into Action"
        items={[
          {
            level: 'critical',
            title: 'Immediate: Stop the Harm',
            description:
              'Cease all debt notices based solely on income averaging. Suspend automated garnishing. Establish emergency review for the highest-disparity groups (Indigenous, remote, young adults).',
          },
          {
            level: 'elevated',
            title: 'Short-term: Fix the Methodology',
            description:
              'Implement fortnightly income verification using employer payroll data. Conduct demographic parity audits on all historical debt notices and prioritise refunds for the most impacted groups.',
          },
          {
            level: 'normal',
            title: 'Long-term: Prevent Recurrence',
            description:
              'Reform legislation to mandate algorithmic impact assessments. Deploy continuous fairness monitoring. Establish independent oversight with affected community representation.',
          },
        ]}
      />

      {/* Handoff */}
      <HandoffCard
        title="Audit Complete"
        description="You have completed all four components of the fairness audit. Return to the overview to review your findings or switch to Audit Mode to conduct your own analysis."
        nextHref="/"
        nextLabel="Return to Overview"
        nextColor="var(--c4)"
      />
    </>
  );
}

/* ================================================================== */
/*  Audit Rubric Popover                                               */
/* ================================================================== */
function AuditRubricPopover({ tooltip }: { tooltip: string }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-block">
      <button
        onClick={() => setShow(!show)}
        onBlur={() => setTimeout(() => setShow(false), 150)}
        className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        aria-label="Scoring rubric"
      >
        <HelpCircle size={12} />
      </button>
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-card border border-border rounded-lg p-3 shadow-lg text-[0.78rem] leading-relaxed z-50">
          {tooltip}
        </span>
      )}
    </span>
  );
}

/* ================================================================== */
/*  AUDIT MODE                                                         */
/* ================================================================== */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function AuditModeContent({ auditState }: { auditState: any }) {
  const c4 = useAuditStore(s => s.c4);
  const updateC4Field = useAuditStore(s => s.updateC4Field);
  const updateMetricSummary = useAuditStore(s => s.updateMetricSummary);
  const updateStatisticalValidation = useAuditStore(s => s.updateStatisticalValidation);
  const storeC1 = useAuditStore(s => s.c1);
  const storeC3 = useAuditStore(s => s.c3);
  const storeC2 = useAuditStore(s => s.c2);
  const updateLimitations = useAuditStore(s => s.updateLimitations);
  const limitations = useAuditStore(s => s.limitations);
  const primaryDefinition = storeC2.primarySelection.definition;
  const recommendedMetrics = getRecommendedMetrics(storeC3.biasSources, primaryDefinition);

  return (
    <>
      {/* Methodology */}
      <MethodologyPanel
        component="c4"
        title="Methodology: Statistical Parity Difference + Error Rate Analysis"
        description="Compute SPD to measure outcome rate disparities, disaggregate error rates by group, conduct intersectional analysis, and test threshold sensitivity. Use the scaffold guidance below to work through each section."
      />

      {/* Scaffold guidance */}
      <div className="border-2 border-dashed border-[var(--c4)]/40 bg-[var(--c4)]/[0.04] rounded-xl p-4 text-[0.84rem] text-muted-foreground mb-6">
        <strong className="text-foreground block mb-1">How to Complete This Section</strong>
        For each section below, compute the relevant metric for your system. If exact data is unavailable,
        document what data you would need, your best estimates, and confidence intervals. The goal is to make
        disparities visible and quantifiable, even if preliminary.
      </div>

      {/* Recommended Metrics Based on C3 Findings */}
      {recommendedMetrics.length > 0 && (
        <div className="bg-card rounded-xl p-5 border border-border mb-6" style={{ borderTopWidth: 3, borderTopColor: '#e11d48' }}>
          <h3 className="text-[1.05rem] font-semibold mb-1">Recommended Metrics Based on C3 Findings</h3>
          <p className="text-[0.82rem] text-muted-foreground mb-3">
            These metrics are recommended based on the bias sources identified in Component 3 and your C2 fairness definition selection.
          </p>
          <div className="space-y-2">
            {recommendedMetrics.slice(0, 8).map((m, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted border border-border/50">
                <span className="px-2 py-0.5 rounded text-[0.68rem] font-bold uppercase tracking-wide bg-[var(--c3)]/10 text-[var(--c3)] flex-shrink-0 mt-0.5">
                  {m.biasSource}
                </span>
                <div>
                  <div className="text-[0.84rem] font-semibold">{m.metric}</div>
                  <code className="text-[0.75rem] text-[var(--c4)] bg-background px-1.5 py-0.5 rounded font-mono inline-block mt-0.5 mb-0.5">
                    {m.formula}
                  </code>
                  <p className="text-[0.78rem] text-muted-foreground">{m.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metric Summary */}
      <div className="bg-card rounded-xl p-5 border border-border mb-6">
        <h3 className="text-[1.05rem] font-semibold mb-4">Metric Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <WorksheetField
            label="Highest Group Rate"
            value={c4.metricSummary.highestGroupRate}
            onChange={(v) => updateMetricSummary({ highestGroupRate: v })}
            placeholder="e.g., Group X: 48% flagged rate"
            scaffoldTip="Which group has the highest outcome/flagging rate?"
            multiline={false}
          />
          <WorksheetField
            label="Lowest Group Rate"
            value={c4.metricSummary.lowestGroupRate}
            onChange={(v) => updateMetricSummary({ lowestGroupRate: v })}
            placeholder="e.g., Group Y: 14% flagged rate"
            scaffoldTip="Which group has the lowest outcome/flagging rate?"
            multiline={false}
          />
          <WorksheetField
            label="Worst SPD"
            value={c4.metricSummary.worstSPD}
            onChange={(v) => updateMetricSummary({ worstSPD: v })}
            placeholder="e.g., Group A vs Group B: SPD = 0.21"
            scaffoldTip="SPD = Group A rate minus Group B rate. Example: if Group A is flagged at 48% and Group B at 27%, then SPD = 0.48 - 0.27 = 0.21. Values above 0.05 are generally considered meaningful."
            multiline={false}
          />
          <WorksheetField
            label="Overall Error Rate"
            value={c4.metricSummary.overallErrorRate}
            onChange={(v) => updateMetricSummary({ overallErrorRate: v })}
            placeholder="e.g., 74% of decisions were incorrect"
            scaffoldTip="What fraction of positive decisions (flags/actions) were incorrect?"
            multiline={false}
          />
        </div>
      </div>

      {/* AI: Metrics recommendation */}
      <AnalyzeButton
        systemPrompt={PROMPT_TEMPLATES.c4_metrics_recommendation.system}
        userPrompt={PROMPT_TEMPLATES.c4_metrics_recommendation.user(
          buildProgressiveContext(auditState, 'c4')
        )}
        component="c4"
        section="metrics-recommendation"
        buttonLabel="Get AI Metrics Recommendation"
        className="mb-6"
      />

      {/* Group Outcome Rates */}
      <div className="bg-card rounded-xl p-5 border border-border mb-6">
        <h3 className="text-[1.05rem] font-semibold mb-1">Group Outcome Rates</h3>
        <WorksheetField
          label="Document outcome rates by group"
          value={c4.groupOutcomeRates}
          onChange={(v) => updateC4Field('groupOutcomeRates', v)}
          rows={5}
          placeholder="List each protected group and its outcome rate. Include confidence intervals if available."
          scaffoldTip="For each protected group identified in C1, calculate the percentage that received the outcome. Example: if 400 of 1000 applicants in Group A were approved, the rate is 40% (0.40). Then compute SPD = Group A rate minus reference group rate."
        />
      </div>

      {/* Error Rates by Group */}
      <div className="bg-card rounded-xl p-5 border border-border mb-6">
        <h3 className="text-[1.05rem] font-semibold mb-1">Error Rates by Group</h3>
        <WorksheetField
          label="Document error rates (false positive / false negative) by group"
          value={c4.errorRateAnalysis}
          onChange={(v) => updateC4Field('errorRateAnalysis', v)}
          rows={5}
          placeholder="For each group, report the false positive rate and/or false negative rate."
          scaffoldTip="Disaggregate the overall error rate by group. Which groups bear a disproportionate share of false positives?"
        />
      </div>

      {/* Intersectional Analysis */}
      <div className="bg-card rounded-xl p-5 border border-border mb-6">
        <h3 className="text-[1.05rem] font-semibold mb-1">Intersectional Analysis</h3>
        {storeC1.intersections.length > 0 && (
          <div className="mb-3 p-3 rounded-lg border-l-[3px] border-[var(--c1)] bg-[var(--c1)]/[0.04]">
            <div className="flex items-center gap-2 mb-1.5">
              <Info size={14} className="text-[var(--c1)]" />
              <span className="text-[0.82rem] font-semibold">Based on C1 analysis, evaluate these intersectional groups:</span>
            </div>
            <ul className="text-[0.78rem] text-muted-foreground space-y-1 ml-5">
              {storeC1.intersections.map((ix, i) => (
                <li key={i} className="list-disc"><strong>{ix.groups}</strong> (priority {ix.priority}): {ix.pattern}</li>
              ))}
            </ul>
          </div>
        )}
        <WorksheetField
          label="Analyse outcomes at intersections of multiple protected attributes"
          value={c4.intersectionalAnalysis}
          onChange={(v) => updateC4Field('intersectionalAnalysis', v)}
          rows={5}
          placeholder="Describe outcomes for intersectional subgroups (e.g., young + Indigenous + remote)."
          scaffoldTip="Cross-tabulate protected attributes to identify compounding disadvantage. Which intersectional subgroups are worst affected?"
        />
      </div>

      {/* Threshold Sensitivity */}
      <div className="bg-card rounded-xl p-5 border border-border mb-6">
        <h3 className="text-[1.05rem] font-semibold mb-1">Threshold Sensitivity</h3>
        <WorksheetField
          label="Analyse how varying decision thresholds affects fairness metrics"
          value={c4.thresholdAnalysis}
          onChange={(v) => updateC4Field('thresholdAnalysis', v)}
          rows={4}
          placeholder="Document how changing the decision threshold affects false positive rates and true positive rates."
          scaffoldTip="If your system uses a threshold (score cutoff, tolerance band), test multiple values. How do FP and TP rates change?"
        />
      </div>

      {/* Statistical Validation — Simplified */}
      <div className="bg-card rounded-xl p-5 border border-border mb-6">
        <h3 className="text-[1.05rem] font-semibold mb-1">Statistical Validation</h3>
        <p className="text-[0.82rem] text-muted-foreground mb-4">
          Confirm that the disparities you found are real and meaningful, not just statistical noise.
        </p>

        {/* Simplified checklist (default) */}
        <div className="mb-4">
          <h4 className="text-[0.86rem] font-semibold mb-2">Validation Checklist</h4>
          <div className="space-y-2">
            {[
              { label: 'Sample size adequate (n > 100 per group)', key: 'sampleSize' },
              { label: 'Measured disparity substantively meaningful (SPD > 0.05)', key: 'meaningful' },
              { label: 'Disparity persists across multiple subgroups', key: 'subgroups' },
              { label: 'Pattern aligns with C1 historical discrimination findings', key: 'historical' },
            ].map(item => (
              <label key={item.key} className="flex items-center gap-2.5 text-[0.84rem] cursor-pointer">
                <input type="checkbox" className="accent-[#e11d48]" />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* AI validation interpretation */}
        <AnalyzeButton
          systemPrompt={PROMPT_TEMPLATES.c4_results_interpretation.system}
          userPrompt={PROMPT_TEMPLATES.c4_results_interpretation.user(
            buildProgressiveContext(auditState, 'c4'),
            `Metric summary: Highest=${c4.metricSummary.highestGroupRate}, Lowest=${c4.metricSummary.lowestGroupRate}, Worst SPD=${c4.metricSummary.worstSPD}, Error rate=${c4.metricSummary.overallErrorRate}\nGroup outcomes: ${c4.groupOutcomeRates}\nError analysis: ${c4.errorRateAnalysis}`
          )}
          component="c4"
          section="validation-interpretation"
          buttonLabel="Get AI Validation Interpretation"
          className="mb-4"
        />

        {/* Advanced: Technical Statistical Methods (collapsible) */}
        <details className="mt-4">
          <summary className="text-[0.84rem] font-semibold cursor-pointer hover:text-[var(--c4)] transition-colors">
            Advanced: Technical Statistical Methods
          </summary>
          <p className="text-[0.78rem] text-muted-foreground mt-2 mb-3">
            Optional — for users with statistical programming expertise. Complete these if you can run <GlossaryTerm slug="bootstrapCI">bootstrap</GlossaryTerm>, <GlossaryTerm slug="permutationTest">permutation tests</GlossaryTerm>, or <GlossaryTerm slug="bayesianAnalysis">Bayesian analysis</GlossaryTerm>.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <WorksheetField
              label="Bootstrap Confidence Intervals"
              value={c4.validationBootstrap}
              onChange={(v) => updateStatisticalValidation({ bootstrap: v })}
              rows={3}
              placeholder="Report bootstrap 95% CIs for key metrics."
              scaffoldTip="Resample with replacement (n=10,000) and compute 95% CIs for SPD and error rate differences."
            />
            <WorksheetField
              label="Permutation Test"
              value={c4.validationPermutation}
              onChange={(v) => updateStatisticalValidation({ permutation: v })}
              rows={3}
              placeholder="Report permutation test p-values."
              scaffoldTip="Randomly shuffle group labels and recompute metrics. If the real difference is bigger than almost all shuffled results, the disparity is real."
            />
            <WorksheetField
              label="Effect Size"
              value={c4.validationEffectSize}
              onChange={(v) => updateStatisticalValidation({ effectSize: v })}
              rows={3}
              placeholder="Report Cohen's d or other effect size measures."
              scaffoldTip="How big is the difference in practical terms? Cohen's d: 0.2 = small, 0.5 = medium, 0.8 = large."
            />
            <WorksheetField
              label="Bayesian Analysis"
              value={c4.validationBayesian}
              onChange={(v) => updateStatisticalValidation({ bayesian: v })}
              rows={3}
              placeholder="Report posterior probabilities or Bayes Factors."
              scaffoldTip="Optional: What is the probability that the true disparity exceeds your threshold, given the data?"
            />
          </div>
        </details>
      </div>

      {/* Recommendations */}
      <div className="bg-card rounded-xl p-5 border border-border mb-6">
        <h3 className="text-[1.05rem] font-semibold mb-4">Recommendations</h3>
        <WorksheetField
          label="Pre-deployment Recommendations"
          value={c4.preDeploymentRecs}
          onChange={(v) => updateC4Field('preDeploymentRecs', v)}
          rows={4}
          placeholder="What actions should be taken before the system is (re)deployed?"
          scaffoldTip="Based on the fairness metrics above, what changes to data, methodology, or thresholds are needed before deployment?"
        />
        <WorksheetField
          label="Post-deployment Recommendations"
          value={c4.postDeploymentRecs}
          onChange={(v) => updateC4Field('postDeploymentRecs', v)}
          rows={4}
          placeholder="What monitoring, oversight, and remediation mechanisms are needed?"
          scaffoldTip="What ongoing monitoring, human oversight, appeal mechanisms, and fairness dashboards are needed post-deployment?"
        />
        {storeC1.feedbackLoops.length > 0 && (
          <div className="mt-4 p-3 rounded-lg border-l-[3px] border-[var(--c1)] bg-[var(--c1)]/[0.04]">
            <div className="flex items-center gap-2 mb-1.5">
              <Info size={14} className="text-[var(--c1)]" />
              <span className="text-[0.82rem] font-semibold">C1 feedback loops to address in post-deployment monitoring:</span>
            </div>
            <ul className="text-[0.78rem] text-muted-foreground space-y-1.5 ml-5">
              {storeC1.feedbackLoops.map(fl => (
                <li key={fl.id} className="list-disc">
                  <strong>{fl.trigger}</strong>
                  <span className="block text-[0.75rem]">Mechanism: {fl.mechanism}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* Impact Assessment */}
        <div className="mt-4 pt-4 border-t border-border">
          <h4 className="text-[0.86rem] font-semibold mb-3">Recommendation Impact Assessment</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[0.78rem] font-semibold text-foreground mb-1">Effort Level</label>
              <select className="w-full px-3 py-2 border border-border rounded-lg text-[0.84rem] bg-card text-foreground focus:outline-none focus:border-[var(--c4)]">
                <option value="">Select...</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <WorksheetField
              label="Timeline"
              value=""
              onChange={() => {}}
              multiline={false}
              placeholder="e.g., 2-4 weeks"
              scaffoldTip="Estimated time to implement the primary recommendation"
            />
            <WorksheetField
              label="Expected Impact"
              value=""
              onChange={() => {}}
              multiline={false}
              placeholder="e.g., Reduces FPR by ~60%"
              scaffoldTip="Expected measurable improvement from this recommendation"
            />
          </div>
        </div>
      </div>

      {/* Audit Dimension Scores — Structured Rubric */}
      <div className="bg-card rounded-xl p-5 border border-border mb-6">
        <h3 className="text-[1.05rem] font-semibold mb-4">Audit Dimension Scores</h3>
        <p className="text-[0.82rem] text-muted-foreground mb-4">
          Rate the system on each audit dimension (1-5). Hover over the help icon for scoring guidance.
        </p>
        <div className="space-y-4">
          {[
            { dimension: 'Data Quality', tooltip: '1 = Data fundamentally flawed or missing | 3 = Data adequate with known gaps | 5 = Data comprehensive, validated, representative', key: 0 },
            { dimension: 'Fairness Metrics', tooltip: '1 = Severe disparities (SPD > 0.15) with no mitigation | 3 = Moderate disparities with some mitigation | 5 = Minimal disparities, actively monitored', key: 1 },
            { dimension: 'Transparency', tooltip: '1 = Process opaque to affected individuals | 3 = Partial transparency, some explanation available | 5 = Full transparency, clear explanations provided', key: 2 },
            { dimension: 'Accountability', tooltip: '1 = No oversight or governance structures | 3 = Basic oversight exists but gaps remain | 5 = Robust governance with independent oversight', key: 3 },
            { dimension: 'Remediation', tooltip: '1 = No remediation for harm caused | 3 = Some remediation but incomplete | 5 = Comprehensive remediation with ongoing monitoring', key: 4 },
          ].map(dim => {
            const currentScore = c4.auditDimensions[dim.key]?.score ?? 1;
            return (
              <div key={dim.dimension} className="flex items-center gap-4">
                <div className="w-[160px] flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-[0.84rem] font-medium">{dim.dimension}</span>
                  <AuditRubricPopover tooltip={dim.tooltip} />
                </div>
                <Slider
                  min={1}
                  max={5}
                  step={1}
                  value={[currentScore]}
                  onValueChange={(val) => {
                    const newDimensions = [...(c4.auditDimensions.length > 0 ? c4.auditDimensions : [
                      { dimension: 'Data Quality', score: 1, max: 5, tooltip: '' },
                      { dimension: 'Fairness Metrics', score: 1, max: 5, tooltip: '' },
                      { dimension: 'Transparency', score: 1, max: 5, tooltip: '' },
                      { dimension: 'Accountability', score: 1, max: 5, tooltip: '' },
                      { dimension: 'Remediation', score: 1, max: 5, tooltip: '' },
                    ])];
                    newDimensions[dim.key] = { ...newDimensions[dim.key], dimension: dim.dimension, score: val[0], max: 5, tooltip: dim.tooltip };
                    updateC4Field('auditDimensions', newDimensions);
                  }}
                  className="flex-1 max-w-[200px]"
                />
                <span className="text-[0.84rem] font-bold w-8 text-center" style={{ color: 'var(--c4)' }}>
                  {currentScore}/5
                </span>
              </div>
            );
          })}
        </div>
        {c4.auditDimensions.length > 0 && (
          <div className="mt-4 pt-3 border-t border-border flex items-center gap-2">
            <span className="text-[0.84rem] font-semibold">Overall Score:</span>
            <span className="text-[1.1rem] font-bold" style={{ color: 'var(--c4)' }}>
              {(c4.auditDimensions.reduce((sum, d) => sum + d.score, 0) / c4.auditDimensions.length).toFixed(1)}/5
            </span>
          </div>
        )}
      </div>

      {/* AI: Generate recommendations */}
      <AnalyzeButton
        systemPrompt={PROMPT_TEMPLATES.c4_recommendations.system}
        userPrompt={PROMPT_TEMPLATES.c4_recommendations.user(
          buildProgressiveContext(auditState, 'c4'),
          `Metrics: ${c4.metricSummary.highestGroupRate}, SPD=${c4.metricSummary.worstSPD}, Error=${c4.metricSummary.overallErrorRate}\nPre-deployment recs: ${c4.preDeploymentRecs}\nPost-deployment recs: ${c4.postDeploymentRecs}`
        )}
        component="c4"
        section="recommendations"
        buttonLabel="Generate AI Recommendations"
        className="mb-6"
      />

      {/* Limitations & Data Gaps */}
      <div className="bg-card rounded-xl p-5 border border-border mb-6">
        <h3 className="text-[1.05rem] font-semibold mb-4">Limitations &amp; Data Gaps</h3>
        <p className="text-[0.82rem] text-muted-foreground mb-3">
          Document the limitations of your analysis. Transparency about data gaps and methodological constraints strengthens the audit.
        </p>
        <WorksheetField
          label="Data Gaps"
          value={limitations.dataGaps}
          onChange={(v) => updateLimitations({ dataGaps: v })}
          rows={3}
          placeholder="What data was unavailable or incomplete?"
          scaffoldTip="List specific datasets, variables, or subgroups where data was missing, incomplete, or unreliable."
        />
        <WorksheetField
          label="Methodological Limitations"
          value={limitations.methodologicalLimitations}
          onChange={(v) => updateLimitations({ methodologicalLimitations: v })}
          rows={3}
          placeholder="What methodological constraints affect the findings?"
          scaffoldTip="Were there assumptions, approximations, or methodological choices that limit the conclusions?"
        />
        <WorksheetField
          label="Scope Exclusions"
          value={limitations.scopeExclusions}
          onChange={(v) => updateLimitations({ scopeExclusions: v })}
          rows={3}
          placeholder="What was explicitly out of scope?"
          scaffoldTip="What related issues, populations, or system aspects were not examined?"
        />
        <WorksheetField
          label="Confidence Statement"
          value={limitations.confidenceStatement}
          onChange={(v) => updateLimitations({ confidenceStatement: v })}
          rows={3}
          placeholder="How confident are you in the findings?"
          scaffoldTip="Summarise your confidence level: high/medium/low for different aspects of the analysis."
        />
      </div>

      {/* Audit Complete Panel */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <CheckCircle2 size={32} className="text-emerald-500 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-[1.1rem] font-bold mb-2 text-emerald-700 dark:text-emerald-400">Audit Complete!</h3>
            <p className="text-[0.86rem] text-muted-foreground leading-relaxed mb-4">
              You have completed all four components of the fairness audit. Here are your next steps:
            </p>
            <ul className="text-[0.84rem] text-muted-foreground space-y-1.5 mb-4">
              <li>1. Review your recommendations above and refine them</li>
              <li>2. Export your audit from the Settings page</li>
              <li>3. Schedule a re-audit after implementing changes</li>
            </ul>
            <div className="flex items-center gap-3 flex-wrap">
              <a
                href="/report"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[0.84rem] font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
              >
                View Full Report
              </a>
              <a
                href="/settings"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[0.84rem] font-semibold border border-border hover:bg-muted transition-colors"
              >
                <Download size={16} /> Export JSON
              </a>
              <a
                href="/"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[0.84rem] font-semibold border border-border hover:bg-muted transition-colors"
              >
                Return to Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ================================================================== */
/*  Stats Row                                                          */
/* ================================================================== */
function StatsRow({ data }: { data: C4Data }) {
  const stats = [
    {
      icon: <BarChart3 size={20} />,
      value: data.metricSummary.highestGroupRate.split(':')[1]?.trim() ?? '48%',
      label: 'Highest Group Rate',
      sublabel: 'Indigenous Australians',
      color: '#ef4444',
      context: 'Indigenous Australians were 1.8x more likely to receive a debt notice than non-Indigenous recipients',
    },
    {
      icon: <TrendingUp size={20} />,
      value: data.metricSummary.lowestGroupRate.split(':')[1]?.trim() ?? '14%',
      label: 'Lowest Group Rate',
      sublabel: '55+ age group',
      color: '#3b82f6',
      context: 'Older Australians with stable employment were least affected by income averaging errors',
    },
    {
      icon: <Target size={20} />,
      value: '+0.21',
      label: 'Worst SPD',
      sublabel: 'Indigenous vs Non-Indigenous',
      color: '#d97706',
      context: 'This exceeds the 0.05 regulatory threshold by 4.2x — decisive evidence of disparate impact',
    },
    {
      icon: <Activity size={20} />,
      value: '~74%',
      label: 'False Debt Rate',
      sublabel: 'Overall invalid debts',
      color: '#e11d48',
      context: 'Nearly 3 out of 4 automated debt notices were wrong — a catastrophic false positive rate',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="bg-card rounded-xl p-4 border border-border"
          style={{ borderTopWidth: 3, borderTopColor: stat.color }}
        >
          <div className="flex items-center gap-2 text-muted-foreground mb-2" style={{ color: stat.color }}>
            {stat.icon}
            <span className="text-[0.72rem] font-semibold uppercase tracking-wide text-muted-foreground">
              {stat.label}
            </span>
          </div>
          <div className="text-[1.5rem] font-bold leading-tight" style={{ color: stat.color }}>
            {stat.value}
          </div>
          <div className="text-[0.78rem] text-muted-foreground mt-0.5">{stat.sublabel}</div>
          {stat.context && (
            <div className="text-[0.72rem] text-muted-foreground mt-1.5 pt-1.5 border-t border-border/50 leading-snug">
              {stat.context}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ================================================================== */
/*  Debt Notice Rates Chart (with toggle)                              */
/* ================================================================== */
function DebtNoticeRatesChart({ data }: { data: C4Data }) {
  const [view, setView] = useState<'byAge' | 'byIndigenous' | 'byRegion'>('byAge');
  const rates: GroupRate[] = data.debtNoticeRates[view];

  const chartData = useMemo(
    () =>
      rates.map(r => ({
        group: r.group,
        rate: r.rate,
        spd: r.spd,
        ciLow: r.ci[0],
        ciHigh: r.ci[1],
        errorY: [r.rate - r.ci[0], r.ci[1] - r.rate],
        color: r.color,
      })),
    [rates],
  );

  const tabs: { key: typeof view; label: string }[] = [
    { key: 'byAge', label: 'By Age' },
    { key: 'byIndigenous', label: 'By Indigenous Status' },
    { key: 'byRegion', label: 'By Region' },
  ];

  return (
    <ChartCard
      title="Debt Notice Rates by Group"
      description="Proportion of welfare recipients in each group who received an automated debt notice. Error bars show 95% confidence intervals."
      borderColor="var(--c4)"
      interpretation={{
        title: 'Key Finding',
        text:
          view === 'byAge'
            ? 'Young adults (18-24) were flagged at 42%, nearly 3x the rate of 55+ recipients (14%). The income averaging methodology inherently penalises variable employment patterns common among young workers.'
            : view === 'byIndigenous'
              ? 'Indigenous Australians were flagged at 48%, nearly double the 27% rate for non-Indigenous recipients. This SPD of +0.21 represents a massive and statistically significant disparity.'
              : 'Remote/very remote residents were flagged at 41% vs 25% in major cities (SPD = +0.16). Geographic isolation compounds the harm by limiting access to evidence and appeals.',
      }}
    >
      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key)}
            className={`px-3.5 py-1.5 rounded-lg text-[0.82rem] font-medium transition-colors cursor-pointer ${
              view === tab.key
                ? 'bg-[var(--c4)] text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="group" tick={{ fontSize: 12 }} />
          <YAxis
            domain={[0, 0.7]}
            tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Rate']}
            labelFormatter={(label: string) => `Group: ${label}`}
            contentStyle={{ fontSize: '0.82rem', borderRadius: '8px' }}
          />
          <Bar dataKey="rate" radius={[6, 6, 0, 0]} maxBarSize={50}>
            {chartData.map((entry, idx) => (
              <Cell key={idx} fill={entry.color} />
            ))}
            <LabelList
              dataKey="spd"
              position="top"
              style={{ fontSize: '0.72rem', fontWeight: 600 }}
            />
            <ErrorBar dataKey="errorY" width={4} strokeWidth={1.5} stroke="#666" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

/* ================================================================== */
/*  SPD Chart                                                          */
/* ================================================================== */
function SPDChart({ data }: { data: C4Data }) {
  const chartData = useMemo(
    () =>
      data.spd.map(s => ({
        comparison: s.comparison,
        spd: s.spd,
        ciLow: s.ci[0],
        ciHigh: s.ci[1],
        errorX: [s.spd - s.ci[0], s.ci[1] - s.spd],
        significant: s.significant,
        color: s.spd >= 0.15 ? '#ef4444' : s.spd >= 0.08 ? '#f97316' : '#22c55e',
      })),
    [data.spd],
  );

  return (
    <ChartCard
      title="Statistical Parity Difference (SPD)"
      description="SPD = (Group A debt notice rate) minus (Reference Group rate). Example: if Group A is flagged at 48% and the reference is 27%, SPD = 0.21. Values above 0.05 are conventionally considered meaningful disparities."
      borderColor="var(--c4)"
      interpretation={{
        title: 'Interpreting SPD',
        text: 'All comparisons show statistically significant positive SPDs, meaning every non-reference group was flagged at a higher rate. The Indigenous vs Non-Indigenous SPD of 0.21 is more than four times the conventional 0.05 threshold.',
      }}
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 5, right: 50, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            type="number"
            domain={[0, 0.3]}
            tick={{ fontSize: 12 }}
            tickFormatter={(v: number) => v.toFixed(2)}
          />
          <YAxis
            type="category"
            dataKey="comparison"
            width={220}
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            formatter={(value: number) => [value.toFixed(3), 'SPD']}
            contentStyle={{ fontSize: '0.82rem', borderRadius: '8px' }}
          />
          {/* Reference line at 0.05 */}
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <Bar dataKey="spd" radius={[0, 6, 6, 0]} maxBarSize={24}>
            {chartData.map((entry, idx) => (
              <Cell key={idx} fill={entry.color} />
            ))}
            <LabelList
              dataKey="spd"
              position="right"
              formatter={(v: number) => v.toFixed(2)}
              style={{ fontSize: '0.78rem', fontWeight: 600 }}
            />
            <ErrorBar dataKey="errorX" width={4} strokeWidth={1.5} stroke="#666" direction="x" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

/* ================================================================== */
/*  Error Rates Chart                                                  */
/* ================================================================== */
function ErrorRatesChart({ data }: { data: C4Data }) {
  const chartData = useMemo(
    () =>
      data.errorRates.byGroup.map(e => ({
        group: e.group,
        rate: e.rate,
        label: e.label,
        color:
          e.rate >= 0.8
            ? '#ef4444'
            : e.rate >= 0.7
              ? '#f97316'
              : e.rate >= 0.65
                ? '#eab308'
                : '#3b82f6',
      })),
    [data.errorRates.byGroup],
  );

  return (
    <ChartCard
      title="Error Rates by Group (False Debt Rate)"
      description={`Overall false debt rate: ${(data.errorRates.overall * 100).toFixed(0)}%. Bars show the proportion of debt notices that were invalid for each group (the False Positive Rate).`}
      borderColor="var(--c4)"
      interpretation={{
        title: 'Disproportionate Error Burden',
        text: 'Indigenous Australians bore an 85% false debt rate vs 71% for non-Indigenous. Young adults (18-24) had an 81% error rate vs 62% for 55+. The groups most targeted were also the groups most likely to receive invalid debts.',
      }}
    >
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 5, right: 50, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            type="number"
            domain={[0, 1]}
            tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
            tick={{ fontSize: 12 }}
          />
          <YAxis type="category" dataKey="label" width={170} tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'False Debt Rate']}
            contentStyle={{ fontSize: '0.82rem', borderRadius: '8px' }}
          />
          <Bar dataKey="rate" radius={[0, 6, 6, 0]} maxBarSize={22}>
            {chartData.map((entry, idx) => (
              <Cell key={idx} fill={entry.color} />
            ))}
            <LabelList
              dataKey="rate"
              position="right"
              formatter={(v: number) => `${(v * 100).toFixed(0)}%`}
              style={{ fontSize: '0.78rem', fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

/* ================================================================== */
/*  Intersectional Table                                               */
/* ================================================================== */
function IntersectionalTable({ data }: { data: C4Data }) {
  const statusColors: Record<string, { bg: string; text: string }> = {
    Ref: { bg: 'var(--pass-light)', text: 'var(--pass)' },
    Elevated: { bg: 'var(--warn-light)', text: '#b8860b' },
    High: { bg: '#fde8e8', text: '#c0392b' },
    Critical: { bg: '#f8d7da', text: '#a71d2a' },
  };

  return (
    <ChartCard
      title="Intersectional Analysis"
      description="Outcomes disaggregated by combinations of protected attributes. Compounding disadvantage is visible when multiple marginalised identities intersect."
      borderColor="var(--c4)"
      interpretation={{
        title: 'Compounding Disadvantage',
        text: 'Indigenous youth in remote areas faced a 63% debt notice rate with a 91% error rate -- the worst of any subgroup. This is nearly 3x the reference group rate and demonstrates severe intersectional harm.',
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-[0.82rem]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2.5 pr-3 font-semibold text-muted-foreground">Subgroup</th>
              <th className="text-center py-2.5 px-3 font-semibold text-muted-foreground">Rate</th>
              <th className="text-center py-2.5 px-3 font-semibold text-muted-foreground">Rate Bar</th>
              <th className="text-center py-2.5 px-3 font-semibold text-muted-foreground">SPD</th>
              <th className="text-center py-2.5 px-3 font-semibold text-muted-foreground">Error Rate</th>
              <th className="text-center py-2.5 px-3 font-semibold text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.intersectional.map((row, idx) => {
              const sc = statusColors[row.status] ?? statusColors.Elevated;
              return (
                <tr key={idx} className="border-b border-border/50 hover:bg-muted/50">
                  <td className="py-2.5 pr-3 font-medium">{row.subgroup}</td>
                  <td className="py-2.5 px-3 text-center font-mono">
                    {(row.rate * 100).toFixed(0)}%
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(row.rate * 100 / 0.7 * 100, 100)}%`,
                          backgroundColor: sc.text,
                        }}
                      />
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono">{row.spd}</td>
                  <td className="py-2.5 px-3 text-center font-mono">
                    {(row.errorRate * 100).toFixed(0)}%
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <RiskBadge level={row.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ChartCard>
  );
}

/* ================================================================== */
/*  Threshold Sensitivity Chart                                        */
/* ================================================================== */
function ThresholdSensitivityChart({ data }: { data: C4Data }) {
  const chartData = useMemo(
    () =>
      data.thresholdSensitivity.map(pt => ({
        tolerance: pt.tolerance,
        'False Positive Rate': pt.falsePositiveRate,
        'True Positive Rate': pt.truePositiveRate,
        label: pt.label,
      })),
    [data.thresholdSensitivity],
  );

  return (
    <ChartCard
      title="Threshold Sensitivity Analysis"
      description="How varying the matching tolerance affects the False Positive Rate (FPR) and True Positive Rate (TPR). Lower thresholds catch more real debts but generate vastly more false ones."
      borderColor="var(--c4)"
      interpretation={{
        title: 'The Core Trade-off',
        text: 'At the original exact-match setting, the FPR was 81% while the TPR was 95%. Using actual fortnightly data (the gold standard) achieves a 5% FPR with 93% TPR -- better on both dimensions. The income averaging methodology was not just unfair, it was unnecessary.',
      }}
    >
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="tolerance"
            tick={{ fontSize: 10 }}
            angle={-30}
            textAnchor="end"
            height={80}
          />
          <YAxis
            domain={[0, 1]}
            tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number, name: string) => [`${(value * 100).toFixed(1)}%`, name]}
            contentStyle={{ fontSize: '0.82rem', borderRadius: '8px' }}
          />
          <Legend wrapperStyle={{ fontSize: '0.82rem' }} />
          <Line
            type="monotone"
            dataKey="False Positive Rate"
            stroke="#ef4444"
            strokeWidth={2.5}
            dot={{ r: 5, fill: '#ef4444' }}
            activeDot={{ r: 7 }}
          />
          <Line
            type="monotone"
            dataKey="True Positive Rate"
            stroke="#22c55e"
            strokeWidth={2.5}
            dot={{ r: 5, fill: '#22c55e' }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

/* ================================================================== */
/*  Statistical Validation Panel                                       */
/* ================================================================== */
function StatisticalValidationPanel({ data }: { data: C4Data }) {
  const items = [
    {
      title: 'Bootstrap Confidence Intervals',
      content: data.statisticalValidation.bootstrap,
      icon: '1',
    },
    {
      title: 'Permutation Test',
      content: data.statisticalValidation.permutation,
      icon: '2',
    },
    {
      title: 'Effect Size',
      content: data.statisticalValidation.effectSize,
      icon: '3',
    },
    {
      title: 'Bayesian Analysis',
      content: data.statisticalValidation.bayesian,
      icon: '4',
    },
  ];

  return (
    <ChartCard
      title="Statistical Validation"
      description="Four independent methods confirming the robustness of observed disparities: bootstrap CIs, permutation tests, effect sizes, and Bayesian analysis. These validate that differences in FPR and TPR across groups are real, not statistical noise."
      borderColor="var(--c4)"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((item) => (
          <div
            key={item.icon}
            className="bg-muted rounded-lg p-4 border border-border"
          >
            <h5 className="text-[0.86rem] font-semibold mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[var(--c4)] text-white flex items-center justify-center text-[0.72rem] font-bold flex-shrink-0">
                {item.icon}
              </span>
              {item.title}
            </h5>
            <p className="text-[0.82rem] text-muted-foreground leading-relaxed">
              {item.content}
            </p>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

/* ================================================================== */
/*  Recommendations Panel                                              */
/* ================================================================== */
function RecommendationsPanel({ data }: { data: C4Data }) {
  const preDeployment = data.recommendations.filter(
    r => r.horizon === 'Immediate' || r.horizon === 'Short-term',
  );
  const postDeployment = data.recommendations.filter(
    r => r.horizon === 'Medium-term' || r.horizon === 'Long-term',
  );

  const horizonColors: Record<string, string> = {
    Immediate: '#ef4444',
    'Short-term': '#f97316',
    'Medium-term': '#3b82f6',
    'Long-term': '#8b5cf6',
  };

  return (
    <ChartCard
      title="Recommendations"
      description="Actionable steps grouped by implementation horizon."
      borderColor="var(--c4)"
    >
      <div className="mb-5">
        <h4 className="text-[0.92rem] font-semibold mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
          Pre-deployment / Immediate Actions
        </h4>
        <div className="space-y-2">
          {preDeployment.map(rec => (
            <div
              key={rec.id}
              className="p-3 rounded-lg border-l-[3px] bg-muted text-[0.84rem]"
              style={{ borderLeftColor: horizonColors[rec.horizon] ?? '#999' }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span
                    className="inline-block px-2 py-0.5 rounded text-[0.68rem] font-bold uppercase tracking-wide text-white mr-2"
                    style={{ backgroundColor: horizonColors[rec.horizon] }}
                  >
                    {rec.horizon}
                  </span>
                  <strong>{rec.action}</strong>
                </div>
              </div>
              <p className="text-muted-foreground mt-1 text-[0.82rem]">{rec.impact}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-[0.92rem] font-semibold mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
          Post-deployment / Systemic Reforms
        </h4>
        <div className="space-y-2">
          {postDeployment.map(rec => (
            <div
              key={rec.id}
              className="p-3 rounded-lg border-l-[3px] bg-muted text-[0.84rem]"
              style={{ borderLeftColor: horizonColors[rec.horizon] ?? '#999' }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span
                    className="inline-block px-2 py-0.5 rounded text-[0.68rem] font-bold uppercase tracking-wide text-white mr-2"
                    style={{ backgroundColor: horizonColors[rec.horizon] }}
                  >
                    {rec.horizon}
                  </span>
                  <strong>{rec.action}</strong>
                </div>
              </div>
              <p className="text-muted-foreground mt-1 text-[0.82rem]">{rec.impact}</p>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
}

/* ================================================================== */
/*  Audit Radar Chart                                                  */
/* ================================================================== */
function AuditRadarChart({ data }: { data: C4Data }) {
  const chartData = useMemo(
    () =>
      data.auditDimensions.map(d => ({
        dimension: d.dimension,
        score: d.score,
        fullMark: d.max,
      })),
    [data.auditDimensions],
  );

  return (
    <ChartCard
      title="Audit Dimension Radar"
      description="Overall assessment across five audit dimensions. A score of 1/5 indicates catastrophic failure; 5/5 indicates best practice."
      borderColor="var(--c4)"
      interpretation={{
        title: 'Overall Assessment',
        text: 'Robodebt scored 1/5 on Data Quality, Fairness Metrics, and Transparency -- the worst possible ratings. Only Remediation (3/5) received a moderate score, reflecting the eventual A$1.87B refund. The near-uniform failure across dimensions indicates a systemic governance breakdown, not a single point of failure.',
      }}
    >
      <div className="flex flex-col lg:flex-row items-start gap-6">
        <ResponsiveContainer width="100%" height={320}>
          <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="75%">
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <PolarRadiusAxis
              domain={[0, 5]}
              tick={{ fontSize: 10 }}
              axisLine={false}
            />
            <Radar
              name="Score"
              dataKey="score"
              stroke="var(--c4)"
              fill="var(--c4)"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>

        {/* Dimension Details */}
        <div className="space-y-3 min-w-[260px] flex-shrink-0">
          {data.auditDimensions.map(dim => (
            <div key={dim.dimension} className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[0.82rem] font-semibold">{dim.dimension}</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: dim.max }).map((_, i) => (
                    <div
                      key={i}
                      className="w-4 h-1.5 rounded-full"
                      style={{
                        backgroundColor: i < dim.score ? 'var(--c4)' : '#e5e7eb',
                      }}
                    />
                  ))}
                </div>
                <span className="text-[0.78rem] font-bold" style={{ color: 'var(--c4)' }}>
                  {dim.score}/{dim.max}
                </span>
              </div>
              <p className="text-[0.75rem] text-muted-foreground leading-relaxed">
                {dim.tooltip}
              </p>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
}
