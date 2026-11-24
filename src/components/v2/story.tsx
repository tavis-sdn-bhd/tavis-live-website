"use client";

import { Image } from "@/components/image";
import { motion, useMotionTemplate, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef, useState, type CSSProperties, type RefObject } from "react";
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

/* BA's about page, told as a path. In the hero the year photos burst out from behind Tavi; below it, the journey, in
   one of two forms. On a laptop with motion allowed (`lg:motion-safe:`) it pins, and scrolling the page walks it a year
   at a time: a green fuse runs along a path of year badges with Tavi riding its tip, and as it reaches each badge the
   badge fills, the big year rolls over and that year's photo deals onto the deck. Everywhere else it is a reel: the
   photos in a row to swipe a year at a time, the next one peeking in, over the same path, which follows the swipe.
   CSS picks the form, so server HTML has both and nothing swaps on hydration; the other is not displayed, so assistive
   tech meets one list. */

/** Where each photo lands in the hero, in % of its square stage: two above Tavi, two beside him. */
const snapshotSpots = [
  { x: 1, y: 5, tilt: -9 },
  { x: 63, y: 1, tilt: 8 },
  { x: 0, y: 58, tilt: 7 },
  { x: 65, y: 56, tilt: -6 },
] as const;

/** A photo as a print with its year written under it. Sized in the stage's container units, so it scales with it: the
    print is 34cqw wide, so its 8% corner is 2.7cqw and the photo, inset by 5% (1.7cqw) and the 2px border, keeps the
    rest, which leaves it nearly square-cornered, as a print's photo is. */
function Snapshot({ year, image }: { year: string; image: NonNullable<Year["image"]> }) {
  return (
    <div className="rounded-[2.7cqw] border-2 border-b-4 border-line bg-paper p-[5%] pb-0 shadow-float">
      <Image src={image.src} alt="" width={image.w} height={image.h} loading="eager" sizes="(min-width: 1024px) 170px, 30vw" className="aspect-[4/3] w-full rounded-[calc(1cqw-2px)] object-cover" />
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

type StoryProps = { title: string; years: readonly Year[]; end: string; screen: Screen };

/** The journey section: the pinned deck on a laptop with motion allowed, the reel everywhere else. Pinned, the
    section is a screen plus a screen of scroll for each year, so one PageDown or Space never passes a whole year. Set
    in CSS, so server HTML already has its height and nothing jumps on hydration. */
export function Story(props: StoryProps) {
  const ref = useRef<HTMLElement>(null);
  const height = { "--years": `${props.years.length}` } as CSSProperties;
  return (
    <section ref={ref} id="journey" data-screen="own" style={height} className="relative lg:motion-safe:h-[calc((var(--years)+1)*100svh)]">
      <Deck section={ref} {...props} />
      <Reel {...props} />
    </section>
  );
}

/** Each card's place in the deck, by how far its year is from the one on show: on top, the next one peeking out on
    the right, the two before it tucked behind on the left, the rest out of sight. Swapping places transitions on a
    slight overshoot, the curve the scenes land on. */
function pose(offset: number) {
  if (offset === 0) return "z-30";
  if (offset === 1) return "z-20 translate-x-[16%] rotate-[7deg] scale-[0.86]";
  if (offset > 1) return "z-10 translate-x-[30%] rotate-[12deg] scale-[0.78] opacity-0";
  if (offset === -1) return "z-20 -translate-x-[8%] -translate-y-[6%] -rotate-[6deg] scale-[0.92]";
  if (offset === -2) return "z-10 -translate-x-[13%] -translate-y-[10%] rotate-[3deg] scale-[0.85]";
  return "z-0 -translate-x-[13%] -translate-y-[10%] rotate-[3deg] scale-[0.85] opacity-0";
}

/** The pinned form. The page's scroll through the section is cut in one part per year: the fuse leaves a badge as
    its part begins and reaches the next one as that part ends, which is when the year changes; through the last part
    it rests on the last badge. */
function Deck({ section, title, years, end, screen }: StoryProps & { section: RefObject<HTMLElement | null> }) {
  const count = years.length;
  const last = Math.max(1, count - 1);
  const [current, setCurrent] = useState(0);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (p) => setCurrent(Math.min(count - 1, Math.max(0, Math.floor(p * count)))));
  const fill = useTransform(
    scrollYProgress,
    [...years.map((_, i) => i / count), 1],
    [...years.map((_, i) => i / last), 1],
  );

  /** A badge scrolls the page to the start of its year, where the fuse has just reached it. */
  const show = (i: number) => {
    const el = section.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + ((i + 0.08) / count) * (el.offsetHeight - window.innerHeight), behavior: "smooth" });
  };

  return (
    // The pinned frame is the screen below the sticky header (4.5rem and its 2px rule).
    <div className="sticky top-0 hidden h-svh flex-col overflow-hidden pt-[4.625rem] lg:motion-safe:flex">
      <div className="shell grid flex-1 grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] items-center gap-16 py-[clamp(1rem,4svh,3rem)]">
        <div>
          <Headline title={title} />
          <p aria-hidden="true" className="mt-5 font-display text-[clamp(6rem,2rem+9vw,11rem)] leading-[0.9] tracking-[-0.03em] text-brand-ink">
            <DigitRoll value={Number(years[current]?.year ?? 0)} format={String} />
          </p>
        </div>

        {/* As wide as fits: the deck and the two cards tucked up behind it (15% taller in all) between the header and
            the path, which with the grid's padding take about 21rem of the screen. */}
        <ol className="relative mx-auto aspect-[4/3] w-[min(100%,34rem,calc((100svh-21rem)*1.16))]">
          {years.map((y, i) => (
            <li
              key={y.year}
              className={cx("absolute inset-0 transition-[translate,rotate,scale,opacity] duration-700 ease-[cubic-bezier(0.34,1.4,0.64,1)]", pose(i - current))}
            >
              <p className="sr-only">{y.year}</p>
              <YearCard year={y} screen={screen} sizes="544px" fill />
            </li>
          ))}
        </ol>
      </div>

      <div className="shell pb-[clamp(2.75rem,7svh,4.5rem)] pt-[clamp(3.5rem,9svh,5rem)]">
        <Path years={years} current={current} fill={fill} onPick={show} end={end} />
      </div>
    </div>
  );
}

/** The reel: one slide per year, centred, so the first and last can centre too and slide i sits at exactly i/last of
    the row's scroll, which is where the fuse is. A swipe moves one year (`snap-always`), as a native pager does, and
    a sideways overscroll stays in the row rather than paging the browser back. Slide width and the row's side
    padding are in units of the full-bleed wrapper, so the peeks reach the screen's edges. */
function Reel({ title, years, end, screen }: StoryProps) {
  const row = useRef<HTMLOListElement>(null);
  const last = Math.max(1, years.length - 1);
  const [current, setCurrent] = useState(0);
  const { scrollXProgress } = useScroll({ container: row, axis: "x" });
  useMotionValueEvent(scrollXProgress, "change", (p) => setCurrent(Math.min(last, Math.max(0, Math.round(p * last)))));

  const show = (i: number) => {
    const el = row.current;
    if (!el) return;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth";
    el.scrollTo({ left: (i / last) * (el.scrollWidth - el.clientWidth), behavior });
  };

  return (
    <div className="py-[clamp(4rem,2.5rem+5vw,7rem)] lg:motion-safe:hidden">
      <div className="shell text-center">
        <Headline title={title} />
      </div>

      <div className="@container mt-10 sm:mt-12">
        <ol
          ref={row}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-[calc((100cqw-var(--slide))/2)] pb-2 [--slide:min(80cqw,34rem)] pointer-coarse:[scrollbar-width:none]"
        >
          {years.map((y, i) => (
            <li key={y.year} className="flex w-[var(--slide)] shrink-0 snap-center snap-always flex-col items-center">
              <p className={cx("mb-4 rounded-full px-5 py-2 font-display text-[1.5rem] leading-none sm:mb-5", ledgeFills[i % ledgeFills.length])}>{y.year}</p>
              <YearCard year={y} screen={screen} sizes="(min-width: 768px) 544px, 80vw" />
            </li>
          ))}
        </ol>
      </div>

      {/* As wide as a slide, so the first and last badges stand under the card's edges. */}
      <div className="@container mt-[4.5rem] sm:mt-24">
        <div className="mx-auto w-[var(--slide)] [--slide:min(80cqw,34rem)]">
          <Path years={years} current={current} fill={scrollXProgress} onPick={show} />
        </div>
      </div>
      <div className="mt-12 flex justify-center sm:mt-20">
        <End text={end} />
      </div>
    </div>
  );
}

/** A year's photo, or for the year with none, the app as it is now on a brand-green panel. The card is 24px round
    with 10px of padding (12px from sm) and a 2px border, so the picture inside is 12px round (10px). `fill` fits the
    card to the deck's 4:3 box instead of the picture's own 4:3. */
function YearCard({ year, screen, sizes, fill }: { year: Year; screen: Screen; sizes: string; fill?: boolean }) {
  const picture = cx("rounded-[0.75rem] sm:rounded-[0.625rem]", fill ? "h-full" : "aspect-[4/3]");
  return (
    <article className={cx("card w-full overflow-hidden p-2.5 sm:p-3", fill && "h-full shadow-lift")}>
      {year.image ? (
        <Image src={year.image.src} alt={year.image.alt} width={year.image.w} height={year.image.h} sizes={sizes} className={cx("w-full object-cover", picture)} />
      ) : (
        <div className={cx("grid place-items-center overflow-hidden bg-brand", picture)}>
          <div className="w-[36%] translate-y-[20%] rotate-[-4deg]">
            <Phone screen={screen} />
          </div>
        </div>
      )}
    </article>
  );
}

type PathProps = { years: readonly Year[]; current: number; fill: MotionValue<number>; onPick: (i: number) => void; end?: string };

/** The years as badges on a path, a green fuse filled to `fill` (0 to 1) with Tavi riding its tip. Each badge takes
    you to its year. Phones leave the years under the badges to the screen reader, as their slides carry them. Given
    `end`, the path runs on to the journey-continues pill. Pinned, it reaches the screen's bottom right corner when pinned, so the
    floating chat steps aside for it. */
function Path({ years, current, fill, onPick, end }: PathProps) {
  const ride = useMotionTemplate`calc(${fill} * 100cqw - 50%)`;
  // The line runs from the first badge's centre to the last one's: half a badge in from each end.
  const inset = "inset-x-[1.375rem] sm:inset-x-7";
  return (
    <div data-chat-avoid className="flex items-center gap-4">
      <div className="relative flex-1">
        <div className={cx("absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-line", inset)} />
        <motion.div style={{ scaleX: fill }} className={cx("absolute top-1/2 h-1.5 origin-left -translate-y-1/2 rounded-full bg-brand", inset)} />
        {/* Tavi alone moves, by the fill times the line's length (100cqw of the line-long box he stands in), so nothing
            wider than him ever slides past the path's end and widens the page. */}
        <div className={cx("pointer-events-none absolute bottom-[calc(100%-0.25rem)] z-10 @container", inset)}>
          <motion.div style={{ x: ride }} className="absolute bottom-0 left-0 w-14 sm:w-[4.5rem]">
            <Mascot mood={current === years.length - 1 ? "cheer" : "swim"} decorative />
          </motion.div>
        </div>
        <ol className="relative flex justify-between">
          {years.map((y, i) => {
            const reached = i <= current;
            return (
              <li key={y.year} className="relative">
                <button
                  type="button"
                  aria-current={i === current ? "step" : undefined}
                  onClick={() => onPick(i)}
                  className={cx(
                    "ledge grid size-11 place-items-center rounded-full sm:size-14",
                    reached ? ledgeFills[i % ledgeFills.length] : "bg-line text-muted shadow-[0_6px_0_var(--color-line-strong)]",
                  )}
                >
                  <Star4 className="size-4 sm:size-5" />
                  <span className={cx("absolute left-1/2 top-full mt-3.5 -translate-x-1/2 font-display text-body-sm transition-colors duration-300 max-sm:sr-only", reached ? "text-forest" : "text-muted")}>
                    {y.year}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
      {end && (
        <>
          <span aria-hidden="true" className="w-12 border-t-[5px] border-dotted border-line-strong" />
          <End text={end} />
        </>
      )}
    </div>
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
