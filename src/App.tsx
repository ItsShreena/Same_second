import React, { useState } from 'react';
import { WatchProvider, useWatch } from './context/WatchContext';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { MatchSetup } from './components/MatchSetup';
import { WatchRoom } from './components/WatchRoom/WatchRoom';
import { DemoControlBar } from './components/Demo/DemoControlBar';
import { SameSecondIcon } from './components/SameSecondLogo';

function AppContent() {
  const [currentView, setCurrentView] = useState<'landing' | 'setup' | 'watch'>('landing');

  return (
    <div className="min-h-screen bg-[#F5F8FC] text-[#111111] flex flex-col font-sans selection:bg-[#EAF3FB] selection:text-[#0B4F83]">
      {/* Top Navbar */}
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />

      {/* Demo Sticky Bar if Demo is Active */}
      {currentView === 'watch' && <DemoControlBar />}

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingHero
            onStartWatching={() => setCurrentView('setup')}
            onTryDemo={() => setCurrentView('watch')}
          />
        )}

        {currentView === 'setup' && (
          <MatchSetup
            onBack={() => setCurrentView('landing')}
            onEnterRoom={() => setCurrentView('watch')}
          />
        )}

        {currentView === 'watch' && <WatchRoom />}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#DCE5EF] bg-white py-6 text-xs text-[#475569]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <SameSecondIcon size={20} />
            <span className="font-black tracking-tight text-[#111111]">
              Same <span className="text-[#1769AA]">Second</span>
            </span>
            <span className="text-[#475569]">— Your match. Your moment.</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-[#475569]">
            <span>Cricket Watch-Along Layer</span>
            <span>•</span>
            <span>Ball-Tagged Delivery Sync</span>
            <span>•</span>
            <span className="text-[#0B4F83] font-semibold">Zero-Spoiler Guarantee</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <WatchProvider>
      <AppContent />
    </WatchProvider>
  );
}
