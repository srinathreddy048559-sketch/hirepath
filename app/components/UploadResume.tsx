"use client";
import { useState } from "react";
import type { TailoredResume } from "@/types";

type Props = { onGenerated: (r: TailoredResume) => void };

export default function UploadResume({ onGenerated }: Props) {
  const [resumeText, setResumeText] = useState("");
  const [jd, setJd] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleGenerate() {
    setBusy(true); setMsg(null);
    try {
      const res = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parsedText: resumeText, jd })
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || "tailor_failed");
      onGenerated(json.data as TailoredResume);
      setMsg("Tailored resume ready → right panel.");
    } catch (e: any) {
      setMsg(e?.message || "Failed.");
    } finally { setBusy(false); }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">Resume Text (paste)</label>
      <textarea
        className="w-full h-40 rounded-xl border p-2"
        value={resumeText}
        onChange={(e) => setResumeText(e.target.value)}
        placeholder="Paste your resume text here…"
      />

      <label className="block text-sm font-medium">Job Description</label>
      <textarea
        className="w-full h-32 rounded-xl border p-2"
        value={jd}
        onChange={(e) => setJd(e.target.value)}
        placeholder="Paste the JD here…"
      />

      <button className="inline-flex items-center rounded-lg px-4 py-2 border bg-black text-white"
              onClick={handleGenerate} disabled={busy}>
        {busy ? "Generating…" : "Generate Tailored Resume"}
      </button>

      {msg && <p className="text-sm text-neutral-600">{msg}</p>}
    </div>
  );
}
