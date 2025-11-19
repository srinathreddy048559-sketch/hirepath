// app/api/jobs/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


// GET /api/jobs → list all jobs (for homepage + /jobs)
export async function GET() {
  try {
    const jobs = await prisma.job.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        postedBy: {
          select: { email: true, name: true },
        },
      },
    });

    return NextResponse.json({ jobs }, { status: 200 });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { message: "Failed to fetch jobs." },
      { status: 500 }
    );
  }
}

// POST /api/jobs → create a new job (must be logged in)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { message: "You must be logged in to post a job." },
        { status: 401 }
      );
    }

    const body = await req.json();

    const {
      title,
      company,
      location,
      jobType,
      workMode,
      salaryRange,
      tags,
      description,
      requirements,
    } = body;

    if (!title || !description) {
      return NextResponse.json(
        { message: "Title and description are required." },
        { status: 400 }
      );
    }

    // make sure user exists in DB
    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      // should rarely happen if you're using PrismaAdapter, but just in case
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name ?? null,
        },
      });
    }

    // normalize tags to comma-separated string
    let tagsString: string | null = null;
    if (Array.isArray(tags)) {
      tagsString = tags
        .map((t: string) => t.trim())
        .filter(Boolean)
        .join(", ");
    } else if (typeof tags === "string") {
      tagsString = tags;
    }

    const job = await prisma.job.create({
      data: {
        title: title.trim(),
        company: company?.trim() || null,
        location: location?.trim() || null,

        jobType: (jobType as string) || "Full-time",
        workMode: (workMode as string) || "Onsite",
        salaryRange: salaryRange?.trim() || null,
        tags: tagsString,

        // legacy field not really used now
        employment: null,

        description: description.trim(),
        requirements: requirements?.trim() || null,

        // 🔹 link job to logged-in user
        postedById: user.id,
      },
      include: {
        postedBy: {
          select: { email: true, name: true },
        },
      },
    });

    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { message: "Failed to create job." },
      { status: 500 }
    );
  }
}
