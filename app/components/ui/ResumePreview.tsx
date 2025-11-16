"use client";
import type { TailoredResume, ResumeSection } from "@/types";

type Props = { data: TailoredResume | null; title?: string };

function toMarkdown(r: TailoredResume): string {
  const lines: string[] = [];
  lines.push(`# ${r.name}`);
  if (r.contact) lines.push(r.contact);
  lines.push("");

  const titles: Record<ResumeSection["kind"], string> = {
    summary: "Summary",
    skills: "Skills",
    experience: "Experience",
    projects: "Projects",
    education: "Education",
  };

  for (const s of r.sections) {
    lines.push(`## ${titles[s.kind]}`);
    for (const b of s.bullets) lines.push(`- ${b}`);
    lines.push("");
  }
  return lines.join("\n");
}

function download(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

export default function ResumePreview({ data, title = "Tailored Resume" }: Props) {
  if (!data) return <p className="text-neutral-600">Generate first, then download.</p>;
  const md = toMarkdown(data);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">{title}</h4>
        <button className="inline-flex items-center rounded-lg px-4 py-2 border"
                onClick={() => download("tailored_resume.txt", md)}>
          Download TXT
        </button>
      </div>
      <pre className="whitespace-pre-wrap text-sm leading-6 bg-neutral-50 rounded-xl p-3">
        {md}
      </pre>
    </div>
  );
}
