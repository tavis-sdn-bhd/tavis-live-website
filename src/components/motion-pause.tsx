"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useSyncExternalStore } from "react";
import { Pause, Play } from "./icons";
import { cx } from "./ui";
import { isVisitorIdle, subscribeVisitorIdle, useVisitorIdle } from "./visitor-idle";

/**
 * The visitor's "Pause animations" choice (WCAG 2.2.2). Persisted per browser
 * and mirrored on <html> so CSS loops can stop too: `data-motion="paused"`.
 */
const KEY = "tavis:motion";

let paused: boolean | null = null;
const listeners = new Set<() => void>();

function load() {
  try {
    return window.localStorage.getItem(KEY) === "paused";
  } catch {
    return false;
  }
}

function isPaused() {
  paused ??= load();
  return paused;
}

function commit(next: boolean) {
  paused = next;
  listeners.forEach((l) => l());
}

function onStorage(e: StorageEvent) {
  if (e.key === KEY) commit(e.newValue === "paused");
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

export function setMotionPaused(next: boolean) {
  try {
    if (next) window.localStorage.setItem(KEY, "paused");
    else window.localStorage.removeItem(KEY);
  } catch {
    // Storage blocked (private mode, policy): the choice still holds for this page.
  }
  commit(next);
}

export function useMotionPaused() {
  return useSyncExternalStore(subscribe, isPaused, () => false);
}

/**
 * Whether ambient loops (bobbing, waving, dropping coins, toasts) should rest:
 * the visitor prefers reduced motion, paused animations, or has stopped
 * interacting. One-shot feedback to something they just did may still play.
 */
export function useAmbientStill() {
  const reduce = useReducedMotion();
  const pausedNow = useMotionPaused();
  const idle = useVisitorIdle();
  return !!reduce || pausedNow || idle;
}

/**
 * Mirrors the pause choice and visitor idleness onto <html> for CSS loops:
 * `data-motion="paused"` and `data-visitor="idle"`. Mounted once, by MotionProvider.
 */
export function useMotionAttributes() {
  useEffect(() => {
    const html = document.documentElement;
    const reflect = () => {
      if (isPaused()) html.dataset.motion = "paused";
      else delete html.dataset.motion;
      if (isVisitorIdle()) html.dataset.visitor = "idle";
      else delete html.dataset.visitor;
    };
    reflect();
    const stopPaused = subscribe(reflect);
    const stopIdle = subscribeVisitorIdle(reflect);
    return () => {
      stopPaused();
      stopIdle();
    };
  }, []);
}

/** Site-wide "Pause animations" toggle; pressed while animations are paused. `iconOnly` draws it as a round icon
    button, its name kept for screen readers and shown on hover, showing play while paused. */
export function PauseMotionToggle({ className, iconOnly }: { className?: string; iconOnly?: boolean }) {
  const pausedNow = useMotionPaused();
  return (
    <button
      type="button"
      aria-pressed={pausedNow}
      onClick={() => setMotionPaused(!pausedNow)}
      title={iconOnly ? "Pause animations" : undefined}
      className={cx(
        "tap rounded-full text-forest ring-1 ring-inset ring-forest/15 hover:bg-forest/[0.04] active:bg-forest/[0.06]",
        iconOnly ? "grid size-11 place-items-center" : "label inline-flex min-h-11 items-center gap-2 px-4",
        "aria-pressed:bg-forest aria-pressed:text-on-forest aria-pressed:ring-forest aria-pressed:hover:bg-forest-soft",
        className,
      )}
    >
      {iconOnly && pausedNow ? <Play className="size-4" /> : <Pause className={iconOnly ? "size-4" : "size-3"} />}
      {iconOnly ? <span className="sr-only">Pause animations</span> : "Pause animations"}
    </button>
  );
}
