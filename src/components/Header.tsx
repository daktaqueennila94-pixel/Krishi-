import React from "react";
import { Sprout, Settings, History, BookOpen, Volume2, HelpCircle, Radio } from "lucide-react";

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onOpenCropLibrary: () => void;
  onOpenHowToUse: () => void;
  onOpenLiveVoice?: () => void;
  historyCount: number;
  isAudioPlaying: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onOpenHistory,
  onOpenCropLibrary,
  onOpenHowToUse,
  onOpenLiveVoice,
  historyCount,
  isAudioPlaying,
}) => {
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-[#262626] bg-[#0a0a0a]/90 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-4 sm:px-8">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#171717] border border-[#262626] text-white">
            <Sprout className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-lg font-bold tracking-tight text-white">
                কৃষি বন্ধু <span className="font-mono text-xs font-semibold text-[#a3a3a3]">AI</span>
              </span>
              {isAudioPlaying && (
                <span className="flex items-center gap-1 rounded bg-[#1a2e1a] px-2 py-0.5 text-[11px] font-medium text-[#4ade80]">
                  <Volume2 className="h-3 w-3 animate-pulse text-[#4ade80]" />
                  শব্দ সক্রিয়
                </span>
              )}
            </div>
            <p className="hidden text-[11px] uppercase tracking-wider text-[#737373] sm:block">
              DAE & BARI Agro Intelligence
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {onOpenLiveVoice && (
            <button
              id="live-voice-header-btn"
              type="button"
              onClick={onOpenLiveVoice}
              className="flex items-center gap-1.5 rounded-lg border border-[#86efac]/40 bg-[#142618] px-3 py-1.5 text-xs font-semibold text-[#86efac] transition-all hover:bg-[#1b3320] hover:border-[#86efac] shadow-sm animate-pulse"
              title="লাইভ মুখে মুখে কথা বলুন (Gemini 3.1 Live API)"
            >
              <Radio className="h-3.5 w-3.5 text-[#86efac]" />
              <span>লাইভ কথা</span>
            </button>
          )}

          <button
            id="how-to-use-btn"
            type="button"
            onClick={onOpenHowToUse}
            className="flex items-center gap-1.5 rounded-lg border border-[#262626] bg-[#111111] px-3 py-1.5 text-xs font-medium text-[#a3a3a3] transition-colors hover:border-[#404040] hover:text-white"
            title="সহজ ব্যবহার নির্দেশিকা"
          >
            <HelpCircle className="h-3.5 w-3.5 text-white" />
            <span className="hidden sm:inline">কীভাবে চালাবেন</span>
          </button>

          <button
            id="crop-library-btn"
            type="button"
            onClick={onOpenCropLibrary}
            className="flex items-center gap-1.5 rounded-lg border border-[#262626] bg-[#111111] px-3 py-1.5 text-xs font-medium text-[#a3a3a3] transition-colors hover:border-[#404040] hover:text-white"
            title="ফসলের রোগ ও সমাধান লাইব্রেরি"
          >
            <BookOpen className="h-3.5 w-3.5 text-[#e5e5e5]" />
            <span className="hidden sm:inline">ফসল গাইড</span>
          </button>

          <button
            id="history-drawer-btn"
            type="button"
            onClick={onOpenHistory}
            className="relative flex items-center gap-1.5 rounded-lg border border-[#262626] bg-[#111111] px-3 py-1.5 text-xs font-medium text-[#a3a3a3] transition-colors hover:border-[#404040] hover:text-white"
            title="সংরক্ষিত পরামর্শ ইতিহাস"
          >
            <History className="h-3.5 w-3.5 text-[#a3a3a3]" />
            <span className="hidden sm:inline">ইতিহাস</span>
            {historyCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-white text-black text-[10px] font-bold">
                {historyCount}
              </span>
            )}
          </button>

          <button
            id="settings-drawer-btn"
            type="button"
            onClick={onOpenSettings}
            className="rounded-lg border border-[#262626] bg-[#111111] p-2 text-[#a3a3a3] transition-colors hover:border-[#404040] hover:text-white"
            title="সেটিংস ও ভয়েস কনফিগারেশন"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
