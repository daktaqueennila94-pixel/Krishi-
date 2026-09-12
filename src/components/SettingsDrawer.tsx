import React, { useState } from "react";
import { X, Key, Mic, Shield, Check, Info } from "lucide-react";

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  geminiKey: string;
  onSaveGeminiKey: (key: string) => void;
  cambKey: string;
  cambVoiceId: string;
  onSaveCambConfig: (key: string, voiceId: string) => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  geminiKey,
  onSaveGeminiKey,
  cambKey,
  cambVoiceId,
  onSaveCambConfig,
}) => {
  const [tempGeminiKey, setTempGeminiKey] = useState(geminiKey);
  const [tempCambKey, setTempCambKey] = useState(cambKey);
  const [tempCambVoiceId, setTempCambVoiceId] = useState(cambVoiceId);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveGeminiKey(tempGeminiKey.trim());
    onSaveCambConfig(tempCambKey.trim(), tempCambVoiceId.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleClearAll = () => {
    setTempGeminiKey("");
    setTempCambKey("");
    setTempCambVoiceId("");
    onSaveGeminiKey("");
    onSaveCambConfig("", "");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-lg rounded-xl border border-[#262626] bg-[#111111] p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between border-b border-[#262626] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1a1a1a] text-white">
              <Key className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                এআই ও ভয়েস কনফিগারেশন
              </h3>
              <p className="text-[11px] text-[#737373]">
                Client & Server Settings
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

        <form onSubmit={handleSave} className="space-y-4">
          {/* Gemini API Key */}
          <div className="space-y-1.5">
            <label className="flex items-center justify-between text-xs font-medium text-white">
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-[#a3a3a3]" />
                Gemini API Key (ঐচ্ছিক)
              </span>
              {tempGeminiKey && (
                <span className="text-[10px] text-[#4ade80] font-mono">
                  ACTIVE
                </span>
              )}
            </label>
            <input
              type="password"
              value={tempGeminiKey}
              onChange={(e) => setTempGeminiKey(e.target.value)}
              placeholder="AI Studio API key (ডিফল্ট ব্যাকএন্ড যুক্ত আছে)"
              className="w-full rounded border border-[#262626] bg-[#1a1a1a] px-3 py-2 text-xs text-white placeholder-[#737373] focus:border-white focus:outline-none"
            />
            <p className="text-[11px] text-[#737373]">
              অ্যাপের ব্যাকএন্ডে স্বয়ংক্রিয়ভাবে Gemini API সংযোগ রয়েছে। নিজস্ব কি ব্যবহারের ক্ষেত্রে এখানে ইনপুট দিন।
            </p>
          </div>

          {/* Camb.ai Voice TTS */}
          <div className="rounded-lg border border-[#262626] bg-[#171717] p-4 space-y-3">
            <div className="flex items-start gap-2">
              <Mic className="mt-0.5 h-4 w-4 shrink-0 text-white" />
              <div>
                <h4 className="text-xs font-semibold text-white">
                  রিয়েল বাংলাদেশি Voice (Camb.ai — ঐচ্ছিক)
                </h4>
                <p className="text-[11px] text-[#737373]">
                  Camb.ai দিলে খাঁটি বাংলাদেশি আঞ্চলিক বাংলা উচ্চারণে ভয়েস আউটপুট পাওয়া যায়।
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <span className="block text-[11px] uppercase tracking-wider text-[#737373] mb-1">
                  Camb.ai API Key:
                </span>
                <input
                  type="password"
                  value={tempCambKey}
                  onChange={(e) => setTempCambKey(e.target.value)}
                  placeholder="Camb.ai x-api-key"
                  className="w-full rounded border border-[#262626] bg-[#111111] px-3 py-1.5 text-xs text-white placeholder-[#737373] focus:border-white focus:outline-none"
                />
              </div>

              <div>
                <span className="block text-[11px] uppercase tracking-wider text-[#737373] mb-1">
                  Camb Voice ID:
                </span>
                <input
                  type="text"
                  value={tempCambVoiceId}
                  onChange={(e) => setTempCambVoiceId(e.target.value)}
                  placeholder="Voice ID (যেমন: 8821)"
                  className="w-full rounded border border-[#262626] bg-[#111111] px-3 py-1.5 text-xs text-white placeholder-[#737373] focus:border-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="flex items-center gap-2 rounded bg-[#171717] p-3 text-[11px] text-[#737373]">
            <Info className="h-3.5 w-3.5 shrink-0 text-[#737373]" />
            <span>
              আপনার কি-সমূহ শুধুমাত্র ব্রাউজারের লোকাল স্টোরেজে সংরক্ষিত থাকে।
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-[#737373] hover:text-[#f87171] transition-colors"
            >
              সব রিসেট
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded border border-[#262626] bg-[#1a1a1a] px-3 py-2 text-xs font-medium text-[#a3a3a3] hover:text-white"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="flex items-center gap-1 rounded bg-white px-4 py-2 text-xs font-bold text-black hover:bg-[#e5e5e5] transition-colors"
              >
                {savedSuccess ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    সংরক্ষিত!
                  </>
                ) : (
                  "সংরক্ষণ করুন"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
