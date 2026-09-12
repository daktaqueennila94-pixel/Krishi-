import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  X,
  Volume2,
  VolumeX,
  Radio,
  Sparkles,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Send,
  Loader2,
  FileText,
} from "lucide-react";

interface LiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyDiagnosis?: (text: string) => void;
}

interface MessageItem {
  sender: "user" | "ai";
  text: string;
  time: string;
}

const QUICK_VOICE_PROMPTS = [
  "হ্যালো, শুনতে পাচ্ছো?",
  "ধানের পাতায় ব্লাস্ট রোগ লেগেছে, কি করব?",
  "আলু গাছের পাতা কালো হয়ে পচে যাচ্ছে, কি স্প্রে করব?",
  "বেগুন গাছে ডগা ও ফল ছিদ্রকারী পোকার প্রতিকার কি?",
  "টমেটোর পাতা কোঁকড়া হয়ে যাচ্ছে, কি ওষুধ দিতে হবে?",
];

export const LiveVoiceModal: React.FC<LiveVoiceModalProps> = ({
  isOpen,
  onClose,
  onApplyDiagnosis,
}) => {
  const [status, setStatus] = useState<"connecting" | "ready" | "speaking" | "error" | "closed">(
    "connecting"
  );
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState<boolean>(false);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [currentAiTranscript, setCurrentAiTranscript] = useState<string>("");
  const [currentUserTranscript, setCurrentUserTranscript] = useState<string>("");
  const [inputText, setInputText] = useState<string>("");

  // Refs for WebSockets and Web Audio API
  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const isRecordingRef = useRef<boolean>(false);

  // Playback scheduler state
  const playbackStateRef = useRef<{
    nextStartTime: number;
    activeNodes: AudioBufferSourceNode[];
  }>({
    nextStartTime: 0,
    activeNodes: [],
  });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const stopAllPlayback = () => {
    playbackStateRef.current.activeNodes.forEach((node) => {
      try {
        node.stop();
      } catch {}
    });
    playbackStateRef.current.activeNodes = [];
    if (outputAudioCtxRef.current) {
      playbackStateRef.current.nextStartTime = outputAudioCtxRef.current.currentTime;
    }
    setIsAiSpeaking(false);
  };

  const playPCMChunk = (base64Data: string) => {
    try {
      if (!outputAudioCtxRef.current) {
        outputAudioCtxRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const ctx = outputAudioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const binary = atob(base64Data);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const pcm16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(pcm16.length);
      for (let i = 0; i < pcm16.length; i++) {
        float32[i] = pcm16[i] / 32768.0;
      }

      const audioBuffer = ctx.createBuffer(1, float32.length, 24000);
      audioBuffer.copyToChannel(float32, 0);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      const state = playbackStateRef.current;
      const startTime = Math.max(ctx.currentTime, state.nextStartTime);
      source.start(startTime);
      state.nextStartTime = startTime + audioBuffer.duration;

      setIsAiSpeaking(true);
      state.activeNodes.push(source);

      source.onended = () => {
        const idx = state.activeNodes.indexOf(source);
        if (idx > -1) state.activeNodes.splice(idx, 1);
        if (state.activeNodes.length === 0) {
          setIsAiSpeaking(false);
        }
      };
    } catch (err) {
      console.warn("PCM playback error:", err);
    }
  };

  const startLiveSession = async () => {
    try {
      setStatus("connecting");
      setErrorMessage("");

      // Setup WebSocket
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/api/live-ws`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("Connected to /api/live-ws");
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === "ready") {
            setStatus("ready");
          } else if (msg.type === "audio" && msg.audio) {
            playPCMChunk(msg.audio);
          } else if (msg.type === "model_transcript" && msg.text) {
            setCurrentAiTranscript((prev) => prev + msg.text);
          } else if (msg.type === "user_transcript" && msg.text) {
            setCurrentUserTranscript((prev) => prev + msg.text);
          } else if (msg.type === "interrupted") {
            stopAllPlayback();
          } else if (msg.type === "turn_complete") {
            setIsAiSpeaking(false);
            setCurrentAiTranscript((prevAi) => {
              if (prevAi.trim()) {
                setMessages((prevMsgs) => [
                  ...prevMsgs,
                  {
                    sender: "ai",
                    text: prevAi.trim(),
                    time: new Date().toLocaleTimeString("bn-BD", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                  },
                ]);
              }
              return "";
            });
            setCurrentUserTranscript((prevUser) => {
              if (prevUser.trim()) {
                setMessages((prevMsgs) => [
                  ...prevMsgs,
                  {
                    sender: "user",
                    text: prevUser.trim(),
                    time: new Date().toLocaleTimeString("bn-BD", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                  },
                ]);
              }
              return "";
            });
          } else if (msg.type === "error") {
            setStatus("error");
            setErrorMessage(msg.message || "ভয়েস সেশনে সমস্যা দেখা দিয়েছে।");
          }
        } catch (e) {
          console.error("Failed to parse live WS message:", e);
        }
      };

      ws.onerror = (e) => {
        console.error("WS error:", e);
        setStatus("error");
        setErrorMessage("সার্ভারের সাথে লাইভ সংযোগ ব্যর্থ হয়েছে।");
      };

      ws.onclose = () => {
        console.log("WS closed");
        setStatus("closed");
      };

      // Setup microphone stream (16kHz for Gemini Live input)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            sampleRate: 16000,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        micStreamRef.current = stream;

        const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 16000,
        });
        inputAudioCtxRef.current = inputCtx;

        const source = inputCtx.createMediaStreamSource(stream);
        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        source.connect(processor);
        processor.connect(inputCtx.destination);
        isRecordingRef.current = true;

        processor.onaudioprocess = (e) => {
          if (!isRecordingRef.current || isMicMuted) return;
          if (ws.readyState !== WebSocket.OPEN) return;

          const channelData = e.inputBuffer.getChannelData(0);
          const pcm16 = new Int16Array(channelData.length);
          for (let i = 0; i < channelData.length; i++) {
            const s = Math.max(-1, Math.min(1, channelData[i]));
            pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
          }

          const bytes = new Uint8Array(pcm16.buffer);
          let binary = "";
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          const base64 = btoa(binary);

          ws.send(JSON.stringify({ type: "audio", audio: base64 }));
        };
      } catch (micErr: any) {
        console.warn("Microphone access not available or denied:", micErr);
        // Fallback: farmer can still type or tap voice chips
      }
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "লাইভ সেশন চালু করা সম্ভব হয়নি।");
    }
  };

  const cleanupSession = () => {
    isRecordingRef.current = false;
    stopAllPlayback();

    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch {}
      processorRef.current = null;
    }

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }

    if (inputAudioCtxRef.current) {
      try {
        inputAudioCtxRef.current.close();
      } catch {}
      inputAudioCtxRef.current = null;
    }

    if (outputAudioCtxRef.current) {
      try {
        outputAudioCtxRef.current.close();
      } catch {}
      outputAudioCtxRef.current = null;
    }

    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {}
      wsRef.current = null;
    }
  };

  useEffect(() => {
    if (isOpen) {
      startLiveSession();
    } else {
      cleanupSession();
    }
    return () => {
      cleanupSession();
    };
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentAiTranscript, currentUserTranscript]);

  const sendTextMessage = (textToSend: string) => {
    const text = textToSend.trim();
    if (!text) return;

    // Stop current playback so model can reply to new message
    stopAllPlayback();

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text,
        time: new Date().toLocaleTimeString("bn-BD", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "text", text }));
    }
    setInputText("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4">
      <div className="relative flex flex-col w-full max-w-2xl h-[90vh] max-h-[720px] rounded-2xl border border-[#333333] bg-[#0d0d0d] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#262626] bg-[#141414] px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <div
                className={`h-3 w-3 rounded-full ${
                  status === "ready"
                    ? isAiSpeaking
                      ? "bg-[#86efac] animate-ping"
                      : "bg-[#86efac]"
                    : status === "connecting"
                    ? "bg-[#fbbf24] animate-pulse"
                    : "bg-red-500"
                }`}
              />
              <Radio className="h-5 w-5 text-[#86efac] ml-1.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white">
                  কৃষি বন্ধু লাইভ ভয়েস কথা
                </h2>
                <span className="rounded bg-[#86efac]/10 px-2 py-0.5 text-[10px] font-semibold text-[#86efac] border border-[#86efac]/20">
                  Gemini 3.1 Live
                </span>
              </div>
              <p className="text-[11px] text-[#a3a3a3]">
                {status === "connecting"
                  ? "লাইভ অডিও সংযোগ স্থাপন হচ্ছে..."
                  : isAiSpeaking
                  ? "কৃষি বন্ধু বাংলায় মুখে উত্তর দিচ্ছেন..."
                  : "মাইক্রোফোনে বাংলায় মুখে কথা বলুন"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-[#737373] hover:bg-[#262626] hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Live Audio Visualizer Banner */}
        <div className="relative border-b border-[#262626] bg-[#0f1712]/60 px-4 py-4 flex flex-col items-center justify-center overflow-hidden">
          <div className="flex items-center gap-1.5 h-10">
            {[40, 75, 100, 60, 90, 110, 80, 50, 95, 70, 45, 85].map((h, i) => (
              <span
                key={i}
                className={`w-1.5 rounded-full transition-all duration-150 ${
                  isAiSpeaking
                    ? "bg-[#86efac] animate-pulse"
                    : status === "ready" && !isMicMuted
                    ? "bg-[#fbbf24]/70"
                    : "bg-[#333333]"
                }`}
                style={{
                  height: isAiSpeaking
                    ? `${Math.max(12, (h * Math.sin(Date.now() / 150 + i)) % 36 + 12)}px`
                    : "10px",
                }}
              />
            ))}
          </div>

          <div className="mt-2 flex items-center gap-3">
            <span className="text-xs font-medium text-[#d4d4d4]">
              {isAiSpeaking ? (
                <span className="flex items-center gap-1.5 text-[#86efac]">
                  <Volume2 className="h-4 w-4 animate-bounce" />
                  কথা শুনছেন...
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[#a3a3a3]">
                  <Mic className="h-4 w-4 text-[#fbbf24]" />
                  আপনার কথা শুনছি, বলুন...
                </span>
              )}
            </span>

            {isAiSpeaking && (
              <button
                type="button"
                onClick={stopAllPlayback}
                className="rounded-full bg-[#262626] px-2.5 py-0.5 text-[11px] font-semibold text-white hover:bg-[#333333] transition-colors"
              >
                থামুন
              </button>
            )}
          </div>
        </div>

        {/* Quick Conversation Starters (User requested: "হ্যালো, শুনতে পাচ্ছো?") */}
        <div className="border-b border-[#262626] bg-[#141414] px-3 py-2 sm:px-6">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-[10px] uppercase tracking-wider text-[#737373] whitespace-nowrap mr-1">
              দ্রুত কথা বলুন:
            </span>
            {QUICK_VOICE_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => sendTextMessage(prompt)}
                className="whitespace-nowrap rounded-full border border-[#333333] bg-[#1a1a1a] px-3 py-1 text-xs text-[#e5e5e5] hover:border-[#86efac] hover:text-[#86efac] transition-all shrink-0 active:scale-95"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Chat / Transcripts Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.length === 0 && !currentAiTranscript && !currentUserTranscript && (
            <div className="flex flex-col items-center justify-center h-full text-center text-[#737373] space-y-2 py-8">
              <div className="rounded-full bg-[#1a1a1a] p-4 text-[#86efac] border border-[#262626]">
                <Mic className="h-8 w-8" />
              </div>
              <p className="text-sm font-medium text-[#d4d4d4]">
                মাইক্রোফোনে বলুন: <span className="text-[#86efac]">"হ্যালো, শুনতে পাচ্ছো?"</span>
              </p>
              <p className="text-xs max-w-sm">
                কৃষি বন্ধু রিয়েল-টাইমে লাইভ আপনার কথা শুনবে এবং সরাসরি মিষ্টি বাংলায় মুখে উত্তর
                দেবে।
              </p>
            </div>
          )}

          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                m.sender === "user" ? "items-end" : "items-start"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1">
                <span className="text-[10px] text-[#737373]">
                  {m.sender === "user" ? "আপনি" : "কৃষি বন্ধু AI"} · {m.time}
                </span>
              </div>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.sender === "user"
                    ? "bg-[#262626] text-white rounded-br-none"
                    : "bg-[#17231a] text-[#86efac] border border-[#86efac]/30 rounded-bl-none font-medium"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {/* Real-time Streaming Transcripts */}
          {currentUserTranscript && (
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-[#737373] mb-1 px-1">আপনি (বলছেন...)</span>
              <div className="max-w-[85%] rounded-2xl rounded-br-none bg-[#262626]/80 px-4 py-2.5 text-sm text-white italic border border-dashed border-[#525252]">
                {currentUserTranscript}...
              </div>
            </div>
          )}

          {currentAiTranscript && (
            <div className="flex flex-col items-start">
              <span className="text-[10px] text-[#86efac] mb-1 px-1 flex items-center gap-1">
                <Sparkles className="h-3 w-3 animate-spin" />
                কৃষি বন্ধু (উত্তর দিচ্ছেন...)
              </span>
              <div className="max-w-[85%] rounded-2xl rounded-bl-none bg-[#17231a] px-4 py-2.5 text-sm text-[#86efac] border border-[#86efac] font-medium leading-relaxed shadow-lg">
                {currentAiTranscript}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error Notification */}
        {status === "error" && (
          <div className="mx-4 mb-2 flex items-center justify-between rounded-xl border border-red-900/50 bg-red-950/40 p-3 text-xs text-red-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
              <span>{errorMessage || "ভয়েস সার্ভারে সংযোগ স্থাপন করা যায়নি।"}</span>
            </div>
            <button
              type="button"
              onClick={startLiveSession}
              className="rounded-lg bg-red-800 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-red-700 transition-colors"
            >
              পুনরায় চেষ্টা
            </button>
          </div>
        )}

        {/* Bottom Bar: Voice Controls + Text Fallback + Save as Diagnosis */}
        <div className="border-t border-[#262626] bg-[#141414] p-3 sm:p-4 space-y-2.5">
          <div className="flex items-center gap-2">
            {/* Mic Mute / Unmute Toggle */}
            <button
              type="button"
              onClick={() => setIsMicMuted((prev) => !prev)}
              className={`flex items-center justify-center h-10 w-10 rounded-xl border transition-all shrink-0 ${
                isMicMuted
                  ? "border-red-500 bg-red-500/20 text-red-400"
                  : "border-[#86efac] bg-[#86efac]/10 text-[#86efac] hover:bg-[#86efac]/20"
              }`}
              title={isMicMuted ? "মাইক্রোফোন চালু করুন" : "মাইক্রোফোন বন্ধ রাখুন"}
            >
              {isMicMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>

            {/* Input field */}
            <div className="relative flex-1">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendTextMessage(inputText);
                  }
                }}
                placeholder='মুখে বলুন বা লিখুন (যেমন: "হ্যালো, শুনতে পাচ্ছো?")...'
                className="w-full rounded-xl border border-[#333333] bg-[#0d0d0d] px-4 py-2.5 text-xs sm:text-sm text-white placeholder-[#737373] focus:border-[#86efac] focus:outline-none pr-10"
              />
              <button
                type="button"
                onClick={() => sendTextMessage(inputText)}
                disabled={!inputText.trim()}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#86efac] hover:bg-[#262626] transition-colors disabled:opacity-30"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

            {/* Apply as Diagnosis to main screen */}
            {onApplyDiagnosis && messages.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  const fullSummary = messages
                    .map((m) => `${m.sender === "user" ? "কৃষক" : "পরামর্শ"}: ${m.text}`)
                    .join("\n\n");
                  onApplyDiagnosis(fullSummary);
                  onClose();
                }}
                className="hidden sm:flex items-center gap-1.5 rounded-xl border border-[#333333] bg-[#1f1f1f] px-3 py-2.5 text-xs font-semibold text-white hover:border-[#86efac] hover:text-[#86efac] transition-all shrink-0"
              >
                <FileText className="h-4 w-4 text-[#86efac]" />
                <span>প্রেসক্রিপশনে নিন</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
