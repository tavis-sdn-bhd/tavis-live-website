"use client";

import { Coin } from "../coin";
import { Lock, Shoe, shoePrices } from "../phone-app/screens";
import { BASE_POINTS, looks } from "../phone-app/state";
import { Bar, Camera, Count, type Act, type Rect } from "../stageshow";
import { Student, type Look } from "../student";
import { cx } from "../ui";
import { AppPhone, AppStage, tap, type Design } from "./app-stage";

/*
  BA's rewards row: points spent on the avatar.

  Beats (about 10.5s, played once, then held):
  1. The app's Me screen: the avatar in the pink sweater, the points pill at 3204.
  2. Tap the tudung and baju kurung: the avatar changes (outfits are free in the app).
  3. Tap the 2500 Pts shoes, the shop's cheapest: their lock opens and they are selected.
  4. The camera pushes in on the points pill as it rolls down by the price, 3204 to 704. Hold, pull back, hold.

  It plays once and holds its end, rather than looping: points spent can't come back without a cause the app has
  (no refund), and a loop that bought the shoes again would rewind the total in view.

  Real words only on the avatar's controls (the shoe prices) and the points; the rest is the app's shapes with bars.
  From the source: the looks, the shoe prices (phone-app/screens.tsx, "as listed in the app's avatar shop") and the
  3204 points on the app's Home screenshot. Not from the source, so not shown: the shoes on the avatar (the shop has
  one generic shoe drawing, the avatars their own trainers) and where the real Me screen shows points; the pill here
  is Home's, in the header's right-hand slot.
*/

type S = { look: Look; owned: boolean; points: number; zoom: Rect | null };

/** The shoes bought: the first in the shop, at its listed price. */
const SHOE = 0;
const PRICE = shoePrices[SHOE];

const START: S = { look: "pink", owned: false, points: BASE_POINTS, zoom: null };
const POSTER: S = { look: "green", owned: true, points: BASE_POINTS - PRICE, zoom: null };

/** The screen shows down to 730pt of 874: the shoes and their prices stay in, the tab bar goes. */
const WIDE: Design = { w: 480, phone: 340, top: 40, screen: 730 };
const COMPACT: Design = { w: 358, phone: 290, top: 24, screen: 730 };

const LOOKS = Object.keys(looks) as Look[];
/** The avatar only ever wears the looks the story moves between, so only those are drawn for the cross-fade. */
const WORN = [START.look, POSTER.look];

async function script(a: Act<S>) {
  a.mark("me");
  await tap(a, "look-green", 1800);
  a.mark("outfit");
  a.put({ look: "green" });

  await tap(a, `shoe-${SHOE}`, 2200);
  a.mark("bought");
  a.put({ owned: true });
  await a.wait(500);

  // The camera pushes in on the pill, which rolls down by the price
  // Measured at rest: the layout rect would ignore the phone screen's own scale
  await a.set({ zoom: a.rect("points") });
  await a.wait(950);
  a.mark("spent");
  a.put((s) => ({ points: s.points - PRICE }));
  await a.wait(2300);
  a.put({ zoom: null });
  await a.wait(2000);
}

/** The Me screen as the app draws it, at true points. */
function Me({ s }: { s: S }) {
  return (
    <div className="absolute inset-0 bg-cream pt-[54px]">
      <div className="flex items-center justify-between px-5 pt-3">
        <Bar w={58} h={18} r={9} tone={4} />
        <span data-target="points" className="flex h-[44px] items-center gap-2 rounded-full bg-paper px-2.5 shadow-[0_2px_8px_rgb(0_0_0/0.06)]">
          <Coin />
          <Count value={s.points} format={String} className="font-display text-[19px] text-app-ink" />
        </span>
      </div>
      <div className="relative mt-2 h-[330px]">
        {WORN.map((id) => (
          <div key={id} data-on={id === s.look || undefined} className="ad-look absolute inset-0 grid place-items-center">
            <Student look={id} className="h-[310px] w-auto" />
          </div>
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-0 top-[442px] rounded-t-[32px] bg-paper px-5 pt-5">
        <Bar w={52} h={9} r={4.5} tone={4} />
        <div className="mt-3 grid grid-cols-3 gap-3">
          {LOOKS.map((id) => (
            <div
              key={id}
              data-target={`look-${id}`}
              // The tile crops the avatar at its foot on purpose, as the app's does
              data-crop
              className={cx("ad-tile flex h-[92px] items-start justify-center overflow-hidden rounded-[20px]", id === s.look ? "bg-mint ring-2 ring-brand" : "bg-cream")}
            >
              <Student look={id} className="mt-2 h-[200px] w-auto" />
            </div>
          ))}
        </div>
        <Bar w={46} h={9} r={4.5} tone={4} className="mt-5" />
        <div className="mt-3 grid grid-cols-5 gap-2">
          {shoePrices.map((p, i) => {
            const owned = i === SHOE && s.owned;
            return (
              <span key={i} className="text-center">
                <span
                  data-target={`shoe-${i}`}
                  // Owned: the lock goes and the app's selected ring comes; the circle keeps its grey, so the white shoe still shows
                  className={cx("ad-tile relative mx-auto grid size-[56px] place-items-center rounded-full bg-[#a49a9a]/70", owned && "ring-2 ring-brand ring-offset-2 ring-offset-paper")}
                >
                  <Shoe />
                  <span data-open={owned || undefined} className="ad-lock absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-sun-ledge">
                    <Lock />
                  </span>
                </span>
                <span className="mt-1.5 block text-[11px] leading-[1.3] text-app-ink">{p} Pts</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function AvatarDemo() {
  return (
    <AppStage<S>
      label={`The Tavis app on a phone: a new outfit for the avatar, then shoes bought for ${PRICE} points.`}
      wide={WIDE}
      compact={COMPACT}
      initial={START}
      poster={POSTER}
      script={script}
      play="once"
      rest={{ wide: { x: 240, y: 330 }, compact: { x: 179, y: 280 } }}
    >
      {(s, _rect, d) => (
        // 1.6×, not 2×: the avatar stays in the shot beside the pill
        <Camera focus={s.zoom} max={1.6} duration={900}>
          <AppPhone d={d}>
            <Me s={s} />
          </AppPhone>
        </Camera>
      )}
    </AppStage>
  );
}
