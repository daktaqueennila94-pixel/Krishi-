import React from "react";
import { X, Mic, Camera, Sparkles, PhoneCall, CheckCircle, Volume2, ShieldCheck } from "lucide-react";

interface HowToUseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToUseModal: React.FC<HowToUseModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const steps = [
    {
      icon: <Mic className="h-5 w-5 text-white" />,
      title: "১. সমস্যা মুখে বলুন বা লিখুন",
      desc: "মাইক্রোফোন বাটনে চাপ দিয়ে আপনার নিজস্ব আঞ্চলিক ভাষায় সমস্যা বলুন (যেমন: 'আলুর পাতায় কালো দাগ', 'ধানের শীষ শুকিয়ে যাচ্ছে')। প্রয়োজনে টাইপও করতে পারেন।",
      tip: "টিপস: এলাকার নাম বা ঋতুর কথা উল্লেখ করলে আরও নিখুঁত পরামর্শ পাবেন।",
    },
    {
      icon: <Camera className="h-5 w-5 text-white" />,
      title: "২. আক্রান্ত ফসলের ছবি তুলুন",
      desc: "ক্যামেরা দিয়ে আক্রান্ত গাছের পাতা, ডগা বা ফলের স্পষ্ট ও উজ্জ্বল ছবি তুলুন। ছবি দিলে এআই রোগের ধরন দ্রুত নিখুঁতভাবে শনাক্ত করতে পারে।",
      tip: "টিপস: পাতার ওপর ও নিচের উভয় পিঠের ছবি তোলা সবচেয়ে কার্যকর।",
    },
    {
      icon: <Sparkles className="h-5 w-5 text-white" />,
      title: "৩. 'কৃষি সমাধান জানুন' চাপুন",
      desc: "এআই তাৎক্ষণিকভাবে DAE ও BARI বৈজ্ঞানিক মানদণ্ড অনুযায়ী রোগের কারণ, তাৎক্ষণিক জৈব/রাসায়নিক প্রতিকার ও প্রতিরোধমূলক নির্দেশিকা তৈরি করবে।",
      tip: "টিপস: 'শুনুন' বাটনে চাপলে পুরো প্রেসক্রিপশন বাংলায় পড়ে শোনাবে।",
    },
    {
      icon: <PhoneCall className="h-5 w-5 text-white" />,
      title: "৪. সরকারি হটলাইন ১৬১২৩",
      desc: "কোনো জটিল সমস্যায় সরাসরি সরকারি কৃষি বিশেষজ্ঞের সাথে ফোনে কথা বলতে প্রেসক্রিপশনের নিচে থাকা '১৬১২৩' বাটনে এক চাপে সরাসরি কল করুন।",
      tip: "টোল-ফ্রি সেবা: প্রতিদিন সকাল ৯টা থেকে বিকাল ৫টা পর্যন্ত চালু।",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Box */}
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-xl flex-col rounded-xl border border-[#262626] bg-[#111111] p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b border-[#262626] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1a1a1a] text-white border border-[#262626]">
              <Volume2 className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                সহজ ব্যবহার নির্দেশিকা
              </h3>
              <p className="text-[11px] font-mono text-[#737373]">
                HOW TO USE KRISHI BONDHU
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#a3a3a3] hover:bg-[#262626] hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Steps List */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-[#262626] bg-[#171717] p-4 transition-colors hover:border-[#404040]"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#111111] border border-[#262626]">
                  {step.icon}
                </div>
                <div className="space-y-1.5 flex-1">
                  <h4 className="font-semibold text-white text-sm">
                    {step.title}
                  </h4>
                  <p className="text-[#d4d4d4] leading-relaxed">
                    {step.desc}
                  </p>
                  <div className="flex items-center gap-1.5 rounded bg-[#111111] border border-[#262626] px-2.5 py-1 text-[11px] text-[#a3a3a3]">
                    <CheckCircle className="h-3 w-3 text-[#4ade80] shrink-0" />
                    <span>{step.tip}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Safety note */}
          <div className="rounded-lg border border-[#262626] bg-[#141414] p-3 text-[11px] text-[#737373] leading-relaxed flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0 text-[#a3a3a3] mt-0.5" />
            <span>
              <strong>নিরাপত্তা বার্তা:</strong> যেকোনো বালাইনাশক ব্যবহারের পূর্বে নিরাপত্তা সরঞ্জাম (মাস্ক, গ্লাভস) পরিধান করুন এবং সঠিক মাত্রার জন্য স্থানীয় উপ-সহকারী কৃষি কর্মকর্তার (SAAO) পরামর্শ নিন।
            </span>
          </div>
        </div>

        {/* Action button */}
        <div className="mt-4 border-t border-[#262626] pt-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-white py-3 text-xs font-bold uppercase tracking-widest text-black hover:bg-[#e5e5e5] transition-colors"
          >
            বুঝেছি, শুরু করি
          </button>
        </div>
      </div>
    </div>
  );
};
