import React, { useState } from 'react';
import { Users, ShieldCheck, Sparkles, Send, MessageSquarePlus, AlertCircle } from 'lucide-react';
import { useWatch } from '../../context/WatchContext';
import { formatBall, ballsDifference, MessageReactionType } from '../../types/cricket';

export const FriendListBar: React.FC = () => {
  const { friends, viewerBall, userName, sendSimulatedAlexMessage } = useWatch();
  const [isAlexSimOpen, setIsAlexSimOpen] = useState(false);
  const [alexOver, setAlexOver] = useState<number>(17);
  const [alexBall, setAlexBall] = useState<number>(4);
  const [alexText, setAlexText] = useState<string>(
    'NOOOO! Slower cutter, chipped in the air... Cummins catches it at mid-off! Wicket fallen! ☝️'
  );
  const [alexReaction, setAlexReaction] = useState<MessageReactionType>('wicket');

  const handleSendAlexSim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alexText.trim()) return;
    sendSimulatedAlexMessage({
      over: alexOver,
      ball: alexBall,
      text: alexText.trim(),
      reactionType: alexReaction,
    });
    setIsAlexSimOpen(false);
  };

  return (
    <div className="rounded-2xl border border-[#DCE5EF] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-[#DCE5EF] pb-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-[#1769AA]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#111111]">
            Watch Room Viewers ({friends.length + 1})
          </h2>
        </div>
        <span className="text-[11px] text-[#475569] font-medium">Stream Latencies</span>
      </div>

      <div className="mt-3 flex flex-col gap-2.5">
        {/* User's own entry */}
        <div className="flex items-center justify-between rounded-xl border border-[#1769AA]/30 bg-[#EAF3FB] p-2.5 transition shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1769AA] text-white text-xs font-black shadow-xs">
                YOU
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#1769AA] ring-2 ring-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#111111]">{userName}</span>
                <span className="rounded bg-white border border-[#1769AA]/30 px-1.5 py-0.2 text-[9px] font-bold text-[#0B4F83]">
                  YOU
                </span>
              </div>
              <p className="text-[10px] text-[#475569]">Current Stream Position</p>
            </div>
          </div>

          <div className="text-right">
            <span className="font-mono-numbers text-xs font-bold text-[#0B4F83]">
              Over {formatBall(viewerBall)}
            </span>
            <p className="text-[10px] text-[#1769AA] font-bold">Active Baseline</p>
          </div>
        </div>

        {/* Friends entries */}
        {friends.map((friend) => {
          const diff = ballsDifference(friend.currentBall, viewerBall);
          const isAhead = diff > 0;
          const isBehind = diff < 0;
          const isAlex = friend.id === 'friend-alex';

          return (
            <div
              key={friend.id}
              className="flex flex-col gap-2 rounded-xl border border-[#DCE5EF] bg-[#F5F8FC] p-2.5 transition hover:border-[#1769AA]/40 hover:bg-white shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-800 text-xs font-bold ring-1 ring-black/5">
                      {friend.avatar}
                    </div>
                    {friend.isOnline && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-sky-600 ring-2 ring-white" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#111111]">{friend.name}</span>
                      {friend.isSimulated && (
                        <span className="rounded bg-sky-50 border border-sky-200 px-1.5 py-0.2 text-[9px] font-bold text-sky-800">
                          SIMULATED
                        </span>
                      )}
                      {friend.status === 'typing' && (
                        <span className="text-[10px] text-[#1769AA] animate-pulse font-medium">
                          typing...
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#475569] truncate max-w-[150px]">
                      {friend.streamSource}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="font-mono-numbers text-xs font-bold text-[#111111]">
                      Over {formatBall(friend.currentBall)}
                    </span>
                    <p
                      className={`text-[10px] font-mono-numbers font-semibold ${
                        isAhead
                          ? 'text-amber-800'
                          : isBehind
                          ? 'text-[#475569]'
                          : 'text-[#0B4F83]'
                      }`}
                    >
                      {isAhead
                        ? `+${diff} ball${diff > 1 ? 's' : ''} ahead`
                        : isBehind
                        ? `${diff} ball${Math.abs(diff) > 1 ? 's' : ''} behind`
                        : 'In sync'}
                    </p>
                  </div>

                  {/* Alex Simulation Trigger Button */}
                  {isAlex && (
                    <button
                      type="button"
                      onClick={() => setIsAlexSimOpen(!isAlexSimOpen)}
                      className="rounded-lg border border-[#1769AA]/30 bg-[#EAF3FB] p-1.5 text-[#0B4F83] hover:bg-[#1769AA] hover:text-white transition shadow-2xs"
                      title="Simulate Alex sending a message at a chosen ball position"
                    >
                      <MessageSquarePlus className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Collapsible Alex Message Simulator Form */}
              {isAlex && isAlexSimOpen && (
                <form
                  onSubmit={handleSendAlexSim}
                  className="mt-2 rounded-xl border border-[#1769AA]/30 bg-[#EAF3FB]/70 p-3 text-xs space-y-2.5 animate-fadeIn"
                >
                  <div className="flex items-center justify-between border-b border-[#1769AA]/20 pb-1.5">
                    <span className="font-bold text-[#0B4F83] text-[11px] uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-[#1769AA]" />
                      Simulate Alex Message
                    </span>
                    <span className="text-[10px] text-[#475569] font-medium">
                      Viewer at Over {formatBall(viewerBall)}
                    </span>
                  </div>

                  {/* Ball coordinates selection */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-[#475569] font-semibold">Tag Over:</label>
                      <input
                        type="number"
                        min={0}
                        max={50}
                        value={alexOver}
                        onChange={(e) => setAlexOver(parseInt(e.target.value, 10) || 0)}
                        className="mt-0.5 w-full rounded-lg border border-[#DCE5EF] bg-white px-2 py-1 text-[#111111] text-xs font-mono-numbers focus:border-[#1769AA] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#475569] font-semibold">Tag Ball (1-6):</label>
                      <input
                        type="number"
                        min={0}
                        max={6}
                        value={alexBall}
                        onChange={(e) => setAlexBall(parseInt(e.target.value, 10) || 0)}
                        className="mt-0.5 w-full rounded-lg border border-[#DCE5EF] bg-white px-2 py-1 text-[#111111] text-xs font-mono-numbers focus:border-[#1769AA] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Preset quick buttons */}
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setAlexOver(17);
                        setAlexBall(4);
                        setAlexText('NOOOO! Slower cutter, chipped in the air... Cummins catches it at mid-off! Wicket fallen! ☝️');
                        setAlexReaction('wicket');
                      }}
                      className="rounded bg-white border border-[#DCE5EF] px-2 py-0.5 text-[10px] font-semibold text-[#0B4F83] hover:bg-[#EAF3FB]"
                    >
                      Over 17.4 (Wicket)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAlexOver(17);
                        setAlexBall(5);
                        setAlexText('Starc steams in with the old ball, reverse swing starting! 🏏');
                        setAlexReaction('general');
                      }}
                      className="rounded bg-white border border-[#DCE5EF] px-2 py-0.5 text-[10px] font-semibold text-[#0B4F83] hover:bg-[#EAF3FB]"
                    >
                      Over 17.5 (Single)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAlexOver(18);
                        setAlexBall(1);
                        setAlexText('UNBELIEVABLE SIX FROM HARDIK OVER COVER!! 98 METERS ONTO THE ROOF! 🚀💥');
                        setAlexReaction('six');
                      }}
                      className="rounded bg-white border border-[#DCE5EF] px-2 py-0.5 text-[10px] font-semibold text-[#0B4F83] hover:bg-[#EAF3FB]"
                    >
                      Over 18.1 (Six)
                    </button>
                  </div>

                  {/* Message Text Input */}
                  <div>
                    <label className="text-[10px] text-[#475569] font-semibold">Message:</label>
                    <textarea
                      rows={2}
                      value={alexText}
                      onChange={(e) => setAlexText(e.target.value)}
                      className="mt-0.5 w-full resize-none rounded-lg border border-[#DCE5EF] bg-white p-2 text-xs text-[#111111] placeholder-slate-400 focus:border-[#1769AA] focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-[#475569]">
                      {alexOver * 6 + alexBall > viewerBall.legalBallIndex ? (
                        <span className="text-amber-800 font-bold">Will arrive LOCKED</span>
                      ) : (
                        <span className="text-[#0B4F83] font-bold">Will arrive UNLOCKED</span>
                      )}
                    </span>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 rounded-lg bg-[#1769AA] px-3 py-1 font-bold text-white hover:bg-[#0B4F83] transition text-xs shadow-xs"
                    >
                      <Send className="h-3 w-3" />
                      <span>Send as Alex</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          );
        })}
      </div>

      {/* Disclaimers & Info */}
      <div className="mt-3.5 space-y-2">
        <div className="rounded-xl bg-[#F5F8FC] border border-[#DCE5EF] p-2.5 text-[11px] text-slate-700 flex items-start gap-2">
          <ShieldCheck className="h-4 w-4 shrink-0 text-[#1769AA] mt-0.5" />
          <span>
            Friends on faster streams chat freely. Messages tagged ahead of your broadcast are held behind the spoiler shield until your stream catches up.
          </span>
        </div>

        <div className="rounded-xl border border-[#DCE5EF] bg-white p-2.5 text-[10px] text-[#475569] flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-[#1769AA] mt-0.5" />
          <span>
            <strong className="text-[#111111]">Simulated Match Stream:</strong> Same Second is designed as a watch-along companion layer. Friend stream feeds in this room are running on simulated broadcast latencies to demonstrate delivery-tagged spoiler shielding.
          </span>
        </div>
      </div>
    </div>
  );
};
