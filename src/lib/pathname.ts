import { createContext, useContext } from "react";

/** The path being viewed. Each island root provides it from Astro.url.pathname (see island.tsx), so the server and the
    browser render the same value. */
export const PathnameContext = createContext("/");

export function usePathname(): string {
  return useContext(PathnameContext);
}
