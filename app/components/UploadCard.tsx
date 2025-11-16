// app/components/UploadCard.tsx
"use client";

import React, { useState } from "react";

type UploadCardProps = {
  label?: string;
  helpText?: string;
  onParsed?: (text: string) => void;
};

export default function UploadCard({
  label,
  helpText,
  onParsed,
}: UploadCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---- PDF TEXT EXTRACTION (runs only in browser) ----
  async function extractPdfText(file: File): Promise<string> {
    // dynamic import so pdfjs runs only on the client
    const pdfjsLib: any = await import("pdfjs-dist/legacy/build/pdf");

    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => ("str" in item ? item.str : ""))
        .join(" ");
      fullText += (pageNum > 1 ? "\n\n" : "") + pageText;
    }

    // clean it up a bit
    return fullText
      .replace(/\s{2,}/g, " ")
      .replace(/[^\x09-\x7E]+/g, " ")
      .trim();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const text = await extractPdfText(file);

      if (!text || text.length < 50) {
        setError(
          "We couldn’t extract readable text from this PDF. Please export your resume again as a clean PDF (Print → Save as PDF) or paste the text manually."
        );
        onParsed?.("");
      } else {
        onParsed?.(text);
      }
    } catch (err) {
      console.error("UploadCard PDF parse error:", err);
      setError(
        "Something went wrong reading this PDF. Try saving it again as a PDF or paste your resume text manually."
      );
      onParsed?.("");
    } finally {
      setLoading(false);
      // allow re-uploading the same file
      e.target.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wide uppercase text-slate-300">
          {label ?? "1. Your current resume"}
        </span>

        <label className="inline-flex items-center rounded-full bg-sky-500/90 px-3 py-1 text-xs font-medium text-white shadow-md cursor-pointer hover:bg-sky-400 disabled:opacity-60">
          {loading ? "Extracting text…" : "Upload PDF"}
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
            disabled={loading}
          />
        </label>
      </div>

      {helpText && (
        <p className="text-[11px] text-slate-400 leading-snug">{helpText}</p>
      )}

      {error && (
        <p className="mt-1 rounded-md border border-rose-700/40 bg-rose-950/40 px-2 py-1 text-[11px] text-rose-300">
          {error}
        </p>
      )}
    </div>
  );
}
