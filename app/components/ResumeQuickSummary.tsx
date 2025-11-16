"use client";

import { useMemo } from "react";

type Props = {
  resume: string;
};

function clean(s: string) {
  return s.replace(/\s+/g, " ").trim();
}

export default function ResumeQuickSummary({ resume }: Props) {
  const { summarySentences, bullets } = useMemo(() => {
    const text = resume || "";
    const lines = text
      .split(/\n+/)
      .map((l) => clean(l))
      .filter(Boolean);

    // Heuristics to pull useful bits from a typical resume
    const roleHints = [/senior/i, /lead/i, /engineer/i, /scientist/i, /mlops/i, /data/i, /ai/i];
    const techHints = [
      /python|pytorch|tensorflow|sklearn|langchain|llm|rag|mistral|llama|openai|vertex|gcp|aws|azure|kubernetes|docker|airflow|mlflow|faiss|ray/i,
    ];
    const impactHints = [/improv|reduce|increase|optimi|deploy|scale|built|designed|integrat|launched/i];

    const roleLines = lines.filter((l) => roleHints.some((r) => r.test(l)));
    const techLines = lines.filter((l) => techHints.some((r) => r.test(l)));
    const impactLines = lines.filter((l) => impactHints.some((r) => r.test(l)) || /^[-•]/.test(l));

    // Rough years-of-exp extractor
    const yearsMatch = text.match(/(\d+)\+?\s*(?:years|yrs)/i);
    const years = yearsMatch ? yearsMatch[1] : undefined;

    const sentence1 = years
      ? `Candidate has ~${years} years of experience with a strong focus on AI/ML and production systems.`
      : `Candidate shows strong experience in AI/ML and production systems.`;

    const sentence2 = roleLines[0]
      ? `Recent role highlight: ${clean(roleLines[0])}.`
      : techLines[0]
      ? `Notable technologies: ${clean(techLines[0])}.`
      : `Experienced with modern ML platforms and tooling.`;

    const sentence3 = techLines[1]
      ? `Additional tools: ${clean(techLines[1])}.`
      : impactLines[0]
      ? `Track record: ${clean(impactLines[0].replace(/^[-•]\s*/, ""))}.`
      : "";

    const summarySentences = [sentence1, sentence2, sentence3].filter(Boolean);

    const rawBullets = [
      ...impactLines.map((l) => l.replace(/^[-•]\s*/, "")),
      ...(techLines.slice(0, 2).map((t) => `Tech: ${t}`)),
    ];

    const bullets = rawBullets
      .map((b) => clean(b))
      .filter(Boolean)
      .slice(0, 3);

    return { summarySentences, bullets };
  }, [resume]);

  if (!resume.trim()) return null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm p-5">
      <h3 className="font-semibold">Resume Quick Summary</h3>
      <p className="text-sm text-gray-800 mt-2">{summarySentences.join(" ")}</p>

      {bullets.length > 0 && (
        <ul className="list-disc ml-5 text-sm text-gray-800 space-y-1 mt-3">
          {bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
