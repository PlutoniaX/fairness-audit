import { useMemo } from 'react';
import { useAuditStore } from '@/store/audit-store';

export interface ProgressItem {
  label: string;
  complete: boolean;
}

export interface ComponentProgress {
  completed: number;
  total: number;
  percent: number;
  items: ProgressItem[];
}

function isNonEmpty(value: string | undefined | null): boolean {
  return !!value && value.trim().length > 0;
}

export function useComponentProgress(component: 'c1' | 'c2' | 'c3' | 'c4'): ComponentProgress {
  const c1 = useAuditStore(s => s.c1);
  const c2 = useAuditStore(s => s.c2);
  const c3 = useAuditStore(s => s.c3);
  const c4 = useAuditStore(s => s.c4);

  return useMemo(() => {
    let items: ProgressItem[] = [];

    switch (component) {
      case 'c1':
        items = [
          { label: 'Domain context', complete: isNonEmpty(c1.domainContext.system) && isNonEmpty(c1.domainContext.decisionType) },
          { label: 'Data representation', complete: isNonEmpty(c1.dataRepresentation.dataSources) || isNonEmpty(c1.dataRepresentation.labelReliability) },
          { label: 'Technology transition', complete: isNonEmpty(c1.technologyTransition.priorProcess) },
          { label: 'Protected groups', complete: c1.protectedGroups.length > 0 },
          { label: 'Intersectional analysis', complete: c1.intersections.length > 0 },
          { label: 'Feedback loops', complete: c1.feedbackLoops.length > 0 },
        ];
        break;

      case 'c2': {
        const answered = c2.decisionFramework.filter(s => {
          if (Array.isArray(s.answer)) return s.answer.length > 0;
          return s.answer !== '';
        });
        items = [
          { label: 'Framework steps answered', complete: answered.length >= 3 },
          { label: 'All 7 steps complete', complete: answered.length === 7 },
          { label: 'Primary definition selected', complete: isNonEmpty(c2.primarySelection.definition) },
          { label: 'Trade-off documented', complete: isNonEmpty(c2.tradeoff.description) },
        ];
        break;
      }

      case 'c3': {
        const scored = c3.biasSources.filter(bs => bs.weightedScore > 1);
        items = [
          { label: 'At least 1 bias source scored', complete: scored.length >= 1 },
          { label: '3+ bias sources scored', complete: scored.length >= 3 },
          { label: '5+ bias sources scored', complete: scored.length >= 5 },
          { label: 'All 7 bias sources scored', complete: scored.length === 7 },
        ];
        break;
      }

      case 'c4':
        items = [
          { label: 'Metric summary', complete: isNonEmpty(c4.metricSummary.highestGroupRate) || isNonEmpty(c4.metricSummary.worstSPD) },
          { label: 'Group outcome rates', complete: isNonEmpty(c4.groupOutcomeRates) },
          { label: 'Error rate analysis', complete: isNonEmpty(c4.errorRateAnalysis) },
          { label: 'Intersectional analysis', complete: isNonEmpty(c4.intersectionalAnalysis) },
          { label: 'Recommendations', complete: isNonEmpty(c4.preDeploymentRecs) || isNonEmpty(c4.postDeploymentRecs) },
          { label: 'Audit dimension scores', complete: isNonEmpty(c4.auditDimensionScores) },
        ];
        break;
    }

    const completed = items.filter(i => i.complete).length;
    const total = items.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percent, items };
  }, [component, c1, c2, c3, c4]);
}
