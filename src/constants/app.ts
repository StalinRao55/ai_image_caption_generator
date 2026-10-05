export const APP_NAME = "CaptionAI";
export const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"] as const;
export const RATE_LIMIT_GENERATE_PER_MINUTE = 8;
export const MONTHLY_CREDITS: Record<string, number> = {
  FREE: 20,
  STARTER: 200,
  PRO: 1000,
  BUSINESS: 5000,
};

export const CAPTION_TYPES = [
  { id: "social", label: "Social Media Caption" },
  { id: "instagram", label: "Instagram Caption" },
  { id: "linkedin", label: "LinkedIn Caption" },
  { id: "facebook", label: "Facebook Caption" },
  { id: "twitter", label: "Twitter/X Caption" },
  { id: "marketing", label: "Marketing Caption" },
  { id: "product", label: "Product Caption" },
  { id: "seo", label: "SEO Caption" },
  { id: "creative", label: "Creative Caption" },
  { id: "story", label: "Story Caption" },
  { id: "professional", label: "Professional Caption" },
  { id: "funny", label: "Funny Caption" },
  { id: "emotional", label: "Emotional Caption" },
  { id: "inspirational", label: "Inspirational Caption" },
  { id: "travel", label: "Travel Caption" },
  { id: "food", label: "Food Caption" },
  { id: "fashion", label: "Fashion Caption" },
] as const;

export const TONES = [
  "professional",
  "funny",
  "emotional",
  "luxury",
  "friendly",
  "minimal",
  "exciting",
  "inspirational",
] as const;

export const LANGUAGES = [
  { id: "en", label: "English" },
  { id: "es", label: "Spanish" },
  { id: "fr", label: "French" },
  { id: "hi", label: "Hindi" },
  { id: "de", label: "German" },
  { id: "ja", label: "Japanese" },
  { id: "zh", label: "Chinese" },
] as const;

export const LENGTHS = [
  { id: "SHORT", label: "Short" },
  { id: "MEDIUM", label: "Medium" },
  { id: "LONG", label: "Long" },
] as const;

export const AUDIENCES = [
  "general",
  "business",
  "travel",
  "food",
  "fitness",
  "fashion",
  "photography",
] as const;

export const PLANS = [
  {
    id: "FREE",
    name: "Free",
    price: 0,
    credits: 20,
    features: ["20 captions / month", "Core caption types", "History (7 days)", "TXT export"],
  },
  {
    id: "STARTER",
    name: "Starter",
    price: 12,
    credits: 200,
    features: ["200 captions / month", "All caption types", "Hashtags & CTA", "PDF & DOCX export"],
  },
  {
    id: "PRO",
    name: "Pro",
    price: 29,
    credits: 1000,
    features: ["1,000 captions / month", "Brand voice", "Bulk upload", "Rewrite & SEO tools", "API keys"],
  },
  {
    id: "BUSINESS",
    name: "Business",
    price: 79,
    credits: 5000,
    features: ["5,000 captions / month", "Team workspace", "Scheduled posts", "Priority models", "Admin analytics"],
  },
] as const;
