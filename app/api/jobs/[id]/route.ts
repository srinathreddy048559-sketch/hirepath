// app/api/jobs/[id]/route.ts
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id; // ✅ no await, params comes from the second arg

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        postedBy: {
          select: { email: true, name: true },
        },
      },
    });

    if (!job) {
      return new Response(JSON.stringify({ message: "Job not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({ job }), { status: 200 });
  } catch (err) {
    console.error("Error fetching job by id:", err);
    return new Response(JSON.stringify({ message: "Server error" }), {
      status: 500,
    });
  }
}
