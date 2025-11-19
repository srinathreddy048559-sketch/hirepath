"use client";

import React, { useEffect, useRef, useState } from "react";

type Role = "user" | "assistant";

type ChatMessage = {
  id: number;
  role: Role;
  content: string;
};

const TOOL_KEYWORDS = [
  "Python",
  "SQL",
  "AWS",
  "GCP",
  "Azure",
  "Snowflake",
  "Databricks",
  "Spark",
  "Kafka",
  "TensorFlow",
  "PyTorch",
  "scikit-learn",
  "Pandas",
  "NumPy",
  "Docker",
  "Kubernetes",
  "Airflow",
];

function looksLikeJD(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 250) return false;

  const lines = trimmed
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const bulletLines = lines.filter((l) => /^[-•\u2022]/.test(l)).length;
  const keywordHits = /responsibilit|requirement|qualification|skills|experience|location|duration/i.test(
    trimmed
  );

  return bulletLines >= 5 || (lines.length > 8 && keywordHits);
}

function analyzeJD(jd: string): { bullets: string[]; tools: string[] } {
  const lines = jd
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  let bullets = lines.filter((l) => /^[-•\u2022]/.test(l));
  if (bullets.length === 0) {
    const sentences = jd
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
    bullets = sentences;
  }

  const toolsSet = new Set<string>();
  for (const kw of TOOL_KEYWORDS) {
    const re = new RegExp(
      `\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      "i"
    );
    if (re.test(jd)) toolsSet.add(kw);
  }

  return { bullets: bullets.slice(0, 8), tools: Array.from(toolsSet) };
}

function buildJDReply(jd: string): string {
  const { bullets, tools } = analyzeJD(jd);

  const top3 = bullets.slice(0, 3).map((b) => b.replace(/^[-•\u2022]\s*/, ""));
  const toolList =
    tools.length > 0 ? tools.slice(0, 8).join(", ") : "Python, SQL, cloud";

  return [
    "Nice – this looks like a solid tech JD. Here’s what I’d highlight in your resume:",
    "",
    "Top 3 things to show in your bullets:",
    ...top3.map((b) => `• ${b}`),
    "",
    `Tools & stack to push near the top: ${toolList}.`,
    "",
    "If you want, ask me: “Give me 3 resume bullets for this JD” or “Write a summary for this role.”",
  ].join("\n");
}

function buildFollowupReply(question: string, jd: string): string {
  const { bullets, tools } = analyzeJD(jd);
  const top3 = bullets.slice(0, 3).map((b) => b.replace(/^[-•\u2022]\s*/, ""));
  const toolList =
    tools.length > 0 ? tools.slice(0, 8).join(", ") : "Python, SQL, cloud";

  if (/summary|overview|profile|about me/i.test(question)) {
    return [
      "Here’s a 3-line summary you can drop at the top of your resume:",
      "",
      "• Data / AI professional with hands-on experience across modern analytics and ML.",
      "• Strong in " + toolList + ".",
      "• Able to turn messy requirements into production-ready solutions that match this JD.",
    ].join("\n");
  }

  if (/bullet|bullets|points|highlights|responsibilit/i.test(question)) {
    return [
      "Here are 3 tailored resume bullets you can adapt:",
      "",
      `• Led end-to-end delivery of features aligned to: ${top3[0] || "key JD responsibilities"}.`,
      `• Built solutions using ${toolList} to support the role’s main initiatives.`,
      "• Collaborated with cross-functional teams to ship measurable impact for this role.",
    ].join("\n");
  }

  if (/email|cover/i.test(question)) {
    return [
      "Here’s a short cover-email you can reuse:",
      "",
      "Hi [Recruiter],",
      "",
      "I came across your opening and it matches my background in " +
        toolList +
        ". I’ve attached a tailored resume that focuses on:",
      ...top3.slice(0, 2).map((b) => `• ${b}`),
      "",
      "Would love to connect and discuss how I can help your team.",
      "",
      "Best,\nSrinath",
    ].join("\n");
  }

  return [
    "Got it. Based on the JD you shared earlier, focus your resume on:",
    "",
    ...top3.slice(0, 3).map((b) => `• ${b}`),
    "",
    `…and make sure ${toolList} live in your summary + skills section.`,
    "",
    'You can also ask: “Write bullets for my last project” or “How should I reorder my skills?”.',
  ].join("\n");
}

function buildGeneralReply(message: string): string {
  if (/hi|hello|hey/i.test(message)) {
    return "Hey! Paste a JD you’ve received and I’ll tell you what to highlight in your resume.";
  }

  if (/resume|cv|tailor|ats/i.test(message)) {
    return [
      "To tailor your resume, paste:",
      "1) The full JD (or as much as you have).",
      "2) Optional: a quick note about your current role.",
      "",
      "I’ll point out the main skills + 3–5 bullets you should emphasize.",
    ].join("\n");
  }

  return [
    "Nice question. I work best when you paste a JD.",
    "",
    "Try one of these:",
    "• Paste a JD and say: “What should I highlight?”",
    "• “Write 3 bullets for my experience based on this JD.”",
    "• “Give me a summary matching this role.”",
  ].join("\n");
}

export default function AskHirePathChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "assistant",
      content:
        "Hi! I’m HirePath AI. Paste a job description or ask how to tailor your resume.",
    },
  ]);
  const [isSending, setIsSending] = useState(false);
  const [lastJD, setLastJD] = useState<string | null>(null);

  const bodyRef = useRef<HTMLDivElement | null>(null);
  const nextIdRef = useRef(2);

  // Auto-scroll when messages change
  useEffect(() => {
    const el = bodyRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, isSending]);

  function toggleOpen() {
    setIsOpen((prev) => !prev);
  }

  async function handleSend() {
    const text = draft.trim();
    if (!text || isSending) return;

    const id = nextIdRef.current++;
    const userMsg: ChatMessage = { id, role: "user", content: text };

    setMessages((prev) => [...prev, userMsg]);
    setDraft("");
    setIsSending(true);

    const jdMode = looksLikeJD(text);
    const jdSnapshot = lastJD; // capture current JD

    // Fake “typing” delay so the UI feels alive
    setTimeout(() => {
      let replyText: string;

      if (jdMode) {
        setLastJD(text);
        replyText = buildJDReply(text);
      } else if (jdSnapshot) {
        replyText = buildFollowupReply(text, jdSnapshot);
      } else {
        replyText = buildGeneralReply(text);
      }

      const botMsg: ChatMessage = {
        id: nextIdRef.current++,
        role: "assistant",
        content: replyText,
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsSending(false);
    }, 450);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {/* Chat window */}
      {isOpen && (
        <div className="flex w-[21rem] flex-col rounded-3xl border border-slate-200 bg-white shadow-xl shadow-sky-100 md:w-[23rem]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-600 text-xs font-semibold text-white">
                H
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-900">
                  Ask HirePath AI
                </span>
                <span className="text-[10px] text-slate-500">
                  Paste a JD or ask about job search & resumes.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full px-2 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div
            ref={bodyRef}
            className="flex max-h-72 flex-1 flex-col gap-2 overflow-y-auto px-3 py-2 text-[11px]"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={
                  m.role === "user"
                    ? "ml-auto max-w-[85%] rounded-2xl bg-sky-600 px-3 py-1.5 text-[11px] text-white"
                    : "mr-auto max-w-[90%] rounded-2xl bg-slate-100 px-3 py-1.5 text-[11px] text-slate-900 whitespace-pre-line"
                }
              >
                {m.content}
              </div>
            ))}

            {isSending && (
              <div className="mr-auto flex items-center gap-1 rounded-2xl bg-slate-100 px-3 py-1.5 text-[10px] text-slate-500">
                <span className="inline-flex h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                <span className="inline-flex h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 delay-75" />
                <span className="inline-flex h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 delay-150" />
                <span className="ml-1">HirePath is typing…</span>
              </div>
            )}
          </div>

          {/* Footer / input */}
          <div className="border-t border-slate-100 px-3 pb-3 pt-2">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-2">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about a role or paste a JD…"
                className="flex-1 border-none bg-transparent py-1.5 text-[11px] text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={isSending || !draft.trim()}
                className="inline-flex items-center gap-1 rounded-2xl bg-sky-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-sky-300"
              >
                <span>Send</span>
              </button>
            </div>
            <p className="mt-1 text-[10px] text-slate-400">
              Tip: try “Summarize this JD” or “What should I highlight for this
              role?”.
            </p>
          </div>
        </div>
      )}

      {/* Bubble */}
      <button
        type="button"
        onClick={toggleOpen}
        className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-sky-300 hover:bg-sky-700"
      >
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-[11px]">
          💬
        </span>
        <span>Ask HirePath AI</span>
      </button>
    </div>
  );
}
