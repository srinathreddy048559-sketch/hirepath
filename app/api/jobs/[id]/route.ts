import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const job = await prisma.job.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        company: true,
        location: true,
        jobType: true,
        workMode: true,
        salaryRange: true,
        description: true,
        tags: true,
        createdAt: true,
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 });
  }
}
