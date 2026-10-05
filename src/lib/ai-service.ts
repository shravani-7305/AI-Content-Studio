/**
 * AI service layer. Currently returns demo output generated locally.
 * To connect a real Generative AI API, replace the bodies of
 * `generateContent` and `generateSeo` with a call to a server function.
 */
import type { GenerateRequest, SeoResult } from "./constants";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const cap = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

const toneOpeners: Record<string, string> = {
  Professional: "In today's fast-moving landscape,",
  Friendly: "Hey there! Let's talk about something exciting:",
  Persuasive: "Imagine what you could achieve with",
  Informative: "Here is what you need to know about",
  Casual: "So, let's chat about",
  Formal: "This document presents an overview of",
  Humorous: "Buckle up, because we're about to get real about",
};

const paragraphs = (topic: string, kw: string[]) => [
  `${topic} has become an important subject for students, professionals and businesses alike. Understanding its core ideas helps people make smarter decisions and stay ahead of change.`,
  `One of the biggest advantages of ${topic.toLowerCase()} is how it simplifies complex tasks. ${kw.length ? `Key ideas such as ${kw.join(", ")} play a central role here.` : "Its practical benefits are visible in everyday life."}`,
  `To get started, focus on the fundamentals, learn from real-world examples, and apply what you learn step by step. Consistency matters more than perfection.`,
  `Looking ahead, ${topic.toLowerCase()} will continue to evolve. Those who adopt it early and thoughtfully will benefit the most.`,
];

export async function generateContent(req: GenerateRequest): Promise<string> {
  await wait(1200 + Math.random() * 800);
  if (!req.topic.trim()) throw new Error("Please enter a topic to generate content.");
  const topic = cap(req.topic.trim());
  const opener = toneOpeners[req.tone] ?? "";
  const count = req.length === "Short" ? 1 : req.length === "Medium" ? 2 : 4;
  const body = paragraphs(topic, req.keywords).slice(0, count);
  const tags = (req.keywords.length ? req.keywords : topic.split(" ")).map(
    (k) => "#" + k.replace(/\s+/g, ""),
  );

  switch (req.contentType) {
    case "Social Media Post":
      return `${opener} ${topic}! 🚀\n\n${body[0]}\n\n👉 Share your thoughts below!\n\n${tags.join(" ")}`;
    case "Advertisement":
      return `✨ ${topic} — Made for You ✨\n\n${opener} ${topic.toLowerCase()}. ${body[0]}\n\n✔ Easy to use\n✔ Trusted by thousands\n✔ Results you can see\n\nGet started today — limited time offer!`;
    case "Product Description":
      return `${topic}\n\n${body.join("\n\n")}\n\nKey Features:\n• Premium quality and reliable performance\n• Designed for everyday convenience\n• Great value for money`;
    case "Email":
      return `Subject: Everything you need to know about ${topic}\n\nHi there,\n\n${opener} ${topic.toLowerCase()}.\n\n${body.join("\n\n")}\n\nBest regards,\nThe Team`;
    case "YouTube Description":
      return `🎬 ${topic} | Complete Guide\n\n${body[0]}\n\n⏱ Timestamps\n00:00 Introduction\n01:30 Key concepts\n05:00 Practical tips\n09:00 Conclusion\n\n👍 Like, subscribe and hit the bell!\n\n${tags.join(" ")}`;
    default:
      return `${topic}: A Complete ${req.contentType}\n\n${opener} ${topic.toLowerCase()}.\n\n${body.join("\n\n")}\n\nConclusion\nBy understanding ${topic.toLowerCase()}, you are better prepared for what comes next.`;
  }
}

export async function generateSeo(topic: string, keywords: string[]): Promise<SeoResult> {
  await wait(1000 + Math.random() * 700);
  if (!topic.trim()) throw new Error("Please enter a topic for SEO analysis.");
  const t = cap(topic.trim());
  const words = t.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  const primary = [t.toLowerCase(), ...keywords].slice(0, 4);
  return {
    title: `${t}: The Complete Guide for ${new Date().getFullYear()}`,
    metaDescription: `Learn everything about ${t.toLowerCase()} — key concepts, practical tips and expert insights to help you get started quickly.`.slice(0, 158),
    primaryKeywords: primary,
    secondaryKeywords: [
      `what is ${t.toLowerCase()}`,
      `${t.toLowerCase()} benefits`,
      `${t.toLowerCase()} examples`,
      `best ${words[0] ?? "tips"} tools`,
      `${t.toLowerCase()} for beginners`,
    ],
    headings: [
      `What is ${t}?`,
      `Why ${t} Matters`,
      `Key Benefits of ${t}`,
      `How to Get Started with ${t}`,
      `Common Mistakes to Avoid`,
      `Conclusion`,
    ],
    hashtags: [...words, ...keywords].slice(0, 6).map((w) => "#" + w.replace(/\s+/g, "")),
  };
}
