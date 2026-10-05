import { NextResponse } from "next/server";
import { requireUser } from "@/infrastructure/auth/guards";
import { jsonError } from "@/lib/api";
import { rewriteSchema } from "@/types/schemas";
import { getCaptionProvider } from "@/infrastructure/ai/caption-service";
import { rateLimit } from "@/infrastructure/rate-limit";
import { Errors } from "@/domain/errors";
import { userRepository } from "@/infrastructure/repositories/user-repository";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    if (!rateLimit(`tf:${user.id}`, 20).ok) throw Errors.rateLimit();
    const body = rewriteSchema.parse(await req.json());
    const spent = await userRepository.consumeCredit(user.id);
    if (!spent) throw Errors.lowCredits();
    try {
      const text = await getCaptionProvider().transform(body.caption, body.mode, body.language);
      return NextResponse.json({ text });
    } catch (error) {
      await userRepository.refundCredit(user.id);
      throw error;
    }
  } catch (error) {
    return jsonError(error);
  }
}
