import type { AuditState } from '@/types/audit';

export function buildC1Summary(state: AuditState): string {
  const c1 = state.c1;
  const parts: string[] = [];

  if (c1.domainContext.system) {
    parts.push(`System: ${c1.domainContext.system}`);
    parts.push(`Decision type: ${c1.domainContext.decisionType}`);
    parts.push(`Affected population: ${c1.domainContext.affectedPopulation}`);
  }

  if (c1.riskMatrix.length > 0) {
    const critical = c1.riskMatrix.filter(r => r.classification === 'Critical');
    parts.push(`Risk matrix: ${c1.riskMatrix.length} risks identified (${critical.length} Critical)`);
    critical.forEach(r => parts.push(`  - ${r.risk} (score: ${r.score})`));
  }

  if (c1.protectedGroups.length > 0) {
    parts.push(`Protected groups: ${c1.protectedGroups.map(g => g.group).join(', ')}`);
  }

  if (c1.feedbackLoops.length > 0) {
    parts.push(`Feedback loops: ${c1.feedbackLoops.length} identified`);
    c1.feedbackLoops.forEach(fl => {
      parts.push(`  - Trigger: ${fl.trigger}`);
      parts.push(`    Mechanism: ${fl.mechanism}`);
      parts.push(`    Amplification: ${fl.amplification}`);
    });
  }

  if (c1.intersections.length > 0) {
    parts.push(`Intersectional groups: ${c1.intersections.length} identified`);
    c1.intersections.forEach(ix => {
      parts.push(`  - ${ix.groups} (priority ${ix.priority}): ${ix.pattern}`);
    });
  }

  if (c1.dataRepresentation.labelReliability) {
    parts.push(`Label reliability: ${c1.dataRepresentation.labelReliability}`);
  }

  return parts.length > 0 ? parts.join('\n') : 'No Component 1 data yet.';
}

export function buildC2Summary(state: AuditState): string {
  const c2 = state.c2;
  const parts: string[] = [];

  const answered = c2.decisionFramework.filter(s => {
    if (Array.isArray(s.answer)) return s.answer.length > 0;
    return s.answer !== '';
  });

  if (answered.length > 0) {
    parts.push('Decision framework answers:');
    answered.forEach(s => {
      const ans = Array.isArray(s.answer) ? s.answer.join(', ') : s.answer;
      parts.push(`  Step ${s.step}: ${s.question} → ${ans}`);
    });
  }

  if (c2.primarySelection.definition) {
    parts.push(`Primary definition: ${c2.primarySelection.definition} — ${c2.primarySelection.justification}`);
  }
  if (c2.secondarySelection.definition) {
    parts.push(`Secondary definition: ${c2.secondarySelection.definition} — ${c2.secondarySelection.justification}`);
  }

  return parts.length > 0 ? parts.join('\n') : 'No Component 2 data yet.';
}

export function buildC3Summary(state: AuditState): string {
  const c3 = state.c3;
  const parts: string[] = [];

  const scored = c3.biasSources.filter(bs => bs.weightedScore > 1);
  if (scored.length > 0) {
    parts.push('Bias sources (prioritized):');
    scored
      .sort((a, b) => b.weightedScore - a.weightedScore)
      .forEach(bs => {
        parts.push(`  - ${bs.type}: ${bs.weightedScore.toFixed(1)} (${bs.priority}) — ${bs.description || 'No description'}`);
      });
  }

  return parts.length > 0 ? parts.join('\n') : 'No Component 3 data yet.';
}

export function buildProgressiveContext(state: AuditState, currentComponent: string): string {
  const sections: string[] = [];

  if (['c2', 'c3', 'c4'].includes(currentComponent)) {
    sections.push('=== Component 1: Historical Context ===');
    sections.push(buildC1Summary(state));
  }

  if (['c3', 'c4'].includes(currentComponent)) {
    sections.push('\n=== Component 2: Fairness Definitions ===');
    sections.push(buildC2Summary(state));
  }

  if (currentComponent === 'c4') {
    sections.push('\n=== Component 3: Bias Sources ===');
    sections.push(buildC3Summary(state));

    // Surface C1 intersections for C4 analysis
    if (state.c1.intersections.length > 0) {
      sections.push('\n=== Intersectional Groups from C1 ===');
      state.c1.intersections.forEach(ix => {
        sections.push(`- ${ix.groups} (priority ${ix.priority}): ${ix.pattern}`);
      });
    }

    // Surface C1 feedback loops for C4 post-deployment recommendations
    if (state.c1.feedbackLoops.length > 0) {
      sections.push('\n=== Feedback Loops from C1 ===');
      state.c1.feedbackLoops.forEach(fl => {
        sections.push(`- Trigger: ${fl.trigger}`);
        sections.push(`  Mechanism: ${fl.mechanism}`);
        sections.push(`  Amplification: ${fl.amplification}`);
      });
    }
  }

  return sections.join('\n');
}
