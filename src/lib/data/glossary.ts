import type { GlossaryMap } from '@/types/glossary';

export const GLOSSARY: GlossaryMap = {
  spd: {
    term: 'Statistical Parity Difference',
    short: 'How much the rate of an outcome differs between two groups.',
    long: "Calculated by subtracting one group's outcome rate from another. A value of 0 means identical rates. Values above 0.05 are generally considered meaningful disparities.",
    citation: 'Feldman et al. 2015',
  },
  demographicParity: {
    term: 'Demographic Parity',
    short: 'Every group should receive a given outcome at the same rate.',
    long: 'A fairness definition that compares outcome rates without looking at whether individuals "deserve" the outcome. Useful when outcome labels are unreliable or when equal treatment is legally required.',
  },
  equalOpportunity: {
    term: 'Equal Opportunity',
    short: 'Among people who truly qualify, every group should be detected equally.',
    long: 'Focuses on the "true positive rate" — of all the people who actually qualify, what fraction does the system correctly identify? Requires trustworthy ground-truth labels.',
  },
  calibration: {
    term: 'Calibration',
    short: 'A risk score should mean the same thing for everyone.',
    long: 'If the system says there is a 70% chance, it should actually be right 70% of the time, regardless of what group the person belongs to.',
    citation: 'Pleiss et al. 2017',
  },
  baseRate: {
    term: 'Base Rate',
    short: 'How common an outcome actually is within a particular group.',
    long: 'Different groups may have genuinely different rates of an outcome. When base rates differ, some fairness definitions become mathematically impossible to satisfy simultaneously.',
  },
  confidenceInterval: {
    term: 'Confidence Interval (CI)',
    short: 'A range that likely contains the true value.',
    long: 'A 95% confidence interval means: if we repeated this analysis many times, 95% of the resulting intervals would contain the true value. Wider intervals mean more uncertainty.',
  },
  bootstrapCI: {
    term: 'Bootstrap Confidence Interval',
    short: 'Estimating uncertainty by re-sampling data thousands of times.',
    long: 'Instead of relying on mathematical formulas, we re-sample our data (with replacement) thousands of times and see how much the result varies. This gives a realistic uncertainty range.',
  },
  permutationTest: {
    term: 'Permutation Test',
    short: 'Could this difference have occurred by chance?',
    long: 'Randomly shuffles group labels many times to see what differences arise purely from luck. If the real difference is bigger than almost all random shuffles, it is probably real.',
  },
  bhCorrection: {
    term: 'Benjamini-Hochberg Correction',
    short: 'Avoiding false alarms when running many tests at once.',
    long: 'When you test many groups simultaneously, some will look significant by chance alone. This correction adjusts the significance threshold so you do not chase phantom disparities.',
  },
  falsePositive: {
    term: 'False Positive',
    short: 'The system says something is true when it is actually false.',
    long: 'In Robodebt: a debt notice sent to someone who does not actually owe money. The consequences included financial hardship, mental health crises, and documented deaths.',
  },
  proxyVariable: {
    term: 'Proxy Variable',
    short: 'A data feature that stands in for a protected characteristic.',
    long: 'Even if you remove race or gender from the data, other features (like postcode, employment type, or income pattern) can be closely correlated with them, reproducing discrimination indirectly.',
  },
  intersectionality: {
    term: 'Intersectionality',
    short: 'Belonging to multiple disadvantaged groups creates compounding harm.',
    long: 'A young First Nations person in a remote area faces greater disadvantage than the sum of being young + being First Nations + being remote. The combination creates unique barriers.',
    citation: 'Crenshaw 1989',
  },
  feedbackLoop: {
    term: 'Feedback Loop',
    short: "The system's outputs make the problem worse over time.",
    long: "Example: receiving a debt notice causes stress, which leads to missing reporting requirements, which triggers another debt notice. The system creates the very problem it claims to detect.",
  },
  incomeAveraging: {
    term: 'Income Averaging',
    short: "Robodebt's method: annual income divided by 26 fortnights.",
    long: "Takes someone's total income for the year and divides by 26 to estimate fortnightly income. This is fundamentally wrong for anyone whose income varies — casual workers, seasonal workers, or anyone with an irregular schedule.",
  },
  circularLabeling: {
    term: 'Circular Labeling',
    short: 'The system that decides outcomes also generates the "evidence."',
    long: 'In Robodebt, the income averaging algorithm both generated the debt amount and served as the evidence that the debt was real. There was no independent verification — the system was judge, jury, and evidence.',
  },
  reversalOfOnus: {
    term: 'Reversal of Onus',
    short: "You have to prove you don't owe, instead of them proving you do.",
    long: "Normally, the entity claiming a debt must prove it. Robodebt flipped this: recipients had to prove they didn't owe, using income records from up to 6 years ago that many people no longer had.",
  },
  impossibilityResult: {
    term: 'Impossibility Result',
    short: 'Certain fairness goals cannot all be achieved simultaneously.',
    long: 'Mathematicians proved that when different groups have different base rates, you cannot achieve calibration, balance for positives, and balance for negatives all at the same time. Trade-offs are mathematically mandatory.',
    citation: 'Chouldechova 2017; Kleinberg et al. 2016',
  },
  balancePlus: {
    term: 'Balance+ (Balance for Positives)',
    short: 'Equal average scores for true positives across groups.',
    long: 'Among people who truly have the condition being measured, every group should receive the same average risk score. Part of the impossibility triangle.',
  },
  balanceMinus: {
    term: 'Balance\u2212 (Balance for Negatives)',
    short: 'Equal average scores for true negatives across groups.',
    long: 'Among people who do NOT have the condition, every group should receive the same average risk score. Part of the impossibility triangle.',
  },
  effectSize: {
    term: 'Effect Size',
    short: 'How big a difference is in practical terms.',
    long: 'A statistically significant result might be tiny in practice. Effect size measures the magnitude of a disparity independently of sample size. Values above 0.05 SPD are generally considered meaningful.',
  },
  bayesianAnalysis: {
    term: 'Bayesian Analysis',
    short: 'Combining prior knowledge with data to estimate probabilities.',
    long: 'Starts with what we already know (a "prior") and updates it with new data to produce a refined estimate. Particularly useful for small subgroups where traditional statistics lack power.',
  },
  counterfactualFairness: {
    term: 'Counterfactual Fairness',
    short: 'Would the outcome change if group membership changed?',
    long: 'Imagines a world where everything about a person is the same except their group membership. If the outcome would change, the system is not counterfactually fair. Requires a causal model.',
  },
  individualFairness: {
    term: 'Individual Fairness',
    short: 'Similar people should get similar outcomes.',
    long: 'Two people who are alike in all relevant ways should receive similar decisions, regardless of which groups they belong to. The challenge is defining "similar in relevant ways."',
  },
  equalizedOdds: {
    term: 'Equalized Odds',
    short: 'Both catch rate and false alarm rate equal across groups.',
    long: 'Requires that the true positive rate AND the false positive rate are the same for every group. Stronger than Equal Opportunity (which only requires equal true positive rates).',
    citation: 'Hardt et al. 2016',
  },
  predictiveParity: {
    term: 'Predictive Parity',
    short: 'When flagged, probability of correctness equal across groups.',
    long: 'If the system flags someone, the probability that it is correct should be the same regardless of group. Also called "predictive value parity."',
  },
  fpr: {
    term: 'False Positive Rate (FPR)',
    short: 'Fraction of truly negative cases incorrectly flagged.',
    long: 'Of all the people who should NOT have been flagged, what proportion was incorrectly flagged? A high FPR means the system generates many false alarms. Also called the "false alarm rate."',
  },
  tpr: {
    term: 'True Positive Rate (TPR)',
    short: 'Fraction of truly positive cases correctly identified.',
    long: 'Of all the people who genuinely have the condition, what proportion does the system correctly detect? Also called "sensitivity" or "recall." A TPR of 0.95 means the system catches 95% of true cases.',
  },
  falseNegative: {
    term: 'False Negative',
    short: 'System misses a case it should have caught.',
    long: 'A person who truly has the condition (e.g., truly owes a debt) but the system fails to flag them. The cost depends on context — in medical screening, a false negative can be fatal.',
  },
  roc: {
    term: 'ROC Curve',
    short: 'Plot showing trade-off between catch rate and false alarms.',
    long: 'Receiver Operating Characteristic curve. Plots the True Positive Rate against the False Positive Rate at every possible decision threshold. A curve hugging the top-left corner indicates strong discrimination ability.',
  },
  auc: {
    term: 'AUC (Area Under the Curve)',
    short: 'Single number summarising accuracy across thresholds.',
    long: 'Area Under the ROC Curve. Ranges from 0.5 (random chance) to 1.0 (perfect). An AUC of 0.5 means the model is no better than flipping a coin; 0.9+ is considered excellent discrimination.',
  },
  ecoa: {
    term: 'Equal Credit Opportunity Act (ECOA)',
    short: 'US federal law prohibiting discrimination in credit decisions.',
    long: 'Prohibits creditors from discriminating against applicants on the basis of race, color, religion, national origin, sex, marital status, or age. Applies to any system that influences credit-related decisions and requires adverse action notices.',
  },
  gdprArt22: {
    term: 'GDPR Article 22',
    short: 'Right not to be subject to solely automated decisions with legal effects.',
    long: 'Under the EU General Data Protection Regulation, individuals have the right not to be subject to decisions based solely on automated processing that produce legal or similarly significant effects. Exceptions exist for contracts, legal authorisation, or explicit consent, but safeguards including human intervention must be available.',
  },
  euAiAct: {
    term: 'EU AI Act',
    short: 'Risk-based regulation of AI systems in the European Union.',
    long: 'Classifies AI systems by risk level (unacceptable, high, limited, minimal). High-risk systems — including those used in employment, credit, welfare, and law enforcement — must meet requirements for data quality, transparency, human oversight, accuracy, and robustness. Effective from 2025-2026.',
    citation: 'European Parliament 2024',
  },
  fourFifthsRule: {
    term: 'Four-Fifths (80%) Rule',
    short: 'A selection rate below 80% of the highest group rate signals adverse impact.',
    long: 'From the Uniform Guidelines on Employee Selection Procedures: if the selection rate for a protected group is less than four-fifths (80%) of the rate for the group with the highest rate, this is generally regarded as evidence of adverse impact. Example: if 60% of Group A is selected and 40% of Group B, the ratio is 40/60 = 0.67, which is below 0.80.',
    citation: 'EEOC Uniform Guidelines 1978',
  },
  algorithmicImpactAssessment: {
    term: 'Algorithmic Impact Assessment (AIA)',
    short: 'Structured evaluation of an automated system\'s potential effects before deployment.',
    long: 'A systematic process for evaluating the potential effects of an algorithmic system on individuals and communities. Covers accuracy, fairness, transparency, privacy, and accountability. Required by some jurisdictions (e.g., Canada\'s Directive on Automated Decision-Making) before deploying automated systems in government.',
  },
  disparateImpact: {
    term: 'Disparate Impact',
    short: 'A facially neutral practice that disproportionately affects a protected group.',
    long: 'Unlike disparate treatment, disparate impact does not require proof of discriminatory intent. A policy or algorithm that appears neutral but produces significantly different outcomes for protected groups can be challenged under disparate impact theory. The burden then shifts to the defendant to show the practice is justified by business necessity.',
    citation: 'Griggs v. Duke Power Co. 1971',
  },
  disparateTreatment: {
    term: 'Disparate Treatment',
    short: 'Intentional differential treatment based on a protected characteristic.',
    long: 'Occurs when a decision-maker treats someone differently because of their membership in a protected class. In algorithmic systems, this can occur when protected attributes are directly used as features, or when the system is designed with group-specific rules that disadvantage certain groups.',
  },
  rightToExplanation: {
    term: 'Right to Explanation',
    short: 'The right to understand how an automated decision was made.',
    long: 'An emerging legal principle that individuals affected by automated decisions should be able to receive a meaningful explanation of the logic, significance, and consequences of the decision. Supported by GDPR Articles 13-15 and 22, and increasingly recognised in AI-specific legislation worldwide.',
  },
};
