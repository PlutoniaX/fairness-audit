'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuditStore } from '@/store/audit-store';
import { ROBODEBT_SYSTEM } from '@/lib/data/robodebt';
import { Clock, Lock, Check } from 'lucide-react';

const components = [
  {
    num: 1,
    title: 'Historical Context Assessment',
    href: '/c1-historical-context',
    color: 'var(--c1)',
    purpose: 'Examine the historical and institutional context to understand how discrimination patterns reach the automated system.',
    time: '2-4 hours',
    prereqs: 'None',
  },
  {
    num: 2,
    title: 'Fairness Definition Selection',
    href: '/c2-fairness-definitions',
    color: 'var(--c2)',
    purpose: 'Select appropriate fairness definitions given label reliability, error impacts, and legal requirements.',
    time: '1-2 hours',
    prereqs: 'Requires C1',
  },
  {
    num: 3,
    title: 'Bias Source Identification',
    href: '/c3-bias-sources',
    color: 'var(--c3)',
    purpose: 'Systematically identify and prioritize the 7 types of bias using a structured taxonomy and scoring framework.',
    time: '1-2 hours',
    prereqs: 'Requires C1 + C2',
  },
  {
    num: 4,
    title: 'Fairness Metrics & Reporting',
    href: '/c4-fairness-metrics',
    color: 'var(--c4)',
    purpose: 'Quantify fairness disparities with statistical validation, visualization, and actionable recommendations.',
    time: '2-3 hours',
    prereqs: 'Requires C1 + C2 + C3',
  },
];

export default function OverviewPage() {
  const mode = useAuditStore(s => s.mode);
  const componentStatus = useAuditStore(s => s.componentStatus);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isLearn = !mounted || mode === 'learn';

  const prereqsMet: Record<number, boolean> = {
    1: true,
    2: componentStatus.c1 === 'complete',
    3: componentStatus.c1 === 'complete' && componentStatus.c2 === 'complete',
    4: componentStatus.c1 === 'complete' && componentStatus.c2 === 'complete' && componentStatus.c3 === 'complete',
  };

  const sys = ROBODEBT_SYSTEM;

  return (
    <div>
      <div className="mb-7">
        <h2 className="text-[1.6rem] font-bold tracking-tight">Fairness Audit Playbook</h2>
        <p className="text-muted-foreground mt-1.5 text-[0.92rem] max-w-[700px]">
          A structured methodology for auditing automated decision-making systems for fairness,
          applied to the Australian Robodebt case study.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-7">
        <div className="bg-card rounded-xl p-5 border border-border">
          <h4 className="text-[0.9rem] font-semibold mb-1.5">Learn Mode</h4>
          <p className="text-[0.84rem] text-muted-foreground leading-relaxed">
            Follow along with the Robodebt case study. All worksheets are pre-filled with data from the Royal Commission findings.
            Understand the methodology by seeing a completed audit.
          </p>
        </div>
        <div className="bg-card rounded-xl p-5 border border-border">
          <h4 className="text-[0.9rem] font-semibold mb-1.5">Audit Mode</h4>
          <p className="text-[0.84rem] text-muted-foreground leading-relaxed">
            Conduct your own fairness audit. Blank worksheets with guidance text help you work through each component
            for your own system. Switch modes anytime using the toggle above.
          </p>
        </div>
      </div>

      {/* Getting Started panel (audit mode only) */}
      {!isLearn && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-6 mb-7">
          <h3 className="text-[1.05rem] font-semibold mb-4">Getting Started</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <span className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center flex-shrink-0 text-[0.82rem] font-bold text-indigo-600 dark:text-indigo-400">
                1
              </span>
              <div>
                <h4 className="text-[0.86rem] font-semibold mb-0.5">Set up AI (optional)</h4>
                <p className="text-[0.78rem] text-muted-foreground leading-relaxed">
                  Add an API key in{' '}
                  <Link href="/settings" className="text-indigo-500 underline hover:text-indigo-600">
                    Settings
                  </Link>{' '}
                  for AI-powered analysis assistance.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center flex-shrink-0 text-[0.82rem] font-bold text-indigo-600 dark:text-indigo-400">
                2
              </span>
              <div>
                <h4 className="text-[0.86rem] font-semibold mb-0.5">Start with Component 1</h4>
                <p className="text-[0.78rem] text-muted-foreground leading-relaxed">
                  Begin with Historical Context. Estimated 2-4 hours for a thorough analysis.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center flex-shrink-0 text-[0.82rem] font-bold text-indigo-600 dark:text-indigo-400">
                3
              </span>
              <div>
                <h4 className="text-[0.86rem] font-semibold mb-0.5">Work sequentially</h4>
                <p className="text-[0.78rem] text-muted-foreground leading-relaxed">
                  Each component builds on the previous. Your work auto-saves to your browser.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl p-6 border border-border shadow-sm mb-7 border-l-4 border-l-[var(--c4)]">
        <h3 className="text-[1.05rem] font-semibold mb-3">
          Case Study: Robodebt &mdash; Online Compliance Intervention
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { label: 'System', value: sys.name },
            { label: 'Operator', value: sys.operator },
            { label: 'Period', value: sys.period },
            { label: 'Scale', value: sys.scale },
            { label: 'Algorithm', value: sys.algorithm },
            { label: 'Outcome', value: sys.outcome },
          ].map(item => (
            <div key={item.label} className="text-[0.82rem]">
              <div className="font-semibold text-muted-foreground text-[0.72rem] uppercase tracking-wide">
                {item.label}
              </div>
              <div className="text-foreground mt-0.5">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      <h3 className="text-[1.1rem] font-semibold mb-1">Audit Components</h3>
      <p className="text-[0.86rem] text-muted-foreground mb-4">
        Work through each component sequentially. Each builds on the previous.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {components.map(comp => (
          <Link
            key={comp.num}
            href={comp.href}
            className={`bg-card rounded-xl p-5 border border-border hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer group ${
              !isLearn && !prereqsMet[comp.num] ? 'opacity-60' : ''
            }`}
            style={{ borderTopWidth: 4, borderTopColor: comp.color }}
          >
            <div className="text-[1.8rem] font-extrabold leading-none mb-2" style={{ color: comp.color }}>
              {comp.num}
            </div>
            <h4 className="text-[0.95rem] font-semibold mb-1.5">{comp.title}</h4>
            <p className="text-[0.82rem] text-muted-foreground leading-snug mb-3">
              {comp.purpose}
            </p>
            {/* Time estimate and prerequisites */}
            <div className="flex items-center gap-3 text-[0.75rem] text-muted-foreground mb-3">
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {comp.time}
              </span>
              <span>{comp.prereqs}</span>
              {!isLearn && prereqsMet[comp.num] && comp.num > 1 && (
                <span className="flex items-center gap-1 text-[var(--pass)]">
                  <Check size={12} /> Ready
                </span>
              )}
              {!isLearn && !prereqsMet[comp.num] && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Lock size={12} /> Complete C{comp.num - 1} first
                </span>
              )}
            </div>
            <span className="text-[0.82rem] font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: comp.color }}>
              Begin <span aria-hidden="true">&rarr;</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
