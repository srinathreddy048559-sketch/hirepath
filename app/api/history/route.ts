// app/api/history/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/history
// Return only the current user's history rows
export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { ok: false, error: "not_logged_in" },
        { status: 401 }
      );
    }

    // Find user id
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json(
        { ok: true, histories: [] },
        { status: 200 }
      );
    }

    const histories = await prisma.history.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        title: true,
        jd: true,
        resume: true,
        tailored: true,
      },
    });

    return NextResponse.json({ ok: true, histories });
  } catch (e) {
    console.error("[history][GET] error", e);
    return NextResponse.json(
      { ok: false, error: "history_get_failed" },
      { status: 500 }
    );
  }
}
