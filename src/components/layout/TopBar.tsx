'use client';

import { ModeToggle } from './ModeToggle';
import { ProgressStepper } from './ProgressStepper';

export function TopBar() {
  return (
    <header className="fixed top-0 left-[260px] right-0 h-14 bg-white dark:bg-zinc-950 border-b border-border flex items-center justify-between px-8 z-40 max-md:left-14">
      <ProgressStepper />
      <ModeToggle />
    </header>
  );
}
