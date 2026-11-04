import React, { useState } from 'react';
import { Send, Tag } from 'lucide-react';
import { useWatch } from '../../context/WatchContext';
import { formatBall, MessageReactionType } from '../../types/cricket';

export const MessageComposer: React.FC = () => {
  const { viewerBall, sendMessage } = useWatch();
  const [inputText, setInputText] = useState('');
  const [activeReaction, setActiveReaction] = useState<MessageReactionType>('general');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sendMessage(inputText, activeReaction);
    setInputText('');
    setActiveReaction('general');
  };

  const handleQuickSend = (reaction: MessageReactionType, text: string) => {
    sendMessage(text, reaction);
  };

  return (
    <div className="rounded-2xl border border-[#DCE5EF] bg-white p-3.5 sm:p-4 shadow-sm">
      {/* Quick reaction chips */}
      <div className="flex flex-wrap items-center gap-1.5 pb-3 border-b border-[#DCE5EF]">
        <span className="text-[10px] font-bold uppercase text-[#475569] mr-1 hidden sm:inline">
          Quick Reaction:
        </span>
        <button
          type="button"
          onClick={() => handleQuickSend('six', 'WHAT A MASSIVE SIX!! 🚀🔥')}
          className="rounded-lg border border-[#DCE5EF] bg-[#F5F8FC] px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:border-[#1769AA] hover:bg-[#EAF3FB] hover:text-[#0B4F83]"
        >
          🚀 SIX!
        </button>
        <button
          type="button"
          onClick={() => handleQuickSend('four', 'Cracking boundary! Four runs! 🏏')}
          className="rounded-lg border border-[#DCE5EF] bg-[#F5F8FC] px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:border-[#1769AA] hover:bg-[#EAF3FB] hover:text-[#0B4F83]"
        >
          🏏 FOUR!
        </button>
        <button
          type="button"
          onClick={() => handleQuickSend('wicket', 'OUT! WICKET GONE! What a delivery! ☝️')}
          className="rounded-lg border border-[#DCE5EF] bg-[#F5F8FC] px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
        >
          ☝️ OUT!!
        </button>
        <button
          type="button"
          onClick={() => handleQuickSend('appeal', 'Huge appeal! Taking DRS review? 👀')}
          className="rounded-lg border border-[#DCE5EF] bg-[#F5F8FC] px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800"
        >
          👀 APPEAL
        </button>
        <button
          type="button"
          onClick={() => handleQuickSend('dot', 'Great tight dot ball under pressure! •')}
          className="rounded-lg border border-[#DCE5EF] bg-[#F5F8FC] px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-white hover:text-[#111111]"
        >
          • DOT
        </button>
      </div>

      {/* Main Composer Input */}
      <form onSubmit={handleSubmit} className="mt-3">
        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={`Chat with room (stamped at Over ${formatBall(viewerBall)})...`}
            rows={2}
            className="w-full resize-none rounded-xl border border-[#DCE5EF] bg-[#F5F8FC] p-3 text-sm text-[#111111] placeholder-slate-400 focus:border-[#1769AA] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1769AA]"
          />

          <div className="mt-2 flex items-center justify-between">
            {/* Auto-tag pill */}
            <div className="flex items-center gap-1.5 text-xs text-[#475569]">
              <Tag className="h-3.5 w-3.5 text-[#1769AA]" />
              <span>Stamped to:</span>
              <span className="font-mono-numbers font-bold text-[#0B4F83]">
                Over {formatBall(viewerBall)}
              </span>
              <span className="hidden sm:inline text-[11px] text-[#475569]">
                (Friends behind this ball will see it locked)
              </span>
            </div>

            {/* Send button */}
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-[#1769AA] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#0B4F83] disabled:opacity-30 disabled:hover:bg-[#1769AA] disabled:cursor-not-allowed shadow-md shadow-[#1769AA]/20"
            >
              <span>Send</span>
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
