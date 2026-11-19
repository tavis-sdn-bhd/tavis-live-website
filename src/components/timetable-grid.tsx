"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useId, useState, type KeyboardEvent } from "react";
import { timetable2027, weekByForm, type Slot } from "@/lib/pages";
import { easeOutExpo } from "./motion";
import { subjectDot, subjectKey, subjectLang } from "./subject";
import { cx } from "./ui";

type Form = 1 | 2 | 3 | 4 | 5;
const forms: readonly Form[] = [1, 2, 3, 4, 5];

function ClassSlot({ slot }: { slot: Slot }) {
  return (
    <div className="rounded-xl border-2 border-line bg-paper p-3">
      <p className="flex items-center gap-2 font-display text-body-sm leading-tight text-forest">
        <span aria-hidden="true" className={cx("size-2 shrink-0 rounded-full", subjectDot[subjectKey(slot.subject)])} />
        <span lang={subjectLang(slot.subject)} className="min-w-0 [overflow-wrap:anywhere]">{slot.subject}</span>
      </p>
      <p className="mt-1 text-[0.8125rem] text-ink">{slot.tutor}</p>
      <p className="nums mt-2 text-[0.8125rem] font-medium text-muted">
        {slot.start} – {slot.end}
      </p>
    </div>
  );
}

/**
 * The 2027 class timetable as real data instead of a picture: pick a form,
 * see the week. Weekly public holidays sit under the day they fall on.
 */
export function TimetableGrid() {
  const [form, setForm] = useState<Form>(5);
  const id = useId();
  const week = weekByForm[form];

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const last = forms.length - 1;
    const keys: Record<string, (i: number) => number> = {
      ArrowRight: (i) => (i + 1) % forms.length,
      ArrowLeft: (i) => (i + last) % forms.length,
      Home: () => 0,
      End: () => last,
    };
    const move = keys[event.key];
    if (!move) return;
    event.preventDefault();
    const next = forms[move(forms.indexOf(form))] ?? 1;
    setForm(next);
    document.getElementById(`${id}-tab-${next}`)?.focus();
  }

  return (
    <div className="card p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 px-2 pt-1 sm:px-3">
        <p className="label text-muted">
          <span lang="ms">Tingkatan</span> <span>/ Form</span>
        </p>
        <LayoutGroup id={id}>
          <div role="tablist" aria-label="Choose your form" onKeyDown={onKeyDown} className="flex gap-1 rounded-control bg-cream p-1 max-sm:grid max-sm:w-full max-sm:grid-cols-5">
            {forms.map((f) => {
              const selected = f === form;
              return (
                <button
                  key={f}
                  id={`${id}-tab-${f}`}
                  role="tab"
                  type="button"
                  aria-selected={selected}
                  aria-controls={`${id}-panel`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setForm(f)}
                  className={cx("tap relative grid h-11 min-w-11 place-items-center rounded-[0.625rem] px-3 font-display text-body-sm max-sm:w-full", selected ? "text-on-forest" : "text-forest hover:bg-paper")}
                >
                  {selected && (
                    <motion.span layoutId="form-pill" className="absolute inset-0 rounded-[0.625rem] bg-forest shadow-ledge-dark" transition={{ type: "spring", stiffness: 500, damping: 38 }} />
                  )}
                  <span className="relative">F{f}</span>
                </button>
              );
            })}
          </div>
        </LayoutGroup>
      </div>

      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${form}`} className="mt-4 grid gap-2 lg:grid-cols-5">
        {timetable2027.days.map((day, d) => {
          const classes = week[d] ?? [];
          const holidays = timetable2027.holidays[d] ?? [];
          return (
            <section key={day.ms} aria-labelledby={`${id}-day-${d}`} className="flex flex-col rounded-2xl bg-cream p-2">
              <header className="flex items-baseline justify-between px-2 pb-2 pt-1">
                <h3 id={`${id}-day-${d}`} lang="ms" className="text-body-lg">
                  {day.ms}
                </h3>
                <span className="label text-muted">{day.en}</span>
              </header>
              <div className="grid gap-1.5">
                <AnimatePresence mode="popLayout" initial={false}>
                  {classes.map((slot, i) => (
                    <motion.div
                      key={`${form}-${slot.subject}-${slot.start}`}
                      layout
                      initial={{ opacity: 0, y: 10, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.45, ease: easeOutExpo, delay: d * 0.04 + i * 0.05 }}
                    >
                      <ClassSlot slot={slot} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <div className="mt-auto pt-3">
                <p className="label px-2 text-muted">
                  <span lang="ms">Cuti umum</span> / Holidays
                </p>
                <ul className="mt-1.5 space-y-1 px-2 pb-1">
                  {holidays.map((h) => (
                    <li key={h.date} lang="ms" className="text-[0.8125rem] leading-snug text-muted">
                      <span className="nums font-medium text-ink">{h.date}</span> · {h.name}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
