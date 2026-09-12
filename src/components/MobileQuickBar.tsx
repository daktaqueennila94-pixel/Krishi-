import React from "react";
import { Mic, Zap, Calculator, Sparkles, Loader2, Radio } from "lucide-react";

interface MobileQuickBarProps {
  onOpenVoice: () => void;
  onOpenLiveVoice?: () => void;
  onOpenCalculator: () => void;
  onOpenPresets: () => void;
  onTriggerDiagnose: () => void;
  hasInput: boolean;
  isLoading: boolean;
}

export const MobileQuickBar: React.FC<MobileQuickBarProps> = ({
  onOpenVoice,
  onOpenLiveVoice,
  onOpenCalculator,
  onOpenPresets,
  onTriggerDiagnose,
  hasInput,
  isLoading,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#262626] bg-[#0c0c0c]/95 backdrop-blur-md px-3 py-2 sm:hidden print:hidden">
      <div className="flex items-center justify-between gap-2 max-w-md mx-auto">
        {onOpenLiveVoice ? (
          <button
            type="button"
            onClick={onOpenLiveVoice}
            className="flex flex-1 flex-col items-center justify-center gap-1 rounded-lg py-1.5 text-[11px] font-semibold text-[#86efac] active:bg-[#1a1a1a] transition-colors"
          >
            <Radio className="h-4 w-4 text-[#86efac] animate-pulse" />
            <span>লাইভ কথা</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenVoice}
            className="flex flex-1 flex-col items-center justify-center gap-1 rounded-lg py-1.5 text-[11px] font-medium text-[#a3a3a3] active:bg-[#1a1a1a] transition-colors"
          >
            <Mic className="h-4 w-4 text-[#86efac]" />
            <span>মুখে বলুন</span>
          </button>
        )}

        <button
          type="button"
          onClick={onOpenPresets}
          className="flex flex-1 flex-col items-center justify-center gap-1 rounded-lg py-1.5 text-[11px] font-medium text-[#a3a3a3] active:bg-[#1a1a1a] transition-colors"
        >
          <Zap className="h-4 w-4 text-[#fbbf24]" />
          <span>লক্ষণ</span>
        </button>

        <button
          type="button"
          onClick={onOpenCalculator}
          className="flex flex-1 flex-col items-center justify-center gap-1 rounded-lg py-1.5 text-[11px] font-medium text-[#a3a3a3] active:bg-[#1a1a1a] transition-colors"
        >
          <Calculator className="h-4 w-4 text-cyan-400" />
          <span>সার ডোজ</span>
        </button>

        <button
          type="button"
          disabled={isLoading || !hasInput}
          onClick={onTriggerDiagnose}
          className="flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-xs font-bold text-black active:scale-95 transition-all disabled:opacity-30"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-black" />
          ) : (
            <Sparkles className="h-4 w-4 text-black" />
          )}
          <span>সমাধান</span>
        </button>
      </div>
    </div>
  );
};
