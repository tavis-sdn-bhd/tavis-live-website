/* The language a page is in. This file says "en"; scripts/i18n/generate.ts writes the Malay site's twin of src under
   src/ms, where it says "ms" and every string is swapped from i18n/ms.json. */

export type Locale = "en" | "ms";

export const locale: Locale = "en";

/** Where each language's pages live. */
export const localePrefix: Record<Locale, string> = { en: "", ms: "/ms" };

/** Pages that exist in English only (the blog, and /get, which sends phones to their store). Both languages link to them
    as they are. */
export const englishOnly = ["/blog", "/get"] as const;

export const isEnglishOnly = (path: string) => englishOnly.some((p) => path === p || path.startsWith(`${p}/`) || path.startsWith(`${p}?`) || path.startsWith(`${p}#`));

/** A path without its language prefix: "/ms/rewards" → "/rewards", "/ms" → "/". */
export function unprefixed(pathname: string) {
  const prefix = localePrefix.ms;
  if (pathname === prefix) return "/";
  return pathname.startsWith(`${prefix}/`) ? pathname.slice(prefix.length) : pathname;
}

/** The same page in `target`. An English-only page has no Malay twin, so its switch goes to the Malay home page. */
export function pathIn(target: Locale, pathname: string) {
  const path = unprefixed(pathname);
  if (target === "en") return path;
  if (isEnglishOnly(path)) return localePrefix.ms;
  return path === "/" ? localePrefix.ms : localePrefix.ms + path;
}

/** `<html lang>` and og:locale for each language. */
export const htmlLang: Record<Locale, string> = { en: "en-MY", ms: "ms-MY" };
export const ogLocale: Record<Locale, string> = { en: "en_MY", ms: "ms_MY" };
