import { NextResponse } from "next/server";
import { requireUser } from "@/infrastructure/auth/guards";
import { jsonError } from "@/lib/api";
import { processImage, fetchRemoteImage } from "@/infrastructure/image/process";
import { getStorage } from "@/infrastructure/storage";
import { Errors } from "@/domain/errors";
import { prisma } from "@/infrastructure/db/prisma";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const contentType = req.headers.get("content-type") || "";
    let processed;

    if (contentType.includes("application/json")) {
      const body = (await req.json()) as { url?: string };
      if (!body.url) throw Errors.noImage();
      processed = await fetchRemoteImage(body.url);
    } else {
      const form = await req.formData();
      const file = form.get("file");
      if (!(file instanceof File)) throw Errors.noImage();
      const buf = Buffer.from(await file.arrayBuffer());
      processed = await processImage(buf, file.type || "image/jpeg");
    }

    const stored = await getStorage().upload(processed.buffer, "caption.jpg", processed.mimeType);
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Upload success",
        message: "Your image is ready for captioning.",
        type: "success",
      },
    });
    return NextResponse.json({
      url: stored.url,
      mimeType: processed.mimeType,
      base64: processed.buffer.toString("base64"),
    });
  } catch (error) {
    return jsonError(error);
  }
}
