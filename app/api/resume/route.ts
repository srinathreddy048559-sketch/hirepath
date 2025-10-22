// app/api/resume/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import prisma from "@/app/lib/prisma"; // <- singleton import (your prisma.ts)

// ✅ Force Node runtime (Edge will break with Prisma/OpenAI)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    // ---- Guardrails ----
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ ok: false, error: "Missing OPENAI_API_KEY in .env" }, { status: 500 });
    }

    const body = await req.json().catch(() => null);
    const resume: string | undefined = body?.resume?.toString();
    const jd: string | undefined = body?.jd?.toString();

    if (!resume || !jd) {
      return NextResponse.json({ ok: false, error: "Both 'resume' and 'jd' are required." }, { status: 400 });
    }

    // ---- Prompts ----
    const summaryPrompt = [
      {
        role: "system" as const,
        content:
          "You summarize a candidate's fit for a job in 3–6 concise bullet points. Be specific and actionable. No fluffy language.",
      },
      {
        role: "user" as const,
        content: `Resume:\n${resume}\n\nJob Description:\n${jd}\n\nReturn only the bullet list.`,
      },
    ];

    const messagePrompt = [
      {
        role: "system" as const,
        content:
          "You write a short, friendly, professional outreach message (3–5 sentences) to the candidate. No bullet points.",
      },
      {
        role: "user" as const,
        content: `Resume:\n${resume}\n\nJob Description:\n${jd}\n\nWrite the outreach message.`,
      },
    ];

    // ---- Call OpenAI (parallel) ----
    const [summaryResp, messageResp] = await Promise.all([
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: summaryPrompt,
        temperature: 0.3,
      }),
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messagePrompt,
        temperature: 0.5,
      }),
    ]);

    const summary =
      summaryResp.choices?.[0]?.message?.content?.toString().trim() || "No summary generated.";
    const message =
      messageResp.choices?.[0]?.message?.content?.toString().trim() || "No message generated.";

    // ---- Persist in DB (singleton prevents pool exhaustion) ----
    const saved = await prisma.tailoredRun.create({
      data: { resume, jd, summary, message },
      select: { id: true, resume: true, jd: true, summary: true, message: true, createdAt: true },
    });

    return NextResponse.json({ ok: true, run: saved }, { status: 200 });
  } catch (err: any) {
    console.error("API error /api/resume:", err?.message || err);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 },
    );
  }
}
