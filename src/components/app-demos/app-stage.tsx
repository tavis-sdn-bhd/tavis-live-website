"use client";

import { Image } from "@/components/image";
import type { ReactNode } from "react";
import { appShots, type ShotScreen } from "@/lib/content";
import { Phone, Stage } from "../stageshow";
import "./app-demos.css";

/*
  BA's app tiles: a screenshot of the real app on a phone, framed as Stageshow's phone-touch (a tile in the app's
  mint, the phone pinned a gutter from its top, centred, and running off the bottom), so every tile reads as one
  product.
*/

/** The kit phone: a 402pt screen inside a 13pt band and glass each side. */
const SCREEN_W = 402;
const SCREEN_H = 874;
const EDGE = 13;

/** One composition: stage width, phone width, and the gutter over the phone. The whole screen shows. */
type Design = { w: number; phone: number; top: number };

const WIDE: Design = { w: 480, phone: 340, top: 40 };
const COMPACT: Design = { w: 358, phone: 290, top: 24 };

const heightOf = (d: Design) => Math.round(d.top + (SCREEN_H + EDGE) * (d.phone / (SCREEN_W + EDGE * 2)));

export function AppShot({ screen, beside }: { screen: ShotScreen; beside?: ReactNode }) {
  return (
    <div className="ad relative mx-auto w-full max-w-[480px]" role="img" aria-label={screen.alt}>
      <Stage width={WIDE.w} height={heightOf(WIDE)} compact={{ below: 420, width: COMPACT.w, height: heightOf(COMPACT) }}>
        {(_s, _rect, layout) => {
          const d = layout === "compact" ? COMPACT : WIDE;
          return (
            <Phone width={d.phone} status={false} className="ad-phone" data-chat-avoid style={{ top: d.top, left: (d.w - d.phone) / 2 }}>
              <div className="ad-app" aria-hidden="true">
                <Image src={appShots[screen.shot]} alt="" width={851} height={1847} sizes="(min-width: 480px) 340px, 290px" className="absolute inset-0 size-full object-cover" />
              </div>
            </Phone>
          );
        }}
      </Stage>
      {beside}
    </div>
  );
}
