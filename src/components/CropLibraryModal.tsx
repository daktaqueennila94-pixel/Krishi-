import React, { useState } from "react";
import { X, Search, BookOpen, AlertCircle, CheckCircle2 } from "lucide-react";
import { CROP_LIBRARY } from "../data/sampleData";

interface CropLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDiseaseQuery: (query: string) => void;
}

export const CropLibraryModal: React.FC<CropLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectDiseaseQuery,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCropId, setSelectedCropId] = useState<string>("all");

  if (!isOpen) return null;

  const filteredCrops = CROP_LIBRARY.filter((crop) => {
    const matchesCrop = selectedCropId === "all" || crop.id === selectedCropId;
    const matchesSearch =
      crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crop.commonDiseases.some(
        (d) =>
          d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.symptom.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesCrop && (searchTerm === "" || matchesSearch);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col rounded-xl border border-[#262626] bg-[#111111] p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b border-[#262626] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1a1a1a] text-white">
              <BookOpen className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                ফসল রোগ ও সমাধান কোষাগার
              </h3>
              <p className="text-[11px] font-mono text-[#737373]">
                BARI / BRRI Disease Index
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

        {/* Search & Crop Filter */}
        <div className="mb-4 space-y-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#737373]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="রোগের নাম বা ফসলের লক্ষণ দিয়ে খুঁজুন..."
              className="w-full rounded-lg border border-[#262626] bg-[#1a1a1a] py-2 pl-9 pr-3 text-xs text-white placeholder-[#737373] focus:border-white focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedCropId("all")}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                selectedCropId === "all"
                  ? "bg-white text-black font-bold"
                  : "bg-[#1a1a1a] text-[#a3a3a3] border border-[#262626] hover:text-white"
              }`}
            >
              সকল ফসল
            </button>
            {CROP_LIBRARY.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCropId(c.id)}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                  selectedCropId === c.id
                    ? "bg-white text-black font-bold"
                    : "bg-[#1a1a1a] text-[#a3a3a3] border border-[#262626] hover:text-white"
                }`}
              >
                {c.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* List of Crop Diseases */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {filteredCrops.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#737373]">
              কোনো তথ্য পাওয়া যায়নি।
            </div>
          ) : (
            filteredCrops.map((crop) => (
              <div
                key={crop.id}
                className="rounded-lg border border-[#262626] bg-[#171717] p-4"
              >
                <h4 className="text-xs uppercase tracking-widest font-bold text-white">
                  🌾 {crop.name}
                </h4>
                <div className="mt-3 space-y-3">
                  {crop.commonDiseases.map((d, idx) => (
                    <div
                      key={idx}
                      className="rounded border border-[#262626] bg-[#111111] p-3 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-medium text-white">
                          {d.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            onSelectDiseaseQuery(
                              `${crop.name.split(" ")[0]} ফসলে ${d.name} হলে কী করব?`
                            );
                            onClose();
                          }}
                          className="shrink-0 rounded bg-[#1a1a1a] border border-[#262626] px-2 py-0.5 text-[11px] text-[#a3a3a3] hover:text-white"
                        >
                          এআই সমাধান চান ↗
                        </button>
                      </div>

                      <div className="mt-2 space-y-1 text-[#a3a3a3]">
                        <div className="flex items-start gap-1.5">
                          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#fbbf24]" />
                          <span>
                            <strong className="text-white">লক্ষণ:</strong>{" "}
                            {d.symptom}
                          </span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#4ade80]" />
                          <span>
                            <strong className="text-white">প্রতিকার:</strong>{" "}
                            {d.remedy}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
