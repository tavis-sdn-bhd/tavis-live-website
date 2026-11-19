"use client";

import { AnimatePresence, motion, useIsPresent, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ComponentType, type ReactNode, type RefObject } from "react";
import { useStoreLink } from "@/lib/use-store-link";
import { Student } from "../student";
import { cx } from "../ui";
import { Device } from "./device";
import {
  CardsScreen,
  ClassesScreen,
  DoneScreen,
  ExplanationScreen,
  HistoryScreen,
  HomeScreen,
  LeaderboardScreen,
  MeScreen,
  QuestionScreen,
  RewardsScreen,
  UniverseScreen,
} from "./screens";
import { AppProvider, useApp, type Scene, type ScreenId, type Tab } from "./state";

/* ── Tab bar, as in the app ───────────────────────────────────────────── */

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

const tabs: Array<{ id: Tab; label: string; icon: ReactNode }> = [
  {
    id: "home",
    label: "Home",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" {...stroke}>
        <path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1Z" />
      </svg>
    ),
  },
  {
    id: "classes",
    label: "Classes",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" {...stroke}>
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 3v4M16 3v4M4 10h16M12 17s-3-1.8-3-3.6a1.6 1.6 0 0 1 3-.8 1.6 1.6 0 0 1 3 .8C15 15.2 12 17 12 17Z" />
      </svg>
    ),
  },
  {
    id: "universe",
    label: "Question Universe",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" {...stroke}>
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
        <path d="M14 3v5h5M9 13h3M9 17h2M16 13.5a1.5 1.5 0 1 1 1.5 1.5v1M17.5 18.5v.01" />
      </svg>
    ),
  },
  {
    id: "history",
    label: "History",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" {...stroke}>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5V12l3 2" />
      </svg>
    ),
  },
  { id: "me", label: "Me", icon: null },
];

/* A mock app inside the page, so not a nav landmark: a group of buttons marking the current one. */
function TabBar() {
  const { tab, setTab, look } = useApp();
  return (
    <div role="group" aria-label="App tabs" className="absolute inset-x-0 bottom-0 z-30 flex h-[96px] justify-around border-t border-line bg-paper px-2 pt-2.5">
      {tabs.map((t) => {
        const active = t.id === tab;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            aria-current={active ? "true" : undefined}
            className={cx("flex w-[72px] flex-col items-center gap-1 text-center transition-transform duration-100 active:scale-[0.92]", active ? "text-brand-text" : "text-app-muted")}
          >
            {t.icon ? (
              <span className={cx("flex h-9 w-[52px] items-center justify-center rounded-full", active && "bg-mint")}>
                {t.icon}
              </span>
            ) : (
              <span className={cx("size-[28px] overflow-hidden rounded-full bg-mint", active && "ring-2 ring-brand")}>
                <Student look={look} head className="size-full" />
              </span>
            )}
            <span className="text-[12px] leading-[1.1]">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ── Toast: in-app hints that hand off to the real app ────────────────── */

function ToastCard({ text, handoff }: { text: string; handoff: boolean }) {
  const { dismiss } = useApp();
  const storeLink = useStoreLink();
  const present = useIsPresent();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  // A "Get app" toast stays long enough to reach its button; reading or tabbing into it holds it open.
  useEffect(() => {
    if (!present || hovered || focused) return;
    const id = window.setTimeout(dismiss, handoff ? 5000 : 2800);
    return () => window.clearTimeout(id);
  }, [present, hovered, focused, handoff, dismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => setFocused(e.relatedTarget instanceof Node && e.currentTarget.contains(e.relatedTarget))}
      className="pointer-events-auto flex w-full items-center gap-3 rounded-[18px] bg-forest py-3 pl-4 pr-2 text-white shadow-[0_12px_30px_rgb(0_0_0/0.25)]"
    >
      <span className="flex-1 text-[15px] leading-snug">{text}</span>
      {handoff && (
        <a
          href={storeLink}
          onClick={dismiss}
          className="shrink-0 rounded-[12px] bg-brand px-3.5 py-2 font-display text-[14px] text-forest transition-transform duration-100 active:scale-[0.95]"
        >
          Get app
        </a>
      )}
    </motion.div>
  );
}

function Toast() {
  const { toast } = useApp();
  return (
    <div role="status" aria-live="polite" className="pointer-events-none absolute inset-x-4 bottom-[112px] z-40 flex justify-center">
      <AnimatePresence>{toast && <ToastCard key={toast.id} text={toast.text} handoff={toast.handoff} />}</AnimatePresence>
    </div>
  );
}

/* ── Router ───────────────────────────────────────────────────────────── */

const screens: Record<ScreenId, ComponentType> = {
  home: HomeScreen,
  classes: ClassesScreen,
  universe: UniverseScreen,
  history: HistoryScreen,
  me: MeScreen,
  question: QuestionScreen,
  done: DoneScreen,
  rewards: RewardsScreen,
  cards: CardsScreen,
  leaderboard: LeaderboardScreen,
  explanation: ExplanationScreen,
};

const slide = { type: "spring", stiffness: 380, damping: 40 } as const;

function focusables(screen: Element) {
  return Array.from(screen.querySelectorAll<HTMLElement>("button:not([disabled]), a[href]"));
}

/**
 * Every navigation remounts the screen, which would drop focus to <body>.
 * When focus was in the outgoing screen, move it into the new one: on a pop,
 * back to the control that opened the popped screen (by position, since that
 * element was remounted); otherwise to the screen's title. Openers inside
 * `data-transient` UI (the answer drawer) are not there on return, so those
 * pops go to the title.
 */
function useScreenFocus(root: RefObject<HTMLDivElement | null>, stack: readonly string[]) {
  const shown = useRef(stack);
  const openers = useRef<number[]>([]);

  useEffect(() => {
    const before = shown.current;
    shown.current = stack;
    const el = root.current;
    if (before === stack || !el) return;

    const screenEl = (s: readonly string[]) => el.querySelector(`[data-screen="${s.join("/")}"]`);
    const from = screenEl(before);
    const to = screenEl(stack);
    const active = document.activeElement;
    const fromHadFocus = active instanceof HTMLElement && !!from?.contains(active);

    if (stack[0] !== before[0]) openers.current = [];
    else if (stack.length > before.length)
      openers.current[before.length - 1] = fromHadFocus && from && !active.closest("[data-transient]") ? focusables(from).indexOf(active) : -1;

    if (!to || !(fromHadFocus || active === document.body)) return;
    const opener = stack.length < before.length ? focusables(to)[openers.current[stack.length - 1] ?? -1] : undefined;
    (opener ?? to.querySelector<HTMLElement>("[data-screen-title]") ?? focusables(to)[0])?.focus({ preventScroll: true });
  }, [root, stack]);
}

function Shell() {
  const { stack, dir, screen } = useApp();
  const reduce = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  useScreenFocus(root, stack);
  const Current = screens[screen];
  const rooted = stack.length === 1;
  const key = stack.join("/");

  const variants = {
    enter: (d: number) => (reduce || d === 0 ? { opacity: 0 } : { x: d > 0 ? "100%" : "-28%", opacity: d > 0 ? 1 : 0.6 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => (reduce || d === 0 ? { opacity: 0 } : { x: d > 0 ? "-28%" : "100%", opacity: d > 0 ? 0.6 : 1 }),
  };

  return (
    <div ref={root} className="absolute inset-0 overflow-hidden bg-cream font-display">
      <AnimatePresence initial={false} custom={dir}>
        <motion.div
          key={key}
          data-screen={key}
          custom={dir}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={dir === 0 ? { duration: 0.18 } : slide}
          className={cx("absolute inset-0", dir > 0 ? "z-20 shadow-[-12px_0_30px_rgb(0_0_0/0.08)]" : "z-10")}
        >
          <Current />
        </motion.div>
      </AnimatePresence>
      <AnimatePresence initial={false}>
        {rooted && (
          <motion.div key="tabs" className="absolute inset-x-0 bottom-0 z-30" initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} transition={slide}>
            <TabBar />
          </motion.div>
        )}
      </AnimatePresence>
      <Toast />
    </div>
  );
}

/**
 * The Tavis app, running inside a realistic phone: Home, Question Universe,
 * Learning Cards, Rewards, Classes, History and Me, with real navigation and
 * points that carry across screens. Built from real app content.
 * `children` render beside the device inside the app's state, so they can
 * react to it (e.g. the mascot).
 *
 * On touch, the phone's screens don't scroll until the visitor taps inside it
 * (`data-locked`), so swiping past it scrolls the page. Leaving view re-locks it.
 */
export function TavisPhone({ children, className }: { children?: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [engaged, setEngaged] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry && !entry.isIntersecting) setEngaged(false);
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      role="group"
      aria-label="Try the Tavis app"
      data-locked={engaged ? undefined : ""}
      onClick={() => setEngaged(true)}
      className={cx("group/phone relative w-fit", className)}
    >
      <AppProvider>
        <Device>
          <Shell />
        </Device>
        {children}
      </AppProvider>
    </div>
  );
}

/** One moment of the app, frozen, for mockups: the same screens as `TavisPhone`, opened at `scene` and never interactive. */
export function AppScene({ scene }: { scene: Scene }) {
  return (
    <AppProvider scene={scene}>
      <Device>
        <Shell />
      </Device>
    </AppProvider>
  );
}
