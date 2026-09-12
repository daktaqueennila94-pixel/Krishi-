import React, { useRef } from "react";
import { Camera, Upload, Trash2, Image as ImageIcon, Sparkles, CheckCircle } from "lucide-react";

interface ImageUploadSectionProps {
  photoBase64: string;
  onPhotoChange: (base64: string) => void;
}

export const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  photoBase64,
  onPhotoChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Fast client-side image compression to optimize speed & payload size
    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.75);
          onPhotoChange(compressedDataUrl);
        } else {
          onPhotoChange(rawDataUrl);
        }
      };
      img.onerror = () => {
        onPhotoChange(rawDataUrl);
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleClearPhoto = () => {
    onPhotoChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="rounded-xl border border-[#262626] bg-[#111111] p-6 flex flex-col justify-between">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-[#1a1a1a] text-[11px] font-bold text-white border border-[#262626]">
                ২
              </span>
              <h2 className="text-xs uppercase tracking-widest text-[#a3a3a3] font-semibold">
                ধাপ ২: আক্রান্ত ফসলের ছবি (ঐচ্ছিক/প্রস্তাবিত)
              </h2>
            </div>
            <p className="text-lg font-medium text-white mt-1">
              পাতা বা কাণ্ডের ছবি স্ক্যান করুন
            </p>
          </div>
          {photoBase64 && (
            <button
              type="button"
              onClick={handleClearPhoto}
              className="flex items-center gap-1 rounded border border-[#262626] bg-[#1a1a1a] px-2.5 py-1 text-xs text-[#f87171] hover:bg-[#2e1a1a] transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              মুছুন
            </button>
          )}
        </div>

        {photoBase64 ? (
          <div className="relative overflow-hidden rounded-lg border border-[#262626] bg-[#1a1a1a]">
            <img
              src={photoBase64}
              alt="আক্রান্ত ফসলের ছবি"
              className="h-52 w-full object-cover sm:h-56"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5 rounded bg-[#111111]/90 px-2.5 py-1 text-xs font-medium text-white border border-[#262626]">
                <ImageIcon className="h-3.5 w-3.5 text-[#4ade80]" />
                ছবি সংরক্ষিত আছে
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded bg-white px-3 py-1 text-xs font-bold text-black hover:bg-[#e5e5e5] transition-colors"
              >
                বদলান
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="group relative flex h-48 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[#262626] bg-[#1a1a1a] p-6 text-center transition-colors hover:border-white sm:h-52"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#262626] text-[#a3a3a3] transition-colors group-hover:text-white group-hover:scale-105">
              <Camera className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-white group-hover:underline">
              ক্যামেরা দিয়ে ছবি তুলুন বা ফাইল আপলোড করুন
            </p>
            <p className="mt-1 text-[11px] text-[#737373]">
              রোগাক্রান্ত পাতা, ডগা বা ফলের ছবি নির্বাচন করুন
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Helpful farmer photography tips */}
      <div className="mt-5 pt-3 border-t border-[#1a1a1a] flex items-center gap-2 text-[11px] text-[#a3a3a3]">
        <CheckCircle className="h-3.5 w-3.5 text-[#4ade80] shrink-0" />
        <span>
          <strong className="text-white">টিপস:</strong> দিনের স্বাভাবিক আলোতে পাতার দাগ স্পষ্ট করে ছবি তুলুন।
        </span>
      </div>
    </div>
  );
};
