// app/api/history/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
  }
  try {
    const deleted = await prisma.tailoredRun.delete({ where: { id } });
    return NextResponse.json({ ok: true, id: deleted.id }, { status: 200 });
  } catch (err) {
    console.error("Error deleting record:", err);
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
}
