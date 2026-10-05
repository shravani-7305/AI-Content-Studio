export const CONTENT_TYPES = [
  "Blog",
  "Article",
  "Social Media Post",
  "Advertisement",
  "Product Description",
  "Email",
  "YouTube Description",
] as const;

export const TONES = [
  "Professional",
  "Friendly",
  "Persuasive",
  "Informative",
  "Casual",
  "Formal",
  "Humorous",
] as const;

export const LENGTHS = ["Short", "Medium", "Long"] as const;

export type ContentType = (typeof CONTENT_TYPES)[number];
export type Tone = (typeof TONES)[number];
export type Length = (typeof LENGTHS)[number];

export interface GenerateRequest {
  topic: string;
  contentType: ContentType;
  tone: Tone;
  length: Length;
  keywords: string[];
}

export interface SeoResult {
  title: string;
  metaDescription: string;
  primaryKeywords: string[];
  secondaryKeywords: string[];
  headings: string[];
  hashtags: string[];
}

export const MEDIA_STYLES = ["Realistic", "Illustration", "3D", "Cartoon", "Cinematic"] as const;
export const ASPECT_RATIOS = ["1:1", "16:9", "9:16", "4:3"] as const;
export const DURATIONS = ["4 seconds", "6 seconds", "8 seconds"] as const;
export type MediaStyle = (typeof MEDIA_STYLES)[number];
export type AspectRatio = (typeof ASPECT_RATIOS)[number];
export type MediaKind = "image" | "video";

export interface MediaRequest {
  prompt: string;
  style: MediaStyle;
  aspect: AspectRatio;
  duration?: number;
}

export interface HistoryItem extends Omit<GenerateRequest, "contentType"> {
  id: string;
  contentType: string;
  /** For text: the content. For image/video: the prompt. */
  content: string;
  createdAt: string;
  kind?: "text" | MediaKind;
  media?: MediaRequest & { url?: string };
}
