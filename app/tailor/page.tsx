// app/tailor/page.tsx
"use client";

import React, { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import PdfButton from "@/app/components/pdf/PdfButton";

type ResumeStyle = "Premium" | "ATS-safe" | "Pure ATS";
type TailorStep = 1 | 2 | 3;

export default function TailorPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [tailoredResume, setTailoredResume] = useState("");

  const [resumeStyle, setResumeStyle] = useState<ResumeStyle>("Premium");
  const [activeStep, setActiveStep] = useState<TailorStep>(1);

  const [uploadLabel, setUploadLabel] = useState("Choose a PDF resume to auto-extract text");
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const [error, setError] = useState<string | null>(null);

  const [selectedJobTitle, setSelectedJobTitle] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  const jdRef = useRef<HTMLTextAreaElement | null>(null);
  const resumeRef = useRef<HTMLTextAreaElement | null>(null);
  const outputRef = useRef<HTMLDivElement | null>(null);

  // -------- helpers --------
  function getJobIdFromUrl(): string | null {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    return params.get("jobId");
  }

  // ---------- Auto-fill from Job search (jobId first, fallback to localStorage) ----------
  useEffect(() => {
    if (typeof window === "undefined") return;

    const jobId = getJobIdFromUrl();

    async function loadFromJobId(id: string) {
      try {
        setError(null);

        const res = await fetch(`/api/jobs/${id}`, { method: "GET" });
        if (!res.ok) throw new Error("Could not load this job. Please try again.");

        const job = await res.json();

        const title: string | undefined = job.title;
        const company: string | undefined = job.company;
        const jd: string | undefined = job.description || job.jd || job.text;

        if (title) setSelectedJobTitle(title);
        if (company) setSelectedCompany(company);

        if (jd) {
          setJobDescription(String(jd));
          setActiveStep(1);
          requestAnimationFrame(() => {
            jdRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          });
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load job details.");
      }
    }

    function loadFromLocalStorage() {
      try {
        const raw = window.localStorage.getItem("hirepath-last-job");
        if (!raw) return;

        const job = JSON.parse(raw);

        const title: string | undefined = job.title;
        const company: string | undefined = job.company;
        const jd: string | undefined = job.jd || job.description || job.text;

        if (title) setSelectedJobTitle(title);
        if (company) setSelectedCompany(company);

        if (jd && !jobDescription.trim()) setJobDescription(String(jd));
      } catch {
        // ignore
      }
    }

    if (jobId) loadFromJobId(jobId);
    else loadFromLocalStorage();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Step scrolling ----------
  function goToStep(step: TailorStep) {
    setActiveStep(step);
    const target =
      step === 1 ? jdRef.current : step === 2 ? resumeRef.current : outputRef.current;

    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const styleOptions: ResumeStyle[] = ["Premium", "ATS-safe", "Pure ATS"];

  const canGenerate = jobDescription.trim().length > 40 && resumeText.trim().length > 40;

  // ---------- Upload PDF ----------
  async function handleUploadResume(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);
    setUploadLabel(file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to parse resume PDF");

      const data = await res.json();
      const text = (data.text || data.content || "").trim();

      if (!text) throw new Error("Parsed resume is empty – try another file.");

      setResumeText(text);
      setActiveStep(2);
      requestAnimationFrame(() => {
        resumeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Something went wrong while uploading your PDF.");
      setUploadLabel("Upload failed – try again");
    } finally {
      setIsUploading(false);
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

    const styleKey =
      resumeStyle === "Premium" ? "premium" : resumeStyle === "ATS-safe" ? "ats" : "pure";

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

      if (!res.ok) throw new Error("Failed to generate tailored resume.");

      const data = await res.json();
      const tailored =
        data.tailored || data.result || data.text || "AI did not return any text.";

      setTailoredResume(String(tailored).trim());
      setActiveStep(3);
      requestAnimationFrame(() => {
        outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Something went wrong while tailoring your resume.");
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
      // ignore
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50 pb-12 pt-6">
      <div className="mx-auto max-w-6xl px-4">
        {/* Top bar */}
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-600">
              HirePath · Tailor
            </p>

            <h1 className="mt-2 text-[2rem] font-black leading-tight text-slate-900 md:text-[2.3rem]">
              Tailor your resume to any{" "}
              <span className="bg-gradient-to-r from-sky-600 via-sky-500 to-indigo-500 bg-clip-text text-transparent">
                job description
              </span>
              .
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Paste a JD, upload your resume once, and get a clean ATS-friendly version in seconds.
            </p>

            {selectedJobTitle ? (
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-[11px] text-sky-700 ring-1 ring-sky-100">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                Tailoring for:{" "}
                <span className="font-semibold">
                  {selectedJobTitle}
                  {selectedCompany ? ` · ${selectedCompany}` : ""}
                </span>
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-2xl border border-sky-100 bg-white px-4 py-3 shadow-sm">
              <div className="text-[11px] font-semibold text-slate-700">
                Step {activeStep} of 3
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                {activeStep === 1 ? "Paste JD" : activeStep === 2 ? "Add resume" : "Review + download"}
              </div>
            </div>

            <Link
              href="/"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Back
            </Link>
          </div>
        </div>

        {/* Error banner */}
        {error ? (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {/* Layout */}
        <form
          onSubmit={handleGenerate}
          className="grid gap-4 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]"
        >
          {/* LEFT: Inputs */}
          <section className="rounded-3xl bg-white/90 p-5 shadow-sm shadow-sky-100 ring-1 ring-sky-100">
            {/* Steps + style */}
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-1 text-[11px] font-medium text-slate-600">
                <StepPill label="JD" n={1} active={activeStep === 1} onClick={() => goToStep(1)} />
                <span className="text-slate-400">→</span>
                <StepPill
                  label="Resume"
                  n={2}
                  active={activeStep === 2}
                  onClick={() => goToStep(2)}
                />
                <span className="text-slate-400">→</span>
                <StepPill
                  label="Tailored"
                  n={3}
                  active={activeStep === 3}
                  onClick={() => goToStep(3)}
                />
              </div>

              <div className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-1 py-1 text-[11px]">
                {styleOptions.map((style) => {
                  const isActive = resumeStyle === style;
                  return (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setResumeStyle(style)}
                      className={[
                        "rounded-full px-3 py-1 font-semibold transition",
                        isActive
                          ? "bg-sky-600 text-white shadow-sm"
                          : "bg-white text-slate-600 hover:bg-sky-50",
                      ].join(" ")}
                    >
                      {style}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* JD */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Job description
              </label>
              <textarea
                ref={jdRef}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                onFocus={() => setActiveStep(1)}
                placeholder="Paste the full job description here…"
                className="h-44 w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Tip: include requirements + responsibilities.</span>
                <span>{jobDescription.trim().length} chars</span>
              </div>
            </div>

            {/* Upload */}
            <div className="mt-4 space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Upload resume (PDF)
              </label>

              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="flex-1 truncate pr-3 text-[11px] text-slate-600">
                  {uploadLabel}
                </p>

                <label className="relative inline-flex cursor-pointer items-center gap-1 rounded-2xl bg-sky-600 px-4 py-2 text-[11px] font-semibold text-white shadow-sm shadow-sky-300 transition-all hover:-translate-y-[1px] hover:bg-sky-700">
                  {isUploading ? "Uploading…" : "Choose file"}
                  <input
                    type="file"
                    accept="application/pdf"
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    onChange={handleUploadResume}
                    disabled={isUploading}
                  />
                </label>
              </div>

              <p className="text-[11px] text-slate-500">
                We don’t store it — we only extract text for tailoring.
              </p>
            </div>

            {/* Resume text */}
            <div className="mt-4 space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Your resume text
              </label>
              <textarea
                ref={resumeRef}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                onFocus={() => setActiveStep(2)}
                placeholder="Paste your resume text, or upload a PDF to auto-fill…"
                className="h-44 w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>This text is what AI will tailor.</span>
                <span>{resumeText.trim().length} chars</span>
              </div>
            </div>

            {/* Generate */}
            <div className="mt-5">
              <button
                type="submit"
                disabled={isGenerating || !canGenerate}
                className={[
                  "inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold shadow-sm transition-all",
                  isGenerating || !canGenerate
                    ? "cursor-not-allowed bg-slate-200 text-slate-500"
                    : "bg-sky-600 text-white shadow-sky-300 hover:-translate-y-[1px] hover:bg-sky-700",
                ].join(" ")}
              >
                {isGenerating ? "Generating…" : "Generate tailored resume"}
              </button>

              {!canGenerate ? (
                <p className="mt-2 text-[11px] text-slate-500">
                  Add a fuller JD + resume text to enable generation.
                </p>
              ) : null}
            </div>
          </section>

          {/* RIGHT: Output */}
          <section
            ref={outputRef}
            className="flex flex-col rounded-3xl bg-white/90 p-5 shadow-sm shadow-sky-100 ring-1 ring-sky-100"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Output
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">Tailored resume</p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Review, tweak, then download PDF.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopyOutput}
                  disabled={!tailoredResume.trim()}
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-100 disabled:text-slate-300"
                >
                  {copyState === "copied" ? "Copied" : "Copy"}
                </button>

                {tailoredResume.trim() ? (
                  <PdfButton data={tailoredResume} filename="HirePath-Tailored-Resume.pdf" />
                ) : (
                  <button
                    type="button"
                    disabled
                    className="rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2 text-[11px] font-semibold text-slate-400"
                  >
                    Download PDF
                  </button>
                )}
              </div>
            </div>

            {!tailoredResume.trim() && !isGenerating ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-800">
                  Your tailored resume will show up here.
                </p>
                <p className="mt-2 text-[11px] leading-relaxed text-slate-600">
                  We’ll rewrite bullets to match the JD, improve keyword alignment,
                  and keep it ATS-friendly.
                </p>
              </div>
            ) : null}

            {isGenerating ? (
              <div className="space-y-3">
                <SkeletonRow />
                <SkeletonRow />
                <div className="h-56 w-full rounded-2xl bg-slate-100" />
              </div>
            ) : null}

            {tailoredResume.trim() ? (
              <textarea
                value={tailoredResume}
                onChange={(e) => setTailoredResume(e.target.value)}
                onFocus={() => setActiveStep(3)}
                className="h-[420px] w-full flex-1 resize-none rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-900 shadow-sm outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
              />
            ) : null}
          </section>
        </form>
      </div>
    </main>
  );
}

function StepPill({
  label,
  n,
  active,
  onClick,
}: {
  label: string;
  n: 1 | 2 | 3;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex items-center gap-1 rounded-full px-2 py-0.5 transition",
        active ? "bg-white text-sky-700 shadow-sm" : "text-slate-500 hover:text-sky-600",
      ].join(" ")}
    >
      <span
        className={[
          "inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px]",
          active ? "bg-sky-600 text-white" : "bg-sky-100 text-slate-500",
        ].join(" ")}
      >
        {n}
      </span>
      {label}
    </button>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-3">
      <div className="h-3 w-28 rounded bg-slate-100" />
      <div className="h-3 w-10 rounded bg-slate-100" />
    </div>
  );
}
