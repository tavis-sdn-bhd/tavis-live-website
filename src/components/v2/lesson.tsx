"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { optionState, q17 as question, q17Answer, type OptionKey } from "@/lib/questions";
import { Bacteriophage } from "../bacteriophage";
import { Coin } from "../coin";
import { DigitRoll } from "../digit-roll";
import { Check, Close } from "../icons";
import { Mascot } from "../mascot";
import { easeOutExpo } from "../motion";
import { cx } from "../ui";
import { buttonClass } from "./ui";

type Stage = "choosing" | "checked";

/* A real Question Universe question in Duolingo's lesson frame: thick progress
   bar, the character asking in a speech bubble, tiles that turn blue when
   picked, CHECK, then a banner that slides up with the verdict. */
export function Lesson({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const [picked, setPicked] = useState<OptionKey | null>(null);
  const [stage, setStage] = useState<Stage>("choosing");
  const correct = stage === "checked" && picked === question.answer;
  const wrong = stage === "checked" && picked !== question.answer;
  const points = question.startingPoints + (correct ? question.reward : 0);
  const statusId = useId();
  const firstTile = useRef<HTMLButtonElement>(null);
  const continueButton = useRef<HTMLButtonElement>(null);
  const retried = useRef(false);

  // The tiles are disabled while checked, so focus moves once they are enabled again.
  useEffect(() => {
    if (stage === "checked") continueButton.current?.focus({ preventScroll: true });
    else if (retried.current) {
      retried.current = false;
      firstTile.current?.focus({ preventScroll: true });
    }
  }, [stage]);

  function check() {
    if (picked) setStage("checked");
  }

  function again() {
    setPicked(null);
    setStage("choosing");
    retried.current = true;
  }

  return (
    <div className={cx("relative overflow-hidden rounded-[1.75rem] border-2 border-b-[6px] border-line bg-paper text-left", className)}>
      <div className="flex items-center gap-4 px-5 pt-5">
        <Close aria-hidden="true" className="size-5 shrink-0 text-line-strong" />
        <div
          role="progressbar"
          aria-label="Question progress"
          aria-valuemin={0}
          aria-valuemax={question.of}
          aria-valuenow={question.number}
          className="h-4 flex-1 overflow-hidden rounded-full bg-line"
        >
          <div className="relative h-full rounded-full bg-brand" style={{ width: `${(question.number / question.of) * 100}%` }}>
            <span className="absolute inset-x-3 top-1 h-1 rounded-full bg-white/40" />
          </div>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 text-[1rem] font-black text-forest">
          <Coin size={24} />
          <DigitRoll value={points} />
        </span>
      </div>

      <div className="px-5 pb-6 pt-6 sm:px-7">
        <p className="text-[1.375rem] font-black leading-tight text-forest">Pick the right answer</p>

        <div className="mt-5 flex items-end gap-3">
          <Mascot mood={correct ? "cheer" : wrong ? "sad" : "think"} outfit="science" decorative className="w-24 shrink-0 sm:w-28" />
          <div className="relative mb-4 flex-1 rounded-2xl border-2 border-line px-4 py-3">
            <span aria-hidden="true" className="absolute -left-[9px] bottom-5 size-4 rotate-45 border-b-2 border-l-2 border-line bg-paper" />
            <p lang="ms" className="text-[1rem] font-bold leading-snug text-forest">
              {question.stem.ms}
            </p>
            <p lang="en" className="mt-1 text-caption font-semibold leading-snug text-muted">
              {question.stem.en}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)] gap-4">
          <div className="grid place-items-center rounded-2xl border-2 border-line">
            <Bacteriophage draw delay={500} className="h-auto w-full max-w-[9rem] p-2" />
          </div>
          <div role="group" aria-label="Answer options" aria-describedby={statusId} className="grid content-start gap-2">
            {question.options.map((option, i) => {
              const state = stage === "checked" ? optionState(picked, option.key) : picked === option.key ? "picked" : "idle";
              return (
                <motion.button
                  key={option.key}
                  ref={i === 0 ? firstTile : undefined}
                  type="button"
                  aria-pressed={picked === option.key}
                  disabled={stage === "checked"}
                  onClick={() => setPicked(option.key)}
                  animate={state === "wrong" && !reduce ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                  transition={{ duration: 0.45 }}
                  className={cx(
                    "flex min-h-12 items-center gap-2.5 rounded-xl border-2 border-b-4 px-3 text-left text-small font-extrabold leading-tight transition-colors",
                    state === "idle" && "border-line bg-paper text-forest hover:bg-cream active:translate-y-0.5 active:border-b-2",
                    state === "picked" && "border-sky-ink bg-sky-soft text-sky-ink",
                    state === "correct" && "border-brand bg-mint text-correct-ink",
                    state === "wrong" && "border-wrong bg-wrong-soft text-wrong-ink",
                    state === "muted" && "border-line bg-paper text-muted",
                  )}
                >
                  <span
                    className={cx(
                      "grid size-6 shrink-0 place-items-center rounded-md border-2 text-[0.75rem]",
                      state === "picked" ? "border-sky-ink" : state === "correct" ? "border-brand" : state === "wrong" ? "border-wrong" : "border-line",
                    )}
                  >
                    {state === "picked" ? <Check className="size-3.5" /> : option.key}
                  </span>
                  <span lang="ms">{option.ms}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t-2 border-line px-5 py-4 sm:px-7">
        <button
          type="button"
          onClick={check}
          disabled={!picked || stage === "checked"}
          className={
            picked && stage === "choosing"
              ? buttonClass({ className: "w-full" })
              : "h-12 w-full rounded-2xl bg-line font-display text-small uppercase tracking-[0.06em] text-muted"
          }
        >
          Check
        </button>
      </div>

      <AnimatePresence>
        {stage === "checked" && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { y: "100%" }}
            animate={reduce ? { opacity: 1 } : { y: 0 }}
            exit={reduce ? { opacity: 0 } : { y: "100%" }}
            transition={{ duration: 0.45, ease: easeOutExpo }}
            className={cx("absolute inset-x-0 bottom-0 px-5 pb-4 pt-4 sm:px-7", correct ? "bg-mint" : "bg-wrong-soft")}
          >
            <div className="flex items-center gap-3">
              <span className={cx("grid size-11 shrink-0 place-items-center rounded-full bg-paper", correct ? "text-correct-ink" : "text-wrong")}>
                {correct ? <Check className="size-6" /> : <Close className="size-5" />}
              </span>
              <div className="min-w-0">
                <p className={cx("text-[1.375rem] font-black leading-tight", correct ? "text-correct-ink" : "text-wrong-ink")}>
                  {correct ? "Correct!" : "Correct answer:"}
                </p>
                <p className={cx("text-body-sm font-bold", correct ? "text-correct-ink" : "text-wrong-ink")}>
                  {correct ? (
                    `+${question.reward} points`
                  ) : (
                    <>
                      {q17Answer.key}. <span lang="ms">{q17Answer.ms}</span> / {q17Answer.en}
                    </>
                  )}
                </p>
              </div>
            </div>
            <button
              ref={continueButton}
              type="button"
              onClick={again}
              className={buttonClass({ tone: correct ? "green" : "red", className: "mt-4 w-full" })}
            >
              {correct ? "Continue" : "Try again"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <p id={statusId} role="status" className="sr-only">
        {stage === "choosing"
          ? picked
            ? `${picked} selected. Press Check.`
            : "Choose an answer, then press Check."
          : correct
            ? `Correct. Plus ${question.reward} points.`
            : `Not quite. The answer is ${q17Answer.key}, ${q17Answer.ms}, ${q17Answer.en}.`}
      </p>
    </div>
  );
}
