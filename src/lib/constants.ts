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

export interface HistoryItem extends GenerateRequest {
  id: string;
  content: string;
  createdAt: string;
}
