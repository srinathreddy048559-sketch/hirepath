// app/api/history/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(req: Request) {
  try {
    // URL will look like: /api/history/123
    const url = new URL(req.url);
    const segments = url.pathname.split("/");
    const id = segments[segments.length - 1];

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "Missing id in URL" },
        { status: 400 }
      );
    }

    await prisma.history.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("history DELETE error", err);
    return NextResponse.json(
      { ok: false, error: "Failed to delete history item" },
      { status: 500 }
    );
  }
}
