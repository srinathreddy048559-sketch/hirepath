// app/api/jobs/route.ts
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") ?? "";

    const where: any = {};

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { company: { contains: q, mode: "insensitive" } },
        { location: { contains: q, mode: "insensitive" } },
        { tags: { contains: q, mode: "insensitive" } },
      ];
    }

    const jobs = await prisma.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // 👇 homepage expects { jobs: [...] }
    return new Response(JSON.stringify({ jobs }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Jobs list error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    console.log("[POST /api/jobs] body:", body);

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

    // ✅ Hard check required fields
    if (!title || !description) {
      return new Response(
        JSON.stringify({ error: "Title and description are required." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const job = await prisma.job.create({
      data: {
        title,
        description,

        // optional basic fields
        company: company || null,
        location: location || null,

        // let Prisma defaults kick in if not provided
        jobType: jobType || undefined,   // "Full-time" default
        workMode: workMode || undefined, // "Onsite" default

        salaryRange: salaryRange || null,

        // if your UI sends tags as array, store as comma string
        tags: Array.isArray(tags)
          ? tags.join(", ")
          : tags || null,

        requirements: requirements || null,

        // only include postedById if we actually have a user
        ...(session?.user?.id
          ? { postedById: session.user.id }
          : {}),
      },
    });

    return new Response(JSON.stringify({ job }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Job create error:", err);
    return new Response(
      JSON.stringify({ error: "Server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
