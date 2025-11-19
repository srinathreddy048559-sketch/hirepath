// app/api/parse-resume/route.ts
import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { ok: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Convert File → Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // --------------------------------
    // 1️⃣ TRY STANDARD PDF PARSING
    // --------------------------------
   // 1️⃣ TRY STANDARD PDF PARSING
try {
  const parsed = await pdfParse(buffer);

  if (parsed?.text?.trim().length > 20) {
    return NextResponse.json({
      ok: true,
      text: parsed.text.trim(),
      method: "pdf-parse",
    });
  }

  console.warn("pdf-parse returned too little text -> using OCR...");
} catch (err: any) {
  // 🔇 make the log smaller so dev console is not crazy
  console.warn(
    "pdf-parse failed, falling back to OCR. Reason:",
    err?.message || String(err)
  );
}


    // --------------------------------
    // 2️⃣ OCR FALLBACK (OCR.space)
    // --------------------------------
    const apiKey = process.env.OCR_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: "OCR_API_KEY missing in .env" },
        { status: 500 }
      );
    }

    console.log("Running OCR via OCR.space…");

    const params = new URLSearchParams();
    params.append("apikey", apiKey);
    params.append(
      "base64Image",
      `data:application/pdf;base64,${buffer.toString("base64")}`
    );
    params.append("isOverlayRequired", "false");
    params.append("OCREngine", "2");
    params.append("scale", "true");
    params.append("language", "eng");

    const ocrRes = await axios.post(
      "https://api.ocr.space/parse/image",
      params.toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        validateStatus: () => true,
        maxBodyLength: Infinity,
      }
    );

    const error = ocrRes.data?.ErrorMessage?.[0];
    const isError = ocrRes.data?.IsErroredOnProcessing;

    if (isError) {
      return NextResponse.json(
        { ok: false, error: error || "OCR processing error" },
        { status: 500 }
      );
    }

    const ocrText = ocrRes.data?.ParsedResults?.[0]?.ParsedText || "";

    if (!ocrText || ocrText.trim().length < 10) {
      return NextResponse.json(
        { ok: false, error: "OCR extracted too little text" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      text: ocrText.trim(),
      method: "ocr",
    });
  } catch (err) {
    console.error("Fatal parse-resume error:", err);
    return NextResponse.json(
      { ok: false, error: "Internal parsing error" },
      { status: 500 }
    );
  }
}
