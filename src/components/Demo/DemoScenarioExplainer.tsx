import React, { useState } from 'react';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  BarChart2,
} from 'lucide-react';
import { useWatch } from '../../context/WatchContext';
import { formatBall } from '../../types/cricket';

export const DemoScenarioExplainer: React.FC = () => {
  const {
    isDemoMode,
    viewerBall,
    syncStatus,
    unreadLockedCount,
    triggerDemoAlexSpoiler,
    triggerDemoAdvanceToAlex,
    triggerDemoUnreadableHold,
    triggerDemoSuspiciousRejected,
    triggerDemoValidRecovery,
    setIsEvaluationModalOpen,
  } = useWatch();
  const [isOpen, setIsOpen] = useState(true);

  if (!isDemoMode) return null;

  return (
    <div className="rounded-2xl border border-[#DCE5EF] bg-white p-4 text-xs shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#1769AA]" />
          <h3 className="font-extrabold text-[#111111] uppercase tracking-wider text-xs">
            Interactive Walkthrough: 5-Step Spoiler Shielding Tour
          </h3>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-[#475569] hover:text-[#111111] transition"
        >
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-3 space-y-3 text-slate-700 leading-relaxed border-t border-[#DCE5EF] pt-3">
          {/* Simulated Disclaimer */}
          <div className="rounded-xl border border-sky-200 bg-sky-50 p-2.5 text-[11px] text-sky-900 flex items-start gap-2">
            <HelpCircle className="h-4 w-4 shrink-0 text-sky-700 mt-0.5" />
            <div>
              <strong className="text-[#111111]">Simulated Match Stream:</strong> In this interactive preview, friend chat streams are simulated with varying broadcast delays to demonstrate how delivery-tagged messages remain locked until your broadcast catches up.
            </div>
          </div>

          {/* Interactive Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 pt-1">
            {/* Step 1 */}
            <div className="rounded-xl border border-[#DCE5EF] bg-[#F5F8FC] p-3 flex flex-col justify-between shadow-2xs">
              <div>
                <span className="rounded bg-sky-100 border border-sky-200 text-sky-800 font-bold px-1.5 py-0.5 text-[9px]">
                  STEP 1
                </span>
                <h4 className="mt-1 font-bold text-[#111111] text-xs">Alex Sends Spoiler</h4>
                <p className="mt-1 text-[11px] text-[#475569]">
                  Viewer is at <strong className="text-[#111111]">Over 17.2</strong>. Alex sends a message tagged at <strong className="text-[#0B4F83]">Over 17.4</strong>. Message remains securely locked!
                </p>
              </div>
              <button
                type="button"
                onClick={triggerDemoAlexSpoiler}
                className="mt-2.5 rounded-lg border border-sky-200 bg-sky-50 px-2 py-1 text-[10px] font-bold text-sky-800 hover:bg-sky-100 shadow-2xs"
              >
                1. Send Alex (17.4)
              </button>
            </div>

            {/* Step 2 */}
            <div className="rounded-xl border border-[#DCE5EF] bg-[#F5F8FC] p-3 flex flex-col justify-between shadow-2xs">
              <div>
                <span className="rounded bg-[#EAF3FB] border border-[#1769AA]/30 text-[#0B4F83] font-bold px-1.5 py-0.5 text-[9px]">
                  STEP 2
                </span>
                <h4 className="mt-1 font-bold text-[#111111] text-xs">Viewer Catches Up</h4>
                <p className="mt-1 text-[11px] text-[#475569]">
                  Viewer stream advances to <strong className="text-[#111111]">Over 17.4</strong> with a valid confirmed reading. Alex’s message smoothly unlocks!
                </p>
              </div>
              <button
                type="button"
                onClick={triggerDemoAdvanceToAlex}
                className="mt-2.5 rounded-lg bg-[#1769AA] px-2 py-1 text-[10px] font-bold text-white hover:bg-[#0B4F83] shadow-xs"
              >
                2. Advance & Unlock
              </button>
            </div>

            {/* Step 3 */}
            <div className="rounded-xl border border-[#DCE5EF] bg-[#F5F8FC] p-3 flex flex-col justify-between shadow-2xs">
              <div>
                <span className="rounded bg-amber-100 border border-amber-300 text-amber-900 font-bold px-1.5 py-0.5 text-[9px]">
                  STEP 3
                </span>
                <h4 className="mt-1 font-bold text-[#111111] text-xs">Unreadable TV / HOLD</h4>
                <p className="mt-1 text-[11px] text-[#475569]">
                  Commercial airs. System enters <strong className="text-amber-700">HOLD</strong>. A pending message at <strong className="text-[#111111]">17.5</strong> stays strictly locked!
                </p>
              </div>
              <button
                type="button"
                onClick={triggerDemoUnreadableHold}
                className="mt-2.5 rounded-lg border border-amber-300 bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-800 hover:bg-amber-100 shadow-2xs"
              >
                3. Trigger HOLD
              </button>
            </div>

            {/* Step 4 */}
            <div className="rounded-xl border border-[#DCE5EF] bg-[#F5F8FC] p-3 flex flex-col justify-between shadow-2xs">
              <div>
                <span className="rounded bg-rose-100 border border-rose-200 text-rose-800 font-bold px-1.5 py-0.5 text-[9px]">
                  STEP 4
                </span>
                <h4 className="mt-1 font-bold text-[#111111] text-xs">Block Replay Reading</h4>
                <p className="mt-1 text-[11px] text-[#475569]">
                  Camera catches an old replay (Over 16.2). Same Second <strong className="text-rose-700">REJECTS</strong> the backward jump to keep your stream in sync.
                </p>
              </div>
              <button
                type="button"
                onClick={triggerDemoSuspiciousRejected}
                className="mt-2.5 rounded-lg border border-rose-300 bg-rose-50 px-2 py-1 text-[10px] font-bold text-rose-800 hover:bg-rose-100 shadow-2xs"
              >
                4. Simulate Replay Jump
              </button>
            </div>

            {/* Step 5 */}
            <div className="rounded-xl border border-[#DCE5EF] bg-[#F5F8FC] p-3 flex flex-col justify-between shadow-2xs">
              <div>
                <span className="rounded bg-[#EAF3FB] border border-[#1769AA]/30 text-[#0B4F83] font-bold px-1.5 py-0.5 text-[9px]">
                  STEP 5
                </span>
                <h4 className="mt-1 font-bold text-[#111111] text-xs">Valid Recovery & Release</h4>
                <p className="mt-1 text-[11px] text-[#475569]">
                  A new valid reading (Over 17.5) is accepted. Status <strong className="text-[#0B4F83]">LIVE</strong> restored; pending message evaluated and released!
                </p>
              </div>
              <button
                type="button"
                onClick={triggerDemoValidRecovery}
                className="mt-2.5 rounded-lg border border-[#1769AA]/30 bg-[#EAF3FB] px-2 py-1 text-[10px] font-bold text-[#0B4F83] hover:bg-[#d8eaf7] shadow-2xs"
              >
                5. Recover LIVE & Release
              </button>
            </div>
          </div>

          {/* Current State Indicator */}
          <div className="rounded-xl bg-[#F5F8FC] p-2.5 border border-[#DCE5EF] flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[#475569]">Current Stream Position:</span>
              <span className="font-mono-numbers font-bold text-[#0B4F83]">
                Over {formatBall(viewerBall)}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-[#475569]">State:</span>
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase border ${
                  syncStatus === 'LIVE'
                    ? 'bg-[#EAF3FB] text-[#0B4F83] border-[#1769AA]/30'
                    : syncStatus === 'HOLD' || syncStatus === 'STALE'
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : syncStatus === 'REJECTED'
                    ? 'bg-rose-50 text-rose-800 border-rose-300'
                    : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                {syncStatus}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[#475569] font-mono-numbers">
                {unreadLockedCount} spoilers held
              </span>
              <button
                type="button"
                onClick={() => setIsEvaluationModalOpen(true)}
                className="flex items-center gap-1 rounded-md border border-[#DCE5EF] bg-white px-2 py-1 text-[11px] font-bold text-[#0B4F83] hover:bg-[#EAF3FB] shadow-2xs"
              >
                <BarChart2 className="h-3 w-3 text-[#1769AA]" />
                <span>Match Sync Status</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
