import { hero } from "@/lib/content";
import { aboutPage, parentsPage, questionUniverse, rewardsPage, tuitionPage, tutorsPage } from "@/lib/pages";
import type { PagePath } from "@/lib/site";
import { type Locale, locale } from "@/lib/locale";
import type { Mood } from "@/components/mascot";
import type { Outfit } from "@/components/mascot-outfits";

/** The card size every network expects. Kept here, not in card.tsx, so pages can import it without the renderer. */
export const ogSize = { width: 1200, height: 630 } as const;

export type OgVisual =
  /** A screen PNG in scripts/og, in a phone. */
  | { kind: "phone"; file: `${string}.png` }
  /** A photo from public/assets, framed and tilted. */
  | { kind: "photo"; asset: string }
  /** A cut-out from public/assets, standing on the card's bottom edge. */
  | { kind: "cutout"; asset: string }
  | { kind: "tavi"; mood: Mood; outfit: Outfit };

export type OgCard = {
  /** The page hero's lines, in ink. */
  title: readonly string[];
  /** The hero's last line, in green. */
  accent?: string;
  visual: OgVisual;
};

/** Each page's Open Graph card in design BA: its hero's words, and the art that stands for it. */
export const ogCards: Record<PagePath, OgCard> = {
  "/": { title: hero.title, accent: hero.accent, visual: { kind: "tavi", mood: "cheer", outfit: "school" } },
  "/question-universe": { title: questionUniverse.hero.title, accent: questionUniverse.hero.accent, visual: { kind: "phone", file: "screen-question.png" } },
  "/rewards": { title: rewardsPage.hero.title, accent: rewardsPage.hero.accent, visual: { kind: "phone", file: "screen-rewards.png" } },
  "/online-tuition": { title: tuitionPage.hero.title, accent: tuitionPage.hero.accent, visual: { kind: "cutout", asset: "tuition-team.webp" } },
  "/tutors": { title: tutorsPage.hero.title, visual: { kind: "cutout", asset: "tuition-team.webp" } },
  "/parents": { title: parentsPage.hero.title, accent: parentsPage.hero.accent, visual: { kind: "phone", file: "screen-home.png" } },
  "/about": { title: aboutPage.hero.title, accent: aboutPage.hero.accent, visual: { kind: "photo", asset: "journey-2023.webp" } },
  "/blog": { title: ["The Tavis blog."], accent: "Study tips for Form 1–5.", visual: { kind: "tavi", mood: "think", outfit: "graduate" } },
  "/get": { title: ["Get Tavis."], accent: "Free on iPhone and Android.", visual: { kind: "tavi", mood: "wave", outfit: "school" } },
};

/** The card's file name: "/" is "home", every other page its path. */
export const ogSlug = (path: PagePath) => (path === "/" ? "home" : path.slice(1));

/** Where a page's card is served, from the site root. */
export const ogImagePath = (path: PagePath) => `/og/${ogFolder[locale]}/${ogSlug(path)}.png`;

/** Each language's cards, in public/og. English kept the folder it had when designs were named by letter. */
const ogFolder: Record<Locale, string> = { en: "ba", ms: "ms" };

/** Satori draws a word joiner as a gap and lays out each line itself, so the copy's no-break characters go. */
export const plain = (line: string) => line.replace(/\u2060/g, "").replace(/\u00a0/g, " ");

/** The card's alt text: its words as one sentence. */
export const ogAlt = (path: PagePath) => {
  const { title, accent } = ogCards[path];
  return `Tavis: ${[...title, ...(accent ? [accent] : [])].map(plain).join(" ")}`;
};
