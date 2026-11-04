import React from 'react';
import { Target, Flame } from 'lucide-react';
import { MatchDetails, BallPosition, formatBall } from '../../types/cricket';

interface MatchHeaderProps {
  match: MatchDetails;
  viewerBall: BallPosition;
}

export const MatchHeader: React.FC<MatchHeaderProps> = ({ match, viewerBall }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#DCE5EF] bg-white p-4 sm:p-5 shadow-sm">
      {/* Top row: Match fixture & venue */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DCE5EF] pb-3">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#EAF3FB] border border-[#1769AA]/30 px-2.5 py-0.5 text-[11px] font-bold text-[#0B4F83]">
            {match.format}
          </span>
          <span className="text-xs font-bold text-[#111111]">{match.title}</span>
          <span className="hidden sm:inline text-xs text-[#475569]">• {match.subtitle}</span>
        </div>
        <div className="text-[11px] text-[#475569] truncate max-w-xs font-medium">
          {match.venue}
        </div>
      </div>

      {/* Main Score & Equation Row */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-center">
        {/* Teams and Big Score */}
        <div className="lg:col-span-5 flex items-center gap-4">
          <div className="flex items-center gap-3">
            {/* Batting Team Flag / Badge */}
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl text-base font-black text-white shadow-md ring-1 ring-black/10"
              style={{ backgroundColor: match.battingTeam.logoColor }}
            >
              {match.battingTeam.code}
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono-numbers text-3xl sm:text-4xl font-black tracking-tight text-[#111111]">
                  {match.score.runs}/{match.score.wickets}
                </span>
                <span className="font-mono-numbers text-sm sm:text-base font-bold text-[#1769AA]">
                  ({formatBall(viewerBall)} ov)
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#475569]">
                <span>Innings {match.currentInnings}</span>
                <span>•</span>
                <span>RR: {match.runRate}</span>
                <span>•</span>
                <span className="text-amber-800 font-semibold">Req RR: {match.requiredRunRate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Equation Badge */}
        <div className="lg:col-span-3 flex items-center">
          <div className="w-full rounded-xl border border-[#DCE5EF] bg-[#F5F8FC] px-3.5 py-2.5 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs text-[#475569]">
              <Target className="h-3.5 w-3.5 text-[#1769AA]" />
              <span className="font-semibold">Target: {match.target}</span>
            </div>
            <div className="mt-1 flex items-baseline justify-between font-mono-numbers text-xs">
              <span className="font-bold text-[#111111]">
                Need <strong className="text-[#0B4F83] text-sm">{match.requiredRuns}</strong> runs
              </span>
              <span className="text-[#475569]">
                off <strong className="text-[#111111] text-sm">{match.ballsRemaining}</strong> balls
              </span>
            </div>
          </div>
        </div>

        {/* Striker & Bowler Ticker */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-2 text-xs font-mono-numbers">
          <div className="rounded-xl border border-[#DCE5EF] bg-[#F5F8FC] p-2.5 shadow-2xs">
            <div className="flex items-center gap-1 text-[11px] text-[#475569]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1769AA]" />
              <span className="truncate font-semibold text-[#111111]">{match.striker.name}*</span>
            </div>
            <p className="mt-1 font-bold text-[#111111]">
              {match.striker.runs} <span className="text-[#475569] font-normal">({match.striker.balls}b, {match.striker.sixes}x6)</span>
            </p>
          </div>

          <div className="rounded-xl border border-[#DCE5EF] bg-[#F5F8FC] p-2.5 shadow-2xs">
            <div className="flex items-center gap-1 text-[11px] text-[#475569]">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              <span className="truncate font-semibold text-[#111111]">{match.currentBowler.name}</span>
            </div>
            <p className="mt-1 font-bold text-[#111111]">
              {match.currentBowler.wickets}/{match.currentBowler.runs} <span className="text-[#475569] font-normal">({match.currentBowler.overs} ov)</span>
            </p>
          </div>
        </div>
      </div>

      {/* Over Ball-by-Ball Pills */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#DCE5EF] pt-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[#475569] font-semibold">This Over:</span>
          <div className="flex items-center gap-1.5">
            {match.recentDeliveries.map((delivery, idx) => {
              const isWicket = delivery === 'W';
              const isBoundary = delivery === '4' || delivery === '6';
              const isDot = delivery === '•' || delivery === '0';
              const isCurrent = idx + 1 === viewerBall.ball;

              return (
                <span
                  key={idx}
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold font-mono-numbers transition ${
                    isCurrent
                      ? 'ring-2 ring-[#1769AA] ring-offset-2 ring-offset-white'
                      : ''
                  } ${
                    isWicket
                      ? 'bg-rose-600 text-white font-extrabold shadow-xs'
                      : isBoundary
                      ? 'bg-[#1769AA] text-white font-extrabold shadow-xs'
                      : isDot
                      ? 'bg-slate-100 text-[#475569] border border-slate-200'
                      : 'bg-[#EAF3FB] text-[#0B4F83] border border-[#1769AA]/20 font-bold'
                  }`}
                >
                  {delivery}
                </span>
              );
            })}
          </div>
        </div>

        <div className="text-[11px] text-[#475569] flex items-center gap-1.5">
          <Flame className="h-3.5 w-3.5 text-amber-600" />
          <span>Climax overs: High spoiler probability</span>
        </div>
      </div>
    </div>
  );
};
