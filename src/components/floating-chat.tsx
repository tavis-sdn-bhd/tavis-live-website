"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "@/lib/pathname";
import { type RefObject, useEffect, useRef, useState } from "react";
import { links } from "@/lib/content";
import { WhatsApp } from "./icons";
import { easeOutExpo, exitAfter } from "./motion";
import { cx } from "./ui";
import { buttonClass } from "./v2/ui";

/** Blocks the button steps aside for: the contact block, and any call to action marked `data-cta` (pricing, the
    page's closing, the download block), so it never sits on the buttons that already do its job. */
const aside = "#contact, [data-cta]";

/** The button's face: A's pill with its press, or B's ledge button, uppercase on its lip. */
type Look = "press" | "ledge";

const faces: Record<Look, { face: string; disc: string; label: string }> = {
  press: {
    face: "press flex h-14 items-center gap-2.5 rounded-full bg-brand p-2 font-display text-forest shadow-ledge-brand sm:pr-5",
    disc: "grid size-10 place-items-center rounded-full bg-forest text-brand",
    label: "max-sm:sr-only",
  },
  // Square until xl: a 254px pill at a tablet's edge sits on the right column's copy.
  ledge: {
    face: buttonClass({ size: "lg", className: "gap-2.5 max-xl:size-14 max-xl:p-0 max-xl:sm:px-0 xl:pl-3" }),
    disc: "grid size-9 place-items-center rounded-xl bg-forest text-brand",
    label: "max-xl:sr-only",
  },
};

/** What the button must never sit on: a control, a heading, or what is marked `data-chat-avoid` (the practice demo's
    phone, the tutors' names), which it would hide part of. */
const control = "a, button, summary, input, textarea, select, label, h1, h2, h3, [role=button], [role=tab], [data-chat-avoid]";

/**
 * True while a control is under the button's spot. `spot` is an invisible copy of the button, always in place, so the
 * spot can be probed while the button is away. A 4×3 grid of points is hit-tested on scroll; once covered, the spot
 * must stay clear for a moment before the button returns, so it doesn't blink while links scroll past.
 */
function useCovering(spot: RefObject<HTMLElement | null>, pathname: string) {
  const [covering, setCovering] = useState(false);
  useEffect(() => {
    let frame = 0;
    let clearTimer = 0;
    const probe = () => {
      frame = 0;
      const box = spot.current?.getBoundingClientRect();
      if (!box?.width) return;
      let hit = false;
      for (let i = 0; i < 4 && !hit; i++) {
        for (let j = 0; j < 3 && !hit; j++) {
          const x = box.left + 2 + ((box.width - 4) * i) / 3;
          const y = box.top + 2 + ((box.height - 4) * j) / 2;
          hit = document.elementsFromPoint(x, y).some((el) => !el.closest("#floating-chat") && el.closest(control) !== null);
        }
      }
      window.clearTimeout(clearTimer);
      if (hit) setCovering(true);
      else clearTimer = window.setTimeout(() => setCovering(false), 250);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(probe);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(clearTimer);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [spot, pathname]);
  return covering;
}

/** Appears once the hero is gone. Steps aside while a call to action or the contact block is on screen, and while a
    control would be under it, so it never covers something to tap. */
export function FloatingChat({ look = "press" }: { look?: Look }) {
  const pathname = usePathname();
  const [pastHero, setPastHero] = useState(false);
  const [blocking, setBlocking] = useState(0);
  const spot = useRef<HTMLSpanElement>(null);
  const covering = useCovering(spot, pathname);

  // The layout persists across client navigation, so re-observe each page's own hero and blocks.
  useEffect(() => {
    setPastHero(false);
    setBlocking(0);
    const hero = document.getElementById("top");
    const onScreen = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === hero) setPastHero(!entry.isIntersecting);
        else if (entry.isIntersecting) onScreen.add(entry.target);
        else onScreen.delete(entry.target);
      }
      setBlocking(onScreen.size);
    });
    if (hero) observer.observe(hero);
    for (const block of document.querySelectorAll(aside)) observer.observe(block);
    return () => observer.disconnect();
  }, [pathname]);

  const face = faces[look];
  const place = "fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-40 sm:right-[max(1.5rem,env(safe-area-inset-right))]";

  return (
    <div id="floating-chat">
      <span ref={spot} aria-hidden="true" className={cx(place, "pointer-events-none invisible")}>
        <span className={face.face}>
          <span className={face.disc} />
          <span className={face.label}>Chat on WhatsApp</span>
        </span>
      </span>
      <AnimatePresence>
        {pastHero && blocking === 0 && !covering && (
          <motion.a
            href={links.whatsapp}
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.9, transition: exitAfter(0.5) }}
            transition={{ duration: 0.5, ease: easeOutExpo }}
            className={cx("group [-webkit-touch-callout:none]", place, look === "press" ? "rounded-full" : "rounded-2xl")}
          >
            {/* The press lives on an inner element: Motion owns the link's transform for the entrance. */}
            <span className={face.face}>
              <span className={cx(face.disc, "transition-transform duration-500 ease-out-expo group-hover:-rotate-12")}>
                <WhatsApp className="size-5" />
              </span>
              <span className={face.label}>Chat on WhatsApp</span>
            </span>
          </motion.a>
        )}
      </AnimatePresence>
    </div>
  );
}
