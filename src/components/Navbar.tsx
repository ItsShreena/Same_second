import React from 'react';
import { Camera, Play, RotateCcw, Share2, Check } from 'lucide-react';
import { SameSecondIcon } from './SameSecondLogo';
import { useWatch } from '../context/WatchContext';
import { formatBall } from '../types/cricket';

interface NavbarProps {
  currentView: 'landing' | 'setup' | 'watch';
  setCurrentView: (view: 'landing' | 'setup' | 'watch') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView }) => {
  const {
    match,
    viewerBall,
    syncStatus,
    isDemoMode,
    setIsDemoMode,
    unreadLockedCount,
    setIsScoreboardModalOpen,
    setIsRecalibrationModalOpen,
    setIsEvaluationModalOpen,
    roomCode,
  } = useWatch();

  const [copied, setCopied] = React.useState(false);

  const handleCopyRoom = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#DCE5EF] bg-white/95 backdrop-blur-xl shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2.5 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('landing')}
            className="group flex items-center gap-2.5 text-left transition"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white p-1 ring-1 ring-[#DCE5EF] transition group-hover:ring-[#1769AA]/40 group-hover:bg-[#EAF3FB] shadow-2xs">
              <SameSecondIcon size={28} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-[#111111]">
                  Same <span className="text-[#1769AA]">Second</span>
                </span>
                <span className="hidden rounded bg-[#EAF3FB] border border-[#1769AA]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#0B4F83] sm:inline-block">
                  SPOILER SHIELD
                </span>
              </div>
              <p className="hidden text-[11px] font-medium text-[#475569] sm:block">
                Your match. Your moment.
              </p>
            </div>
          </button>
        </div>

        {/* Center: Live stream indicator if in Watch Room */}
        {currentView === 'watch' && (
          <div className="hidden md:flex items-center gap-2 rounded-full border border-[#DCE5EF] bg-[#F5F8FC] px-3.5 py-1.5 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs text-[#111111]">
              <span className="font-bold text-[#0B4F83]">{match.battingTeam.code}</span>
              <span className="text-[#475569]">vs</span>
              <span className="font-semibold text-slate-700">{match.bowlingTeam.code}</span>
            </div>
            <span className="h-3 w-px bg-[#DCE5EF]" />
            <div className="flex items-center gap-1 font-mono-numbers text-xs font-bold text-[#1769AA]">
              <span>Over {formatBall(viewerBall)}</span>
            </div>
            {unreadLockedCount > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-amber-50 border border-amber-300 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                {unreadLockedCount} locked
              </span>
            )}
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentView === 'watch' ? (
            <>
              {/* Scoreboard AI button */}
              <button
                onClick={() => setIsScoreboardModalOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-[#DCE5EF] bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-[#1769AA] hover:bg-[#EAF3FB] hover:text-[#0B4F83]"
                title="Scan TV scoreboard with Camera or Preset"
              >
                <Camera className="h-3.5 w-3.5 text-[#1769AA]" />
                <span className="hidden sm:inline">Scoreboard Camera</span>
              </button>

              {/* Recalibrate button */}
              <button
                onClick={() => setIsRecalibrationModalOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-[#DCE5EF] bg-white px-2.5 py-1.5 text-xs font-medium text-[#475569] transition hover:bg-[#F5F8FC] hover:text-[#111111]"
                title="Manually adjust over & ball"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Recalibrate</span>
              </button>

              {/* Match Sync Status Modal Trigger */}
              <button
                onClick={() => setIsEvaluationModalOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-[#1769AA]/30 bg-[#EAF3FB] px-2.5 py-1.5 text-xs font-bold text-[#0B4F83] hover:bg-[#1769AA] hover:text-white transition"
                title="View live match sync status"
              >
                <span className="h-2 w-2 rounded-full bg-[#1769AA] animate-pulse" />
                <span className="hidden sm:inline">Match Sync Status</span>
              </button>

              {/* Share / Room code pill */}
              <button
                onClick={handleCopyRoom}
                className="flex items-center gap-1.5 rounded-lg border border-[#DCE5EF] bg-[#F5F8FC] px-2.5 py-1.5 text-xs font-mono-numbers text-[#475569] transition hover:border-[#1769AA] hover:text-[#111111]"
                title="Click to copy Room Code"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-[#1769AA]" />
                    <span className="text-[#0B4F83] font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-3 w-3 text-[#475569]" />
                    <span className="text-slate-700 font-semibold">#{roomCode}</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              {/* If on landing or setup */}
              <button
                onClick={() => {
                  setIsDemoMode(true);
                  setCurrentView('watch');
                }}
                className="flex items-center gap-1.5 rounded-lg border border-[#1769AA]/30 bg-[#EAF3FB] px-3 py-1.5 text-xs font-bold text-[#0B4F83] transition hover:bg-[#1769AA] hover:text-white"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Try Demo</span>
              </button>
              <button
                onClick={() => setCurrentView('setup')}
                className="flex items-center gap-1.5 rounded-lg bg-[#1769AA] px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-[#0B4F83] shadow-md shadow-[#1769AA]/20"
              >
                <span>Start Watching</span>
              </button>
            </>
          )}

          {/* Quick Demo toggle when inside watch room */}
          {currentView === 'watch' && (
            <button
              onClick={() => setIsDemoMode(!isDemoMode)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                isDemoMode
                  ? 'bg-[#EAF3FB] text-[#0B4F83] ring-1 ring-[#1769AA]/40'
                  : 'bg-slate-100 text-[#475569] hover:text-[#111111]'
              }`}
            >
              {isDemoMode ? 'Demo Active' : 'Live Mode'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
