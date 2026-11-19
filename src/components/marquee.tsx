"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Pause } from "./icons";
import { cx } from "./ui";

type MarqueeProps = {
  label: string;
  items: ReadonlyArray<{ key: string; node: ReactNode }>;
  /** Drift speed in px per second, the same however many items there are. */
  speed?: number;
  /** Visible pause control (WCAG 2.2.2) and a hint, worded per input: mice hover, fingers swipe. */
  hint?: { pointer: string; touch: string };
  tone?: "light" | "dark";
  className?: string;
};

/**
 * The one marquee. The list renders twice; the copy is inert and hidden from
 * assistive tech, and the track moves exactly half its width so the loop is
 * seamless. The loop time comes from the measured width, so the drift speed
 * is constant; until it is measured, and while off screen, the track holds
 * still. Pauses on hover, from its control and from "Pause animations". On
 * touch screens, and with reduced motion, it is a native scrollable row that
 * snaps card by card; with a mouse that row shows its scrollbar.
 */
export function Marquee({ label, items, speed = 40, hint, tone = "light", className }: MarqueeProps) {
  const [paused, setPaused] = useState(false);
  const [loopSeconds, setLoopSeconds] = useState<number | null>(null);
  const [onScreen, setOnScreen] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    const track = trackRef.current;
    if (!frame || !track) return;
    const resized = new ResizeObserver(() => setLoopSeconds(track.scrollWidth / 2 / speed));
    resized.observe(track);
    const seen = new IntersectionObserver(([entry]) => setOnScreen(entry?.isIntersecting ?? false));
    seen.observe(frame);
    return () => {
      resized.disconnect();
      seen.disconnect();
    };
  }, [speed]);

  const drifting = loopSeconds !== null && onScreen && !paused;

  const row = (copy: boolean) =>
    items.map((item) => (
      <li key={`${copy ? "b" : "a"}-${item.key}`} className="shrink-0 pr-4 motion-reduce:snap-start pointer-coarse:snap-start">
        {item.node}
      </li>
    ));

  return (
    <div className={className}>
      <div
        ref={frameRef}
        className="group/marquee overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_6%,#000_94%,transparent)] motion-reduce:snap-x motion-reduce:overflow-x-auto motion-reduce:pointer-fine:pb-3 pointer-coarse:snap-x pointer-coarse:snap-mandatory pointer-coarse:scroll-px-4 pointer-coarse:overflow-x-auto pointer-coarse:overscroll-x-contain pointer-coarse:[mask-image:none] pointer-coarse:[scrollbar-width:none] pointer-coarse:[&::-webkit-scrollbar]:hidden"
      >
        <ul
          ref={trackRef}
          aria-label={label}
          style={loopSeconds === null ? undefined : { animationDuration: `${loopSeconds}s` }}
          className={cx(
            "flex w-max animate-marquee group-hover/marquee:[animation-play-state:paused] motion-reduce:animate-none pointer-coarse:animate-none pointer-coarse:px-4",
            !drifting && "[animation-play-state:paused]",
          )}
        >
          {row(false)}
          <li aria-hidden="true" className="contents motion-reduce:hidden pointer-coarse:hidden">
            <ul className="contents" inert>
              {row(true)}
            </ul>
          </li>
        </ul>
      </div>
      {hint !== undefined && (
        <div className="shell mt-6 flex items-center justify-between gap-4 motion-reduce:pointer-fine:hidden">
          <p className={cx("label", tone === "dark" ? "text-on-forest-muted" : "text-muted")}>
            <span className="pointer-coarse:hidden">{hint.pointer}</span>
            <span className="hidden pointer-coarse:inline">{hint.touch}</span>
          </p>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-pressed={paused}
            aria-label={`Pause ${label}`}
            className={cx(
              "tap label inline-flex min-h-11 items-center gap-2 rounded-full px-4 ring-1 ring-inset motion-reduce:hidden pointer-coarse:hidden",
              tone === "dark"
                ? "text-on-forest ring-on-forest/20 hover:bg-on-forest/10 aria-pressed:bg-on-forest aria-pressed:text-forest"
                : "text-forest ring-forest/15 hover:bg-forest/[0.04] aria-pressed:bg-forest aria-pressed:text-on-forest aria-pressed:ring-forest",
            )}
          >
            <Pause className="size-3" />
            Pause
          </button>
        </div>
      )}
    </div>
  );
}
