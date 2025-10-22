import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { resume, jd } = await req.json();

    if (!resume || !jd) {
      return NextResponse.json(
        { ok: false, error: "Missing resume or job description" },
        { status: 400 }
      );
    }

    // TODO: replace these two with your OpenAI calls
    const summary =
      "- 3+ years of experience in data analysis...\n- Proficient in SQL & Python...";
    const message =
      "Hi Srinath,\n\nI came across your experience and think you'd be a great fit...";

    const saved = await prisma.tailoredRun.create({
      data: { resume, jd, summary, message },
      select: {
        id: true,
        resume: true,
        jd: true,
        summary: true,
        message: true,
        createdAt: true
      }
    });

    return NextResponse.json({ ok: true, run: saved }, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unexpected server error.";
    console.error("POST /api/resume error:", err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
