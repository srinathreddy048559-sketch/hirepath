// app/api/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// ===========================
// GET PROFILE
// ===========================
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { ok: false, error: "not_logged_in" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        headline: true,
        location: true,
        phone: true,
        workAuth: true,
        shortSummary: true,
        linkedin: true,
        github: true,
        preferredRoles: true,
        preferredLocations: true,
        resumeUrl: true,
        profileCompletion: true,
        profileUpdatedAt: true,
      },
    });

    return NextResponse.json({ ok: true, user });
  } catch (e) {
    console.error("[profile][GET] error", e);
    return NextResponse.json(
      { ok: false, error: "profile_get_failed" },
      { status: 500 }
    );
  }
}

// ===========================
// UPDATE PROFILE
// ===========================
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { ok: false, error: "not_logged_in" },
        { status: 401 }
      );
    }

    const email = session.user.email!;
    const body = await req.json();
    const data: Record<string, any> = body || {};

    // ----- Auto compute profile completeness -----
    const fields = [
      "headline",
      "location",
      "phone",
      "workAuth",
      "shortSummary",
      "linkedin",
      "github",
      "preferredRoles",
      "preferredLocations",
      "resumeUrl",
    ];

    let filled = 0;
    fields.forEach((f) => {
      if (data[f] && data[f].toString().trim() !== "") filled++;
    });

    const completion = Math.round((filled / fields.length) * 100);

    const baseData = {
      ...data,
      profileCompletion: completion,
    };

    // ✅ use upsert so it doesn't crash if user row doesn't exist yet
    const updated = await prisma.user.upsert({
      where: { email },
      update: baseData,
      create: {
        email,
        name: session.user.name ?? null,
        image: (session.user as any).image ?? null,
        ...baseData,
      },
      select: {
        profileUpdatedAt: true,
        profileCompletion: true,
      },
    });

    return NextResponse.json({
      ok: true,
      profileUpdatedAt: updated.profileUpdatedAt,
      profileCompletion: updated.profileCompletion,
    });
  } catch (e) {
    console.error("[profile][PUT] error", e);
    return NextResponse.json(
      { ok: false, error: "profile_update_failed" },
      { status: 500 }
    );
  }
}
