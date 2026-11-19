"use client";

import { MotionConfig, type Transition } from "motion/react";
import { useCallback, useRef, type CSSProperties, type ReactNode } from "react";
import { useClientValue } from "@/lib/use-client-value";
import { useMotionAttributes } from "./motion-pause";

export const easeOutExpo = [0.16, 1, 0.3, 1] as const;
export const easeOutQuart = [0.25, 1, 0.5, 1] as const;

/** Pills, presses, toggles: lands fast, no wobble. */
export const snappy = { type: "spring", stiffness: 500, damping: 38 } as const satisfies Transition;
/** Screens, toasts, panels, counters. */
export const standard = { type: "spring", stiffness: 380, damping: 36 } as const satisfies Transition;
/** Tavi: poses settle with a little bounce. */
export const playful = { type: "spring", stiffness: 300, damping: 18 } as const satisfies Transition;

/** Exits take about 60% of their entrance and ease out on quart: leaving should never hold up what comes next. */
export const EXIT = { ratio: 0.6, ease: easeOutQuart } as const;

export function exitAfter(entrance: number): Transition {
  return { duration: entrance * EXIT.ratio, ease: EXIT.ease };
}

export function MotionProvider({ children }: { children: ReactNode }) {
  useMotionAttributes();
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.8, ease: easeOutExpo }}>
      {children}
    </MotionConfig>
  );
}

/*
 * Reveal on scroll, in CSS with one shared IntersectionObserver.
 *
 * Server HTML is always visible. Hiding is a per-element decision made by JS
 * (`data-reveal-state="armed"`), so no JS, a failed bundle or a slow hydrate
 * all leave content readable. Content already on screen when the page
 * hydrates was painted in place and is never hidden again; content that
 * mounts on a client navigation hides before its first paint and rises in.
 * Styles live in globals.css (`[data-reveal]`).
 */

const STAGGER_S = 0.08;

let observer: IntersectionObserver | null = null;

function show(el: HTMLElement) {
  observer?.unobserve(el);
  if (el.dataset.revealState !== "armed") return;
  if (el.dataset.reveal === "group") {
    el.querySelectorAll<HTMLElement>("[data-reveal-item]").forEach((item, i) => {
      item.style.setProperty("--reveal-delay", `${i * STAGGER_S}s`);
    });
  }
  el.dataset.revealState = "shown";
}

/** A focused control is never left invisible: focus reveals every hidden block around it at once. */
function onFocusIn(e: FocusEvent) {
  if (!(e.target instanceof Element)) return;
  for (let el = e.target.closest<HTMLElement>('[data-reveal-state="armed"]'); el; el = el.parentElement?.closest<HTMLElement>('[data-reveal-state="armed"]') ?? null) {
    show(el);
  }
}

function getObserver() {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.target instanceof HTMLElement) show(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    document.addEventListener("focusin", onFocusIn);
  }
  return observer;
}

/** Ref for a reveal block. Arms it (hides it until it scrolls into view) unless it was already painted on screen. */
function useRevealRef() {
  // True only while hydrating server HTML; false for anything mounted later on the client.
  const hydrating = !useClientValue(() => true, false);
  const painted = useRef(hydrating);

  return useCallback((el: HTMLElement | null) => {
    if (!el) return;
    if (painted.current && el.getBoundingClientRect().top < window.innerHeight) return;
    el.dataset.revealState = "armed";
    const io = getObserver();
    io.observe(el);
    return () => io.unobserve(el);
  }, []);
}

type RevealStyle = CSSProperties & Record<`--${string}`, string>;

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
};

export function Reveal({ children, className, delay = 0, y = 24 }: RevealProps) {
  const ref = useRevealRef();
  const style: RevealStyle = { "--reveal-y": `${y}px`, "--reveal-delay": `${delay}s` };
  return (
    <div ref={ref} data-reveal="self" className={className} style={style}>
      {children}
    </div>
  );
}

type StaggerProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "ul" | "ol";
};

export function Stagger({ children, className, as: Tag = "div" }: StaggerProps) {
  const ref = useRevealRef();
  return (
    <Tag ref={ref} data-reveal="group" className={className}>
      {children}
    </Tag>
  );
}

export function StaggerItem({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li";
}) {
  return (
    <Tag data-reveal-item="" className={className}>
      {children}
    </Tag>
  );
}
