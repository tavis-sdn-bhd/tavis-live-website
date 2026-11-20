import { createContext, useContext } from "react";

/** The path being viewed. Each island root provides it from Astro.url.pathname (see island.tsx), so the server and the
    browser render the same value. */
export const PathnameContext = createContext("/");

export function usePathname(): string {
  return useContext(PathnameContext);
}

/** A page's route from its URL. A pre-rendered page is built as /rewards.html (build.format "file"), and Astro.url
    says so at build time; links and the current-page mark compare routes, so the file name comes off. */
export function routePath(url: URL) {
  return url.pathname.replace(/\.html$/, "").replace(/\/index$/, "") || "/";
}
