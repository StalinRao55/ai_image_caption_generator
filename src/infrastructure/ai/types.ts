import type { GeneratedCaption } from "@/domain/caption";
import type { GenerateCaptionInput } from "@/types/schemas";

export interface CaptionProvider {
  name: string;
  generate(image: { mimeType: string; base64: string }, input: GenerateCaptionInput): Promise<GeneratedCaption>;
  transform(caption: string, mode: string, language?: string): Promise<string>;
}

export const SYSTEM_ANALYSIS = `You are CaptionAI, a production vision + copywriting engine.
Analyze the image for: objects, animals, humans, clothing, weather, mood, scene, colors, activity, background, emotion, brand, context, composition, lighting, environment.
Then write social-ready copy. Return ONLY valid JSON matching the schema.`;

export function buildGeneratePrompt(input: GenerateCaptionInput) {
  return `Generate captions for this image.

Caption type: ${input.captionType}
Tone: ${input.tone}
Language: ${input.language}
Length: ${input.length}
Include emojis: ${input.emoji}
Include hashtags: ${input.hashtags}
Keywords: ${input.keywords || "none"}
Audience: ${input.audience || "general"}
Brand voice: ${input.brandVoice || "none"}
Include 3 alternate variants: ${input.variants !== false}

JSON schema:
{
  "analysis": {
    "objects": string[],
    "animals": string[],
    "humans": string[],
    "clothing": string[],
    "weather": string,
    "mood": string,
    "scene": string,
    "colors": string[],
    "activity": string,
    "background": string,
    "emotion": string,
    "brand": string,
    "context": string,
    "composition": string,
    "lighting": string,
    "environment": string,
    "description": string,
    "confidence": number
  },
  "caption": string,
  "hashtags": string[],
  "emojis": string[],
  "cta": string,
  "variants": string[],
  "seoTitle": string
}

Rules:
- Caption must match the platform/type and length.
- Hashtags should be relevant, no spam.
- CTA should be one sentence.
- confidence is 0-1.`;
}

export function parseCaptionJson(raw: string): GeneratedCaption {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  const json = JSON.parse(cleaned.slice(start, end + 1));
  return {
    caption: String(json.caption ?? ""),
    hashtags: Array.isArray(json.hashtags) ? json.hashtags.map(String) : [],
    emojis: Array.isArray(json.emojis) ? json.emojis.map(String) : [],
    cta: String(json.cta ?? ""),
    variants: Array.isArray(json.variants) ? json.variants.map(String) : [],
    seoTitle: json.seoTitle ? String(json.seoTitle) : undefined,
    analysis: {
      objects: json.analysis?.objects ?? [],
      animals: json.analysis?.animals ?? [],
      humans: json.analysis?.humans ?? [],
      clothing: json.analysis?.clothing ?? [],
      weather: json.analysis?.weather ?? "",
      mood: json.analysis?.mood ?? "",
      scene: json.analysis?.scene ?? "",
      colors: json.analysis?.colors ?? [],
      activity: json.analysis?.activity ?? "",
      background: json.analysis?.background ?? "",
      emotion: json.analysis?.emotion ?? "",
      brand: json.analysis?.brand ?? "",
      context: json.analysis?.context ?? "",
      composition: json.analysis?.composition ?? "",
      lighting: json.analysis?.lighting ?? "",
      environment: json.analysis?.environment ?? "",
      description: json.analysis?.description ?? "",
      confidence: Number(json.analysis?.confidence ?? 0.7),
    },
  };
}
