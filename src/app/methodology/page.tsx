'use client';

import { GlossaryTerm } from '@/components/shared/GlossaryTerm';
import { BookOpen, GitBranch, Database, Scale, Search, BarChart3 } from 'lucide-react';

function SectionHeading({ title, color, icon: Icon }: { title: string; color: string; icon: React.ComponentType<{ size?: number }> }) {
  return (
    <div className="flex items-center gap-2.5 mb-4 mt-8 first:mt-0">
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: color }}>
        <Icon size={16} />
      </div>
      <h2 className="text-[1.2rem] font-bold tracking-tight">{title}</h2>
    </div>
  );
}

export default function MethodologyPage() {
  return (
    <div className="max-w-[900px] mx-auto">
      {/* Page Header */}
      <div className="mb-7">
        <h2 className="text-[1.6rem] font-bold tracking-tight flex items-center gap-2">
          <BookOpen size={28} className="text-muted-foreground" />
          Methodology
        </h2>
        <p className="text-muted-foreground text-[0.92rem] mt-1.5 max-w-[720px]">
          This page documents the theoretical foundations, scoring frameworks, and statistical methods
          used in the Fairness Audit Playbook.
        </p>
      </div>

      {/* Why This Methodology */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <h3 className="text-[1.05rem] font-semibold mb-3">Why This Methodology?</h3>
        <p className="text-[0.86rem] text-muted-foreground leading-relaxed mb-3">
          Algorithmic fairness cannot be assessed by examining a single metric in isolation. Bias enters
          systems through multiple pathways — historical context, data collection, model design, and
          deployment — and manifests differently depending on which fairness definition is applied.
        </p>
        <p className="text-[0.86rem] text-muted-foreground leading-relaxed">
          This 4-component methodology provides a structured, comprehensive approach that traces bias
          from its historical roots through to measurable disparities. Each component builds on the
          previous, creating an audit trail that connects institutional context to statistical evidence
          to actionable recommendations.
        </p>
      </div>

      {/* Component Overview */}
      <SectionHeading title="Component Overview" color="#6b7280" icon={GitBranch} />

      <div className="space-y-4 mb-6">
        {[
          {
            num: 1,
            title: 'Historical Context Assessment',
            color: '#0d9488',
            purpose: 'Examine the historical and institutional context to understand how discrimination patterns reach the automated system.',
            inputs: 'Institutional history, policy documents, affected population demographics, prior compliance processes',
            outputs: 'Risk classification matrix, protected group inventory, feedback loop analysis, intersectional group identification',
            connection: 'Feeds C2 (label reliability, legal context), C3 (historical bias patterns), and C4 (intersectional subgroups to evaluate)',
          },
          {
            num: 2,
            title: 'Fairness Definition Selection',
            color: '#6366f1',
            purpose: 'Select appropriate fairness definitions through a structured decision framework that accounts for error asymmetry, label reliability, and legal constraints.',
            inputs: 'C1 risk findings, label reliability assessment, error impact analysis, legal requirements',
            outputs: 'Primary and secondary fairness definitions with justifications, trade-off documentation',
            connection: 'Drives C3 bias weight adjustments and C4 metric selection',
          },
          {
            num: 3,
            title: 'Bias Source Identification',
            color: '#d97706',
            purpose: 'Systematically identify and prioritise seven types of algorithmic bias using a structured taxonomy and multi-dimensional scoring framework.',
            inputs: 'C1 context + C2 definitions, evidence of bias in data pipeline, model design, and deployment',
            outputs: 'Prioritised bias inventory with weighted scores and mitigation feasibility assessments',
            connection: 'Informs C4 metric selection (which metrics to compute based on which biases are present)',
          },
          {
            num: 4,
            title: 'Fairness Metrics & Reporting',
            color: '#e11d48',
            purpose: 'Quantify fairness disparities with statistical validation, produce visualisations, and generate actionable recommendations.',
            inputs: 'C1 intersectional groups, C2 fairness definitions, C3 bias priorities, system outcome data',
            outputs: 'SPD computations, error rate analysis, intersectional findings, statistical validation, recommendations, executive summary',
            connection: 'Final output — synthesises all components into an auditable report',
          },
        ].map(comp => (
          <div
            key={comp.num}
            className="bg-card rounded-xl border border-border p-5"
            style={{ borderTopWidth: 3, borderTopColor: comp.color }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[0.78rem] font-bold flex-shrink-0"
                style={{ backgroundColor: comp.color }}
              >
                {comp.num}
              </span>
              <h4 className="text-[0.95rem] font-semibold">{comp.title}</h4>
            </div>
            <p className="text-[0.84rem] text-muted-foreground leading-relaxed mb-3">{comp.purpose}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[0.82rem]">
              <div>
                <div className="font-semibold text-muted-foreground text-[0.72rem] uppercase tracking-wide mb-0.5">Inputs</div>
                <p className="text-foreground">{comp.inputs}</p>
              </div>
              <div>
                <div className="font-semibold text-muted-foreground text-[0.72rem] uppercase tracking-wide mb-0.5">Outputs</div>
                <p className="text-foreground">{comp.outputs}</p>
              </div>
              <div>
                <div className="font-semibold text-muted-foreground text-[0.72rem] uppercase tracking-wide mb-0.5">Connection</div>
                <p className="text-foreground">{comp.connection}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Scoring Frameworks */}
      <SectionHeading title="Scoring Frameworks" color="#d97706" icon={Scale} />

      <div className="space-y-4 mb-6">
        {/* Risk Matrix */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h4 className="text-[0.95rem] font-semibold mb-2">Risk Classification Matrix (C1)</h4>
          <p className="text-[0.84rem] text-muted-foreground leading-relaxed mb-3">
            Each identified risk is scored on three dimensions, each rated 1-5:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-[0.82rem]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-3 font-semibold text-muted-foreground">Dimension</th>
                  <th className="text-left py-2 px-3 font-semibold text-muted-foreground">Question</th>
                  <th className="text-center py-2 pl-3 font-semibold text-muted-foreground">Scale</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-3 font-medium">Severity</td>
                  <td className="py-2 px-3 text-muted-foreground">How severe is the potential harm?</td>
                  <td className="py-2 pl-3 text-center font-mono">1-5</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-3 font-medium">Likelihood</td>
                  <td className="py-2 px-3 text-muted-foreground">How likely is this risk to materialise?</td>
                  <td className="py-2 pl-3 text-center font-mono">1-5</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 pr-3 font-medium">Relevance</td>
                  <td className="py-2 px-3 text-muted-foreground">How relevant is this risk to the specific system?</td>
                  <td className="py-2 pl-3 text-center font-mono">1-5</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-[0.82rem] text-muted-foreground mt-3">
            <strong>Score = Severity x Likelihood x Relevance</strong> (range: 1-125)
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="px-2.5 py-0.5 rounded-xl text-[0.72rem] font-bold bg-[rgba(231,76,60,0.1)] text-[#e74c3c]">Critical &ge; 90</span>
            <span className="px-2.5 py-0.5 rounded-xl text-[0.72rem] font-bold bg-[rgba(240,173,78,0.1)] text-[#f0ad4e]">Elevated &ge; 40</span>
            <span className="px-2.5 py-0.5 rounded-xl text-[0.72rem] font-bold bg-[rgba(74,144,217,0.1)] text-[#4a90d9]">Moderate &ge; 15</span>
            <span className="px-2.5 py-0.5 rounded-xl text-[0.72rem] font-bold bg-[rgba(39,174,96,0.1)] text-[#27ae60]">Low &lt; 15</span>
          </div>
        </div>

        {/* Bias Prioritization */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h4 className="text-[0.95rem] font-semibold mb-2">Bias Prioritisation Framework (C3)</h4>
          <p className="text-[0.84rem] text-muted-foreground leading-relaxed mb-3">
            Each of the seven bias types is scored across five dimensions, combined with weighted formula:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-[0.82rem]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-3 font-semibold text-muted-foreground">Dimension</th>
                  <th className="text-center py-2 px-3 font-semibold text-muted-foreground">Weight</th>
                  <th className="text-left py-2 pl-3 font-semibold text-muted-foreground">Description</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { dim: 'Severity', weight: '30%', desc: 'How severe is the harm caused by this bias type?' },
                  { dim: 'Scope', weight: '20%', desc: 'How many groups or individuals are affected?' },
                  { dim: 'Persistence', weight: '20%', desc: 'How deeply embedded is this bias?' },
                  { dim: 'Historical Alignment', weight: '20%', desc: 'Does this bias replicate known discrimination patterns?' },
                  { dim: 'Feasibility of Mitigation', weight: '10%', desc: 'How difficult is this bias to address?' },
                ].map(row => (
                  <tr key={row.dim} className="border-b border-border/50">
                    <td className="py-2 pr-3 font-medium">{row.dim}</td>
                    <td className="py-2 px-3 text-center font-mono font-bold">{row.weight}</td>
                    <td className="py-2 pl-3 text-muted-foreground">{row.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[0.82rem] text-muted-foreground mt-3">
            <strong>Priority:</strong> High &ge; 3.5 | Medium &ge; 2.5 | Low &lt; 2.5
          </p>
          <p className="text-[0.82rem] text-muted-foreground mt-1">
            Weights adapt based on the C2 fairness definition selection (e.g., Demographic Parity boosts Scope weight to 30%).
          </p>
        </div>

        {/* Audit Dimensions */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h4 className="text-[0.95rem] font-semibold mb-2">Audit Dimension Assessment (C4)</h4>
          <p className="text-[0.84rem] text-muted-foreground leading-relaxed mb-3">
            The overall system is rated on five governance dimensions (each 1-5):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { dim: 'Data Quality', desc: 'Accuracy, completeness, and representativeness of input data' },
              { dim: 'Fairness Metrics', desc: 'Whether outcome rates and error rates are equitable across groups' },
              { dim: 'Transparency', desc: 'Whether affected individuals can understand the decision process' },
              { dim: 'Accountability', desc: 'Whether governance structures ensure responsible oversight' },
              { dim: 'Remediation', desc: 'Whether harm is identified and addressed effectively' },
            ].map(item => (
              <div key={item.dim} className="bg-muted rounded-lg p-3">
                <div className="text-[0.84rem] font-semibold mb-0.5">{item.dim}</div>
                <div className="text-[0.78rem] text-muted-foreground">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Statistical Methods */}
      <SectionHeading title="Statistical Methods" color="#e11d48" icon={BarChart3} />

      <div className="space-y-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-5">
          <h4 className="text-[0.95rem] font-semibold mb-3">Fairness Metrics</h4>
          <div className="space-y-3">
            {[
              {
                name: 'Statistical Parity Difference (SPD)',
                formula: 'SPD = P(Y\u0302=1|G=a) \u2212 P(Y\u0302=1|G=b)',
                desc: 'Measures the difference in outcome rates between groups. Values above 0.05 are generally considered meaningful disparities. The four-fifths rule uses a ratio variant.',
              },
              {
                name: 'Disaggregated Error Rates',
                formula: 'FPR_g = FP_g / (FP_g + TN_g)',
                desc: 'False positive and false negative rates computed separately for each protected group. Reveals which groups bear disproportionate error burden.',
              },
              {
                name: 'Intersectional Analysis',
                formula: 'Metrics computed for cross-products of protected attributes',
                desc: 'Analyses outcomes at intersections of multiple attributes (e.g., age \u00d7 Indigenous status \u00d7 region) to detect compounding disadvantage invisible in single-attribute analysis.',
              },
            ].map(method => (
              <div key={method.name} className="bg-muted rounded-lg p-4">
                <div className="text-[0.86rem] font-semibold mb-1">{method.name}</div>
                <code className="text-[0.78rem] text-[var(--c4)] bg-background px-2 py-0.5 rounded font-mono block mb-1.5">
                  {method.formula}
                </code>
                <p className="text-[0.82rem] text-muted-foreground">{method.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h4 className="text-[0.95rem] font-semibold mb-3">Validation Methods</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              {
                name: 'Bootstrap Confidence Intervals',
                desc: 'Resample data with replacement (n=10,000) to estimate uncertainty ranges for each metric. A 95% CI that excludes zero confirms the disparity is robust.',
              },
              {
                name: 'Permutation Tests',
                desc: 'Randomly shuffle group labels to create a null distribution. If the observed disparity exceeds 95% of permuted values, it is unlikely due to chance (p < 0.05).',
              },
              {
                name: 'Benjamini-Hochberg Correction',
                desc: 'When testing multiple groups simultaneously, adjusts significance thresholds to control the false discovery rate, preventing phantom disparities.',
              },
              {
                name: 'Effect Size (Cohen\'s d)',
                desc: 'Measures practical magnitude independently of sample size. Small: d=0.2, Medium: d=0.5, Large: d=0.8. Complements p-values with practical significance.',
              },
            ].map(method => (
              <div key={method.name} className="bg-muted rounded-lg p-3.5">
                <div className="text-[0.84rem] font-semibold mb-1">{method.name}</div>
                <p className="text-[0.78rem] text-muted-foreground leading-relaxed">{method.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Academic Foundations */}
      <SectionHeading title="Academic Foundations" color="#6366f1" icon={Database} />

      <div className="bg-card rounded-xl border border-border p-5 mb-6">
        <div className="space-y-3">
          {[
            {
              citation: 'Suresh, H., & Guttag, J. (2021)',
              title: 'A Framework for Understanding Sources of Harm throughout the Machine Learning Life Cycle',
              relevance: 'Provides the 7-type bias taxonomy (Historical, Representation, Measurement, Aggregation, Learning, Evaluation, Deployment) used in Component 3.',
            },
            {
              citation: 'Chouldechova, A. (2017)',
              title: 'Fair Prediction with Disparate Impact: A Study of Bias in Recidivism Prediction Instruments',
              relevance: 'Proves the impossibility of simultaneously achieving calibration and balance when base rates differ across groups \u2014 foundational to C2 trade-off documentation.',
            },
            {
              citation: 'Kleinberg, J., Mullainathan, S., & Raghavan, M. (2016)',
              title: 'Inherent Trade-Offs in the Fair Determination of Risk Scores',
              relevance: 'Formalises the impossibility result: calibration, balance for positives, and balance for negatives cannot all hold simultaneously with unequal base rates.',
            },
            {
              citation: 'Hardt, M., Price, E., & Srebro, N. (2016)',
              title: 'Equality of Opportunity in Supervised Learning',
              relevance: 'Defines equalized odds and equal opportunity \u2014 key fairness definitions available in Component 2.',
            },
            {
              citation: 'Crenshaw, K. (1989)',
              title: 'Demarginalizing the Intersection of Race and Sex',
              relevance: 'Introduces intersectionality theory \u2014 the foundation for our intersectional analysis in C1 and C4.',
            },
            {
              citation: 'Feldman, M., et al. (2015)',
              title: 'Certifying and Removing Disparate Impact',
              relevance: 'Formalises statistical parity difference and disparate impact testing used in Component 4 metrics.',
            },
            {
              citation: 'Pleiss, G., et al. (2017)',
              title: 'On Fairness and Calibration',
              relevance: 'Analyses calibration as a fairness criterion \u2014 informs the calibration definition in C2.',
            },
          ].map((ref, i) => (
            <div key={i} className="flex gap-3 py-2 border-b border-border/50 last:border-0">
              <div className="w-6 h-6 rounded-full bg-[var(--c2)] text-white flex items-center justify-center text-[0.68rem] font-bold flex-shrink-0 mt-0.5">
                {i + 1}
              </div>
              <div>
                <div className="text-[0.84rem] font-semibold">{ref.citation}</div>
                <div className="text-[0.82rem] italic text-muted-foreground">{ref.title}</div>
                <div className="text-[0.78rem] text-muted-foreground mt-0.5">{ref.relevance}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom spacer */}
      <div className="h-8" />
    </div>
  );
}
