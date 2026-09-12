import React from "react";
import { Zap, Sparkles } from "lucide-react";

interface QuickActionChipsProps {
  onSelectQuery: (query: string, autoRun: boolean) => void;
  isLoading?: boolean;
}

const COMMON_SYMPTOMS = [
  {
    crop: "আলু",
    label: "আলুর নাবি ধসা (পাতা কালো ও পচা)",
    query: "আলু গাছের পাতায় পানিভেজা কালো ছোপ এবং পচন ধরছে, দ্রুত সমাধান চাই।",
  },
  {
    crop: "ধান",
    label: "ধানের পাতা ব্লাস্ট ও মাজরা পোকা",
    query: "ধানের পাতায় চোখের মতো দাগ এবং কাঁচি দিয়ে ডগা কেটে দিচ্ছে পোকা।",
  },
  {
    crop: "বেগুন",
    label: "বেগুন গাছের ডগা ও ফল ছিদ্রকারী পোকা",
    query: "বেগুন গাছের কচি ডগা নুয়ে পড়ছে এবং বেগুনের গায়ে পোকা ছিদ্র করে মল ফেলছে।",
  },
  {
    crop: "টমেটো",
    label: "টমেটোর পাতা কোঁকড়ানো ও হলুদ হওয়া",
    query: "টমেটো গাছের কচি পাতা কুঁকড়ে যাচ্ছে, সাদা মাছির উপদ্রব বেশি।",
  },
  {
    crop: "সরিষা",
    label: "সরিষার জাব পোকা ও কালো দাগ",
    query: "সরিষার ফুল ও কচি ফলে কোটি কোটি কালো জাব পোকা রস চুষে খাচ্ছে।",
  },
  {
    crop: "মরিচ",
    label: "মরিচ গাছের ডাইব্যাক ও পাতা ঝরে যাওয়া",
    query: "মরিচ গাছের ডগা উপর থেকে শুকিয়ে কালো হয়ে মরছে এবং পাতা ঝরছে।",
  },
];

export const QuickActionChips: React.FC<QuickActionChipsProps> = ({
  onSelectQuery,
  isLoading = false,
}) => {
  return (
    <div id="quick-action-chips" className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-[#fbbf24]" />
          <span className="text-xs font-semibold text-[#e5e5e5] uppercase tracking-wider">
            তাৎক্ষণিক লক্ষণ নির্বাচন (১-ক্লিকে রোগ নির্ণয়)
          </span>
        </div>
        <span className="text-[10px] text-[#737373] hidden sm:inline">
          ক্লিক করলেই দ্রুত সমাধান তৈরি হবে
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {COMMON_SYMPTOMS.map((item, idx) => (
          <button
            key={idx}
            id={`quick-chip-${idx}`}
            type="button"
            disabled={isLoading}
            onClick={() => onSelectQuery(item.query, true)}
            className="group flex items-center gap-2 rounded-lg border border-[#262626] bg-[#111111] px-3 py-2 text-left text-xs transition-all hover:border-[#525252] hover:bg-[#1a1a1a] active:scale-[0.98] disabled:opacity-50"
          >
            <span className="rounded bg-[#1f1f1f] px-1.5 py-0.5 text-[10px] font-medium text-[#fbbf24] border border-[#333333]">
              {item.crop}
            </span>
            <span className="text-[#d4d4d4] group-hover:text-white transition-colors">
              {item.label}
            </span>
            <Sparkles className="h-3 w-3 text-[#737373] group-hover:text-[#86efac] transition-colors ml-0.5" />
          </button>
        ))}
      </div>
    </div>
  );
};
