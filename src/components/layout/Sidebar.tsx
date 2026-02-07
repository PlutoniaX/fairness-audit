'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuditStore } from '@/store/audit-store';
import {
  LayoutDashboard,
  History,
  Scale,
  Search,
  BarChart3,
  Settings,
  FileText,
  Lock,
  BookOpen,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Overview', icon: LayoutDashboard, section: 'overview' },
  { href: '/c1-historical-context', label: 'Historical Context', icon: History, section: 'c1', color: 'var(--c1)' },
  { href: '/c2-fairness-definitions', label: 'Fairness Definitions', icon: Scale, section: 'c2', color: 'var(--c2)' },
  { href: '/c3-bias-sources', label: 'Bias Sources', icon: Search, section: 'c3', color: 'var(--c3)' },
  { href: '/c4-fairness-metrics', label: 'Fairness Metrics', icon: BarChart3, section: 'c4', color: 'var(--c4)' },
];

export function Sidebar() {
  const pathname = usePathname();
  const componentStatus = useAuditStore(s => s.componentStatus);
  const mode = useAuditStore(s => s.mode);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isAudit = mounted && mode === 'audit';

  // Prerequisite check: in audit mode, show lock icons for incomplete prerequisites
  const prereqsMet: Record<string, boolean> = {
    c1: true, // no prerequisites
    c2: componentStatus.c1 === 'complete',
    c3: componentStatus.c1 === 'complete' && componentStatus.c2 === 'complete',
    c4: componentStatus.c1 === 'complete' && componentStatus.c2 === 'complete' && componentStatus.c3 === 'complete',
  };

  return (
    <aside className="fixed top-0 left-0 z-50 h-screen w-[260px] bg-[#1a1a2e] text-white flex flex-col max-md:w-14 max-md:hover:w-[260px] transition-all overflow-hidden group">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 border-b border-white/[0.08]">
        <h1 className="text-[1.1rem] font-bold tracking-tight max-md:opacity-0 max-md:group-hover:opacity-100 transition-opacity">
          Fairness Audit Playbook
        </h1>
        <p className="text-[0.72rem] text-white/50 mt-1 uppercase tracking-widest max-md:opacity-0 max-md:group-hover:opacity-100 transition-opacity">
          AI Ethics Module 1
        </p>
      </div>

      {/* Navigation */}
      <nav className="py-3 flex-1">
        <div className="text-[0.68rem] uppercase tracking-[0.1em] text-white/35 px-5 pb-2 font-semibold max-md:opacity-0 max-md:group-hover:opacity-100 transition-opacity">
          Components
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          const status = item.section !== 'overview' ? componentStatus[item.section] : null;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-5 py-2.5 text-[0.86rem] font-medium border-l-[3px] border-transparent transition-colors',
                'text-white/65 hover:text-white hover:bg-[#16213e]',
                isActive && 'bg-[#0f3460] text-white border-l-[#6db3f2]'
              )}
            >
              <Icon size={18} className="flex-shrink-0" style={item.color ? { color: item.color } : undefined} />
              <span className="max-md:opacity-0 max-md:group-hover:opacity-100 transition-opacity truncate">
                {item.label}
              </span>
              {status === 'complete' && (
                <span className="ml-auto w-2 h-2 rounded-full bg-[var(--pass)] flex-shrink-0 max-md:hidden max-md:group-hover:block" />
              )}
              {status === 'in-progress' && (
                <span className="ml-auto w-2 h-2 rounded-full bg-[var(--warn)] flex-shrink-0 max-md:hidden max-md:group-hover:block" />
              )}
              {isAudit && item.section !== 'overview' && !prereqsMet[item.section] && (
                <Lock size={14} className="ml-auto text-white/30 flex-shrink-0 max-md:hidden max-md:group-hover:block" />
              )}
            </Link>
          );
        })}

        <div className="mt-4 text-[0.68rem] uppercase tracking-[0.1em] text-white/35 px-5 pb-2 font-semibold max-md:opacity-0 max-md:group-hover:opacity-100 transition-opacity">
          System
        </div>
        <Link
          href="/report"
          className={cn(
            'flex items-center gap-2.5 px-5 py-2.5 text-[0.86rem] font-medium border-l-[3px] border-transparent transition-colors',
            'text-white/65 hover:text-white hover:bg-[#16213e]',
            pathname === '/report' && 'bg-[#0f3460] text-white border-l-[#6db3f2]'
          )}
        >
          <FileText size={18} className="flex-shrink-0" />
          <span className="max-md:opacity-0 max-md:group-hover:opacity-100 transition-opacity">
            Report
          </span>
        </Link>
        <Link
          href="/methodology"
          className={cn(
            'flex items-center gap-2.5 px-5 py-2.5 text-[0.86rem] font-medium border-l-[3px] border-transparent transition-colors',
            'text-white/65 hover:text-white hover:bg-[#16213e]',
            pathname === '/methodology' && 'bg-[#0f3460] text-white border-l-[#6db3f2]'
          )}
        >
          <BookOpen size={18} className="flex-shrink-0" />
          <span className="max-md:opacity-0 max-md:group-hover:opacity-100 transition-opacity">
            Methodology
          </span>
        </Link>
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-2.5 px-5 py-2.5 text-[0.86rem] font-medium border-l-[3px] border-transparent transition-colors',
            'text-white/65 hover:text-white hover:bg-[#16213e]',
            pathname === '/settings' && 'bg-[#0f3460] text-white border-l-[#6db3f2]'
          )}
        >
          <Settings size={18} className="flex-shrink-0" />
          <span className="max-md:opacity-0 max-md:group-hover:opacity-100 transition-opacity">
            Settings
          </span>
        </Link>
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/[0.08] text-[0.72rem] text-white/30 max-md:opacity-0 max-md:group-hover:opacity-100 transition-opacity">
        <div className="text-[0.78rem] text-white/60 font-medium mb-1">
          Robodebt Case Study
        </div>
        Australia 2015–2019
      </div>
    </aside>
  );
}
