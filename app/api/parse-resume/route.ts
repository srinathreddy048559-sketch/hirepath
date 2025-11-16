// app/api/parse-resume/route.ts
import { NextResponse } from "next/server";
import pdfParse from "pdf-parse";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { ok: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Convert PDF → Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // --------------------------
    // 1️⃣ TRY NORMAL PDF PARSING
    // --------------------------
    try {
      const data = await pdfParse(buffer);

      if (data?.text?.trim().length > 20) {
        // Parsed successfully with regular PDF parser
        return NextResponse.json({ ok: true, text: data.text.trim() });
      }

      console.warn(
        "PDF parse: too little extractable text, falling back to OCR..."
      );
    } catch (err) {
      console.warn("PDF parse error, falling back to OCR...", err);
    }

    // --------------------------
    // 2️⃣ OCR FALLBACK (OCR.space)
    // --------------------------
    const apiKey = process.env.OCR_API_KEY;

    if (!apiKey) {
      console.error("OCR_API_KEY missing from .env");
      return NextResponse.json(
        { ok: false, error: "OCR API key missing" },
        { status: 500 }
      );
    }

    console.log("Trying OCR with OCR.space…");

    // OCR.space expects form/urlencoded or multipart, not JSON
    const params = new URLSearchParams();
    params.append("apikey", apiKey);
    params.append(
      "base64Image",
      `data:application/pdf;base64,${buffer.toString("base64")}`
    );
    params.append("isOverlayRequired", "false");
    params.append("OCREngine", "2");
    params.append("scale", "true");

    const ocrRes = await axios.post(
      "https://api.ocr.space/parse/image",
      params.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        // Don't throw on non-2xx; let us inspect the body
        validateStatus: () => true,
        maxBodyLength: Infinity,
      }
    );

    console.log("OCR response status:", ocrRes.status);
    console.log("OCR response data:", JSON.stringify(ocrRes.data, null, 2));

    // Basic success check according to OCR.space docs
    const isErrored = ocrRes.data?.IsErroredOnProcessing;
    const errorMessage =
      ocrRes.data?.ErrorMessage?.[0] || ocrRes.data?.ErrorMessage;

    if (isErrored) {
      console.error("OCR.space reported error:", errorMessage);
      return NextResponse.json(
        { ok: false, error: `OCR error: ${errorMessage || "Unknown error"}` },
        { status: 500 }
      );
    }

    const ocrText =
      ocrRes.data?.ParsedResults?.[0]?.ParsedText?.toString() ?? "";

    if (!ocrText || ocrText.trim().length < 5) {
      console.error("OCR succeeded but text was empty/too short");
      return NextResponse.json(
        { ok: false, error: "OCR failed to extract text" },
        { status: 500 }
      );
    }

    // ✅ Success via OCR fallback
    return NextResponse.json({ ok: true, text: ocrText.trim() });
  } catch (err) {
    console.error("Final parse-resume fatal:", err);
    return NextResponse.json(
      { ok: false, error: "Parsing failed" },
      { status: 500 }
    );
  }
}
