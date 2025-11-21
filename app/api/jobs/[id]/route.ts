import { prisma } from "@/lib/prisma";

export async function GET(req: Request, context: { params: { id: string } }) {
  try {
    const { id } = context.params;

    const job = await prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      return new Response(JSON.stringify({ error: "Job not found" }), { status: 404 });
    }

    return new Response(JSON.stringify(job), { status: 200 });
  } catch (err: any) {
    console.error("Job fetch error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
