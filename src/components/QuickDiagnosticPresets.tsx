import React from "react";
import { Sparkles, ArrowRight, Zap } from "lucide-react";

interface PresetItem {
  id: string;
  crop: string;
  name: string;
  tag: string;
  icon: string;
  speechQuery: string;
  sampleType: "potato" | "rice" | "tomato" | "brinjal" | "onion" | "chili";
}

const PRESETS: PresetItem[] = [
  {
    id: "potato-blight",
    crop: "আলু",
    name: "নাবি ধসা (Late Blight)",
    tag: "শীতকালীন ছত্রাক রোগ",
    icon: "🥔",
    speechQuery: "আলু গাছের পাতায় ভেজা ভেজা কালো দাগ ও পাতলা সাদা ছত্রাকের প্রলেপ পড়েছে, গাছ দ্রুত নেতিয়ে পড়ছে। প্রতিকার কী?",
    sampleType: "potato",
  },
  {
    id: "rice-blast",
    crop: "ধান",
    name: "ব্লাস্ট ও পাতা পোড়া",
    tag: "প্রধান ধান রোগ",
    icon: "🌾",
    speechQuery: "ধানের পাতায় দুমুখো সুচালো চোখের মতো বাদামী দাগ ও শীষের গোঁড়ায় পচন ধরছে। কী স্প্রে করব?",
    sampleType: "rice",
  },
  {
    id: "tomato-curl",
    crop: "টমেটো",
    name: "পাতা কোঁকড়ানো ও হলুদ",
    tag: "সাদামাছি বাহিত ভাইরাস",
    icon: "🍅",
    speechQuery: "টমেটো গাছের কচি পাতাগুলো উপর দিকে কোঁকড়ে যাচ্ছে, হলুদ হয়ে বাড়তি কমে গেছে। সমাধান কী?",
    sampleType: "tomato",
  },
  {
    id: "brinjal-borer",
    crop: "বেগুন",
    name: "ডগা ও ফল ছিদ্রকারী পোকা",
    tag: "মারাত্মক বালাই",
    icon: "🍆",
    speechQuery: "বেগুন গাছের কচি ডগা নুয়ে শুকিয়ে যাচ্ছে এবং বেগুনের গায়ে ছোট ছিদ্র দেখা যাচ্ছে। কোন জৈব বা রাসায়নিক দমন কার্যকর?",
    sampleType: "brinjal",
  },
  {
    id: "onion-blotch",
    crop: "পেঁয়াজ",
    name: "পার্পল ব্লচ (বেগুনি দাগ)",
    tag: "রসুন ও পেঁয়াজ রোগ",
    icon: "🧅",
    speechQuery: "পেঁয়াজের পাতায় লম্বাটে বেগুনি রঙের দাগ দেখা দিয়েছে এবং ওপরের অংশ ভেঙে পড়ছে। কী করব?",
    sampleType: "onion",
  },
  {
    id: "chili-thrips",
    crop: "মরিচ",
    name: "পাতা কুঁকড়ানো ও থ্রিপস",
    tag: "মরিচের বালাই",
    icon: "🌶️",
    speechQuery: "মরিচ গাছের পাতা নৌকার মতো নিচের দিকে মুড়ে গেছে এবং গাছের বৃদ্ধি বন্ধ হয়ে গেছে। বালাইনাশক কী?",
    sampleType: "chili",
  },
];

interface QuickDiagnosticPresetsProps {
  onSelectPreset: (speech: string, imageBase64: string) => void;
}

export const QuickDiagnosticPresets: React.FC<QuickDiagnosticPresetsProps> = ({
  onSelectPreset,
}) => {
  const generateSampleImage = (type: PresetItem["sampleType"]): string => {
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    if (type === "potato") {
      ctx.fillStyle = "#1e3a1e";
      ctx.fillRect(0, 0, 600, 400);
      ctx.fillStyle = "#2d5a27";
      ctx.beginPath();
      ctx.ellipse(300, 200, 200, 130, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#3e2723";
      ctx.beginPath();
      ctx.ellipse(250, 180, 50, 35, 0.4, 0, Math.PI * 2);
      ctx.ellipse(360, 220, 40, 30, -0.3, 0, Math.PI * 2);
      ctx.ellipse(290, 260, 60, 40, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#cddc39";
      ctx.lineWidth = 3;
      ctx.stroke();
    } else if (type === "rice") {
      ctx.fillStyle = "#1b3320";
      ctx.fillRect(0, 0, 600, 400);
      ctx.fillStyle = "#43a047";
      ctx.fillRect(160, 40, 70, 320);
      ctx.fillRect(360, 40, 70, 320);
      ctx.fillStyle = "#5d4037";
      for (let y = 80; y < 340; y += 45) {
        ctx.beginPath();
        ctx.ellipse(195, y, 22, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(395, y + 20, 18, 9, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (type === "tomato") {
      ctx.fillStyle = "#1c281e";
      ctx.fillRect(0, 0, 600, 400);
      ctx.fillStyle = "#33691e";
      ctx.beginPath();
      ctx.arc(300, 200, 130, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fbc02d";
      ctx.beginPath();
      ctx.arc(270, 170, 55, 0, Math.PI * 2);
      ctx.arc(330, 220, 45, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === "brinjal") {
      ctx.fillStyle = "#1e1e24";
      ctx.fillRect(0, 0, 600, 400);
      ctx.fillStyle = "#2e7d32";
      ctx.beginPath();
      ctx.ellipse(300, 200, 190, 110, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#4a148c";
      ctx.beginPath();
      ctx.ellipse(300, 240, 80, 40, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#212121";
      ctx.beginPath();
      ctx.arc(320, 230, 8, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === "onion") {
      ctx.fillStyle = "#1b281b";
      ctx.fillRect(0, 0, 600, 400);
      ctx.fillStyle = "#388e3c";
      ctx.fillRect(180, 50, 60, 300);
      ctx.fillRect(340, 50, 60, 300);
      ctx.fillStyle = "#6a1b9a";
      ctx.beginPath();
      ctx.ellipse(210, 180, 22, 45, 0, 0, Math.PI * 2);
      ctx.ellipse(370, 210, 20, 40, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Chili
      ctx.fillStyle = "#1f2a1f";
      ctx.fillRect(0, 0, 600, 400);
      ctx.fillStyle = "#2e7d32";
      ctx.beginPath();
      ctx.ellipse(300, 200, 160, 90, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#c62828";
      ctx.beginPath();
      ctx.ellipse(300, 210, 30, 70, 0.8, 0, Math.PI * 2);
      ctx.fill();
    }

    return canvas.toDataURL("image/jpeg", 0.85);
  };

  const handleSelect = (preset: PresetItem) => {
    const imgData = generateSampleImage(preset.sampleType);
    onSelectPreset(preset.speechQuery, imgData);
  };

  return (
    <div className="rounded-xl border border-[#262626] bg-[#111111] p-5 sm:p-6">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-[#1a1a1a] text-white">
            <Zap className="h-4 w-4 text-[#fbbf24]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              এক ক্লিকে নমুনা রোগ পরীক্ষা / Quick Presets
            </h3>
            <p className="text-[11px] text-[#737373]">
              নিচের যেকোনো সাধারণ রোগ নির্বাচন করে এক ক্লিকে পরীক্ষা করুন
            </p>
          </div>
        </div>
        <span className="font-mono text-[10px] text-[#737373] uppercase tracking-widest self-start sm:self-auto">
          6 CROP SCENARIOS READY
        </span>
      </div>

      {/* Grid of Presets */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {PRESETS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleSelect(item)}
            className="group flex items-start justify-between rounded-lg border border-[#262626] bg-[#171717] p-3 text-left transition-all hover:border-white hover:bg-[#1f1f1f]"
          >
            <div className="flex items-start gap-2.5 min-w-0 flex-1">
              <span className="text-2xl shrink-0 mt-0.5">{item.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white truncate">
                    {item.crop}: {item.name}
                  </span>
                </div>
                <span className="mt-0.5 block text-[10px] text-[#737373] font-mono truncate">
                  {item.tag}
                </span>
                <p className="mt-1 text-[11px] text-[#a3a3a3] line-clamp-1">
                  "{item.speechQuery}"
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-[#737373] transition-transform group-hover:translate-x-1 group-hover:text-white mt-1 ml-1" />
          </button>
        ))}
      </div>
    </div>
  );
};
