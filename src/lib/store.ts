/**
 * Data layer backed by localStorage. Swap these functions for database
 * calls later without touching the UI.
 */
import { useSyncExternalStore } from "react";
import type { HistoryItem } from "./constants";

const HISTORY_KEY = "acc.history";
const USER_KEY = "acc.user";
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

const SAMPLE: HistoryItem[] = [
  {
    id: "demo-1",
    topic: "Benefits of Artificial Intelligence in Education",
    contentType: "Blog",
    tone: "Informative",
    length: "Medium",
    keywords: ["AI", "e-learning"],
    content:
      "Benefits Of Artificial Intelligence In Education\n\nAI is transforming classrooms by personalising learning, automating grading and giving students instant feedback...",
    createdAt: new Date(Date.now() - 2 * 3600e3).toISOString(),
  },
  {
    id: "demo-2",
    topic: "Wireless Noise Cancelling Earbuds",
    contentType: "Product Description",
    tone: "Persuasive",
    length: "Short",
    keywords: ["battery", "bluetooth"],
    content:
      "Wireless Noise Cancelling Earbuds\n\nEnjoy 40 hours of battery life, crystal-clear sound and seamless Bluetooth pairing...",
    createdAt: new Date(Date.now() - 26 * 3600e3).toISOString(),
  },
  {
    id: "demo-3",
    topic: "College Tech Fest Launch",
    contentType: "Social Media Post",
    tone: "Friendly",
    length: "Short",
    keywords: ["techfest", "coding"],
    content: "Get ready! Our annual College Tech Fest is here 🚀 Hackathons, workshops and more. #techfest #coding",
    createdAt: new Date(Date.now() - 3 * 86400e3).toISOString(),
  },
];

let historyCache: HistoryItem[] | null = null;
function readHistory(): HistoryItem[] {
  if (typeof window === "undefined") return SAMPLE;
  if (historyCache) return historyCache;
  const raw = localStorage.getItem(HISTORY_KEY);
  historyCache = raw ? JSON.parse(raw) : SAMPLE;
  return historyCache!;
}
function writeHistory(items: HistoryItem[]) {
  historyCache = items;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
  emit();
}

export const historyStore = {
  add(item: Omit<HistoryItem, "id" | "createdAt">) {
    const full = { ...item, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    writeHistory([full, ...readHistory()]);
    return full;
  },
  update(id: string, content: string) {
    writeHistory(readHistory().map((h) => (h.id === id ? { ...h, content } : h)));
  },
  remove(id: string) {
    writeHistory(readHistory().filter((h) => h.id !== id));
  },
};

export function useHistory() {
  return useSyncExternalStore(subscribe, readHistory, () => SAMPLE);
}

export interface User {
  name: string;
  email: string;
}
let userCache: User | null | undefined;
function readUser(): User | null {
  if (typeof window === "undefined") return null;
  if (userCache !== undefined) return userCache;
  const raw = localStorage.getItem(USER_KEY);
  userCache = raw ? JSON.parse(raw) : null;
  return userCache ?? null;
}

export const authStore = {
  signIn(user: User) {
    userCache = user;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    emit();
  },
  signOut() {
    userCache = null;
    localStorage.removeItem(USER_KEY);
    emit();
  },
};

export function useUser() {
  return useSyncExternalStore(subscribe, readUser, () => null);
}

export function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function timeAgo(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
