// app/api/history/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await prisma.tailoredRun.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        resume: true,
        jd: true,
        summary: true,
        message: true,
        createdAt: true,
      },
    });
    return NextResponse.json(items, { status: 200 });
  } catch (err) {
    console.error("GET /api/history error:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
