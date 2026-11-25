import { hasTwin, locale, localePrefix } from "./locale";

export const siteUrl = "https://www.tavis.live";
export const siteName = "Tavis";

/* Every page of the site, in nav order. A design renders each page under its
   own prefix, except a page whose `designs` names the designs that have it; the
   header and footer read this list through `deckOf`. */
const pages = {
  "/": {
    label: "Home",
    title: "Tavis — Malaysia’s free education app for SPM revision and online tuition",
    description:
      "Free practice questions and Learning Cards, online tuition and real rewards for Form 1–5 students in Malaysia. All in one app.",
  },
  "/question-universe": {
    label: "Question Universe",
    title: "Free Form 1–5 practice questions & Learning Cards — Tavis",
    description:
      "Unlimited free practice questions with clear explanations and bite-sized Learning Cards for Form 1–5, aligned with Malaysia’s latest curriculum.",
  },
  "/rewards": {
    label: "Rewards",
    title: "Earn points and real rewards as you learn — Tavis",
    description:
      "Earn points for practice, daily log-ins and online classes, then redeem them for real rewards. Dress up your avatar and climb the school rankings.",
  },
  "/online-tuition": {
    label: "Online Tuition",
    title: "Online tuition in Malaysia for Form 1–5 — Tavis",
    description:
      "Live online classes for Form 1–5 with experienced Malaysian teachers. Rewatch every class. All subjects for your form from RM70 a month.",
  },
  "/tutors": {
    label: "Tutors",
    title: "The tutors behind Tavis online tuition — Tavis",
    description: "Meet the Malaysian teachers who run Tavis’s live online classes for Form 1–5, the subjects they teach and their credentials.",
    designs: ["ba"],
  },
  "/parents": {
    label: "For parents",
    title: "Tavis for parents of Form 1–5 students — Tavis",
    description:
      "What Tavis offers parents of Form 1–5 students: free practice questions, live online tuition, real rewards for learning, and student safety.",
    designs: ["ba"],
  },
  "/blog": {
    label: "Blog",
    title: "The Tavis blog: study tips, SPM preparation and online tuition — Tavis",
    description: "Articles for Form 1–5 students and their parents on studying, SPM preparation and online tuition in Malaysia.",
    designs: ["ba"],
  },
  "/about": {
    label: "About",
    title: "Our story, from 2022 to today — Tavis",
    description:
      "How Tavis grew from 2022 to 2026, meet co-founder Dr Nurul Suhada Mazalan, and see where Tavis has been featured in the Malaysian press.",
  },
  // The download QR code's target, outside every design: phones go to their store, anything else sees the badges.
  "/get": {
    label: "Get the app",
    title: "Get the Tavis app — Tavis",
    description: "Download Tavis free on iPhone and Android.",
    designs: [],
  },
} as const satisfies Record<string, { label: string; title: string; description: string; designs?: readonly DesignId[] }>;

export type PagePath = keyof typeof pages;
export type DesignId = "ba";
export type DeckPage = { href: PagePath; label: string; description: string };

/* Each design's URL prefix. BA was chosen and is the site at /, so its prefix is the language's: none in English,
   /ms in Malay. The old /ba URLs redirect (public/_redirects). */
const prefixes: Record<DesignId, string> = { ba: localePrefix[locale] };

/** The design the root opens, and the one pages outside every design (/get, a 404) link into. */
export const defaultDesign: DesignId = "ba";

/** The pages a design renders, in nav order. */
export function deckOf(design: DesignId): DeckPage[] {
  return (Object.keys(pages) as PagePath[]).flatMap((href) => {
    const page: { label: string; description: string; designs?: readonly DesignId[] } = pages[href];
    if (page.designs && !page.designs.includes(design)) return [];
    return [{ href, label: page.label, description: page.description }];
  });
}

/** A design's header, footer and 404 links: every page of its deck but home, which the logo covers. */
export function navOf(design: DesignId): DeckPage[] {
  return deckOf(design).filter((page) => page.href !== "/");
}

/** A deck path in a design, under its prefix. BA has none, so its paths are unchanged. */
export function hrefIn(design: DesignId, path: string) {
  if (!path.startsWith("/") || !hasTwin(path)) return path;
  const prefix = prefixes[design];
  if (!prefix) return path;
  return prefix + (/^\/(?:[#?]|$)/.test(path) ? path.slice(1) : path);
}

/** The design a URL path belongs to, or null outside every prefixed design (every path, now BA is at /). */
export function designOf(pathname: string): DesignId | null {
  const ids = Object.keys(prefixes) as DesignId[];
  return ids.find((id) => prefixes[id] && (pathname === prefixes[id] || pathname.startsWith(`${prefixes[id]}/`))) ?? null;
}

/** A page's title and description, for its <head>. */
export function pageMeta(path: PagePath): { title: string; description: string } {
  const { title, description } = pages[path];
  return { title, description };
}
