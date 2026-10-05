import { NextResponse } from "next/server";
import { requireUser } from "@/infrastructure/auth/guards";
import { jsonError } from "@/lib/api";
import { generateCaptionSchema } from "@/types/schemas";
import { generateCaptionUseCase } from "@/application/use-cases/generate-caption";
import { rateLimit } from "@/infrastructure/rate-limit";
import { RATE_LIMIT_GENERATE_PER_MINUTE } from "@/constants/app";
import { Errors } from "@/domain/errors";
import { z } from "zod";

const bodySchema = generateCaptionSchema.extend({
  imageBase64: z.string().min(20),
  mimeType: z.string().min(3),
});

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const limited = rateLimit(`gen:${user.id}`, RATE_LIMIT_GENERATE_PER_MINUTE);
    if (!limited.ok) throw Errors.rateLimit();
    const body = bodySchema.parse(await req.json());
    const result = await generateCaptionUseCase(
      user.id,
      body,
      { mimeType: body.mimeType, base64: body.imageBase64 },
    );
    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}
