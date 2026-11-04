import React, { useEffect, useRef } from 'react';
import { Shield, Lock, BellOff, Info } from 'lucide-react';
import { useWatch } from '../../context/WatchContext';
import { MessageCard } from './MessageCard';
import { formatBall } from '../../types/cricket';

export const MessageFeed: React.FC = () => {
  const { messages, viewerBall, unreadLockedCount, syncStatus, isManualHold } = useWatch();
  const feedEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, viewerBall]);

  return (
    <div className="flex flex-col h-full rounded-2xl border border-[#DCE5EF] bg-white shadow-sm overflow-hidden">
      {/* Top Feed Header */}
      <div className="border-b border-[#DCE5EF] bg-[#F5F8FC] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-[#1769AA]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#111111]">
            Live Watch Feed
          </h2>
          <span className="rounded-full bg-white border border-[#DCE5EF] px-2 py-0.5 text-[10px] font-mono-numbers text-[#475569]">
            {messages.length} messages
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {unreadLockedCount > 0 ? (
            <span className="flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-300 px-2.5 py-1 text-[11px] font-bold text-amber-800">
              <Lock className="h-3 w-3 text-amber-600" />
              <span>{unreadLockedCount} Spoilers Shielded</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] text-[#0B4F83] font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1769AA]" />
              <span>Clean Stream</span>
            </span>
          )}
        </div>
      </div>

      {/* Spoilers Active Banner */}
      {unreadLockedCount > 0 && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BellOff className="h-3.5 w-3.5 shrink-0 text-amber-600" />
            <span>
              Friends on faster streams sent comments ahead of your current delivery ({formatBall(viewerBall)}).
            </span>
          </div>
          <span className="font-bold text-[11px] underline underline-offset-2 text-amber-800">
            Protected
          </span>
        </div>
      )}

      {/* Manual Hold Banner */}
      {(isManualHold || syncStatus === 'HOLD') && (
        <div className="border-b border-amber-200 bg-amber-50/90 px-4 py-2 text-xs text-amber-900 flex items-center gap-2">
          <Info className="h-3.5 w-3.5 shrink-0 text-amber-600" />
          <span>
            Stream is on <strong>HOLD</strong>. All incoming messages remain locked until live broadcast play resumes.
          </span>
        </div>
      )}

      {/* Messages Scroll Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[380px] max-h-[580px] bg-white">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-[#475569]">
            <Shield className="h-8 w-8 text-[#1769AA]/40 mb-2" />
            <p className="text-sm font-bold text-[#111111]">No messages yet</p>
            <p className="text-xs text-[#475569]">
              Send the first comment for Over {formatBall(viewerBall)}!
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageCard key={msg.id} message={msg} viewerBall={viewerBall} />
          ))
        )}
        <div ref={feedEndRef} />
      </div>
    </div>
  );
};
