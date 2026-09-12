import React, { useState } from "react";
import { X, Calculator, Sprout, CheckCircle2, Info } from "lucide-react";

interface FertilizerCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CropFertilizerSpec {
  name: string;
  unit: string;
  // Per decimal (শতাংশ) recommendations in grams / kg
  ureaGrams: number;
  tspGrams: number;
  mopGrams: number;
  gypsumGrams: number;
  zincGrams: number;
  waterSprayLiters: number;
  notes: string;
}

const CROP_SPECS: CropFertilizerSpec[] = [
  {
    name: "বোরো ধান (হাইব্রিড/উফশী)",
    unit: "শতাংশ",
    ureaGrams: 1050,
    tspGrams: 450,
    mopGrams: 600,
    gypsumGrams: 400,
    zincGrams: 40,
    waterSprayLiters: 10,
    notes: "ইউরিয়া ৩ কিস্তিতে সমানভাবে দিতে হবে: চারা রোপণের ১৫-২০ দিন পর, ৩৫-৪০ দিন পর এবং কাইচথোড় আসার ৫-৭ দিন আগে।",
  },
  {
    name: "আলু (উচ্চফলনশীল)",
    unit: "শতাংশ",
    ureaGrams: 1400,
    tspGrams: 900,
    mopGrams: 1000,
    gypsumGrams: 500,
    zincGrams: 50,
    waterSprayLiters: 12,
    notes: "অর্ধেক ইউরিয়া ও সব সার রোপণের সময় এবং বাকি ইউরিয়া গাছ বৃদ্ধির ৩০-৩৫ দিন পর মাটির সাথে মিশিয়ে সেচ দিন।",
  },
  {
    name: "বেগুন",
    unit: "শতাংশ",
    ureaGrams: 1200,
    tspGrams: 600,
    mopGrams: 750,
    gypsumGrams: 400,
    zincGrams: 30,
    waterSprayLiters: 8,
    notes: "ইউরিয়া ও পটাশ সার সমান ৩ কিস্তিতে ফুল আসার আগে ও ফল ধরার সময় প্রয়োগ করুন।",
  },
  {
    name: "টমেটো",
    unit: "শতাংশ",
    ureaGrams: 1100,
    tspGrams: 800,
    mopGrams: 900,
    gypsumGrams: 350,
    zincGrams: 30,
    waterSprayLiters: 8,
    notes: "টমেটোর ক্ষেত্রে ফুল ও ফল ধরার সময় অতিরিক্ত বোরণ ও জিংক স্প্রে করলে ফল ফাটা বন্ধ হয়।",
  },
  {
    name: "সরিষা",
    unit: "শতাংশ",
    ureaGrams: 1000,
    tspGrams: 700,
    mopGrams: 350,
    gypsumGrams: 700,
    zincGrams: 25,
    waterSprayLiters: 6,
    notes: "সরিষায় সালফার বা জিপসাম বিশেষ জরুরি। অর্ধেক ইউরিয়া ও সব সার শেষ চাষের সময় দিতে হয়।",
  },
  {
    name: "মরিচ",
    unit: "শতাংশ",
    ureaGrams: 1000,
    tspGrams: 650,
    mopGrams: 650,
    gypsumGrams: 400,
    zincGrams: 30,
    waterSprayLiters: 7,
    notes: "ফুল আসার পূর্বে নাইট্রোজেন মাত্রাতিরিক্ত দিলে গাছ বাড়বে কিন্তু মরিচ কম ধরবে।",
  },
];

export const FertilizerCalculatorModal: React.FC<FertilizerCalculatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedCropIndex, setSelectedCropIndex] = useState<number>(0);
  const [landUnit, setLandUnit] = useState<"decimal" | "bigha" | "katha" | "acre">("decimal");
  const [landAmount, setLandAmount] = useState<number>(10);

  if (!isOpen) return null;

  // Convert land amount to standardized decimals (শতাংশ)
  // 1 বিঘা = ৩৩ শতাংশ
  // ১ কাঠা = ১.৬৫ শতাংশ
  // ১ একর = ১০০ শতাংশ
  let decimals = landAmount;
  if (landUnit === "bigha") decimals = landAmount * 33;
  else if (landUnit === "katha") decimals = landAmount * 1.65;
  else if (landUnit === "acre") decimals = landAmount * 100;

  const crop = CROP_SPECS[selectedCropIndex] || CROP_SPECS[0];

  const calcKg = (gramsPerDecimal: number) => {
    const totalGrams = gramsPerDecimal * decimals;
    const kg = totalGrams / 1000;
    return kg >= 1 ? `${kg.toFixed(1)} কেজি` : `${Math.round(totalGrams)} গ্রাম`;
  };

  const totalWater = Math.round(crop.waterSprayLiters * decimals);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-[#262626] bg-[#111111] p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#262626] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-[#1a1a1a] p-2 text-[#fbbf24] border border-[#333333]">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">সার ও স্প্রে ডোজ ক্যালকুলেটর</h2>
              <p className="text-xs text-[#a3a3a3]">
                BARI ও BRRI-এর বৈজ্ঞানিক মানদণ্ড অনুযায়ী সুষম সারের হিসাব
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#737373] hover:bg-[#1f1f1f] hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Inputs Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#a3a3a3]">ফসলের ধরন বেছে নিন:</label>
            <select
              value={selectedCropIndex}
              onChange={(e) => setSelectedCropIndex(Number(e.target.value))}
              className="w-full rounded-lg border border-[#262626] bg-[#171717] px-3 py-2 text-sm text-white focus:border-[#fbbf24] focus:outline-none"
            >
              {CROP_SPECS.map((c, i) => (
                <option key={i} value={i} className="bg-[#171717] text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#a3a3a3]">জমির পরিমাপ একক:</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(
                [
                  { id: "decimal", label: "শতাংশ" },
                  { id: "katha", label: "কাঠা" },
                  { id: "bigha", label: "বিঘা" },
                  { id: "acre", label: "একর" },
                ] as const
              ).map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setLandUnit(u.id)}
                  className={`rounded-lg py-2 text-xs font-medium border transition-colors ${
                    landUnit === u.id
                      ? "border-[#fbbf24] bg-[#fbbf24]/10 text-[#fbbf24]"
                      : "border-[#262626] bg-[#171717] text-[#a3a3a3] hover:border-[#404040]"
                  }`}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Land Amount Slider & Number */}
        <div className="space-y-2 rounded-xl bg-[#0a0a0a] p-4 border border-[#262626]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#a3a3a3]">জমির মোট পরিমাণ:</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0.5"
                max="500"
                step="0.5"
                value={landAmount}
                onChange={(e) => setLandAmount(Math.max(0.1, Number(e.target.value)))}
                className="w-20 rounded border border-[#333333] bg-[#171717] px-2 py-1 text-center text-sm font-bold text-white focus:border-[#fbbf24] focus:outline-none"
              />
              <span className="text-xs text-[#e5e5e5]">
                {landUnit === "decimal"
                  ? "শতাংশ"
                  : landUnit === "katha"
                  ? "কাঠা"
                  : landUnit === "bigha"
                  ? "বিঘা"
                  : "একর"}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-[#737373]">
            (সমান প্রায় {decimals.toFixed(1)} শতাংশ জমি)
          </p>
        </div>

        {/* Results Cards */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#a3a3a3]">
            প্রয়োজনীয় সারের মোট পরিমাণ (সুষম মাত্রা):
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="rounded-xl border border-[#262626] bg-[#171717] p-3">
              <span className="text-[11px] text-[#a3a3a3]">ইউরিয়া (Urea)</span>
              <p className="text-base font-bold text-white mt-0.5">{calcKg(crop.ureaGrams)}</p>
            </div>
            <div className="rounded-xl border border-[#262626] bg-[#171717] p-3">
              <span className="text-[11px] text-[#a3a3a3]">টিএসপি/ডিএপি (TSP)</span>
              <p className="text-base font-bold text-white mt-0.5">{calcKg(crop.tspGrams)}</p>
            </div>
            <div className="rounded-xl border border-[#262626] bg-[#171717] p-3">
              <span className="text-[11px] text-[#a3a3a3]">এমওপি/পটাশ (MoP)</span>
              <p className="text-base font-bold text-white mt-0.5">{calcKg(crop.mopGrams)}</p>
            </div>
            <div className="rounded-xl border border-[#262626] bg-[#171717] p-3">
              <span className="text-[11px] text-[#a3a3a3]">জিপসাম/গন্ধক</span>
              <p className="text-base font-bold text-white mt-0.5">{calcKg(crop.gypsumGrams)}</p>
            </div>
            <div className="rounded-xl border border-[#262626] bg-[#171717] p-3">
              <span className="text-[11px] text-[#a3a3a3]">দস্তা/জিংক</span>
              <p className="text-base font-bold text-white mt-0.5">{calcKg(crop.zincGrams)}</p>
            </div>
            <div className="rounded-xl border border-[#262626] bg-[#171717] p-3">
              <span className="text-[11px] text-[#86efac]">স্প্রে দ্রবণ পানি</span>
              <p className="text-base font-bold text-[#86efac] mt-0.5">~{totalWater} লিটার</p>
            </div>
          </div>
        </div>

        {/* Application Guide */}
        <div className="rounded-xl border border-[#262626] bg-[#0a0a0a] p-4 flex gap-3">
          <Info className="h-5 w-5 text-[#fbbf24] shrink-0 mt-0.5" />
          <div className="text-xs text-[#d4d4d4] space-y-1">
            <p className="font-semibold text-white">প্রয়োগের সঠিক নিয়ম ও সতর্কতা:</p>
            <p>{crop.notes}</p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-black hover:bg-[#e5e5e5] transition-colors"
          >
            বুঝেছি / বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
