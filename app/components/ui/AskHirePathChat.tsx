"use client";

import React, {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Role = "user" | "assistant";

type ChatMessage = {
  id: number;
  role: Role;
  content: string;
};

const BASE_SUGGESTIONS = [
  "Summarize this JD in 5 bullet points.",
  "Extract the top 10 required skills from this JD.",
  "Tell me where my profile might NOT match this JD.",
];

const ADVANCED_SUGGESTIONS = [
  "Write a short cover email for this JD using my AI/ML profile.",
  "Generate a tailored resume for this JD using my AI/ML resume profile. Return clean resume text only.",
  "List 5 talking points I can use in a recruiter screen for this JD.",
];

const EMOJIS = ["😊", "🔥", "🚀", "💼", "👍", "🤝"];

function looksLikeJD(text: string): boolean {
  const len = text.trim().length;
  if (len < 280) return false;

  const lower = text.toLowerCase();
  const hasBullets =
    text.includes("•") || text.includes("- ") || text.includes("\n•");
  const hasKeywords =
    lower.includes("responsibilit") ||
    lower.includes("requirements") ||
    lower.includes("qualification") ||
    lower.includes("job description") ||
    lower.includes("role:");

  return hasBullets || hasKeywords;
}

function jdPreview(text: string, max = 420): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return trimmed.slice(0, max) + "…";
}

export default function AskHirePathChat() {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "assistant",
      content:
        "Hi! Paste a job description here and ask me anything — I’ll analyze it and help you tailor your resume, bullets, and emails.",
    },
  ]);
  const [lastJD, setLastJD] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // voice + emoji
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const idRef = useRef(2);

  // Auto-scroll
  useEffect(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    el.scrollTop = el.scrollHeight;
  }, [chat, loading]);

  // Choose suggestions based on JD presence
  const suggestionsToShow = useMemo(
    () =>
      lastJD ? [...BASE_SUGGESTIONS, ...ADVANCED_SUGGESTIONS] : BASE_SUGGESTIONS,
    [lastJD]
  );

  const jdStatusLabel = useMemo(() => {
    if (!lastJD) return "No JD detected yet";
    const length = lastJD.length;
    if (length > 4000) return "Long JD loaded";
    if (length > 1500) return "Full JD loaded";
    return "JD snippet loaded";
  }, [lastJD]);

  async function handleSend(e?: FormEvent) {
    if (e) e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setError(null);

    const userMessage: ChatMessage = {
      id: idRef.current++,
      role: "user",
      content: text,
    };
    setChat((prev) => [...prev, userMessage]);

    if (looksLikeJD(text)) {
      setLastJD(text);
    }

    setInput("");
    setShowEmojiPicker(false);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          lastJD,
          history: chat.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data: any = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "HirePath AI had trouble answering. Try again."
        );
      }

      const replyText: string =
        data?.reply ||
        data?.answer ||
        data?.message ||
        (typeof data === "string" ? data : JSON.stringify(data, null, 2));

      const assistantMessage: ChatMessage = {
        id: idRef.current++,
        role: "assistant",
        content: replyText,
      };

      setChat((prev) => [...prev, assistantMessage]);

      if (typeof data?.jd === "string" && data.jd.trim().length > 100) {
        setLastJD(data.jd);
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err?.message ||
          "Something went wrong talking to HirePath AI. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSuggestionClick(text: string) {
    setInput(text);
    if (lastJD) {
      setTimeout(() => handleSend(), 10);
    }
  }

  // --- Voice recording using SpeechRecognition ---
  function toggleRecording() {
    if (isRecording) {
      // stop
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Voice input isn’t supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      // Append to whatever is already typed
      setInput((prev) =>
        prev ? `${prev.trim()} ${transcript.trim()}` : transcript.trim()
      );
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event);
      setError("Voice input had a problem. Try again or type instead.");
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    setIsRecording(true);
    recognition.start();
  }

  // --- Emoji helpers ---
  function handleEmojiClick(emoji: string) {
    setInput((prev) => (prev ? `${prev}${emoji}` : emoji));
  }

  return (
    <div className="flex h-[520px] w-full max-w-4xl flex-col rounded-3xl bg-white/95 shadow-xl shadow-sky-100 ring-1 ring-sky-100 md:flex-row">
      {/* Left: Chat */}
      <div className="flex flex-1 flex-col border-sky-50 md:border-r">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-sky-50 px-4 py-3">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.16em] text-sky-500">
              ASK HIREPATH AI
            </p>
            <p className="text-sm font-semibold text-sky-950">
              JD-aware resume assistant
            </p>
            <p className="text-[11px] text-slate-500">
              Paste a job description once, then ask follow-up questions.
            </p>
          </div>

          <div className="hidden text-[10px] text-slate-400 md:block">
            <p>Understands JDs · Remembers context · Writes bullets & emails</p>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 space-y-3 overflow-y-auto px-3 py-3 text-sm"
        >
          {chat.map((m) => (
            <div
              key={m.id}
              className={
                m.role === "user" ? "flex justify-end" : "flex justify-start"
              }
            >
              <div
                className={
                  m.role === "user"
                    ? "max-w-[80%] rounded-2xl bg-sky-600 px-3 py-2 text-xs text-white shadow-sm"
                    : "max-w-[80%] rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-800 shadow-sm ring-1 ring-slate-100"
                }
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="inline-flex h-6 items-center rounded-full bg-slate-50 px-3 ring-1 ring-slate-100">
                <span className="mr-2 text-[10px] font-semibold text-sky-600">
                  HirePath
                </span>
                <span className="flex gap-1">
                  <span className="h-1 w-1 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.2s]" />
                  <span className="h-1 w-1 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.1s]" />
                  <span className="h-1 w-1 animate-bounce rounded-full bg-slate-400" />
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={handleSend}
          className="border-t border-sky-50 bg-slate-50/60 px-3 py-3"
        >
          {error && (
            <div className="mb-2 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-[11px] text-rose-700">
              {error}
            </div>
          )}

          {/* Suggestions row */}
          <div className="mb-2 flex flex-wrap gap-2">
            {suggestionsToShow.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSuggestionClick(s)}
                className="rounded-full border border-sky-100 bg-white px-3 py-1 text-[10px] text-sky-700 shadow-sm hover:border-sky-300 hover:bg-sky-50"
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                lastJD
                  ? "Ask a follow-up about this JD, your resume, bullets, or emails…"
                  : "Paste a full job description here (or ask a quick question)…"
              }
              rows={2}
              className="max-h-24 flex-1 resize-none rounded-2xl border border-sky-100 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-300 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
            />

            {/* Emoji + mic */}
            <div className="relative mb-0.5 flex flex-col items-center gap-1">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setShowEmojiPicker((prev) => !prev)
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-lg shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  😊
                </button>
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`flex h-8 w-8 items-center justify-center rounded-full bg-white text-[15px] shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 ${
                    isRecording ? "ring-2 ring-rose-400 bg-rose-50" : ""
                  }`}
                >
                  {isRecording ? "■" : "🎙"}
                </button>
              </div>

              {showEmojiPicker && (
                <div className="absolute bottom-10 right-0 flex gap-1 rounded-2xl bg-white px-2 py-1 text-lg shadow-md ring-1 ring-slate-200">
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleEmojiClick(emoji)}
                      className="hover:scale-110 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="mb-0.5 inline-flex h-9 items-center justify-center rounded-2xl bg-sky-600 px-4 text-xs font-semibold text-white shadow-sm shadow-sky-300 hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Sending…" : "Send"}
            </button>
          </div>
        </form>
      </div>

      {/* Right: Active JD panel */}
      <div className="hidden w-64 flex-col border-l border-sky-50 bg-slate-50/80 px-3 py-3 text-xs text-slate-700 md:flex">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-500">
          ACTIVE JD
        </p>
        <p className="mt-0.5 text-[11px] text-slate-500">
          I’ll use this JD for follow-up questions and tailoring.
        </p>

        <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[10px] text-sky-700 shadow-sm ring-1 ring-sky-100">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {lastJD ? jdStatusLabel : "Paste a JD to get started"}
        </div>

        <div className="mt-3 flex-1 overflow-y-auto rounded-2xl bg-white px-3 py-2 text-[11px] leading-relaxed shadow-sm ring-1 ring-slate-100">
          {lastJD ? (
            <pre className="whitespace-pre-wrap text-[11px] text-slate-800">
              {jdPreview(lastJD)}
            </pre>
          ) : (
            <p className="text-[11px] text-slate-400">
              When you paste a long job description, it will show up here so you
              can keep asking questions without re-pasting.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
