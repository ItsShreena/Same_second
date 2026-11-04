import React, { useState } from 'react';
import { X, RotateCcw, Check, ChevronUp, ChevronDown } from 'lucide-react';
import { useWatch } from '../../context/WatchContext';

export const ManualRecalibrationModal: React.FC = () => {
  const {
    viewerBall,
    isRecalibrationModalOpen,
    setIsRecalibrationModalOpen,
    jumpToPosition,
  } = useWatch();

  const [over, setOver] = useState<number>(viewerBall.over);
  const [ball, setBall] = useState<number>(viewerBall.ball);

  if (!isRecalibrationModalOpen) return null;

  const handleApply = () => {
    jumpToPosition(over, ball);
    setIsRecalibrationModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="w-full max-w-md rounded-2xl border border-[#DCE5EF] bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#DCE5EF] pb-3">
          <div className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-[#1769AA]" />
            <h2 className="text-base font-bold text-[#111111]">Manual Recalibration</h2>
          </div>
          <button
            onClick={() => setIsRecalibrationModalOpen(false)}
            className="rounded-lg p-1 text-[#475569] hover:bg-[#F5F8FC] hover:text-[#111111]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-3 text-xs text-slate-700">
          Match your exact stream position by setting the current over and ball being delivered on your television:
        </p>

        {/* Dial controls */}
        <div className="mt-5 grid grid-cols-2 gap-4">
          {/* Over selector */}
          <div className="flex flex-col items-center rounded-xl border border-[#DCE5EF] bg-[#F5F8FC] p-4 shadow-2xs">
            <span className="text-xs font-bold uppercase text-[#475569]">Completed Overs</span>
            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setOver((prev) => Math.max(0, prev - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#DCE5EF] bg-white text-[#111111] hover:bg-[#EAF3FB] hover:text-[#0B4F83] shadow-2xs transition"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              <span className="font-mono-numbers text-3xl font-black text-[#111111] w-12 text-center">
                {over}
              </span>
              <button
                type="button"
                onClick={() => setOver((prev) => Math.min(49, prev + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#DCE5EF] bg-white text-[#111111] hover:bg-[#EAF3FB] hover:text-[#0B4F83] shadow-2xs transition"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
            </div>
            <span className="text-[10px] text-slate-500 mt-1">e.g. 17 for Over 18</span>
          </div>

          {/* Ball selector */}
          <div className="flex flex-col items-center rounded-xl border border-[#DCE5EF] bg-[#F5F8FC] p-4 shadow-2xs">
            <span className="text-xs font-bold uppercase text-[#475569]">Current Legal Ball</span>
            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setBall((prev) => Math.max(0, prev - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#DCE5EF] bg-white text-[#111111] hover:bg-[#EAF3FB] hover:text-[#0B4F83] shadow-2xs transition"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              <span className="font-mono-numbers text-3xl font-black text-[#0B4F83] w-12 text-center">
                {ball}
              </span>
              <button
                type="button"
                onClick={() => setBall((prev) => Math.min(6, prev + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#DCE5EF] bg-white text-[#111111] hover:bg-[#EAF3FB] hover:text-[#0B4F83] shadow-2xs transition"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
            </div>
            <span className="text-[10px] text-slate-500 mt-1">1 to 6 balls per over</span>
          </div>
        </div>

        {/* Preview */}
        <div className="mt-4 rounded-xl bg-[#EAF3FB] p-3 text-center border border-[#1769AA]/20 shadow-2xs">
          <span className="text-xs text-[#475569] font-medium">Calibrating to:</span>
          <p className="font-mono-numbers text-lg font-bold text-[#0B4F83]">
            Over {over}.{ball}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={() => setIsRecalibrationModalOpen(false)}
            className="rounded-xl border border-[#DCE5EF] bg-white px-4 py-2 text-xs font-semibold text-[#475569] hover:bg-[#F5F8FC]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex items-center gap-1.5 rounded-xl bg-[#1769AA] px-4 py-2 text-xs font-bold text-white hover:bg-[#0B4F83] shadow-xs"
          >
            <Check className="h-4 w-4" />
            <span>Set Position</span>
          </button>
        </div>
      </div>
    </div>
  );
};
