// app/components/ui/UploadCard.tsx
"use client";

import { useRef, useState } from "react";

type Props = {
  onUploaded: (text: string) => void;
  onStatus?: (s: "idle" | "uploading" | "done" | "error") => void;
  onError?: (msg: string) => void;
};

export default function UploadCard({ onUploaded, onStatus, onError }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [jd, setJd] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];

    if (!file) {
      onError?.("Please choose a PDF file first.");
      onStatus?.("error");
      return;
    }

    try {
      onStatus?.("uploading");
      const form = new FormData();
      form.append("file", file);        // IMPORTANT: name MUST be 'file'
      form.append("jd", jd || "");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || `Upload failed (${res.status})`);
      }

      const data = await res.json();
      onUploaded(data.text ?? "");
      onStatus?.("done");
    } catch (err: any) {
      onError?.(err?.message || "Upload failed");
      onStatus?.("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3">
      <input
        ref={fileRef}
        type="file"
        accept="application/pdf"
        className="block w-full rounded-md border p-2 text-sm"
      />

      <div>
        <label className="block text-xs text-gray-600 mb-1">Paste Job Description</label>
        <textarea
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          placeholder="Paste the JD here…"
          className="w-full min-h-[140px] rounded-md border p-2 text-sm"
        />
      </div>

      <button
        type="submit"
        className="rounded-md bg-black text-white px-4 py-2 text-sm disabled:opacity-50"
      >
        Generate Tailored Resume
      </button>
    </form>
  );
}
