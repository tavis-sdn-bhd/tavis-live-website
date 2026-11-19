"use client";

import { useEffect } from "react";
import { detectPlatform, storeFor } from "@/lib/use-store-link";

/** Sends a phone that scanned the QR code to its store. Desktops stay and see the badges. */
export function StoreRedirect() {
  useEffect(() => {
    const platform = detectPlatform(navigator.userAgent, navigator.maxTouchPoints);
    if (platform) window.location.replace(storeFor[platform]);
  }, []);
  return null;
}
