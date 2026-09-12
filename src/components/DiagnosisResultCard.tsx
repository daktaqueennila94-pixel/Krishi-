import React, { useState } from "react";
import {
  Volume2,
  VolumeX,
  RotateCcw,
  PhoneCall,
  ShieldCheck,
  AlertOctagon,
  HelpCircle,
  Copy,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Printer,
  Share2,
  Type,
  Leaf,
} from "lucide-react";
import { DiagnosisResult } from "../types";

interface DiagnosisResultCardProps {
  result: DiagnosisResult;
  isPlayingAudio: boolean;
  onPlayAudio: () => void;
  onStopAudio: () => void;
  audioRate: number;
  onChangeAudioRate: (rate: number) => void;
  voiceProviderName: string;
}

export const DiagnosisResultCard: React.FC<DiagnosisResultCardProps> = ({
  result,
  isPlayingAudio,
  onPlayAudio,
  onStopAudio,
  audioRate,
  onChangeAudioRate,
  voiceProviderName,
}) => {
  const [copied, setCopied] = useState(false);
  const [textSize, setTextSize] = useState<"sm" | "base" | "lg">("base");
  const [expandedSections, setExpandedSections] = useState({
    problem: true,
    cause: true,
    solution: true,
    organicRemedy: true,
    prevention: true,
  });

  const toggleSection = (key: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result.rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const shareText = `*🌾 কৃষি বন্ধু এআই প্রেসক্রিপশন*\n\n📅 তারিখ: ${new Date(result.timestamp).toLocaleDateString("bn-BD")}\n📍 এলাকা: ${result.location || "সারাদেশ"}\n🌤️ ঋতু: ${result.season}\n\n${result.rawText}\n\n📞 সরকারি কৃষি কল সেন্টার: ১৬১২৩`;
    const encoded = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
  };

  const { structured } = result;

  const fontClass =
    textSize === "sm"
      ? "text-xs leading-relaxed"
      : textSize === "lg"
      ? "text-base leading-loose"
      : "text-sm leading-relaxed";

  return (
    <div
      id="diagnosis-result-card"
      className="scroll-mt-24 rounded-xl border border-[#262626] bg-[#111111] p-6 sm:p-8 shadow-2xl print:border-none print:bg-white print:text-black print:p-0"
    >
      {/* Top Header & Audio Bar */}
      <div className="mb-6 flex flex-col gap-4 border-b border-[#262626] pb-6 sm:flex-row sm:items-center sm:justify-between print:border-black">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-[#1a1a1a] text-white print:hidden">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </span>
            <h3 className="text-xl font-bold tracking-tight text-white print:text-black">
              এআই কৃষি সমাধান ও প্রেসক্রিপশন
            </h3>
          </div>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-[#737373] print:text-black">
            {result.location ? `LOC: ${result.location} | ` : ""}
            SEASON: {result.season} | {new Date(result.timestamp).toLocaleDateString("bn-BD")}
          </p>
        </div>

        {/* Action Controls (Audio, Zoom, Print, Share, Copy) */}
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          {/* Audio Player */}
          <div className="flex items-center rounded-lg border border-[#262626] bg-[#1a1a1a] p-1">
            <button
              id="audio-play-toggle-btn"
              type="button"
              onClick={isPlayingAudio ? onStopAudio : onPlayAudio}
              className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold transition-all ${
                isPlayingAudio
                  ? "bg-[#2e1a1a] text-[#f87171] border border-[#f87171]/40"
                  : "bg-white text-black hover:bg-[#e5e5e5]"
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <VolumeX className="h-3.5 w-3.5 text-[#f87171]" />
                  <span>থামান</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-3.5 w-3.5 text-black" />
                  <span>শুনুন</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onPlayAudio}
              className="rounded p-1.5 text-[#a3a3a3] hover:bg-[#262626] hover:text-white transition-colors"
              title="আবার শুনুন"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            {/* Speed Selector */}
            <div className="ml-1 border-l border-[#262626] pl-1">
              <button
                type="button"
                onClick={() => {
                  const nextRate = audioRate === 0.8 ? 1.0 : audioRate === 1.0 ? 1.2 : 0.8;
                  onChangeAudioRate(nextRate);
                }}
                className="rounded px-1.5 py-0.5 font-mono text-[11px] text-[#a3a3a3] hover:text-white"
                title="ভয়েসের গতি পরিবর্তন করুন"
              >
                {audioRate}x
              </button>
            </div>
          </div>

          {/* Text Size Switcher */}
          <div className="flex items-center rounded-lg border border-[#262626] bg-[#1a1a1a] p-1">
            <button
              type="button"
              onClick={() => setTextSize(textSize === "sm" ? "base" : textSize === "base" ? "lg" : "sm")}
              className="flex items-center gap-1 px-2 py-1 text-xs text-[#a3a3a3] hover:text-white"
              title="লেখা বড় বা ছোট করুন (A- / A / A+)"
            >
              <Type className="h-3 w-3" />
              <span className="font-mono text-[11px] font-bold">
                {textSize === "sm" ? "A-" : textSize === "base" ? "A" : "A+"}
              </span>
            </button>
          </div>

          {/* WhatsApp Share */}
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="flex items-center gap-1 rounded-lg border border-[#262626] bg-[#1a1a1a] px-2.5 py-1.5 text-xs font-medium text-[#4ade80] hover:border-[#4ade80]/40 transition-colors"
            title="হোয়াটসঅ্যাপে শেয়ার করুন"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">শেয়ার</span>
          </button>

          {/* Print Prescription */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1 rounded-lg border border-[#262626] bg-[#1a1a1a] px-2.5 py-1.5 text-xs font-medium text-[#a3a3a3] hover:border-[#404040] hover:text-white transition-colors"
            title="প্রেসক্রিপশন প্রিন্ট করুন"
          >
            <Printer className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">প্রিন্ট</span>
          </button>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 rounded-lg border border-[#262626] bg-[#1a1a1a] px-2.5 py-1.5 text-xs font-medium text-[#a3a3a3] hover:border-[#404040] hover:text-white transition-colors"
            title="পরামর্শ কপি করুন"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-[#4ade80]" />
                <span className="text-[#4ade80]">কপি</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>কপি</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Prominent Bangla Audio Banner */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border border-[#4ade80]/30 bg-[#122012] p-3.5 sm:p-4 text-xs print:hidden">
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isPlayingAudio ? "bg-[#4ade80] text-black animate-pulse" : "bg-[#4ade80]/20 text-[#4ade80]"}`}>
            <Volume2 className="h-4 w-4" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">কৃষি বন্ধুর পরামর্শ বাংলায় শুনুন</p>
            <p className="text-[#a3a3a3] text-[11px] sm:text-xs">
              {isPlayingAudio ? `ভয়েস চলছে (${voiceProviderName})` : "খাঁটি ও স্পষ্ট বাংলায় পুরো দিকনির্দেশনা শুনুন"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-center">
          {isPlayingAudio && (
            <div className="flex items-center gap-1 mr-2">
              <span className="h-3 w-1 bg-[#4ade80] animate-audio-bar" style={{ animationDelay: "0ms" }} />
              <span className="h-4 w-1 bg-[#4ade80] animate-audio-bar" style={{ animationDelay: "150ms" }} />
              <span className="h-2 w-1 bg-[#4ade80] animate-audio-bar" style={{ animationDelay: "300ms" }} />
              <span className="h-5 w-1 bg-[#4ade80] animate-audio-bar" style={{ animationDelay: "450ms" }} />
            </div>
          )}
          <button
            type="button"
            onClick={isPlayingAudio ? onStopAudio : onPlayAudio}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              isPlayingAudio
                ? "bg-[#2e1a1a] text-[#f87171] border border-[#f87171]/40 hover:bg-[#3d2020]"
                : "bg-[#4ade80] text-black hover:bg-[#22c55e] shadow-md shadow-[#4ade80]/20"
            }`}
          >
            {isPlayingAudio ? (
              <>
                <VolumeX className="h-3.5 w-3.5" />
                <span>পড়া থামান</span>
              </>
            ) : (
              <>
                <Volume2 className="h-3.5 w-3.5" />
                <span>বাংলায় শুনুন</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Structured Solution Cards */}
      <div className="space-y-4">
        {/* Section 1: Problem */}
        {structured.problem && (
          <div className="rounded-lg border border-[#262626] bg-[#1a1a1a] p-5 print:border-black print:bg-white">
            <div
              onClick={() => toggleSection("problem")}
              className="flex cursor-pointer items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-[#2e1a1a] text-[#f87171] print:bg-gray-100">
                  <AlertOctagon className="h-3.5 w-3.5" />
                </div>
                <h4 className="text-sm font-semibold tracking-wide text-white print:text-black">
                  সমস্যাডা কী (শনাক্তকৃত রোগ / পোকা)
                </h4>
              </div>
              <div className="print:hidden">
                {expandedSections.problem ? (
                  <ChevronUp className="h-4 w-4 text-[#737373]" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-[#737373]" />
                )}
              </div>
            </div>

            {expandedSections.problem && (
              <div className={`mt-3 text-[#d4d4d4] pl-8 print:text-black ${fontClass}`}>
                {structured.problem}
              </div>
            )}
          </div>
        )}

        {/* Section 2: Cause */}
        {structured.cause && (
          <div className="rounded-lg border border-[#262626] bg-[#1a1a1a] p-5 print:border-black print:bg-white">
            <div
              onClick={() => toggleSection("cause")}
              className="flex cursor-pointer items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-[#2e251a] text-[#fbbf24] print:bg-gray-100">
                  <HelpCircle className="h-3.5 w-3.5" />
                </div>
                <h4 className="text-sm font-semibold tracking-wide text-white print:text-black">
                  ক্যান হইলো (আবহাওয়া ও পরিবেশগত কারণ)
                </h4>
              </div>
              <div className="print:hidden">
                {expandedSections.cause ? (
                  <ChevronUp className="h-4 w-4 text-[#737373]" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-[#737373]" />
                )}
              </div>
            </div>

            {expandedSections.cause && (
              <div className={`mt-3 text-[#d4d4d4] pl-8 print:text-black ${fontClass}`}>
                {structured.cause}
              </div>
            )}
          </div>
        )}

        {/* Section 3: Immediate Action */}
        {structured.solution && (
          <div className="rounded-lg border border-[#262626] bg-[#141d14] p-5 print:border-black print:bg-white">
            <div
              onClick={() => toggleSection("solution")}
              className="flex cursor-pointer items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-[#1a2e1a] text-[#4ade80] print:bg-gray-100">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <h4 className="text-sm font-semibold tracking-wide text-[#4ade80] print:text-black print:font-bold">
                  অহন কী করবেন (তাৎক্ষণিক সমাধান ও প্রেসক্রিপশন)
                </h4>
              </div>
              <div className="print:hidden">
                {expandedSections.solution ? (
                  <ChevronUp className="h-4 w-4 text-[#737373]" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-[#737373]" />
                )}
              </div>
            </div>

            {expandedSections.solution && (
              <div className={`mt-3 text-[#e5e5e5] pl-8 print:text-black font-medium ${fontClass}`}>
                {structured.solution}
              </div>
            )}
          </div>
        )}

        {/* Section: Organic & Natural Remedy */}
        {structured.organicRemedy && (
          <div className="rounded-lg border border-[#262626] bg-[#121c16] p-5 print:border-black print:bg-white">
            <div
              onClick={() => toggleSection("organicRemedy")}
              className="flex cursor-pointer items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-[#13301f] text-[#34d399] print:bg-gray-100">
                  <Leaf className="h-3.5 w-3.5" />
                </div>
                <h4 className="text-sm font-semibold tracking-wide text-[#34d399] print:text-black print:font-bold">
                  জৈব ও প্রাকৃতিক প্রতিকার (ঘরোয়া পরিবেশবান্ধব সমাধান)
                </h4>
              </div>
              <div className="print:hidden">
                {expandedSections.organicRemedy ? (
                  <ChevronUp className="h-4 w-4 text-[#737373]" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-[#737373]" />
                )}
              </div>
            </div>

            {expandedSections.organicRemedy && (
              <div className={`mt-3 text-[#d1fae5] pl-8 print:text-black ${fontClass}`}>
                {structured.organicRemedy}
              </div>
            )}
          </div>
        )}

        {/* Section 4: Future Prevention */}
        {structured.prevention && (
          <div className="rounded-lg border border-[#262626] bg-[#1a1a1a] p-5 print:border-black print:bg-white">
            <div
              onClick={() => toggleSection("prevention")}
              className="flex cursor-pointer items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-[#172554] text-[#60a5fa] print:bg-gray-100">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
                <h4 className="text-sm font-semibold tracking-wide text-white print:text-black">
                  সামনের বার সাবধানতা (ভবিষ্যত প্রতিরোধ ব্যবস্থা)
                </h4>
              </div>
              <div className="print:hidden">
                {expandedSections.prevention ? (
                  <ChevronUp className="h-4 w-4 text-[#737373]" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-[#737373]" />
                )}
              </div>
            </div>

            {expandedSections.prevention && (
              <div className={`mt-3 text-[#d4d4d4] pl-8 print:text-black ${fontClass}`}>
                {structured.prevention}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Important Official Disclaimer & Safety Note */}
      <div className="mt-6 rounded-lg border border-[#262626] bg-[#141414] p-4 text-xs text-[#737373] leading-relaxed print:border-black print:bg-gray-50 print:text-black">
        <p>
          <strong className="text-[#a3a3a3] uppercase tracking-wider text-[10px] print:text-black">সতর্কীকরণ:</strong> এই এআই পরামর্শটি কৃষি সম্প্রসারণ অধিদপ্তর (DAE) ও BARI নীতিমালার ভিত্তিতে প্রস্তুতকৃত। রাসায়নিক ও সারের সঠিক মাত্রার জন্য স্থানীয় উপ-সহকারী কৃষি কর্মকর্তা (SAAO)-র সাথে যাচাই করে নিন।
        </p>
      </div>

      {/* Official Government Agriculture Helpline 16123 */}
      <div className="mt-4 flex flex-col items-center justify-between gap-4 rounded-xl border border-[#262626] bg-white text-black p-6 sm:flex-row print:border-black">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-black text-white print:hidden">
            <PhoneCall className="h-5 w-5" />
          </div>
          <div>
            <h5 className="text-sm font-bold uppercase tracking-wide">
              কৃষি কল সেন্টার — সরাসরি বিশেষজ্ঞের পরামর্শ
            </h5>
            <p className="text-xs text-[#525252] print:text-black">
              টোল-ফ্রি সরকারি হটলাইন সেবা (সকাল ৯টা - বিকাল ৫টা)
            </p>
          </div>
        </div>

        <a
          href="tel:16123"
          className="flex items-center gap-1.5 rounded-lg bg-black px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#262626] transition-colors shrink-0 print:border print:border-black print:text-black"
        >
          <PhoneCall className="h-3.5 w-3.5" />
          <span>কল ১৬১২৩</span>
        </a>
      </div>
    </div>
  );
};
