"use client";

import { q17 } from "@/lib/questions";
import { Close } from "../icons";
import { Pencil } from "../phone-app/screens";
import { SubjectArt, type ArtSubject } from "../phone-app/subject-art";
import { BASE_POINTS } from "../phone-app/state";
import { Coin } from "../coin";
import { Bar, type Act } from "../stageshow";
import { cx } from "../ui";
import { AppPhone, AppStage, tap, type Design } from "./app-stage";

/*
  BA's Question Universe row: pick a form and a subject, and the practice opens.

  Beats (about 11s, a loop):
  1. Question Universe, as the client's screenshot draws it, on Form 4.
  2. Tap Form 5: the tick moves and every subject reads F5.
  3. Tap F5 Sains: the question pushes in from the right. Hold.
  4. Tap close: it slides back to the subjects.
  5. Tap Form 4: back where the loop began, by a cause on screen.

  Real words: the two headings, the form chips and the subject names. The question shows its Malay stem, the rest
  bars. From the source: the screen (the client's Question Universe screenshot), q17's stem and the 3204 points.
  Biologi and Kimia are read off the two icons cut by the screenshot's foot. Deviation: the subject tiles are 158pt
  tall, not the screenshot's 135, with their content centred, so it sits as far from the tile's top and foot as from
  its sides (the gate's even padding).
*/

type Form = 4 | 5;
type S = { form: Form; open: boolean };

const START: S = { form: 4, open: false };
const POSTER: S = { form: 5, open: false };

/** The screen shows down to 690pt of 874: both rows of subjects stay in; the third row and the tab bar go. */
const WIDE: Design = { w: 480, phone: 340, top: 40, screen: 690 };
const COMPACT: Design = { w: 358, phone: 290, top: 24, screen: 690 };
const REST = { wide: { x: 240, y: 330 }, compact: { x: 179, y: 280 } } as const;

const forms = [2, 3, 4, 5] as const;
const subjects: readonly ArtSubject[] = ["Sejarah", "Sains", "Matematik", "Prinsip Perakaunan", "Biologi", "Kimia"];

async function script(a: Act<S>) {
  a.mark("form4");
  await tap(a, "form-5", 1400);
  a.put({ form: 5 });
  a.mark("form5");
  await tap(a, "subject-Sains", 1500);
  a.put({ open: true });
  a.mark("question");
  await tap(a, "close", 2900);
  a.put({ open: false });
  await tap(a, "form-4", 1500);
  a.put({ form: 4 });
  await a.wait(600);
  await a.move(REST[a.layout], { duration: 200 });
}

function Universe({ s }: { s: S }) {
  return (
    <div className="absolute inset-0 bg-[#f2f2f2] pt-[54px] font-normal">
      <div className="mt-[29px] h-full rounded-t-[28px] bg-paper px-[15px] pt-6">
        <p className="px-[3px] text-[19px] font-medium text-[#252d3a]">Select Form</p>
        <div className="mt-[22px] grid grid-cols-4 gap-[10px]">
          {forms.map((f) => {
            const on = f === s.form;
            return (
              <span
                key={f}
                data-target={`form-${f}`}
                className={cx("ad-tile flex h-[100px] flex-col items-center justify-center gap-[14px] rounded-[16px]", on ? "bg-[#e3f6e5] text-[#3a7a44]" : "bg-[#f2f3f5] text-[#252d3a]")}
              >
                <span className="relative size-[22px]">
                  <span className={cx("absolute inset-0 rounded-full border-[1.5px] border-[#cfd3d8] bg-paper transition-opacity duration-150", on && "opacity-0")} />
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#3a7a44" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cx("absolute inset-0 transition-[opacity,scale] duration-200", on ? "opacity-100" : "scale-75 opacity-0")}>
                    <circle cx="11" cy="11" r="9.6" />
                    <path d="m6.8 11.2 2.8 2.8 5.6-5.8" />
                  </svg>
                </span>
                <span className="text-[16px]">Form {f}</span>
              </span>
            );
          })}
        </div>
        <p className="mt-[34px] px-[10px] text-[19px] font-medium text-[#252d3a]">Select Subject</p>
        <div className="mt-[20px] grid grid-cols-2 gap-x-[21px] gap-y-[20px] px-[10px]">
          {subjects.map((name) => (
            <span key={name} data-target={`subject-${name}`} className="ad-tile flex h-[158px] flex-col items-center justify-center rounded-[20px] bg-[#f2f3f5] px-3 text-center">
              <SubjectArt subject={name} className="size-[56px]" />
              <span className="mt-[14px] text-[16.5px] leading-[1.3] text-[#252d3a]">
                F{s.form} {name}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** The question Sains opens: its quiz bar and Malay stem; the rest is the app's shapes with bars. */
function Question() {
  const pill = "flex h-[40px] items-center rounded-full bg-brand shadow-[0_3px_0_var(--color-brand-ledge)]";
  return (
    <div className="absolute inset-0 bg-cream pt-[54px]">
      <div className="flex h-[60px] items-center gap-2 px-4">
        <span data-target="close" className="grid size-10 place-items-center rounded-full border-2 border-line-strong text-app-muted">
          <Close className="size-3.5" />
        </span>
        <div className={cx(pill, "ml-auto gap-2 pl-3.5 pr-1.5")}>
          <span className="font-display text-[17px] text-forest">{BASE_POINTS}</span>
          <Coin size={28} />
        </div>
        <div className={cx(pill, "gap-1.5 px-3")}>
          <Pencil />
          <span className="grid gap-[5px]">
            <Bar w={30} h={8} r={4} tone={4} />
            <Bar w={22} h={5} r={2.5} tone={4} />
          </span>
        </div>
      </div>
      <div className="px-5 pt-1">
        <Bar w={118} h={12} r={6} tone={4} />
        <div className="mt-3 h-[8px] rounded-full bg-line">
          <div className="h-full rounded-full bg-brand-ink" style={{ width: `${(q17.number / q17.of) * 100}%` }} />
        </div>
        <p lang="ms" className="mt-5 font-display text-[19px] leading-[1.3] text-app-ink">
          {q17.stem.ms}
        </p>
        <div className="mt-3 grid gap-2">
          <Bar w="94%" h={9} r={4.5} tone={2} />
          <Bar w="68%" h={9} r={4.5} tone={2} />
        </div>
        <div className="mt-4 h-[190px] rounded-[22px] bg-line" />
        <div className="mt-4 grid gap-3.5">
          {[150, 120, 168, 136].map((w) => (
            <div key={w} className="flex min-h-[54px] items-center rounded-[18px] bg-paper pl-5 shadow-[0_2px_8px_rgb(0_0_0/0.05)]">
              <Bar w={w} h={9} r={4.5} tone={3} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function UniverseDemo() {
  return (
    <AppStage<S>
      label="The Tavis app on a phone: Form 5 is picked in Question Universe, then Sains opens its practice questions."
      wide={WIDE}
      compact={COMPACT}
      initial={START}
      poster={POSTER}
      script={script}
      rest={REST}
    >
      {(s, _rect, d) => (
        <AppPhone d={d}>
          <Universe s={s} />
          {/* The question pushes in over the subjects, as a screen does in the app */}
          <div data-open={s.open || undefined} className="ad-push absolute inset-0">
            <Question />
          </div>
        </AppPhone>
      )}
    </AppStage>
  );
}
