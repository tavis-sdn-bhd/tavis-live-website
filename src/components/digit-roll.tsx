"use client";

import { motion } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { standard } from "./motion";
import { cx } from "./ui";

const DIGITS = "0123456789";

/**
 * A number whose digits roll like an odometer when it changes. Each digit is
 * a vertical strip 0–9 translated to the right row; separators stay put.
 * Screen readers get the plain value.
 */
export function DigitRoll({ value, className, format = (n: number) => n.toLocaleString("en-MY") }: {
  value: number;
  className?: string;
  format?: (n: number) => string;
}) {
  const reduce = usePrefersReducedMotion();
  const text = format(value);

  return (
    <span className={cx("nums relative inline-flex", className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="inline-flex">
        {text.split("").map((char, i) => {
          const position = text.length - i;
          if (!DIGITS.includes(char)) {
            return <span key={`sep-${position}`}>{char}</span>;
          }
          const digit = Number(char);
          return (
            <span key={`d-${position}`} className="relative inline-block h-[1em] w-[1ch] overflow-hidden leading-none">
              <motion.span
                className="absolute inset-x-0 top-0 flex flex-col"
                initial={false}
                animate={{ y: `${-digit}em` }}
                transition={reduce ? { duration: 0 } : standard}
              >
                {DIGITS.split("").map((d) => (
                  <span key={d} className="block h-[1em] leading-none">
                    {d}
                  </span>
                ))}
              </motion.span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
