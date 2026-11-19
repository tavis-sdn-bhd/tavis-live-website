import { Image } from "@/components/image";
import type { CSSProperties, ReactNode } from "react";
import { cx } from "./ui";

/** Voucher card with punched side notches lined up on the perforation. */
export function Ticket({ name, children, className }: { name: string; children: ReactNode; className?: string }) {
  return (
    <div
      className={cx(
        "ticket group/ticket rounded-2xl bg-paper p-2 transition-transform duration-500 ease-out-expo hover:-translate-y-1.5 hover:-rotate-1",
        className,
      )}
    >
      <div className="grid aspect-[256/156] place-items-center overflow-hidden rounded-xl bg-cream">{children}</div>
      <div className="mx-2 mt-2 flex h-8 items-end justify-center border-t-2 border-dashed border-line pb-0.5 text-center">
        <span className="min-w-0 [overflow-wrap:anywhere] font-display text-small text-forest">{name}</span>
      </div>
    </div>
  );
}

/** A brand's own SVG logo (public/assets/brands, and Tavis's at public/assets) and the colour of the card field behind it. */
type Brand = { readonly logo: string; readonly w: number; readonly h: number; readonly field: string };

const brands = {
  Foodpanda: { logo: "/assets/brands/foodpanda.svg", w: 500, h: 105, field: "#d60e64" },
  KFC: { logo: "/assets/brands/kfc.svg", w: 1000, h: 928, field: "#f5002b" },
  Watsons: { logo: "/assets/brands/watsons.svg", w: 4800, h: 1055, field: "#00a0a0" },
  Roblox: { logo: "/assets/brands/roblox.svg", w: 800, h: 148, field: "#232527" },
  "Touch ’n Go": { logo: "/assets/brands/touch-n-go.svg", w: 100, h: 100, field: "#0d60a8" },
  Tavis: { logo: "/assets/tavis-logo.svg", w: 749, h: 194, field: "#65cd7d" },
} as const satisfies Record<string, Brand>;

export type BrandName = keyof typeof brands;

/** The brand's logo on a white plate over its brand colour: the top of a voucher, and the picture on the app's voucher tiles. */
export function BrandPlate({ name, className, style }: { name: BrandName; className?: string; style?: CSSProperties }) {
  const brand = brands[name];
  return (
    <div className={cx("rounded-[6%/10%]", className)} style={{ backgroundColor: brand.field, ...style }}>
      <div className="absolute inset-x-[13%] inset-y-[11%] rounded-[6%/14%] bg-white p-[4%]">
        <Image src={brand.logo} alt="" width={brand.w} height={brand.h} unoptimized className="size-full object-contain" />
      </div>
    </div>
  );
}

/** Where the perforation crosses the card, as a share of its height. */
const cut = 64;

/** Half circles are cut out of both sides at the perforation, so whatever is behind the card shows through. */
const notch = (edge: "0" | "100%") => `radial-gradient(circle at ${edge} ${cut}%, #0000 5.5cqw, #000 5.75cqw)`;

const punched: CSSProperties = {
  maskOrigin: "padding-box",
  maskImage: `${notch("0")}, ${notch("100%")}`,
  maskSize: "51% 100%, 51% 100%",
  maskPosition: "left, right",
  maskRepeat: "no-repeat, no-repeat",
};

const points = new Intl.NumberFormat("en-MY");

export type VoucherData = {
  readonly name: BrandName;
  /** The reward's name when it is not the brand's: Tavis's own voucher. */
  readonly title?: string;
  /** Its price in points, when the catalogue lists one. */
  readonly cost?: number;
  /** Its face value, when it has one: "RM20". */
  readonly value?: string;
};

/**
 * A reward voucher drawn in code: the brand's plate, a perforation, then the reward's name and its points price or
 * face value. Everything is sized from the card's own width.
 */
export function Voucher({ name, title, cost, value, className }: VoucherData & { className?: string }) {
  return (
    <div className={cx("relative aspect-[6/5] w-full [container-type:inline-size]", className)}>
      <div className="absolute inset-0 rounded-2xl border-2 border-b-4 border-line bg-paper text-center" style={punched}>
        <BrandPlate name={name} className="absolute inset-x-[3cqw] top-[3cqw]" style={{ bottom: `calc(${100 - cut}% + 3cqw)` }} />
        <div aria-hidden="true" className="absolute inset-x-[8cqw] border-t-2 border-dashed border-line-strong" style={{ top: `${cut}%` }} />
        <div className="absolute inset-x-[4cqw] bottom-0 grid content-center justify-items-center gap-[2cqw]" style={{ top: `${cut}%` }}>
          <span className="font-display text-[8.5cqw] leading-none text-forest">{title ?? name}</span>
          {cost !== undefined && <span className="nums rounded-full bg-sun px-[3.5cqw] py-[1cqw] text-[6.5cqw] leading-none text-forest-deep">{points.format(cost)} pts</span>}
          {value !== undefined && <span className="nums rounded-full bg-mint px-[3.5cqw] py-[1cqw] text-[6.5cqw] leading-none text-brand-deep">{value}</span>}
        </div>
      </div>
    </div>
  );
}

/** A voucher that lifts on hover, for the rewards catalogues. */
export function VoucherTicket({ voucher, className }: { voucher: VoucherData; className?: string }) {
  return <Voucher {...voucher} className={cx("transition-transform duration-500 ease-out-expo hover:-translate-y-1.5 hover:-rotate-1", className)} />;
}
