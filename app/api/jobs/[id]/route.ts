// app/api/jobs/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/jobs/:id  – single saved job *for this user*
export async function GET(_req: NextRequest, { params }: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { ok: false, error: "not_logged_in" },
        { status: 401 }
      );
    }

    const id = params?.id as string;

    const row = await prisma.job.findFirst({
      where: {
        id,
        // 🔑 match your schema: Job.postedById references User.id
        postedById: session.user.id,
      },
    });

    if (!row) {
      return NextResponse.json(
        { ok: false, error: "not_found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, job: row });
  } catch (e) {
    console.error("[job][GET by id] error", e);
    return NextResponse.json(
      { ok: false, error: "job_get_failed" },
      { status: 500 }
    );
  }
}

// DELETE /api/jobs/:id  – delete job only if it belongs to this user
export async function DELETE(_req: NextRequest, { params }: any) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { ok: false, error: "not_logged_in" },
        { status: 401 }
      );
    }

    const id = params?.id as string;

    // Check ownership via postedById
    const existing = await prisma.job.findFirst({
      where: {
        id,
        postedById: session.user.id,
      },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "not_found" },
        { status: 404 }
      );
    }

    await prisma.job.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[job][DELETE by id] error", e);
    return NextResponse.json(
      { ok: false, error: "job_delete_failed" },
      { status: 500 }
    );
  }
}
