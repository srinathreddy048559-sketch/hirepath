// app/api/jobs/[id]/route.ts
import prisma from "@/lib/prisma";

export async function GET(req: Request, context: any) {
  try {
    // Next 15: context.params can be a Promise, so we safely await it
    const params = await context.params;
    const id = params.id as string;

    const job = await prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      return new Response(JSON.stringify({ error: "Job not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(job), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Job fetch error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
