import OpenAI from "openai";
import { Errors } from "@/domain/errors";
import type { GenerateCaptionInput } from "@/types/schemas";
import {
  SYSTEM_ANALYSIS,
  buildGeneratePrompt,
  parseCaptionJson,
  type CaptionProvider,
} from "./types";

export class OpenAICaptionProvider implements CaptionProvider {
  name = "openai";
  private client: OpenAI;
  private model: string;

  constructor() {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw Errors.config("OPENAI_API_KEY is not set.");
    this.client = new OpenAI({ apiKey: key });
    this.model = process.env.OPENAI_VISION_MODEL || "gpt-4.1";
  }

  async generate(image: { mimeType: string; base64: string }, input: GenerateCaptionInput) {
    const completion = await withTimeout(
      this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: SYSTEM_ANALYSIS },
          {
            role: "user",
            content: [
              { type: "text", text: buildGeneratePrompt(input) },
              {
                type: "image_url",
                image_url: { url: `data:${image.mimeType};base64,${image.base64}` },
              },
            ],
          },
        ],
      }),
      45_000,
    );
    return parseCaptionJson(completion.choices[0]?.message?.content ?? "{}");
  }

  async transform(caption: string, mode: string, language = "en") {
    const completion = await withTimeout(
      this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "user",
            content: `You are CaptionAI. Mode: ${mode}. Language: ${language}. Return only the transformed text.\n${caption}`,
          },
        ],
      }),
      30_000,
    );
    return (completion.choices[0]?.message?.content ?? "").trim();
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
