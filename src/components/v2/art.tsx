import { Image } from "@/components/image";
import type { CSSProperties, ReactNode } from "react";
import type { Screen } from "@/lib/content";
import { ChatCircle, Microphone, Play, VideoCamera } from "../icons";
import { Mascot } from "../mascot";
import { Phone } from "../phone";
import { Voucher, type VoucherData, voucherSizes } from "../ticket";
import { cx } from "../ui";
import { BobFly, CoinArt, TudungLeap } from "./cast";
import { Scene } from "./scene";

/* Variant B's illustration kit, drawn for Tavis in Duolingo's manner: flat
   fills, a darker shade on the underside, one white highlight, no outlines.
   Every piece is decorative; the copy beside it carries the meaning. */

type ArtProps = { className?: string; style?: CSSProperties };

const gold = "#ffc800";
const goldShade = "#e5a400";
const wood = "#d98e3a";
const woodShade = "#a9631f";
const silver = "#b7c3cc";
const silverShine = "#d5dee4";
const bronze = "#e0915a";
const bronzeShine = "#eeb084";
const screenBase = "#3a4450";
const laptopBase = "#c9d3da";
const laptopBaseShade = "#9aa7b0";
const shine = { stroke: "#fff", strokeOpacity: 0.65, strokeWidth: 3.5, strokeLinecap: "round", fill: "none" } as const;

function Svg({ className, style, children }: ArtProps & { children: ReactNode }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false" className={className} style={style}>
      {children}
    </svg>
  );
}

/** Daily log-in: the flame. */
export function Flame(props: ArtProps) {
  return (
    <Svg {...props}>
      <path d="M32 3c5 11 20 17 20 36a20 20 0 0 1-40 0c0-10 5-16 9-20 1 7 4 10 8 10-2-10 1-19 3-26Z" fill="#ff9600" />
      <path d="M32 31c3 6 11 10 11 18a11 11 0 0 1-22 0c0-6 3-9 6-11 1 3 2 5 4 5-1-5 0-9 1-12Z" fill={gold} />
      <path d="M20 36c-2 4-2 9 0 13" {...shine} />
    </Svg>
  );
}

/** Top of the rankings: the crown. */
export function Crown(props: ArtProps) {
  return (
    <Svg {...props}>
      <path d="M7 22 20 33l12-19 12 19 13-11-5 27H12Z" fill={gold} />
      <path d="M12 49h40l-1.5 8h-37Z" fill={goldShade} />
      <circle cx="7" cy="20" r="4.5" fill={gold} />
      <circle cx="32" cy="12" r="4.5" fill={gold} />
      <circle cx="57" cy="20" r="4.5" fill={gold} />
      <circle cx="32" cy="38" r="4.5" fill="#ff4b4b" />
      <circle cx="19" cy="41" r="3" fill="#1cb0f6" />
      <circle cx="45" cy="41" r="3" fill="#1cb0f6" />
      <path d="M17 31l3 3" {...shine} />
    </Svg>
  );
}

/** Rewards: the treasure chest, lid open and points spilling. */
export function Chest({ open = false, ...props }: ArtProps & { open?: boolean }) {
  return (
    <Svg {...props}>
      {open ? (
        <>
          <path d="M10 26 14 6h36l4 20Z" fill={woodShade} />
          <path d="M13 24 16 9h32l3 15Z" fill="#7c4512" />
          <circle cx="24" cy="26" r="6" fill={gold} />
          <circle cx="36" cy="24" r="6" fill={gold} />
          <circle cx="44" cy="28" r="5" fill={goldShade} />
        </>
      ) : (
        <path d="M8 31v-9a12 12 0 0 1 12-12h24a12 12 0 0 1 12 12v9Z" fill={wood} />
      )}
      <rect x="8" y="30" width="48" height="27" rx="5" fill={wood} />
      <rect x="8" y="30" width="48" height="7" fill={woodShade} />
      <rect x="15" y="30" width="5" height="27" fill={gold} />
      <rect x="44" y="30" width="5" height="27" fill={gold} />
      <rect x="27" y="27" width="10" height="13" rx="3" fill={gold} />
      <circle cx="32" cy="33" r="2" fill={woodShade} />
      <path d="M12 42v8" {...shine} />
    </Svg>
  );
}

/** Competition: the trophy. */
export function Trophy(props: ArtProps) {
  return (
    <Svg {...props}>
      <path d="M19 15h-7a9 9 0 0 0 10 13M45 15h7a9 9 0 0 1-10 13" stroke={goldShade} strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M17 6h30v16a15 15 0 0 1-30 0Z" fill={gold} />
      <rect x="28.5" y="36" width="7" height="10" fill={goldShade} />
      <rect x="18" y="45" width="28" height="12" rx="4" fill={woodShade} />
      <rect x="24" y="49" width="16" height="4" rx="2" fill={gold} />
      <path d="M32 11.5l2.6 5.2 5.7.8-4.1 4 1 5.7L32 24.5l-5.1 2.7 1-5.7-4.2-4 5.8-.8Z" fill="#fff" fillOpacity="0.85" />
      <path d="M22 11v8" {...shine} />
    </Svg>
  );
}

/** Points earned fast: the bolt. */
export function Bolt(props: ArtProps) {
  return (
    <Svg {...props}>
      <path d="M38 3 13 37h16l-5 24 27-36H35Z" fill={gold} />
      <path d="M29 37h-4l-1 24 5-6Z" fill={goldShade} />
      <path d="M33 10 22 26" {...shine} />
    </Svg>
  );
}

/** A plain reward star. */
export function Star({ fill = gold, ...props }: ArtProps & { fill?: string }) {
  return (
    <Svg {...props}>
      <path d="M32 5l8.2 16.6 18.3 2.7-13.2 12.9 3.1 18.2L32 46.8l-16.4 8.6 3.1-18.2L5.5 24.3l18.3-2.7Z" style={{ fill }} />
      <path d="M23 26l-5 1" {...shine} />
    </Svg>
  );
}

type Spot = { node: ReactNode; className: string; delay?: number };

/** Game pieces drifting round a centrepiece, as on Duolingo's "anytime, anywhere" band. They drift only while on screen. */
export function Floaters({ spots, className }: { spots: readonly Spot[]; className?: string }) {
  return (
    <Scene aria-hidden="true" className={cx("pointer-events-none absolute inset-0", className)}>
      {spots.map((s, i) => (
        <div key={i} className={cx("absolute", s.className)}>
          <div className="animate-float" style={{ animationDelay: `-${s.delay ?? i * 1.3}s` }}>
            {s.node}
          </div>
        </div>
      ))}
    </Scene>
  );
}

/** A piece of a stage: its box in % of the square stage, height ÷ width, a resting tilt, and whether it drifts once it lands. */
export type Piece = { key: string; x: number; y: number; w: number; ratio: number; tilt?: number; still?: boolean; node: ReactNode };

/**
 * Duolingo's opening, for any scene: pieces spring out of one point of a square stage (`from`, in % of it) to their
 * spots, one after another, then drift. `children` sit under the pieces, unmoved, as the thing they burst out of.
 */
export function BurstStage({
  pieces,
  from,
  intro,
  delay = 0,
  className,
  children,
}: {
  pieces: readonly Piece[];
  from: { x: number; y: number };
  intro?: "view" | "load";
  delay?: number;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Scene intro={intro} aria-hidden="true" className={cx("relative mx-auto aspect-square w-full [container-type:size]", className)}>
      {children}
      {pieces.map((p, i) => {
        const fx = from.x - (p.x + p.w / 2);
        const fy = from.y - (p.y + (p.w * p.ratio) / 2);
        return (
          <div
            key={p.key}
            className="scene-burst absolute"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.w}%`, "--fx": fx, "--fy": fy, "--delay": `${delay + i * 70}ms` } as CSSProperties}
          >
            <div className={p.still ? undefined : "animate-float"} style={{ animationDelay: `-${i * 0.9}s` }}>
              <div style={{ rotate: `${p.tilt ?? 0}deg` }}>{p.node}</div>
            </div>
          </div>
        );
      })}
    </Scene>
  );
}

/** A tilted phone, lifted off the page by a hard offset shadow. */
export function TiltedPhone({ screen, tilt = -8, className }: { screen: Screen; tilt?: number; className?: string }) {
  return (
    <div className={className} style={{ transform: `rotate(${tilt}deg)` }}>
      <Phone screen={screen} className="rounded-[16%/7.8%] shadow-[12px_14px_0_rgb(30_37_45/0.9)]" />
    </div>
  );
}

/** Duolingo's subject-page phone: one app screen, upright, on a round field in the band's accent. */
export function PhoneShot({ screen, field = "bg-sky-soft", className }: { screen: Screen; field?: string; className?: string }) {
  return (
    <div className={cx("relative mx-auto w-full max-w-[24rem]", className)}>
      <div aria-hidden="true" className={cx("absolute left-1/2 top-1/2 aspect-square w-full -translate-x-1/2 -translate-y-1/2 rounded-full", field)} />
      <Phone screen={screen} className="relative mx-auto w-[min(17rem,68%)] drop-shadow-[0_18px_30px_rgb(30_37_45/0.18)]" />
    </div>
  );
}

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

/** The rankings: three steps rise, two of the drawn students and Tavi drop onto them, and the crown lands last. */
export function Podium({ className }: { className?: string }) {
  const step = "scene-grow relative grid place-items-start justify-center rounded-t-2xl pt-3 text-[2.5rem] font-black leading-none text-forest";
  return (
    <Scene aria-hidden="true" className={cx("relative mx-auto grid max-w-[26rem] grid-cols-3 items-end", className)}>
      <div className="flex flex-col items-center">
        <div className="scene-drop mb-[-4%] w-[96%]" style={delay(520)}>
          <TudungLeap className="w-full" />
        </div>
        <div className={cx(step, "h-28 w-full")} style={{ backgroundColor: silver, boxShadow: `inset 0 10px 0 ${silverShine}`, ...delay(120) }}>2</div>
      </div>
      <div className="relative flex flex-col items-center">
        <div className="scene-drop absolute -top-[18%] left-1/2 z-10 w-[38%] -translate-x-1/2" style={delay(900)}>
          <Crown className="w-full -rotate-6" />
        </div>
        <div className="scene-drop mb-[-4%] w-[92%]" style={delay(680)}>
          <Mascot mood="cheer" outfit="graduate" decorative />
        </div>
        <div className={cx(step, "h-40 w-full")} style={{ backgroundColor: gold, boxShadow: `inset 0 10px 0 ${goldShade}`, ...delay(260) }}>1</div>
      </div>
      <div className="flex flex-col items-center">
        <div className="scene-drop mb-[-2%] w-[120%] max-w-none" style={delay(600)}>
          <BobFly className="w-full" />
        </div>
        <div className={cx(step, "h-20 w-full")} style={{ backgroundColor: bronze, boxShadow: `inset 0 10px 0 ${bronzeShine}`, ...delay(0) }}>3</div>
      </div>
      <div className="col-span-3 h-4 rounded-b-lg" style={{ backgroundColor: screenBase }} />
    </Scene>
  );
}

/** Live class: a laptop on a Zoom call with the teaching team. LIVE, Zoom's wordmark and Rewatch sit in the call's
    own bar and its controls in a dock below the team, who stand clear of every edge, so nothing is drawn over a
    face. Tavi in a mortarboard waves beside it. The call's chrome is sized from the screen's width, with a floor that keeps its labels
    readable on a phone. */
export function Classroom({
  image,
  intro,
  className,
}: {
  image: { readonly src: string; readonly alt: string; readonly w: number; readonly h: number };
  intro?: "view" | "load";
  className?: string;
}) {
  const tag = "scene-pop inline-flex items-center gap-[0.4em] rounded-lg px-[0.8em] py-[0.3em] text-[max(0.6875rem,3cqw)] font-black uppercase leading-[1.5] tracking-[0.08em]";
  const control = "grid size-[max(1.625rem,8cqw)] place-items-center rounded-full [&>svg]:size-[52%]";
  return (
    <Scene intro={intro} className={cx("relative mx-auto w-full max-w-[34rem] pb-6", className)}>
      <div className="relative mx-[6%] rounded-t-[1.4rem] p-3 pb-4" style={{ backgroundColor: screenBase }}>
        <div className="@container flex aspect-[16/10.5] flex-col overflow-hidden rounded-xl bg-paper">
          {/* Zoom's wordmark sits dead centre where the bar is wide enough, and evenly between the tags where it is not. */}
          <div className="flex items-center justify-between gap-x-[2.5cqw] px-[3.5cqw] py-[2.6cqw] @[16rem]:grid @[16rem]:grid-cols-[1fr_auto_1fr] @[16rem]:*:first:justify-self-start @[16rem]:*:last:justify-self-end">
            <span className={cx(tag, "bg-wrong-fill text-white shadow-[0_3px_0_var(--color-wrong-ledge)]")} style={delay(350)}>
              <span className="size-[max(6px,1.8cqw)] shrink-0 animate-pulse rounded-full bg-white" />
              Live
            </span>
            {/* Classes run on Zoom: its own wordmark (public/assets/brands), never redrawn. */}
            <Image src="/assets/brands/zoom.svg" alt="Zoom" width={906} height={206} unoptimized className="scene-pop h-[max(0.625rem,3.6cqw)] w-auto" style={delay(420)} />
            <span className={cx(tag, "bg-sky-soft text-sky-ink shadow-[0_3px_0_var(--color-sky-ink)]")} style={delay(500)}>
              {/* On the narrowest phones the bar has no room for the triangle beside Zoom's wordmark. */}
              <Play className="hidden size-[0.85em] @[16rem]:block" />
              Rewatch
            </span>
          </div>
          <div className="relative min-h-0 flex-1 overflow-hidden bg-sky-soft">
            <span aria-hidden="true" className="absolute left-1/2 top-[12%] aspect-square w-[84%] -translate-x-1/2 rounded-full bg-paper" />
            {/* The team photo is a cut-out, 1.88:1, whose back row reaches its top edge: set narrower than the stage and on its floor, it keeps air above the heads. It is also held under the stage's height, so a bar made taller by a long label shrinks the team and never crops their heads. */}
            <Image src={image.src} alt={image.alt} width={image.w} height={image.h} sizes="(min-width: 768px) 400px, 70vw" className="absolute bottom-0 left-1/2 h-auto max-h-[94%] w-[86%] max-w-none -translate-x-1/2 object-contain object-bottom" />
            <div aria-hidden="true" className="scene-pop absolute bottom-[3cqw] left-[3.5cqw] flex gap-[1.4cqw] rounded-full bg-paper p-[1.2cqw] shadow-[0_3px_0_var(--color-line-strong)]" style={delay(650)}>
              <span className={cx(control, "bg-cream text-forest")}>
                <Microphone />
              </span>
              <span className={cx(control, "bg-brand text-night")}>
                <VideoCamera />
              </span>
              <span className={cx(control, "bg-cream text-forest")}>
                <ChatCircle />
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="h-5 rounded-b-[1.4rem] rounded-t-md" style={{ backgroundColor: laptopBase, boxShadow: `0 6px 0 ${laptopBaseShade}` }} />
      <div className="scene-pop absolute -bottom-2 -right-3 w-[30%] sm:-right-4" style={delay(150)}>
        <Mascot mood="wave" outfit="graduate" decorative />
      </div>
    </Scene>
  );
}

const voucherSpots = [
  { x: 0, y: 8, w: 36, tilt: -12 },
  { x: 64, y: 2, w: 36, tilt: 12 },
  { x: 31, y: -4, w: 34, tilt: -3 },
  { x: 56, y: 32, w: 34, tilt: 6 },
] as const;

const coinSpots = [
  { x: 16, y: 50, w: 8 },
  { x: 76, y: 60, w: 8 },
  { x: 44, y: 42, w: 10 },
] as const;

/** Rewards: the chest pops up, then vouchers and coins burst out of it to their spots and drift. */
export function TreasureScene({
  vouchers,
  intro,
  className,
}: {
  vouchers: ReadonlyArray<VoucherData>;
  intro?: "view" | "load";
  className?: string;
}) {
  const pieces: Piece[] = [
    ...vouchers.slice(0, voucherSpots.length).map((v, i) => {
      const spot = voucherSpots[i] ?? voucherSpots[0];
      return { key: v.name, ...spot, ratio: 5 / 6, node: <Voucher {...v} sizes={voucherSizes.scene} /> };
    }),
    ...coinSpots.map((c, i) => ({ key: `coin-${i}`, ...c, ratio: 0.875, node: <CoinArt className="w-full" /> })),
  ];
  return (
    <BurstStage pieces={pieces} from={{ x: 50, y: 70 }} intro={intro} delay={350} className={cx("max-w-[28rem]", className)}>
      <div className="scene-pop absolute bottom-[2%] left-1/2 w-[62%] -translate-x-1/2">
        <Chest open className="w-full" />
      </div>
    </BurstStage>
  );
}
