import { create } from "zustand";

type GeneratorState = {
  imageUrl?: string;
  imageBase64?: string;
  mimeType?: string;
  captionType: string;
  tone: string;
  language: string;
  length: "SHORT" | "MEDIUM" | "LONG";
  emoji: boolean;
  hashtags: boolean;
  keywords: string;
  audience: string;
  set: (p: Partial<GeneratorState>) => void;
  resetImage: () => void;
};

export const useGeneratorStore = create<GeneratorState>((set) => ({
  captionType: "instagram",
  tone: "friendly",
  language: "en",
  length: "MEDIUM",
  emoji: true,
  hashtags: true,
  keywords: "",
  audience: "general",
  set: (p) => set(p),
  resetImage: () => set({ imageUrl: undefined, imageBase64: undefined, mimeType: undefined }),
}));
