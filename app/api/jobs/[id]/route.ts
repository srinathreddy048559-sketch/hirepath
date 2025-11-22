import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }   // ✅ Next.js 15 type fix
) {
  try {
    const { id } = await context.params;  // ✅ MUST await the params

    const job = await prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      return new Response(
        JSON.stringify({ error: "Job not found" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify(job),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (err: any) {
    console.error("Job GET error:", err);
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500 }
    );
  }
}
