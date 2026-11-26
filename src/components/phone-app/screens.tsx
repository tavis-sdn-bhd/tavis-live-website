"use client";

import { Image } from "@/components/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type Ref } from "react";
import { rewards } from "@/lib/content";
import { useClientValue } from "@/lib/use-client-value";
import { minutes, upcomingClass, timetable2027, weekByForm } from "@/lib/pages";
import { learningCard as card, optionState, q6, q17, q17Answer, type OptionKey } from "@/lib/questions";
import { Bacteriophage } from "../bacteriophage";
import { NormalFlora } from "../normal-flora";
import { SubjectArt, type ArtSubject } from "./subject-art";
import { Coin } from "../coin";
import { Count } from "../stageshow/motion/Count";
import { Check, Close, Flag } from "../icons";
import { Mascot } from "../mascot";
import { Student, type Look } from "../student";
import { BrandPlate } from "../ticket";
import { subjectDot, subjectKey, subjectLang } from "../subject";
import { cx } from "../ui";
import { looks, useApp } from "./state";
import { ShopHeader, ShopHint, saveButton, shop, ShopItem, ShopPill, ShopPrice, hijabs, shopTabs, type ShopTab } from "./shop";

/* ── App palette ─────────────────────────────────────────────────────────
   The real app's tile colours; everything else uses site tokens
   (brand, forest, cream, correct, wrong, sun, app-ink, app-muted).
   Tile labels are app-ink: white on these fills is 1.65–2.63:1, app-ink is 5.66–9.01:1. */
const tile = {
  universe: "#5fb7a4",
  classes: "#e98585",
  progress: "#f2c351",
  rewards: "#ad8ff2",
  materials: "#5fb7a4",
} as const;

/** The leaderboard's own greens, as in the app: a deep field, lit steps. */
const leaderboard = { field: "bg-app-leaderboard", step: "bg-[#4ea461] shadow-[inset_0_10px_0_#79d98a]" } as const;

/* App buttons: rounded like the app, sitting on a ledge like the site. */
/** Marks a screen's title: where focus lands when the screen opens (see `useScreenFocus`). */
const screenTitle = { tabIndex: -1, "data-screen-title": true } as const;

/** On touch, where the phone is zoomed down, widens a small control's hit area without moving it. */
const hit = "pointer-coarse:after:absolute pointer-coarse:after:-inset-3";

const btn = {
  primary: "h-[56px] rounded-[16px] bg-brand font-display text-[17px] text-forest shadow-ledge-brand",
  secondary: "h-[56px] rounded-[16px] border-2 border-line-strong bg-paper font-display text-[17px] text-forest",
  pill: "flex h-[44px] items-center gap-2 rounded-full bg-paper shadow-[0_2px_8px_rgb(0_0_0/0.06)]",
} as const;

/* ── Small pieces ──────────────────────────────────────────────────────── */

/** Tappable element: a native button with a CSS press, no JS per button. `target` names it for a scripted tap, which
    presses it through `data-pressed`. */
function Press({
  children,
  className,
  onClick,
  label,
  color,
  pressed,
  target,
  crop,
  ref,
}: {
  children: ReactNode;
  className?: string;
  onClick: () => void;
  label?: string;
  color?: string;
  /** Set for toggle buttons. */
  pressed?: boolean;
  /** The name a scripted demo taps it by. */
  target?: string;
  /** It crops its content on purpose (a figure cut by the tile's edge). Marked for the demo's film checks. */
  crop?: boolean;
  ref?: Ref<HTMLButtonElement>;
}) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      data-target={target}
      data-crop={crop || undefined}
      className={cx("transition-transform duration-100 active:scale-[0.96] data-pressed:scale-[0.96]", className)}
      style={color ? { background: color } : undefined}
    >
      {children}
    </button>
  );
}

/** The ✓ or ✕ an answered option carries. */
export function Mark({ ok, className }: { ok: boolean; className?: string }) {
  return (
    <span className={cx("grid place-items-center rounded-full text-paper", ok ? "bg-correct" : "bg-wrong", className)}>
      {ok ? <Check className="size-3.5" /> : <Close className="size-3" />}
    </span>
  );
}

export const Pencil = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 20l1.2-4.6L16 4.6a2 2 0 0 1 2.8 0l.6.6a2 2 0 0 1 0 2.8L8.6 18.8Z" className="fill-sun" />
    <path d="M16 4.6 19.4 8" className="stroke-coral" strokeWidth="3" />
    <path d="M4 20l1.2-4.6 3.4 3.4Z" fill="#f4e2c0" />
  </svg>
);
function CrownBadge({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" className={className}>
      <path d="M16 2.5 27.7 9.25v13.5L16 29.5 4.3 22.75V9.25Z" className="fill-sun" />
      <path d="M9 20.5 8 12l4.5 3.5L16 10l3.5 5.5L24 12l-1 8.5Z" className="fill-paper" />
    </svg>
  );
}
export const Shoe = () => (
  <svg width="30" height="20" viewBox="0 0 30 20" aria-hidden="true">
    <path d="M3 6c4 0 7 3 12 3s8 2 11 4c2 1 2 4-1 4H5c-2 0-3-1-3-3Z" fill="#ffffff" />
    <path d="M3 15h23" className="stroke-line-strong" strokeWidth="2" />
    <path d="M9 8l2 2M12 9l2 2" className="stroke-app-muted" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

/** A row's "more" mark, drawn so it has a real box (a text "›" is mostly side bearing). */
const Chevron = ({ className = "text-app-ink/60" }: { className?: string }) => (
  <svg aria-hidden="true" width="10" height="16" viewBox="0 0 10 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cx("shrink-0", className)}>
    <path d="M2.5 2.5 7.5 8l-5 5.5" />
  </svg>
);

/** `light` for a dark screen: white text and a white press. */
function BackBar({ title, right, light, plain }: { title?: string; right?: ReactNode; light?: boolean; /** The app's lighter title, as on Learning Cards. */ plain?: boolean }) {
  const { back } = useApp();
  return (
    <div className={cx("flex h-[52px] items-center gap-3 px-4", light ? "text-white" : "text-app-ink")}>
      <Press onClick={back} label="Back" className={cx("relative grid size-10 place-items-center rounded-full", light ? "hover:bg-white/10" : "hover:bg-black/5", hit)}>
        <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M11 6l-6 6 6 6" />
        </svg>
      </Press>
      {title && (
        <span {...screenTitle} className={cx("text-[20px] outline-none", plain ? "font-normal" : "font-display")}>
          {title}
        </span>
      )}
      <span className="ml-auto">{right}</span>
    </div>
  );
}

type ScreenProps = {
  children: ReactNode;
  className?: string;
  /** The screen's background class; it replaces the cream rather than competing with it. */
  bg?: string;
  /** A dark background: turns the status bar and home indicator white (see Device). */
  light?: boolean;
  title?: string;
  subtitle?: string;
  tabbed?: boolean;
};

/** Scrollable screen body under the status bar. A `title` makes it a tab screen with a header. */
export function Screen({ children, className, bg = "bg-cream", light, title, subtitle, tabbed = !!title }: ScreenProps) {
  return (
    <div
      data-status={light ? "light" : undefined}
      // A scroller: it crops what runs past its foot on purpose (marked for the demo's film checks)
      data-crop
      className={cx(
        bg,
        "absolute inset-0 overflow-y-auto pt-[54px] [scrollbar-width:none] pointer-coarse:group-data-locked/phone:overflow-y-hidden [&::-webkit-scrollbar]:hidden",
        tabbed ? "pb-[110px]" : "pb-[40px]",
        className,
      )}
    >
      {title && (
        <div className="px-5 pt-3">
          <p {...screenTitle} className="font-display text-[28px] text-app-ink outline-none">
            {title}
          </p>
          {subtitle && <p className="mt-1 text-[14px] text-app-muted">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

/* ── Home ─────────────────────────────────────────────────────────────── */

const tileIcons = {
  classes: (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="size-[46px]">
      <rect x="8" y="30" width="32" height="7" rx="2" fill="#3b6fd8" />
      <rect x="10" y="23" width="28" height="7" rx="2" fill="#f2c351" />
      <rect x="8" y="16" width="32" height="7" rx="2" fill="#e05a5a" />
      <path d="M12 12 24 7l12 5-12 5Z" className="fill-app-ink" />
      <path d="M33 13v7" className="stroke-sun" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  progress: (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="size-[46px]">
      <rect x="8" y="26" width="7" height="14" rx="2" fill="#4c8df6" />
      <rect x="18" y="20" width="7" height="20" rx="2" fill="#ad8ff2" />
      <rect x="28" y="14" width="7" height="26" rx="2" fill="#ff7b93" />
      <path d="M8 20 18 13l8 4 12-10" stroke="#5ccfa6" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  rewards: (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="size-[46px]">
      <rect x="10" y="20" width="28" height="20" rx="3" fill="#5ccfa6" />
      <rect x="8" y="14" width="32" height="8" rx="2" fill="#f2c351" />
      <rect x="21" y="14" width="6" height="26" fill="#e05a5a" />
      <path d="M24 14c-3-6-11-6-9 0M24 14c3-6 11-6 9 0" stroke="#e05a5a" strokeWidth="3" fill="none" />
    </svg>
  ),
  materials: (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="size-[46px]">
      <path d="M6 34c6-3 12-3 18 0 6-3 12-3 18 0V18c-6-3-12-3-18 0-6-3-12-3-18 0Z" fill="#fff8e6" />
      <path d="M24 18v16" stroke="#d6c39a" strokeWidth="2" />
      <circle cx="24" cy="9" r="6" className="fill-sun" />
      <rect x="21.5" y="14" width="5" height="3" rx="1" fill="#8a8f8d" />
    </svg>
  ),
};

function Tile({ color, title, icon, onClick }: { color: string; title: string; icon: ReactNode; onClick: () => void }) {
  return (
    <Press onClick={onClick} color={color} className="flex h-[156px] flex-col items-center justify-center gap-3 rounded-[24px] text-app-ink">
      {icon}
      <span className="font-display text-[19px] tracking-[0.01em]">{title}</span>
    </Press>
  );
}

/* Timetable days start at Isnin (0); Date#getUTCDay starts at Sunday (0). */
const classWeekday = weekByForm[upcomingClass.form].findIndex((day) => day.includes(upcomingClass.slot)) + 1;
/* Malaysia keeps UTC+8 all year, so shifted UTC fields read as Malaysian wall-clock time. */
const MYT = 8 * 3_600_000;
const two = (n: number) => String(n).padStart(2, "0");

/** "DD/MM/YYYY, 6:00 PM" for the upcoming class's next start after `now`, in Malaysian time. */
function nextClassDate(now: number) {
  const wall = new Date(now + MYT);
  const day = new Date(Date.UTC(wall.getUTCFullYear(), wall.getUTCMonth(), wall.getUTCDate()));
  day.setUTCDate(day.getUTCDate() + ((classWeekday - wall.getUTCDay() + 7) % 7));
  const { start } = upcomingClass.slot;
  if (day.getTime() + minutes(start) * 60_000 <= wall.getTime()) day.setUTCDate(day.getUTCDate() + 7);
  const time = start.replace(".", ":").replace(/(am|pm)$/, (m) => ` ${m.toUpperCase()}`);
  return `${two(day.getUTCDate())}/${two(day.getUTCMonth() + 1)}/${day.getUTCFullYear()}, ${time}`;
}

/** Read from the visitor's clock after hydration; null in the static HTML, which would otherwise carry its build date. */
function useNextClassDate() {
  return useClientValue(() => nextClassDate(Date.now()), null);
}

export function HomeScreen() {
  const { points, go, setTab, handoff, look } = useApp();
  const { slot } = upcomingClass;
  const date = useNextClassDate();
  return (
    <Screen tabbed>
      {/* The header's mint runs up behind the status bar, as an iOS header does, rather than stopping under it. */}
      <div className="-mt-[54px] bg-mint px-5 pb-6 pt-[66px]">
        <div className="flex items-center gap-2.5">
          <span className="size-[46px] overflow-hidden rounded-full bg-paper ring-2 ring-white">
            <Student look={look} head className="size-full" />
          </span>
          <Press onClick={() => go("rewards")} className={cx(btn.pill, "px-2.5")} label={`${points} points`}>
            <Coin />
            <Count value={points} format={String} className="font-display text-[19px] text-app-ink" />
            <Chevron />
          </Press>
          <Press onClick={() => handoff("Verify your ID in the app to earn +200 pts.")} className={cx(btn.pill, "px-3")}>
            <svg aria-hidden="true" width="22" height="16" viewBox="0 0 22 16" fill="none" className="stroke-brand-ink" strokeWidth="1.8">
              <rect x="1" y="1" width="20" height="14" rx="2" />
              <path d="M5 6h6M5 10h4" />
            </svg>
            <span className="text-left leading-tight">
              <span className="block font-display text-[14px] text-app-ink">Verify ID</span>
              <span className="block text-[11px] text-brand-text">+200 pts</span>
            </span>
          </Press>
          <Press onClick={() => handoff("Notifications live in the app.")} className={cx(btn.pill, "relative ml-auto size-[44px] justify-center")} label="Notifications">
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" className="stroke-app-ink" strokeWidth="1.8" strokeLinecap="round">
              <path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4Z" />
              <path d="M10 20a2 2 0 0 0 4 0" />
            </svg>
            <span className="absolute -right-1.5 -top-2 rounded-full bg-wrong-ink px-1.5 text-[11px] leading-[18px] text-white">2182</span>
          </Press>
        </div>
        <p {...screenTitle} className="mt-3 font-display text-[22px] tracking-[0.02em] text-brand-text outline-none">
          Hello Tavy
        </p>
        <Press onClick={() => setTab("classes")} className="mt-3 w-full rounded-[22px] bg-paper p-4 text-left shadow-[0_6px_16px_rgb(0_0_0/0.06)]">
          <span className="flex items-start justify-between gap-3">
            <span>
              <span className="block font-display text-[18px] leading-snug text-app-ink">
                Upcoming Class: F{upcomingClass.form} <span lang={subjectLang(slot.subject)}>{slot.subject}</span>
              </span>
              <span className="mt-1.5 block text-[14px] text-wrong-ink">{slot.tutor}</span>
            </span>
            <span className="shrink-0 text-right">
              <span aria-hidden="true" className="block text-app-ink/50">
                ›
              </span>
              <span className="mt-3 block text-[13px] text-app-ink">{date ?? "\u00a0"}</span>
            </span>
          </span>
        </Press>
      </div>

      <div className="grid gap-3.5 px-5 pt-5">
        <Press onClick={() => setTab("universe")} target="universe" color={tile.universe} className="relative flex h-[112px] items-center overflow-hidden rounded-[24px] px-6 text-left text-app-ink">
          <span>
            <span className="block font-display text-[20px] tracking-[0.03em]">Question Universe</span>
            <span className="mt-1 block font-display text-[16px] tracking-[0.03em]">
              Start Now <span aria-hidden="true">›</span>
            </span>
          </span>
          <svg aria-hidden="true" viewBox="0 0 64 64" className="absolute right-5 top-1/2 size-[76px] -translate-y-1/2 rotate-6">
            <rect x="12" y="6" width="40" height="52" rx="5" fill="#4aa6e8" />
            <rect x="17" y="13" width="9" height="8" rx="2" fill="#f2c351" />
            <rect x="30" y="15" width="16" height="4" rx="2" fill="#fff" />
            <path d="M21.5 29c-3-3-7 1-3.5 4l3.5 3 3.5-3c3.5-3-.5-7-3.5-4Z" fill="#ff5a6e" />
            <rect x="30" y="30" width="16" height="4" rx="2" fill="#fff" />
            <rect x="17" y="41" width="9" height="8" rx="2" fill="#f2c351" />
            <rect x="30" y="43" width="16" height="4" rx="2" fill="#fff" />
          </svg>
        </Press>
        <div className="grid grid-cols-2 gap-3.5">
          <Tile color={tile.classes} title="Classes" icon={tileIcons.classes} onClick={() => setTab("classes")} />
          <Tile color={tile.progress} title="My Progress" icon={tileIcons.progress} onClick={() => setTab("history")} />
          <Tile color={tile.rewards} title="Rewards" icon={tileIcons.rewards} onClick={() => go("rewards")} />
          <Tile color={tile.materials} title="Learning Materials" icon={tileIcons.materials} onClick={() => go("cards")} />
        </div>
        <div className="relative h-[150px] overflow-hidden rounded-[22px] bg-forest-soft">
          <Image src="/assets/tuition-team-sm.webp" alt="The Tavis teaching team" width={480} height={256} loading="eager" sizes="240px" className="absolute bottom-0 left-1/2 h-[118px] w-auto max-w-none -translate-x-1/2" />
          <p lang="ms" className="absolute left-4 top-3 font-display text-[19px] italic text-white">
            Selamat Kembali
          </p>
          <p lang="ms" className="absolute left-4 top-[34px] max-w-[60%] text-[10px] leading-tight text-white/85">Mulakan Tahun Persekolahan Ini Dengan Penuh Kekuatan Dan Keyakinan</p>
          <span className="absolute right-4 top-3 flex items-center gap-1 font-display text-[15px] text-white">
            <span aria-hidden="true" className="grid size-[18px] place-items-center rounded-[5px] bg-brand text-[11px]">
              T
            </span>
            tavis
          </span>
        </div>
      </div>
    </Screen>
  );
}

/* ── Question Universe ────────────────────────────────────────────────── */

/** Form 5's subjects in the app's order, from the client's screenshot. Biologi and Kimia are read off the two icons
    cut by its foot. */
const subjects: readonly ArtSubject[] = ["Sejarah", "Sains", "Matematik", "Prinsip Perakaunan", "Biologi", "Kimia"];
const forms = [2, 3, 4, 5] as const;

/** Question Universe, to the client's screenshot: pick a form, then a subject. Sains opens its question; the rest,
    and the other forms, hand off to the app. The leaderboard sits under the grid. */
export function UniverseScreen() {
  const { go, handoff } = useApp();
  return (
    <Screen tabbed bg="bg-[#f2f2f2]" className="font-normal">
      <div className="mt-[29px] min-h-full rounded-t-[28px] bg-paper px-[15px] pb-6 pt-6">
        <p {...screenTitle} className="px-[3px] text-[19px] font-medium text-[#252d3a] outline-none">
          Select Form
        </p>
        <div className="mt-[22px] grid grid-cols-4 gap-[10px]">
          {forms.map((f) => {
            const on = f === 5;
            return (
              <Press
                key={f}
                onClick={() => (on ? undefined : handoff(`Form ${f} questions are waiting in the app.`))}
                pressed={on}
                className={cx("flex h-[97px] flex-col items-center justify-center gap-[14px] rounded-[16px]", on ? "bg-[#e3f6e5] text-[#3a7a44]" : "bg-[#f2f3f5] text-[#252d3a]")}
              >
                {on ? (
                  <svg aria-hidden="true" width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#3a7a44" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="9.6" />
                    <path d="m6.8 11.2 2.8 2.8 5.6-5.8" />
                  </svg>
                ) : (
                  <span aria-hidden="true" className="size-[22px] rounded-full border-[1.5px] border-[#cfd3d8] bg-paper" />
                )}
                <span className="text-[16px]">Form {f}</span>
              </Press>
            );
          })}
        </div>
        <p className="mt-[34px] px-[10px] text-[19px] font-medium text-[#252d3a]">Select Subject</p>
        <div className="mt-[20px] grid grid-cols-2 gap-x-[21px] gap-y-[20px] px-[10px]">
          {subjects.map((name) => {
            const live = name === "Sains";
            return (
              <Press
                key={name}
                onClick={() => (live ? go("question") : handoff(`${name} questions are waiting in the app.`))}
                target={live ? "sains" : undefined}
                className="flex h-[135px] flex-col items-center rounded-[20px] bg-[#f2f3f5] px-3 pt-[26px] text-center"
              >
                <SubjectArt subject={name} className="size-[50px]" />
                <span className="mt-[18px] text-[16.5px] leading-[1.3] text-[#252d3a]">F5 {name}</span>
              </Press>
            );
          })}
        </div>
        <Press onClick={() => go("leaderboard")} className={cx(leaderboard.field, "mx-[10px] mt-6 flex w-[calc(100%-20px)] items-center gap-3.5 rounded-[20px] p-4 text-left text-white")}>
          <span className="grid size-11 place-items-center rounded-2xl bg-white/15">
            <CrownBadge className="size-7" />
          </span>
          <span className="flex-1">
            <span className="block font-display text-[17px]">Leaderboard</span>
            <span className="block text-[13px] text-white">See how you rank this week</span>
          </span>
          <Chevron className="text-white/70" />
        </Press>
      </div>
    </Screen>
  );
}

const optionStyles = {
  idle: "bg-paper text-app-ink shadow-[0_2px_8px_rgb(0_0_0/0.05)]",
  correct: "bg-correct-soft text-correct-ink ring-2 ring-brand",
  wrong: "bg-wrong-soft text-wrong-ink ring-2 ring-wrong/60",
  muted: "bg-paper/60 text-app-muted",
} as const;

/** A quiz's top bar: close, the points pill (with `children` over it) and the pencils left. As much air over the
    pills as under them. */
function QuizBar({ onClose, points, pencils, children }: { onClose: () => void; points: ReactNode; pencils: number; children?: ReactNode }) {
  const pill = "flex h-[40px] items-center rounded-full bg-brand shadow-[0_3px_0_var(--color-brand-ledge)]";
  return (
    <div className="flex h-[60px] items-center gap-2 px-4">
      <Press onClick={onClose} label="Close" target="close" className={cx("relative grid size-10 place-items-center rounded-full border-2 border-line-strong text-app-muted", hit)}>
        <Close className="size-3.5" />
      </Press>
      <div className={cx(pill, "relative ml-auto gap-2 pl-3.5 pr-1.5")}>
        <span data-target="points" className="font-display text-[17px] text-forest">
          {points}
        </span>
        <span data-target="pill-coin" className="grid">
          <Coin size={28} />
        </span>
        {children}
      </div>
      <div className={cx(pill, "gap-1.5 px-3")}>
        <Pencil />
        <span className="grid gap-[5px]">
          <span className="block font-display text-[15px] leading-[1.1] text-forest">{pencils}/50</span>
          <span className="block text-[10px] leading-[1.1] text-forest">Pencils</span>
        </span>
      </div>
    </div>
  );
}

/** Clear space between an answered option and the top of the answer drawer. */
const DRAWER_GAP = 16;

/** A quiz's question box, under its fixed bar. Once scrolled, its top edge fades rather than slicing a line. */
/** Room kept under Next Question when the explanation scrolls to it: clear of the home indicator. */
const EXPLAIN_GAP = 40;

const quizScroller =
  "absolute inset-x-0 bottom-0 top-[114px] overflow-y-auto [scrollbar-width:none] pointer-coarse:group-data-locked/phone:overflow-y-hidden [&::-webkit-scrollbar]:hidden data-scrolled:[mask-image:linear-gradient(to_bottom,transparent,#000_20px)]";

/** Whether a box is scrolled from its top, to fade that edge. */
function useScrolled() {
  const [scrolled, setScrolled] = useState(false);
  const onScroll = (e: { currentTarget: HTMLElement }) => setScrolled(e.currentTarget.scrollTop > 1);
  return { "data-scrolled": scrolled || undefined, onScroll };
}

export function QuestionScreen() {
  const { points, pencils, picked, pick, go, back, handoff, rewarded } = useApp();
  const answered = picked !== null;
  const correct = picked === q17.answer;
  const next = useRef<HTMLButtonElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const drawer = useRef<HTMLDivElement>(null);
  const options = useRef<Partial<Record<OptionKey, HTMLButtonElement | null>>>({});
  const reduce = useReducedMotion();
  const mounted = useRef(false);
  const fade = useScrolled();
  // Answering disables the focused option, so hand focus to the drawer's next step.
  useEffect(() => {
    if (answered) next.current?.focus({ preventScroll: true });
  }, [answered]);
  // The drawer rises over the options: scroll the pick up with it, so the answer stays whole above the drawer with a
  // clear gap. A screen that opens already answered starts there.
  useLayoutEffect(() => {
    const first = !mounted.current;
    mounted.current = true;
    const box = scroller.current;
    const sheet = drawer.current;
    const option = picked ? options.current[picked] : null;
    if (!box || !sheet || !option) return;
    const top = option.offsetTop + option.offsetHeight + DRAWER_GAP - (box.clientHeight - sheet.offsetHeight);
    if (top > box.scrollTop) box.scrollTo({ top, behavior: first || reduce ? "instant" : "smooth" });
  }, [picked, reduce]);
  return (
    <div className="absolute inset-0 bg-cream">
      {/* The bar stays put; the question scrolls in its own box under it */}
      <div className="absolute inset-x-0 top-0 z-10 pt-[54px]">
        <QuizBar onClose={back} pencils={pencils} points={
            <>
              {/* Count names itself on a plain span, which screen readers skip: say the figure in text. */}
              <span className="sr-only">{points}</span>
              <Count value={points} format={String} aria-hidden="true" />
            </>
          }>
          <AnimatePresence initial={false}>
              {correct && rewarded && (
                <motion.span
                  initial={{ opacity: 0, y: 0, scale: 0.6 }}
                  animate={{ opacity: [0, 1, 1, 0], y: [0, -22, -26, -36], scale: [0.6, 1.2, 1, 1] }}
                  transition={{ duration: 1.4 }}
                  aria-hidden="true"
                  className="absolute -top-3 left-3 font-display text-[22px] text-forest"
                >
                  +{q17.reward}
                </motion.span>
              )}
          </AnimatePresence>
        </QuizBar>
      </div>
      <div
        ref={scroller}
        // A scroller: it crops what runs past its edges on purpose (marked for the demo's film checks)
        data-crop
        {...fade}
        className={cx(quizScroller, "pb-[260px]")}
      >
        <div className="px-5">
          <p {...screenTitle} className="font-display text-[19px] text-app-ink outline-none">
            Question {q17.number}/{q17.of}
          </p>
          <div className="mt-2.5 h-[8px] rounded-full bg-line">
            <div className="h-full rounded-full bg-brand-ink" style={{ width: `${(q17.number / q17.of) * 100}%` }} />
          </div>
          <p lang="ms" className="mt-5 font-display text-[19px] leading-[1.3] text-app-ink">
            {q17.stem.ms}
          </p>
          <p lang="en" className="mt-1.5 font-display text-[16px] leading-[1.35] text-app-ink/80">
            {q17.stem.en}
          </p>
          <div className="mt-4 grid place-items-center rounded-[22px] bg-line py-3">
            <div className="rounded-lg bg-paper p-3">
              <Bacteriophage className="h-[166px] w-auto" />
            </div>
          </div>
          <div className="mt-4 grid gap-3.5">
            {q17.options.map((o) => {
              const state = optionState(picked, o.key);
              return (
                <motion.button
                  key={o.key}
                  ref={(el) => {
                    options.current[o.key] = el;
                  }}
                  type="button"
                  disabled={answered}
                  onClick={() => pick(o.key)}
                  data-target={`option-${o.key}`}
                  animate={state === "wrong" ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                  className={cx(
                    // The mark sits as far from the right as from the top and bottom: (54 − 28) / 2.
                    "relative flex min-h-[54px] items-center justify-between gap-3 rounded-[18px] pl-5 pr-[13px] text-left font-display text-[17px] transition-[background-color,color,box-shadow,scale] duration-150 active:scale-[0.98] data-pressed:scale-[0.98]",
                    // Fill the gap between options, so a tap there still lands.
                    "pointer-coarse:after:absolute pointer-coarse:after:inset-x-0 pointer-coarse:after:-inset-y-[7px]",
                    optionStyles[state],
                  )}
                >
                  <span>
                    {o.key}. <span lang="ms">{o.ms}</span> / {o.en}
                  </span>
                  {(state === "correct" || state === "wrong") && <Mark ok={state === "correct"} className="size-7 shrink-0" />}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Answer drawer, as in the app */}
      <AnimatePresence initial={false}>
        {answered && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            ref={drawer}
            data-transient
            // As much air over the title as under the buttons, which clear the home indicator
            className={cx("absolute inset-x-0 bottom-0 z-30 rounded-t-[28px] px-5 pb-9 pt-[35px]", correct ? "bg-correct-soft" : "bg-wrong-soft")}
          >
            <p className={cx("text-center font-display text-[26px] leading-[1.25]", correct ? "text-correct-ink" : "text-wrong-ink")}>{correct ? "Correct Answer" : "Not quite"}</p>
            <p className={cx("mt-1 font-display text-[19px] leading-[1.3] text-app-ink", correct ? "flex items-center justify-center gap-2" : "text-center text-balance")}>
              {correct ? (
                rewarded ? (
                  <>
                    <span data-target="reward" className="grid">
                      <Coin size={26} />
                    </span>
                    +{q17.reward} points
                  </>
                ) : (
                  <>Points already earned for this question</>
                )
              ) : (
                <>
                  The answer is {q17Answer.key}. <span lang="ms">{q17Answer.ms}</span> / {q17Answer.en}
                </>
              )}
            </p>
            <div className="mt-5 grid grid-cols-[0.8fr_1.4fr] gap-3">
              <Press onClick={() => handoff("Flag questions for your teacher in the app.")} className={cx(btn.secondary, "flex items-center justify-center gap-2")}>
                <Flag className="size-5 text-math" /> Flag
              </Press>
              <Press ref={next} onClick={() => go("done")} target="next" className={cx(btn.primary, "tracking-[0.04em]")}>
                Next Question
              </Press>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <p role="status" className="sr-only">
        {answered &&
          (correct ? (
            <>Correct. {rewarded ? `Plus ${q17.reward} points.` : "Points already earned for this question."}</>
          ) : (
            <>
              Not quite. The answer is {q17Answer.key}, <span lang="ms">{q17Answer.ms}</span>, {q17Answer.en}.
            </>
          ))}
      </p>
    </div>
  );
}

export function DoneScreen() {
  const { answers, home, retry, handoff, rewarded } = useApp();
  const correct = answers[0]?.correct ?? false;
  return (
    <Screen bg="bg-paper">
      <div className="flex min-h-[740px] flex-col items-center justify-center px-6 text-center">
        <Mascot mood={correct ? "cheer" : "sad"} outfit="science" decorative className="w-[200px]" />
        <p {...screenTitle} className="mt-4 font-display text-[30px] text-forest outline-none">{correct ? "Nice work!" : "Keep going!"}</p>
        <p className="mt-2 text-[16px] text-app-muted">{correct ? (rewarded ? `You earned +${q17.reward} points.` : "You've already earned the points for this one.") : "Every answer comes with an explanation in the app."}</p>
        <div className="mt-12 grid w-full gap-3">
          <Press onClick={() => handoff("Questions 18 to 20 are waiting in the app.")} className={btn.primary}>
            Continue in the app
          </Press>
          <Press onClick={retry} target="retry" className={btn.secondary}>
            Try again
          </Press>
          <Press onClick={home} className="h-[48px] font-display text-[16px] text-app-muted">
            Back to home
          </Press>
        </div>
      </div>
    </Screen>
  );
}

/* ── Rewards ──────────────────────────────────────────────────────────── */

export function RewardsScreen() {
  const { points, checkedIn, checkIn, say, handoff } = useApp();
  const action = "grid h-[104px] w-full place-items-center rounded-[24px] bg-correct-soft px-2 text-center font-display text-[15px] leading-tight text-app-ink";
  return (
    <Screen>
      <BackBar title="Rewards" />
      <div className="px-5">
        <p className="mt-4 text-center text-[17px] text-app-muted">Available Tavis Points</p>
        <p className="mt-2 flex items-center justify-center gap-3 font-display text-[40px] text-app-ink">
          <Coin size={40} />
          {points}
        </p>
        <div className="mt-6 grid grid-cols-3 gap-3">
          <Press onClick={() => handoff("Redeem points for vouchers in the app.")} className={action}>
            Redeem Points
          </Press>
          <Press onClick={() => handoff("Your vouchers live in the app.")} className={action}>
            My Vouchers
          </Press>
          <Press onClick={() => (checkedIn ? say("You've checked in today.") : checkIn())} className={cx(action, checkedIn && "bg-brand")}>
            {checkedIn ? (
              <span className="flex flex-col items-center gap-1">
                <Check className="size-4" />
                Checked in
              </span>
            ) : (
              "Daily Checkin"
            )}
          </Press>
        </div>
        <div className="mt-7 flex items-center justify-between">
          <p className="font-display text-[22px] text-app-ink">Vouchers</p>
          <span className="rounded-xl bg-mint-deep px-3 py-1.5 text-[15px] text-app-ink">All</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {rewards.vouchers.map((v) => (
            <Press key={v.name} onClick={() => say(`${(v.cost - points).toLocaleString("en-MY")} more points to go.`)} className="overflow-hidden rounded-[18px] bg-paper text-left shadow-[0_2px_8px_rgb(0_0_0/0.05)]">
              <BrandPlate name={v.name} className="relative m-1.5 aspect-[256/156]" />
              <span className="block px-3 pb-3 pt-1">
                <span className="block break-words text-[13px] text-app-ink">{v.listing}</span>
                <span className="mt-2 block font-display text-[16px] text-brand-text">{v.cost} pts</span>
                <span className="block font-display text-[14px] text-app-muted">Insufficient Points</span>
              </span>
            </Press>
          ))}
        </div>
      </div>
    </Screen>
  );
}

/* ── Learning card ────────────────────────────────────────────────────── */

/** The app's Learning Card, to the client's screenshot: the chapter in the header, the EN/BM switch and progress in
    the app's orange, and the card with its diagram; the next card's top shows below. */
export function CardsScreen() {
  const { handoff } = useApp();
  const [saved, setSaved] = useState(false);
  return (
    <Screen bg="bg-[#f5f5f5]" className="font-normal">
      <BackBar
        plain
        title={`${card.chapter}. ${card.chapterTitle}`}
        right={
          <span className="flex rounded-full bg-[#eef0f4] p-[3px] text-[15px] font-medium">
            <Press onClick={() => handoff("English cards are in the app.")} className={cx("relative rounded-full px-[14px] py-[5px] text-[#4a5263]", hit)}>
              EN
            </Press>
            <span className="rounded-full bg-[#e69522] px-[14px] py-[5px] text-white">BM</span>
          </span>
        }
      />
      <div className="px-[21px]">
        <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#e69522]">
          {card.form} {card.subject} · {card.formName} · Chapter {card.chapter}
        </p>
        <div className="mt-1 flex justify-between text-[14px]">
          <span className="font-normal text-[#3d4552]">
            Card {card.index} of {card.total}
          </span>
          <span className="text-app-muted">{card.total - card.index} left</span>
        </div>
        <div className="mt-2 h-[5px] rounded-full bg-[#ecebf0]">
          <div className="h-full rounded-full bg-[#e69522]" style={{ width: `${Math.max(8, (card.index / card.total) * 100)}%` }} />
        </div>
        <motion.article initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative mt-4 h-[600px] rounded-[28px] bg-paper px-4 pt-[64px]">
          <Press onClick={() => setSaved((s) => !s)} label="Save card" pressed={saved} className={cx("absolute right-6 top-6 text-[#a5aaad]", hit)}>
            <svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" className={cx("transition-transform", saved ? "scale-110 fill-coral stroke-coral" : "fill-none stroke-current")} strokeWidth="1.6">
              <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
            </svg>
          </Press>
          <NormalFlora className="block h-auto w-full" />
          <p lang="ms" className="mt-8 px-2 text-[28px] font-semibold leading-[1.2] tracking-[-0.01em] text-[#252d3a]">
            {card.title}
          </p>
          <p lang="ms" className="mt-3 px-2 text-[17px] font-normal leading-[1.6] text-[#5b6270]">
            {card.body}
          </p>
        </motion.article>
        <div aria-hidden="true" className="mt-4 h-[120px] rounded-t-[28px] bg-paper" />
      </div>
    </Screen>
  );
}

/* ── Classes: this week's classes from the 2027 timetable ─────────────── */

export function ClassesScreen() {
  const { handoff } = useApp();
  const week = weekByForm[upcomingClass.form];
  return (
    <Screen title="Classes" subtitle={`Form ${upcomingClass.form} · weekly timetable`}>
      <div className="mt-5 grid gap-5 px-5">
        {timetable2027.days.map((day, d) => (
          <section key={day.ms}>
            <p className="font-display text-[17px] text-app-ink">
              <span lang="ms">{day.ms}</span> <span className="text-app-muted">{day.en}</span>
            </p>
            <div className="mt-2 grid gap-2">
              {(week[d] ?? []).map((c) => {
                const upcoming = c === upcomingClass.slot;
                return (
                  <Press
                    key={c.subject + c.start}
                    onClick={() => handoff(`Join ${c.subject} with ${c.tutor} in the app.`)}
                    className={cx("flex w-full items-center gap-3 rounded-[18px] bg-paper p-3.5 text-left", upcoming ? "ring-2 ring-brand" : "shadow-[0_2px_8px_rgb(0_0_0/0.04)]")}
                  >
                    <span className={cx("size-2.5 shrink-0 rounded-full", subjectDot[subjectKey(c.subject)])} />
                    <span className="flex-1">
                      <span lang={subjectLang(c.subject)} className="block font-display text-[16px] text-app-ink">{c.subject}</span>
                      <span className="block text-[13px] text-wrong-ink">{c.tutor}</span>
                    </span>
                    <span className="text-right text-[13px] text-app-muted">
                      {c.start}
                      {upcoming && <span className="mt-0.5 block font-display text-[12px] text-brand-text">Upcoming</span>}
                    </span>
                  </Press>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </Screen>
  );
}

/* ── History / progress ───────────────────────────────────────────────── */

export function HistoryScreen() {
  const { answers, setTab } = useApp();
  const right = answers.filter((a) => a.correct).length;
  /* Answers are newest first, so the paid one is the oldest correct answer. */
  const paid = answers.findLastIndex((a) => a.correct);
  return (
    <Screen title="History">
      <div className="px-5">
        {answers.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <Mascot mood="think" decorative className="w-[150px]" />
            <p className="mt-4 font-display text-[20px] text-app-ink">No practice yet</p>
            <p className="mt-1 text-[15px] text-app-muted">Answer a question and it shows up here.</p>
            <Press onClick={() => setTab("universe")} className={cx(btn.primary, "mt-6 px-7")}>
              Start practising
            </Press>
          </div>
        ) : (
          <>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                { k: "Answered", v: answers.length },
                { k: "Correct", v: right },
                { k: "Points", v: `+${paid >= 0 ? q17.reward : 0}` },
              ].map((s) => (
                <div key={s.k} className="rounded-[18px] bg-paper p-3 text-center">
                  <p className="font-display text-[24px] text-forest">{s.v}</p>
                  <p className="text-[12px] text-app-muted">{s.k}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-2">
              {answers.map((a, i) => (
                <div key={i} className="flex items-center gap-3 rounded-[18px] bg-paper p-3.5">
                  <Mark ok={a.correct} className="size-8" />
                  <span className="flex-1">
                    <span className="block font-display text-[15px] text-app-ink">
                      F5 <span lang="ms">Sains</span> · Q{q17.number}
                    </span>
                    <span className="block text-[13px] text-app-muted">Answered {a.picked}</span>
                  </span>
                  <span className="font-display text-[14px] text-brand-text">{i === paid ? `+${q17.reward}` : "0"}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Screen>
  );
}

/* ── Me: avatar ───────────────────────────────────────────────────────── */

/** Shoe prices as listed in the app's avatar shop. */
export const shoePrices = [2500, 3500, 3500, 5000, 5000] as const;

/** The tabs the editor fills; the rest hand off. */
const filled: ReadonlySet<ShopTab> = new Set(["character", "hijab", "shoes"]);

/** The avatar editor, drawn to the client's screenshots of it (see shop.tsx). Character, Hijab and Shoes open; Top,
    Bottom and Accessories hand off to the app, as no screenshot shows what they hold. */

export function MeScreen() {
  const { look, setLook, say, handoff, points } = useApp();
  const [tab, setTab] = useState<ShopTab>(look === "green" ? "hijab" : "character");
  const locked = (price: number) => (price > points ? say(`${(price - points).toLocaleString("en-MY")} more points to unlock.`) : handoff("Unlock outfits for your avatar in the app."));
  return (
    <Screen tabbed bg="bg-[#f2f2f2]" className="font-normal">
      <p {...screenTitle} className="sr-only">
        Me
      </p>
      <div className="pt-2">
        <ShopHeader
          save={
            <Press onClick={() => say("Avatar saved.")} color={shop.save} className={saveButton}>
              Save
            </Press>
          }
        />
      </div>
      <ShopHint />
      <div className="relative mt-[14px] grid h-[300px] place-items-center">
        <AnimatePresence mode="wait">
          <motion.div key={look} initial={{ opacity: 0, y: 12, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
            <Student look={look} label={looks[look]} className="h-[290px] w-auto" />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="rounded-t-[32px] bg-paper pb-4 pt-[11px]">
        <div className="flex gap-[17px] overflow-x-auto px-[21px] [scrollbar-width:none]">
          {shopTabs.map((t) => (
            <Press key={t.id} onClick={() => (filled.has(t.id) ? setTab(t.id) : handoff(`${t.label} for your avatar are in the app.`))} pressed={t.id === tab} className="shrink-0">
              <ShopPill id={t.id} label={t.label} on={t.id === tab} />
            </Press>
          ))}
        </div>
        <div className="mx-auto mt-[16px] grid w-[253px] grid-cols-3 gap-x-[29px] gap-y-[18px]">
          {tab === "hijab"
            ? hijabs.map((h) => (
                <Press key={h.tone} onClick={() => (h.owned ? setLook("green") : locked(h.price))} pressed={h.owned && look === "green"} label={`${h.tone} tudung and baju kurung, ${h.price} points${h.owned ? "" : ", locked"}`}>
                  <ShopItem shape="round" state={h.owned ? (look === "green" ? "on" : "owned") : "locked"}>
                    <span className="grid size-full justify-center pt-[4px]">
                      <Student look="green" tone={h.tone} className="h-[62px] w-auto" />
                    </span>
                  </ShopItem>
                  <ShopPrice>{h.price} Pts</ShopPrice>
                </Press>
              ))
            : tab === "shoes"
              ? shoePrices.map((p, i) => (
                  <Press key={i} onClick={() => locked(p)} label={`Shoes, ${p} points, locked`}>
                    <ShopItem shape="round" state="locked">
                      <span className="grid size-full place-items-center pl-px pt-px">
                        <Shoe />
                      </span>
                    </ShopItem>
                    <ShopPrice>{p} Pts</ShopPrice>
                  </Press>
                ))
              : (["pink", "blue"] as const).map((id) => (
                  <Press key={id} onClick={() => setLook(id)} target={`look-${id}`} crop pressed={id === look} label={looks[id]}>
                    <ShopItem shape="square" state={id === look ? "on" : "owned"}>
                      <span className="grid size-full justify-center pt-[3px]">
                        <Student look={id} small className="h-[62px] w-auto" />
                      </span>
                    </ShopItem>
                    <ShopPrice>Free</ShopPrice>
                  </Press>
                ))}
        </div>
      </div>
    </Screen>
  );
}

/* ── Leaderboard ──────────────────────────────────────────────────────── */

type Ranked = { name: string; points: number; look: Look | null };

/* Standings from the app's Question Bank leaderboard, first names only. A player with no avatar shows as a silhouette. */
const podium: ReadonlyArray<Ranked & { place: number; height: number }> = [
  { place: 2, name: "mimi", points: 51790, look: null, height: 150 },
  { place: 1, name: "Afrina", points: 86660, look: "pink", height: 196 },
  { place: 3, name: "Emeer", points: 32380, look: "blue", height: 124 },
];
const runnersUp: ReadonlyArray<Ranked & { place: number; score: number }> = [{ place: 4, name: "Anisa", points: 21480, score: 98, look: "green" }];

function Podium() {
  return (
    <div className="relative mt-4 grid grid-cols-[1fr_1.15fr_1fr] items-end px-3">
      <div aria-hidden="true" className="absolute inset-x-[22%] bottom-0 top-6 rounded-t-full bg-white/[0.07]" />
      {podium.map((p) => (
        <div key={p.place} className="relative flex flex-col items-center">
          {p.place === 1 && <CrownBadge className="mb-1 size-9" />}
          <Student look={p.look} small className={cx("w-auto text-white/30", p.place === 1 ? "h-[118px]" : "h-[96px]")} />
          <p className="mt-1.5 max-w-full truncate px-1 font-display text-[15px] text-white">{p.name}</p>
          <p className="mt-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[12px] tabular-nums tracking-[0.04em] text-white/90">{p.points} Pts</p>
          <div className={cx(leaderboard.step, "mt-2.5 grid w-full place-items-start justify-center rounded-t-[6px] pt-4 font-display text-[56px] leading-none text-white")} style={{ height: p.height }}>
            {p.place}
          </div>
        </div>
      ))}
    </div>
  );
}

export function LeaderboardScreen() {
  const { handoff } = useApp();
  const chip = "flex h-[34px] items-center gap-1.5 whitespace-nowrap rounded-full bg-white/15 px-3 text-[13px] text-white";
  return (
    <Screen bg={leaderboard.field} light>
      <BackBar title="Leaderboard" light />
      <div className="px-5">
        <div className="mt-2 grid h-[46px] grid-cols-2 rounded-full bg-white/15 p-1 font-display text-[15px]">
          <span className="grid place-items-center rounded-full bg-paper text-brand-text">Question Bank</span>
          <Press onClick={() => handoff("Class rankings are in the app.")} className="rounded-full text-white">
            Classes
          </Press>
        </div>
        <div className="mt-3 flex gap-2">
          {["All Levels", "All Subjects", "All Schools"].map((label) => (
            <Press key={label} onClick={() => handoff("Filter the rankings in the app.")} className={chip}>
              {label}
              <svg aria-hidden="true" width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="opacity-70">
                <path d="m2 3.5 3 3 3-3" />
              </svg>
            </Press>
          ))}
        </div>
      </div>
      <Podium />
      <div className="relative -mt-1 rounded-t-[28px] bg-mint px-4 pb-10 pt-4">
        <span aria-hidden="true" className="mx-auto mb-3 block h-[5px] w-10 rounded-full bg-app-muted/30" />
        {runnersUp.map((r) => (
          <div key={r.place} className="flex items-center gap-3 rounded-[20px] bg-paper p-3.5 shadow-[0_2px_10px_rgb(0_0_0/0.05)]">
            <span className="grid size-8 shrink-0 place-items-center rounded-full border-[1.5px] border-app-ink/60 font-display text-[15px] text-app-ink">{r.place}</span>
            <span className="size-11 shrink-0 overflow-hidden rounded-full bg-mint">
              <Student look={r.look} head className="size-full" />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-display text-[17px] text-app-ink">{r.name}</span>
              <span className="block text-[13px] text-app-muted">
                {r.points} Points · {r.score}% Avg Score
              </span>
            </span>
          </div>
        ))}
      </div>
    </Screen>
  );
}

/* ── Explanation: Q6 answered wrong, why, then the right one ─────────── */

/**
 * Q6 as the app explains it: the stem and the two options the explanation shows. Picking the wrong one marks it,
 * opens "Why D is wrong" under it, reveals the right answer and offers the next question. A screen that opens
 * already answered (the mockup scene) shows that state at once.
 */
export function ExplanationScreen() {
  const { back, points, pencils, q6: pick, pickQ6, next } = useApp();
  const reduce = useReducedMotion();
  const wrong = pick === q6.wrong.key;
  const fade = useScrolled();
  const scroller = useRef<HTMLDivElement>(null);
  const why = useRef<HTMLDivElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);
  // The explanation opens taller than the screen: scroll with it, so the right answer and Next Question end whole
  // above the home indicator. The why box may still be opening, so the height it has yet to gain is added. A screen
  // that opens already answered (the mockup scene) starts there.
  useLayoutEffect(() => {
    const first = !mounted.current;
    mounted.current = true;
    const box = scroller.current;
    const foot = end.current;
    if (!box || !foot || pick === null) return;
    const k = box.getBoundingClientRect().height / box.offsetHeight || 1;
    const toOpen = why.current?.parentElement ? why.current.offsetHeight - why.current.parentElement.offsetHeight : 0;
    const bottom = (foot.getBoundingClientRect().top - box.getBoundingClientRect().top) / k + box.scrollTop + toOpen;
    const top = bottom + EXPLAIN_GAP - box.clientHeight;
    if (top > box.scrollTop) box.scrollTo({ top, behavior: first || reduce ? "instant" : "smooth" });
  }, [pick, reduce]);
  const option =
    "flex w-full items-center justify-between gap-3 rounded-[14px] border-2 py-[15px] pl-4 pr-[13px] text-left text-[17px] font-normal leading-[1.3] transition-[background-color,border-color,color,scale] duration-150 active:scale-[0.98] data-pressed:scale-[0.98]";
  const idle = "border-line bg-paper text-app-ink";
  const open = reduce ? { duration: 0 } : ({ type: "spring", stiffness: 300, damping: 36 } as const);
  return (
    <div className="absolute inset-0 bg-[#d9dcdb] font-normal">
      <div className="absolute inset-x-0 top-0 z-10 pt-[54px]">
        <QuizBar
          onClose={back}
          pencils={pencils}
          points={
            <>
              <span className="sr-only">{points}</span>
              <Count value={points} format={String} aria-hidden="true" />
            </>
          }
        />
      </div>
      {/* Room under the card, so a scroll started while the explanation is still opening isn't clamped short */}
      <div ref={scroller} data-crop {...fade} className={cx(quizScroller, "pb-[240px]")}>
        {/* At least the screen's height under the bar (874 − 114 − 12), so no grey shows at its foot */}
        <div className="mt-3 min-h-[748px] rounded-t-[28px] bg-paper px-5 pb-10 pt-5">
          <p {...screenTitle} className="text-[17px] font-light tracking-[0.02em] text-[#273037] outline-none">
            Question {q6.number}
          </p>
          <p lang="ms" className="mt-1 text-[18px] font-medium leading-[1.32] text-[#273037]">
            {q6.stem.ms}
          </p>
          <p lang="en" className="text-[18px] font-medium leading-[1.32] text-[#273037]">
            {q6.stem.en}
          </p>
          <button
            type="button"
            disabled={pick !== null}
            onClick={() => pickQ6(q6.wrong.key)}
            data-target={`q6-${q6.wrong.key}`}
            className={cx(option, "mt-4", wrong ? "border-[#e5484d] bg-[#feebf1] text-[#d23c3c]" : idle)}
          >
            <span>
              {q6.wrong.key}. <span lang="ms">{q6.wrong.ms}</span> / {q6.wrong.en}
            </span>
            {wrong && <Mark ok={false} className="size-7 shrink-0" />}
          </button>
          <AnimatePresence initial={false}>
            {wrong && (
              <motion.div key="why" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} transition={open} className="overflow-hidden">
                <div ref={why} className="pt-3.5">
                  <div className="rounded-[14px] border-2 border-[#ffe3e3] p-4">
                    <p className="flex items-center gap-2 text-[16px] text-[#d23c3c]">
                      <span aria-hidden="true" className="grid size-[18px] place-items-center rounded-full border-[1.5px] border-current text-[11px] leading-none">
                        i
                      </span>
                      Why {q6.wrong.key} is wrong:
                    </p>
                    <span aria-hidden="true" className="mt-3 inline-flex h-[44px] items-center gap-6 rounded-[12px] border-[1.5px] border-[#a9adb3] px-4 text-[15px] text-[#d23c3c]">
                      Hide Explanation
                      <svg width="14" height="8" viewBox="0 0 14 8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 7l6-6 6 6" />
                      </svg>
                    </span>
                    <p className="mt-3 text-[14px] leading-[1.5] text-[#5b6270]">
                      <span lang="ms">{q6.why.ms}</span> / {q6.why.en}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            type="button"
            disabled={pick !== null}
            onClick={() => pickQ6(q6.right.key)}
            data-target={`q6-${q6.right.key}`}
            className={cx(option, "mt-3.5", pick !== null ? "border-[#5cb85c] bg-[#e1f7e0] text-[#2f7a3a]" : idle)}
          >
            <span>
              {q6.right.key}. <span lang="ms">{q6.right.ms}</span> / {q6.right.en}
            </span>
            {pick !== null && <Mark ok className="size-7 shrink-0" />}
          </button>
          <AnimatePresence initial={false}>
            {pick !== null && (
              <motion.div key="next" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={reduce ? { duration: 0 } : { delay: 0.3, duration: 0.3 }}>
                <Press onClick={next} target="next" className={cx(btn.primary, "mt-5 w-full tracking-[0.04em]")}>
                  Next Question
                </Press>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={end} />
        </div>
      </div>
      <p role="status" className="sr-only">
        {wrong && `Not quite. Why ${q6.wrong.key} is wrong: ${q6.why.en} The answer is ${q6.right.key}, ${q6.right.en}.`}
      </p>
    </div>
  );
}
