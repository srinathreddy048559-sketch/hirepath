// app/api/pdf/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

type ExperienceItem = { company: string; title: string; date?: string; bullets: string[] };
type EducationItem = { school: string; degree: string; year?: string };
type Section =
  | { kind: "summary"; text: string }
  | { kind: "skills"; items: string[] }
  | { kind: "experience"; items: ExperienceItem[] }
  | { kind: "education"; items: EducationItem[] };

type Resume = {
  name: string;
  location?: string;
  email?: string;
  github?: string;
  sections: Section[];
};

// Simple text writer with wrapping
function drawWrappedText(page: any, text: string, x: number, y: number, maxWidth: number, lineHeight: number, font: any, size: number) {
  const words = text.split(/\s+/);
  let line = "";
  let cursorY = y;

  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    const width = font.widthOfTextAtSize(test, size);
    if (width > maxWidth) {
      page.drawText(line, { x, y: cursorY, size, font });
      cursorY -= lineHeight;
      line = w;
    } else {
      line = test;
    }
  }
  if (line) page.drawText(line, { x, y: cursorY, size, font });
  return cursorY - lineHeight; // return next y
}

export async function POST(req: NextRequest) {
  try {
    const { resume } = (await req.json()) as { resume: Resume };
    if (!resume?.name || !resume.sections) {
      return NextResponse.json({ error: "Missing resume payload" }, { status: 400 });
    }

    const pdf = await PDFDocument.create();
    const page = pdf.addPage([612, 792]); // Letter
    const margin = 54;
    let y = 792 - margin;

    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

    // Header
    page.drawText(resume.name, { x: margin, y, size: 20, font: bold, color: rgb(0, 0, 0) });
    y -= 22;

    const contact = [resume.location, resume.email, resume.github].filter(Boolean).join(" | ");
    if (contact) {
      y = drawWrappedText(page, contact, margin, y, 612 - margin * 2, 14, font, 10);
    }
    y -= 6;

    // Sections
    const sectionTitle = (t: string) => {
      y -= 10;
      page.drawText(t, { x: margin, y, size: 12, font: bold });
      y -= 16;
    };

    for (const sec of resume.sections) {
      if (y < 120) {
        // new page
        y = 792 - margin;
        pdf.addPage(page);
      }

      if (sec.kind === "summary") {
        sectionTitle("Professional Summary");
        y = drawWrappedText(page, sec.text, margin, y, 612 - margin * 2, 14, font, 10);
      }

      if (sec.kind === "skills") {
        sectionTitle("Technical Skills");
        const bullets = "• " + sec.items.join(" • ");
        y = drawWrappedText(page, bullets, margin, y, 612 - margin * 2, 14, font, 10);
      }

      if (sec.kind === "experience") {
        sectionTitle("Experience");
        for (const exp of sec.items) {
          const head = `${exp.title} | ${exp.company}${exp.date ? " — " + exp.date : ""}`;
          page.drawText(head, { x: margin, y, size: 10.5, font: bold });
          y -= 14;
          for (const b of exp.bullets) {
            y = drawWrappedText(page, "• " + b, margin + 14, y, 612 - margin * 2 - 14, 14, font, 10);
          }
          y -= 6;
        }
      }

      if (sec.kind === "education") {
        sectionTitle("Education");
        for (const ed of sec.items) {
          const line = `${ed.degree}, ${ed.school}${ed.year ? " — " + ed.year : ""}`;
          y = drawWrappedText(page, line, margin, y, 612 - margin * 2, 14, font, 10);
        }
      }
    }

    const bytes = await pdf.save();
    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Srinath_Reddy_Tailored_Resume.pdf"`,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "PDF generation failed" }, { status: 500 });
  }
}
