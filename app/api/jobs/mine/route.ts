// app/api/jobs/mine/route.ts
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      // Not logged in – return empty list
      return new Response(JSON.stringify({ jobs: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const jobs = await prisma.job.findMany({
      where: { postedById: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return new Response(JSON.stringify({ jobs }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("My jobs error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
