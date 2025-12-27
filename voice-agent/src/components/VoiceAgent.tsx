"use client";

import clsx from "clsx";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AgentState,
  createInitialState,
  handleUserUtterance
} from "../lib/agentFlow";
import SummaryCard from "./SummaryCard";

interface Message {
  id: string;
  role: "agent" | "user";
  content: string;
  timestamp: number;
}

type RecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  start: () => void;
  stop: () => void;
};

const createId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

const createMessage = (role: Message["role"], content: string): Message => ({
  id: `${role}-${createId()}`,
  role,
  content,
  timestamp: Date.now()
});

const VoiceAgent = () => {
  const [agentState, setAgentState] = useState<AgentState>(() => createInitialState());
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcriptPreview, setTranscriptPreview] = useState("");
  const recognitionRef = useRef<RecognitionInstance | null>(null);
  const finalHandlerRef = useRef<(utterance: string) => void>(() => {});
  const [manualInput, setManualInput] = useState("");
  const [synthesisReady, setSynthesisReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const SpeechRecognitionClass =
      (window as typeof window & { webkitSpeechRecognition?: unknown; SpeechRecognition?: unknown })
        .SpeechRecognition ||
      (window as typeof window & { webkitSpeechRecognition?: unknown; SpeechRecognition?: unknown })
        .webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setIsSupported(false);
      return;
    }

    const recognition = new (SpeechRecognitionClass as unknown as {
      new (): RecognitionInstance;
    })();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      if (!result) {
        return;
      }

      const text = result[0]?.transcript ?? "";
      if (result.isFinal) {
        setTranscriptPreview("");
        finalHandlerRef.current?.(text);
      } else {
        setTranscriptPreview(text);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    setIsSupported(true);

    return () => {
      recognition.stop();
    };
  }, []);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined") {
      return;
    }
    const synth = window.speechSynthesis;
    if (!synth) {
      return;
    }

    if (!synthesisReady) {
      setSynthesisReady(true);
    }

    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.02;
    utterance.pitch = 1;
    utterance.lang = "en-US";
    synth.speak(utterance);
  }, [synthesisReady]);

  const pushAgentMessage = useCallback(
    (content: string) => {
      setMessages((prev) => [...prev, createMessage("agent", content)]);
      speak(content);
    },
    [speak]
  );

  const pushUserMessage = useCallback((content: string) => {
    setMessages((prev) => [...prev, createMessage("user", content)]);
  }, []);

  const handleFinalTranscript = useCallback(
    (utterance: string) => {
      const cleaned = utterance.trim();
      if (!cleaned) {
        return;
      }

      pushUserMessage(cleaned);
      setAgentState((previous) => {
        const response = handleUserUtterance(cleaned, previous);
        setTimeout(() => {
          pushAgentMessage(response.reply);
        }, 160);
        return response.state;
      });
    },
    [pushAgentMessage, pushUserMessage]
  );

  useEffect(() => {
    finalHandlerRef.current = handleFinalTranscript;
  }, [handleFinalTranscript]);

  useEffect(() => {
    const initialMessage =
      "Hey there, I'm your EstateVoice assistant. Tap the mic and tell me what kind of tour you want to book.";
    setMessages([createMessage("agent", initialMessage)]);
    speak(initialMessage);
  }, [speak]);

  const toggleListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        recognition.start();
        setIsListening(true);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleManualSubmit = () => {
    if (!manualInput.trim()) {
      return;
    }
    handleFinalTranscript(manualInput);
    setManualInput("");
  };

  const isComplete = useMemo(() => agentState.step === "complete", [agentState.step]);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-3xl border border-white/10 bg-black/30 p-6 shadow-xl backdrop-blur">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold text-white">Voice Booking Agent</h2>
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-300">
            <div
              className={clsx(
                "h-2.5 w-2.5 rounded-full",
                isListening ? "bg-emerald-400 shadow-[0_0_0_6px_rgba(16,185,129,0.35)]" : "bg-slate-500"
              )}
            />
            {isSupported ? (isListening ? "Listening" : "Idle") : "Voice unavailable"}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="max-h-72 overflow-hidden rounded-2xl border border-white/5 bg-white/5">
            <div className="flex flex-col gap-3 overflow-y-auto px-4 py-5 text-sm leading-relaxed">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={clsx(
                    "flex",
                    message.role === "agent" ? "justify-start" : "justify-end"
                  )}
                >
                  <div
                    className={clsx(
                      "max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-3",
                      message.role === "agent"
                        ? "bg-white/10 text-white"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {transcriptPreview && (
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl border border-dashed border-primary/60 bg-primary/10 px-4 py-3 text-primary-foreground/80">
                    {transcriptPreview}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={toggleListening}
              disabled={!isSupported}
              className={clsx(
                "flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition",
                isListening
                  ? "bg-emerald-500 text-emerald-950 shadow-lg shadow-emerald-500/30"
                  : "bg-primary text-primary-foreground hover:bg-primary/90",
                !isSupported && "cursor-not-allowed opacity-60"
              )}
            >
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-current" />
              {isListening ? "Stop Listening" : "Tap to Speak"}
            </button>

            <div className="flex-1">
              <label className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-xs text-slate-300">
                <span className="whitespace-nowrap uppercase tracking-[0.2em]">Manual Input</span>
                <input
                  value={manualInput}
                  onChange={(event) => setManualInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      handleManualSubmit();
                    }
                  }}
                  placeholder="Type if mic is unavailable"
                  className="flex-1 bg-transparent text-sm font-medium text-white outline-none placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={handleManualSubmit}
                  className="rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground"
                >
                  Send
                </button>
              </label>
            </div>
          </div>

          {!isSupported && (
            <p className="rounded-2xl border border-orange-500/40 bg-orange-500/10 px-4 py-3 text-xs text-orange-100">
              Your browser does not support speech recognition. You can still chat by typing, and the assistant will
              respond with on-screen prompts.
            </p>
          )}
        </div>
      </div>

      <SummaryCard draft={agentState.draft} isComplete={isComplete} />
    </div>
  );
};

export default VoiceAgent;
