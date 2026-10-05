import { generateCaptionSchema, type GenerateCaptionInput } from "@/types/schemas";
import { generateWithFallback } from "@/infrastructure/ai/caption-service";
import { captionRepository } from "@/infrastructure/repositories/caption-repository";
import { userRepository } from "@/infrastructure/repositories/user-repository";
import { analyticsRepository } from "@/infrastructure/repositories/analytics-repository";
import { prisma } from "@/infrastructure/db/prisma";
import { Errors } from "@/domain/errors";
import { readingTimeMinutes, wordCount } from "@/lib/utils";
import { CaptionLength } from "@prisma/client";

export async function generateCaptionUseCase(userId: string, input: GenerateCaptionInput, image: { mimeType: string; base64: string }) {
  const parsed = generateCaptionSchema.parse(input);
  const user = await userRepository.findById(userId);
  if (!user) throw Errors.unauthorized();

  const current = await userRepository.consumeCredit(userId);
  if (!current) throw Errors.lowCredits();

  const started = Date.now();
  try {
    const { result, provider } = await generateWithFallback(image, {
      ...parsed,
      brandVoice: parsed.brandVoice || user.brandVoice || undefined,
    });
    const responseMs = Date.now() - started;
    const saved = await captionRepository.create({
      userId,
      imageUrl: parsed.imageUrl,
      caption: result.caption,
      captionType: parsed.captionType,
      tone: parsed.tone,
      language: parsed.language,
      length: parsed.length as CaptionLength,
      hashtags: result.hashtags,
      emojis: result.emojis,
      cta: result.cta,
      keywords: parsed.keywords,
      audience: parsed.audience,
      variants: result.variants,
      analysis: result.analysis,
      wordCount: wordCount(result.caption),
      readingTime: readingTimeMinutes(result.caption),
      confidence: result.analysis.confidence,
      provider,
      responseMs,
    });
    await analyticsRepository.recordGeneration(userId, 1, responseMs);
    if (user.notificationsEnabled) {
      await prisma.notification.create({
        data: {
          userId,
          title: "Caption generated",
          message: "Your AI caption is ready.",
          type: "success",
        },
      });
    }
    if (current.credits <= 5 && user.notificationsEnabled) {
      await prisma.notification.create({
        data: {
          userId,
          title: "Credits low",
          message: `You have ${current.credits} credits remaining.`,
          type: "warning",
        },
      });
    }
    return { saved, result, provider, responseMs };
  } catch (error) {
    await userRepository.refundCredit(userId);
    throw error;
  }
}
