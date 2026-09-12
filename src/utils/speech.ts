// Browser Speech Utilities

export interface TTSOptions {
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isVoicesLoaded = false;

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
    if (this.voices.length > 0) {
      this.isVoicesLoaded = true;
    }
  }

  public getBengaliVoice(): SpeechSynthesisVoice | null {
    if (!this.voices.length) this.loadVoices();

    // Prioritize Bangladeshi Bangla voice (bn-BD)
    const bangladeshi = this.voices.find(
      (v) => v.lang && v.lang.toLowerCase().replace("_", "-") === "bn-bd"
    );
    if (bangladeshi) return bangladeshi;

    // Next, any Bengali voice (bn-IN, Bengali, Bangla)
    const bengali = this.voices.find(
      (v) =>
        (v.lang && v.lang.toLowerCase().startsWith("bn")) ||
        /bangla|bengali/i.test(v.name)
    );
    if (bengali) return bengali;

    return null;
  }

  public speak(text: string, options?: TTSOptions): boolean {
    if (!this.synth) {
      options?.onError?.(new Error("Speech synthesis not supported in this browser"));
      return false;
    }

    this.stop();

    // Clean markdown stars and special formatting for natural audio output
    const cleanText = text
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/#{1,6}\s?/g, "")
      .replace(/`{1,3}/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .trim();

    if (!cleanText) return false;

    // Split text into digestible chunks by Bengali sentence terminators ('।', '?', '!', '\n')
    // This completely prevents the famous Chrome 15-second speech synthesis cut-off bug!
    const sentences = cleanText
      .split(/(?<=[।?!।\n])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (sentences.length === 0) return false;

    let currentIndex = 0;
    const voice = this.getBengaliVoice();

    const speakNextSentence = () => {
      if (!this.synth) return;
      if (currentIndex >= sentences.length) {
        this.currentUtterance = null;
        options?.onEnd?.();
        return;
      }

      const sentence = sentences[currentIndex];
      currentIndex++;

      const utterance = new SpeechSynthesisUtterance(sentence);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = "bn-BD";
      }

      utterance.rate = options?.rate ?? 0.88;
      utterance.pitch = options?.pitch ?? 1.0;

      if (currentIndex === 1) {
        options?.onStart?.();
      }

      utterance.onend = () => {
        // Small natural pause between sentences
        setTimeout(speakNextSentence, 150);
      };

      utterance.onerror = (err) => {
        console.warn("Utterance error:", err);
        // Attempt next sentence even if one fails
        if (currentIndex < sentences.length) {
          setTimeout(speakNextSentence, 100);
        } else {
          this.currentUtterance = null;
          options?.onError?.(err);
        }
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    };

    speakNextSentence();
    return true;
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  public pause() {
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
    }
  }

  public resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  public isSpeaking(): boolean {
    return !!(this.synth && this.synth.speaking && !this.synth.paused);
  }
}

export const speechService = new SpeechService();

// Camb.ai integration helper
export async function streamCambAIAudio(
  text: string,
  apiKey: string,
  voiceId: string
): Promise<string> {
  const cleanText = text.replace(/[*#`_]/g, "").trim();

  const response = await fetch("https://client.camb.ai/apis/tts-stream", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: cleanText,
      language: "bn-bd",
      voice_id: Number(voiceId) || 1,
      speech_model: "mars-flash",
      output_configuration: { format: "mp3" },
    }),
  });

  if (!response.ok) {
    throw new Error(`Camb.ai error (${response.status})`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
