"use client";

import { learningCard as card } from "@/lib/questions";
import { NormalFlora } from "../normal-flora";
import { Bar, type Act } from "../stageshow";
import { cx } from "../ui";
import { AppPhone, AppStage, tap, type Design } from "./app-stage";

/*
  BA's Learning Cards row: swipe on to the next card, then save it.

  Beats (about 7s, played once, then held):
  1. F5 Sains chapter 1, card 1 of 29, as the client's screenshot draws the deck.
  2. Swipe up: the card leaves the way the finger threw it, card 2, "Flora normal", rises into its place, and the
     count, the cards left and the progress bar step on.
  3. Tap the heart: it fills and pops. Hold.

  Played once and held: a card read and a card saved stay that way, and the saved card 2 is the still.

  Real words: the header, the chapter line, the count and card 2. Card 1 is the app's shapes with bars, as nothing in
  the source says what it holds. From the source: card 2 and its diagram (the client's screenshot).
*/

type S = { saved: boolean; index: number };

const START: S = { saved: false, index: card.index - 1 };
const POSTER: S = { saved: true, index: card.index };

/** The screen shows down to 760pt of 874: the card's words stay in; its foot and the next card go. */
const WIDE: Design = { w: 480, phone: 340, top: 40, screen: 760 };
const COMPACT: Design = { w: 358, phone: 290, top: 24, screen: 760 };
const REST = { wide: { x: 240, y: 380 }, compact: { x: 179, y: 320 } } as const;

const orange = "#e69522";

async function script(a: Act<S>) {
  a.mark("card1");
  await a.wait(1300);
  // A swipe up from the card's lower half, thrown off its top
  await a.move("swipe-from", { duration: 280 });
  await a.drag("swipe-to", undefined, { duration: 260 });
  a.put({ index: card.index });
  a.mark("card2");
  await tap(a, "heart", 1900);
  a.put({ saved: true });
  a.mark("saved");
  await a.wait(2400);
}

function Heart({ on }: { on: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" strokeWidth="1.6" className={cx("transition-[fill,stroke,scale] duration-200", on ? "scale-110 fill-coral stroke-coral" : "fill-none stroke-[#a5aaad]")}>
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
    </svg>
  );
}

function Cards({ s }: { s: S }) {
  const moved = s.index >= card.index;
  return (
    <div className="absolute inset-0 bg-[#f5f5f5] pt-[54px] font-normal">
      <div className="flex h-[52px] items-center gap-3 px-4 text-[#252d3a]">
        <span className="grid size-10 place-items-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
        </span>
        <span className="text-[20px]">
          {card.chapter}. {card.chapterTitle}
        </span>
        <span className="ml-auto flex rounded-full bg-[#eef0f4] p-[3px] text-[15px] font-medium">
          <span className="px-[14px] py-[5px] text-[#4a5263]">EN</span>
          <span className="rounded-full px-[14px] py-[5px] text-white" style={{ background: orange }}>
            BM
          </span>
        </span>
      </div>
      <div className="px-[21px]">
        <p className="text-[12px] font-bold uppercase leading-[1.2] tracking-[0.12em]" style={{ color: orange }}>
          {card.form} {card.subject} · {card.formName} · Chapter {card.chapter}
        </p>
        <div className="mt-px flex justify-between text-[14px] leading-[1.3]">
          <span className="text-[#3d4552]">
            Card {s.index} of {card.total}
          </span>
          <span className="text-app-muted">{card.total - s.index} left</span>
        </div>
        <div className="mt-2 h-[5px] rounded-full bg-[#ecebf0]">
          <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${(s.index / card.total) * 100}%`, background: orange }} />
        </div>
      </div>
      <div className="relative mx-[21px] mt-4 h-[640px]">
        {/* Card 2 waits a gap under card 1 and rises into its place */}
        <div data-on={moved || undefined} className="ad-card-next absolute inset-0 rounded-[28px] bg-paper px-4 pt-[64px]">
          <span data-target="heart" className="ad-tile absolute right-6 top-6 grid">
            <Heart on={s.saved} />
          </span>
          <NormalFlora className="block h-auto w-full" />
          <p lang="ms" className="mt-8 px-2 text-[28px] font-semibold leading-[1.2] tracking-[-0.01em] text-[#252d3a]">
            {card.title}
          </p>
          <p lang="ms" className="mt-3 px-2 text-[17px] leading-[1.6] text-[#5b6270]">
            {card.body}
          </p>
        </div>
        <div data-gone={moved || undefined} className="ad-card absolute inset-0 rounded-[28px] bg-paper px-6 pt-[64px]">
          <span className="absolute right-6 top-6">
            <Heart on={false} />
          </span>
          <div className="h-[210px] rounded-[18px] bg-[#f2f3f5]" />
          <div className="mt-8 grid gap-3 px-2">
            <Bar w={170} h={18} r={9} tone={4} />
            <Bar w="92%" h={10} r={5} tone={2} />
            <Bar w="84%" h={10} r={5} tone={2} />
            <Bar w="58%" h={10} r={5} tone={2} />
          </div>
          <span data-target="swipe-from" className="absolute bottom-[120px] left-1/2 size-px" />
          <span data-target="swipe-to" className="absolute left-1/2 top-[60px] size-px" />
        </div>
      </div>
    </div>
  );
}

export function CardDemo() {
  return (
    <AppStage<S>
      label="The Tavis app on a phone: a swipe moves on to the next Form 5 Science Learning Card, which is then saved."
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
          <Cards s={s} />
        </AppPhone>
      )}
    </AppStage>
  );
}
