// app/components/OutputPanel.tsx
"use client";

import type { TailoredResume, ResumeSection } from "@/app/types";

export default function OutputPanel({ data }: { data: TailoredResume | null }) {
  if (!data) return null;

  // typed helper to pick a section by kind
    // typed helper to pick a section by kind
    // safe helper to pick a section by kind
  const sections = (data?.sections ?? []) as any[];

  function get(kind: string) {
    return sections.find((s) => s?.kind === kind) ?? null;
  }



  const contact = get("contact");
  const summary = get("summary");
  const skills = get("skills");

  return (
    <div className="rounded-2xl border p-4 bg-white">
      <h3 className="text-base font-semibold mb-2">Done</h3>
      <div className="text-sm leading-6 text-slate-700 space-y-1">
        <div><b>Name:</b> {contact?.name ?? data.name}</div>
        {data.contact && <div><b>Contact:</b> {data.contact}</div>}
        {summary?.text && <div><b>Summary:</b> {summary.text}</div>}
        {skills?.items?.length ? (
          <div><b>Skills:</b> {skills.items.join(" • ")}</div>
        ) : null}
      </div>
    </div>
  );
}
