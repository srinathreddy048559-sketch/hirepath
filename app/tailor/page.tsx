// app/tailor/page.tsx
"use client";

import React, {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import PdfButton from "@/app/components/pdf/PdfButton";

type ResumeStyle = "Premium" | "ATS-safe" | "Pure ATS";
type TailorStep = 1 | 2 | 3;

export default function TailorPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [tailoredResume, setTailoredResume] = useState("");

  const [resumeStyle, setResumeStyle] = useState<ResumeStyle>("Premium");
  const [activeStep, setActiveStep] = useState<TailorStep>(1);

  const [uploadLabel, setUploadLabel] = useState(
    "Choose a PDF resume to auto-extract text"
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const [error, setError] = useState<string | null>(null);

  const [selectedJobTitle, setSelectedJobTitle] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  const jdRef = useRef<HTMLTextAreaElement | null>(null);
  const resumeRef = useRef<HTMLTextAreaElement | null>(null);
  const outputRef = useRef<HTMLDivElement | null>(null);

  // ---------- Auto-fill from Job search ----------
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("hirepath-last-job");
      if (!raw) return;
      const job = JSON.parse(raw);

      const title: string | undefined = job.title;
      const company: string | undefined = job.company;
      const jd: string | undefined = job.jd || job.description || job.text;

      if (title) setSelectedJobTitle(title);
      if (company) setSelectedCompany(company);
      if (jd && !jobDescription.trim()) {
        setJobDescription(jd);
      }
    } catch {
      // ignore parse errors
    }
  }, []); // run once on mount

  // ---------- Step scrolling ----------
  function goToStep(step: TailorStep) {
    setActiveStep(step);
    const target =
      step === 1
        ? jdRef.current
        : step === 2
        ? resumeRef.current
        : outputRef.current;
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // ---------- Upload PDF ----------
  async function handleUploadResume(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);
    setUploadLabel(file.name);

    try {
      const formData = new FormData();
      formData.append("file", file); // backend expects "file"

      const res = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to parse resume PDF");
      }

      const data = await res.json();
      const text = (data.text || data.content || "").trim();

      if (!text) {
        throw new Error("Parsed resume is empty – try another file.");
      }

      setResumeText(text);
      setActiveStep(2);
      if (resumeRef.current) {
        resumeRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err?.message || "Something went wrong while uploading your PDF."
      );
      setUploadLabel("Upload failed – try again");
    } finally {
      setIsUploading(false);
      // allow re-upload of same file later
      e.target.value = "";
    }
  }

  // ---------- Generate tailored resume ----------
  async function handleGenerate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCopyState("idle");

    if (!jobDescription.trim()) {
      setError("Please paste a full job description first.");
      goToStep(1);
      return;
    }
    if (!resumeText.trim()) {
      setError("Please paste or upload your current resume text.");
      goToStep(2);
      return;
    }

    setIsGenerating(true);

    // Map UI style labels to backend-friendly keys if needed
    const styleKey =
      resumeStyle === "Premium"
        ? "premium"
        : resumeStyle === "ATS-safe"
        ? "ats"
        : "pure";

    try {
      const res = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Tailored resume run",
          jd: jobDescription,
          resume: resumeText,
          style: styleKey,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate tailored resume.");
      }

      const data = await res.json();
      const tailored =
        data.tailored || data.result || data.text || "AI did not return any text.";

      setTailoredResume(tailored.trim());
      setActiveStep(3);

      if (outputRef.current) {
        outputRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err?.message || "Something went wrong while tailoring your resume."
      );
    } finally {
      setIsGenerating(false);
    }
  }

  // ---------- Copy output ----------
  async function handleCopyOutput() {
    if (!tailoredResume.trim()) return;
    try {
      await navigator.clipboard.writeText(tailoredResume);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      // ignore clipboard errors
    }
  }

  const styleOptions: ResumeStyle[] = ["Premium", "ATS-safe", "Pure ATS"];

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50 pb-12 pt-6">
      <div className="mx-auto max-w-6xl px-4">
        {/* Breadcrumb */}
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-600">
          HIREPATH · TAILOR YOUR RESUME
        </p>

        {/* Heading */}
        <header className="mb-6 space-y-2">
          <h1 className="text-[2rem] font-black leading-tight text-slate-900 md:text-[2.3rem]">
            Turn any job description into a{" "}
            <span className="bg-gradient-to-r from-sky-600 via-sky-500 to-indigo-500 bg-clip-text text-transparent">
              perfect-fit resume.
            </span>
          </h1>
          <p className="max-w-2xl text-sm text-slate-600">
            Paste a job description, upload your resume once, and let HirePath
            create a tailored, ATS-friendly version in seconds.
          </p>

          {selectedJobTitle && (
            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-[11px] text-sky-700 ring-1 ring-sky-100">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
              Tailoring for:{" "}
              <span className="font-semibold">
                {selectedJobTitle}
                {selectedCompany ? ` · ${selectedCompany}` : ""}
              </span>
            </div>
          )}
        </header>

        {/* Error banner */}
        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-700">
            {error}
          </div>
        )}

        {/* Main two-column layout */}
        <form
          onSubmit={handleGenerate}
          className="grid gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2.3fr)]"
        >
          {/* LEFT: Tailoring workspace */}
          <section className="rounded-[1.6rem] bg-white p-4 shadow-sm shadow-sky-100 ring-1 ring-sky-100">
            {/* Top bar: steps + style */}
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              {/* Steps */}
              <div className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-1 text-[11px] font-medium text-slate-600">
                <button
                  type="button"
                  onClick={() => goToStep(1)}
                  className={`flex items-center gap-1 rounded-full px-2 py-0.5 transition ${
                    activeStep === 1
                      ? "bg-white text-sky-700 shadow-sm"
                      : "text-slate-500 hover:text-sky-600"
                  }`}
                >
                  <span
                    className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
                      activeStep === 1
                        ? "bg-sky-600 text-white"
                        : "bg-sky-100 text-slate-500"
                    }`}
                  >
                    1
                  </span>
                  JD
                </button>
                <span className="text-slate-400">→</span>
                <button
                  type="button"
                  onClick={() => goToStep(2)}
                  className={`flex items-center gap-1 rounded-full px-2 py-0.5 transition ${
                    activeStep === 2
                      ? "bg-white text-sky-700 shadow-sm"
                      : "text-slate-500 hover:text-sky-600"
                  }`}
                >
                  <span
                    className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
                      activeStep === 2
                        ? "bg-sky-600 text-white"
                        : "bg-sky-100 text-slate-500"
                    }`}
                  >
                    2
                  </span>
                  Resume
                </button>
                <span className="text-slate-400">→</span>
                <button
                  type="button"
                  onClick={() => goToStep(3)}
                  className={`flex items-center gap-1 rounded-full px-2 py-0.5 transition ${
                    activeStep === 3
                      ? "bg-white text-sky-700 shadow-sm"
                      : "text-slate-500 hover:text-sky-600"
                  }`}
                >
                  <span
                    className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
                      activeStep === 3
                        ? "bg-sky-600 text-white"
                        : "bg-sky-100 text-slate-500"
                    }`}
                  >
                    3
                  </span>
                  Tailored
                </button>
              </div>

              {/* Style buttons */}
              <div className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-1 py-1 text-[11px]">
                {styleOptions.map((style) => {
                  const isActive = resumeStyle === style;
                  return (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setResumeStyle(style)}
                      className={`rounded-full px-3 py-1 font-semibold transition ${
                        isActive
                          ? "bg-sky-600 text-white shadow-sm"
                          : "bg-white text-slate-600 hover:bg-sky-50"
                      }`}
                    >
                      {style}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* JD textarea */}
            <div className="space-y-1 mb-4">
              <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Job description
              </label>
              <textarea
                ref={jdRef}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here…"
                className="h-40 w-full resize-none rounded-2xl border border-sky-100 bg-sky-50/40 px-3 py-2 text-sm text-slate-900 placeholder-slate-300 outline-none focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200"
              />
              <p className="text-[10px] text-slate-400">
                Paste email + full JD (including bullet points) for best results.
              </p>
            </div>

            {/* Upload resume (PDF) */}
            <div className="space-y-1 mb-4">
              <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Upload resume (PDF)
              </label>

              <div className="flex items-center justify-between rounded-2xl border border-sky-100 bg-sky-50/40 px-3 py-2">
                <p className="flex-1 truncate pr-3 text-[11px] text-slate-500">
                  {uploadLabel}
                </p>
                <label className="relative inline-flex cursor-pointer items-center gap-1 rounded-full bg-sky-600 px-3 py-1 text-[11px] font-semibold text-white shadow-sm hover:bg-sky-700">
                  {isUploading ? "Uploading…" : "Browse"}
                  <input
                    type="file"
                    accept="application/pdf"
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    onChange={handleUploadResume}
                    disabled={isUploading}
                  />
                </label>
              </div>

              <p className="text-[10px] text-slate-400">
                We only process your PDF locally while tailoring — we don’t store it.
              </p>
            </div>

            {/* Resume textarea */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Your resume text
              </label>
              <textarea
                ref={resumeRef}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your current resume text, or let us fill this from your PDF above…"
                className="h-40 w-full resize-none rounded-2xl border border-sky-100 bg-sky-50/40 px-3 py-2 text-sm text-slate-900 placeholder-slate-300 outline-none focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200"
              />
              <p className="mt-1 text-[10px] text-slate-400">
                Edited text here is what the AI will use to tailor your final resume.
              </p>
            </div>

            {/* Generate button */}
            <div className="mt-4">
              <button
                type="submit"
                disabled={isGenerating}
                className="inline-flex w-full items-center justify-center rounded-full bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-sky-300 hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
              >
                {isGenerating ? "Generating…" : "Generate tailored resume"}
              </button>
            </div>
          </section>

          {/* RIGHT: Tailored output */}
          <section
            ref={outputRef}
            className="flex flex-col rounded-[1.6rem] bg-white p-4 shadow-sm shadow-sky-100 ring-1 ring-sky-100"
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Tailored resume output
                </p>
                <p className="text-[11px] text-slate-400">
                  Review, tweak, then download as a clean PDF.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopyOutput}
                  disabled={!tailoredResume.trim()}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-700 hover:border-sky-500 hover:text-sky-600 disabled:cursor-not-allowed disabled:border-slate-100 disabled:text-slate-300"
                >
                  {copyState === "copied" ? "Copied" : "Copy"}
                </button>

                {tailoredResume.trim() ? (
                  <PdfButton
                    data={tailoredResume}
                    filename="HirePath-Tailored-Resume.pdf"
                  />
                ) : (
                  <button
                    type="button"
                    disabled
                    className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-400"
                  >
                    Download PDF
                  </button>
                )}
              </div>
            </div>

            <textarea
              value={tailoredResume}
              onChange={(e) => setTailoredResume(e.target.value)}
              className="h-80 w-full flex-1 resize-none rounded-2xl border border-sky-100 bg-white/70 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
              placeholder="Your tailored resume will appear here after generating."
            />

            <div className="mt-3 rounded-2xl bg-slate-900 px-3 py-3 text-[11px] text-slate-200">
              <p className="mb-1 font-semibold text-sky-200">
                Pro tips for better matches
              </p>
              <ul className="list-disc space-y-0.5 pl-4">
                <li>Use full job descriptions (email + bullet points).</li>
                <li>Keep your latest tech stack and metrics in the resume text.</li>
                <li>
                  Try <span className="font-semibold">Premium</span> for recruiter
                  email, <span className="font-semibold">ATS-safe</span> for
                  portals, and <span className="font-semibold">Pure ATS</span> for
                  strict keyword filters.
                </li>
              </ul>
            </div>
          </section>
        </form>
      </div>
    </main>
  );
}
