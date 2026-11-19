"use client";

import { useSyncExternalStore } from "react";

const noSubscribe = () => () => {};

/** A value only the browser knows (clock, user agent): `server` in static HTML and while hydrating, then `read()`. */
export function useClientValue<T>(read: () => T, server: T): T {
  return useSyncExternalStore(noSubscribe, read, () => server);
}
