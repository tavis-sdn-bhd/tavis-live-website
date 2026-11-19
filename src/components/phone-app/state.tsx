"use client";

import { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";
import { q17, type OptionKey } from "@/lib/questions";
import type { Look } from "../student";

/* ── Model ──────────────────────────────────────────────────────────────── */

export type Tab = "home" | "classes" | "universe" | "history" | "me";
export type Pushed = "question" | "done" | "rewards" | "cards" | "leaderboard" | "explanation";
export type ScreenId = Tab | Pushed;
/** Each look in the avatar shop, by name. */
export const looks: Record<Look, string> = {
  pink: "Pink sweater",
  green: "Tudung and baju kurung",
  blue: "Blue T-shirt",
};

/** Points shown on the app's Home screenshot. */
const BASE_POINTS = 3204;

type Answer = { correct: boolean; picked: OptionKey };

type State = {
  /** The tab is the bottom of the stack; pushed screens sit on top. */
  stack: [Tab, ...Pushed[]];
  /** +1 push, -1 pop, 0 tab switch: drives the slide direction. */
  dir: -1 | 0 | 1;
  answers: Answer[];
  /** The pick on the current attempt, if any. */
  picked: OptionKey | null;
  checkedIn: boolean;
  look: Look;
  toast: { id: number; text: string; handoff: boolean } | null;
};

type Action =
  | { type: "tab"; tab: Tab }
  | { type: "push"; screen: Pushed }
  | { type: "pop" }
  | { type: "home" }
  | { type: "pick"; key: OptionKey }
  | { type: "retry" }
  | { type: "checkIn" }
  | { type: "look"; look: Look }
  | { type: "toast"; text: string; handoff: boolean }
  | { type: "dismiss" };

const initial: State = { stack: ["home"], dir: 0, answers: [], picked: null, checkedIn: false, look: "pink", toast: null };

/** Moments in the app, frozen for mockups: where the visitor is and what they have done to get there. */
const scenes = {
  home: {},
  universe: { stack: ["universe"] },
  question: { stack: ["universe", "question"] },
  correct: { stack: ["universe", "question"], picked: q17.answer, answers: [{ correct: true, picked: q17.answer }] },
  explanation: { stack: ["universe", "explanation"] },
  cards: { stack: ["home", "cards"] },
  rewards: { stack: ["home", "rewards"] },
  leaderboard: { stack: ["universe", "leaderboard"] },
  me: { stack: ["me"] },
  classes: { stack: ["classes"] },
} satisfies Record<string, Partial<State>>;

export type Scene = keyof typeof scenes;

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "tab":
      return s.stack.length === 1 && s.stack[0] === a.tab ? s : { ...s, stack: [a.tab], dir: 0 };
    case "push":
      if (s.stack[s.stack.length - 1] === a.screen) return s;
      return { ...s, stack: [...s.stack, a.screen], dir: 1, picked: a.screen === "question" ? null : s.picked };
    case "pop":
      return s.stack.length > 1 ? { ...s, stack: s.stack.slice(0, -1) as State["stack"], dir: -1 } : s;
    case "home":
      return { ...s, stack: ["home"], dir: -1, picked: null };
    case "pick":
      return s.picked ? s : { ...s, picked: a.key, answers: [{ correct: a.key === q17.answer, picked: a.key }, ...s.answers] };
    case "retry": {
      const onDone = s.stack[s.stack.length - 1] === "done";
      return { ...s, picked: null, ...(onDone ? { stack: s.stack.slice(0, -1) as State["stack"], dir: -1 as const } : {}) };
    }
    case "checkIn":
      return { ...s, checkedIn: true };
    case "look":
      return { ...s, look: a.look };
    case "toast":
      return { ...s, toast: { id: (s.toast?.id ?? 0) + 1, text: a.text, handoff: a.handoff } };
    case "dismiss":
      return { ...s, toast: null };
  }
}

/* ── Context ────────────────────────────────────────────────────────────── */

type Actions = {
  go: (screen: Pushed) => void;
  back: () => void;
  home: () => void;
  setTab: (tab: Tab) => void;
  pick: (key: OptionKey) => void;
  retry: () => void;
  checkIn: () => void;
  setLook: (look: Look) => void;
  /** A plain in-app message. */
  say: (text: string) => void;
  /** A message for something that lives in the real app, with a "Get app" button. */
  handoff: (text: string) => void;
  dismiss: () => void;
};

type Ctx = State &
  Actions & {
    points: number;
    /** The latest answer is the first correct one, so it earned the reward. */
    rewarded: boolean;
    tab: Tab;
    screen: ScreenId;
  };

const AppContext = createContext<Ctx | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}

export function AppProvider({ children, scene = "home" }: { children: ReactNode; scene?: Scene }) {
  const [state, dispatch] = useReducer(reducer, scene, (s) => ({ ...initial, ...scenes[s] }));

  /* Actions only close over dispatch, so they are built once. */
  const actions = useMemo<Actions>(
    () => ({
      go: (screen) => dispatch({ type: "push", screen }),
      back: () => dispatch({ type: "pop" }),
      home: () => dispatch({ type: "home" }),
      setTab: (tab) => dispatch({ type: "tab", tab }),
      pick: (key) => dispatch({ type: "pick", key }),
      retry: () => dispatch({ type: "retry" }),
      checkIn: () => dispatch({ type: "checkIn" }),
      setLook: (look) => dispatch({ type: "look", look }),
      say: (text) => dispatch({ type: "toast", text, handoff: false }),
      handoff: (text) => dispatch({ type: "toast", text, handoff: true }),
      dismiss: () => dispatch({ type: "dismiss" }),
    }),
    [],
  );

  const value = useMemo<Ctx>(
    () => ({
      ...state,
      ...actions,
      // The question pays out once, however many times it is retried.
      points: BASE_POINTS + (state.answers.some((a) => a.correct) ? q17.reward : 0),
      rewarded: state.answers[0]?.correct === true && state.answers.filter((a) => a.correct).length === 1,
      tab: state.stack[0],
      screen: state.stack[state.stack.length - 1] ?? state.stack[0],
    }),
    [state, actions],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
