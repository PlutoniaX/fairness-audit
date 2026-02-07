'use client';

import { useState, useMemo, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

import { useAuditStore } from '@/store/audit-store';
import { ROBODEBT_C2, FAIRNESS_DEFINITIONS } from '@/lib/data/robodebt';

import { WhyCard } from '@/components/shared/WhyCard';
import { MethodologyPanel } from '@/components/shared/MethodologyPanel';
import { PhaseCard } from '@/components/shared/PhaseCard';
import { WorksheetField } from '@/components/shared/WorksheetField';
import { HandoffCard } from '@/components/shared/HandoffCard';
import { GlossaryTerm } from '@/components/shared/GlossaryTerm';
import { ProgressIndicator } from '@/components/shared/ProgressIndicator';
import { PriorFindingsPanel } from '@/components/shared/PriorFindingsPanel';
import { AnalyzeButton } from '@/components/llm/AnalyzeButton';
import { ChatSidebar } from '@/components/llm/ChatSidebar';
import { buildProgressiveContext, buildC1Summary } from '@/lib/llm/context-builder';
import { PROMPT_TEMPLATES } from '@/lib/llm/prompt-templates';
import { useComponentProgress } from '@/hooks/useComponentProgress';

import type { FairnessDefinition, DecisionStep } from '@/types/audit';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Plain-English translations of fairness definition formulas */
const FORMULA_TRANSLATIONS: Record<string, string> = {
  'demographic-parity': 'Reads as: the rate of being flagged is the same for every group',
  'equal-opportunity': 'Reads as: among people who truly qualify, the detection rate is the same for every group',
  'equalised-odds': 'Reads as: both the catch rate and the false alarm rate are equal across groups',
  'predictive-parity': 'Reads as: when the system flags someone, the chance it is correct is equal across groups',
  'calibration': 'Reads as: a risk score of X% means the same real probability for every group',
  'individual-fairness': 'Reads as: people who are similar get proportionally similar outcomes',
  'counterfactual-fairness': 'Reads as: the decision would not change if the person belonged to a different group',
};

/** Short descriptive titles for step headings */
const STEP_HEADINGS: Record<string, string> = {
  // Audit mode questions
  'How reliable are outcome labels': 'Label Reliability',
  'Which errors cause more harm': 'Error Harm',
  'Do base rates differ across groups': 'Base Rate Differences',
  'Is score calibration critical': 'Score Calibration',
  'What legal requirements apply': 'Legal Requirements',
  'Which intersections require evaluation': 'Intersections',
  'Are there feedback loops': 'Feedback Loops',
  // Learn mode (Robodebt) questions
  'What is the base rate of the positive outcome across groups': 'Base Rate Differences',
  'Which error type is more harmful': 'Error Harm',
  'Is the system making high-stakes individual decisions or aggregate resource allocation': 'Decision Stakes',
  'Are there legal or regulatory constraints on which groups can be considered': 'Legal Constraints',
  'Can the system\u2019s predictions be validated against ground truth': 'Ground Truth Validation',
  'What level of transparency is required': 'Transparency Requirements',
  'Select all fairness properties that are non-negotiable for this system': 'Non-negotiable Properties',
};

/** Derive a short title from the step question for collapsed headings */
function stepShortTitle(question: string): string {
  const cleaned = question.replace(/\s*\([^)]*\)/g, '').replace(/[?:]$/, '').trim();
  return STEP_HEADINGS[cleaned] ?? cleaned;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const C2 = '#6366f1';

/** IDs of definitions that are "selected" in the learn-mode Robodebt case */
const ROBODEBT_SELECTED_IDS = ['demographic-parity', 'equal-opportunity'];

/** Robodebt learn-mode annotations for the 7-step framework */
const STEP_ANNOTATIONS: Record<number, string> = {
  1: 'Welfare receipt rates vary significantly across demographics (Indigenous ~40% vs general ~15%), making base rates unequal.',
  2: 'False positives (incorrect debt notices) cause severe financial hardship and psychological distress, far outweighing the cost of missing a genuine overpayment.',
  3: 'Each debt notice is a specific legal determination against an individual with direct financial and legal consequences.',
  4: 'Australian anti-discrimination law and the Social Security Act impose strict legal requirements on how debts can be raised.',
  5: 'Actual fortnightly income records exist (payslips, employer records) and the Federal Court confirmed these must be used.',
  6: 'Government decisions affecting individual rights require full transparency under administrative law. The Royal Commission emphasised opacity as a key failure.',
  7: 'Equal false positive rates across groups and individual fairness are non-negotiable given the severe harm of incorrect debt notices.',
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** A single fairness definition card (collapsible) */
function DefinitionCard({
  def,
  isSelected,
  onToggle,
  isLearn,
}: {
  def: FairnessDefinition;
  isSelected: boolean;
  onToggle?: () => void;
  isLearn: boolean;
}) {
  const [open, setOpen] = useState(isSelected);

  return (
    <div
      className={`bg-card rounded-xl border-2 transition-colors mb-3 overflow-hidden ${
        isSelected
          ? 'border-[var(--c2)] shadow-sm'
          : 'border-border'
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-muted/50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          {isSelected && (
            <span className="w-5 h-5 rounded-full bg-[var(--c2)] flex items-center justify-center flex-shrink-0">
              <Check size={13} className="text-white" strokeWidth={3} />
            </span>
          )}
          <span className="text-[0.9rem] font-semibold">{def.name}</span>
          {isSelected && (
            <span className="text-[0.68rem] font-bold uppercase tracking-wider text-[var(--c2)] bg-[var(--c2)]/10 px-2 py-0.5 rounded-full">
              Selected
            </span>
          )}
        </div>
        <ChevronDown
          size={18}
          className={`text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-3">
          {/* Formula */}
          <div>
            <div className="text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide mb-1">
              Formula
            </div>
            <code className="block bg-muted rounded-lg px-4 py-2.5 text-[0.84rem] font-mono text-foreground">
              {def.formula}
            </code>
            {FORMULA_TRANSLATIONS[def.id] && (
              <p className="text-[0.78rem] italic text-muted-foreground mt-1">
                {FORMULA_TRANSLATIONS[def.id]}
              </p>
            )}
          </div>

          {/* Plain language */}
          <div>
            <div className="text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide mb-1">
              Plain Language
            </div>
            <p className="text-[0.84rem] text-muted-foreground leading-relaxed">
              {def.plainLanguage}
            </p>
          </div>

          {/* When to use */}
          <div>
            <div className="text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide mb-1">
              When To Use
            </div>
            <p className="text-[0.84rem] text-muted-foreground leading-relaxed">
              {def.whenToUse}
            </p>
          </div>

          {/* Limitations */}
          <div>
            <div className="text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide mb-1">
              Limitations
            </div>
            <p className="text-[0.84rem] text-muted-foreground leading-relaxed">
              {def.limitations}
            </p>
          </div>

          {/* Select button (audit mode only) */}
          {!isLearn && onToggle && (
            <button
              onClick={onToggle}
              className={`mt-1 px-4 py-2 rounded-lg text-[0.82rem] font-semibold transition-colors ${
                isSelected
                  ? 'bg-[var(--c2)] text-white hover:bg-[var(--c2)]/90'
                  : 'border border-[var(--c2)] text-[var(--c2)] hover:bg-[var(--c2)]/5'
              }`}
            >
              {isSelected ? 'Deselect' : 'Select this definition'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/** Impossibility Triangle SVG */
function ImpossibilityTriangle() {
  return (
    <div className="bg-card rounded-xl border border-border p-6 mb-6" style={{ borderTopWidth: 3, borderTopColor: C2 }}>
      <h3 className="text-[1.05rem] font-semibold mb-1">The Impossibility Triangle</h3>
      <p className="text-[0.82rem] text-muted-foreground mb-5">
        When <GlossaryTerm slug="baseRate">base rates</GlossaryTerm> differ across groups, it is mathematically impossible to simultaneously
        satisfy <GlossaryTerm slug="calibration">Calibration</GlossaryTerm>, <GlossaryTerm slug="balancePlus">Balance+</GlossaryTerm>, and <GlossaryTerm slug="balanceMinus">Balance-</GlossaryTerm>. You must choose which to prioritise.
      </p>

      <div className="flex justify-center mb-6">
        <svg viewBox="0 0 400 320" className="w-full max-w-[420px]" aria-label="Impossibility triangle showing Calibration, Balance+, and Balance- as the three vertices">
          {/* Triangle */}
          <polygon
            points="200,30 50,280 350,280"
            fill="none"
            stroke="#6366f1"
            strokeWidth="2.5"
            opacity="0.3"
          />
          {/* Filled triangle */}
          <polygon
            points="200,30 50,280 350,280"
            fill="#6366f1"
            opacity="0.04"
          />

          {/* Edges */}
          <line x1="200" y1="30" x2="50" y2="280" stroke="#6366f1" strokeWidth="2" opacity="0.5" />
          <line x1="200" y1="30" x2="350" y2="280" stroke="#6366f1" strokeWidth="2" opacity="0.5" />
          <line x1="50" y1="280" x2="350" y2="280" stroke="#6366f1" strokeWidth="2" opacity="0.5" />

          {/* Vertex dots */}
          <circle cx="200" cy="30" r="8" fill="#6366f1" />
          <circle cx="50" cy="280" r="8" fill="#6366f1" />
          <circle cx="350" cy="280" r="8" fill="#6366f1" />

          {/* Labels */}
          <text x="200" y="18" textAnchor="middle" className="fill-foreground text-[0.82rem] font-semibold">
            Calibration
          </text>
          <text x="30" y="305" textAnchor="middle" className="fill-foreground text-[0.82rem] font-semibold">
            Balance+
          </text>
          <text x="370" y="305" textAnchor="middle" className="fill-foreground text-[0.82rem] font-semibold">
            Balance-
          </text>

          {/* Edge labels */}
          <text x="110" y="145" textAnchor="middle" transform="rotate(-56, 110, 145)" className="fill-[#6366f1] text-[0.68rem]" opacity="0.7">
            Cannot both hold
          </text>
          <text x="290" y="145" textAnchor="middle" transform="rotate(56, 290, 145)" className="fill-[#6366f1] text-[0.68rem]" opacity="0.7">
            Cannot both hold
          </text>
          <text x="200" y="270" textAnchor="middle" className="fill-[#6366f1] text-[0.68rem]" opacity="0.7">
            Cannot both hold
          </text>

          {/* Centre text */}
          <text x="200" y="185" textAnchor="middle" className="fill-muted-foreground text-[0.7rem]">
            Pick at most 2
          </text>
        </svg>
      </div>

      {/* Vertex explanation cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-muted rounded-lg p-3.5 border-l-[3px] border-[var(--c2)]">
          <h5 className="text-[0.82rem] font-semibold mb-1">Calibration</h5>
          <p className="text-[0.78rem] text-muted-foreground leading-relaxed">
            A risk score of <em>s</em> means the actual probability of the event is <em>s</em>,
            regardless of group. If the system says 70% chance of debt, 70% of those people
            should actually owe a debt, in every group.
          </p>
        </div>
        <div className="bg-muted rounded-lg p-3.5 border-l-[3px] border-[var(--c2)]">
          <h5 className="text-[0.82rem] font-semibold mb-1">Balance for the Positive Class (Balance+)</h5>
          <p className="text-[0.78rem] text-muted-foreground leading-relaxed">
            Among people who truly have the positive outcome (e.g., truly owe a debt), the average
            predicted score is the same across groups. True debtors are scored equally regardless
            of demographics.
          </p>
        </div>
        <div className="bg-muted rounded-lg p-3.5 border-l-[3px] border-[var(--c2)]">
          <h5 className="text-[0.82rem] font-semibold mb-1">Balance for the Negative Class (Balance-)</h5>
          <p className="text-[0.78rem] text-muted-foreground leading-relaxed">
            Among people who truly do NOT have the positive outcome (e.g., do NOT owe a debt),
            the average predicted score is the same across groups. Innocent people are scored
            equally regardless of demographics.
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function C2FairnessDefinitionsPage() {
  const mode = useAuditStore(s => s.mode);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLearn = !mounted || mode === 'learn';

  // Store state (audit mode)
  const storeC2 = useAuditStore(s => s.c2);
  const updateDecisionStep = useAuditStore(s => s.updateDecisionStep);
  const updatePrimarySelection = useAuditStore(s => s.updatePrimarySelection);
  const updateSecondarySelection = useAuditStore(s => s.updateSecondarySelection);
  const updateTradeoff = useAuditStore(s => s.updateTradeoff);

  const auditState = useAuditStore(s => s);
  const progress = useComponentProgress('c2');

  const c2Data = isLearn ? ROBODEBT_C2 : storeC2;

  // Definition catalog — selected vs. not-selected
  const [auditSelectedIds, setAuditSelectedIds] = useState<Set<string>>(new Set());
  const [showAllDefs, setShowAllDefs] = useState(false);

  const selectedIds = isLearn ? new Set(ROBODEBT_SELECTED_IDS) : auditSelectedIds;

  const selectedDefs = useMemo(
    () => FAIRNESS_DEFINITIONS.filter(d => selectedIds.has(d.id)),
    [selectedIds],
  );
  const otherDefs = useMemo(
    () => FAIRNESS_DEFINITIONS.filter(d => !selectedIds.has(d.id)),
    [selectedIds],
  );

  const toggleAuditDef = (id: string) => {
    setAuditSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-[1.5rem] font-bold tracking-tight flex items-center gap-2">
          <span
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-[1rem] font-extrabold"
            style={{ backgroundColor: C2 }}
          >
            2
          </span>
          Fairness Definition Selection
        </h2>
        <p className="text-muted-foreground mt-1.5 text-[0.88rem] max-w-[720px]">
          Fairness has multiple competing mathematical definitions. Selecting the right ones
          for your system requires understanding the domain context, error impacts, and legal
          constraints documented in Component 1. Key concepts: <GlossaryTerm slug="demographicParity">Demographic Parity</GlossaryTerm>, <GlossaryTerm slug="equalOpportunity">Equal Opportunity</GlossaryTerm>, <GlossaryTerm slug="calibration">Calibration</GlossaryTerm>, and the <GlossaryTerm slug="impossibilityResult">impossibility result</GlossaryTerm>.
        </p>
      </div>

      {/* Prior Findings from C1 (audit mode only) */}
      {!isLearn && (
        <PriorFindingsPanel
          title="Component 1 Findings"
          summary={buildC1Summary(auditState)}
          color={C2}
        />
      )}

      {/* Progress (audit mode only) */}
      {!isLearn && <ProgressIndicator progress={progress} color={C2} />}

      {/* Why Card */}
      <WhyCard
        component="c2"
        explanation="There is no single 'correct' definition of fairness. Different mathematical formulations protect different things, and some are provably incompatible with each other. Choosing the wrong definition can make a system appear fair while masking serious harm."
        example="For Robodebt, demographic parity reveals that debt notices were issued at dramatically different rates across groups (48% for Indigenous Australians vs 27% for non-Indigenous). Equal opportunity reveals that among people who truly did NOT owe debts, Indigenous Australians were far more likely to receive false notices. Both definitions are needed to capture the full picture of unfairness."
      />

      {/* Methodology Panel */}
      <MethodologyPanel
        component="c2"
        title="Fairness Definition Selection Methodology"
        description="Review the catalog of 7 fairness definitions. Understand the impossibility theorem that limits which can be simultaneously satisfied. Work through the 7-step decision framework to select primary and secondary definitions. Document the trade-offs inherent in your selection."
      />

      {/* ================================================================= */}
      {/* Definition Catalog */}
      {/* ================================================================= */}
      <div className="mb-6">
        <h3 className="text-[1.05rem] font-semibold mb-1">Definition Catalog</h3>
        <p className="text-[0.82rem] text-muted-foreground mb-4">
          {isLearn
            ? <>The Robodebt audit selected <GlossaryTerm slug="demographicParity">Demographic Parity</GlossaryTerm> and <GlossaryTerm slug="equalOpportunity">Equal Opportunity</GlossaryTerm> as primary and secondary definitions. Review all 7 definitions to understand why.</>
            : <>Review each definition and select those appropriate for your system. Key options include <GlossaryTerm slug="demographicParity">Demographic Parity</GlossaryTerm>, <GlossaryTerm slug="equalOpportunity">Equal Opportunity</GlossaryTerm>, <GlossaryTerm slug="equalizedOdds">Equalized Odds</GlossaryTerm>, <GlossaryTerm slug="predictiveParity">Predictive Parity</GlossaryTerm>, <GlossaryTerm slug="calibration">Calibration</GlossaryTerm>, and <GlossaryTerm slug="counterfactualFairness">Counterfactual Fairness</GlossaryTerm>.</>}
        </p>

        {/* Selected definitions first */}
        {selectedDefs.map(def => (
          <DefinitionCard
            key={def.id}
            def={def}
            isSelected
            isLearn={isLearn}
            onToggle={() => toggleAuditDef(def.id)}
          />
        ))}

        {/* Show/hide toggle for remaining */}
        {!showAllDefs && otherDefs.length > 0 && (
          <button
            onClick={() => setShowAllDefs(true)}
            className="w-full py-3 border-2 border-dashed border-border rounded-xl text-[0.84rem] font-semibold text-muted-foreground hover:border-[var(--c2)]/40 hover:text-[var(--c2)] transition-colors mb-3"
          >
            Show {otherDefs.length} more definition{otherDefs.length !== 1 ? 's' : ''}
          </button>
        )}

        {showAllDefs &&
          otherDefs.map(def => (
            <DefinitionCard
              key={def.id}
              def={def}
              isSelected={false}
              isLearn={isLearn}
              onToggle={() => toggleAuditDef(def.id)}
            />
          ))}

        {showAllDefs && otherDefs.length > 0 && (
          <button
            onClick={() => setShowAllDefs(false)}
            className="text-[0.82rem] font-semibold text-[var(--c2)] hover:underline mt-1"
          >
            Show fewer
          </button>
        )}
      </div>

      {/* ================================================================= */}
      {/* Impossibility Triangle */}
      {/* ================================================================= */}
      <ImpossibilityTriangle />

      {/* ================================================================= */}
      {/* 7-Step Decision Framework */}
      {/* ================================================================= */}
      <div className="mb-6">
        <h3 className="text-[1.05rem] font-semibold mb-1">7-Step Decision Framework</h3>
        <p className="text-[0.82rem] text-muted-foreground mb-4">
          Work through each step to systematically determine which fairness definitions are
          appropriate for your system. Each step narrows the set of viable definitions.
        </p>

        {c2Data.decisionFramework.map((step, idx) => (
          <PhaseCard
            key={step.step}
            num={step.step}
            title={`Step ${step.step}: ${stepShortTitle(step.question)}`}
            color={C2}
            plainLanguage={step.question}
            defaultOpen={idx === 0}
          >
            {/* Input section */}
            <div className="mb-4">
              {step.inputType === 'radio' && (
                <div className="space-y-2">
                  {step.options.map(opt => {
                    const currentAnswer = step.answer;
                    const isChecked = currentAnswer === opt;
                    return (
                      <label
                        key={opt}
                        className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border text-[0.84rem] cursor-pointer transition-colors ${
                          isChecked
                            ? 'border-[var(--c2)] bg-[var(--c2)]/5'
                            : 'border-border hover:bg-muted/50'
                        } ${isLearn ? 'pointer-events-none' : ''}`}
                      >
                        <input
                          type="radio"
                          name={`step-${step.step}`}
                          checked={isChecked}
                          disabled={isLearn}
                          onChange={() => {
                            if (!isLearn) updateDecisionStep(idx, { answer: opt });
                          }}
                          className="accent-[#6366f1]"
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {step.inputType === 'checklist' && (
                <div className="space-y-2">
                  {step.options.map(opt => {
                    const currentAnswers = Array.isArray(step.answer) ? step.answer : [];
                    const isChecked = currentAnswers.includes(opt);
                    return (
                      <label
                        key={opt}
                        className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border text-[0.84rem] cursor-pointer transition-colors ${
                          isChecked
                            ? 'border-[var(--c2)] bg-[var(--c2)]/5'
                            : 'border-border hover:bg-muted/50'
                        } ${isLearn ? 'pointer-events-none' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isLearn}
                          onChange={() => {
                            if (!isLearn) {
                              const newAnswers = isChecked
                                ? currentAnswers.filter(a => a !== opt)
                                : [...currentAnswers, opt];
                              updateDecisionStep(idx, { answer: newAnswers });
                            }
                          }}
                          className="accent-[#6366f1]"
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {step.inputType === 'multiselect' && (
                <div className="space-y-2">
                  {step.options.map(opt => {
                    const currentAnswers = Array.isArray(step.answer) ? step.answer : [];
                    const isChecked = currentAnswers.includes(opt);
                    return (
                      <label
                        key={opt}
                        className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border text-[0.84rem] cursor-pointer transition-colors ${
                          isChecked
                            ? 'border-[var(--c2)] bg-[var(--c2)]/5'
                            : 'border-border hover:bg-muted/50'
                        } ${isLearn ? 'pointer-events-none' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isLearn}
                          onChange={() => {
                            if (!isLearn) {
                              const newAnswers = isChecked
                                ? currentAnswers.filter(a => a !== opt)
                                : [...currentAnswers, opt];
                              updateDecisionStep(idx, { answer: newAnswers });
                            }
                          }}
                          className="accent-[#6366f1]"
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Explanation textarea */}
              <div className="mt-3">
                <WorksheetField
                  label="Explanation"
                  value={step.explanation}
                  onChange={v => updateDecisionStep(idx, { explanation: v })}
                  rows={3}
                  placeholder="Explain your reasoning for this answer..."
                  scaffoldTip="Document why you chose this answer. Reference specific evidence from your Component 1 analysis."
                />
              </div>
            </div>

            {/* Learn mode annotation */}
            {isLearn && STEP_ANNOTATIONS[step.step] && (
              <div className="bg-[var(--c2)]/[0.06] border-l-[3px] border-[var(--c2)] rounded-r-lg p-2.5 text-[0.78rem] text-muted-foreground">
                <span className="font-bold text-foreground">Why this answer? </span>
                {STEP_ANNOTATIONS[step.step]}
              </div>
            )}
          </PhaseCard>
        ))}
      </div>

      {/* AI: Definition recommendation based on framework answers */}
      {!isLearn && (
        <AnalyzeButton
          systemPrompt={PROMPT_TEMPLATES.c2_definition_recommendation.system}
          userPrompt={PROMPT_TEMPLATES.c2_definition_recommendation.user(
            buildProgressiveContext(auditState, 'c2'),
            c2Data.decisionFramework.map(s => {
              const ans = Array.isArray(s.answer) ? s.answer.join(', ') : s.answer;
              return `Step ${s.step}: ${s.question} → ${ans || '(not answered)'}`;
            }).join('\n')
          )}
          component="c2"
          section="definition-recommendation"
          buttonLabel="Get AI Recommendation"
          className="mb-6"
        />
      )}

      {/* ================================================================= */}
      {/* Selection Output */}
      {/* ================================================================= */}
      <div
        className="bg-card rounded-xl border border-border p-6 mb-6"
        style={{ borderTopWidth: 3, borderTopColor: C2 }}
      >
        <h3 className="text-[1.05rem] font-semibold mb-4">Definition Selection</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Primary */}
          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <div className="text-[0.72rem] font-bold text-[var(--c2)] uppercase tracking-wide mb-2">
              Primary Definition
            </div>
            {isLearn ? (
              <>
                <p className="text-[0.92rem] font-semibold mb-1.5">
                  {c2Data.primarySelection.definition}
                </p>
                <p className="text-[0.82rem] text-muted-foreground leading-relaxed">
                  {c2Data.primarySelection.justification}
                </p>
              </>
            ) : (
              <>
                <WorksheetField
                  label="Definition Name"
                  value={c2Data.primarySelection.definition}
                  onChange={v => updatePrimarySelection({ definition: v })}
                  multiline={false}
                  placeholder="e.g. Demographic Parity"
                />
                <WorksheetField
                  label="Justification"
                  value={c2Data.primarySelection.justification}
                  onChange={v => updatePrimarySelection({ justification: v })}
                  rows={4}
                  placeholder="Why is this the most appropriate primary definition for your system?"
                  scaffoldTip="Reference your answers from the 7-step framework above."
                />
              </>
            )}
          </div>

          {/* Secondary */}
          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <div className="text-[0.72rem] font-bold text-[var(--c2)] uppercase tracking-wide mb-2">
              Secondary Definition
            </div>
            {isLearn ? (
              <>
                <p className="text-[0.92rem] font-semibold mb-1.5">
                  {c2Data.secondarySelection.definition}
                </p>
                <p className="text-[0.82rem] text-muted-foreground leading-relaxed">
                  {c2Data.secondarySelection.justification}
                </p>
              </>
            ) : (
              <>
                <WorksheetField
                  label="Definition Name"
                  value={c2Data.secondarySelection.definition}
                  onChange={v => updateSecondarySelection({ definition: v })}
                  multiline={false}
                  placeholder="e.g. Equal Opportunity"
                />
                <WorksheetField
                  label="Justification"
                  value={c2Data.secondarySelection.justification}
                  onChange={v => updateSecondarySelection({ justification: v })}
                  rows={4}
                  placeholder="Why is this an important secondary definition?"
                  scaffoldTip="The secondary definition often protects against a failure mode of the primary definition."
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* Trade-off Documentation */}
      {/* ================================================================= */}
      <div
        className="bg-card rounded-xl border border-border p-6 mb-6"
        style={{ borderTopWidth: 3, borderTopColor: C2 }}
      >
        <h3 className="text-[1.05rem] font-semibold mb-1">Trade-off Documentation</h3>
        <p className="text-[0.82rem] text-muted-foreground mb-4">
          Document the tension between your selected definitions and how you plan to resolve it.
          The impossibility theorem guarantees trade-offs exist; being explicit about them is a
          hallmark of a rigorous audit.
        </p>

        {isLearn ? (
          <div className="space-y-3">
            <div>
              <div className="text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide mb-1">
                Trade-off Title
              </div>
              <p className="text-[0.88rem] font-semibold">{c2Data.tradeoff.title}</p>
            </div>
            <div>
              <div className="text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide mb-1">
                Description
              </div>
              <p className="text-[0.84rem] text-muted-foreground leading-relaxed">
                {c2Data.tradeoff.description}
              </p>
            </div>
            <div>
              <div className="text-[0.72rem] font-bold text-muted-foreground uppercase tracking-wide mb-1">
                Resolution Strategy
              </div>
              <p className="text-[0.84rem] text-muted-foreground leading-relaxed">
                {c2Data.tradeoff.resolution}
              </p>
            </div>
          </div>
        ) : (
          <>
            <WorksheetField
              label="Trade-off Title"
              value={c2Data.tradeoff.title}
              onChange={v => updateTradeoff({ title: v })}
              multiline={false}
              placeholder="e.g. Demographic Parity vs. Equal Opportunity"
            />
            <WorksheetField
              label="Description"
              value={c2Data.tradeoff.description}
              onChange={v => updateTradeoff({ description: v })}
              rows={4}
              placeholder="Describe the tension between your primary and secondary definitions..."
              scaffoldTip="Be specific about the scenarios where the two definitions would give conflicting guidance."
            />
            <WorksheetField
              label="Resolution Strategy"
              value={c2Data.tradeoff.resolution}
              onChange={v => updateTradeoff({ resolution: v })}
              rows={4}
              placeholder="How will you resolve this tension in practice?"
              scaffoldTip="Consider using one definition as a screening alarm and the other as the binding constraint."
            />
          </>
        )}
      </div>

      {/* AI: Selection review */}
      {!isLearn && (
        <AnalyzeButton
          systemPrompt={PROMPT_TEMPLATES.c2_selection_review.system}
          userPrompt={PROMPT_TEMPLATES.c2_selection_review.user(
            buildProgressiveContext(auditState, 'c2'),
            `Primary: ${c2Data.primarySelection.definition} — ${c2Data.primarySelection.justification}\nSecondary: ${c2Data.secondarySelection.definition} — ${c2Data.secondarySelection.justification}\nTrade-off: ${c2Data.tradeoff.title} — ${c2Data.tradeoff.description}`
          )}
          component="c2"
          section="selection-review"
          buttonLabel="Review Selection"
          className="mb-6"
        />
      )}

      {/* ================================================================= */}
      {/* Handoff */}
      {/* ================================================================= */}
      <HandoffCard
        title="Handoff to Component 3"
        description="You have selected and justified your fairness definitions. Next, systematically identify and prioritise the sources of bias in your system using a structured 7-type taxonomy. The definitions selected here will determine which biases are most consequential."
        nextHref="/c3-bias-sources"
        nextLabel="C3: Bias Sources"
        nextColor="#d97706"
      />

      {/* Chat Sidebar (audit mode only) */}
      {!isLearn && <ChatSidebar component="c2" context={buildProgressiveContext(auditState, 'c2')} />}
    </div>
  );
}
