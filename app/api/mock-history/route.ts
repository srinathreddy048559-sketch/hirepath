// app/api/mock-history/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id ?? null;

    const body = await req.json();

    const {
      questionTitle,
      questionBody,
      answer,
      feedback,
      targetRole,
      level,
      focusMode,
    } = body as {
      questionTitle: string;
      questionBody: string;
      answer: string;
      feedback?: string;
      targetRole: string;
      level: string;
      focusMode: string;
    };

    if (!answer || !questionBody) {
      return NextResponse.json(
        { error: "Missing question or answer" },
        { status: 400 }
      );
    }

    await prisma.history.create({
      data: {
        title: questionTitle || "Mock interview answer",
        // Use jd field to store prompt + meta
        jd:
          `${questionBody}\n\n` +
          `[Target role: ${targetRole}, Level: ${level}, Focus: ${focusMode}]`,
        // Use resume field to store the raw answer
        resume: answer,
        // Use tailored field to store AI feedback if available
        tailored: feedback ?? "",
        userId, // can be null if not logged in
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Mock history save error:", err);
    return NextResponse.json(
      { error: "Failed to save mock interview answer" },
      { status: 500 }
    );
  }
}
