"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { q17, q17Answer } from "@/lib/questions";
import { Bacteriophage } from "../bacteriophage";
import { Coin } from "../coin";
import { Close } from "../icons";
import { Mascot, type Mood } from "../mascot";
import { Mark, Pencil } from "../phone-app/screens";
import { BASE_POINTS } from "../phone-app/state";
import { Bar, Camera, Count, Fly, type Act, type Rect } from "../stageshow";
import { cx } from "../ui";
import { AppPhone, AppStage, tap, type Design } from "./app-stage";

/*
  BA's practice row: one question, answered wrong, then right.

  Beats (about 10s, a loop):
  1. The Form 5 Science question, the bacteriophage, on screen.
  2. Tap A, Sfera: it marks red and shakes, the app's own "Not quite" drawer rises with the answer, the question
     scrolls up with it so both options stay in view. Tavi (beside, from lg) is sad.
  3. Tap D, Kompleks: it marks green, the "Correct Answer, +10 points" drawer takes the other's place. Tavi cheers.
  4. The camera pushes in on the points pill; a coin buds off the drawer's coin and flies into it; 3204 rolls to
     3214. Hold.
  5. The camera crosses back down to the answers, which takes the pill out of shot. The answer undoes in place, last
     change first, and the total goes back to 3204 there, unseen; the camera pulls back on the opening frame. The app
     pays a question once, so a loop that kept the points would pay it again every time; and data never rewinds in
     view, so the reset happens off camera.

  Real words only where the story is: the stem, options A and D, the two drawers and the points. The rest is the
  app's shapes with bars. Deviation from the app (the clone): a wrong pick there locks the options and marks D at
  once; here D stays open after the wrong pick, so the right tap can follow on the same screen.
*/

type Drawer = "none" | "wrong" | "right";
type FlyState = { from: Rect; to: Rect; go: boolean } | null;

type S = {
  /** A marked wrong, D marked right: kept apart from the drawer so the reset can undo them one at a time. */
  a: boolean;
  d: boolean;
  drawer: Drawer;
  points: number;
  fly: FlyState;
  zoom: Rect | null;
  mood: Mood;
};

const START: S = { a: false, d: false, drawer: "none", points: BASE_POINTS, fly: null, zoom: null, mood: "idle" };
const POSTER: S = { a: true, d: true, drawer: "right", points: BASE_POINTS + q17.reward, fly: null, zoom: null, mood: "cheer" };

/** The screen shows down to 812pt of 874: the drawers' words stay in with room under them; their button row and the
    home indicator go. The drawers are pinned to the screen's foot, so this is as deep as the crop can go (8%). */
const WIDE: Design = { w: 480, phone: 340, top: 40, screen: 812 };
const COMPACT: Design = { w: 358, phone: 290, top: 24, screen: 812 };

/** Where the finger waits between loops. */
const REST = { wide: { x: 240, y: 360 }, compact: { x: 179, y: 300 } } as const;

/** Clear space between the answer and the top of a drawer. */
const DRAWER_GAP = 16;

async function script(a: Act<S>) {
  a.mark("question");
  // Where the answers sit at rest, for the camera's last move: measured with no drawer up (it scrolls them) and the
  // camera still (from the second loop on, it spends the first second pulling back)
  await a.wait(1000);
  const answers = a.rect("answers");
  await tap(a, "opt-A", 300);
  a.mark("wrong");
  a.put({ a: true, drawer: "wrong", mood: "sad" });

  // Time to read the drawer, then the right one
  await tap(a, "opt-D", 3000);
  a.mark("right");
  a.put({ d: true, drawer: "right", mood: "cheer" });
  await a.wait(750);

  // The camera pushes in on the pill as a coin buds off the drawer's coin and flies into it
  const from = a.rect("reward");
  const to = a.rect("pill-coin");
  await a.set({ fly: { from, to, go: false }, zoom: a.rect("pill") });
  await a.wait(350);
  a.mark("coin");
  a.put({ fly: { from, to, go: true } });
  await a.wait(760);
  // Landed on the pill's own coin: the flyer goes as the total rolls up
  a.put({ fly: null, points: BASE_POINTS + q17.reward });
  a.mark("paid");
  await a.wait(1500);

  // Back down to the answers, which leaves the pill out of shot
  a.put({ zoom: answers });
  await a.wait(1000);
  // Undo the answer in place, the last change first. The total goes back with it, out of shot (its roll ends before
  // the camera pulls back): the next loop answers the question again, which the app would not pay twice
  a.mark("reset");
  a.put({ drawer: "none", mood: "idle" });
  await a.wait(90);
  a.put({ d: false });
  await a.wait(90);
  a.put({ a: false, points: BASE_POINTS });
  await a.wait(800);
  a.put({ zoom: null });
  // The finger goes back where the loop starts it (unseen: touch draws only where it lands)
  await a.move(REST[a.layout], { duration: 200 });
}

function Option({ state, name, children }: { state: "idle" | "wrong" | "right"; name: string; children: ReactNode }) {
  return (
    <div
      data-target={name}
      data-shake={state === "wrong" || undefined}
      className={cx(
        "ad-option relative flex min-h-[54px] items-center justify-between gap-3 rounded-[18px] pl-5 pr-[13px] font-display text-[17px]",
        state === "idle" && "bg-paper text-app-ink shadow-[0_2px_8px_rgb(0_0_0/0.05)]",
        state === "wrong" && "bg-wrong-soft text-wrong-ink ring-2 ring-wrong/60",
        state === "right" && "bg-correct-soft text-correct-ink ring-2 ring-brand",
      )}
    >
      {children}
      {state !== "idle" && <Mark ok={state === "right"} className="size-7 shrink-0" />}
    </div>
  );
}

/** A filler option: the app's shell, a bar for its words. */
function Filler({ w }: { w: number }) {
  return (
    <div className="flex min-h-[54px] items-center rounded-[18px] bg-paper pl-5 shadow-[0_2px_8px_rgb(0_0_0/0.05)]">
      <Bar w={w} h={9} r={4.5} tone={3} />
    </div>
  );
}

/** The question as the app draws it, at true points. */
function Question({ s }: { s: S }) {
  const answer = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const wrong = useRef<HTMLDivElement>(null);
  const right = useRef<HTMLDivElement>(null);
  const [scroll, setScroll] = useState(0);
  // With a drawer up, scroll the question so the answer sits whole above it, a clear gap under it
  useLayoutEffect(() => {
    const d = answer.current;
    const b = box.current;
    const sheet = { none: null, wrong: wrong.current, right: right.current }[s.drawer];
    if (!d || !b) return;
    setScroll(sheet ? Math.max(0, d.offsetTop + d.offsetHeight + DRAWER_GAP - (b.clientHeight - sheet.offsetHeight)) : 0);
  }, [s.drawer]);

  const pill = "flex h-[40px] items-center rounded-full bg-brand shadow-[0_3px_0_var(--color-brand-ledge)]";
  return (
    <div className="absolute inset-0 bg-cream">
      {/* The quiz bar stays put; the question scrolls in its own box under it */}
      <div className="absolute inset-x-0 top-0 z-10 pt-[54px]">
        <div className="flex h-[60px] items-center gap-2 px-4">
          <span className="grid size-10 place-items-center rounded-full border-2 border-line-strong text-app-muted">
            <Close className="size-3.5" />
          </span>
          <div data-target="pill" className={cx(pill, "ml-auto gap-2 pl-3.5 pr-1.5")}>
            <Count value={s.points} format={String} className="font-display text-[17px] text-forest" />
            <span data-target="pill-coin" className="grid">
              <Coin size={28} />
            </span>
          </div>
          <div className={cx(pill, "gap-1.5 px-3")}>
            <Pencil />
            <span className="grid gap-[5px]">
              <Bar w={30} h={8} r={4} tone={4} />
              <Bar w={22} h={5} r={2.5} tone={4} />
            </span>
          </div>
        </div>
      </div>

      <div ref={box} data-lifted={scroll > 0 || undefined} className="ad-scrollbox absolute inset-x-0 bottom-0 top-[114px] overflow-hidden">
        <div className="ad-scroll px-5" style={{ transform: `translateY(${-scroll}px)` }}>
          <Bar w={118} h={12} r={6} tone={4} />
          <div className="mt-3 h-[8px] rounded-full bg-line">
            <div className="h-full rounded-full bg-brand-ink" style={{ width: `${(q17.number / q17.of) * 100}%` }} />
          </div>
          <p lang="ms" className="mt-5 font-display text-[19px] leading-[1.3] text-app-ink">
            {q17.stem.ms}
          </p>
          <div className="mt-3 grid gap-2">
            <Bar w="94%" h={9} r={4.5} tone={2} />
            <Bar w="68%" h={9} r={4.5} tone={2} />
          </div>
          <div className="mt-4 grid place-items-center rounded-[22px] bg-line py-3">
            <div className="rounded-lg bg-paper p-3">
              <Bacteriophage className="h-[166px] w-auto" />
            </div>
          </div>
          <div data-target="answers" className="mt-4 grid gap-3.5">
            <Option name="opt-A" state={s.a ? "wrong" : "idle"}>
              <span>
                A. <span lang="ms">{q17.options[0].ms}</span> / {q17.options[0].en}
              </span>
            </Option>
            <Filler w={136} />
            <Filler w={168} />
            <div ref={answer}>
              <Option name="opt-D" state={s.d ? "right" : "idle"}>
                <span>
                  D. <span lang="ms">{q17Answer.ms}</span> / {q17Answer.en}
                </span>
              </Option>
            </div>
          </div>
        </div>
      </div>

      {/* The answer drawers, as in the app. Their button row sits under the crop, so it is left out; its room stays */}
      <div ref={wrong} data-open={s.drawer === "wrong" || undefined} className="ad-drawer absolute inset-x-0 bottom-0 z-30 rounded-t-[28px] bg-wrong-soft px-5 pb-9 pt-[35px]">
        <p className="text-center font-display text-[26px] leading-[1.25] text-wrong-ink">Not quite</p>
        <p className="mt-1 text-balance text-center font-display text-[19px] leading-[1.3] text-app-ink">
          The answer is {q17Answer.key}. <span lang="ms">{q17Answer.ms}</span> / {q17Answer.en}
        </p>
        <div className="mt-5 h-[56px]" />
      </div>
      <div ref={right} data-open={s.drawer === "right" || undefined} className="ad-drawer absolute inset-x-0 bottom-0 z-30 rounded-t-[28px] bg-correct-soft px-5 pb-9 pt-[35px]">
        <p className="text-center font-display text-[26px] leading-[1.25] text-correct-ink">Correct Answer</p>
        <p className="mt-1 flex items-center justify-center gap-2 font-display text-[19px] leading-[1.3] text-app-ink">
          <span data-target="reward" className="grid">
            <Coin size={26} />
          </span>
          +{q17.reward} points
        </p>
        <div className="mt-5 h-[56px]" />
      </div>
    </div>
  );
}

/** Reports Tavi's mood out of the stage, where Tavi stands: the stage masks everything inside it. */
function MoodOut({ mood, onMood }: { mood: Mood; onMood: (m: Mood) => void }) {
  useLayoutEffect(() => onMood(mood), [mood, onMood]);
  return null;
}

export function PracticeDemo() {
  // The stage's first frame is its poster (server included), so Tavi starts in the poster's mood
  const [mood, setMood] = useState<Mood>(POSTER.mood);
  return (
    <AppStage<S>
      label="The Tavis app on a phone: a Form 5 Science question answered wrong, then right, for 10 points."
      wide={WIDE}
      compact={COMPACT}
      initial={START}
      poster={POSTER}
      script={script}
      rest={REST}
      beside={<Mascot mood={mood} outfit="science" follow decorative className="pointer-events-none absolute -bottom-3 right-full -mr-12 w-[190px] max-lg:hidden" />}
    >
      {(s, _rect, d) => (
        <>
          <MoodOut mood={s.mood} onMood={setMood} />
          {/* A tighter pad and feather than the kit's, so framing the answers takes the pill clear out of shot at 390 too,
              with the answers still clear of the soft edge */}
          <Camera focus={s.zoom} max={2} pad={20} feather={16} duration={900}>
            <AppPhone d={d}>
              <Question s={s} />
            </AppPhone>
            {s.fly && (
              <Fly from={s.fly.from} to={s.fly.to} go={s.fly.go} held duration={760}>
                <Coin size={s.fly.from.width} />
              </Fly>
            )}
          </Camera>
        </>
      )}
    </AppStage>
  );
}
