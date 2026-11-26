"use client";

import { q6 } from "@/lib/questions";
import { Close } from "../icons";
import { Mark, Pencil } from "../phone-app/screens";
import { BASE_POINTS } from "../phone-app/state";
import { Coin } from "../coin";
import { Bar, type Act } from "../stageshow";
import { cx } from "../ui";
import { AppPhone, AppStage, tap, type Design } from "./app-stage";

/*
  BA's explanations row: a wrong answer, why it is wrong, then the right one.

  Beats (about 9s, played once, then held):
  1. Question 6 on the app's answer sheet, as the client's screenshot draws it.
  2. Tap D: it marks red, and the "Why D is wrong:" box comes in under it, closed.
  3. Tap Show Explanation: the box opens on the explanation, and the button turns to Hide.
  4. Tap A: it marks green. Hold.

  Played once and held: an answer can't be taken back in the app, so a loop would have to unpick it in view.

  Real words: the Malay stem, options A and D, the box's heading and button, and the Malay explanation. The English
  stem and options B and C are bars. From the source: q6 and its explanation (lib/questions.ts) and the sheet's
  look (the client's screenshot of Question 4). Deviation: the screenshot's sheet shows both answers marked at once;
  here they are picked in turn, so the story has a cause for each.
*/

type S = { wrong: boolean; why: "none" | "closed" | "open"; right: boolean };

const START: S = { wrong: false, why: "none", right: false };
const POSTER: S = { wrong: true, why: "open", right: true };

/** The screen shows down to 800pt of 874: the open explanation ends above the crop; the home indicator goes. */
const WIDE: Design = { w: 480, phone: 340, top: 40, screen: 800 };
const COMPACT: Design = { w: 358, phone: 290, top: 24, screen: 800 };
const REST = { wide: { x: 240, y: 360 }, compact: { x: 179, y: 300 } } as const;

async function script(a: Act<S>) {
  a.mark("question");
  await tap(a, "opt-D", 1500);
  a.put({ wrong: true, why: "closed" });
  a.mark("wrong");
  await tap(a, "show", 1600);
  a.put({ why: "open" });
  a.mark("explained");
  await tap(a, "opt-A", 3400);
  a.put({ right: true });
  a.mark("right");
  await a.wait(1800);
}

// Room kept for the mark from the start, so an option never rewraps when it is marked
const option = "ad-option flex min-h-[50px] w-full items-center justify-between gap-3 rounded-[14px] border-2 py-[11px] pl-4 pr-[13px] text-[15px] leading-[1.3]";
const idle = "border-[#e6e8eb] bg-paper text-[#273037]";

function Sheet({ s }: { s: S }) {
  const pill = "flex h-[40px] items-center rounded-full bg-[#4f9e5f]";
  return (
    <div className="absolute inset-0 bg-[#7d7f7e] font-normal">
      {/* The quiz bar, dimmed under the sheet */}
      <div className="flex h-[114px] items-end gap-2 px-4 pb-[14px] opacity-70">
        <span className="grid size-10 place-items-center rounded-full border-2 border-white/60 text-white/80">
          <Close className="size-3.5" />
        </span>
        <div className={cx(pill, "ml-auto gap-2 pl-3.5 pr-1.5")}>
          <span className="font-display text-[17px] text-white/90">{BASE_POINTS}</span>
          <Coin size={28} />
        </div>
        <div className={cx(pill, "gap-1.5 px-3")}>
          <Pencil />
          <Bar w={30} h={8} r={4} tone={4} />
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 top-[128px] rounded-t-[28px] bg-paper px-5 pt-6">
        <p className="text-[17px] font-light tracking-[0.02em] text-[#273037]">Question {q6.number}</p>
        <p lang="ms" className="mt-1 text-[17px] font-medium leading-[1.32] text-[#273037]">
          {q6.stem.ms}
        </p>
        <div className="mt-2 grid gap-2">
          <Bar w="96%" h={9} r={4.5} tone={2} />
          <Bar w="70%" h={9} r={4.5} tone={2} />
        </div>
        <div className="mt-4 grid gap-[10px]">
          <div data-target="opt-A" className={cx(option, s.right ? "border-[#5cb85c] bg-[#e1f7e0] text-[#2f7a3a]" : idle)}>
            <span>
              {q6.right.key}. <span lang="ms">{q6.right.ms}</span>
            </span>
            <Mark ok className={cx("size-7 shrink-0 transition-opacity duration-150", !s.right && "opacity-0")} />
          </div>
          {[150, 126].map((w) => (
            <div key={w} className={cx(option, idle)}>
              <Bar w={w} h={9} r={4.5} tone={3} />
            </div>
          ))}
          <div data-target="opt-D" data-shake={s.wrong || undefined} className={cx(option, s.wrong ? "border-[#e5484d] bg-[#feebf1] text-[#d23c3c]" : idle)}>
            <span>
              {q6.wrong.key}. <span lang="ms">{q6.wrong.ms}</span>
            </span>
            <Mark ok={false} className={cx("size-7 shrink-0 transition-opacity duration-150", !s.wrong && "opacity-0")} />
          </div>
          {/* "Why D is wrong": in under the answer once it is marked, closed, then open on the explanation */}
          <div data-on={s.why !== "none" || undefined} className="ad-reveal">
            <div className="overflow-hidden">
              <div className="rounded-[14px] border-2 border-[#ffe3e3] px-4 py-3">
                <p className="flex items-center gap-2 text-[16px] text-[#d23c3c]">
                  <span className="grid size-[18px] place-items-center rounded-full border-[1.5px] border-current text-[11px] leading-none">i</span>
                  Why {q6.wrong.key} is wrong:
                </p>
                {/* A fixed width: "Show" and "Hide" differ, and the chevron must only turn, not shift */}
                <span data-target="show" className="ad-tile mt-3 flex h-[44px] w-[196px] items-center justify-between rounded-[12px] border-[1.5px] border-[#a9adb3] px-4 text-[15px] text-[#d23c3c]">
                  {s.why === "open" ? "Hide Explanation" : "Show Explanation"}
                  <svg width="14" height="8" viewBox="0 0 14 8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cx("transition-transform duration-200", s.why === "open" && "rotate-180")}>
                    <path d="M1 1l6 6 6-6" />
                  </svg>
                </span>
                <div data-on={s.why === "open" || undefined} className="ad-reveal ad-reveal-late">
                  <div className="overflow-hidden">
                    <p lang="ms" className="pt-3 text-[13.5px] leading-[1.45] text-[#5b6270]">
                      {q6.why.ms}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ExplanationDemo() {
  return (
    <AppStage<S>
      label="The Tavis app on a phone: a wrong answer is marked, its explanation opens, then the right answer is picked."
      wide={WIDE}
      compact={COMPACT}
      initial={START}
      poster={POSTER}
      script={script}
      play="once"
      rest={REST}
    >
      {(s, _rect, d) => (
        <AppPhone d={d}>
          <Sheet s={s} />
        </AppPhone>
      )}
    </AppStage>
  );
}
