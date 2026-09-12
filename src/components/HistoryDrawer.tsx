import React from "react";
import { X, History, Trash2, Calendar, MapPin, ArrowRight } from "lucide-react";
import { DiagnosisResult } from "../types";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: DiagnosisResult[];
  onSelectHistoryItem: (item: DiagnosisResult) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistoryItem,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Slide-in Panel */}
      <div className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-[#262626] bg-[#0a0a0a] p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between border-b border-[#262626] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1a1a1a] text-white">
              <History className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                পরামর্শ ও প্রেসক্রিপশন ইতিহাস
              </h3>
              <p className="text-[11px] font-mono text-[#737373]">
                LOG COUNT: {history.length}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#a3a3a3] hover:bg-[#262626] hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-[#525252]">
              <History className="mb-2 h-10 w-10 stroke-1 text-[#404040]" />
              <p className="text-xs">এখনও কোনো পূর্ববর্তী পরামর্শের ইতিহাস নেই।</p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectHistoryItem(item);
                  onClose();
                }}
                className="group relative cursor-pointer rounded-lg border border-[#262626] bg-[#111111] p-4 transition-all hover:border-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs font-medium text-white group-hover:underline">
                      {item.querySpeech || item.structured.problem.slice(0, 45) + "..."}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-[10px] text-[#737373]">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(item.timestamp).toLocaleDateString("bn-BD")}
                      </span>
                      {item.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {item.location}
                        </span>
                      )}
                    </div>
                  </div>

                  {item.cropPhoto && (
                    <img
                      src={item.cropPhoto}
                      alt="Crop Thumbnail"
                      className="h-10 w-10 rounded object-cover border border-[#262626] shrink-0"
                    />
                  )}
                </div>

                <div className="mt-2 flex items-center justify-end gap-1 text-[11px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <span>লোড করুন</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        {history.length > 0 && (
          <div className="border-t border-[#262626] pt-4 mt-2">
            <button
              type="button"
              onClick={onClearHistory}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#262626] bg-[#111111] py-2.5 text-xs font-medium text-[#f87171] hover:bg-[#2e1a1a] transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              ইতিহাস মুছে ফেলুন
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
