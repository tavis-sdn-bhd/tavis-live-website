"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { easeOutExpo } from "./motion";

const format = (n: number) => Math.round(n).toLocaleString("en-MY");

/**
 * Server HTML carries the real number (no-JS and crawlers see it). Once
 * hydrated, an off-screen counter resets to 0 and counts up on first view,
 * landing with the 0.9s reveal around it. Screen readers only ever get the
 * final value; the counting digits are hidden from them.
 */
export function CountUp({ value, suffix = "", className }: { value: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const armed = useRef(false);

  useEffect(() => {
    const el = ref.current;
    // Still for reduced motion and for the site's "Pause animations" choice, as the scenes are.
    if (!el || reduce || armed.current || document.documentElement.dataset.motion === "paused") return;
    const rect = el.getBoundingClientRect();
    if (rect.top > window.innerHeight || rect.bottom < 0) {
      el.textContent = format(0) + suffix;
      armed.current = true;
    }
  }, [reduce]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView || !armed.current) return;
    const controls = animate(0, value, {
      duration: 1.2,
      ease: easeOutExpo,
      onUpdate: (n) => {
        el.textContent = format(n) + suffix;
      },
    });
    return () => controls.stop();
  }, [inView, value, suffix]);

  // Stats are tabular mono, so the final number's length in `ch` holds the width and counting never shifts the layout.
  const final = format(value) + suffix;
  return (
    <span className={className}>
      <span className="sr-only">{final}</span>
      <span ref={ref} aria-hidden="true" className="inline-block" style={{ minWidth: `${final.length}ch` }}>
        {final}
      </span>
    </span>
  );
}
