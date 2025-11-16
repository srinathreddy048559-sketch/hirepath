"use client";

import React from "react";

export default function UploadPair({
  onResumeText,
  onJDText,
}: {
  onResumeText: (t: string) => void;
  onJDText: (t: string) => void;
}) {
  const fileRef = React.useRef<HTMLInputElement>(null);
  const jdRef = React.useRef<HTMLTextAreaElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const fd = new FormData();
    fd.append("file", f);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    onResumeText(data.text ?? "");
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Resume box */}
      <div className="rounded-xl border p-4 bg-white">
        <div className="font-semibold mb-2">Upload Resume (PDF)</div>
        <input ref={fileRef} type="file" accept="application/pdf" onChange={handleFile} />
        <p className="text-xs text-gray-500 mt-2">Upload your latest resume as a PDF. We’ll extract text automatically.</p>
      </div>

      {/* JD box */}
      <div className="rounded-xl border p-4 bg-white">
        <div className="font-semibold mb-2">Paste Job Description (text)</div>
        <textarea
          ref={jdRef}
          className="w-full h-48 rounded-lg border p-3 text-sm outline-none"
          placeholder="Paste the JD here..."
          onChange={(e) => onJDText(e.target.value)}
        />
        <div className="mt-2 flex gap-2">
          <button
            className="px-3 py-1 rounded-lg border text-sm"
            onClick={() => {
              if (jdRef.current) jdRef.current.value = "";
              onJDText("");
            }}
          >
            Clear
          </button>
          <button
            className="px-3 py-1 rounded-lg border text-sm"
            onClick={async () => {
              try {
                const txt = await navigator.clipboard.readText();
                if (jdRef.current) jdRef.current.value = txt;
                onJDText(txt);
              } catch {
                // ignore
              }
            }}
          >
            Paste
          </button>
        </div>
      </div>
    </div>
  );
}
