import { NextResponse } from "next/server";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { requireUser } from "@/infrastructure/auth/guards";
import { jsonError } from "@/lib/api";
import { captionRepository } from "@/infrastructure/repositories/caption-repository";
import { Errors } from "@/domain/errors";
import { z } from "zod";

const schema = z.object({
  id: z.string(),
  format: z.enum(["txt", "pdf", "docx"]),
});

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const { id, format } = schema.parse(await req.json());
    const caption = await captionRepository.findOwned(id, user.id);
    if (!caption) throw Errors.notFound("Caption");
    const body = [caption.caption, "", caption.hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" "), caption.cta ?? ""].join("\n");

    if (format === "txt") {
      return new NextResponse(body, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Content-Disposition": `attachment; filename="caption-${id}.txt"`,
        },
      });
    }

    if (format === "docx") {
      const doc = new Document({
        sections: [
          {
            children: [
              new Paragraph({ children: [new TextRun({ text: "CaptionAI Export", bold: true })] }),
              new Paragraph({ text: caption.caption }),
              new Paragraph({ text: caption.hashtags.join(" ") }),
              new Paragraph({ text: caption.cta ?? "" }),
            ],
          },
        ],
      });
      const buf = await Packer.toBuffer(doc);
      return new NextResponse(new Uint8Array(buf), {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="caption-${id}.docx"`,
        },
      });
    }

    const pdf = await PDFDocument.create();
    const page = pdf.addPage([612, 792]);
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    page.drawText(body.slice(0, 2000), { x: 48, y: 720, size: 12, font, maxWidth: 516 });
    const bytes = await pdf.save();
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="caption-${id}.pdf"`,
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}
