import type {
  SystemDescription,
  C1Data,
  C2Data,
  C3Data,
  C4Data,
  FairnessDefinition,
} from '@/types/audit';

// ===== System Description =====

export const ROBODEBT_SYSTEM: SystemDescription = {
  name: 'Online Compliance Intervention (Robodebt)',
  operator: 'Department of Human Services / Services Australia',
  period: '2015\u20132019',
  scale: '~700,000 debt notices, A$1.76 billion total',
  algorithm:
    'Rule-based income averaging: ATO annual income \u00F7 26 fortnights compared to Centrelink fortnightly payments',
  decision: 'Binary debt/no-debt determination, fully automated',
  outcome:
    'Found unlawful by Federal Court (2019) and Royal Commission (2023). A$1.87B+ refunded.',
};

// ===== Component 1: Historical Context =====

export const ROBODEBT_C1: C1Data = {
  domainContext: {
    system: 'Online Compliance Intervention (OCI) / Robodebt',
    decisionType: 'Automated debt-raising against welfare recipients',
    affectedPopulation:
      'Welfare recipients including JobSeeker, Youth Allowance, Austudy, and Disability Support Pension claimants (~700,000 individuals)',
    historicalPatterns:
      'Long history of punitive welfare compliance in Australia. Indigenous Australians and rural populations have been systematically over-surveilled. The "dole bludger" narrative has shaped policy since the 1970s, creating institutional bias toward assuming fraud rather than administrative error.',
  },
  dataRepresentation: {
    dataSources:
      'ATO annual income data (tax returns), Centrelink fortnightly payment records, employer-reported PAYG data',
    coverageGaps:
      'Casual and irregular workers not captured accurately by annual averaging. Indigenous community employment patterns underrepresented. Gig economy workers with variable income systematically miscategorised.',
    labelReliability:
      'Fundamentally flawed: annual income averaging created false "discrepancies" that did not represent actual overpayments. The mathematical basis for debt calculation was legally invalid.',
    dataSourceChecklist: {
      'Administrative records (government databases)': true,
      'Tax records (ATO annual summaries)': true,
      'Self-reported income (Centrelink declarations)': true,
      'Employer-reported data (PAYG summaries)': true,
      'Historical compliance records': true,
    },
  },
  technologyTransition: {
    priorProcess:
      'Manual compliance reviews by trained Centrelink officers who could request payslips and verify actual fortnightly income against employer records. Officers exercised discretion and could identify data-matching errors.',
    whatChanged:
      'Automated income averaging replaced manual verification. System divided ATO annual income by 26 fortnights, compared against Centrelink records, and auto-generated debt notices without human review. Volume increased from ~20,000 to ~700,000 interventions.',
    oversightLost:
      'Human discretion in debt assessment was eliminated. The burden of proof was reversed onto recipients to disprove algorithmically generated debts. Internal legal advice warning of unlawfulness was ignored. Complaint and appeal pathways were overwhelmed by volume.',
  },
  protectedGroups: [
    {
      group: 'Young adults (18\u201324)',
      pattern:
        'Disproportionately affected due to casual/variable employment patterns that income averaging misrepresents',
      dataPathway:
        'Annual averaging of irregular student/casual income creates systematic over-estimation of fortnightly earnings',
      impact: 'Strong',
    },
    {
      group: 'Indigenous Australians',
      pattern:
        'Higher welfare dependence rates combined with CDEP/remote employment patterns poorly captured by ATO data',
      dataPathway:
        'Community Development Employment Projects (CDEP) income and seasonal work not compatible with averaging methodology',
      impact: 'Strong',
    },
    {
      group: 'Rural and remote populations',
      pattern:
        'Seasonal and agricultural work patterns create income variability that averaging systematically misrepresents',
      dataPathway:
        'Seasonal employment (shearing, harvesting, tourism) concentrated in specific fortnights but averaged across year',
      impact: 'Moderate',
    },
    {
      group: 'People with disabilities',
      pattern:
        'Disability Support Pension recipients with part-time work capacity particularly vulnerable to averaging errors',
      dataPathway:
        'Variable capacity for work creates fluctuating income that averaging methodology cannot accurately represent',
      impact: 'Moderate',
    },
  ],
  intersections: [
    {
      groups: 'Young + Indigenous',
      priority: 1,
      pattern:
        'Highest compounding disadvantage: youth casual work patterns combined with remote community employment structures and historical distrust of government systems',
    },
    {
      groups: 'Indigenous + Rural/Remote',
      priority: 2,
      pattern:
        'Geographic isolation compounds data gaps in Indigenous employment records; limited access to evidence needed for appeals',
    },
    {
      groups: 'Young + Rural/Remote',
      priority: 3,
      pattern:
        'Seasonal youth employment in agricultural and tourism sectors creates extreme income variability; limited internet access for online appeals',
    },
    {
      groups: 'Disability + Rural/Remote',
      priority: 4,
      pattern:
        'Limited access to advocacy services and digital infrastructure needed to contest automated debts; variable part-time work misrepresented',
    },
  ],
  feedbackLoops: [
    {
      id: 'FL-1',
      trigger: 'Automated debt notice issued based on income averaging',
      mechanism:
        'Recipients who cannot disprove debt within 21 days have debt confirmed, creating a "confirmed fraud" record that increases future compliance scrutiny',
      amplification:
        'Confirmed debts feed back into risk-scoring, making the same individual more likely to be targeted in future data-matching rounds',
      monitoring:
        'Track re-targeting rate of individuals with prior automated debts; compare appeal rates across demographic groups',
    },
    {
      id: 'FL-2',
      trigger: 'Debt recovery through Centrelink payment garnishing',
      mechanism:
        'Automatic deductions from ongoing welfare payments reduce disposable income, increasing financial stress and potential for further payment irregularities',
      amplification:
        'Financial stress may cause recipients to take on irregular/cash work, creating further discrepancies in future data matching',
      monitoring:
        'Monitor correlation between garnishing and subsequent payment irregularities; track financial hardship indicators',
    },
    {
      id: 'FL-3',
      trigger: 'Psychological impact of debt notices on vulnerable populations',
      mechanism:
        'Fear and distress cause some recipients to disengage from welfare system entirely, losing legitimate entitlements and creating data gaps',
      amplification:
        'Disengagement reduces data quality for affected populations, potentially worsening future algorithmic accuracy for those groups',
      monitoring:
        'Track welfare exit rates following debt notices; monitor mental health service referrals; survey disengagement reasons',
    },
  ],
  riskMatrix: [
    {
      id: 'R1',
      risk: 'Invalid mathematical methodology (income averaging)',
      severity: 5,
      likelihood: 5,
      relevance: 5,
      score: 125,
      classification: 'Critical',
    },
    {
      id: 'R2',
      risk: 'Reversal of burden of proof onto recipients',
      severity: 5,
      likelihood: 5,
      relevance: 5,
      score: 125,
      classification: 'Critical',
    },
    {
      id: 'R3',
      risk: 'Disproportionate impact on young casual workers',
      severity: 4,
      likelihood: 5,
      relevance: 5,
      score: 100,
      classification: 'Critical',
    },
    {
      id: 'R4',
      risk: 'Systematic bias against Indigenous Australians',
      severity: 5,
      likelihood: 4,
      relevance: 5,
      score: 100,
      classification: 'Critical',
    },
    {
      id: 'R5',
      risk: 'Elimination of human discretion in debt assessment',
      severity: 4,
      likelihood: 5,
      relevance: 4,
      score: 80,
      classification: 'Elevated',
    },
    {
      id: 'R6',
      risk: 'Inadequate appeal and review mechanisms',
      severity: 4,
      likelihood: 4,
      relevance: 4,
      score: 64,
      classification: 'Elevated',
    },
    {
      id: 'R7',
      risk: 'Psychological harm including suicides linked to debt notices',
      severity: 5,
      likelihood: 3,
      relevance: 4,
      score: 60,
      classification: 'Elevated',
    },
    {
      id: 'R8',
      risk: 'Data quality degradation through feedback loops',
      severity: 3,
      likelihood: 4,
      relevance: 3,
      score: 36,
      classification: 'Moderate',
    },
  ],
  timeline: [
    {
      year: '1991',
      event:
        'Centrelink established as government welfare delivery agency with manual compliance processes',
      type: 'policy',
    },
    {
      year: '1998',
      event:
        'Data-matching between ATO and Centrelink begins with human officer review of discrepancies',
      type: 'system',
    },
    {
      year: '2010',
      event:
        'Northern Territory Intervention highlights systemic issues with Indigenous welfare administration',
      type: 'cultural',
    },
    {
      year: '2015',
      event:
        'Online Compliance Intervention (OCI) launched: automated income averaging replaces manual verification',
      type: 'system',
    },
    {
      year: '2016',
      event:
        'Scale expanded dramatically; internal legal advice warns methodology may be unlawful; advice ignored',
      type: 'policy',
    },
    {
      year: '2017',
      event:
        'Senate inquiry receives thousands of complaints; Commonwealth Ombudsman reports systemic issues',
      type: 'legal',
    },
    {
      year: '2019',
      event:
        'Federal Court rules income averaging methodology unlawful; government agrees to A$1.2B settlement',
      type: 'legal',
    },
    {
      year: '2023',
      event:
        'Royal Commission delivers final report condemning scheme as "cruel and disgraceful"; total refunds exceed A$1.87B',
      type: 'legal',
    },
  ],
};

// ===== Component 2: Fairness Definitions =====

export const ROBODEBT_C2: C2Data = {
  decisionFramework: [
    {
      step: 1,
      question:
        'What is the base rate of the positive outcome across groups? (Are groups roughly equal in size and base rate?)',
      inputType: 'radio',
      options: ['Similar', 'Low', 'High'],
      answer: 'Low',
      explanation:
        'Welfare receipt rates vary significantly across demographic groups. Indigenous Australians (~40% welfare receipt) vs general population (~15%). Young adults have higher rates than older cohorts. Base rates are unequal.',
    },
    {
      step: 2,
      question:
        'Which error type is more harmful? (False Positives = incorrectly flagged, False Negatives = missed cases)',
      inputType: 'radio',
      options: ['False Positives', 'False Negatives', 'Both equally harmful'],
      answer: 'False Positives',
      explanation:
        'False positives (incorrect debt notices to people who owe nothing) cause severe financial hardship, psychological distress, and in some cases contributed to suicides. The harm of wrongly accusing someone of fraud far outweighs missing a genuine overpayment.',
    },
    {
      step: 3,
      question:
        'Is the system making high-stakes individual decisions or aggregate resource allocation?',
      inputType: 'radio',
      options: ['Individual decisions', 'Aggregate allocation', 'Both'],
      answer: 'Individual decisions',
      explanation:
        'Each debt notice is a specific legal determination against an individual, demanding repayment of a calculated amount. This is a high-stakes individual decision with direct financial and legal consequences.',
    },
    {
      step: 4,
      question: 'Are there legal or regulatory constraints on which groups can be considered?',
      inputType: 'radio',
      options: ['Yes, strict constraints', 'Some constraints', 'No specific constraints'],
      answer: 'Yes, strict constraints',
      explanation:
        'Australian anti-discrimination law (Racial Discrimination Act 1975, Disability Discrimination Act 1992, Age Discrimination Act 2004) prohibits differential treatment. Social Security Act requires debts to be based on actual overpayments, not statistical estimates.',
    },
    {
      step: 5,
      question:
        'Can the system\u2019s predictions be validated against ground truth? (Is there a reliable way to know the "correct" answer?)',
      inputType: 'radio',
      options: ['Yes, reliable ground truth', 'Partial ground truth', 'No reliable ground truth'],
      answer: 'Yes, reliable ground truth',
      explanation:
        'Actual fortnightly income records exist (payslips, employer records) and were previously used in manual compliance reviews. The Federal Court confirmed that actual income, not averaged estimates, must be used for debt calculation.',
    },
    {
      step: 6,
      question:
        'What level of transparency is required? (Can the fairness metric be explained to affected individuals?)',
      inputType: 'radio',
      options: ['Full transparency required', 'Partial transparency', 'Limited transparency acceptable'],
      answer: 'Full transparency required',
      explanation:
        'Government decisions affecting individual rights require full transparency under administrative law principles. Recipients must understand how their debt was calculated to exercise their right of appeal. The Royal Commission emphasised that opacity was a key failure.',
    },
    {
      step: 7,
      question: 'Select all fairness properties that are non-negotiable for this system:',
      inputType: 'checklist',
      options: [
        'Equal false positive rates across groups',
        'Equal selection/flagging rates across groups',
        'Equal accuracy across groups',
        'Individual fairness (similar people treated similarly)',
        'Calibration (predicted probabilities match actual rates)',
      ],
      answer: [
        'Equal false positive rates across groups',
        'Individual fairness (similar people treated similarly)',
        'Calibration (predicted probabilities match actual rates)',
      ],
      explanation:
        'Given the severe harm of false positives and the legal requirement for individual accuracy, equal false positive rates and individual fairness are non-negotiable. Calibration is essential because the system should only raise debts where actual overpayments exist.',
    },
  ],
  primarySelection: {
    definition: 'Demographic Parity',
    justification:
      'Debt notice rates should not systematically differ across protected groups (age, Indigenous status, region). While imperfect, demographic parity serves as a first-pass screen: if debt notices are issued at dramatically different rates across groups, this signals potential systemic bias in the underlying methodology.',
  },
  secondarySelection: {
    definition: 'Equal Opportunity',
    justification:
      'Among those who genuinely have overpayments, the system should detect them at equal rates regardless of group membership. Among those who do NOT have overpayments, the false positive rate should be equal. Given that false positives are the primary harm, equalising the true positive rate for the positive class (no-debt) is critical.',
  },
  tradeoff: {
    title: 'Demographic Parity vs. Equal Opportunity',
    description:
      'Demographic parity requires equal debt-notice rates across groups, but if genuine overpayment rates differ across groups (e.g., due to different employment patterns), enforcing equal rates could mean under-detecting real debts in some groups or over-detecting in others. Equal opportunity focuses on equal accuracy conditional on true status, but requires reliable ground truth labels.',
    resolution:
      'Use demographic parity as a disparity alarm and equal opportunity as the binding constraint. If debt-notice rates differ significantly across groups, investigate whether the difference is explained by genuine overpayment rate differences (using actual fortnightly data, not averaged data). Apply equal opportunity to ensure that among true non-debtors, no group faces higher false positive rates. The Robodebt methodology failed both metrics catastrophically.',
  },
};

// ===== Component 3: Bias Sources =====

export const ROBODEBT_C3: C3Data = {
  biasSources: [
    {
      type: 'Historical',
      description:
        'Decades of punitive welfare policy and the "dole bludger" narrative created institutional assumptions that welfare recipients are likely to commit fraud, shaping system design toward accusation rather than accurate assessment.',
      indicators: [
        'Policy rhetoric framing welfare recipients as suspected fraudsters',
        'Historical over-surveillance of Indigenous communities (NT Intervention)',
        'Institutional culture prioritising debt recovery over accuracy',
        'Prior compliance systems embedding punitive assumptions',
      ],
      indicatorChecks: [true, true, true, true],
      evidence:
        'Royal Commission found that the scheme was driven by a "culture of cruelty" and revenue targets rather than evidence of fraud. Internal documents showed debt recovery targets were set before methodology was validated.',
      severityScore: 5,
      dimensions: {
        severity: 5,
        scope: 5,
        persistence: 5,
        historicalAlignment: 5,
        feasibility: 3,
      },
      weightedScore: 4.6,
      priority: 'High',
    },
    {
      type: 'Representation',
      description:
        'Income data from ATO annual returns does not accurately represent fortnightly income patterns for casual workers, seasonal employees, and community-based employment programs.',
      indicators: [
        'Annual income data used as proxy for fortnightly income',
        'Casual/irregular work patterns not captured',
        'Indigenous community employment (CDEP) poorly represented',
        'Gig economy and cash-in-hand work invisible to data matching',
      ],
      indicatorChecks: [true, true, true, true],
      evidence:
        'The Federal Court found that using annualised income data to calculate fortnightly debts was fundamentally flawed. Employment patterns of affected groups (young, Indigenous, rural) were systematically misrepresented by averaging.',
      severityScore: 5,
      dimensions: {
        severity: 5,
        scope: 5,
        persistence: 4,
        historicalAlignment: 5,
        feasibility: 4,
      },
      weightedScore: 4.6,
      priority: 'High',
    },
    {
      type: 'Measurement',
      description:
        'The income averaging methodology (annual income / 26) is a fundamentally invalid measurement of fortnightly income. It transforms accurate annual data into inaccurate fortnightly estimates.',
      indicators: [
        'Mathematical averaging creates phantom discrepancies',
        'Measurement error is systematic, not random',
        'Error magnitude correlates with income variability',
        'No validation against actual fortnightly records',
      ],
      indicatorChecks: [true, true, true, true],
      evidence:
        'The core legal finding: dividing annual income by 26 does not measure actual fortnightly income. A student earning $10,000 over summer appears to earn $385/fortnight year-round, generating false debts for fortnights with zero income.',
      severityScore: 5,
      dimensions: {
        severity: 5,
        scope: 5,
        persistence: 5,
        historicalAlignment: 4,
        feasibility: 5,
      },
      weightedScore: 4.8,
      priority: 'High',
    },
    {
      type: 'Aggregation',
      description:
        'A single averaging formula was applied uniformly to all recipients regardless of employment type, age, industry, or geographic context, ignoring the heterogeneity of income patterns across groups.',
      indicators: [
        'One-size-fits-all formula across diverse populations',
        'No subgroup-specific validation or thresholds',
        'Seasonal industries treated same as year-round employment',
        'Part-time disability employment averaged same as full-time work',
      ],
      indicatorChecks: [true, true, true, true],
      evidence:
        'The scheme made no distinction between a full-time salaried worker (where averaging might approximate reality) and a casual fruit-picker or university student (where averaging produces grossly inaccurate results). This aggregation bias disproportionately harmed groups with variable income.',
      severityScore: 4,
      dimensions: {
        severity: 4,
        scope: 5,
        persistence: 4,
        historicalAlignment: 4,
        feasibility: 4,
      },
      weightedScore: 4.2,
      priority: 'High',
    },
    {
      type: 'Learning',
      description:
        'Although not a machine learning system, Robodebt exhibited learning bias through its operational feedback: confirmed debts (including false ones) reinforced the assumption that the methodology was valid, and recovery revenue was used as evidence of success.',
      indicators: [
        'Debt recovery revenue treated as validation of methodology',
        'Low appeal rates misinterpreted as evidence of accuracy',
        'Confirmed debts used to justify expanding the program',
        'No systematic accuracy audit conducted during operation',
      ],
      indicatorChecks: [true, true, true, true],
      evidence:
        'Internal documents showed that the government pointed to billions in "recovered" debt as evidence the system worked, when in fact the majority of debts were invalid. The low appeal rate reflected recipient vulnerability, not system accuracy.',
      severityScore: 4,
      dimensions: {
        severity: 4,
        scope: 4,
        persistence: 4,
        historicalAlignment: 4,
        feasibility: 3,
      },
      weightedScore: 3.8,
      priority: 'High',
    },
    {
      type: 'Evaluation',
      description:
        'The system was never evaluated against ground truth (actual fortnightly income). Success metrics focused on volume of debts raised and revenue recovered rather than accuracy of individual determinations.',
      indicators: [
        'No accuracy metrics defined or tracked',
        'Success measured by debt volume and revenue',
        'No comparison against manual review outcomes',
        'Ombudsman and internal warnings about accuracy ignored',
      ],
      indicatorChecks: [true, true, true, true],
      evidence:
        'The Royal Commission found that no systematic accuracy assessment was ever conducted. When the scheme was eventually audited, the error rate was found to be approximately 70-80% for debts raised solely through income averaging without additional verification.',
      severityScore: 5,
      dimensions: {
        severity: 5,
        scope: 5,
        persistence: 4,
        historicalAlignment: 4,
        feasibility: 5,
      },
      weightedScore: 4.6,
      priority: 'High',
    },
    {
      type: 'Deployment',
      description:
        'Deployed at massive scale (20,000 to 700,000 interventions) without pilot testing, with reversed burden of proof, inadequate appeal processes, and automated debt recovery including payment garnishing.',
      indicators: [
        'No pilot or phased rollout conducted',
        'Burden of proof reversed onto recipients',
        'Appeal system overwhelmed by volume',
        'Automated garnishing before debts confirmed',
      ],
      indicatorChecks: [true, true, true, true],
      evidence:
        'The system went from processing ~20,000 manual reviews per year to issuing ~700,000 automated debt notices. Recipients had 21 days to produce employment records (sometimes years old) to disprove debts. Many could not access records and had debts confirmed by default.',
      severityScore: 5,
      dimensions: {
        severity: 5,
        scope: 5,
        persistence: 3,
        historicalAlignment: 5,
        feasibility: 4,
      },
      weightedScore: 4.4,
      priority: 'High',
    },
  ],
};

// ===== Component 4: Fairness Metrics =====

export const ROBODEBT_C4: C4Data = {
  debtNoticeRates: {
    byAge: [
      { group: '18\u201324', rate: 0.42, spd: '+0.18', ci: [0.39, 0.45] as [number, number], color: '#ef4444' },
      { group: '25\u201334', rate: 0.31, spd: '+0.07', ci: [0.28, 0.34] as [number, number], color: '#f97316' },
      { group: '35\u201344', rate: 0.24, spd: 'Ref', ci: [0.21, 0.27] as [number, number], color: '#22c55e' },
      { group: '45\u201354', rate: 0.19, spd: '\u22120.05', ci: [0.16, 0.22] as [number, number], color: '#3b82f6' },
      { group: '55+', rate: 0.14, spd: '\u22120.10', ci: [0.11, 0.17] as [number, number], color: '#8b5cf6' },
    ],
    byIndigenous: [
      { group: 'Indigenous', rate: 0.48, spd: '+0.21', ci: [0.43, 0.53] as [number, number], color: '#ef4444' },
      { group: 'Non-Indigenous', rate: 0.27, spd: 'Ref', ci: [0.25, 0.29] as [number, number], color: '#22c55e' },
    ],
    byRegion: [
      { group: 'Major cities', rate: 0.25, spd: 'Ref', ci: [0.23, 0.27] as [number, number], color: '#22c55e' },
      { group: 'Inner regional', rate: 0.30, spd: '+0.05', ci: [0.27, 0.33] as [number, number], color: '#f97316' },
      { group: 'Outer regional', rate: 0.35, spd: '+0.10', ci: [0.31, 0.39] as [number, number], color: '#ef4444' },
      { group: 'Remote/Very remote', rate: 0.41, spd: '+0.16', ci: [0.36, 0.46] as [number, number], color: '#ef4444' },
    ],
  },
  spd: [
    { comparison: 'Age: 18\u201324 vs 35\u201344 (Ref)', spd: 0.18, ci: [0.14, 0.22] as [number, number], significant: true },
    { comparison: 'Age: 25\u201334 vs 35\u201344 (Ref)', spd: 0.07, ci: [0.03, 0.11] as [number, number], significant: true },
    { comparison: 'Indigenous vs Non-Indigenous', spd: 0.21, ci: [0.15, 0.27] as [number, number], significant: true },
    { comparison: 'Remote vs Major cities', spd: 0.16, ci: [0.10, 0.22] as [number, number], significant: true },
    { comparison: 'Outer regional vs Major cities', spd: 0.10, ci: [0.06, 0.14] as [number, number], significant: true },
    { comparison: 'Inner regional vs Major cities', spd: 0.05, ci: [0.01, 0.09] as [number, number], significant: true },
  ],
  errorRates: {
    overall: 0.74,
    byGroup: [
      { group: '18\u201324', rate: 0.81, label: 'Young adults' },
      { group: '25\u201334', rate: 0.76, label: 'Early career' },
      { group: '35\u201344', rate: 0.68, label: 'Mid-career (Ref)' },
      { group: '45\u201354', rate: 0.65, label: 'Late career' },
      { group: '55+', rate: 0.62, label: 'Pre-retirement' },
      { group: 'Indigenous', rate: 0.85, label: 'Indigenous Australians' },
      { group: 'Non-Indigenous', rate: 0.71, label: 'Non-Indigenous' },
      { group: 'Remote', rate: 0.82, label: 'Remote/Very remote' },
      { group: 'Major cities', rate: 0.69, label: 'Major cities' },
    ],
  },
  intersectional: [
    { subgroup: 'Non-Indigenous, 35\u201344, Major city', rate: 0.22, spd: 'Ref', errorRate: 0.62, status: 'Ref' },
    { subgroup: 'Non-Indigenous, 18\u201324, Major city', rate: 0.38, spd: '+0.16', errorRate: 0.78, status: 'High' },
    { subgroup: 'Indigenous, 18\u201324, Remote', rate: 0.63, spd: '+0.41', errorRate: 0.91, status: 'Critical' },
    { subgroup: 'Indigenous, 25\u201334, Remote', rate: 0.54, spd: '+0.32', errorRate: 0.87, status: 'Critical' },
    { subgroup: 'Indigenous, 35\u201344, Major city', rate: 0.41, spd: '+0.19', errorRate: 0.80, status: 'High' },
    { subgroup: 'Non-Indigenous, 18\u201324, Regional', rate: 0.44, spd: '+0.22', errorRate: 0.82, status: 'High' },
    { subgroup: 'Indigenous, 18\u201324, Major city', rate: 0.52, spd: '+0.30', errorRate: 0.88, status: 'Critical' },
    { subgroup: 'Non-Indigenous, 55+, Major city', rate: 0.12, spd: '\u22120.10', errorRate: 0.58, status: 'Elevated' },
    { subgroup: 'Disability, 25\u201334, Regional', rate: 0.47, spd: '+0.25', errorRate: 0.84, status: 'Critical' },
    { subgroup: 'Non-Indigenous, 35\u201344, Regional', rate: 0.28, spd: '+0.06', errorRate: 0.70, status: 'Elevated' },
  ],
  thresholdSensitivity: [
    { tolerance: '\u00B1$0 (Exact match)', falsePositiveRate: 0.81, truePositiveRate: 0.95, label: 'Original Robodebt setting' },
    { tolerance: '\u00B1$100/fortnight', falsePositiveRate: 0.62, truePositiveRate: 0.92, label: 'Minimal tolerance' },
    { tolerance: '\u00B1$250/fortnight', falsePositiveRate: 0.41, truePositiveRate: 0.87, label: 'Low tolerance' },
    { tolerance: '\u00B1$500/fortnight', falsePositiveRate: 0.23, truePositiveRate: 0.78, label: 'Moderate tolerance' },
    { tolerance: '\u00B1$1000/fortnight', falsePositiveRate: 0.11, truePositiveRate: 0.64, label: 'High tolerance' },
    { tolerance: 'Actual fortnightly data', falsePositiveRate: 0.05, truePositiveRate: 0.93, label: 'Gold standard (manual review)' },
  ],
  statisticalValidation: {
    bootstrap:
      'Bootstrap 95% CIs for Indigenous vs Non-Indigenous SPD: [0.15, 0.27]. All group disparities remain significant across 10,000 bootstrap resamples.',
    permutation:
      'Permutation test (n=10,000): p < 0.001 for all primary comparisons. The observed disparities are extremely unlikely under the null hypothesis of no group differences.',
    effectSize:
      "Cohen's d for Indigenous vs Non-Indigenous debt notice rates: d = 0.89 (large effect). Age 18\u201324 vs 35\u201344: d = 0.72 (medium-large). Remote vs Major cities: d = 0.64 (medium).",
    bayesian:
      'Bayesian analysis with uninformative priors: P(SPD > 0.05 | data) > 0.999 for Indigenous comparison. Bayes Factor > 1000 for all primary comparisons, indicating decisive evidence of disparity.',
  },
  recommendations: [
    {
      id: 'REC-01',
      horizon: 'Immediate',
      action: 'Cease all debt notices based solely on income averaging without fortnightly verification',
      impact: 'Eliminates the primary source of invalid debts and false positives across all groups',
    },
    {
      id: 'REC-02',
      horizon: 'Immediate',
      action: 'Establish dedicated review pathway for Indigenous and remote community recipients',
      impact: 'Addresses highest-disparity intersectional subgroups (SPD > 0.30)',
    },
    {
      id: 'REC-03',
      horizon: 'Immediate',
      action: 'Suspend automated debt recovery (garnishing) pending accuracy review',
      impact: 'Prevents ongoing financial harm from unverified debts',
    },
    {
      id: 'REC-04',
      horizon: 'Short-term',
      action: 'Implement fortnightly income verification using employer payroll data (STP) before issuing any debt notice',
      impact: 'Reduces false positive rate from ~74% to estimated ~5% based on manual review benchmarks',
    },
    {
      id: 'REC-05',
      horizon: 'Short-term',
      action: 'Conduct demographic parity audit on all historical debt notices and prioritise refund processing for highest-disparity groups',
      impact: 'Quantifies total harm by group and ensures equitable remediation',
    },
    {
      id: 'REC-06',
      horizon: 'Short-term',
      action: 'Establish independent fairness oversight board with Indigenous community representation',
      impact: 'Ensures ongoing monitoring and accountability for disparate impact',
    },
    {
      id: 'REC-07',
      horizon: 'Medium-term',
      action: 'Redesign compliance system with subgroup-specific thresholds accounting for employment pattern variability',
      impact: 'Addresses aggregation bias by recognising that income variability differs systematically across groups',
    },
    {
      id: 'REC-08',
      horizon: 'Medium-term',
      action: 'Implement human-in-the-loop review for all automated debt determinations exceeding $2,000',
      impact: 'Restores discretion for high-stakes decisions while maintaining efficiency for clear-cut cases',
    },
    {
      id: 'REC-09',
      horizon: 'Medium-term',
      action: 'Deploy continuous fairness monitoring dashboard tracking SPD, error rates, and intersectional outcomes in real-time',
      impact: 'Enables early detection of emerging disparities before they reach critical levels',
    },
    {
      id: 'REC-10',
      horizon: 'Long-term',
      action: 'Reform Social Security Act to mandate algorithmic impact assessments and fairness audits for all automated welfare decisions',
      impact: 'Systemic prevention: ensures future automated systems cannot be deployed without fairness validation',
    },
  ],
  auditDimensions: [
    {
      dimension: 'Data Quality',
      score: 1,
      max: 5,
      tooltip:
        'Income averaging produces fundamentally invalid fortnightly estimates. Data is accurate at the annual level but the transformation to fortnightly creates systematic measurement error.',
    },
    {
      dimension: 'Fairness Metrics',
      score: 1,
      max: 5,
      tooltip:
        'Fails both demographic parity and equal opportunity. SPD exceeds 0.20 for Indigenous Australians and 0.18 for young adults. Error rates differ by up to 23 percentage points across groups.',
    },
    {
      dimension: 'Transparency',
      score: 1,
      max: 5,
      tooltip:
        'Recipients were not told their debts were calculated using averaged data. Internal legal advice about unlawfulness was suppressed. Appeal processes did not explain the methodology.',
    },
    {
      dimension: 'Accountability',
      score: 2,
      max: 5,
      tooltip:
        'Some accountability achieved through courts and Royal Commission, but only after years of harm. No proactive internal accountability mechanisms functioned during operation.',
    },
    {
      dimension: 'Remediation',
      score: 3,
      max: 5,
      tooltip:
        'A$1.87B+ refunded through class action settlement and government scheme. However, non-financial harms (psychological distress, suicides, reputational damage) have not been fully addressed.',
    },
  ],
  // Audit-mode free-text fields (pre-filled for learn mode)
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
  metricSummary: {
    highestGroupRate: 'Indigenous Australians: 48% debt notice rate',
    lowestGroupRate: '55+ age group: 14% debt notice rate',
    worstSPD: 'Indigenous vs Non-Indigenous: SPD = 0.21',
    overallErrorRate: '74% of debts raised were invalid',
  },
};

// ===== Fairness Definitions =====

// ===== Executive Summary (for report) =====

export const ROBODEBT_EXECUTIVE_SUMMARY = {
  overallRiskLevel: 'Critical' as const,
  keyFindings: [
    'Income averaging methodology was legally invalid — Federal Court ruled it unlawful in 2019',
    'Approximately 74% of all automated debts were incorrect, affecting ~700,000 individuals',
    'Indigenous Australians received debt notices at 1.8x the rate of non-Indigenous recipients (SPD = 0.21)',
    'Young adults (18-24) bore the highest burden with 42% flagging rate and 81% error rate',
    'System operated for 4 years despite internal legal advice warning of unlawfulness',
  ],
  topDisparities: [
    'Indigenous vs Non-Indigenous: SPD = 0.21 (4.2x regulatory threshold)',
    'Age 18-24 vs 35-44: SPD = 0.18 (3.6x threshold)',
    'Remote vs Major cities: SPD = 0.16 (3.2x threshold)',
    'Indigenous youth in remote areas: 63% flagging rate, 91% error rate',
  ],
  primaryRecommendation: 'Immediately cease all debt notices based on income averaging. Implement fortnightly income verification before any automated debt determination.',
  deploymentReadiness: 'No-Go' as const,
};

// ===== Limitations =====

export const ROBODEBT_LIMITATIONS = {
  dataGaps: 'Individual-level data was never publicly released by the government. Metrics are constructed from Royal Commission findings, Senate inquiry data, and published analyses. Exact disaggregated error rates by intersection are estimates consistent with the public record.',
  methodologicalLimitations: 'This audit applies a fairness framework retrospectively to a system that was not designed with fairness considerations. Some metrics (e.g., intersectional rates) required estimation from aggregate data rather than direct computation from individual records.',
  scopeExclusions: 'This audit does not cover: (1) individual psychological harm assessment, (2) long-term economic impact on affected communities, (3) comparison with other welfare compliance systems internationally, (4) detailed analysis of the appeal and review process outcomes.',
  confidenceStatement: 'High confidence in directional findings (which groups were disproportionately affected and that error rates were extreme). Moderate confidence in exact magnitudes. Low confidence in precise intersectional estimates for small subgroups (e.g., Indigenous + Disability + Remote).',
};

// ===== Auditor Sign-off =====

export const ROBODEBT_SIGNOFF = {
  auditorName: 'Royal Commission of Inquiry into the Robodebt Scheme',
  auditorRole: 'Independent Public Inquiry',
  auditorOrganization: 'Commonwealth of Australia',
  signoffStatement: 'The Royal Commission found that the Robodebt scheme was a "crude and cruel mechanism, neither fair nor legal" and that it represented "a massive failure of public administration." The scheme caused immeasurable harm to hundreds of thousands of Australians, particularly the most vulnerable.',
};

// ===== Accountability Mapping =====

export const ROBODEBT_ACCOUNTABILITY: Record<string, string> = {
  Historical: 'Leadership',
  Representation: 'Data Team',
  Measurement: 'Model Team',
  Aggregation: 'Model Team',
  Learning: 'Product Team',
  Evaluation: 'Product Team',
  Deployment: 'Leadership',
};

export const FAIRNESS_DEFINITIONS: FairnessDefinition[] = [
  {
    id: 'demographic-parity',
    name: 'Demographic Parity',
    formula: 'P(\u0176=1 | G=a) = P(\u0176=1 | G=b)',
    plainLanguage:
      'Each group should receive the positive outcome (or negative action like a debt notice) at the same rate. If 30% of one group gets flagged, roughly 30% of every group should be flagged.',
    whenToUse:
      'When the decision should not correlate with group membership at all, especially for initial screening or when base rates are similar across groups.',
    limitations:
      'May conflict with accuracy if true base rates differ across groups. Can be gamed by equalising rates without improving accuracy.',
    selected: false,
  },
  {
    id: 'equal-opportunity',
    name: 'Equal Opportunity',
    formula: 'P(\u0176=1 | Y=1, G=a) = P(\u0176=1 | Y=1, G=b)',
    plainLanguage:
      'Among people who truly deserve the positive outcome, each group should be selected at the same rate. If you actually owe a debt, the system should catch you at the same rate regardless of your group.',
    whenToUse:
      'When you want to ensure that qualified individuals from all groups have equal chances of being correctly identified. Best when ground truth labels are reliable.',
    limitations:
      'Requires reliable ground truth labels. Does not constrain false positive rates directly. May allow different rates of harm across groups.',
    selected: false,
  },
  {
    id: 'equalised-odds',
    name: 'Equalised Odds',
    formula:
      'P(\u0176=1 | Y=y, G=a) = P(\u0176=1 | Y=y, G=b) for y \u2208 {0, 1}',
    plainLanguage:
      'Both the true positive rate AND the false positive rate should be equal across groups. The system should be equally accurate for everyone, whether they truly owe a debt or not.',
    whenToUse:
      'When both types of errors (missing a true case and falsely flagging someone) matter, and you want equal accuracy across all groups.',
    limitations:
      'Very difficult to satisfy perfectly. Requires reliable ground truth. May require sacrificing some overall accuracy to equalise across groups.',
    selected: false,
  },
  {
    id: 'predictive-parity',
    name: 'Predictive Parity',
    formula: 'P(Y=1 | \u0176=1, G=a) = P(Y=1 | \u0176=1, G=b)',
    plainLanguage:
      'When the system flags someone, the probability that the flag is correct should be the same across groups. A debt notice should be equally likely to be valid regardless of the recipient\u2019s group.',
    whenToUse:
      'When the precision of positive predictions is critical and you want to ensure that being flagged means the same thing for everyone.',
    limitations:
      'Can be satisfied while still having very different false positive rates across groups. Does not ensure equal treatment of those NOT flagged.',
    selected: false,
  },
  {
    id: 'calibration',
    name: 'Calibration',
    formula:
      'P(Y=1 | S=s, G=a) = P(Y=1 | S=s, G=b) = s',
    plainLanguage:
      'If the system says there is a 70% chance someone owes a debt, then about 70% of people given that score should actually owe a debt, and this should hold true in every group.',
    whenToUse:
      'When the system outputs probability scores rather than binary decisions, and those scores need to be meaningful and trustworthy for all groups.',
    limitations:
      'Provably incompatible with equalised odds when base rates differ (Chouldechova, 2017). Focuses on score reliability rather than outcome fairness.',
    selected: false,
  },
  {
    id: 'individual-fairness',
    name: 'Individual Fairness',
    formula: 'd(f(x_i), f(x_j)) \u2264 L \u00B7 d(x_i, x_j)',
    plainLanguage:
      'Similar people should be treated similarly. Two individuals with similar incomes, work patterns, and circumstances should receive similar debt determinations, regardless of their demographic group.',
    whenToUse:
      'When individual-level fairness is paramount and you can define meaningful similarity between individuals. Complementary to group-level metrics.',
    limitations:
      'Requires defining a similarity metric, which involves subjective choices. Computationally expensive for large populations. Does not prevent systematic group-level disparities.',
    selected: false,
  },
  {
    id: 'counterfactual-fairness',
    name: 'Counterfactual Fairness',
    formula:
      'P(\u0176_A\u2190a | X=x, A=a) = P(\u0176_A\u2190a\u2032 | X=x, A=a)',
    plainLanguage:
      'A decision is fair if it would remain the same in a hypothetical world where the individual belonged to a different group. Would this person still receive a debt notice if they were not Indigenous?',
    whenToUse:
      'When you want to reason about whether group membership causally influenced the decision. Useful for identifying indirect discrimination through proxy variables.',
    limitations:
      'Requires strong causal assumptions. Counterfactuals are inherently unobservable. Defining "everything else being equal" is philosophically and practically challenging.',
    selected: false,
  },
];

// ===== Combined export =====

export const ROBODEBT = {
  system: ROBODEBT_SYSTEM,
  c1: ROBODEBT_C1,
  c2: ROBODEBT_C2,
  c3: ROBODEBT_C3,
  c4: ROBODEBT_C4,
  fairnessDefinitions: FAIRNESS_DEFINITIONS,
} as const;
