"use client";

import { Coin } from "../coin";
import { Shoe, shoePrices } from "../phone-app/screens";
import { ShopArrow, ShopHeader, ShopHint, ShopItem, ShopPill, ShopPrice, hijabs, shopTabs, type ShopTab } from "../phone-app/shop";
import { BASE_POINTS } from "../phone-app/state";
import { Camera, Count, type Act, type Rect } from "../stageshow";
import { Student, type Look } from "../student";
import type { ReactNode } from "react";
import { AppPhone, AppStage, tap, type Design } from "./app-stage";

/*
  BA's rewards row: points spent on the avatar.

  Beats (about 12s, played once, then held):
  1. The app's avatar editor on its Hijab tab: the student in her pink sweater, the points pill at 3204.
  2. Tap the sage tudung and baju kurung, already hers: the avatar changes.
  3. Tap Shoes: the shoe shop. Tap the 2500 Pts pair, the cheapest: their padlock opens and they are selected.
  4. The camera pushes in on the points pill as it rolls down by the price, 3204 to 704. Hold, pull back, hold.

  It plays once and holds its end, rather than looping: points spent can't come back without a cause the app has
  (no refund), and a loop that bought the shoes again would rewind the total in view.

  The editor is drawn to the client's screenshots of it (phone-app/shop.tsx): back and Save, the hint (bars here),
  the category pills, the Hijab tab's five outfits at their listed prices, the sage one unlocked. Real words only on
  the pills, prices and points. From the source: the hijab prices and which one is owned (the screenshots), the shoe
  prices (phone-app/screens.tsx, "as listed in the app's avatar shop") and the 3204 points on the app's Home
  screenshot. Not from the source, so placed by choice: the points pill, which the editor doesn't show (it sits
  before Save), and the shoes' own tiles, which no screenshot shows (the shop's generic shoe drawing).
*/

type S = { look: Look; tab: ShopTab; owned: boolean; points: number; zoom: Rect | null };

/** The shoes bought: the first in the shop, at its listed price. */
const SHOE = 0;
const PRICE = shoePrices[SHOE];

const START: S = { look: "pink", tab: "hijab", owned: false, points: BASE_POINTS, zoom: null };
const POSTER: S = { look: "green", tab: "shoes", owned: true, points: BASE_POINTS - PRICE, zoom: null };

/** The screen shows down to 730pt of 874: the first row of tiles and their prices stay in, the second is cut. */
const WIDE: Design = { w: 480, phone: 340, top: 40, screen: 730 };
const COMPACT: Design = { w: 358, phone: 290, top: 24, screen: 730 };

/** The avatar only ever wears the looks the story moves between, so only those are drawn for the cross-fade. */
const WORN = [START.look, POSTER.look];
/** The row is scrolled as in the screenshots, Shoes first; the pills before it are off the left edge. */
const PILLS = shopTabs.slice(2);

async function script(a: Act<S>) {
  a.mark("editor");
  await tap(a, "hijab-sage", 1800);
  a.mark("outfit");
  a.put({ look: "green" });

  await tap(a, "tab-shoes", 1600);
  a.put({ tab: "shoes" });
  await tap(a, `shoe-${SHOE}`, 1500);
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

/** The avatar editor as the app draws it, at true points. */
function Editor({ s }: { s: S }) {
  return (
    <div className="absolute inset-0 bg-[#f2f2f2] pt-[62px]">
      <ShopHeader
        right={
          // A fixed width: the total loses a digit as it rolls, and the pill must not narrow under it
          <span data-target="points" className="flex h-[37px] w-[92px] items-center gap-1.5 rounded-full bg-paper pl-1.5 pr-3 shadow-[0_2px_8px_rgb(0_0_0/0.06)]">
            <Coin />
            <Count value={s.points} format={String} className="font-display text-[17px] text-app-ink" />
          </span>
        }
      />
      <ShopHint words={false} />
      <div className="relative mt-[14px] h-[360px]">
        {WORN.map((id) => (
          <div key={id} data-on={id === s.look || undefined} className="ad-look absolute inset-0 grid place-items-center">
            <Student look={id} className="h-[350px] w-auto" />
          </div>
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-0 top-[548px] rounded-t-[32px] bg-paper pt-[11px]">
        <div className="-ml-[58px] flex gap-[17px] overflow-hidden">
          {PILLS.map((p) => (
            <span key={p.id} data-target={`tab-${p.id}`} className="ad-tile">
              <ShopPill id={p.id} label={p.label} on={p.id === s.tab} />
            </span>
          ))}
        </div>
        <div className="relative mt-[16px]">
          <ShopArrow side="left" on={false} />
          <ShopArrow side="right" on />
          <Grid on={s.tab === "hijab"}>
            {hijabs.map((h) => {
              const worn = h.tone === "sage" && s.look === "green";
              return (
                <span key={h.tone}>
                  <ShopItem shape="round" state={worn ? "on" : h.owned ? "owned" : "locked"} target={`hijab-${h.tone}`} className="ad-tile">
                    <span className="grid size-full justify-center pt-[4px]">
                      <Student look="green" tone={h.tone} className="h-[62px] w-auto" />
                    </span>
                  </ShopItem>
                  <ShopPrice>{h.price} Pts</ShopPrice>
                </span>
              );
            })}
          </Grid>
          <Grid on={s.tab === "shoes"}>
            {shoePrices.map((p, i) => {
              const bought = i === SHOE && s.owned;
              return (
                <span key={i}>
                  <ShopItem shape="round" state={bought ? "on" : "locked"} keep unlocking={i === SHOE ? bought : undefined} lockClassName="ad-lock" target={`shoe-${i}`} className="ad-tile">
                    <span className="grid size-full place-items-center pl-px pt-px">
                      <Shoe />
                    </span>
                  </ShopItem>
                  <ShopPrice>{p} Pts</ShopPrice>
                </span>
              );
            })}
          </Grid>
        </div>
      </div>
    </div>
  );
}

/** A tab's tiles, three to a row; the tabs' grids cross-fade in place, opacity only, so the prices never land on a
    transform. */
function Grid({ on, children }: { on: boolean; children: ReactNode }) {
  return (
    <div data-on={on || undefined} className="ad-swap absolute inset-x-0 top-0 mx-auto grid w-[253px] grid-cols-3 gap-x-[29px] gap-y-[18px]">
      {children}
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
            <Editor s={s} />
          </AppPhone>
        </Camera>
      )}
    </AppStage>
  );
}
