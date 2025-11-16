import type { NextRequest } from "next/server";
import type { TailoredResume, ResumeSection } from "@/types";

function naiveTailor(parsedText: string, jd: string): TailoredResume {
  const text = `${parsedText}\n${jd}`.trim();
  const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);

  const name =
    lines.find(l => /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+$/.test(l)) ?? "Your Name";

  const pick = (re: RegExp) =>
    lines.filter(l => re.test(l)).slice(0, 6).map(s => s.replace(/^[-•\u2022]\s*/, ""));

  const summary: ResumeSection = {
    kind: "summary",
    bullets: [
      "AI/ML professional with strong Python & SQL.",
      "Hands-on with model evals, metrics, and shipping features.",
      "Familiar with LLM prompting and basic RAG."
    ]
  };

  const skills: ResumeSection = { kind: "skills", bullets: pick(/python|sql|aws|gcp|azure|pandas|sklearn|docker|kubernetes/i) || ["Python", "SQL", "Pandas", "scikit-learn"] };
  const experience: ResumeSection = { kind: "experience", bullets: pick(/(built|developed|deployed|improved|reduced|designed)/i) || ["Developed pipelines and shipped ML features."] };
  const projects: ResumeSection = { kind: "projects", bullets: pick(/rag|llm|project|etl|pipeline|dashboard/i) || ["LLM-powered resume tailoring app"] };
  const education: ResumeSection = { kind: "education", bullets: pick(/b\.?tech|bachelor|master|university|college/i) || ["B.Tech — Engineering"] };

  return { name, sections: [summary, skills, experience, projects, education] };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedText: string = body?.parsedText ?? "";
    const jd: string = body?.jd ?? "";
    if (!parsedText && !jd)
      return Response.json({ ok: false, error: "no_parsed_text" }, { status: 400 });

    const tailored = naiveTailor(parsedText, jd);
    return Response.json({ ok: true, data: tailored });
  } catch (e: any) {
    return Response.json({ ok: false, error: e?.message ?? "tailor_failed" }, { status: 500 });
  }
}
