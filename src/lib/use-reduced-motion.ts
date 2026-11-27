"use client";

import { useSyncExternalStore } from "react";

const query = "(prefers-reduced-motion: reduce)";

function subscribe(notify: () => void) {
  const list = window.matchMedia(query);
  list.addEventListener("change", notify);
  return () => list.removeEventListener("change", notify);
}

const read = () => window.matchMedia(query).matches;

/* Hydration reads the real setting too, as Motion's hook did. Effects that run on the first client render, such as a
   counter resetting itself to count up, must already see it; `false` there let counters count for these visitors. So
   keep reduced motion out of rendered markup, which would then differ from the server's, and use it in effects and
   animation targets. */
const readWhileHydrating = () => typeof window !== "undefined" && read();

/**
 * Whether the visitor asks for reduced motion, following the OS setting live: turn it on mid-visit and every caller
 * re-renders at once. Use this rather than Motion's `useReducedMotion`, which reads the setting when a component
 * mounts and keeps it. False on the server.
 */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, read, readWhileHydrating);
}
