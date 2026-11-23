"use client";

import { Image } from "@/components/image";
import { useState } from "react";
import { SubjectChip, subjectKey, subjectLang, type SubjectKey } from "@/components/subject";
import { cx } from "@/components/ui";
import { chunky } from "@/components/v2/ui";
import { credentialDot, timetableSubjects, tuitionPage, tutorsPage } from "@/lib/pages";

const tutors = tuitionPage.tutors.list;

/** Subjects someone on the list teaches, in timetable order. */
const subjects = timetableSubjects.filter((name) => tutors.some((t) => (t.subjects as readonly string[]).includes(name)));

/* Literal class names so Tailwind sees them: a pale field in the tutor's first subject's colour. */
const field: Record<SubjectKey, string> = {
  sci: "bg-sci/15",
  math: "bg-math/15",
  bm: "bg-bm/15",
  en: "bg-en/15",
  hist: "bg-hist/20",
  acc: "bg-acc/15",
};

/** Every tutor as a card, with chips to show only the tutors of one subject. */
export function TutorGrid() {
  const [subject, setSubject] = useState<string | null>(null);
  const shown = subject ? tutors.filter((t) => (t.subjects as readonly string[]).includes(subject)) : tutors;
  const chip = "tap inline-flex min-h-11 items-center rounded-full border-2 px-4 font-display text-[0.8125rem] uppercase tracking-[0.05em]";
  const on = "border-sky bg-sky/10 text-sky-ink";
  const off = "border-line text-muted hover:border-line-strong hover:text-forest";

  return (
    <>
      {/* Phones swipe the chips sideways rather than stacking seven rows of them. */}
      <div
        role="group"
        aria-label="Show tutors by subject"
        data-reflows
        className="mx-auto flex max-w-[60rem] gap-2 max-sm:-mx-4 max-sm:overflow-x-auto max-sm:overscroll-x-contain max-sm:px-4 max-sm:pb-2 max-sm:[scrollbar-width:none] sm:flex-wrap sm:justify-center"
      >
        <button type="button" aria-pressed={subject === null} onClick={() => setSubject(null)} className={cx(chip, "shrink-0", subject === null ? on : off)}>
          {tutorsPage.list.all}
        </button>
        {subjects.map((name) => (
          <button key={name} type="button" lang={subjectLang(name)} aria-pressed={subject === name} onClick={() => setSubject(name)} className={cx(chip, "shrink-0 whitespace-nowrap", subject === name ? on : off)}>
            {name}
          </button>
        ))}
      </div>
      <p aria-live="polite" className="sr-only">
        {subject ? `${shown.length} ${shown.length === 1 ? "tutor teaches" : "tutors teach"} ${subject}` : `${tutors.length} tutors, all subjects`}
      </p>
      {/* Flex, not grid, so a short last row sits centred. */}
      <ul className="mx-auto mt-10 flex max-w-[66rem] flex-wrap justify-center gap-3 sm:mt-12 sm:gap-5">
        {shown.map((t) => (
          <li key={t.name} className="w-[calc(50%-0.375rem)] sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.834rem)]">
            <article className={cx(chunky, "flex h-full flex-col overflow-hidden")}>
              <div className={cx("relative aspect-square sm:aspect-[4/3]", field[subjectKey(t.subjects[0])])}>
                <Image
                  src={t.src}
                  alt={`${t.name}, Tavis tutor`}
                  width={t.w}
                  height={t.h}
                  sizes="160px"
                  className="absolute bottom-0 left-1/2 h-[92%] w-auto max-w-none -translate-x-1/2 object-contain object-bottom"
                />
              </div>
              <div className="@container flex flex-1 flex-col p-3.5 sm:p-5">
                <h3 className="text-[1.125rem] leading-tight text-forest sm:text-[1.375rem]">{t.name}</h3>
                <p className="mt-1 text-small font-semibold text-muted">
                  {t.credential.split(credentialDot).map((part, i) => (
                    <span key={part} className="max-sm:block">
                      {i > 0 && <span className="max-sm:hidden">{credentialDot}</span>}
                      {part}
                    </span>
                  ))}
                </p>
                <p className="mt-auto flex flex-wrap gap-1.5 pt-4">
                  {t.subjects.map((s) => (
                    <SubjectChip key={s} name={s} lang="ms" className="w-min max-w-full @[10rem]:w-auto sm:whitespace-nowrap sm:text-small" />
                  ))}
                </p>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </>
  );
}
