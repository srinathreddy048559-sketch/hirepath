// app/api/generate-resume/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Style = "premium" | "ats_safe" | "pure_ats";

/**
 * Grab the first 3 non-empty lines of the ORIGINAL resume.
 * We treat these as the candidate's true header.
 */
function getHeaderHint(resume: string): string[] {
  const lines = resume.replace(/\r\n/g, "\n").split("\n");
  const nonEmpty = lines.map((l) => l.trim()).filter((l) => l.length > 0);
  return nonEmpty.slice(0, 3);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 🔹 Accept BOTH old + new names to be safe
    const resume = (
      body?.resume ??
      body?.parsedText ??
      ""
    ).toString();

    const jd = (
      body?.jobDescription ??
      body?.jd ??
      ""
    ).toString();

    const styleRaw = (body?.style ?? "premium").toString() as Style;

    if (!resume.trim() || !jd.trim()) {
      return NextResponse.json(
        { ok: false, error: "Missing resume or job description" },
        { status: 400 }
      );
    }

    const allowedStyles: Style[] = ["premium", "ats_safe", "pure_ats"];
    const style: Style = allowedStyles.includes(styleRaw)
      ? styleRaw
      : "premium";

    // ------------------ style guidance ------------------
    let styleGuidance = "";

    if (style === "premium") {
      styleGuidance = `
STYLE: PREMIUM
- Modern, strong storytelling with clear structure.
- Impactful summary and bullets that highlight achievements.
- Still ATS-friendly, but you can use slightly more expressive language.
- Emphasize value, ownership, and results aligned to the JD.
`;
    } else if (style === "ats_safe") {
      styleGuidance = `
STYLE: ATS SAFE
- Very clear, simple, and recruiter/ATS-friendly.
- Plain text formatting, no decorative symbols.
- Focus on strong but concise bullets and JD keywords.
- Balanced between readability and ATS parsing.
`;
    } else if (style === "pure_ats") {
      styleGuidance = `
STYLE: PURE ATS
- Absolutely plain text optimized for Applicant Tracking Systems.
- Use only basic punctuation and "-" for bullets.
- Short, keyword-rich bullets that mirror the job description terminology.
- Avoid visually fancy formatting or complex phrasing.
`;
    }

    const headerHintLines = getHeaderHint(resume);
    const headerHintBlock =
      headerHintLines.length > 0 ? headerHintLines.join("\n") : "";

    // ------------------ user prompt ------------------
    const userPrompt = `
You will receive the candidate's ORIGINAL RESUME and a target JOB DESCRIPTION.

Use ONLY the candidate's real experience.
Do NOT invent fake companies, roles, projects, responsibilities, or dates.

ORIGINAL RESUME:
${resume}

JOB DESCRIPTION:
${jd}

Your job:
- Understand what role and level the JOB DESCRIPTION is for.
- Rewrite and reorganize the resume so it is strongly tailored to that role.
- Preserve truthful history but emphasize skills, tools, industries, and outcomes that match the JD.
- It must work for ANY profession (software, finance, healthcare, sales, operations, students, etc.).

Return ONLY the final tailored resume text.
    `.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.35,
      messages: [
        {
          role: "system",
          content: `
You are a world-class professional resume writer who tailors resumes to specific job descriptions for ANY role or industry.

General rules:
- Use ONLY the candidate’s real experience and qualifications.
- Do NOT invent fake companies, fake titles, fake tools/technologies, fake degrees, or fake dates.
- You may rephrase, regroup, and highlight existing achievements to better match the JD.
- You may infer realistic, modest metrics from the resume text, but do not fabricate wild or obviously fake claims.

${styleGuidance}

HEADER HINT (from the candidate's original resume):
${headerHintBlock || "(No strong header lines detected; create a reasonable one based on the resume.)"}

Use this header hint to keep the candidate's identity and contact details consistent, but:
- Do NOT print any meta-instructions.
- Do NOT write sentences like "the header must be copied exactly" or similar.
- Just output a clean resume starting with a normal header, then sections.

FINAL OUTPUT FORMAT (adapt to the role, but follow this order):

[NAME]
[ROLE TITLE MATCHED TO JD]
[LOCATION] • [EMAIL] • [PHONE] • [LINKEDIN OR PORTFOLIO IF PRESENT]

SUMMARY
3–4 lines describing who the candidate is and how they fit this JD.

CORE SKILLS
- 10–20 skills tailored to the JD, using "-" bullets or simple comma lines.

EXPERIENCE
[TITLE] | [COMPANY] | [LOCATION] | [DATE RANGE]
- 3–7 bullets per role, focusing on relevant tools, domain, and impact.

SELECT PROJECTS (only if present in original resume and relevant)

EDUCATION
- Degree(s), institution(s), and relevant certifications from original resume.

Formatting:
- Plain text only.
- Use "-" for bullets.
- No commentary, no instructions, only the final resume.
        `.trim(),
        },
        { role: "user", content: userPrompt },
      ],
    });

    const tailored =
      completion.choices[0].message.content?.toString().trim() ?? "";

    if (!tailored) {
      return NextResponse.json(
        { ok: false, error: "Empty response from model" },
        { status: 500 }
      );
    }

    // 🔹 Match what the Tailor page expects
    return NextResponse.json(
      { ok: true, output: tailored },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("generate-resume error", err);
    return NextResponse.json(
      { ok: false, error: "Failed to generate resume" },
      { status: 500 }
    );
  }
}
