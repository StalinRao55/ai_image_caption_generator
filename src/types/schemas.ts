import { z } from "zod";

export const generateCaptionSchema = z.object({
  imageUrl: z.string().min(1),
  captionType: z.string().min(1),
  tone: z.string().min(1),
  language: z.string().min(1),
  length: z.enum(["SHORT", "MEDIUM", "LONG"]),
  emoji: z.boolean(),
  hashtags: z.boolean(),
  keywords: z.string().max(300).optional(),
  audience: z.string().optional(),
  brandVoice: z.string().max(2000).optional(),
  variants: z.boolean().optional(),
});

export type GenerateCaptionInput = z.infer<typeof generateCaptionSchema>;

export const rewriteSchema = z.object({
  caption: z.string().min(1),
  mode: z.enum(["rewrite", "improve", "grammar", "seo", "hashtags", "emoji", "cta"]),
  language: z.string().optional(),
});

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const settingsSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
  uiLanguage: z.string().optional(),
  notificationsEnabled: z.boolean().optional(),
  privacyAnalytics: z.boolean().optional(),
  autoSave: z.boolean().optional(),
  brandVoice: z.string().max(2000).optional().nullable(),
  defaultCaptionType: z.string().optional(),
  defaultTone: z.string().optional(),
  defaultLanguage: z.string().optional(),
});
