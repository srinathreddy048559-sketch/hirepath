// app/api/history/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/history/:id
export async function GET(_req: NextRequest, { params }: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { ok: false, error: "not_logged_in" },
        { status: 401 }
      );
    }

    const id = params?.id as string;

    const row = await prisma.history.findFirst({
      where: {
        id,
        user: {
          email: session.user.email,
        },
      },
    });

    if (!row) {
      return NextResponse.json(
        { ok: false, error: "not_found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, history: row });
  } catch (e) {
    console.error("[history][GET by id] error", e);
    return NextResponse.json(
      { ok: false, error: "history_get_failed" },
      { status: 500 }
    );
  }
}
