import { Errors } from "@/domain/errors";
import type { CaptionProvider } from "./types";
import { GeminiCaptionProvider } from "./gemini-provider";
import { OpenAICaptionProvider } from "./openai-provider";

export function getCaptionProvider(): CaptionProvider {
  if (process.env.GEMINI_API_KEY) return new GeminiCaptionProvider();
  if (process.env.OPENAI_API_KEY) return new OpenAICaptionProvider();
  throw Errors.config("Set GEMINI_API_KEY or OPENAI_API_KEY to generate captions.");
}

export async function generateWithFallback(
  ...args: Parameters<CaptionProvider["generate"]>
) {
  const primary = process.env.GEMINI_API_KEY ? new GeminiCaptionProvider() : null;
  const fallback = process.env.OPENAI_API_KEY ? new OpenAICaptionProvider() : null;
  if (!primary && !fallback) throw Errors.config("Set GEMINI_API_KEY or OPENAI_API_KEY.");
  try {
    return { result: await (primary ?? fallback)!.generate(...args), provider: (primary ?? fallback)!.name };
  } catch (error) {
    if (primary && fallback) {
      return { result: await fallback.generate(...args), provider: fallback.name };
    }
    throw error;
  }
}
