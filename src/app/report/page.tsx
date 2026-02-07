'use client';

import { useState, useEffect } from 'react';
import { useAuditStore } from '@/store/audit-store';
import {
  ROBODEBT_C1,
  ROBODEBT_C2,
  ROBODEBT_C3,
  ROBODEBT_C4,
  ROBODEBT_SYSTEM,
  ROBODEBT_EXECUTIVE_SUMMARY,
  ROBODEBT_LIMITATIONS,
  ROBODEBT_SIGNOFF,
  ROBODEBT_ACCOUNTABILITY,
} from '@/lib/data/robodebt';
import { downloadAuditJSON } from '@/lib/export/json-export';
import { interpretMetric } from '@/lib/calculations/bias-prioritization';
import { RiskBadge } from '@/components/shared/RiskBadge';
import { WorksheetField } from '@/components/shared/WorksheetField';
import { AlertTriangle, CheckCircle2, Download, Printer, Shield, UserCheck } from 'lucide-react';

import type {
  C1Data,
  C2Data,
  C3Data,
  C4Data,
  ExecutiveSummary,
  AuditLimitations,
  AuditMetadata,
  SystemDescription,
} from '@/types/audit';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function Empty({ text = '(Not yet completed)' }: { text?: string }) {
  return <span className="text-muted-foreground italic text-[0.82rem]">{text}</span>;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-2">
      <div className="text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide mb-0.5">
        {label}
      </div>
      {value ? (
        <p className="text-[0.84rem] leading-relaxed whitespace-pre-wrap">{value}</p>
      ) : (
        <Empty />
      )}
    </div>
  );
}

function SectionHeading({
  title,
  color,
}: {
  title: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-4 mt-8 first:mt-0">
      <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: color }} />
      <h2 className="text-[1.2rem] font-bold tracking-tight">{title}</h2>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ReportPage() {
  const mode = useAuditStore(s => s.mode);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLearn = !mounted || mode === 'learn';

  const storeSystem = useAuditStore(s => s.system);
  const storeC1 = useAuditStore(s => s.c1);
  const storeC2 = useAuditStore(s => s.c2);
  const storeC3 = useAuditStore(s => s.c3);
  const storeC4 = useAuditStore(s => s.c4);
  const metadata = useAuditStore(s => s.metadata);
  const storeExecutiveSummary = useAuditStore(s => s.executiveSummary);
  const storeLimitations = useAuditStore(s => s.limitations);
  const updateExecutiveSummary = useAuditStore(s => s.updateExecutiveSummary);
  const updateLimitations = useAuditStore(s => s.updateLimitations);
  const updateAuditMetadata = useAuditStore(s => s.updateAuditMetadata);

  const execSummary = isLearn ? ROBODEBT_EXECUTIVE_SUMMARY : storeExecutiveSummary;
  const limitations = isLearn ? ROBODEBT_LIMITATIONS : storeLimitations;
  const signoff = isLearn ? ROBODEBT_SIGNOFF : {
    auditorName: metadata.auditorName ?? '',
    auditorRole: metadata.auditorRole ?? '',
    auditorOrganization: metadata.auditorOrganization ?? '',
    signoffStatement: metadata.signoffStatement ?? '',
  };

  const sys: SystemDescription = isLearn ? ROBODEBT_SYSTEM : storeSystem;
  const c1: C1Data = isLearn ? ROBODEBT_C1 : storeC1;
  const c2: C2Data = isLearn ? ROBODEBT_C2 : storeC2;
  const c3: C3Data = isLearn ? ROBODEBT_C3 : storeC3;
  const c4: C4Data = isLearn ? ROBODEBT_C4 : storeC4;

  function handleExport() {
    const state = useAuditStore.getState();
    downloadAuditJSON(state);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="max-w-[900px] mx-auto">
      {/* ================================================================= */}
      {/* Report Header                                                      */}
      {/* ================================================================= */}
      <div className="mb-8 border-b border-border pb-6">
        <h1 className="text-[1.6rem] font-bold tracking-tight mb-1">
          Fairness Audit Report
        </h1>
        <p className="text-muted-foreground text-[0.88rem] mb-4">
          {isLearn ? 'Robodebt Case Study (Learn Mode)' : metadata.name}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-[0.84rem]">
          <Field label="System Name" value={sys.name} />
          <Field label="Operator" value={sys.operator} />
          <Field label="Period" value={sys.period} />
          <Field label="Scale" value={sys.scale} />
          <Field label="Decision Type" value={sys.decision} />
          <Field label="Report Date" value={new Date().toLocaleDateString()} />
        </div>
      </div>

      {/* ================================================================= */}
      {/* Executive Summary                                                  */}
      {/* ================================================================= */}
      <div className="bg-card rounded-xl border-2 border-border p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Shield size={24} className="text-[var(--c4)]" />
          <h2 className="text-[1.2rem] font-bold tracking-tight">Executive Summary</h2>
          <RiskBadge level={execSummary.overallRiskLevel} className="ml-auto text-[0.82rem]" />
        </div>

        {/* Key Findings */}
        <div className="mb-4">
          <div className="text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide mb-2">
            Key Findings
          </div>
          {execSummary.keyFindings.length > 0 ? (
            <ul className="space-y-1.5">
              {execSummary.keyFindings.map((finding, i) => (
                <li key={i} className="flex items-start gap-2 text-[0.84rem]">
                  <AlertTriangle size={14} className="text-[var(--c4)] flex-shrink-0 mt-0.5" />
                  <span>{finding}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty text="Complete the audit to generate key findings" />
          )}
        </div>

        {/* Top Disparities */}
        <div className="mb-4">
          <div className="text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide mb-2">
            Top Disparities
          </div>
          {execSummary.topDisparities.length > 0 ? (
            <ul className="space-y-1">
              {execSummary.topDisparities.map((disp, i) => (
                <li key={i} className="text-[0.84rem] text-muted-foreground">{'\u2022'} {disp}</li>
              ))}
            </ul>
          ) : (
            <Empty text="No disparities documented yet" />
          )}
        </div>

        {/* Primary Recommendation */}
        <div className="mb-4">
          <div className="text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide mb-1">
            Primary Recommendation
          </div>
          {execSummary.primaryRecommendation ? (
            <p className="text-[0.88rem] font-medium p-3 rounded-lg bg-[var(--c4)]/[0.04] border border-[var(--c4)]/20">
              {execSummary.primaryRecommendation}
            </p>
          ) : (
            <Empty />
          )}
        </div>

        {/* Deployment Readiness */}
        <div className="flex items-center gap-3">
          <div className="text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide">
            Deployment Readiness
          </div>
          <span className={`inline-block px-3 py-1 rounded-xl text-[0.82rem] font-bold uppercase tracking-wide ${
            execSummary.deploymentReadiness === 'No-Go'
              ? 'bg-[var(--fail-light)] text-[var(--fail)]'
              : execSummary.deploymentReadiness === 'Go'
                ? 'bg-[var(--pass-light)] text-[var(--pass)]'
                : 'bg-[var(--warn-light)] text-[#b8860b]'
          }`}>
            {execSummary.deploymentReadiness}
          </span>
        </div>
      </div>

      {/* ================================================================= */}
      {/* C1: Historical Context                                             */}
      {/* ================================================================= */}
      <SectionHeading title="Component 1: Historical Context" color="#0d9488" />

      {/* Domain Context */}
      <div className="bg-card rounded-xl border border-border p-5 mb-4" style={{ borderTopWidth: 3, borderTopColor: '#0d9488' }}>
        <h3 className="text-[0.95rem] font-semibold mb-3">Domain Context</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <Field label="System" value={c1.domainContext.system} />
          <Field label="Decision Type" value={c1.domainContext.decisionType} />
          <Field label="Affected Population" value={c1.domainContext.affectedPopulation} />
          <Field label="Historical Patterns" value={c1.domainContext.historicalPatterns} />
        </div>
      </div>

      {/* Data Representation */}
      <div className="bg-card rounded-xl border border-border p-5 mb-4">
        <h3 className="text-[0.95rem] font-semibold mb-3">Data Representation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <Field label="Data Sources" value={c1.dataRepresentation.dataSources} />
          <Field label="Coverage Gaps" value={c1.dataRepresentation.coverageGaps} />
          <Field label="Label Reliability" value={c1.dataRepresentation.labelReliability} />
        </div>
        {/* Checklist */}
        <div className="mt-2">
          <div className="text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide mb-1">
            Data Source Checklist
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(c1.dataRepresentation.dataSourceChecklist).map(([key, val]) => (
              <span
                key={key}
                className={`text-[0.78rem] px-2 py-0.5 rounded-full ${
                  val ? 'bg-[var(--fail-light)] text-[var(--fail)]' : 'bg-[var(--pass-light)] text-[var(--pass)]'
                }`}
              >
                {val ? '\u2713' : '\u2717'} {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Technology Transition */}
      <div className="bg-card rounded-xl border border-border p-5 mb-4">
        <h3 className="text-[0.95rem] font-semibold mb-3">Technology Transition</h3>
        <Field label="Prior Process" value={c1.technologyTransition.priorProcess} />
        <Field label="What Changed" value={c1.technologyTransition.whatChanged} />
        <Field label="Oversight Lost" value={c1.technologyTransition.oversightLost} />
      </div>

      {/* Protected Groups Table */}
      {c1.protectedGroups.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-5 mb-4">
          <h3 className="text-[0.95rem] font-semibold mb-3">Protected Groups</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-[0.82rem]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-3 font-semibold text-muted-foreground">Group</th>
                  <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Pattern</th>
                  <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Data Pathway</th>
                  <th className="text-center py-2 pl-3 font-semibold text-muted-foreground">Impact</th>
                </tr>
              </thead>
              <tbody>
                {c1.protectedGroups.map((g, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-2 pr-3 font-medium">{g.group}</td>
                    <td className="py-2 px-3 text-muted-foreground">{g.pattern}</td>
                    <td className="py-2 px-3 text-muted-foreground">{g.dataPathway}</td>
                    <td className="py-2 pl-3 text-center"><RiskBadge level={g.impact} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Feedback Loops */}
      {c1.feedbackLoops.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-5 mb-4">
          <h3 className="text-[0.95rem] font-semibold mb-3">Feedback Loops</h3>
          <div className="space-y-3">
            {c1.feedbackLoops.map(fl => (
              <div key={fl.id} className="bg-muted rounded-lg p-3.5 border-l-[3px] border-[#0d9488]">
                <Field label="Trigger" value={fl.trigger} />
                <Field label="Mechanism" value={fl.mechanism} />
                <Field label="Amplification" value={fl.amplification} />
                <Field label="Monitoring" value={fl.monitoring} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Matrix */}
      {c1.riskMatrix.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-5 mb-4">
          <h3 className="text-[0.95rem] font-semibold mb-3">Risk Matrix</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-[0.82rem]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-3 font-semibold text-muted-foreground">Risk</th>
                  <th className="text-center py-2 px-2 font-semibold text-muted-foreground">Severity</th>
                  <th className="text-center py-2 px-2 font-semibold text-muted-foreground">Likelihood</th>
                  <th className="text-center py-2 px-2 font-semibold text-muted-foreground">Relevance</th>
                  <th className="text-center py-2 px-2 font-semibold text-muted-foreground">Score</th>
                  <th className="text-center py-2 pl-2 font-semibold text-muted-foreground">Level</th>
                </tr>
              </thead>
              <tbody>
                {[...c1.riskMatrix]
                  .sort((a, b) => b.score - a.score)
                  .map(r => (
                    <tr key={r.id} className="border-b border-border/50">
                      <td className="py-2 pr-3 font-medium">{r.risk}</td>
                      <td className="py-2 px-2 text-center font-mono">{r.severity}</td>
                      <td className="py-2 px-2 text-center font-mono">{r.likelihood}</td>
                      <td className="py-2 px-2 text-center font-mono">{r.relevance}</td>
                      <td className="py-2 px-2 text-center font-mono font-bold">{r.score}</td>
                      <td className="py-2 pl-2 text-center"><RiskBadge level={r.classification} /></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* C2: Fairness Definitions                                           */}
      {/* ================================================================= */}
      <SectionHeading title="Component 2: Fairness Definitions" color="#6366f1" />

      {/* Decision Framework */}
      <div className="bg-card rounded-xl border border-border p-5 mb-4" style={{ borderTopWidth: 3, borderTopColor: '#6366f1' }}>
        <h3 className="text-[0.95rem] font-semibold mb-3">7-Step Decision Framework</h3>
        <div className="space-y-3">
          {c2.decisionFramework.map(step => {
            const answer = Array.isArray(step.answer)
              ? step.answer.join(', ')
              : step.answer;
            return (
              <div key={step.step} className="bg-muted rounded-lg p-3.5">
                <div className="text-[0.78rem] font-bold text-[#6366f1] mb-1">
                  Step {step.step}
                </div>
                <div className="text-[0.84rem] font-medium mb-1">{step.question}</div>
                <div className="text-[0.84rem]">
                  <span className="font-semibold">Answer: </span>
                  {answer || <Empty />}
                </div>
                {step.explanation && (
                  <div className="text-[0.82rem] text-muted-foreground mt-1">
                    <span className="font-semibold text-foreground">Explanation: </span>
                    {step.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="text-[0.72rem] font-bold text-[#6366f1] uppercase tracking-wide mb-2">
            Primary Definition
          </div>
          {c2.primarySelection.definition ? (
            <>
              <p className="text-[0.92rem] font-semibold mb-1">{c2.primarySelection.definition}</p>
              <p className="text-[0.82rem] text-muted-foreground">{c2.primarySelection.justification}</p>
            </>
          ) : (
            <Empty />
          )}
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="text-[0.72rem] font-bold text-[#6366f1] uppercase tracking-wide mb-2">
            Secondary Definition
          </div>
          {c2.secondarySelection.definition ? (
            <>
              <p className="text-[0.92rem] font-semibold mb-1">{c2.secondarySelection.definition}</p>
              <p className="text-[0.82rem] text-muted-foreground">{c2.secondarySelection.justification}</p>
            </>
          ) : (
            <Empty />
          )}
        </div>
      </div>

      {/* Trade-off */}
      <div className="bg-card rounded-xl border border-border p-5 mb-4">
        <h3 className="text-[0.95rem] font-semibold mb-3">Trade-off Documentation</h3>
        <Field label="Title" value={c2.tradeoff.title} />
        <Field label="Description" value={c2.tradeoff.description} />
        <Field label="Resolution Strategy" value={c2.tradeoff.resolution} />
      </div>

      {/* ================================================================= */}
      {/* C3: Bias Sources                                                   */}
      {/* ================================================================= */}
      <SectionHeading title="Component 3: Bias Sources" color="#d97706" />

      <div className="bg-card rounded-xl border border-border p-5 mb-4" style={{ borderTopWidth: 3, borderTopColor: '#d97706' }}>
        <h3 className="text-[0.95rem] font-semibold mb-3">Identified Bias Sources</h3>
        <div className="space-y-3">
          {[...c3.biasSources]
            .sort((a, b) => b.weightedScore - a.weightedScore)
            .map((bias, idx) => (
              <div key={idx} className="bg-muted rounded-lg p-3.5 border-l-[3px] border-[#d97706]">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[0.78rem] font-bold text-[#d97706] uppercase">
                    {bias.type} Bias
                  </span>
                  <RiskBadge level={bias.priority} />
                  <span className="ml-auto text-[0.78rem] font-mono font-bold text-muted-foreground">
                    Score: {bias.weightedScore.toFixed(1)}
                  </span>
                </div>
                {bias.description ? (
                  <p className="text-[0.84rem] mb-1">{bias.description}</p>
                ) : (
                  <Empty />
                )}
                {bias.evidence && (
                  <div className="text-[0.82rem] text-muted-foreground mt-1">
                    <span className="font-semibold text-foreground">Evidence: </span>
                    {bias.evidence}
                  </div>
                )}
                <div className="flex gap-3 mt-2 text-[0.75rem] text-muted-foreground">
                  <span>Severity: {bias.dimensions.severity}</span>
                  <span>Scope: {bias.dimensions.scope}</span>
                  <span>Persistence: {bias.dimensions.persistence}</span>
                  <span>Historical: {bias.dimensions.historicalAlignment}</span>
                  <span>Feasibility: {bias.dimensions.feasibility}</span>
                </div>
                {(bias.accountableParty || (isLearn && ROBODEBT_ACCOUNTABILITY[bias.type])) && (
                  <div className="mt-1.5 text-[0.75rem]">
                    <span className="font-semibold text-muted-foreground">Accountable: </span>
                    <span className="text-foreground">{bias.accountableParty || ROBODEBT_ACCOUNTABILITY[bias.type]}</span>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* ================================================================= */}
      {/* C4: Fairness Metrics                                               */}
      {/* ================================================================= */}
      <SectionHeading title="Component 4: Fairness Metrics" color="#e11d48" />

      {/* Metric Summary */}
      <div className="bg-card rounded-xl border border-border p-5 mb-4" style={{ borderTopWidth: 3, borderTopColor: '#e11d48' }}>
        <h3 className="text-[0.95rem] font-semibold mb-3">Metric Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide mb-0.5">
              Highest Group Rate
            </div>
            <p className="text-[0.88rem] font-semibold">
              {c4.metricSummary.highestGroupRate || <Empty />}
            </p>
          </div>
          <div>
            <div className="text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide mb-0.5">
              Lowest Group Rate
            </div>
            <p className="text-[0.88rem] font-semibold">
              {c4.metricSummary.lowestGroupRate || <Empty />}
            </p>
          </div>
          <div>
            <div className="text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide mb-0.5">
              Worst SPD
            </div>
            <p className="text-[0.88rem] font-semibold">
              {c4.metricSummary.worstSPD || <Empty />}
            </p>
          </div>
          <div>
            <div className="text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide mb-0.5">
              Overall Error Rate
            </div>
            <p className="text-[0.88rem] font-semibold">
              {c4.metricSummary.overallErrorRate || <Empty />}
            </p>
          </div>
        </div>

        {/* Business Context Interpretation */}
        {isLearn && (
          <div className="mt-4 pt-3 border-t border-border space-y-1.5 text-[0.82rem] text-muted-foreground">
            <p>{'\u2022'} {interpretMetric('SPD', 0.21, 'Indigenous Australians', 'Non-Indigenous recipients', 0.05)}</p>
            <p>{'\u2022'} {interpretMetric('Error Rate', 0.74, 'all recipients', 'acceptable baseline', 0.10)}</p>
            <p>{'\u2022'} Young adults (18-24) were flagged at 3x the rate of 55+ recipients — income averaging inherently penalises variable employment.</p>
          </div>
        )}
      </div>

      {/* Free-text analyses */}
      <div className="bg-card rounded-xl border border-border p-5 mb-4">
        <h3 className="text-[0.95rem] font-semibold mb-3">Analyses</h3>
        <Field label="Group Outcome Rates" value={c4.groupOutcomeRates} />
        <Field label="Error Rate Analysis" value={c4.errorRateAnalysis} />
        <Field label="Intersectional Analysis" value={c4.intersectionalAnalysis} />
        <Field label="Threshold Analysis" value={c4.thresholdAnalysis} />
      </div>

      {/* Statistical Validation */}
      <div className="bg-card rounded-xl border border-border p-5 mb-4">
        <h3 className="text-[0.95rem] font-semibold mb-3">Statistical Validation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <Field label="Bootstrap CIs" value={c4.validationBootstrap || c4.statisticalValidation.bootstrap} />
          <Field label="Permutation Test" value={c4.validationPermutation || c4.statisticalValidation.permutation} />
          <Field label="Effect Size" value={c4.validationEffectSize || c4.statisticalValidation.effectSize} />
          <Field label="Bayesian Analysis" value={c4.validationBayesian || c4.statisticalValidation.bayesian} />
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-card rounded-xl border border-border p-5 mb-4">
        <h3 className="text-[0.95rem] font-semibold mb-3">Recommendations</h3>
        <Field label="Pre-deployment" value={c4.preDeploymentRecs} />
        <Field label="Post-deployment" value={c4.postDeploymentRecs} />
        {c4.recommendations.length > 0 && (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-[0.82rem]">
              <thead>
                <tr className="border-b border-border">
                  <th scope="col" className="text-left py-2 pr-2 font-semibold text-muted-foreground">Horizon</th>
                  <th scope="col" className="text-left py-2 px-2 font-semibold text-muted-foreground">Action</th>
                  <th scope="col" className="text-left py-2 px-2 font-semibold text-muted-foreground">Effort</th>
                  <th scope="col" className="text-left py-2 px-2 font-semibold text-muted-foreground">Timeline</th>
                  <th scope="col" className="text-left py-2 pl-2 font-semibold text-muted-foreground">Impact</th>
                </tr>
              </thead>
              <tbody>
                {c4.recommendations.map(rec => (
                  <tr key={rec.id} className="border-b border-border/50">
                    <td className="py-2 pr-2">
                      <span className={`inline-block px-2 py-0.5 rounded text-[0.68rem] font-bold uppercase tracking-wide text-white ${
                        rec.horizon === 'Immediate' ? 'bg-[#ef4444]' :
                        rec.horizon === 'Short-term' ? 'bg-[#f97316]' :
                        rec.horizon === 'Medium-term' ? 'bg-[#3b82f6]' : 'bg-[#8b5cf6]'
                      }`}>
                        {rec.horizon}
                      </span>
                    </td>
                    <td className="py-2 px-2 font-medium">{rec.action}</td>
                    <td className="py-2 px-2 text-muted-foreground">{rec.effort ?? '\u2014'}</td>
                    <td className="py-2 px-2 text-muted-foreground">{rec.timeline ?? '\u2014'}</td>
                    <td className="py-2 pl-2 text-muted-foreground">{rec.impact || rec.estimatedImpact || '\u2014'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Audit Dimension Scores */}
      {(c4.auditDimensionScores || c4.auditDimensions.length > 0) && (
        <div className="bg-card rounded-xl border border-border p-5 mb-4">
          <h3 className="text-[0.95rem] font-semibold mb-3">Audit Dimension Scores</h3>
          {c4.auditDimensions.length > 0 ? (
            <div className="space-y-2">
              {c4.auditDimensions.map(dim => (
                <div key={dim.dimension} className="flex items-center gap-3">
                  <span className="text-[0.84rem] font-medium w-[140px]">{dim.dimension}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: dim.max }).map((_, i) => (
                      <div
                        key={i}
                        className="w-5 h-2 rounded-full"
                        style={{
                          backgroundColor: i < dim.score ? '#e11d48' : '#e5e7eb',
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-[0.82rem] font-bold" style={{ color: '#e11d48' }}>
                    {dim.score}/{dim.max}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <Field label="" value={c4.auditDimensionScores} />
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* Limitations                                                        */}
      {/* ================================================================= */}
      <SectionHeading title="Limitations & Data Gaps" color="#6b7280" />
      <div className="bg-card rounded-xl border border-border p-5 mb-4">
        <Field label="Data Gaps" value={limitations.dataGaps} />
        <Field label="Methodological Limitations" value={limitations.methodologicalLimitations} />
        <Field label="Scope Exclusions" value={limitations.scopeExclusions} />
        <Field label="Confidence Statement" value={limitations.confidenceStatement} />
      </div>

      {/* ================================================================= */}
      {/* Sign-Off                                                           */}
      {/* ================================================================= */}
      <SectionHeading title="Auditor Sign-Off" color="#0d9488" />
      <div className="bg-card rounded-xl border-2 border-border p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <UserCheck size={20} className="text-[var(--c1)]" />
          <h3 className="text-[0.95rem] font-semibold">Sign-Off</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Field label="Auditor Name" value={signoff.auditorName} />
          <Field label="Role" value={signoff.auditorRole} />
          <Field label="Organisation" value={signoff.auditorOrganization} />
        </div>
        <Field label="Sign-Off Statement" value={signoff.signoffStatement} />
        {metadata.signedOffAt && (
          <div className="mt-3 flex items-center gap-2 text-[0.82rem] text-[var(--pass)]">
            <CheckCircle2 size={16} />
            <span>Signed off on {new Date(metadata.signedOffAt).toLocaleDateString()}</span>
          </div>
        )}
        {!isLearn && !metadata.signedOffAt && (
          <button
            onClick={() => updateAuditMetadata({ signedOffAt: Date.now() })}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[0.84rem] font-semibold bg-[#0d9488] text-white hover:bg-[#0d9488]/90 transition-colors cursor-pointer"
          >
            <CheckCircle2 size={16} /> Sign Off Audit
          </button>
        )}
      </div>

      {/* ================================================================= */}
      {/* Action Bar (hidden in print)                                       */}
      {/* ================================================================= */}
      <div className="no-print fixed bottom-0 left-0 right-0 bg-card border-t border-border py-3 px-6 flex items-center justify-center gap-3 z-40">
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[0.84rem] font-semibold border border-border hover:bg-muted transition-colors"
        >
          <Download size={16} /> Export JSON
        </button>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[0.84rem] font-semibold bg-[#0d9488] text-white hover:bg-[#0d9488]/90 transition-colors"
        >
          <Printer size={16} /> Print Report
        </button>
      </div>

      {/* Bottom spacer for fixed action bar */}
      <div className="h-20" />
    </div>
  );
}
