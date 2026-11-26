import type { ReactNode } from "react";
import type { HijabTone } from "../student";
import { cx } from "../ui";

/* The app's avatar shop, drawn to the client's screenshots of it (an iPhone at 393pt, read at 1.5px a point): the
   editor's header with Save, the hint banner, the category pills, and the item tiles with their padlocks and prices.
   The clone (`MeScreen`) and BA's rewards demo both build from these, so the two never drift. */

/** Colours sampled from the screenshots. */
export const shop = {
  save: "#5eb469",
  banner: "#fff9e7",
  remove: "#fd4142",
  pillLine: "#e7e7e7",
  pillOn: "#e0f5e6",
  pillOnText: "#3a6a42",
  pillText: "#616161",
  icon: "#5d6b7e",
  lock: "#e3962a",
  /** A locked character's square, and an unlocked one's. */
  locked: "#9daab0",
  free: "#dbf3ff",
  /** A locked outfit's circle. */
  lockedItem: "#acacac",
} as const;

const iconProps = { width: 18, height: 18, viewBox: "0 0 24 24", "aria-hidden": true, focusable: false } as const;

/** The pill icons, as the app draws them: the character's is a line drawing, the clothes are filled. */
const icons = {
  character: (
    <svg {...iconProps} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 9.5a4 4 0 0 1 8 0c0 2.6-1.4 4.6-4 4.6S8 12.1 8 9.5ZM8.4 8C10 8.6 13 8.4 15 6.6M4.5 20.5c.8-3.4 3.8-5.4 7.5-5.4s6.7 2 7.5 5.4" />
    </svg>
  ),
  top: (
    <svg {...iconProps} fill="currentColor">
      <path d="M9 3.5c.6 1.4 1.7 2.1 3 2.1s2.4-.7 3-2.1l5.5 2.4-1.8 4.6-2.4-.9V20.5H7.7V9.6l-2.4.9L3.5 5.9Z" />
    </svg>
  ),
  bottom: (
    <svg {...iconProps} fill="currentColor">
      <path d="M7 3h10l1.6 17.5h-4.4L12 9.5l-2.2 11H5.4Z" />
    </svg>
  ),
  shoes: (
    <svg {...iconProps} fill="currentColor">
      <path d="M2.5 9.5c2.6.2 4.4 1.4 6 2.7 1.7 1.3 3.6 1.7 6.6 2.1 3.5.4 6.2 1.2 6.4 3.4v.8H2.5Z" />
    </svg>
  ),
  accessories: (
    <svg {...iconProps} width={22} fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="6.5" cy="13" r="3.8" />
      <circle cx="17.5" cy="13" r="3.8" />
      <path d="M10.3 12.4c1.1-.8 2.3-.8 3.4 0M2.7 12.6 1.5 10M21.3 12.6l1.2-2.6" strokeLinecap="round" />
    </svg>
  ),
  hijab: (
    <svg {...iconProps} fill="currentColor">
      <path d="M12 2.5c4.4 0 7.2 3.4 7.2 8 0 3.3-1.3 5.8-3 7.4l1.9 3.6H5.9l1.9-3.6c-1.7-1.6-3-4.1-3-7.4 0-4.6 2.8-8 7.2-8Zm0 4.5c-2.2 0-3.6 1.8-3.6 4.1s1.5 4 3.6 4 3.6-1.7 3.6-4S14.2 7 12 7Z" />
    </svg>
  ),
} as const;

export type ShopTab = keyof typeof icons;

/** The Hijab tab as the screenshots list it: colour, price, and whether it is already the student's. */
export const hijabs: ReadonlyArray<{ tone: HijabTone; price: number; owned: boolean }> = [
  { tone: "olive", price: 10000, owned: false },
  { tone: "sage", price: 10000, owned: true },
  { tone: "rose", price: 10000, owned: false },
  { tone: "grey", price: 20000, owned: false },
  { tone: "plum", price: 20000, owned: false },
];

/** The app's order. The row is wider than the screen and scrolls; the last pills run off its right edge. */
export const shopTabs: ReadonlyArray<{ id: ShopTab; label: string }> = [
  { id: "character", label: "Character" },
  { id: "top", label: "Top" },
  { id: "bottom", label: "Bottom" },
  { id: "shoes", label: "Shoes" },
  { id: "accessories", label: "Accessories" },
  { id: "hijab", label: "Hijab" },
];

/** One category pill: 33pt tall, the active one tinted green and without its line. */
export function ShopPill({ id, label, on }: { id: ShopTab; label: string; on: boolean }) {
  return (
    <span
      className="flex h-[33px] shrink-0 items-center gap-2 rounded-[12px] border-[1.5px] px-4 text-[14px] font-medium"
      style={on ? { background: shop.pillOn, borderColor: shop.pillOn, color: shop.pillOnText } : { borderColor: shop.pillLine, color: shop.pillText }}
    >
      <span style={{ color: on ? shop.pillOnText : shop.icon }} className="grid place-items-center">
        {icons[id]}
      </span>
      {label}
    </span>
  );
}

/** The padlock on a locked item: an orange outline over the tile's top-right corner. */
export function ShopLock({ className }: { className?: string }) {
  return (
    <svg width="22" height="24" viewBox="0 0 22 24" aria-hidden="true" focusable="false" className={className}>
      <path d="M6.2 10.5V7.4a4.8 4.8 0 0 1 9.6 0v3.1" fill="none" stroke={shop.lock} strokeWidth="2.2" strokeLinecap="round" />
      <rect x="2.6" y="10.2" width="16.8" height="12.2" rx="3.6" fill="#fbe6c4" stroke={shop.lock} strokeWidth="2.2" />
      <path d="M11 15v2.6" stroke={shop.lock} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export type ItemState = "locked" | "owned" | "on";

/** An item tile: 65pt, square for characters and round for clothes. Locked tiles are grey under a padlock; the one
    worn gets the app's green ring, on white unless `keep` holds the tile's grey (a white drawing would vanish).
    `unlocking` keeps the padlock drawn so a demo can animate it off (`data-open`), with its own `lockClassName`. */
export function ShopItem({
  shape,
  state,
  children,
  keep = false,
  unlocking,
  lockClassName,
  className,
  target,
}: {
  shape: "square" | "round";
  state: ItemState;
  children: ReactNode;
  keep?: boolean;
  unlocking?: boolean;
  lockClassName?: string;
  className?: string;
  target?: string;
}) {
  const grey = shape === "square" ? shop.locked : shop.lockedItem;
  const fill = state === "locked" || keep ? grey : state === "on" ? "#fff" : shape === "square" ? shop.free : "#f1f1f1";
  const lock = state === "locked" || unlocking !== undefined;
  return (
    <span data-target={target} className={cx("relative mx-auto block size-[65px]", className)}>
      <span
        // It crops its drawing on purpose, as the app's tiles do (marked for the demo's film checks)
        data-crop
        className={cx("block size-full overflow-hidden transition-[box-shadow,background-color] duration-150", shape === "square" ? "rounded-[13px]" : "rounded-full")}
        style={{ background: fill, boxShadow: state === "on" ? `inset 0 0 0 2px ${shop.save}` : undefined }}
      >
        {children}
      </span>
      {lock ? (
        <span data-open={unlocking || undefined} className={cx("absolute -right-1.5 -top-2 block", lockClassName)}>
          <ShopLock />
        </span>
      ) : null}
    </span>
  );
}

/** Save's shape and type; its fill is `shop.save`. */
export const saveButton = "grid h-[37px] w-[101px] place-items-center rounded-full text-[17px] font-semibold text-white";

/** The editor's header: a back arrow, and Save. `right` sits before Save; `save` replaces the drawn button with a
    working one. */
export function ShopHeader({ right, save }: { right?: ReactNode; save?: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-[21px]">
      <svg width="26" height="20" viewBox="0 0 26 20" fill="none" stroke="#1d2a3a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <path d="M24 10H3M10.5 2 2.5 10l8 8" />
      </svg>
      <span className="flex items-center gap-2.5">
        {right}
        {save ?? (
          <span className={saveButton} style={{ background: shop.save }}>
            Save
          </span>
        )}
      </span>
    </div>
  );
}

/** The hint under the header, with the remove button that overhangs its corner. `words` false draws it as bars. */
export function ShopHint({ words = true }: { words?: boolean }) {
  return (
    <div className="relative mx-[21px] mt-[18px]">
      <div className="rounded-[10px] px-4 py-[7px] text-center text-[12.5px] leading-[1.35] text-[#6e6a60]" style={{ background: shop.banner }}>
        {words ? (
          "💡 Touch to select • Pinch to resize • Rotate • Drag to move • Tap × to remove"
        ) : (
          <span className="flex flex-col items-center gap-1.5 py-1">
            <span className="h-[7px] w-[82%] rounded-full bg-[#ece4cc]" />
            <span className="h-[7px] w-[46%] rounded-full bg-[#ece4cc]" />
          </span>
        )}
      </div>
      <span className="absolute -bottom-[17px] right-[10px] grid size-[29px] place-items-center rounded-full shadow-[0_2px_6px_rgb(0_0_0/0.18)]" style={{ background: shop.remove }}>
        <svg width="11" height="11" viewBox="0 0 11 11" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true" focusable="false">
          <path d="M1.5 1.5l8 8M9.5 1.5l-8 8" />
        </svg>
      </span>
    </div>
  );
}

/** The grid's paging arrows, white discs at the screen's edges; `on` is the side there is more on. */
/** An item's price under its tile. */
export function ShopPrice({ children }: { children: ReactNode }) {
  return <span className="mt-1.5 block text-center text-[13.5px] leading-[1.3] text-app-ink">{children}</span>;
}

export function ShopArrow({ side, on }: { side: "left" | "right"; on: boolean }) {
  return (
    <span className={cx("absolute grid size-[37px] place-items-center rounded-full bg-white shadow-[0_2px_8px_rgb(0_0_0/0.1)]", side === "left" ? "left-[5px]" : "right-[5px]")}>
      <svg width="8" height="13" viewBox="0 0 8 13" fill="none" stroke={on ? shop.save : "#cfe9d3"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <path d={side === "left" ? "M6.5 1.5 1.5 6.5l5 5" : "M1.5 1.5l5 5-5 5"} />
      </svg>
    </span>
  );
}
