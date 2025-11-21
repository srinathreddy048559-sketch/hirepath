import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    // extract the ID from URL
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return new Response(JSON.stringify({ error: "Missing job ID" }), { status: 400 });
    }

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
