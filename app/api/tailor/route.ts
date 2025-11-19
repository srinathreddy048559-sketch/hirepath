// app/api/tailor/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type { TailoredResume, ResumeSection } from "@/types";

// --------------------
// Simple local “AI” tailor
// --------------------
function naiveTailor(parsedText: string, jd: string): TailoredResume {
  const text = `${parsedText}\n${jd}`.trim();
  const lines = text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const name =
    lines.find((l) => /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+$/.test(l)) ??
    "Your Name";

  const pick = (re: RegExp) =>
    lines
      .filter((l) => re.test(l))
      .slice(0, 6)
      .map((s) => s.replace(/^[-•\u2022]\s*/, ""));

  const summary: ResumeSection = {
    kind: "summary",
    bullets: [
      "AI/ML professional with strong Python & SQL.",
      "Hands-on with model evals, metrics, and shipping features.",
      "Familiar with LLM prompting and basic RAG.",
    ],
  };

  const skills: ResumeSection = {
    kind: "skills",
    bullets:
      pick(/python|sql|aws|gcp|azure|pandas|sklearn|docker|kubernetes/i) || [
        "Python",
        "SQL",
        "Pandas",
        "scikit-learn",
      ],
  };

  const experience: ResumeSection = {
    kind: "experience",
    bullets:
      pick(/(built|developed|deployed|improved|reduced|designed)/i) || [
        "Developed pipelines and shipped ML features.",
      ],
  };

  const projects: ResumeSection = {
    kind: "projects",
    bullets:
      pick(/rag|llm|project|etl|pipeline|dashboard/i) || [
        "LLM-powered resume tailoring app.",
      ],
  };

  const education: ResumeSection = {
    kind: "education",
    bullets:
      pick(/b\.?tech|bachelor|master|university|college/i) || [
        "B.Tech — Engineering",
      ],
  };

  return { name, sections: [summary, skills, experience, projects, education] };
}

// --------------------
// Turn TailoredResume -> plain text for UI/PDF
// --------------------
function renderTailoredResume(resume: TailoredResume): string {
  const lines: string[] = [];

  // Header
  if (resume.name) {
    lines.push(resume.name.toUpperCase());
    lines.push("");
  }

  const sections = (resume.sections ?? []) as ResumeSection[];

  for (const section of sections) {
    if (!section) continue;

    const kind = section.kind ?? "";
    const bullets = section.bullets ?? [];

    let heading = "";
    switch (kind) {
      case "summary":
        heading = "SUMMARY";
        break;
      case "skills":
        heading = "SKILLS";
        break;
      case "experience":
        heading = "EXPERIENCE";
        break;
      case "projects":
        heading = "PROJECTS";
        break;
      case "education":
        heading = "EDUCATION";
        break;
      default:
        heading = String(kind).toUpperCase();
    }

    if (!heading) continue;

    lines.push(heading);
    for (const bullet of bullets) {
      if (!bullet) continue;
      lines.push(`• ${bullet}`);
    }

    lines.push(""); // blank line between sections
  }

  return lines.join("\n");
}

// --------------------
// POST /api/tailor
// --------------------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // --------------------
    // 0) CHAT MODE for mini window
    // --------------------
    if (body?.mode === "chat") {
      const history = Array.isArray(body.history) ? body.history : [];

      // Get last user message text
      const lastUser = [...history]
        .reverse()
        .find((m: any) => m && m.role === "user");

      let question = "";
      if (typeof lastUser?.content === "string") {
        question = lastUser.content;
      } else if (Array.isArray(lastUser?.content)) {
        // if you ever pass OpenAI-style content array
        question = lastUser.content
          .map((c: any) => c?.text ?? "")
          .join(" ");
      }

      let reply =
        "Thanks for sharing! Paste a job description and I’ll tell you how to tailor your resume.";

      if (question) {
        if (/summarize/i.test(question)) {
          reply =
            "To summarize a JD, pull out: 1) top 3 responsibilities, 2) top 5 skills, 3) must-have tools (Python/SQL/cloud/etc.). Then mirror those in your summary and first 4–5 bullets.";
        } else if (/highlight|focus|points/i.test(question)) {
          reply =
            "Focus your resume on: the same tech stack, similar projects, measurable impact (metrics), and any domain match. Put the closest experience in the top 4–6 bullets.";
        } else if (/resume|cv/i.test(question)) {
          reply =
            "Keep your resume 1–2 pages, strong action verbs, and align bullets directly with the JD keywords. Avoid paragraphs, keep it bullet-based and ATS-friendly.";
        } else if (/job search|find.*job|next role/i.test(question)) {
          reply =
            "For job search: pick 2–3 target titles, filter by location/remote, save a shortlist, and tailor a resume + short email for each role instead of mass-applying.";
        } else {
          reply =
            "Got it! If you paste a JD, I can suggest what to highlight in your resume and how to phrase 3–5 strong bullets for that role.";
        }
      }

      return NextResponse.json({ reply });
    }

    // --------------------
    // 1) Tailor flow
    // --------------------

    // Support both old shape ({ parsedText, jd }) and new shape ({ resume, jd })
    const parsedText: string = body?.parsedText ?? body?.resume ?? "";
    const jd: string = body?.jd ?? "";
    const title: string =
      body?.title || body?.jobTitle || "Tailored resume run";

    if (!parsedText && !jd) {
      console.log(">> [tailor] no parsed text or jd");
      return NextResponse.json(
        { ok: false, error: "no_parsed_text" },
        { status: 400 }
      );
    }

    console.log(">> [tailor] incoming body", {
      title,
      parsedLen: parsedText.length,
      jdLen: jd.length,
    });

    // 2) Generate structured tailored resume
    const structured: TailoredResume = naiveTailor(parsedText, jd);
    console.log(">> [tailor] generated tailored resume for", structured.name);

    // 2b) Render to plain text for the UI
    const text = renderTailoredResume(structured);

    // 3) Get logged-in user (if any)
    const session = await getServerSession(authOptions);

    let userId: string | null = null;
    if (session?.user?.email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      if (dbUser) {
        userId = dbUser.id;
      }
    }

    console.log(">> [tailor] userId to attach:", userId);

    // 4) Save to History
    console.log(">> [tailor] about to save history row…");

    const historyRow = await prisma.history.create({
      data: {
        title,
        jd,
        resume: parsedText,
        tailored: JSON.stringify(structured),
        ...(userId && {
          user: {
            connect: { id: userId },
          },
        }),
      },
    });

    console.log(">> [tailor] saved history row with id:", historyRow.id);

    // 5) Return tailored resume to UI
    // TailorPage looks for data.tailored OR data.text, so we return both.
    return NextResponse.json({
      ok: true,
      tailored: text, // plain text used by textarea + PDF
      text,           // same value, just in case
      structured,     // full object if we ever want richer UI later
    });
  } catch (e: any) {
    console.error(">> [tailor] POST error", e);
    return NextResponse.json(
      { ok: false, error: e?.message ?? "tailor_failed" },
      { status: 500 }
    );
  }
}
