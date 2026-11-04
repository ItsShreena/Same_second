import React from 'react';
import { Lock, ShieldAlert, Sparkles, Clock } from 'lucide-react';
import { WatchMessage, BallPosition, ballsDifference, formatBall } from '../../types/cricket';
import { useWatch } from '../../context/WatchContext';

interface MessageCardProps {
  message: WatchMessage;
  viewerBall: BallPosition;
}

export const MessageCard: React.FC<MessageCardProps> = ({ message, viewerBall }) => {
  const { lastUnlockedMessageId } = useWatch();
  const isJustUnlocked = lastUnlockedMessageId === message.id;
  const isAhead = ballsDifference(message.ballPosition, viewerBall);
  const timeFormatted = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Reaction badge helper
  const getReactionBadge = () => {
    switch (message.reactionType) {
      case 'six':
        return (
          <span className="rounded bg-[#EAF3FB] border border-[#1769AA]/30 px-2 py-0.5 text-[10px] font-black text-[#0B4F83] uppercase tracking-wider">
            🚀 MAXIMUM SIX
          </span>
        );
      case 'four':
        return (
          <span className="rounded bg-sky-50 border border-sky-200 px-2 py-0.5 text-[10px] font-black text-sky-800 uppercase tracking-wider">
            🏏 BOUNDARY FOUR
          </span>
        );
      case 'wicket':
        return (
          <span className="rounded bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-black text-rose-800 uppercase tracking-wider">
            ☝️ WICKET FALLEN
          </span>
        );
      case 'appeal':
        return (
          <span className="rounded bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-black text-amber-800 uppercase tracking-wider">
            👀 DRS REVIEW
          </span>
        );
      case 'dot':
        return (
          <span className="rounded bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700 uppercase tracking-wider">
            • DOT BALL
          </span>
        );
      default:
        return null;
    }
  };

  // LOCKED SPOILER CARD
  if (message.isLocked) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50/90 via-white to-amber-50/70 p-4 shadow-sm backdrop-blur-md transition-all">
        {/* Top bar of locked card */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700 shadow-2xs">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#111111]">{message.senderName}</span>
              <span className="ml-1.5 text-[11px] text-[#475569]">sent a message</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-200 px-2.5 py-0.5 font-mono-numbers text-[10px] font-bold text-amber-900">
            <span>Tagged: Over {message.ballFormatted}</span>
          </div>
        </div>

        {/* Shielded Area */}
        <div className="mt-3 rounded-xl border border-dashed border-amber-300 bg-white p-3.5 text-center shadow-2xs">
          <div className="flex items-center justify-center gap-1.5 text-amber-800 font-bold text-xs uppercase tracking-wider">
            <ShieldAlert className="h-4 w-4 text-amber-600" />
            <span>Spoiler Blocked</span>
          </div>
          <p className="mt-1 text-xs text-slate-700">
            {message.holdReason || (
              <>
                Tagged at <strong className="text-[#111111] font-mono-numbers">Over {message.ballFormatted}</strong>.
                Your stream is at <strong className="text-[#0B4F83] font-mono-numbers">Over {formatBall(viewerBall)}</strong>.
              </>
            )}
          </p>
          <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-md bg-[#F5F8FC] border border-[#DCE5EF] px-2.5 py-1 text-[11px] font-mono-numbers text-[#475569]">
            <Clock className="h-3 w-3 text-amber-600" />
            <span>
              {isAhead > 0
                ? `Will unlock in ~${isAhead} legal ball${isAhead > 1 ? 's' : ''}`
                : 'Will unlock when stream resumes'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // UNLOCKED VISIBLE MESSAGE CARD
  const isUserMsg = message.isUser;

  return (
    <div
      className={`rounded-2xl border p-4 transition-all duration-500 ease-out animate-fadeIn shadow-xs ${
        isJustUnlocked
          ? 'border-[#1769AA] bg-[#EAF3FB] shadow-md ring-2 ring-[#1769AA]/40'
          : isUserMsg
          ? 'border-[#1769AA]/30 bg-[#EAF3FB]/40 ml-4 sm:ml-8'
          : 'border-[#DCE5EF] bg-white hover:border-[#1769AA]/30'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black shadow-2xs ${
              isUserMsg
                ? 'bg-[#1769AA] text-white'
                : isJustUnlocked
                ? 'bg-[#1769AA] text-white'
                : 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
            }`}
          >
            {message.senderAvatar}
          </div>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className={`text-xs font-bold ${isUserMsg ? 'text-[#0B4F83]' : 'text-[#111111]'}`}>
              {message.senderName}
            </span>
            {message.isSimulated && (
              <span className="rounded bg-sky-50 border border-sky-200 px-1.5 py-0.2 text-[9px] font-bold text-sky-800">
                SIMULATED
              </span>
            )}
            {isJustUnlocked && (
              <span className="flex items-center gap-1 rounded bg-[#1769AA] px-1.5 py-0.2 text-[9px] font-black text-white shadow-2xs">
                <Sparkles className="h-2.5 w-2.5" />
                JUST UNLOCKED
              </span>
            )}
            <span className="text-[10px] text-[#475569]">{timeFormatted}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {getReactionBadge()}
          <span className="rounded bg-[#F5F8FC] border border-[#DCE5EF] px-2 py-0.5 font-mono-numbers text-[10px] font-bold text-slate-700">
            {message.ballFormatted} ov
          </span>
        </div>
      </div>

      {/* Message Text */}
      <div className="mt-2 text-sm text-[#111111] leading-relaxed break-words font-medium">
        {message.text}
      </div>
    </div>
  );
};
