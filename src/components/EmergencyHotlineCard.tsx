import React from "react";
import { PhoneCall, ShieldAlert, CloudSun, Radio } from "lucide-react";

export const EmergencyHotlineCard: React.FC = () => {
  return (
    <div className="rounded-xl border border-[#262626] bg-[#111111] p-4 sm:p-5">
      <div className="flex items-center justify-between border-b border-[#262626] pb-3 mb-3">
        <div className="flex items-center gap-2">
          <PhoneCall className="h-4 w-4 text-[#86efac]" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
            সরকারি জরুরি কৃষি সেবা ও হটলাইন
          </h3>
        </div>
        <span className="rounded bg-[#1a1a1a] px-2 py-0.5 text-[10px] text-[#a3a3a3] border border-[#333333]">
          টোল-ফ্রি / জাতীয় সার্ভিস
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <a
          href="tel:16123"
          className="group flex items-start gap-3 rounded-lg border border-[#262626] bg-[#171717] p-3 transition-colors hover:border-[#86efac]/50 hover:bg-[#1f1f1f]"
        >
          <div className="rounded-lg bg-[#86efac]/10 p-2 text-[#86efac] shrink-0">
            <Radio className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white group-hover:text-[#86efac] transition-colors">
                ১৬১২৩
              </span>
              <span className="text-[10px] text-[#737373]">(DAE)</span>
            </div>
            <p className="text-[11px] text-[#a3a3a3] mt-0.5">
              কৃষি তথ্য সার্ভিস (AIS) কল সেন্টার
            </p>
          </div>
        </a>

        <a
          href="tel:333"
          className="group flex items-start gap-3 rounded-lg border border-[#262626] bg-[#171717] p-3 transition-colors hover:border-[#fbbf24]/50 hover:bg-[#1f1f1f]"
        >
          <div className="rounded-lg bg-[#fbbf24]/10 p-2 text-[#fbbf24] shrink-0">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white group-hover:text-[#fbbf24] transition-colors">
                ৩Mz
              </span>
              <span className="text-[10px] text-[#737373]">(ডায়াল ৩৩৩)</span>
            </div>
            <p className="text-[11px] text-[#a3a3a3] mt-0.5">
              জাতীয় তথ্য বাতায়ন ও সরকারি কৃষি সহায়তা
            </p>
          </div>
        </a>

        <a
          href="tel:1090"
          className="group flex items-start gap-3 rounded-lg border border-[#262626] bg-[#171717] p-3 transition-colors hover:border-cyan-400/50 hover:bg-[#1f1f1f]"
        >
          <div className="rounded-lg bg-cyan-400/10 p-2 text-cyan-400 shrink-0">
            <CloudSun className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                ১০৯০
              </span>
              <span className="text-[10px] text-[#737373]">(আবহাওয়া)</span>
            </div>
            <p className="text-[11px] text-[#a3a3a3] mt-0.5">
              বন্যা ও দুর্যোগের আগাম সতর্কবার্তা
            </p>
          </div>
        </a>
      </div>
    </div>
  );
};
