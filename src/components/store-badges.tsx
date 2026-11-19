"use client";

import { Image } from "@/components/image";
import type { ReactNode } from "react";
import { links } from "@/lib/content";
import { usePlatform } from "@/lib/use-store-link";
import { cx } from "./ui";

/*
 * The badges are Apple's and Google's own artwork, unaltered (public/assets/badges/SOURCES.md).
 * Both stores want a clear space of a quarter of the badge height on every side and a minimum height of 40px.
 * Apple's SVG is trimmed to the badge, so its link carries the clear space as padding. Google's PNG already carries
 * its own: 41px on each side of its 168px badge, so the image is 1.4881 times the badge height.
 */
const link = "tap inline-flex shrink-0";

/** Each badge takes its link and image classes, which set its size: the one place its artwork is named. */
type BadgeProps = { linkClassName?: string; imageClassName: string };

function AppStoreBadge({ linkClassName, imageClassName }: BadgeProps) {
  return (
    <a href={links.appStore} className={cx(link, linkClassName)}>
      <Image src="/assets/badges/app-store-black-en.svg" alt="Download on the App Store" width={120} height={40} unoptimized className={cx("w-auto", imageClassName)} />
    </a>
  );
}

function PlayBadge({ linkClassName, imageClassName }: BadgeProps) {
  return (
    <a href={links.googlePlay} className={cx(link, linkClassName)}>
      <Image src="/assets/badges/google-play-en.png" alt="Get it on Google Play" width={646} height={250} unoptimized className={cx("w-auto", imageClassName)} />
    </a>
  );
}

/** The visitor's own store first; Apple's when the platform is unknown. */
function Ordered({ apple, google }: { apple: ReactNode; google: ReactNode }) {
  const platform = usePlatform();
  return platform === "android" ? (
    <>
      {google}
      {apple}
    </>
  ) : (
    <>
      {apple}
      {google}
    </>
  );
}

/** Store links open in the same tab: on a phone they hand straight to the store app, leaving no blank tab behind. */
export function StoreBadges({ className }: { className?: string }) {
  return (
    <div className={cx("flex flex-wrap items-center", className)}>
      <Ordered
        apple={<AppStoreBadge linkClassName="rounded-2xl p-3" imageClassName="h-12" />}
        google={<PlayBadge linkClassName="rounded-2xl" imageClassName="h-[4.4643rem]" />}
      />
    </div>
  );
}

/** The two badges as a phone's call to action, side by side at one height (`--badge`): 40px, the stores' minimum, at
    320px; 44px from 360; 48px from 390, the widest that keeps the pair on one row. Google's built-in clear space is also
    the gap between the two; Apple's badge gets the same margin on its outer side, so the visible pair sits centred. */
export function StoreBadgeRow({ className }: { className?: string }) {
  const platform = usePlatform();
  return (
    <div className={cx("flex items-center justify-center [--badge:2.5rem] min-[360px]:[--badge:2.75rem] min-[390px]:[--badge:3rem]", className)}>
      <Ordered
        apple={
          <AppStoreBadge
            linkClassName={cx("rounded-xl", platform === "android" ? "pr-[calc(var(--badge)*0.244)]" : "pl-[calc(var(--badge)*0.244)]")}
            imageClassName="h-(--badge)"
          />
        }
        google={<PlayBadge linkClassName="rounded-xl" imageClassName="h-[calc(var(--badge)*1.4881)]" />}
      />
    </div>
  );
}
