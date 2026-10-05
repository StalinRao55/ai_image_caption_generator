import sharp from "sharp";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/constants/app";
import { Errors } from "@/domain/errors";

export async function processImage(buffer: Buffer, mimeType: string) {
  if (!ALLOWED_IMAGE_TYPES.includes(mimeType as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    throw Errors.unsupportedFile();
  }
  if (buffer.byteLength > MAX_IMAGE_BYTES) throw Errors.fileTooLarge();
  const image = sharp(buffer, { animated: mimeType === "image/gif" });
  const meta = await image.metadata();
  if (!meta.format) throw Errors.unsupportedFile();
  const optimized = await sharp(buffer)
    .rotate()
    .resize({ width: 2048, height: 2048, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 86 })
    .toBuffer();
  return {
    buffer: optimized,
    mimeType: "image/jpeg" as const,
    width: meta.width,
    height: meta.height,
  };
}

export async function fetchRemoteImage(url: string) {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw Errors.unsupportedFile();
  }
  if (!["http:", "https:"].includes(parsed.protocol)) throw Errors.unsupportedFile();
  const res = await fetch(parsed.toString());
  if (!res.ok) throw Errors.network();
  const mime = res.headers.get("content-type")?.split(";")[0] || "image/jpeg";
  const buf = Buffer.from(await res.arrayBuffer());
  return processImage(buf, mime);
}
