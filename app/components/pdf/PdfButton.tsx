"use client";

import React from "react";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { saveAs } from "file-saver";

type Props = {
  data: string;        // plain text resume from AI
  filename?: string;   // e.g. "HirePath-Resume.pdf"
};

export default function PdfButton({ data, filename = "resume.pdf" }: Props) {
  async function handleDownload() {
    if (!data || !data.trim()) return;

    // --- Create PDF + fonts ---
    const pdfDoc = await PDFDocument.create();
    const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    const margin = 50;
    const bodySize = 10.5;
    const lineGap = 4;

    let page = pdfDoc.addPage();
    let pageNumber = 1;
    let { width, height } = page.getSize();
    let y = height - margin;

    function newPage() {
      drawFooter(page, pageNumber, width, bodyFont, bodySize);
      pageNumber += 1;
      page = pdfDoc.addPage();
      ({ width, height } = page.getSize());
      y = height - margin;
    }

    function ensureSpace(linesNeeded: number) {
      if (y - linesNeeded * (bodySize + lineGap) < margin + 30) {
        newPage();
      }
    }

    // --- Parse resume structure from plain text ---
    const { headerName, headerSubtitle, headerContact, bodyLines } =
      parseResumeStructure(data);

    // ======= HEADER =======
    if (headerName) {
      const nameSize = 20;
      page.drawText(headerName, {
        x: margin,
        y,
        size: nameSize,
        font: boldFont,
      });
      y -= nameSize + 6;
    }

    if (headerSubtitle) {
      const subtitleSize = 11.5;
      page.drawText(headerSubtitle, {
        x: margin,
        y,
        size: subtitleSize,
        font: bodyFont,
      });
      y -= subtitleSize + 4;
    }

    if (headerContact) {
      const contactSize = 9.5;
      page.drawText(headerContact, {
        x: margin,
        y,
        size: contactSize,
        font: bodyFont,
      });
      y -= contactSize + 10;
    } else {
      y -= 8;
    }

    // thin divider
    page.drawLine({
      start: { x: margin, y },
      end: { x: width - margin, y },
      thickness: 0.5,
    });
    y -= 16;

    const maxWidth = width - margin * 2;
    const baseLineHeight = bodySize + lineGap;

    // ======= BODY =======
    for (const rawLine of bodyLines) {
      const line = rawLine.trimEnd();

      // Blank line = vertical spacing
      if (!line.trim()) {
        y -= baseLineHeight * 0.6;
        continue;
      }

      // Make sure we have some space
      ensureSpace(2);

      // Section titles (SUMMARY, CORE SKILLS, ...)
      // Section titles (SUMMARY, CORE SKILLS, ...)
if (isSectionTitle(line)) {
  y -= baseLineHeight * 0.4;
  const titleSize = 11.5;
  const wrapped = wrapText(boldFont, line, titleSize, maxWidth);

  for (const t of wrapped) {
    ensureSpace(1);
    page.drawText(t, {
      x: margin,
      y,
      size: titleSize,
      font: boldFont,
    });
    y -= titleSize + 3;
  }

  // extra breathing room after section title (no underline)
  y -= baseLineHeight * 0.3;
  continue;
}


      // Bullet lines
      if (isBullet(line)) {
        const bulletIndent = 12;
        const textIndent = 20;

        const stripped = line.replace(/^[-•●▪‣•]+/, "").trimStart();
        const bulletLines = wrapText(
          bodyFont,
          stripped,
          bodySize,
          maxWidth - textIndent
        );

        // First bullet line
        ensureSpace(bulletLines.length + 1);
        page.drawText("•", {
          x: margin + bulletIndent,
          y,
          size: bodySize,
          font: bodyFont,
        });
        page.drawText(bulletLines[0], {
          x: margin + textIndent,
          y,
          size: bodySize,
          font: bodyFont,
        });
        y -= baseLineHeight;

        // Additional wrapped bullet lines
        for (let i = 1; i < bulletLines.length; i++) {
          ensureSpace(1);
          page.drawText(bulletLines[i], {
            x: margin + textIndent,
            y,
            size: bodySize,
            font: bodyFont,
          });
          y -= baseLineHeight;
        }

        continue;
      }

      // Lines that look like job titles / company + dates
      if (looksLikeTitle(line)) {
        const parts = splitTitleAndDates(line);
        const titleSize = 11;

        ensureSpace(1);
        page.drawText(parts.title, {
          x: margin,
          y,
          size: titleSize,
          font: boldFont,
        });

        if (parts.dates) {
          const wDates = italicFont.widthOfTextAtSize(parts.dates, 9.5);
          page.drawText(parts.dates, {
            x: width - margin - wDates,
            y,
            size: 9.5,
            font: italicFont,
          });
        }

        y -= titleSize + 4;
        continue;
      }

      // Normal paragraph text
      const paraLines = wrapText(bodyFont, line, bodySize, maxWidth);
      for (const pl of paraLines) {
        ensureSpace(1);
        page.drawText(pl, {
          x: margin,
          y,
          size: bodySize,
          font: bodyFont,
        });
        y -= baseLineHeight;
      }
      y -= 2;
    }

    // Draw footer on last page
    drawFooter(page, pageNumber, width, bodyFont, bodySize);

    // Save + download
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
    saveAs(blob, filename);
  }

  return (
    <button
      onClick={handleDownload}
      disabled={!data || !data.trim()}
      className={
        !data || !data.trim()
          ? "mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-slate-700 px-4 py-2 text-sm font-medium text-slate-400 cursor-not-allowed"
          : "mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-slate-50 px-4 py-2 text-sm font-medium text-slate-950 shadow-sm hover:bg-slate-200"
      }
    >
      Download Tailored Resume PDF
    </button>
  );
}

/* ===================== Helper functions ===================== */

function parseResumeStructure(raw: string) {
  const normalized = raw.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n").map((l) => l.trimEnd());

  // remove leading empties
  while (lines.length && !lines[0].trim()) lines.shift();

  const headerName = lines[0] ?? "";
  const headerSubtitle = lines[1] ?? "";
  const headerContact = lines[2] ?? "";
  const bodyLines = lines.slice(3);

  return { headerName, headerSubtitle, headerContact, bodyLines };
}

function isSectionTitle(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (trimmed.length > 40) return false;
  if (!/[A-Z]/.test(trimmed)) return false;

  const onlyLetters = trimmed.replace(/[^A-Za-z]/g, "");
  if (!onlyLetters) return false;

  const upperCount = trimmed.replace(/[^A-Z]/g, "").length;
  const ratio = upperCount / onlyLetters.length;
  return ratio > 0.6;
}

function isBullet(line: string): boolean {
  return /^[-•●▪‣•]/.test(line.trim());
}

function looksLikeTitle(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (trimmed.length > 90) return false;

  // contains role keywords or job title words
  const roleWords =
    /\b(Engineer|Scientist|Developer|Lead|Senior|Sr\.?|Principal|Architect|Manager|Analyst|AI\/ML|ML|AI|Data)\b/i;
  if (roleWords.test(trimmed)) return true;

  // contains separators for company/dates
  if (/[-–—]|·|\|/.test(trimmed)) return true;

  return false;
}

function splitTitleAndDates(line: string): { title: string; dates: string } {
  const match = line.match(/(.*?)(\s{2,}|\s[-–—]\s)(\w.*)$/);
  if (!match) return { title: line.trim(), dates: "" };

  const left = match[1].trim();
  const right = match[3].trim();

  // if right side looks like dates (contains year or month)
  if (/\b(20\d{2}|19\d{2}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i.test(right)) {
    return { title: left, dates: right };
  }

  return { title: line.trim(), dates: "" };
}

function wrapText(
  font: any,
  text: string,
  fontSize: number,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const w of words) {
    const testLine = current ? current + " " + w : w;
    const width = font.widthOfTextAtSize(testLine, fontSize);

    if (width > maxWidth && current) {
      lines.push(current);
      current = w;
    } else {
      current = testLine;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawFooter(
  page: any,
  pageNumber: number,
  width: number,
  font: any,
  fontSize: number
) {
  const text = `Page ${pageNumber}`;
  const size = fontSize - 1.5;
  const w = font.widthOfTextAtSize(text, size);
  const x = width - 50 - w;
  const y = 30;

  page.drawText(text, {
    x,
    y,
    size,
    font,
    color: undefined,
  });

  const brand = "HirePath.ai";
  const brandSize = size;
  page.drawText(brand, {
    x: 50,
    y,
    size: brandSize,
    font,
  });
}
