import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";     // 👈

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ...rest of your POST handler


type Body = { resume?: string; jd?: string };

export async function POST(req: Request) {
  try {
    const { resume, jd } = (await req.json()) as Body;

    if (!resume?.trim() || !jd?.trim()) {
      return NextResponse.json({ ok: false, error: "Missing inputs" }, { status: 400 });
    }

    // --- Your AI logic lives here. For now, make a simple deterministic output.
    const summary =
      [
        "- 3+ years of experience in data analysis, turning raw data into insights.",
        "- Proficient in SQL & Python; experienced with ETL and dashboards (Power BI/Tableau).",
        "- Collaborates cross-functionally; communicates findings to stakeholders."
      ].join("\n");

    const message =
      [
        "Hi Srinath,",
        "",
        "I came across your experience and think you’d be a great fit for our data team.",
        "Your SQL/Python background and dashboarding experience align well with the role.",
        "Would you be open to a quick chat?",
        "",
        "Best,",
        "Your Name"
      ].join("\n");

    const saved = await prisma.tailoredRun.create({
      data: { resume, jd, summary, message },
    });

    return NextResponse.json({ ok: true, run: saved }, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unexpected server error";
    console.error("POST /api/resume error:", err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
