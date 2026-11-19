import { cx } from "./ui";

/** The Tavis points coin: sun disc with a pressed "T". Decorative. */
export function Coin({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cx("grid shrink-0 place-items-center rounded-full bg-sun font-display text-forest shadow-[inset_0_-2px_0_var(--color-sun-ledge)]", className)}
      style={{ width: size, height: size, fontSize: size * 0.55 }}
    >
      T
    </span>
  );
}
