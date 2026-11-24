"use client";

import { Image } from "@/components/image";
import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { useRef, useState, type CSSProperties } from "react";
import type { Screen } from "@/lib/content";
import { DigitRoll } from "../digit-roll";
import { Star4 } from "../icons";
import { Mascot } from "../mascot";
import { Phone } from "../phone";
import { cx } from "../ui";
import { BurstStage, type Piece } from "./art";
import { TaviDisc } from "./hero";
import { Headline, ledgeFills } from "./ui";

type Year = {
  readonly year: string;
  readonly image: { readonly src: string; readonly alt: string; readonly w: number; readonly h: number } | null;
};

/* BA's about page, told as a path. In the hero the year photos burst out from behind Tavi; below it, the journey.
   On a laptop with motion allowed (`lg:motion-safe:`), the journey pins and scrolling walks it a year at a time: a
   green fuse runs along a path of year badges with Tavi riding its tip, and as it reaches each badge the badge fills,
   the big year rolls over and that year's photo deals onto the deck. Everywhere else it is the same list read top to
   bottom, each year a badge on a dashed path above its photo. One list serves both, so server HTML is complete and
   the switch is CSS. */

/** Where each photo lands in the hero, in % of its square stage: two above Tavi, two beside him. */
const snapshotSpots = [
  { x: 1, y: 5, tilt: -9 },
  { x: 63, y: 1, tilt: 8 },
  { x: 0, y: 58, tilt: 7 },
  { x: 65, y: 56, tilt: -6 },
] as const;

/** A photo as a print with its year written under it. Sized in the stage's container units, so it scales with it. */
function Snapshot({ year, image }: { year: string; image: NonNullable<Year["image"]> }) {
  return (
    <div className="rounded-[8%] border-2 border-b-4 border-line bg-paper p-[5%] pb-0 shadow-float">
      <Image src={image.src} alt="" width={image.w} height={image.h} loading="eager" sizes="(min-width: 1024px) 170px, 30vw" className="aspect-[4/3] w-full rounded-[6%] object-cover" />
      <p className="py-[5%] text-center font-display text-[max(0.75rem,3.4cqw)] leading-none text-forest">{year}</p>
    </div>
  );
}

/** The about hero's picture: Tavi waves, and the years he has been through spring out from behind him. */
export function StoryHero({ years }: { years: readonly Year[] }) {
  const shots = years.flatMap((y) => (y.image ? [{ year: y.year, image: y.image }] : []));
  const pieces: Piece[] = snapshotSpots.flatMap((spot, i) => {
    const shot = shots[i];
    return shot ? [{ key: shot.year, x: spot.x, y: spot.y, w: 34, ratio: 0.92, tilt: spot.tilt, node: <Snapshot year={shot.year} image={shot.image} /> }] : [];
  });
  return (
    <div className="relative mx-auto w-full max-w-[30rem]">
      <BurstStage intro="load" from={{ x: 50, y: 56 }} pieces={pieces} delay={420} />
      <div className="absolute left-1/2 top-[56%] w-[54%] -translate-x-1/2 -translate-y-1/2">
        <TaviDisc outfit="none" mood="wave" />
      </div>
    </div>
  );
}

/** Each card's place in the laptop deck, by how far its year is from the one on show: on top, the next one peeking
    out on the right, the two before it tucked behind on the left, the rest out of sight. Swapping places transitions
    on a slight overshoot, the curve the scenes land on. */
function pose(offset: number) {
  if (offset === 0) return "lg:motion-safe:z-30";
  if (offset === 1) return "lg:motion-safe:z-20 lg:motion-safe:translate-x-[16%] lg:motion-safe:rotate-[7deg] lg:motion-safe:scale-[0.86]";
  if (offset > 1) return "lg:motion-safe:z-10 lg:motion-safe:translate-x-[30%] lg:motion-safe:rotate-[12deg] lg:motion-safe:scale-[0.78] lg:motion-safe:opacity-0";
  if (offset === -1) return "lg:motion-safe:z-20 lg:motion-safe:-translate-x-[8%] lg:motion-safe:-translate-y-[6%] lg:motion-safe:-rotate-[6deg] lg:motion-safe:scale-[0.92]";
  if (offset === -2) return "lg:motion-safe:z-10 lg:motion-safe:-translate-x-[13%] lg:motion-safe:-translate-y-[10%] lg:motion-safe:rotate-[3deg] lg:motion-safe:scale-[0.85]";
  return "lg:motion-safe:z-0 lg:motion-safe:-translate-x-[13%] lg:motion-safe:-translate-y-[10%] lg:motion-safe:rotate-[3deg] lg:motion-safe:scale-[0.85] lg:motion-safe:opacity-0";
}

type StoryProps = { title: string; years: readonly Year[]; end: string; screen: Screen };

export function Story({ title, years, end, screen }: StoryProps) {
  const ref = useRef<HTMLElement>(null);
  const count = years.length;
  const last = Math.max(1, count - 1);
  const [current, setCurrent] = useState(0);

  // The pin's scroll in `count` equal parts, one per year. The fuse leaves a badge as its part begins and reaches the
  // next one as that part ends, which is when the year changes; through the last part it rests on the last badge.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (p) => setCurrent(Math.min(count - 1, Math.max(0, Math.floor(p * count)))));
  const fill = useTransform(
    scrollYProgress,
    [...years.map((_, i) => i / count), 1],
    [...years.map((_, i) => i / last), 1],
  );
  const runner = useTransform(fill, (f) => `${f * 100}%`);

  /** A badge on the path scrolls to the start of its year, where the fuse has just reached it. */
  const show = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + ((i + 0.08) / count) * (el.offsetHeight - window.innerHeight), behavior: "smooth" });
  };

  // Pinned, the section is a screen plus a screen of scroll for each year, so one PageDown or Space never passes a
  // whole year. Set in CSS, so server HTML already has its height and nothing jumps on hydration.
  const height = { "--years": `${count}` } as CSSProperties;
  const year = years[current]?.year ?? "";

  return (
    <section ref={ref} id="journey" data-screen="own" style={height} className="relative lg:motion-safe:h-[calc((var(--years)+1)*100svh)]">
      {/* The pinned frame is the screen below the sticky header (4.5rem and its 2px rule). */}
      <div className="lg:motion-safe:sticky lg:motion-safe:top-0 lg:motion-safe:flex lg:motion-safe:h-svh lg:motion-safe:flex-col lg:motion-safe:overflow-hidden lg:motion-safe:pt-[4.625rem]">
        <div className="shell grid gap-12 py-[clamp(4rem,2.5rem+5vw,7rem)] lg:motion-safe:flex-1 lg:motion-safe:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:motion-safe:items-center lg:motion-safe:gap-16 lg:motion-safe:py-[clamp(1rem,4svh,3rem)]">
          <div className="text-center lg:motion-safe:text-left">
            <Headline title={title} />
            <p aria-hidden="true" className="mt-5 hidden font-display text-[clamp(6rem,2rem+9vw,11rem)] leading-[0.9] tracking-[-0.03em] text-brand-ink lg:motion-safe:block">
              <DigitRoll value={Number(year)} format={String} />
            </p>
          </div>

          <ol className="mx-auto flex w-full max-w-[34rem] flex-col items-center lg:motion-safe:relative lg:motion-safe:block lg:motion-safe:aspect-[4/3] lg:motion-safe:w-[min(100%,34rem,calc((100svh-20rem)*4/3))] lg:motion-safe:max-w-none">
            {years.map((y, i) => (
              <li
                key={y.year}
                className={cx(
                  "flex w-full flex-col items-center",
                  "lg:motion-safe:absolute lg:motion-safe:inset-0 lg:motion-safe:transition-[translate,rotate,scale,opacity] lg:motion-safe:duration-700 lg:motion-safe:ease-[cubic-bezier(0.34,1.4,0.64,1)]",
                  pose(i - current),
                )}
              >
                {i > 0 && <span aria-hidden="true" className="h-10 border-l-[3px] border-dashed border-line-strong lg:motion-safe:hidden" />}
                <p className={cx("mb-5 rounded-full px-5 py-2 font-display text-[1.5rem] leading-none lg:motion-safe:sr-only", ledgeFills[i % ledgeFills.length])}>{y.year}</p>
                <article className="card w-full overflow-hidden p-2.5 sm:p-3 lg:motion-safe:h-full lg:motion-safe:shadow-lift">
                  {y.image ? (
                    <Image
                      src={y.image.src}
                      alt={y.image.alt}
                      width={y.image.w}
                      height={y.image.h}
                      sizes="(min-width: 640px) 544px, 92vw"
                      className="aspect-[4/3] w-full rounded-[0.75rem] object-cover sm:rounded-[0.625rem] lg:motion-safe:aspect-auto lg:motion-safe:h-full"
                    />
                  ) : (
                    <div className="grid aspect-[4/3] place-items-center overflow-hidden rounded-[0.75rem] bg-brand sm:rounded-[0.625rem] lg:motion-safe:aspect-auto lg:motion-safe:h-full">
                      <div className="w-[36%] translate-y-[20%] rotate-[-4deg]">
                        <Phone screen={screen} />
                      </div>
                    </div>
                  )}
                </article>
              </li>
            ))}
            <li className="flex flex-col items-center lg:motion-safe:hidden">
              <span aria-hidden="true" className="h-10 border-l-[3px] border-dashed border-line-strong" />
              <End text={end} />
            </li>
          </ol>
        </div>

        {/* The path: a shortcut to each year, by pointer or Tab, for the list above. It runs to the screen's bottom
            right corner, so the floating chat steps aside while it is pinned. */}
        <div data-chat-avoid className="shell hidden pb-[clamp(2.75rem,7svh,4.5rem)] pt-[clamp(3.5rem,9svh,5rem)] lg:motion-safe:flex lg:motion-safe:items-center lg:motion-safe:gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-x-7 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-line" />
            <motion.div style={{ scaleX: fill }} className="absolute inset-x-7 top-1/2 h-1.5 origin-left -translate-y-1/2 rounded-full bg-brand" />
            <motion.div style={{ x: runner }} className="pointer-events-none absolute inset-x-7 bottom-[calc(100%-0.25rem)] z-10">
              <div className="absolute bottom-0 left-0 w-[4.5rem] -translate-x-1/2">
                <Mascot mood={current === count - 1 ? "cheer" : "swim"} decorative />
              </div>
            </motion.div>
            <ol className="relative flex justify-between">
              {years.map((y, i) => {
                const reached = i <= current;
                return (
                  <li key={y.year} className="relative">
                    <button
                      type="button"
                      aria-current={i === current ? "step" : undefined}
                      onClick={() => show(i)}
                      className={cx(
                        "ledge grid size-14 place-items-center rounded-full",
                        reached ? ledgeFills[i % ledgeFills.length] : "bg-line text-muted shadow-[0_6px_0_var(--color-line-strong)]",
                      )}
                    >
                      <Star4 className="size-5" />
                      <span className={cx("absolute left-1/2 top-full mt-3.5 -translate-x-1/2 font-display text-body-sm transition-colors duration-300", reached ? "text-forest" : "text-muted")}>{y.year}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
          <span className="w-12 border-t-[5px] border-dotted border-line-strong" />
          <End text={end} />
        </div>
      </div>
    </section>
  );
}

function End({ text }: { text: string }) {
  return (
    <p className="inline-flex shrink-0 items-center gap-2 rounded-full bg-forest px-5 py-3 font-display text-on-forest">
      <Star4 className="size-4 text-sun" />
      {text}
    </p>
  );
}
