import React from 'react';
import {
  Radio,
  Pause,
  Play,
  Camera,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useWatch } from '../../context/WatchContext';
import { formatBall } from '../../types/cricket';

export const ViewerSyncControl: React.FC = () => {
  const {
    viewerBall,
    syncStatus,
    isManualHold,
    confidence,
    lastSyncReason,
    advanceBall,
    rewindBall,
    toggleManualHold,
    setIsScoreboardModalOpen,
    unreadLockedCount,
  } = useWatch();

  return (
    <div className="rounded-2xl border border-[#DCE5EF] bg-white p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Current Stream Sync Status */}
        <div className="flex items-start sm:items-center gap-3">
          {/* Status Icon */}
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${
              syncStatus === 'LIVE'
                ? 'bg-[#EAF3FB] text-[#0B4F83] ring-1 ring-[#1769AA]/30'
                : syncStatus === 'HOLD' || syncStatus === 'STALE'
                ? 'bg-amber-50 text-amber-800 ring-1 ring-amber-300'
                : 'bg-rose-50 text-rose-800 ring-1 ring-rose-300'
            }`}
          >
            {syncStatus === 'LIVE' ? (
              <Radio className="h-5 w-5 animate-pulse text-[#1769AA]" />
            ) : syncStatus === 'HOLD' || syncStatus === 'STALE' ? (
              <Pause className="h-5 w-5 text-amber-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-rose-600" />
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">
                Your Stream Position
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase border ${
                  syncStatus === 'LIVE'
                    ? 'bg-[#EAF3FB] text-[#0B4F83] border-[#1769AA]/30'
                    : syncStatus === 'HOLD' || syncStatus === 'STALE'
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-rose-50 text-rose-800 border-rose-300'
                }`}
              >
                {syncStatus}
              </span>
              <span className="text-[11px] font-mono-numbers text-slate-500 font-medium">
                {confidence}% Confidence
              </span>
            </div>

            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-mono-numbers text-2xl font-black text-[#111111]">
                Over {formatBall(viewerBall)}
              </span>
              <span className="text-xs text-[#475569] font-medium">
                (Ball {viewerBall.ball} of 6)
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Rewind 1 ball */}
          <button
            onClick={rewindBall}
            className="flex items-center gap-1 rounded-xl border border-[#DCE5EF] bg-[#F5F8FC] px-3 py-2 text-xs font-bold text-[#111111] transition hover:bg-[#EAF3FB] hover:border-[#1769AA] hover:text-[#0B4F83] shadow-xs"
            title="Rewind 1 ball if your stream rewound or paused"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>-1 Ball</span>
          </button>

          {/* Advance 1 ball */}
          <button
            onClick={advanceBall}
            className="flex items-center gap-1 rounded-xl border border-[#DCE5EF] bg-[#F5F8FC] px-3 py-2 text-xs font-bold text-[#111111] transition hover:bg-[#EAF3FB] hover:border-[#1769AA] hover:text-[#0B4F83] shadow-xs"
            title="Advance 1 ball as live play continues"
          >
            <span>+1 Ball</span>
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Manual HOLD toggle */}
          <button
            onClick={toggleManualHold}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition shadow-xs ${
              isManualHold
                ? 'bg-amber-500 text-white shadow-md'
                : 'border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
            title="Engage HOLD if you pause TV or an ad plays"
          >
            {isManualHold ? (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Resume Sync</span>
              </>
            ) : (
              <>
                <Pause className="h-3.5 w-3.5" />
                <span>Hold Sync</span>
              </>
            )}
          </button>

          {/* Camera Scan Modal trigger */}
          <button
            onClick={() => setIsScoreboardModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[#1769AA] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#0B4F83] shadow-md shadow-[#1769AA]/20"
          >
            <Camera className="h-4 w-4" />
            <span>Scan Scoreboard</span>
          </button>
        </div>
      </div>

      {/* Sync reason & spoiler protection banner */}
      <div className="mt-3.5 flex flex-col gap-2 rounded-xl bg-[#F5F8FC] p-3 text-xs text-[#475569] border border-[#DCE5EF] sm:flex-row sm:items-center sm:justify-between shadow-2xs">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 shrink-0 text-[#1769AA]" />
          <span className="leading-tight font-medium text-slate-700">{lastSyncReason}</span>
        </div>

        {unreadLockedCount > 0 ? (
          <div className="flex items-center gap-1.5 shrink-0 font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-300 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span>{unreadLockedCount} spoiler{unreadLockedCount > 1 ? 's' : ''} blocked</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 shrink-0 text-[#0B4F83] font-semibold">
            <span className="h-2 w-2 rounded-full bg-[#1769AA]" />
            <span>All visible messages are safe</span>
          </div>
        )}
      </div>
    </div>
  );
};
