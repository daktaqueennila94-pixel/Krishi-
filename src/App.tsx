import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Loader2,
  AlertCircle,
  RotateCcw,
  HelpCircle,
  CheckCircle2,
  Radio,
} from "lucide-react";
import { Header } from "./components/Header";
import { LocationSeasonBar } from "./components/LocationSeasonBar";
import { VoiceMicSection } from "./components/VoiceMicSection";
import { ImageUploadSection } from "./components/ImageUploadSection";
import { DiagnosisResultCard } from "./components/DiagnosisResultCard";
import { CropLibraryModal } from "./components/CropLibraryModal";
import { SettingsDrawer } from "./components/SettingsDrawer";
import { HistoryDrawer } from "./components/HistoryDrawer";
import { HowToUseModal } from "./components/HowToUseModal";
import { QuickDiagnosticPresets } from "./components/QuickDiagnosticPresets";
import { QuickActionChips } from "./components/QuickActionChips";
import { FertilizerCalculatorModal } from "./components/FertilizerCalculatorModal";
import { EmergencyHotlineCard } from "./components/EmergencyHotlineCard";
import { MobileQuickBar } from "./components/MobileQuickBar";
import { LiveVoiceModal } from "./components/LiveVoiceModal";
import { DiagnosisResult, SeasonInfo } from "./types";
import { getBanglaSeason } from "./data/sampleData";
import { speechService, streamCambAIAudio } from "./utils/speech";
import { getClientEmergencyAdvice } from "./data/emergencyAdvice";

const STORAGE_KEYS = {
  GEMINI_KEY: "krishi_bondhu_gemini_key",
  CAMB_KEY: "krishi_bondhu_camb_key",
  CAMB_VOICE: "krishi_bondhu_camb_voice",
  HISTORY: "krishi_bondhu_history_v2",
  LOCATION: "krishi_bondhu_detected_location",
};

export default function App() {
  // Agricultural State
  const [season, setSeason] = useState<SeasonInfo>(getBanglaSeason());
  const [detectedLocation, setDetectedLocation] = useState<string>("");
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);
  const [speechText, setSpeechText] = useState<string>("");
  const [photoBase64, setPhotoBase64] = useState<string>("");

  // Speech Recognition state
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState<boolean>(true);
  const recognitionRef = useRef<any>(null);

  // Audio Playback state
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioRate, setAudioRate] = useState<number>(0.9);
  const [voiceProvider, setVoiceProvider] = useState<string>("ব্রাউজার বাংলা ভয়েস");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // AI Diagnosis state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [streamingText, setStreamingText] = useState<string>("");
  const [currentResult, setCurrentResult] = useState<DiagnosisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals & Drawers
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isCropLibraryOpen, setIsCropLibraryOpen] = useState<boolean>(false);
  const [isHowToUseOpen, setIsHowToUseOpen] = useState<boolean>(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);
  const [isLiveVoiceOpen, setIsLiveVoiceOpen] = useState<boolean>(false);
  const [geminiKey, setGeminiKey] = useState<string>("");
  const [cambKey, setCambKey] = useState<string>("");
  const [cambVoiceId, setCambVoiceId] = useState<string>("");
  const [history, setHistory] = useState<DiagnosisResult[]>([]);

  // Initial Load from Storage
  useEffect(() => {
    try {
      const savedGemini = localStorage.getItem(STORAGE_KEYS.GEMINI_KEY) || "";
      const savedCamb = localStorage.getItem(STORAGE_KEYS.CAMB_KEY) || "";
      const savedVoice = localStorage.getItem(STORAGE_KEYS.CAMB_VOICE) || "";
      const savedLoc = localStorage.getItem(STORAGE_KEYS.LOCATION) || "";
      const savedHist = localStorage.getItem(STORAGE_KEYS.HISTORY);

      setGeminiKey(savedGemini);
      setCambKey(savedCamb);
      setCambVoiceId(savedVoice);
      if (savedLoc) setDetectedLocation(savedLoc);
      if (savedHist) setHistory(JSON.parse(savedHist));
    } catch (e) {
      console.warn("Storage loading error:", e);
    }
  }, []);

  // Web Speech Recognition Initialization
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "bn-BD";
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");
        setSpeechText(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setIsSpeechSupported(false);
    }
  }, []);

  const handleToggleListening = () => {
    if (!recognitionRef.current) {
      setIsSpeechSupported(false);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setErrorMessage(null);
      } catch (err) {
        console.warn("Speech start error:", err);
      }
    }
  };

  // OpenStreetMap Reverse Geocoding
  const handleDetectLocation = async () => {
    if (!("geolocation" in navigator)) {
      setErrorMessage("আপনার ব্রাউজারে GPS সাপোর্ট নেই।");
      return;
    }

    setIsDetectingLocation(true);
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=bn`
          );
          const data = await res.json();
          const addr = data.address || {};
          const district =
            addr.state_district || addr.county || addr.city || addr.town || "";
          const division = addr.state || "";
          const locString = [district, division].filter(Boolean).join(", ");
          const finalLoc = locString || "বাংলাদেশ";

          setDetectedLocation(finalLoc);
          localStorage.setItem(STORAGE_KEYS.LOCATION, finalLoc);
        } catch (e) {
          setErrorMessage("অবস্থান বের করতে সমস্যা হয়েছে, ম্যানুয়ালি সেট করুন।");
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (err) => {
        console.warn("Geolocation denied:", err);
        setErrorMessage("GPS অনুমতি দেওয়া হয়নি — অনুগ্রহ করে মুখে এলাকার নাম বলুন।");
        setIsDetectingLocation(false);
      },
      { timeout: 8000 }
    );
  };

  // Save Settings Handlers
  const handleSaveGeminiKey = (key: string) => {
    setGeminiKey(key);
    if (key) localStorage.setItem(STORAGE_KEYS.GEMINI_KEY, key);
    else localStorage.removeItem(STORAGE_KEYS.GEMINI_KEY);
  };

  const handleSaveCambConfig = (key: string, voiceId: string) => {
    setCambKey(key);
    setCambVoiceId(voiceId);
    if (key) localStorage.setItem(STORAGE_KEYS.CAMB_KEY, key);
    else localStorage.removeItem(STORAGE_KEYS.CAMB_KEY);
    if (voiceId) localStorage.setItem(STORAGE_KEYS.CAMB_VOICE, voiceId);
    else localStorage.removeItem(STORAGE_KEYS.CAMB_VOICE);
  };

  // Audio Playback with Gemini AI Neural Bengali TTS & Browser Fallback
  const handlePlayAudio = async () => {
    if (!currentResult) return;
    handleStopAudio();

    // Prepare clean text for reading aloud in natural Bengali
    const voiceScript = currentResult.rawText
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/#{1,6}\s?/g, "")
      .replace(/`{1,3}/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .trim();

    // 1. Camb.ai if user configured custom credentials
    if (cambKey && cambVoiceId) {
      try {
        setVoiceProvider("Camb.ai ভয়েস");
        setIsPlayingAudio(true);
        const audioUrl = await streamCambAIAudio(voiceScript, cambKey, cambVoiceId);

        if (!audioRef.current) {
          audioRef.current = new Audio();
        }
        audioRef.current.src = audioUrl;
        audioRef.current.playbackRate = audioRate;
        audioRef.current.onended = () => setIsPlayingAudio(false);
        audioRef.current.onerror = () => {
          setIsPlayingAudio(false);
          handleGeminiOrBrowserTTS(voiceScript);
        };
        await audioRef.current.play();
        return;
      } catch (err) {
        console.warn("Camb.ai playback error:", err);
      }
    }

    // 2. Gemini 3.1 Flash TTS (Natural Bengali voice) or Browser Web Speech
    await handleGeminiOrBrowserTTS(voiceScript);
  };

  const handleGeminiOrBrowserTTS = async (text: string) => {
    try {
      setVoiceProvider("Gemini এআই বাংলা ভয়েস");
      setIsPlayingAudio(true);

      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text,
          customApiKey: geminiKey || undefined,
        }),
      });

      const contentType = res.headers.get("content-type") || "";
      if (res.ok && contentType.includes("audio/wav")) {
        const audioBlob = await res.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        if (!audioRef.current) {
          audioRef.current = new Audio();
        }
        audioRef.current.src = audioUrl;
        audioRef.current.playbackRate = audioRate;
        audioRef.current.onended = () => {
          setIsPlayingAudio(false);
          URL.revokeObjectURL(audioUrl);
        };
        audioRef.current.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          handleBrowserTTS(text);
        };
        await audioRef.current.play();
        return;
      }
    } catch (e) {
      console.warn("Gemini TTS fetch error, falling back to browser speech:", e);
    }

    // Fallback: Browser Web Speech API with sentence queue
    handleBrowserTTS(text);
  };

  const handleBrowserTTS = (text: string) => {
    setVoiceProvider("বাংলা ভয়েস ইঞ্জিন");
    setIsPlayingAudio(true);
    speechService.speak(text, {
      rate: audioRate,
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    });
  };

  const handleStopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    speechService.stop();
    setIsPlayingAudio(false);
  };

  // Elapsed response timer for visible quick response feedback
  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setElapsedSeconds(0);
      const start = Date.now();
      interval = setInterval(() => {
        setElapsedSeconds(+((Date.now() - start) / 1000).toFixed(1));
      }, 100);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Main Diagnosis Submitter (Supports 1-tap quick auto-run & live token streaming)
  const handleDiagnose = async (overrideSpeech?: string, overridePhoto?: string) => {
    const textToAnalyze = (overrideSpeech !== undefined ? overrideSpeech : speechText).trim();
    const photoToAnalyze = overridePhoto !== undefined ? overridePhoto : photoBase64;

    if (!textToAnalyze && !photoToAnalyze) {
      setErrorMessage("দয়া করে সমস্যাটি মুখে বলুন বা ফসলের একটি ছবি দিন।");
      return;
    }

    handleStopAudio();
    setIsLoading(true);
    setStreamingText("");
    setErrorMessage(null);
    setLoadingStep("লক্ষণ বিশ্লেষণ ও লাইভ সংযোগ...");

    // Immediate optimistic scroll to preview area
    setTimeout(() => {
      document.getElementById("streaming-preview-anchor")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);

    try {
      // 1. Try real-time stream endpoint for sub-second first-token response
      let streamSucceeded = false;
      try {
        const streamResponse = await fetch("/api/diagnose-stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            speech: textToAnalyze,
            imageBase64: photoToAnalyze,
            location: detectedLocation,
            season: season.name,
            customApiKey: geminiKey || undefined,
          }),
        });

        if (streamResponse.ok && streamResponse.body) {
          const reader = streamResponse.body.getReader();
          const decoder = new TextDecoder("utf-8");
          let buffer = "";
          let accumulatedText = "";
          let finalPayload: any = null;

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            let currentEvent = "";
            for (const line of lines) {
              if (line.startsWith("event: ")) {
                currentEvent = line.slice(7).trim();
              } else if (line.startsWith("data: ")) {
                const dataRaw = line.slice(6).trim();
                if (dataRaw) {
                  try {
                    const parsed = JSON.parse(dataRaw);
                    if (currentEvent === "chunk" || parsed.text) {
                      const newChunk = parsed.text || "";
                      accumulatedText += newChunk;
                      setStreamingText(accumulatedText);
                      setLoadingStep("পরামর্শ লেখা হচ্ছে...");
                    } else if (currentEvent === "done" || parsed.structured) {
                      finalPayload = parsed;
                    } else if (currentEvent === "error") {
                      throw new Error(parsed.message || "পরামর্শ তৈরিতে ত্রুটি হয়েছে।");
                    }
                  } catch (parseErr) {
                    // Ignore transient chunk parse errors
                  }
                }
              }
            }
          }

          if (finalPayload) {
            streamSucceeded = true;
            const newResult: DiagnosisResult = {
              id: "diag_" + Date.now(),
              rawText: finalPayload.rawText || accumulatedText,
              structured: finalPayload.structured,
              season: finalPayload.season || season.name,
              location: finalPayload.location || detectedLocation,
              cropPhoto: photoToAnalyze || null,
              querySpeech: textToAnalyze || null,
              timestamp: finalPayload.timestamp || new Date().toISOString(),
            };

            setCurrentResult(newResult);
            setStreamingText("");
            const updatedHistory = [newResult, ...history.slice(0, 19)];
            setHistory(updatedHistory);
            localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updatedHistory));

            setTimeout(() => {
              document
                .getElementById("diagnosis-result-card")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
              handlePlayAudio();
            }, 150);
            return;
          }
        }
      } catch (streamErr) {
        console.warn("Live stream fallback to standard JSON endpoint:", streamErr);
      }

      // 2. Fallback to standard fast JSON endpoint if stream was interrupted
      if (!streamSucceeded) {
        setLoadingStep("DAE ও BARI কৃষি নির্দেশিকা যাচাই করা হচ্ছে...");
        const response = await fetch("/api/diagnose", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            speech: textToAnalyze,
            imageBase64: photoToAnalyze,
            location: detectedLocation,
            season: season.name,
            customApiKey: geminiKey || undefined,
          }),
        });

        let data: any = null;
        try {
          const contentType = response.headers.get("content-type") || "";
          if (contentType.includes("application/json")) {
            data = await response.json();
          } else {
            console.warn("Non-JSON response from server, activating instant agricultural guideline engine");
          }
        } catch (jsonParseErr) {
          console.warn("JSON parse error avoided:", jsonParseErr);
        }

        // If server returned non-JSON, 502/504, or missing payload, guarantee instant high-quality advice
        if (!data || !data.rawText) {
          data = getClientEmergencyAdvice(textToAnalyze, detectedLocation, season.name);
        }

        const newResult: DiagnosisResult = {
          id: "diag_" + Date.now(),
          rawText: data.rawText,
          structured: data.structured,
          season: data.season || season.name,
          location: data.location || detectedLocation,
          cropPhoto: photoToAnalyze || null,
          querySpeech: textToAnalyze || null,
          timestamp: data.timestamp || new Date().toISOString(),
        };

        setCurrentResult(newResult);
        setStreamingText("");

        const updatedHistory = [newResult, ...history.slice(0, 19)];
        setHistory(updatedHistory);
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updatedHistory));

        setTimeout(() => {
          document
            .getElementById("diagnosis-result-card")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
          handlePlayAudio();
        }, 200);
      }
    } catch (err: any) {
      console.error("Diagnosis failure, activating instant agricultural guideline engine:", err);
      // High resilience: never show raw SyntaxError or leave farmer stranded
      const emergencyAdvice = getClientEmergencyAdvice(textToAnalyze, detectedLocation, season.name);
      const fallbackResult: DiagnosisResult = {
        id: "diag_" + Date.now(),
        rawText: emergencyAdvice.rawText,
        structured: emergencyAdvice.structured,
        season: emergencyAdvice.season,
        location: emergencyAdvice.location || detectedLocation,
        cropPhoto: photoToAnalyze || null,
        querySpeech: textToAnalyze || null,
        timestamp: emergencyAdvice.timestamp,
      };

      setCurrentResult(fallbackResult);
      setStreamingText("");
      const updatedHistory = [fallbackResult, ...history.slice(0, 19)];
      setHistory(updatedHistory);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updatedHistory));

      setTimeout(() => {
        document
          .getElementById("diagnosis-result-card")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
        handlePlayAudio();
      }, 200);
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  const handleResetInputs = () => {
    setSpeechText("");
    setPhotoBase64("");
    setCurrentResult(null);
    setErrorMessage(null);
    handleStopAudio();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectPreset = (presetSpeech: string, presetPhoto: string) => {
    setSpeechText(presetSpeech);
    setPhotoBase64(presetPhoto);
    setErrorMessage(null);
    // Smooth scroll down to inputs
    const el = document.getElementById("inputs-section");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const hasAnyInput = !!(speechText.trim() || photoBase64);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5] flex flex-col justify-between selection:bg-white selection:text-black">
      {/* Top Navbar */}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenCropLibrary={() => setIsCropLibraryOpen(true)}
        onOpenHowToUse={() => setIsHowToUseOpen(true)}
        onOpenLiveVoice={() => setIsLiveVoiceOpen(true)}
        historyCount={history.length}
        isAudioPlaying={isPlayingAudio}
      />

      {/* Main Container */}
      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-8 sm:py-8 flex-1 space-y-7 pb-20 md:pb-8">
        {/* Hero Section */}
        <div className="border-b border-[#262626] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded bg-[#1a1a1a] px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-[#a3a3a3] border border-[#262626]">
              <span>SYSTEM: ONLINE</span>
              <span>·</span>
              <span>DAE & BARI INTELLIGENCE</span>
              <span>·</span>
              <span className="text-[#86efac]">FAST RESPONSE READY</span>
            </div>
            <h1 className="text-3xl font-light tracking-tight text-white sm:text-5xl mt-1">
              সারা বাংলার স্মার্ট <span className="font-bold text-white">কৃষি বন্ধু</span>
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[#a3a3a3] max-w-2xl leading-relaxed">
              আঞ্চলিক ভাষায় মৌখিক বক্তব্য বা আক্রান্ত পাতার ছবির মাধ্যমে তাৎক্ষণিক বৈজ্ঞানিক সমাধান ও নিরাপদ প্রেসক্রিপশন
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => setIsLiveVoiceOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-[#86efac]/40 bg-[#122617] px-3.5 py-2 text-xs font-bold text-[#86efac] hover:bg-[#1a3821] hover:border-[#86efac] transition-all shadow-sm"
              title="লাইভ মুখে মুখে কথা বলুন (Gemini 3.1 Live API)"
            >
              <Radio className="h-4 w-4 text-[#86efac] animate-pulse" />
              <span>লাইভ ভয়েস কথা</span>
            </button>
            <button
              type="button"
              onClick={() => setIsCalculatorOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-[#262626] bg-[#171717] px-3.5 py-2 text-xs font-semibold text-[#fbbf24] hover:bg-[#262626] transition-colors"
            >
              <span>সার ক্যালকুলেটর</span>
            </button>
            <button
              type="button"
              onClick={() => setIsHowToUseOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-[#262626] bg-[#111111] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#1a1a1a] transition-colors"
            >
              <HelpCircle className="h-4 w-4 text-white" />
              <span>কীভাবে চালাবেন?</span>
            </button>
          </div>
        </div>

        {/* Location & Season Meta Bar */}
        <div>
          <LocationSeasonBar
            season={season}
            detectedLocation={detectedLocation}
            onDetectLocation={handleDetectLocation}
            isDetectingLocation={isDetectingLocation}
            onSetManualLocation={(loc) => {
              setDetectedLocation(loc);
              localStorage.setItem(STORAGE_KEYS.LOCATION, loc);
            }}
          />
        </div>

        {/* Quick Diagnostic Presets (1-Click Sample Testing) */}
        <div>
          <QuickDiagnosticPresets onSelectPreset={handleSelectPreset} />
        </div>

        {/* Quick Action Chips (Instant 1-Tap Diagnosis) */}
        <div>
          <QuickActionChips
            isLoading={isLoading}
            onSelectQuery={(query, autoRun) => {
              setSpeechText(query);
              if (autoRun) {
                handleDiagnose(query);
              } else {
                const el = document.getElementById("inputs-section");
                el?.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
          />
        </div>

        {/* Input Cards Grid (Voice & Photo) */}
        <div id="inputs-section" className="scroll-mt-20 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase tracking-widest text-[#a3a3a3] font-semibold">
              ইনপুট কেন্দ্র / Diagnostic Input
            </h3>
            {hasAnyInput && (
              <button
                type="button"
                onClick={handleResetInputs}
                className="flex items-center gap-1 text-xs text-[#737373] hover:text-white transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                <span>নতুন প্রশ্ন / রিসেট</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Voice Input Column */}
            <VoiceMicSection
              speechText={speechText}
              onSpeechChange={setSpeechText}
              isListening={isListening}
              onToggleListening={handleToggleListening}
              isSpeechSupported={isSpeechSupported}
              onOpenLiveVoice={() => setIsLiveVoiceOpen(true)}
            />

            {/* Photo Upload Column */}
            <ImageUploadSection
              photoBase64={photoBase64}
              onPhotoChange={setPhotoBase64}
            />
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border border-[#f87171]/40 bg-[#2e1a1a] p-4 text-xs text-[#f87171]">
            <div className="flex items-start gap-2.5 flex-1">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="flex-1 leading-relaxed">
                <strong className="font-semibold">ত্রুটি:</strong> {errorMessage}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleDiagnose}
                disabled={isLoading}
                className="rounded bg-[#f87171] px-3 py-1.5 text-xs font-bold text-black hover:bg-[#fda4af] transition-colors"
              >
                পুনরায় চেষ্টা করুন
              </button>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="p-1 text-xs text-[#f87171] hover:text-white"
                title="বন্ধ করুন"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Primary Action Button (Step 3) */}
        <div className="flex flex-col items-center justify-center pt-2">
          <button
            id="solve-problem-btn"
            type="button"
            onClick={() => handleDiagnose()}
            disabled={isLoading || !hasAnyInput}
            className="flex w-full max-w-md items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-bold uppercase tracking-widest text-black shadow-xl transition-all hover:bg-[#e5e5e5] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-30 disabled:hover:scale-100"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-black" />
                <span>
                  {loadingStep || "বিশ্লেষণ চলছে..."}
                  {elapsedSeconds > 0 && ` (${elapsedSeconds}s)`}
                </span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 text-black" />
                <span>ধাপ ৩: কৃষি সমাধান ও প্রেসক্রিপশন পান</span>
              </>
            )}
          </button>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-[#525252]">
            DAE · BRRI · BARI COMPLIANT PROTOCOL
          </p>
        </div>

        {/* Diagnosis Result Area */}
        {isLoading && (
          <div id="streaming-preview-anchor" className="pt-4 scroll-mt-24">
            <div className="rounded-xl border border-[#333333] bg-[#111111] p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#262626] pb-4">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#86efac] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#22c55e]"></span>
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {streamingText ? "লাইভ এআই প্রেসক্রিপশন তৈরি হচ্ছে..." : "লক্ষণ ও ছবি বিশ্লেষণ চলছে..."}
                    </h3>
                    <p className="text-[11px] text-[#a3a3a3]">
                      ১০-১৫ সেকেন্ডের মধ্যে দ্রুত প্রেসক্রিপশন প্রদান · অতিবাহিত: {elapsedSeconds}s
                    </p>
                  </div>
                </div>
                <span className="rounded bg-[#171717] px-2.5 py-1 text-[10px] font-mono text-[#86efac] border border-[#262626] tracking-wider font-semibold">
                  FAST LIVE AI
                </span>
              </div>

              {streamingText ? (
                <div className="whitespace-pre-line text-sm text-[#e5e5e5] leading-relaxed bg-[#0a0a0a] p-4 rounded-lg border border-[#262626] font-sans">
                  {streamingText}
                  <span className="inline-block w-2 h-4 ml-1 bg-[#86efac] animate-pulse"></span>
                </div>
              ) : (
                <div className="space-y-3 py-2">
                  <div className="flex items-center gap-2 text-xs text-[#a3a3a3]">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[#86efac]" />
                    <span>{loadingStep || "কৃষি বিশেষজ্ঞদের নির্দেশিকা সমন্বয় করা হচ্ছে..."}</span>
                  </div>
                  <div className="h-3 bg-[#1c1c1c] rounded w-3/4 animate-pulse"></div>
                  <div className="h-3 bg-[#1c1c1c] rounded w-5/6 animate-pulse"></div>
                  <div className="h-3 bg-[#1c1c1c] rounded w-1/2 animate-pulse"></div>
                </div>
              )}
            </div>
          </div>
        )}

        {currentResult && !isLoading && (
          <div className="pt-4">
            <DiagnosisResultCard
              result={currentResult}
              isPlayingAudio={isPlayingAudio}
              onPlayAudio={handlePlayAudio}
              onStopAudio={handleStopAudio}
              audioRate={audioRate}
              onChangeAudioRate={(rate) => {
                setAudioRate(rate);
                if (audioRef.current) audioRef.current.playbackRate = rate;
              }}
              voiceProviderName={voiceProvider}
            />
          </div>
        )}

        {/* Emergency Ag Hotlines for quick assistance */}
        <div className="pt-2">
          <EmergencyHotlineCard />
        </div>
      </main>

      {/* Mobile Sticky Quick Access Bar */}
      <MobileQuickBar
        onOpenVoice={() => {
          const el = document.getElementById("voice-mic-main-btn");
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            handleToggleListening();
          }
        }}
        onOpenLiveVoice={() => setIsLiveVoiceOpen(true)}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        onOpenPresets={() => {
          const el = document.getElementById("quick-action-chips");
          el?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
        onTriggerDiagnose={() => handleDiagnose()}
        hasInput={hasAnyInput}
        isLoading={isLoading}
      />

      {/* Clean Minimalism Footer */}
      <footer className="h-14 border-t border-[#262626] px-4 sm:px-8 flex items-center justify-between text-[10px] text-[#525252] uppercase tracking-widest mt-12 bg-[#0a0a0a] print:hidden">
        <span>Krishi Bondhu AI &copy; 2026</span>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setIsHowToUseOpen(true)}
            className="hover:text-[#a3a3a3] transition-colors"
          >
            ব্যবহার নির্দেশিকা
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={() => setIsCropLibraryOpen(true)}
            className="hover:text-[#a3a3a3] transition-colors"
          >
            রোগ কোষাগার
          </button>
          <span>·</span>
          <a href="tel:16123" className="hover:text-[#a3a3a3] transition-colors">
            হটলাইন ১৬১২৩
          </a>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <LiveVoiceModal
        isOpen={isLiveVoiceOpen}
        onClose={() => setIsLiveVoiceOpen(false)}
        onApplyDiagnosis={(text) => {
          setSpeechText(text);
          handleDiagnose(text);
          setTimeout(() => {
            const el = document.getElementById("diagnosis-result-card");
            el?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 200);
        }}
      />

      <FertilizerCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      <HowToUseModal
        isOpen={isHowToUseOpen}
        onClose={() => setIsHowToUseOpen(false)}
      />

      <CropLibraryModal
        isOpen={isCropLibraryOpen}
        onClose={() => setIsCropLibraryOpen(false)}
        onSelectDiseaseQuery={(q) => {
          setSpeechText(q);
          const el = document.getElementById("inputs-section");
          el?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      />

      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        geminiKey={geminiKey}
        onSaveGeminiKey={handleSaveGeminiKey}
        cambKey={cambKey}
        cambVoiceId={cambVoiceId}
        onSaveCambConfig={handleSaveCambConfig}
      />

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectHistoryItem={(item) => {
          setCurrentResult(item);
          setTimeout(() => {
            document
              .getElementById("diagnosis-result-card")
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 150);
        }}
        onClearHistory={() => {
          setHistory([]);
          localStorage.removeItem(STORAGE_KEYS.HISTORY);
        }}
      />
    </div>
  );
}
