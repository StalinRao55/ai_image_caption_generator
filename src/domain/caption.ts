export type VisionAnalysis = {
  objects: string[];
  animals: string[];
  humans: string[];
  clothing: string[];
  weather: string;
  mood: string;
  scene: string;
  colors: string[];
  activity: string;
  background: string;
  emotion: string;
  brand: string;
  context: string;
  composition: string;
  lighting: string;
  environment: string;
  description: string;
  confidence: number;
};

export type GeneratedCaption = {
  caption: string;
  hashtags: string[];
  emojis: string[];
  cta: string;
  variants: string[];
  seoTitle?: string;
  analysis: VisionAnalysis;
};
