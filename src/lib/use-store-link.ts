"use client";

import { links } from "./content";
import { useClientValue } from "./use-client-value";

export type Platform = "ios" | "android";

/** iPadOS reports itself as a Mac, so a touch Mac is an iPad. */
export function detectPlatform(ua: string, maxTouchPoints: number): Platform | null {
  if (/iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && maxTouchPoints > 1)) return "ios";
  if (/Android/.test(ua)) return "android";
  return null;
}

export const storeFor: Record<Platform, string> = { ios: links.appStore, android: links.googlePlay };

/** The visitor's phone platform, or null on desktop and during SSR. */
export function usePlatform() {
  return useClientValue(() => detectPlatform(navigator.userAgent, navigator.maxTouchPoints), null);
}

/** Where a "Get Tavis" button should go: straight to this phone's store, else the download section. */
export function useStoreLink(fallback = "#download") {
  const platform = usePlatform();
  return platform ? storeFor[platform] : fallback;
}
