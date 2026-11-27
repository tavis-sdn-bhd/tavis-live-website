import { minutes, type Slot } from "./pages";

/** A moment in Malaysian time: `day` 0 is Monday and 6 is Sunday, `minute` counts from midnight. */
export type Moment = { day: number; minute: number };

/** Where a form's week stands at a moment: a class running now, one later today, or the next one on another day. */
export type Next =
  | { kind: "live"; day: number; slot: Slot }
  | { kind: "today"; day: number; slot: Slot; wait: number }
  | { kind: "later"; day: number; slot: Slot };

/** The class a visitor should see first for a week of Monday-to-Friday days, each in time order. Null for an empty week. */
export function nextClass(week: readonly (readonly Slot[])[], now: Moment): Next | null {
  const today = week[now.day] ?? [];
  const live = today.find((slot) => minutes(slot.start) <= now.minute && now.minute < minutes(slot.end));
  if (live) return { kind: "live", day: now.day, slot: live };
  const soon = today.find((slot) => minutes(slot.start) > now.minute);
  if (soon) return { kind: "today", day: now.day, slot: soon, wait: minutes(soon.start) - now.minute };
  for (let offset = 1; offset <= 7; offset++) {
    const day = (now.day + offset) % 7;
    const first = week[day]?.[0];
    if (first) return { kind: "later", day, slot: first };
  }
  return null;
}

/** Kuala Lumpur keeps UTC+8 all year, with no daylight saving. */
const malaysiaOffset = 8 * 60 * 60 * 1000;

/** The time in Kuala Lumpur, where every class runs, whatever the visitor's own time zone. */
export function malaysiaNow(date = new Date()): Moment {
  const local = new Date(date.getTime() + malaysiaOffset);
  return { day: (local.getUTCDay() + 6) % 7, minute: local.getUTCHours() * 60 + local.getUTCMinutes() };
}

/** What the minute clock needs from the browser, passed in so tests can drive it. */
export type ClockHost = {
  now: () => number;
  setTimeout: (run: () => void, ms: number) => number;
  clearTimeout: (timer: number) => void;
  /** Calls `run` whenever the page comes back into view, and returns how to stop. */
  onReturn: (run: () => void) => () => void;
};

const minute = 60_000;

/**
 * Calls `tick` as each minute starts, so a countdown changes on the minute rather than up to a timer's period late;
 * Kuala Lumpur's offset is whole hours, so its minutes start with UTC's. Browsers throttle timers in background tabs
 * and freeze them on iOS, so `tick` also runs the moment the page returns, and the schedule restarts from then.
 * Returns how to stop.
 */
export function everyMinute(tick: () => void, host: ClockHost): () => void {
  let timer = 0;
  const schedule = () => {
    timer = host.setTimeout(() => {
      tick();
      schedule();
    }, minute - (host.now() % minute));
  };
  const resync = () => {
    host.clearTimeout(timer);
    tick();
    schedule();
  };
  schedule();
  const stopWatching = host.onReturn(resync);
  return () => {
    host.clearTimeout(timer);
    stopWatching();
  };
}
