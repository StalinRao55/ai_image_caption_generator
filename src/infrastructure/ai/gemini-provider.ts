import { GoogleGenerativeAI } from "@google/generative-ai";
import { Errors } from "@/domain/errors";
import type { GenerateCaptionInput } from "@/types/schemas";
import {
  SYSTEM_ANALYSIS,
  buildGeneratePrompt,
  parseCaptionJson,
  type CaptionProvider,
} from "./types";

export class GeminiCaptionProvider implements CaptionProvider {
  name = "gemini";
  private modelName: string;
  private client: GoogleGenerativeAI;

  constructor() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw Errors.config("GEMINI_API_KEY is not set.");
    this.client = new GoogleGenerativeAI(key);
    this.modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  }

  async generate(image: { mimeType: string; base64: string }, input: GenerateCaptionInput) {
    const model = this.client.getGenerativeModel({
      model: this.modelName,
      systemInstruction: SYSTEM_ANALYSIS,
    });
    const result = await withTimeout(
      model.generateContent([
        { text: buildGeneratePrompt(input) },
        { inlineData: { mimeType: image.mimeType, data: image.base64 } },
      ]),
      45_000,
    );
    return parseCaptionJson(result.response.text());
  }

  async transform(caption: string, mode: string, language = "en") {
    const model = this.client.getGenerativeModel({ model: this.modelName });
    const result = await withTimeout(
      model.generateContent(
        `You are CaptionAI. Mode: ${mode}. Language: ${language}.
Return only the transformed text (or a comma-separated hashtag list for hashtags mode).
Caption:\n${caption}`,
      ),
      30_000,
    );
    return result.response.text().trim();
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(Errors.timeout()), ms);
    promise
      .then((v) => {
        clearTimeout(t);
        resolve(v);
      })
      .catch((e) => {
        clearTimeout(t);
        reject(e);
      });
  });
}
