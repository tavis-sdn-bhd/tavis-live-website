"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { ArrowDown } from "../icons";
import { cx } from "../ui";

/** What the cue must never sit on, as the floating chat: a control or a heading it would hide part of. */
const control = "a, button, summary, input, textarea, select, label, h1, h2, h3, [role=button], [role=tab], [data-chat-avoid]";
/** Past this far down, the visitor has found the scroll and the cue goes. */
const SCROLLED = 40;
/** A page shorter than this beyond the screen has nothing much below the fold to point at. */
const BELOW = 200;
/** Held back until the hero's intro has played, so it arrives as its own beat instead of with the headline. */
const ARRIVE = 1200;

/**
 * A pill at the foot of the screen saying there is more below, for heroes tall enough to look like the whole page.
 * Shows on load at the top of a page that scrolls, and goes as soon as the visitor scrolls. Tapping it scrolls past
 * the hero (`#top`) to what follows. Steps aside wherever a control or heading would be under it, so it never hides
 * a button. The floating chat only appears once the hero is gone, so the two never meet.
 */
export function ScrollCue() {
  const reduce = usePrefersReducedMotion();
  const ref = useRef<HTMLButtonElement>(null);
  const [ready, setReady] = useState(false);
  const [wanted, setWanted] = useState(false);

  useEffect(() => {
    let frame = 0;
    const check = () => {
      frame = 0;
      const root = document.documentElement;
      const box = ref.current?.getBoundingClientRect();
      const blocked =
        !!box?.width &&
        [0.1, 0.5, 0.9].some((fx) =>
          [0.25, 0.75].some((fy) =>
            document.elementsFromPoint(box.left + box.width * fx, box.top + box.height * fy).some((el) => !el.closest("#scroll-cue") && el.closest(control) !== null),
          ),
        );
      setWanted(window.scrollY < SCROLLED && root.scrollHeight - window.innerHeight > BELOW && !blocked);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    // Checked again as it arrives and whenever the page's height changes: on load, images and fonts move what sits
    // under its spot after the first check.
    const arrive = window.setTimeout(() => {
      setReady(true);
      schedule();
    }, ARRIVE);
    const resized = new ResizeObserver(schedule);
    resized.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(arrive);
      resized.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  const shown = ready && wanted;

  function scrollPast() {
    const hero = document.getElementById("top");
    const header = document.querySelector("header")?.offsetHeight ?? 0;
    const top = hero ? hero.getBoundingClientRect().bottom + window.scrollY - header : window.innerHeight * 0.8;
    window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <button
      ref={ref}
      id="scroll-cue"
      type="button"
      onClick={scrollPast}
      aria-hidden={!shown}
      tabIndex={shown ? 0 : -1}
      className={cx(
        "fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 z-40 flex -translate-x-1/2 items-center gap-2.5 whitespace-nowrap rounded-full border-2 border-b-4 border-line bg-paper py-1.5 pl-1.5 pr-4 font-display text-small font-extrabold uppercase tracking-[0.06em] text-forest shadow-[0_12px_32px_-12px_rgb(0_0_0/0.25)] transition-[opacity,translate] duration-500 ease-out hover:bg-cream active:translate-y-0.5 active:border-b-2",
        shown ? "opacity-100" : "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      <span aria-hidden="true" className="grid size-8 place-items-center rounded-full bg-brand text-forest">
        <ArrowDown className={cx("size-4", !reduce && "animate-bounce")} />
      </span>
      Scroll for more
    </button>
  );
}
