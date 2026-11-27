"use client";

import { AnimatePresence, motion } from "motion/react";
import { Image } from "@/components/image";
import { useContext, useId, useState, useSyncExternalStore } from "react";
import { minutes, tuitionPage, type Form, type Slot } from "@/lib/pages";
import { everyMinute, malaysiaNow, nextClass, type ClockHost } from "@/lib/tonight";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { Mascot } from "../mascot";
import { easeOutExpo } from "../motion";
import { subjectDot, subjectKey, subjectLang } from "../subject";
import { FormTabs, TimetableContext } from "../timetable-grid";
import { cx } from "../ui";

/** The timetable's weekdays in the page's language; the Malay site swaps these words like any other copy. */
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;

type Photo = { readonly src: string; readonly w: number; readonly h: number };
const photos = new Map<string, Photo>(tuitionPage.tutors.list.map((tutor) => [tutor.name, tutor]));

const browser: ClockHost = {
  now: () => Date.now(),
  setTimeout: (run, ms) => window.setTimeout(run, ms),
  clearTimeout: (timer) => window.clearTimeout(timer),
  onReturn: (run) => {
    const shown = () => {
      if (document.visibilityState === "visible") run();
    };
    // A tab brought to the front, and a page restored from the back/forward cache, which pageshow alone reports.
    document.addEventListener("visibilitychange", shown);
    window.addEventListener("pageshow", run);
    return () => {
      document.removeEventListener("visibilitychange", shown);
      window.removeEventListener("pageshow", run);
    };
  },
};

/* The clock as minutes into the Malaysian week: a number, so React can compare snapshots, read on each minute. */
const subscribe = (tick: () => void) => everyMinute(tick, browser);
const readClock = () => {
  const { day, minute } = malaysiaNow();
  return day * 1440 + minute;
};

function wait(total: number) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

/** How far through its class a minute is, as a percentage. */
const elapsed = (slot: Slot, minute: number) => Math.round(((minute - minutes(slot.start)) / (minutes(slot.end) - minutes(slot.start))) * 100);

/** The subject's own colour, washed out to a backdrop. */
const wash = (subject: string) => ({ backgroundColor: `color-mix(in srgb, var(--color-${subjectKey(subject)}) 16%, white)` });

function Cutout({ tutor }: { tutor: string }) {
  const photo = photos.get(tutor);
  if (!photo) return <Mascot mood="wave" outfit="school" decorative className="absolute bottom-2 right-1 w-[78%]" />;
  return <Image src={photo.src} alt="" width={photo.w} height={photo.h} sizes="240px" className="absolute bottom-0 right-[4%] h-[112%] w-auto max-w-none" />;
}

/**
 * Tuition as it runs tonight, from the real timetable and the time in Kuala Lumpur: pick a form and the class that's
 * on now (or next) stands in front, its tutor cut out over the subject's colour, with the rest of the week below to
 * tap through. Static HTML can't know the time, so the class and the chosen day stay hidden until the clock is read.
 */
export function Tonight({ className }: { className?: string }) {
  const id = useId();
  const { weeks } = useContext(TimetableContext);
  const [form, setForm] = useState<Form>(5);
  const [picked, setPicked] = useState<number | null>(null);
  const clock = useSyncExternalStore(subscribe, readClock, () => null);
  // With reduced motion the class only crossfades. Leaving the offsets in for MotionConfig to strip makes them jump.
  const travel = usePrefersReducedMotion() ? 0 : 1;

  const week = weeks[form];
  const now = clock === null ? null : { day: Math.floor(clock / 1440), minute: clock % 1440 };
  const next = now && nextClass(week, now);
  const shown = picked === null ? next : null;
  const day = picked ?? next?.day ?? 0;
  const classes: readonly Slot[] = week[day] ?? [];
  const lead = shown?.slot ?? classes[0];
  const today = now && now.day < 5 ? now.day : null;
  const ready = now !== null;

  function choose(f: Form) {
    setForm(f);
    setPicked(null);
  }

  return (
    <div className={cx("rounded-[2rem] border-2 border-b-4 border-mint-deep bg-paper p-3 shadow-[0_32px_64px_-44px_color-mix(in_srgb,var(--color-brand-ledge)_70%,transparent)] sm:p-5", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 pt-1">
        <p className="label text-muted">Live classes</p>
        <FormTabs id={id} form={form} onChange={choose} />
      </div>

      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${form}`} className="mt-10">
        <AnimatePresence mode="popLayout" initial={false}>
          {lead && (
            <motion.div
              key={`${form}-${day}-${lead.subject}-${lead.start}`}
              initial={{ opacity: 0, y: 14 * travel }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 * travel, transition: { duration: 0.18 } }}
              transition={{ duration: 0.5, ease: easeOutExpo }}
              style={wash(lead.subject)}
              className="relative min-h-[17rem] rounded-3xl p-5 sm:min-h-[19rem] sm:p-7"
            >
              <motion.div initial={{ y: 28 * travel }} animate={{ y: 0 }} transition={{ duration: 0.7, ease: easeOutExpo }} className={cx("pointer-events-none absolute inset-y-0 right-0 w-[48%]", !ready && "invisible")}>
                <Cutout tutor={lead.tutor} />
              </motion.div>

              <div className={cx("relative max-w-[60%]", !ready && "invisible")}>
                <p className="inline-flex items-center gap-2 rounded-full bg-paper px-3 py-1.5 text-caption font-extrabold uppercase tracking-[0.06em] text-forest">
                  {shown?.kind === "live" ? (
                    <>
                      <span aria-hidden="true" className="relative grid size-2.5 place-items-center">
                        <span className="absolute inset-0 animate-ping rounded-full bg-brand" />
                        <span className="size-2.5 rounded-full bg-brand-ink" />
                      </span>
                      Live now
                    </>
                  ) : shown?.kind === "today" ? (
                    <>Tonight</>
                  ) : (
                    <>{days[day]}</>
                  )}
                </p>
                <h3 lang={subjectLang(lead.subject)} className="mt-5 text-[clamp(1.625rem,1.2rem+1.6vw,2.375rem)] font-black leading-[1.05] text-forest [overflow-wrap:anywhere]">
                  {lead.subject}
                </h3>
                <p className="mt-2 font-bold text-forest">with {lead.tutor}</p>
                <p className="nums mt-1 text-body-sm font-semibold text-muted">
                  {lead.start} – {lead.end}
                </p>
                {shown?.kind === "live" && now && (
                  <div className="mt-5 max-w-[12rem]">
                    <p className="text-body-sm font-extrabold text-brand-text">{`Until ${lead.end}`}</p>
                    {/* How far through the class it is. */}
                    <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-paper">
                      <span className="block h-full rounded-full bg-brand-ink" style={{ width: `${elapsed(lead, now.minute)}%` }} />
                    </span>
                  </div>
                )}
                {shown?.kind === "today" && <p className="nums mt-5 text-body-sm font-extrabold text-brand-text">{`Starts in ${wait(shown.wait)}`}</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {classes.length > 1 && (
          <ul className="mt-3 grid gap-1.5">
            {classes
              .filter((slot) => slot !== lead)
              .map((slot) => (
                <li key={`${slot.subject}-${slot.start}`} className="flex items-center gap-3 rounded-2xl bg-cream px-4 py-2.5 text-body-sm">
                  <span aria-hidden="true" className={cx("size-2 shrink-0 rounded-full", subjectDot[subjectKey(slot.subject)])} />
                  <span lang={subjectLang(slot.subject)} className="min-w-0 flex-1 truncate font-extrabold text-forest">
                    {slot.subject}
                  </span>
                  <span className="nums shrink-0 font-semibold text-muted">{slot.start}</span>
                </li>
              ))}
          </ul>
        )}

        <div role="group" aria-label="Choose a day" className="mt-3 grid grid-cols-5 gap-1.5">
          {days.map((name, i) => {
            const selected = ready && i === day;
            return (
              <button
                key={name}
                type="button"
                aria-pressed={selected}
                // The status day is the default, so choosing it again keeps its live or tonight state.
                onClick={() => setPicked(i === next?.day ? null : i)}
                className={cx("tap grid min-h-14 content-center justify-items-center gap-1.5 rounded-2xl px-1 py-2 transition-colors", selected ? "bg-forest text-on-forest" : "bg-cream text-forest hover:bg-mint")}
              >
                {/* Three letters below lg, where the card is too narrow for five full names across. */}
                <span className={cx("text-[0.8125rem] font-extrabold leading-none", !selected && i === today && "text-brand-text")}>
                  <span className="lg:hidden">{name.slice(0, 3)}</span>
                  <span className="max-lg:hidden">{name}</span>
                  {i === today && <span className="sr-only"> Today</span>}
                </span>
                <span aria-hidden="true" className="flex gap-1">
                  {(week[i] ?? []).map((slot) => (
                    <span key={`${slot.subject}-${slot.start}`} className={cx("size-1.5 rounded-full", subjectDot[subjectKey(slot.subject)])} />
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
