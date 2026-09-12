import React, { useState } from "react";
import { MapPin, RefreshCw, AlertTriangle, ChevronRight, Info } from "lucide-react";
import { SeasonInfo } from "../types";

interface LocationSeasonBarProps {
  season: SeasonInfo;
  detectedLocation: string;
  onDetectLocation: () => Promise<void>;
  isDetectingLocation: boolean;
  onSetManualLocation: (loc: string) => void;
}

export const LocationSeasonBar: React.FC<LocationSeasonBarProps> = ({
  season,
  detectedLocation,
  onDetectLocation,
  isDetectingLocation,
  onSetManualLocation,
}) => {
  const [isEditingLoc, setIsEditingLoc] = useState(false);
  const [locInput, setLocInput] = useState(detectedLocation);
  const [showSeasonDetails, setShowSeasonDetails] = useState(false);

  const handleSaveLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (locInput.trim()) {
      onSetManualLocation(locInput.trim());
    }
    setIsEditingLoc(false);
  };

  return (
    <div className="space-y-3">
      {/* Top Meta Badges Bar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Location Box */}
        <div className="flex items-center justify-between rounded-xl border border-[#262626] bg-[#111111] p-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1a1a1a] text-[#a3a3a3]">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] font-semibold uppercase tracking-widest text-[#737373]">
                কৃষি অঞ্চল / জেলা
              </span>
              {isEditingLoc ? (
                <form onSubmit={handleSaveLocation} className="mt-1 flex items-center gap-1.5">
                  <input
                    type="text"
                    value={locInput}
                    onChange={(e) => setLocInput(e.target.value)}
                    placeholder="যেমন: ময়মনসিংহ, বরিশাল"
                    className="w-full rounded border border-[#333333] bg-[#1a1a1a] px-2 py-1 text-xs text-white placeholder-[#737373] focus:border-white focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="rounded bg-white px-2 py-1 text-xs font-bold text-black hover:bg-[#e5e5e5]"
                  >
                    সেভ
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingLoc(false)}
                    className="text-xs text-[#737373] hover:text-white"
                  >
                    বাতিল
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-[#e5e5e5]">
                    {detectedLocation || "সারাদেশ (সাধারণ এলাকা)"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setLocInput(detectedLocation);
                      setIsEditingLoc(true);
                    }}
                    className="text-[11px] text-[#737373] underline decoration-[#404040] underline-offset-2 hover:text-white"
                  >
                    বদলান
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            id="detect-gps-btn"
            type="button"
            onClick={onDetectLocation}
            disabled={isDetectingLocation}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#262626] bg-[#171717] text-[#a3a3a3] transition-colors hover:border-[#404040] hover:text-white disabled:opacity-50"
            title="GPS দিয়ে স্বয়ংক্রিয় অবস্থান শনাক্ত করুন"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isDetectingLocation ? "animate-spin text-white" : ""}`} />
          </button>
        </div>

        {/* Season Box */}
        <div
          onClick={() => setShowSeasonDetails(!showSeasonDetails)}
          className="group flex cursor-pointer items-center justify-between rounded-xl border border-[#262626] bg-[#111111] p-4 transition-colors hover:border-[#404040]"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="text-xl">{season.icon}</span>
            <div className="min-w-0">
              <span className="block text-[10px] font-semibold uppercase tracking-widest text-[#737373]">
                বর্তমান ঋতু ও ফসল পর্যায়
              </span>
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium text-white">
                  {season.name}
                </span>
                <span className="text-[11px] font-mono text-[#737373]">({season.englishMonths})</span>
              </div>
            </div>
          </div>
          <ChevronRight
            className={`h-4 w-4 text-[#737373] transition-transform ${showSeasonDetails ? "rotate-90 text-white" : "group-hover:translate-x-0.5"}`}
          />
        </div>
      </div>

      {/* Season Expandable Advisory Panel */}
      {showSeasonDetails && (
        <div className="rounded-xl border border-[#262626] bg-[#111111] p-5 text-xs text-[#d4d4d4]">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#a3a3a3]" />
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-semibold text-white">মূল ফসলসমূহ:</span>
                {season.keyCrops.map((c) => (
                  <span
                    key={c}
                    className="rounded bg-[#1a1a1a] px-2 py-0.5 text-[11px] font-medium text-[#e5e5e5] border border-[#262626]"
                  >
                    {c}
                  </span>
                ))}
              </div>
              <div className="flex items-start gap-1.5 text-[#fbbf24]">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  <strong className="text-white">আবহাওয়ার ঝুঁকি:</strong> {season.climateRisk}
                </span>
              </div>
              <p className="text-[#a3a3a3]">
                <strong className="text-white">সাধারণ নির্দেশিকা:</strong> {season.advice}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
