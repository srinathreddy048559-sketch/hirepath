"use client";

import React, { useState, FormEvent } from "react";
import PdfButton from "./components/pdf/PdfButton";

export default function HomePage() {
  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState("");
  const [generatedResume, setGeneratedResume] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatLog, setChatLog] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [loadingResume, setLoadingResume] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [feedback, setFeedback] = useState("");

  // ---------- Upload handler ----------
  async function handleResumePdfUpload(file: File) {
    try {
      setUploadingResume(true);
      setFeedback("");

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!data.ok) {
        setResumeText("");
        setFeedback(
          data.error ??
            "We couldn’t read this PDF. Try exporting again as PDF or paste the text manually."
        );
        return;
      }

      setResumeText(data.text);
      setFeedback("");
    } catch (err) {
      console.error("upload error", err);
      setFeedback(
        "Unexpected error while reading your PDF. Please try again or paste your resume text."
      );
    } finally {
      setUploadingResume(false);
    }
  }

  // ---------- Generate tailored resume ----------
  async function handleGenerateResume(e: FormEvent) {
    e.preventDefault();
    if (!resumeText.trim() || !jdText.trim()) return;

    setLoadingResume(true);
    setGeneratedResume("");

    try {
      const res = await fetch("/api/generate-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume: resumeText,
          jd: jdText,
        }),
      });

      if (!res.ok) {
        console.error("generate-resume error", await res.text());
        alert("Something went wrong tailoring the resume. Please try again.");
        return;
      }

      const data = await res.json();
      setGeneratedResume(data.resume || "");
    } catch (err) {
      console.error("generate-resume error", err);
      alert("Something went wrong tailoring the resume. Please try again.");
    } finally {
      setLoadingResume(false);
    }
  }

  // ---------- Chatbot ----------
  async function handleChatSubmit(e: FormEvent) {
    e.preventDefault();
    const question = chatInput.trim();
    if (!question) return;

    setChatInput("");
    setLoadingChat(true);
    setChatLog((prev) => [...prev, { role: "user", content: question }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatLog.concat({ role: "user", content: question }),
          resume: resumeText,
          jd: jdText,
          tailored: generatedResume,
        }),
      });

      if (!res.ok) {
        console.error("chat error", await res.text());
        setChatLog((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Sorry, something went wrong answering that question.",
          },
        ]);
        return;
      }

      const data = await res.json();
      setChatLog((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || "" },
      ]);
    } catch (err) {
      console.error("chat error", err);
      setChatLog((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, something went wrong. Please try asking again in a moment.",
        },
      ]);
    } finally {
      setLoadingChat(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      {/* Top hero / header */}
      <header className="border-b border-slate-800/70 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 text-sm font-bold">
              HP
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight">
                HirePath.ai
              </span>
              <span className="text-[11px] text-slate-400">
                AI resume co-pilot for serious job seekers
              </span>
            </div>
          </div>
          <span className="text-[11px] rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 font-medium text-emerald-300">
            BETA – for feedback only
          </span>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 pb-20">
        {/* Hero text */}
        <section className="rounded-3xl border border-slate-800/70 bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-slate-900/20 p-6 md:p-8 shadow-[0_0_60px_rgba(15,23,42,0.7)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl space-y-2">
              <p className="text-[11px] font-semibold tracking-[0.25em] text-slate-400 uppercase">
                Confident resumes, faster
              </p>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                Turn your <span className="text-cyan-400">resume + JD</span>{" "}
                into a role-ready resume.
              </h1>
              <p className="text-sm text-slate-300">
                Paste or upload your resume, drop in a job description, and
                HirePath rewrites it to match the role while keeping your real
                experience. No fake projects. You stay in control.
              </p>
            </div>
            <div className="mt-2 text-right text-[11px] text-slate-400">
              Built by{" "}
              <span className="font-semibold text-slate-100">
                Srinath Reddy
              </span>{" "}
              🚀
            </div>
          </div>
        </section>

        {/* Main 3-column layout */}
        <section className="grid gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)_minmax(0,1.2fr)] items-start">
          {/* 1. Resume */}
          <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-4 shadow-inner shadow-black/40">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-xs font-semibold tracking-wide text-slate-300 uppercase">
                1. Your current resume
              </h2>
              <span className="text-[11px] text-slate-500">
                {resumeText.length.toLocaleString()} chars
              </span>
            </div>

            <button
              type="button"
              className="mb-3 inline-flex items-center rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-100 hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-800/70 disabled:text-slate-500"
              onClick={() => {
                const input = document.getElementById(
                  "resume-upload-input"
                ) as HTMLInputElement | null;
                input?.click();
              }}
              disabled={uploadingResume}
            >
              {uploadingResume ? "Extracting text from PDF…" : "Upload PDF"}
            </button>

            <input
              id="resume-upload-input"
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleResumePdfUpload(file);
              }}
            />

            {feedback && (
              <p className="mb-2 text-[11px] text-amber-300">{feedback}</p>
            )}

            <textarea
              className="mt-1 h-64 w-full resize-none rounded-2xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-slate-100 outline-none ring-0 focus:border-cyan-500/70"
              placeholder="Paste your existing resume text here… or upload a PDF above."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
          </div>

          {/* 2. JD */}
          <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-4 shadow-inner shadow-black/40">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-xs font-semibold tracking-wide text-slate-300 uppercase">
                2. Paste job description (JD)
              </h2>
              <span className="text-[11px] text-slate-500">
                {jdText.length.toLocaleString()} chars
              </span>
            </div>

            <textarea
              className="mt-1 h-64 w-full resize-none rounded-2xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-slate-100 outline-none ring-0 focus:border-cyan-500/70"
              placeholder="Paste the JD you are applying for…"
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
            />

            <button
              onClick={handleGenerateResume}
              disabled={loadingResume || !resumeText.trim() || !jdText.trim()}
              className={
                loadingResume || !resumeText.trim() || !jdText.trim()
                  ? "mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-500 cursor-not-allowed"
                  : "mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow hover:bg-cyan-400"
              }
            >
              {loadingResume ? "Generating…" : "Generate Tailored Resume"}
            </button>
          </div>

          {/* 3. Tailored resume */}
          <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-4 shadow-inner shadow-black/40">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <h2 className="text-xs font-semibold tracking-wide text-slate-300 uppercase">
                  3. Tailored resume (ready to send)
                </h2>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Optimized to match your JD while keeping your original
                  experience.
                </p>
              </div>
              <span
                className={
                  generatedResume
                    ? "rounded-full bg-emerald-500/15 px-2 py-1 text-[10px] font-semibold text-emerald-300"
                    : "rounded-full bg-slate-700/60 px-2 py-1 text-[10px] font-semibold text-slate-400"
                }
              >
                {generatedResume ? "Ready" : "Waiting"}
              </span>
            </div>

            <div className="mt-1 h-64 overflow-auto rounded-2xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs whitespace-pre-wrap text-slate-100">
              {generatedResume || (
                <span className="text-slate-500">
                  Your AI-tailored resume will appear here after you click{" "}
                  <span className="font-semibold">Generate Tailored Resume</span>.
                </span>
              )}
            </div>

            <PdfButton data={generatedResume} filename="HirePath-Resume.pdf" />
          </div>
        </section>

        {/* Bottom info row + feedback card */}
        <section className="grid gap-3 text-[11px] text-slate-300 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
            <h3 className="text-[11px] font-semibold text-slate-100">
              Built for real resumes
            </h3>
            <p className="mt-1 text-[11px] text-slate-400">
              No generic one-page template. HirePath works with your messy,
              long, real resume and shapes it for each role.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
            <h3 className="text-[11px] font-semibold text-slate-100">
              Clear, honest guidance
            </h3>
            <p className="mt-1 text-[11px] text-slate-400">
              The chatbot can call out missing keywords, weak bullets, or
              summary gaps so you know exactly what to improve.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
            <h3 className="text-[11px] font-semibold text-slate-100">
              You stay in control
            </h3>
            <p className="mt-1 text-[11px] text-slate-400">
              Edit any text before you send, generate multiple versions, and
              clear everything with a refresh. HirePath is a co-pilot, not a
              black box.
            </p>
          </div>

          {/* Feedback card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
            <h3 className="text-[11px] font-semibold text-slate-100">
              Feedback for HirePath
            </h3>
            <p className="mt-1 text-[11px] text-slate-400">
              Tell Srinath what feels confusing, what you love, or what you’d
              like to see next. This helps improve the next version.
            </p>
            <textarea
              className="mt-2 h-20 w-full resize-none rounded-xl border border-slate-800 bg-slate-950/80 px-2 py-1 text-[11px] text-slate-100 outline-none focus:border-cyan-500/70"
              placeholder="Type your feedback here…"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
            <p className="mt-1 text-[10px] text-slate-500">
              (Right now this stays on your screen — you can copy & paste it to
              share with Srinath.)
            </p>
          </div>
        </section>

        {/* Chatbot dock */}
        <section className="fixed bottom-4 right-4 w-full max-w-xs rounded-3xl border border-slate-800 bg-slate-950/95 p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border border-cyan-500/40 bg-cyan-500/15 text-[11px] font-bold text-cyan-300">
                HP
              </div>
              <div>
                <h3 className="text-[11px] font-semibold text-slate-100">
                  HirePath Chatbot
                </h3>
                <p className="text-[10px] text-slate-400">
                  Ask about keywords, bullet rewrites, or interview prep.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-2 max-h-40 overflow-auto rounded-2xl border border-slate-800 bg-slate-950/70 px-2 py-1 text-[11px] text-slate-100">
            {chatLog.length === 0 ? (
              <p className="text-[11px] text-slate-500">
                Example questions:{" "}
                <span className="italic">
                  “What skills should I highlight more for this JD?”
                </span>{" "}
                or{" "}
                <span className="italic">
                  “Can you suggest a stronger summary?”
                </span>
                .
              </p>
            ) : (
              chatLog.map((m, i) => (
                <div
                  key={i}
                  className={`mb-1 ${
                    m.role === "user" ? "text-cyan-300" : "text-slate-100"
                  }`}
                >
                  <span className="font-semibold">
                    {m.role === "user" ? "You: " : "HirePath: "}
                  </span>
                  {m.content}
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleChatSubmit} className="flex items-center gap-1">
            <input
              type="text"
              className="flex-1 rounded-2xl border border-slate-800 bg-slate-950/80 px-2 py-1 text-[11px] text-slate-100 outline-none focus:border-cyan-500/70"
              placeholder="Type your question…"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
            />
            <button
              type="submit"
              disabled={loadingChat || !chatInput.trim()}
              className={
                loadingChat || !chatInput.trim()
                  ? "rounded-2xl bg-slate-700 px-3 py-1 text-[11px] font-semibold text-slate-400 cursor-not-allowed"
                  : "rounded-2xl bg-cyan-500 px-3 py-1 text-[11px] font-semibold text-slate-950 hover:bg-cyan-400"
              }
            >
              {loadingChat ? "…" : "Send"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
