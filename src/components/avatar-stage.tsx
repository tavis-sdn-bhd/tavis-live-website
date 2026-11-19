"use client";

import { AnimatePresence, motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { screens } from "@/lib/content";
import { Coin } from "./coin";
import { Star4 } from "./icons";
import { easeOutExpo, exitAfter } from "./motion";
import { useAmbientStill } from "./motion-pause";
import { Phone } from "./phone";
import { Student } from "./student";
import { cx } from "./ui";

function PointsToast({ active }: { active: boolean }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 2600);
    return () => window.clearInterval(id);
  }, [active]);

  return (
    <div className="pointer-events-none absolute left-1/2 top-[6%] z-10 -translate-x-1/2" aria-hidden="true">
      <AnimatePresence mode="wait">
        <motion.div
          key={tick}
          initial={{ opacity: 0, y: 18, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -22, scale: 0.9, transition: exitAfter(0.6) }}
          transition={{ duration: 0.6, ease: easeOutExpo }}
          className="flex items-center gap-2 whitespace-nowrap rounded-full bg-paper py-1.5 pl-1.5 pr-4 shadow-lift"
        >
          <Coin size={28} />
          <span className="font-display text-body-sm text-forest">+10 points</span>
          <Star4 className="size-3 text-sun" />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** Avatar customisation screen flanked by two dressed-up avatars that slide in from behind it. */
export function AvatarStage({ points = true, floor = "dark" }: { points?: boolean; floor?: "dark" | "light" }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  // The toast repeats forever, so it rests with reduced motion, when paused and when the visitor goes idle.
  const still = useAmbientStill();

  return (
    <div ref={ref} className="relative mx-auto grid max-w-[34rem] grid-cols-[0.8fr_1.4fr_0.8fr] items-end">
      {points && <PointsToast active={inView && !still} />}
      <div
        aria-hidden="true"
        className={cx(
          "absolute inset-x-[4%] bottom-[-3%] h-[9%] rounded-[50%] blur-md",
          floor === "dark" ? "bg-forest-deep/70" : "bg-forest/15",
        )}
      />
      <motion.div
        className="relative z-0 -mr-[8%] translate-y-[-4%] sm:-mr-[18%]"
        initial={{ x: 30, opacity: 0, rotate: 0 }}
        whileInView={{ x: 0, opacity: 1, rotate: -3 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 1.1, ease: easeOutExpo, delay: 0.25 }}
      >
        <Student look="pink" label="Customised avatar wearing a pink sweater" className="h-auto w-full drop-shadow-[0_18px_22px_rgb(0_0_0/0.3)]" />
      </motion.div>
      <div className="relative z-10 pt-20">
        <Phone screen={screens.avatar} />
      </div>
      <motion.div
        className="relative z-0 -ml-[8%] translate-y-[-4%] sm:-ml-[18%]"
        initial={{ x: -30, opacity: 0, rotate: 0 }}
        whileInView={{ x: 0, opacity: 1, rotate: 3 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 1.1, ease: easeOutExpo, delay: 0.35 }}
      >
        <Student look="green" label="Customised avatar wearing a tudung and a green baju kurung" className="h-auto w-full drop-shadow-[0_18px_22px_rgb(0_0_0/0.3)]" />
      </motion.div>
    </div>
  );
}
