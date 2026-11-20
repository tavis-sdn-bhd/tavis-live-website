"use client";

import { useCallback, useState, type ReactNode } from "react";
import { useMotionPaused } from "../motion-pause";
import { Phone, Stage, type Act, type Layout, type Point, type Rect, type Script } from "../stageshow";
import "./app-demos.css";

/*
  What BA's app demos share, so they read as one product: one tile, one phone, one touch finger, one type setting,
  the same paused and reduced-motion behaviour.

  Framing (Stageshow's phone-touch): a tile in the app's mint, the phone pinned a gutter from its top, centred, and
  running off the bottom. Each design names how much of the 874pt screen shows (`screen`); the crop falls below
  everything the story touches.
*/

/** The kit phone: a 402pt screen inside a 13pt band and glass each side. */
const SCREEN_W = 402;
const EDGE = 13;

/** One composition: stage width, phone width, the gutter over the phone, and how far down its screen shows (pt). */
export type Design = { w: number; phone: number; top: number; screen: number };

const scaleOf = (d: Design) => d.phone / (SCREEN_W + EDGE * 2);
const heightOf = (d: Design) => Math.round(d.top + (d.screen + EDGE) * scaleOf(d));

/** Travel the finger needs before it lands. Unseen (touch draws only the landing), so it runs inside the hold. */
const REACH = 280;

/** Hold for `ms`, then tap `name`: the finger reaches the target during the last of the hold. */
export async function tap<S>(a: Act<S>, name: string, ms: number) {
  await a.wait(Math.max(0, ms - REACH));
  await a.move(name, { duration: REACH });
  await a.click();
}

type AppStageProps<S> = {
  /** What the demo shows, for screen readers: the stage is a picture. */
  label: string;
  wide: Design;
  compact: Design;
  initial: S;
  /** The payoff, held as the still for reduced motion, the site's pause control and screenshots. A `once` demo also
      holds it after it has played, so it must equal the state its script ends on. */
  poster: S;
  script: Script<S>;
  play?: "loop" | "once";
  /** Where the finger waits (it isn't drawn there). */
  rest: { wide: Point; compact: Point };
  children: (s: S, rect: (name: string) => Rect, d: Design, layout: Layout) => ReactNode;
  /** Beside the stage, outside its mask: a satellite such as Tavi. */
  beside?: ReactNode;
};

export function AppStage<S extends object>({ label, wide, compact, initial, poster, script, play = "loop", rest, children, beside }: AppStageProps<S>) {
  const paused = useMotionPaused();
  // The Stage starts a fresh scene whenever its script or layout changes (pausing and resuming, a resize across the
  // compact design). A played `once` demo must not buy the shoes again, so once it ends it drops its script and holds
  // the poster, which is its end state.
  const [played, setPlayed] = useState(false);
  const once = useCallback(
    async (a: Act<S>) => {
      await script(a);
      setPlayed(true);
    },
    [script],
  );
  const run = paused || played ? undefined : play === "once" ? once : script;
  return (
    <div className="ad relative mx-auto w-full max-w-[480px]" role="img" aria-label={label}>
      <Stage<S>
        width={wide.w}
        height={heightOf(wide)}
        compact={{ below: 420, width: compact.w, height: heightOf(compact) }}
        initial={initial}
        poster={poster}
        // The site's "Pause animations" holds the poster, as reduced motion does
        script={run}
        play={play}
        cursor={{ at: rest, style: "touch" }}
      >
        {(s, rect, layout) => children(s, rect, layout === "compact" ? compact : wide, layout)}
      </Stage>
      {beside}
    </div>
  );
}

/** The phone, pinned and centred, with the app inside it: a picture of the app, so nothing in it takes focus or speaks. */
export function AppPhone({ d, children }: { d: Design; children: ReactNode }) {
  return (
    <Phone width={d.phone} className="ad-phone" data-chat-avoid style={{ top: d.top, left: (d.w - d.phone) / 2 }}>
      <div className="ad-app" inert aria-hidden="true">
        {children}
      </div>
    </Phone>
  );
}
