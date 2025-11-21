import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ⬅️ NEW: params is a Promise in Next 15
    const { id } = await params;

    const job = await prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      return new Response(JSON.stringify({ error: "Job not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(job), { status: 200 });
  } catch (err) {
    console.error("Job fetch error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
