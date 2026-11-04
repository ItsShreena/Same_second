import React, { useState } from 'react';
import { ArrowLeft, Check, Play } from 'lucide-react';
import { SAMPLE_MATCHES } from '../data/sampleMatches';
import { CricketFormat } from '../types/cricket';
import { useWatch } from '../context/WatchContext';

interface MatchSetupProps {
  onBack: () => void;
  onEnterRoom: () => void;
}

export const MatchSetup: React.FC<MatchSetupProps> = ({ onBack, onEnterRoom }) => {
  const {
    match,
    setMatchById,
    userName,
    setUserName,
    roomCode,
    setRoomCode,
    setIsDemoMode,
  } = useWatch();

  const [selectedMatchId, setSelectedMatchId] = useState<string>(match.id);
  const [selectedFormat, setSelectedFormat] = useState<CricketFormat>('T20');
  const [streamProvider, setStreamProvider] = useState<string>('Cable TV / Set-Top Box');
  const [displayName, setDisplayName] = useState<string>(userName || 'Cricket Fan');
  const [generatedRoomCode, setGeneratedRoomCode] = useState<string>(roomCode);
  const [actionTab, setActionTab] = useState<'create' | 'join'>('create');
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');

  const filteredMatches = SAMPLE_MATCHES.filter((m) => m.format === selectedFormat);

  const handleSelectMatch = (id: string) => {
    setSelectedMatchId(id);
    setMatchById(id);
  };

  const handleFormatChange = (fmt: CricketFormat) => {
    setSelectedFormat(fmt);
    const firstOfFormat = SAMPLE_MATCHES.find((m) => m.format === fmt);
    if (firstOfFormat) {
      setSelectedMatchId(firstOfFormat.id);
      setMatchById(firstOfFormat.id);
    }
  };

  const handleStart = (withDemo: boolean = false) => {
    setUserName(displayName.trim() || 'Cricket Fan');
    if (actionTab === 'join' && joinCodeInput.trim()) {
      setRoomCode(joinCodeInput.trim().toUpperCase());
    } else {
      setRoomCode(generatedRoomCode);
    }
    setIsDemoMode(withDemo);
    onEnterRoom();
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#475569] hover:text-[#111111] transition"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Overview</span>
      </button>

      <div className="mt-4">
        <h1 className="text-2xl font-black tracking-tight text-[#111111] sm:text-3xl">
          Set Up Your Watch Room
        </h1>
        <p className="mt-1 text-sm text-[#475569]">
          Pick a cricket fixture, set your display name, and invite friends to watch spoiler-free.
        </p>
      </div>

      <div className="mt-6 space-y-6">
        {/* Step 1: Format & Match Selection */}
        <div className="rounded-2xl border border-[#DCE5EF] bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              1. Select Match Format
            </label>
            <div className="flex rounded-lg bg-[#F5F8FC] p-1 border border-[#DCE5EF]">
              <button
                type="button"
                onClick={() => handleFormatChange('T20')}
                className={`rounded-md px-4 py-1.5 text-xs font-bold transition ${
                  selectedFormat === 'T20'
                    ? 'bg-[#1769AA] text-white shadow-xs'
                    : 'text-[#475569] hover:text-[#111111]'
                }`}
              >
                T20 International & Leagues
              </button>
              <button
                type="button"
                onClick={() => handleFormatChange('ODI')}
                className={`rounded-md px-4 py-1.5 text-xs font-bold transition ${
                  selectedFormat === 'ODI'
                    ? 'bg-[#1769AA] text-white shadow-xs'
                    : 'text-[#475569] hover:text-[#111111]'
                }`}
              >
                ODI (50 Overs)
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {filteredMatches.map((m) => {
              const isSelected = m.id === selectedMatchId;
              return (
                <div
                  key={m.id}
                  onClick={() => handleSelectMatch(m.id)}
                  className={`cursor-pointer rounded-xl border p-4 transition ${
                    isSelected
                      ? 'border-[#1769AA] bg-[#EAF3FB] ring-2 ring-[#1769AA]/30 shadow-xs'
                      : 'border-[#DCE5EF] bg-[#F5F8FC] hover:border-[#1769AA]/50 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-white border border-[#DCE5EF] px-2 py-0.5 text-[10px] font-bold text-[#0B4F83] uppercase">
                      {m.format}
                    </span>
                    {isSelected && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1769AA] text-white">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <h3 className="mt-2 text-sm font-bold text-[#111111]">{m.title}</h3>
                  <p className="text-xs text-[#475569]">{m.subtitle}</p>

                  <div className="mt-3 flex items-center justify-between text-xs font-mono-numbers text-slate-700 border-t border-[#DCE5EF] pt-2.5">
                    <span>Target: {m.target}</span>
                    <span className="text-[#0B4F83] font-bold">
                      {m.score.runs}/{m.score.wickets} ({m.currentPosition.over}.{m.currentPosition.ball} ov)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: User Identity & Stream Source */}
        <div className="rounded-2xl border border-[#DCE5EF] bg-white p-5 sm:p-6 shadow-sm">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            2. Your Display Profile
          </label>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Your Screen Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Virat Fan, Sachin99, Arjun"
                maxLength={25}
                className="w-full rounded-xl border border-[#DCE5EF] bg-white px-3.5 py-2.5 text-sm text-[#111111] placeholder-slate-400 focus:border-[#1769AA] focus:outline-none focus:ring-1 focus:ring-[#1769AA]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Your Broadcast Stream Source
              </label>
              <select
                value={streamProvider}
                onChange={(e) => setStreamProvider(e.target.value)}
                className="w-full rounded-xl border border-[#DCE5EF] bg-white px-3.5 py-2.5 text-sm text-[#111111] focus:border-[#1769AA] focus:outline-none focus:ring-1 focus:ring-[#1769AA]"
              >
                <option value="Cable TV / Set-Top Box">Cable TV / Dish (~20s delay)</option>
                <option value="JioCinema / Hotstar Web">OTT Web App (~10s delay)</option>
                <option value="Ultra Fiber 4K">Ultra Fast Fiber Stream (0s delay)</option>
                <option value="Willow Cricket US / Sky UK">International Broadcaster (~35s delay)</option>
                <option value="IPTV / Smart TV App">IPTV / Smart TV App (~45s delay)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Step 3: Room Options */}
        <div className="rounded-2xl border border-[#DCE5EF] bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex border-b border-[#DCE5EF] pb-3 mb-4">
            <button
              type="button"
              onClick={() => setActionTab('create')}
              className={`mr-4 pb-2 text-xs font-bold uppercase tracking-wider transition border-b-2 ${
                actionTab === 'create'
                  ? 'border-[#1769AA] text-[#0B4F83]'
                  : 'border-transparent text-[#475569] hover:text-[#111111]'
              }`}
            >
              Create New Room
            </button>
            <button
              type="button"
              onClick={() => setActionTab('join')}
              className={`pb-2 text-xs font-bold uppercase tracking-wider transition border-b-2 ${
                actionTab === 'join'
                  ? 'border-[#1769AA] text-[#0B4F83]'
                  : 'border-transparent text-[#475569] hover:text-[#111111]'
              }`}
            >
              Join Existing Room
            </button>
          </div>

          {actionTab === 'create' ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold text-[#475569]">Generated Watch Room Code</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-mono-numbers text-xl font-black text-[#0B4F83]">
                    #{generatedRoomCode}
                  </span>
                  <span className="rounded bg-[#EAF3FB] border border-[#1769AA]/30 px-2 py-0.5 text-[10px] font-bold text-[#0B4F83]">
                    Ready
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#475569] max-w-xs">
                Launches your watch room session with simulated friend streams (Alex, Rahul, Priyah) and active ball-by-ball spoiler shielding.
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Enter Room Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. IND-AUS-772"
                  className="flex-1 rounded-xl border border-[#DCE5EF] bg-white px-3.5 py-2.5 font-mono text-sm text-[#111111] placeholder-slate-400 focus:border-[#1769AA] focus:outline-none focus:ring-1 focus:ring-[#1769AA]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            onClick={() => handleStart(false)}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#1769AA] py-3.5 text-sm font-bold text-white transition hover:bg-[#0B4F83] shadow-md shadow-[#1769AA]/20"
          >
            <span>Enter Watch Room</span>
          </button>

          <button
            onClick={() => handleStart(true)}
            className="flex items-center justify-center gap-2 rounded-xl border border-[#DCE5EF] bg-white px-5 py-3.5 text-sm font-bold text-[#111111] transition hover:border-[#1769AA] hover:bg-[#EAF3FB] hover:text-[#0B4F83] shadow-xs"
          >
            <Play className="h-4 w-4 fill-[#1769AA] text-[#1769AA]" />
            <span>Launch with Simulated Friends Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
