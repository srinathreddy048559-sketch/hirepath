import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { markdown } = await req.json();
    if (!markdown) {
      return NextResponse.json({ error: "markdown required" }, { status: 400 });
    }

    const doc = new PDFDocument({ size: "LETTER", margin: 48 });

    const buffers: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => buffers.push(chunk));
    const endPromise = new Promise<void>(resolve => doc.on("end", resolve));

    // super-minimal: render markdown as plain text (upgrade to proper md renderer later)
    doc.fontSize(12).text(markdown, { align: "left" });
    doc.end();

    await endPromise;

    const pdf = Buffer.concat(buffers);
    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="resume.pdf"`
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "pdf error" }, { status: 500 });
  }
}
