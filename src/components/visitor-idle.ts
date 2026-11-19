import { useSyncExternalStore } from "react";

/**
 * Whether the visitor has stopped doing anything: no scroll, pointer, touch or
 * key for a few seconds. Ambient loops settle while this is true, so a page
 * someone is reading costs nothing to keep on screen.
 */
const IDLE_AFTER_MS = 6000;
const inputs = ["scroll", "pointermove", "pointerdown", "keydown", "wheel"] as const;

let idle = false;
let lastInput = 0;
let timer = 0;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

function check() {
  const rested = performance.now() - lastInput;
  if (rested >= IDLE_AFTER_MS) {
    idle = true;
    notify();
  } else {
    timer = window.setTimeout(check, IDLE_AFTER_MS - rested);
  }
}

// Called for every input event, so it only stamps the time; the timer re-arms itself.
function onInput() {
  lastInput = performance.now();
  if (!idle) return;
  idle = false;
  notify();
  timer = window.setTimeout(check, IDLE_AFTER_MS);
}

export function subscribeVisitorIdle(listener: () => void) {
  if (listeners.size === 0) {
    lastInput = performance.now();
    for (const type of inputs) window.addEventListener(type, onInput, { passive: true, capture: true });
    timer = window.setTimeout(check, IDLE_AFTER_MS);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size > 0) return;
    for (const type of inputs) window.removeEventListener(type, onInput, { capture: true });
    window.clearTimeout(timer);
    idle = false;
  };
}

export function isVisitorIdle() {
  return idle;
}

export function useVisitorIdle() {
  return useSyncExternalStore(subscribeVisitorIdle, isVisitorIdle, () => false);
}
