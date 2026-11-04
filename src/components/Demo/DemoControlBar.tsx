import React from 'react';
import {
  MessageSquarePlus,
  Tv,
  X,
  ShieldAlert,
  ShieldCheck,
  BarChart2,
  CheckCircle,
} from 'lucide-react';
import { useWatch } from '../../context/WatchContext';
import { formatBall } from '../../types/cricket';

export const DemoControlBar: React.FC = () => {
  const {
    isDemoMode,
    setIsDemoMode,
    advanceBall,
    triggerDemoAlexSpoiler,
    triggerDemoAdvanceToAlex,
    triggerDemoUnreadableHold,
    triggerDemoSuspiciousRejected,
    triggerDemoValidRecovery,
    setIsEvaluationModalOpen,
    viewerBall,
    unreadLockedCount,
    syncStatus,
  } = useWatch();

  if (!isDemoMode) return null;

  return (
    <div className="sticky top-[57px] z-30 w-full border-b border-[#DCE5EF] bg-white/95 px-3 py-2 text-xs shadow-xs backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
        {/* Left: Demo badge */}
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1769AA] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#1769AA]"></span>
          </span>
          <div className="flex items-center gap-1.5">
            <span className="font-black tracking-wide uppercase text-[#0B4F83]">
              Interactive Match Demo
            </span>
            <span className="hidden md:inline text-[#475569] font-mono-numbers">
              (Viewer: Over {formatBall(viewerBall)} • State:{' '}
              <strong className="text-[#111111]">{syncStatus}</strong> • {unreadLockedCount} locked)
            </span>
          </div>
        </div>

        {/* Center: Step-by-Step Scenario Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Step 1: Alex sends spoiler */}
          <button
            onClick={triggerDemoAlexSpoiler}
            className="flex items-center gap-1 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1 font-semibold text-sky-800 hover:bg-sky-100 transition shadow-xs"
            title="Viewer at 17.2: Alex sends a simulated spoiler tagged at Over 17.4 (stays locked)"
          >
            <MessageSquarePlus className="h-3 w-3 text-sky-600" />
            <span>1. Alex Spoiler (17.4)</span>
          </button>

          {/* Step 2: Viewer catches up and unlocks message */}
          <button
            onClick={triggerDemoAdvanceToAlex}
            className="flex items-center gap-1 rounded-lg bg-[#1769AA] px-2.5 py-1 font-bold text-white hover:bg-[#0B4F83] transition shadow-xs"
            title="Advance viewer to Over 17.4 with confirmed valid reading: Alex's message unlocks!"
          >
            <CheckCircle className="h-3 w-3" />
            <span>2. Advance & Unlock (17.4)</span>
          </button>

          {/* Step 3: Unreadable / Commercial triggers HOLD */}
          <button
            onClick={triggerDemoUnreadableHold}
            className="flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 font-semibold text-amber-800 hover:bg-amber-100 transition shadow-xs"
            title="Simulate TV commercial: triggers HOLD, pending message at 17.5 stays locked"
          >
            <Tv className="h-3 w-3 text-amber-600" />
            <span>3. Trigger HOLD (17.5)</span>
          </button>

          {/* Step 4: Block Replay Reading */}
          <button
            onClick={triggerDemoSuspiciousRejected}
            className="flex items-center gap-1 rounded-lg border border-rose-300 bg-rose-50 px-2.5 py-1 font-semibold text-rose-800 hover:bg-rose-100 transition shadow-xs"
            title="Replay shield blocks backward delivery (Over 16.2)"
          >
            <ShieldAlert className="h-3 w-3 text-rose-600" />
            <span>4. Block Replay Spoiler</span>
          </button>

          {/* Step 5: Valid Recovery */}
          <button
            onClick={triggerDemoValidRecovery}
            className="flex items-center gap-1 rounded-lg border border-[#1769AA]/30 bg-[#EAF3FB] px-2.5 py-1 font-semibold text-[#0B4F83] hover:bg-[#d8eaf7] transition shadow-xs"
            title="A new valid reading (Over 17.5) is accepted: status LIVE restored and pending message released!"
          >
            <ShieldCheck className="h-3 w-3 text-[#1769AA]" />
            <span>5. Recover LIVE & Release</span>
          </button>

          {/* Match Sync Status Panel Trigger */}
          <button
            onClick={() => setIsEvaluationModalOpen(true)}
            className="flex items-center gap-1 rounded-lg border border-[#DCE5EF] bg-[#F5F8FC] px-2.5 py-1 font-bold text-[#0B4F83] hover:bg-[#EAF3FB] transition shadow-xs"
            title="View live match sync status"
          >
            <BarChart2 className="h-3 w-3 text-[#1769AA]" />
            <span>Match Sync Status</span>
          </button>

          {/* Tick 1 ball */}
          <button
            onClick={advanceBall}
            className="rounded-lg border border-[#DCE5EF] bg-white px-2 py-1 font-semibold text-[#111111] hover:bg-[#F5F8FC] shadow-xs"
            title="Advance 1 ball"
          >
            +1 Ball
          </button>
        </div>

        {/* Exit demo */}
        <button
          onClick={() => setIsDemoMode(false)}
          className="text-[#475569] hover:text-[#111111] p-1 rounded transition"
          title="Exit Interactive Demo"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
