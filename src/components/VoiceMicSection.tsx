import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Edit3, Check, Trash2, Sparkles, AlertCircle, Radio } from "lucide-react";
import { SAMPLE_QUERIES } from "../data/sampleData";

interface VoiceMicSectionProps {
  speechText: string;
  onSpeechChange: (text: string) => void;
  isListening: boolean;
  onToggleListening: () => void;
  isSpeechSupported: boolean;
  onOpenLiveVoice?: () => void;
}

export const VoiceMicSection: React.FC<VoiceMicSectionProps> = ({
  speechText,
  onSpeechChange,
  isListening,
  onToggleListening,
  isSpeechSupported,
  onOpenLiveVoice,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(speechText);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditText(speechText);
  }, [speechText]);

  const handleSaveEdit = () => {
    onSpeechChange(editText.trim());
    setIsEditing(false);
  };

  const handleSelectSample = (sampleText: string) => {
    onSpeechChange(sampleText);
    setIsEditing(false);
  };

  return (
    <div className="rounded-xl border border-[#262626] bg-[#111111] p-6 flex flex-col justify-between">
      <div>
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-[#1a1a1a] text-[11px] font-bold text-white border border-[#262626]">
              ১
            </span>
            <h2 className="text-xs uppercase tracking-widest text-[#a3a3a3] font-semibold">
              ধাপ ১: মুখে বলুন বা লিখুন (Voice / Text)
            </h2>
          </div>
          <p className="text-lg font-medium text-white mt-1">
            আপনার আঞ্চলিক ভাষায় সমস্যার কথা জানান
          </p>
        </div>

        {/* Center Voice Button */}
        <div className="my-5 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center">
            {isListening && (
              <div className="absolute h-28 w-28 rounded-full border border-red-500/40 animate-ping opacity-60" />
            )}

            <button
              id="voice-mic-main-btn"
              type="button"
              onClick={onToggleListening}
              className={`relative z-10 flex h-20 w-20 items-center justify-center rounded-full transition-all duration-200 shadow-xl ${
                isListening
                  ? "bg-[#2e1a1a] text-[#f87171] border border-[#f87171]/50 scale-105"
                  : "bg-white text-black border border-white hover:bg-[#e5e5e5]"
              }`}
              title={isListening ? "রেকর্ডিং থামাতে চাপুন" : "কথা বলতে মাইক্রোফোন চালু করুন"}
            >
              {isListening ? (
                <MicOff className="h-8 w-8 text-[#f87171]" />
              ) : (
                <Mic className="h-8 w-8 text-black" />
              )}
            </button>
          </div>

          {/* Live Status indicator & Waveform */}
          <div className="mt-3.5 flex h-6 items-center justify-center gap-2">
            {isListening ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  <span className="h-3 w-1 bg-[#f87171] animate-audio-bar" style={{ animationDelay: "0ms" }} />
                  <span className="h-5 w-1 bg-[#f87171] animate-audio-bar" style={{ animationDelay: "150ms" }} />
                  <span className="h-4 w-1 bg-[#f87171] animate-audio-bar" style={{ animationDelay: "300ms" }} />
                  <span className="h-5 w-1 bg-[#f87171] animate-audio-bar" style={{ animationDelay: "450ms" }} />
                  <span className="h-3 w-1 bg-[#f87171] animate-audio-bar" style={{ animationDelay: "600ms" }} />
                </div>
                <span className="font-mono text-xs font-medium text-[#f87171]">
                  কথা শুনছি (বলুন)...
                </span>
              </div>
            ) : (
              <span className="text-xs text-[#a3a3a3]">
                {speechText ? "বক্তব্য প্রস্তুত আছে" : "কথা বলতে ওপরের মাইকে চাপুন অথবা সরাসরি লাইভ কথা বলুন"}
              </span>
            )}
          </div>

          {/* Real-time Gemini 3.1 Live Voice Button */}
          {onOpenLiveVoice && (
            <div className="mt-3 flex items-center justify-center">
              <button
                type="button"
                onClick={onOpenLiveVoice}
                className="group flex items-center gap-2 rounded-full border border-[#86efac]/40 bg-[#122617] px-4 py-1.5 text-xs font-bold text-[#86efac] hover:bg-[#1a3821] hover:border-[#86efac] transition-all shadow-md active:scale-95"
              >
                <Radio className="h-3.5 w-3.5 text-[#86efac] animate-pulse" />
                <span>লাইভ মুখে কথা বলুন (Gemini 3.1 Live)</span>
                <span className="rounded-full bg-[#86efac]/20 px-1.5 py-0.2 text-[9px] text-[#86efac]">LIVE</span>
              </button>
            </div>
          )}
        </div>

        {/* Transcript Card / Text Editor */}
        <div className="relative rounded-lg border border-[#262626] bg-[#1a1a1a] p-4 transition-colors focus-within:border-[#404040]">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#737373]">
              আপনার সমস্যা / প্রশ্ন
            </span>
            <div className="flex items-center gap-1.5">
              {speechText && !isEditing && (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1 rounded px-2 py-0.5 text-[11px] text-[#a3a3a3] hover:bg-[#262626] hover:text-white"
                    title="লেখা সংশোধন করুন"
                  >
                    <Edit3 className="h-3 w-3" />
                    সংশোধন
                  </button>
                  <button
                    type="button"
                    onClick={() => onSpeechChange("")}
                    className="flex items-center gap-1 rounded px-2 py-0.5 text-[11px] text-[#f87171] hover:bg-[#2e1a1a]"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="h-3 w-3" />
                    মুছুন
                  </button>
                </>
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <textarea
                ref={textareaRef}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                placeholder="এখানে আপনার ফসলের লক্ষণ বিস্তারিত লিখুন..."
                rows={3}
                className="w-full resize-none rounded border border-[#333333] bg-[#111111] p-2.5 text-xs text-white placeholder-[#737373] focus:border-white focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded border border-[#333333] bg-[#1a1a1a] px-3 py-1 text-xs text-[#a3a3a3] hover:text-white"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="flex items-center gap-1 rounded bg-white px-3 py-1 text-xs font-bold text-black hover:bg-[#e5e5e5]"
                >
                  <Check className="h-3.5 w-3.5" />
                  সংরক্ষণ
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setIsEditing(true)}
              className="cursor-pointer min-h-[48px] text-xs leading-relaxed"
            >
              {speechText ? (
                <p className="text-[#e5e5e5] font-normal">"{speechText}"</p>
              ) : (
                <p className="text-[#737373] italic">
                  মাইক্রোফোনে বলুন অথবা এখানে ক্লিক করে বাংলায় টাইপ করুন...
                </p>
              )}
            </div>
          )}

          {!isSpeechSupported && (
            <div className="mt-2.5 flex items-center gap-1.5 rounded bg-[#2e1a1a] border border-[#f87171]/20 p-2 text-xs text-[#f87171]">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>ব্রাউজারে ভয়েস সাপোর্ট নেই — টাইপ করে লিখুন।</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Sample Questions */}
      <div className="mt-4 pt-3 border-t border-[#1a1a1a]">
        <div className="mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-[#737373] font-semibold">
          <Sparkles className="h-3 w-3 text-white" />
          <span>উদাহরণ প্রশ্ন:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_QUERIES.slice(0, 3).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelectSample(item.query)}
              className="rounded border border-[#262626] bg-[#1a1a1a] px-2.5 py-1 text-[11px] text-[#a3a3a3] transition-colors hover:border-[#404040] hover:text-white"
            >
              <strong className="text-white font-medium">{item.crop}:</strong> {item.shortDesc}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
