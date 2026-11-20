/* The language a page is in. This file says "en"; scripts/i18n/generate.ts writes the Malay site's twin of src under
   src/ms, where it says "ms" and every string is swapped from i18n/ms.json. */

export type Locale = "en" | "ms";

export const locale: Locale = "en";

/** Where each language's pages live. */
export const localePrefix: Record<Locale, string> = { en: "", ms: "/ms" };

/** The pages with a Malay twin, which scripts/i18n/generate.ts writes under src/pages/ms. Every other path is
    English-only: the blog, /get (which sends phones to their store) and the 404. */
export const twinned = ["/", "/question-universe", "/rewards", "/online-tuition", "/tutors", "/parents", "/about"] as const;

/** Whether a path ("/rewards#earn", "/ms/rewards") is one of the pages with a Malay twin. */
export function hasTwin(path: string) {
  const page = unprefixed(path.replace(/[?#].*$/, ""));
  return twinned.some((p) => p === page);
}

/** A path without its language prefix: "/ms/rewards" → "/rewards", "/ms" → "/". */
export function unprefixed(pathname: string) {
  const prefix = localePrefix.ms;
  if (pathname === prefix) return "/";
  return pathname.startsWith(`${prefix}/`) ? pathname.slice(prefix.length) : pathname;
}

/** The same page in `target`. An English-only page has no Malay twin, so its Malay link goes to the Malay home page. */
export function pathIn(target: Locale, pathname: string) {
  const path = unprefixed(pathname);
  if (target === "en") return path;
  if (!hasTwin(path)) return localePrefix.ms;
  return path === "/" ? localePrefix.ms : localePrefix.ms + path;
}

/** `<html lang>` and og:locale for each language. */
export const htmlLang: Record<Locale, string> = { en: "en-MY", ms: "ms-MY" };
export const ogLocale: Record<Locale, string> = { en: "en_MY", ms: "ms_MY" };
