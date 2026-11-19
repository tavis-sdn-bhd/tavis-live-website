"use client";

import { useEffect, useRef, type HTMLAttributes } from "react";

type Intro = "view" | "load";

/**
 * A drawn scene, Duolingo's way: it acts out a short intro once, then settles. Its pieces carry the `scene-*` intro
 * classes from globals.css, which only run under `data-scene="armed"` (held on the first frame) or `"play"`.
 *
 * - `intro="view"`: a scene below the fold is armed after hydration and plays when a third of it is on screen. One
 *   already on screen at hydration, and every scene with no JS, reduced motion or paused animations, rests on its
 *   last frame instead, so nothing that was painted ever disappears.
 * - `intro="load"`: a hero, which plays from the server HTML on first paint.
 *
 * Either way, its endless loops (floating pieces, a bouncing bubble, a pulsing dot) only run while it is on screen.
 * Intros move transforms and opacity only, so the scene holds its final size throughout.
 */
export function Scene({ intro = "view", children, ...props }: HTMLAttributes<HTMLDivElement> & { intro?: Intro }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScreen = new IntersectionObserver(([entry]) => {
      if (entry) el.toggleAttribute("data-offscreen", !entry.isIntersecting);
    });
    onScreen.observe(el);
    if (intro === "load") return () => onScreen.disconnect();

    const rect = el.getBoundingClientRect();
    const seen = rect.top < window.innerHeight && rect.bottom > 0;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.motion === "paused";
    if (seen || still) return () => onScreen.disconnect();

    el.dataset.scene = "armed";
    const play = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        el.dataset.scene = "play";
        play.disconnect();
      },
      { threshold: 0.33 },
    );
    play.observe(el);
    return () => {
      onScreen.disconnect();
      play.disconnect();
    };
  }, [intro]);

  return (
    <div ref={ref} data-scene={intro === "load" ? "play" : "rest"} {...props}>
      {children}
    </div>
  );
}
