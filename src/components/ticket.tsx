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

/** A brand's own SVG logo (public/assets/brands, and Tavis's at public/assets), the colour of the card field behind
    it, and the picture on its voucher: what the voucher buys, drawn on that colour with no brand marks in it. */
type Brand = { readonly logo: string; readonly w: number; readonly h: number; readonly field: string; readonly art: string };

const brands = {
  Foodpanda: { logo: "/assets/brands/foodpanda.svg", w: 500, h: 105, field: "#d60e64", art: "/assets/voucher-foodpanda.webp" },
  KFC: { logo: "/assets/brands/kfc.svg", w: 1000, h: 928, field: "#f5002b", art: "/assets/voucher-kfc.webp" },
  Watsons: { logo: "/assets/brands/watsons.svg", w: 4800, h: 1055, field: "#00a0a0", art: "/assets/voucher-watsons.webp" },
  Roblox: { logo: "/assets/brands/roblox.svg", w: 800, h: 148, field: "#232527", art: "/assets/voucher-roblox.webp" },
  "Touch ’n Go": { logo: "/assets/brands/touch-n-go.svg", w: 100, h: 100, field: "#0d60a8", art: "/assets/voucher-touch-n-go.webp" },
  Tavis: { logo: "/assets/tavis-logo.svg", w: 749, h: 194, field: "#65cd7d", art: "/assets/voucher-tavis.webp" },
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

/** The top of a voucher: its picture, with the brand's logo on a white chip in the corner the picture leaves clear.
    The picture is 2:1 and so is the space, so nothing of it is cropped. */
function VoucherArt({ name, sizes, className, style }: { name: BrandName; sizes: string; className?: string; style?: CSSProperties }) {
  const brand = brands[name];
  return (
    <div className={cx("overflow-hidden rounded-[6%/10%]", className)} style={{ backgroundColor: brand.field, ...style }}>
      <Image src={brand.art} alt="" width={1040} height={520} sizes={sizes} className="absolute inset-0 size-full object-cover" />
      <div className="absolute bottom-[9%] left-[5%] flex h-[32%] max-w-[42%] rounded-full bg-white px-[5%] py-[2.6%] shadow-[0_0.8cqw_0_rgb(0_0_0/0.14)]">
        <Image src={brand.logo} alt="" width={brand.w} height={brand.h} unoptimized className="h-full w-auto max-w-full object-contain" />
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

/** How wide a voucher is drawn, for its picture's `sizes`: in a catalogue's grid, and as a piece of a scene. */
export const voucherSizes = { catalogue: "(min-width: 40rem) 17rem, 46vw", scene: "(min-width: 30rem) 10rem, 34vw" } as const;

/**
 * A reward voucher: its picture and the brand's logo, a perforation, then the reward's name and its points price or
 * face value. Everything is sized from the card's own width. The name and the price are centred together; a voucher
 * the catalogue lists no price for keeps the price's space, so a row of vouchers has its names on one line.
 */
export function Voucher({ name, title, cost, value, sizes = voucherSizes.catalogue, className }: VoucherData & { sizes?: string; className?: string }) {
  return (
    <div className={cx("relative aspect-[6/5] w-full [container-type:inline-size]", className)}>
      <div className="absolute inset-0 rounded-2xl border-2 border-b-4 border-line bg-paper text-center" style={punched}>
        <VoucherArt name={name} sizes={sizes} className="absolute inset-x-[3cqw] top-[3cqw]" style={{ bottom: `calc(${100 - cut}% + 3cqw)` }} />
        <div aria-hidden="true" className="absolute inset-x-[8cqw] border-t-2 border-dashed border-line-strong" style={{ top: `${cut}%` }} />
        <div className="absolute inset-x-[4cqw] bottom-0 grid content-center justify-items-center gap-[2cqw]" style={{ top: `${cut}%` }}>
          <span className="font-display text-[8.5cqw] leading-none text-forest">{title ?? name}</span>
          {cost !== undefined && <span className="nums rounded-full bg-sun px-[3.5cqw] py-[1cqw] text-[6.5cqw] leading-none text-forest-deep">{points.format(cost)} pts</span>}
          {value !== undefined && <span className="nums rounded-full bg-mint px-[3.5cqw] py-[1cqw] text-[6.5cqw] leading-none text-brand-deep">{value}</span>}
          {/* As tall as a price: 6.5cqw of type and 1cqw of padding above and below. */}
          {cost === undefined && value === undefined && <span aria-hidden="true" className="h-[8.5cqw]" />}
        </div>
      </div>
    </div>
  );
}

/** A voucher that lifts on hover, for the rewards catalogues. */
export function VoucherTicket({ voucher, className }: { voucher: VoucherData; className?: string }) {
  return <Voucher {...voucher} className={cx("transition-transform duration-500 ease-out-expo hover:-translate-y-1.5 hover:-rotate-1", className)} />;
}
