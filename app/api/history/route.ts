// app/api/history/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const items = await prisma.history.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ ok: true, items });
  } catch (err) {
    console.error("history GET error", err);
    return NextResponse.json(
      { ok: false, error: "Failed to load history" },
      { status: 500 }
    );
  }
}
