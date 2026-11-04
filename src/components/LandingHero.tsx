import React from 'react';
import { Shield, Play, Lock, ChevronRight, AlertTriangle, CheckCircle2, Radio, Sparkles } from 'lucide-react';
import { SameSecondIcon } from './SameSecondLogo';
import { useWatch } from '../context/WatchContext';

interface LandingHeroProps {
  onStartWatching: () => void;
  onTryDemo: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onStartWatching, onTryDemo }) => {
  const { setIsDemoMode } = useWatch();

  const handleLaunchDemo = () => {
    setIsDemoMode(true);
    onTryDemo();
  };

  return (
    <div className="relative overflow-hidden pt-6 pb-16 sm:py-14 bg-gradient-to-b from-[#EAF3FB]/60 via-white to-[#F5F8FC]">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1769AA]/10 via-[#EAF3FB]/30 to-transparent opacity-80 blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        {/* Top Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#1769AA]/25 bg-white px-3.5 py-1 text-xs font-bold text-[#0B4F83] shadow-xs backdrop-blur-md">
            <SameSecondIcon size={18} />
            <span>CRICKET WATCH-ALONG WITHOUT SPOILERS</span>
          </div>
        </div>

        {/* Hero Title & Tagline */}
        <div className="mt-6 text-center">
          <h1 className="text-4xl font-black tracking-tight text-[#111111] sm:text-6xl sm:leading-tight">
            Same <span className="text-[#1769AA]">Second</span>
          </h1>
          <p className="mt-2 text-xl font-extrabold tracking-wide text-[#0B4F83] uppercase sm:text-2xl">
            Your match. Your moment.
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-base text-[#475569] sm:text-lg leading-relaxed">
            Friends watching on fiber streams shout <span className="text-[#111111] font-bold">“WICKET!!”</span> while your broadcast is still 30 seconds behind.
            Same Second synchronizes watch-along chat with the <span className="text-[#0B4F83] font-bold">exact ball position</span>, locking spoilers until your broadcast catches up.
          </p>
        </div>

        {/* CTAs */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <button
            onClick={onStartWatching}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1769AA] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#0B4F83] shadow-lg shadow-[#1769AA]/25 sm:w-auto"
          >
            <span>Start Watching</span>
            <ChevronRight className="h-4 w-4" />
          </button>

          <button
            onClick={handleLaunchDemo}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#DCE5EF] bg-white px-6 py-3.5 text-sm font-bold text-[#111111] transition hover:border-[#1769AA] hover:bg-[#EAF3FB] hover:text-[#0B4F83] shadow-xs sm:w-auto"
          >
            <Play className="h-4 w-4 fill-[#1769AA] text-[#1769AA]" />
            <span>Try Interactive Demo</span>
          </button>
        </div>

        {/* Visual Problem & Solution Infographic Card */}
        <div className="mt-12 overflow-hidden rounded-2xl border border-[#DCE5EF] bg-white shadow-xl">
          <div className="border-b border-[#DCE5EF] bg-[#F5F8FC] px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#1769AA]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                How Same Second Eliminates Stream Latency Spoilers
              </span>
            </div>
            <span className="rounded bg-[#EAF3FB] border border-[#1769AA]/20 px-2 py-0.5 text-[10px] font-mono-numbers font-bold text-[#0B4F83]">
              OVERS SYNC vs CLOCK SYNC
            </span>
          </div>

          <div className="grid grid-cols-1 divide-y divide-[#DCE5EF] md:grid-cols-2 md:divide-y-0 md:divide-x">
            {/* Stream A (Fast Stream) */}
            <div className="p-5 sm:p-6 bg-gradient-to-b from-slate-50 to-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-sky-600 animate-ping" />
                  <span className="text-xs font-bold text-sky-700">FASTER BROADCAST STREAM</span>
                </div>
                <span className="text-[11px] font-mono-numbers text-[#475569] font-medium">Rahul (Fiber 4K)</span>
              </div>

              <div className="rounded-xl border border-[#DCE5EF] bg-white p-3.5 shadow-xs">
                <div className="flex justify-between items-center text-xs text-[#475569] pb-2 border-b border-[#DCE5EF] font-mono-numbers">
                  <span>LIVE OVER: <strong className="text-[#111111]">18.2</strong></span>
                  <span className="text-sky-700 font-bold">Ahead by 4 balls</span>
                </div>
                <div className="mt-3 flex items-start gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-[#EAF3FB] text-[#0B4F83] text-xs font-bold flex items-center justify-center border border-[#1769AA]/20">
                    RV
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-[#0B4F83]">Rahul V. sent:</p>
                    <p className="mt-0.5 text-xs text-[#111111] bg-[#F5F8FC] p-2.5 rounded-lg border border-[#DCE5EF] font-medium">
                      “UNBELIEVABLE SIX FROM HARDIK! 98 METERS ONTO ROOF!!” 🚀
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-rose-800 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>On WhatsApp or Group Chat: This ruins the climax before you ever see the bowler run up.</span>
              </div>
            </div>

            {/* Stream B (Your Stream with Same Second) */}
            <div className="p-5 sm:p-6 bg-gradient-to-b from-[#EAF3FB]/70 to-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[#1769AA]" />
                  <span className="text-xs font-bold text-[#0B4F83]">SAME SECOND WATCH ROOM</span>
                </div>
                <span className="text-[11px] font-mono-numbers font-semibold text-[#1769AA]">Your Stream (Cable HD)</span>
              </div>

              <div className="rounded-xl border border-[#1769AA]/30 bg-white p-3.5 relative overflow-hidden shadow-xs">
                <div className="flex justify-between items-center text-xs text-[#475569] pb-2 border-b border-[#DCE5EF] font-mono-numbers">
                  <span>YOUR SCREEN: <strong className="text-[#111111]">Over 17.4</strong></span>
                  <span className="text-[#0B4F83] font-bold">4 balls remaining</span>
                </div>

                {/* Locked Card Demonstration */}
                <div className="mt-3 relative rounded-xl border border-amber-300 bg-amber-50/70 p-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                        <Lock className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs font-bold text-amber-900">
                        SPOILER SHIELD LOCKED (Over 18.2)
                      </span>
                    </div>
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-mono-numbers font-bold text-amber-800">
                      -4 BALLS
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-amber-800 italic">
                    “Message hidden — reveals automatically when your stream reaches Over 18.2.”
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-blue-900 bg-[#EAF3FB] p-2.5 rounded-lg border border-[#1769AA]/25 font-medium">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#1769AA]" />
                <span>Zero spoilers. You experience every boundary and wicket at the same second as reality!</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Pillars Section */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#DCE5EF] bg-white p-5 shadow-xs transition hover:border-[#1769AA]/50 hover:shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF3FB] text-[#1769AA]">
              <Radio className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-[#111111]">Ball-Tagged Messaging</h3>
            <p className="mt-1 text-xs text-[#475569] leading-relaxed">
              Every message is stamped with the innings over and ball (e.g. 17.4), not wall-clock time. If someone is ahead, their message waits for you.
            </p>
          </div>

          <div className="rounded-2xl border border-[#DCE5EF] bg-white p-5 shadow-xs transition hover:border-[#1769AA]/50 hover:shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF3FB] text-[#1769AA]">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-[#111111]">Scoreboard Vision OCR</h3>
            <p className="mt-1 text-xs text-[#475569] leading-relaxed">
              Point your webcam at your TV or snap a photo. Vision AI reads the broadcaster’s on-screen ticker to automatically calibrate your exact ball.
            </p>
          </div>

          <div className="rounded-2xl border border-[#DCE5EF] bg-white p-5 shadow-xs transition hover:border-[#1769AA]/50 hover:shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-[#111111]">Commercial Safe-HOLD</h3>
            <p className="mt-1 text-xs text-[#475569] leading-relaxed">
              If an ad break airs, replay plays, or camera recognition is uncertain, the system safely triggers HOLD so nothing prematurely leaks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
