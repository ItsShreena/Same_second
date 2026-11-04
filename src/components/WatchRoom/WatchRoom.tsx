import React from 'react';
import { useWatch } from '../../context/WatchContext';
import { MatchHeader } from './MatchHeader';
import { ViewerSyncControl } from './ViewerSyncControl';
import { FriendListBar } from './FriendListBar';
import { MessageFeed } from './MessageFeed';
import { MessageComposer } from './MessageComposer';
import { ScoreboardCameraModal } from './ScoreboardCameraModal';
import { ManualRecalibrationModal } from './ManualRecalibrationModal';
import { EvaluationPanel } from '../Evaluation/EvaluationPanel';
import { DemoScenarioExplainer } from '../Demo/DemoScenarioExplainer';
import { Camera, RotateCcw } from 'lucide-react';
import { formatBall } from '../../types/cricket';

export const WatchRoom: React.FC = () => {
  const {
    match,
    viewerBall,
    syncStatus,
    confidence,
    isEvaluationModalOpen,
    setIsEvaluationModalOpen,
    setIsScoreboardModalOpen,
    setIsRecalibrationModalOpen,
  } = useWatch();

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 py-4 space-y-4">
      {/* 1. Match Header */}
      <MatchHeader match={match} viewerBall={viewerBall} />

      {/* 2. Viewer Synchronization Bar */}
      <ViewerSyncControl />

      {/* 3. Demo Explainer Banner if Demo active */}
      <DemoScenarioExplainer />

      {/* 4. Main Two-Column Watch Experience */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-start">
        {/* Left Side: Friends and Scoreboard Status (lg: 5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Friends & Streams */}
          <FriendListBar />

          {/* Scoreboard AI Recognition Quick Card */}
          <div className="rounded-2xl border border-[#DCE5EF] bg-white p-4 transition hover:border-[#1769AA]/40 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#DCE5EF] pb-3">
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-[#1769AA]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                  Scoreboard Optical Tracking
                </h3>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase border ${
                  syncStatus === 'LIVE'
                    ? 'bg-[#EAF3FB] text-[#0B4F83] border-[#1769AA]/30'
                    : syncStatus === 'HOLD' || syncStatus === 'STALE'
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-rose-50 text-rose-800 border-rose-300'
                }`}
              >
                {syncStatus} ({confidence}%)
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="text-[#475569] text-[11px] font-medium">Detected Match Delivery:</span>
                <p className="font-mono-numbers text-lg font-bold text-[#111111]">
                  Over {formatBall(viewerBall)}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsScoreboardModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-[#DCE5EF] bg-[#F5F8FC] px-3 py-2 text-xs font-bold text-[#111111] hover:border-[#1769AA] hover:bg-[#EAF3FB] hover:text-[#0B4F83] transition shadow-2xs"
                >
                  <Camera className="h-3.5 w-3.5 text-[#1769AA]" />
                  <span>Rescan TV</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsRecalibrationModalOpen(true)}
                  className="flex items-center gap-1 rounded-xl border border-[#DCE5EF] bg-[#F5F8FC] p-2 text-[#475569] hover:bg-[#EAF3FB] hover:text-[#0B4F83] transition shadow-2xs"
                  title="Manual calibration"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </div>

            <p className="mt-2 text-[11px] text-[#475569] leading-relaxed">
              Scoreboard region is continuously verified. If commercials air or score disappears, HOLD activates automatically.
            </p>
          </div>
        </div>

        {/* Right Side: Spoiler-Proof Message Feed & Composer (lg: 7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <MessageFeed />
          <MessageComposer />
        </div>
      </div>

      {/* Modals */}
      <ScoreboardCameraModal />
      <ManualRecalibrationModal />
      <EvaluationPanel
        isOpen={isEvaluationModalOpen}
        onClose={() => setIsEvaluationModalOpen(false)}
      />
    </div>
  );
};
