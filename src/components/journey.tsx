"use client";

import { Image } from "@/components/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import type { Screen } from "@/lib/content";
import { useMediaQuery } from "@/lib/use-media-query";
import { Star4 } from "./icons";
import { Phone } from "./phone";
import { cx } from "./ui";

type Year = {
  readonly year: string;
  readonly image: { readonly src: string; readonly alt: string; readonly w: number; readonly h: number } | null;
};

type JourneyProps = {
  years: readonly Year[];
  end: string;
  screen: Screen;
};

/** Where the shell's content starts: its centring margin plus its gutter, so the first card sits under the logo.
    `page` is the page's width as the caller can name it. A padding takes "100%", the pinned frame's own width, which
    leaves a scrollbar out as the shell does; a height has only "100vw". */
const lead = (page: "100%" | "100vw") => `(max(0px, (${page} - 78rem) / 2) + clamp(1rem, 0.4rem + 2.6vw, 2.5rem))`;

/**
 * How far the pinned track travels, in CSS: its fixed-width cards and padding
 * minus the viewport. The section height comes from this, so server HTML
 * already has the right height and nothing jumps on hydration.
 */
const travel = (years: number) => `max(0px, ${lead("100vw")} + ${years} * 31.25rem + 16rem + 10vw - 100vw)`;

/**
 * On desktop the section pins and vertical scroll drives the track sideways;
 * the section is made as tall as the horizontal overflow so the last card
 * lands as the pin releases. Elsewhere, and with reduced motion, it is a plain
 * vertical list. The layout switch is CSS (`lg:motion-safe:` variants), so server
 * and client markup match; JS only measures the exact travel and moves the track.
 */
export function Journey({ years, end, screen }: JourneyProps) {
  const headingId = useId();
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const pinned = useMediaQuery("(min-width: 1024px) and (prefers-reduced-motion: no-preference)");
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!pinned || !track || !viewport) {
      setDistance(0);
      return;
    }
    const measure = () => setDistance(Math.max(0, track.scrollWidth - viewport.clientWidth));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [pinned]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, (p) => -p * distance);
  const rail = useTransform(scrollYProgress, [0, 1], [0.04, 1]);
  const height: CSSProperties & Record<`--${string}`, string> = { "--journey-travel": travel(years.length), "--journey-lead": `calc${lead("100%")}` };

  return (
    <section
      id="journey"
      data-screen="own"
      data-tavi="grow"
      ref={sectionRef}
      aria-labelledby={headingId}
      style={height}
      className="relative lg:motion-safe:h-[calc(100svh+var(--journey-travel))]"
    >
      <h2 id={headingId} className="sr-only">
        Our journey
      </h2>
      <div
        ref={viewportRef}
        // The pinned frame is the screen below the sticky header (html scroll-padding-top), so the cards centre in what shows.
        className="shell section-y lg:motion-safe:sticky lg:motion-safe:top-0 lg:motion-safe:flex lg:motion-safe:h-svh lg:motion-safe:max-w-none! lg:motion-safe:flex-col lg:motion-safe:justify-center lg:motion-safe:overflow-hidden lg:motion-safe:px-0! lg:motion-safe:pb-0! lg:motion-safe:pt-[5.5rem]!"
      >
        <div aria-hidden="true" className="shell mb-10 hidden lg:motion-safe:block">
          <div className="relative h-1 overflow-hidden rounded-full bg-forest/10">
            <motion.div style={{ scaleX: rail }} className="absolute inset-0 origin-left rounded-full bg-brand" />
          </div>
          <div className="mt-3 flex justify-between font-display text-body-sm text-muted">
            {years.map((y) => (
              <span key={y.year}>{y.year}</span>
            ))}
          </div>
        </div>

        <motion.ol
          ref={trackRef}
          style={{ x }}
          className={cx(
            "flex flex-col gap-5 border-l-2 border-line pl-6 sm:pl-8",
            "lg:motion-safe:w-max lg:motion-safe:flex-row lg:motion-safe:items-stretch lg:motion-safe:border-l-0 lg:motion-safe:pl-[var(--journey-lead)] lg:motion-safe:pr-[10vw]",
          )}
        >
          {years.map((y, i) => (
            <li
              key={y.year}
              className={cx(
                "relative before:absolute before:-left-[calc(1.5rem+7px)] before:top-3 before:size-3 before:rounded-full before:bg-brand before:ring-4 before:ring-paper sm:before:-left-[calc(2rem+7px)]",
                "lg:motion-safe:w-[30rem] lg:motion-safe:shrink-0 lg:motion-safe:before:hidden",
              )}
            >
              <article
                className={cx(
                  "card flex h-full flex-col overflow-hidden",
                  i === years.length - 1 && "bg-mint!",
                )}
              >
                <div className="p-6 pb-0 sm:p-7 sm:pb-0">
                  <p className="font-display text-[2.5rem] leading-none tracking-[-0.04em] text-forest sm:text-[3.25rem]">{y.year}</p>
                </div>
                <div className="mt-5 flex-1 p-3 pt-0 sm:mt-6">
                  {y.image ? (
                    <Image
                      src={y.image.src}
                      alt={y.image.alt}
                      width={y.image.w}
                      height={y.image.h}
                      sizes="(min-width: 1024px) 460px, 90vw"
                      className="aspect-[4/3] w-full rounded-[1.25rem] object-cover"
                    />
                  ) : (
                    <div className="grid aspect-[4/3] place-items-center overflow-hidden rounded-[1.25rem] bg-brand">
                      <div className="w-[38%] translate-y-[18%] rotate-[-4deg]">
                        <Phone screen={screen} />
                      </div>
                    </div>
                  )}
                </div>
              </article>
            </li>
          ))}
          <li className="grid place-items-center py-4 lg:motion-safe:w-64 lg:motion-safe:shrink-0 lg:motion-safe:py-0">
            <p className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-3 font-display text-on-forest">
              <Star4 className="size-4 text-sun" />
              {end}
            </p>
          </li>
        </motion.ol>
      </div>
    </section>
  );
}
