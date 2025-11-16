// app/api/generate-resume/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const resume = (body?.resume ?? "").toString();
    const jd = (body?.jd ?? "").toString();

    if (!resume.trim() || !jd.trim()) {
      return NextResponse.json(
        { error: "Missing resume or job description" },
        { status: 400 }
      );
    }

    const userPrompt = `
You are an expert resume writer.

Task:
- Take the ORIGINAL RESUME and tailor it to strongly match the JOB DESCRIPTION.
- Keep all experience truthful (no fake companies, roles, or dates).
- Keep a clear structure: HEADER (do not invent contact info), SUMMARY, CORE SKILLS, EXPERIENCE (bullets), EDUCATION.
- Emphasize skills, tools, domains, and metrics that match the JD.
- Output plain text only (no markdown, no bullets like •, just "-" or standard characters).
- Keep it ATS-friendly.

ORIGINAL RESUME:
${resume}

JOB DESCRIPTION:
${jd}

Return ONLY the final tailored resume text.
    `.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content:
            "You are a senior AI resume coach who tailors resumes to job descriptions without inventing any fake experience.",
        },
        { role: "user", content: userPrompt },
      ],
    });

    const tailored =
      completion.choices[0].message.content?.toString().trim() ?? "";

    if (!tailored) {
      return NextResponse.json(
        { error: "Empty response from model" },
        { status: 500 }
      );
    }

    return NextResponse.json({ resume: tailored }, { status: 200 });
  } catch (err: any) {
    console.error("generate-resume error", err);
    return NextResponse.json(
      { error: "Failed to generate resume" },
      { status: 500 }
    );
  }
}
