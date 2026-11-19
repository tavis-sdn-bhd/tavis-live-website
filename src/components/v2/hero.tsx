import type { CSSProperties, ReactNode } from "react";
import { Mascot, type Mood, type Outfit } from "../mascot";
import { cx } from "../ui";
import { Bolt, Floaters, Star } from "./art";
import { BobFly, CoinArt, Dash, GlassesTumble, TavisMark, TudungLeap } from "./cast";
import { Scene } from "./scene";
import { Lines, lede, type Title } from "./ui";

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

/* Duolingo opens on its app: the phone wobbles, tips onto its back, and Duo
   and friends burst out of the screen. Ours opens the Tavis app, and out
   come Tavi and three students drawn for this page, with points spilling
   onto the phone. Positions are % of a square stage. */

/** Centre of the phone's screen before it tips: where every piece starts. */
const origin = { x: 50, y: 48 };

type Piece = { key: string; x: number; y: number; w: number; /** height ÷ width */ ratio: number; tilt?: number; node: ReactNode };

const pieces: readonly Piece[] = [
  { key: "coin-a", x: 30, y: 66, w: 11, ratio: 0.875, tilt: -10, node: <CoinArt className="w-full" /> },
  { key: "coin-b", x: 42, y: 73, w: 12, ratio: 0.875, tilt: 8, node: <CoinArt className="w-full" /> },
  { key: "coin-c", x: 55, y: 67, w: 10, ratio: 0.875, tilt: -4, node: <CoinArt className="w-full" /> },
  { key: "coin-d", x: 38, y: 60, w: 8, ratio: 0.875, tilt: 14, node: <CoinArt className="w-full" /> },
  { key: "bob", x: 24, y: 0, w: 36, ratio: 0.75, node: <BobFly className="w-full" /> },
  { key: "tudung", x: 1, y: 6, w: 31, ratio: 1.2, node: <TudungLeap className="w-full" /> },
  { key: "glasses", x: 0, y: 42, w: 32, ratio: 1, node: <GlassesTumble className="w-full" /> },
  { key: "tavi", x: 44, y: 15, w: 52, ratio: 1, node: <Mascot mood="swim" outfit="school" decorative /> },
  { key: "dash-pink", x: 64, y: 5, w: 9, ratio: 0.3, tilt: 35, node: <Dash colour="var(--color-coral)" className="w-full" /> },
  { key: "dash-sky", x: 90, y: 14, w: 8, ratio: 0.3, tilt: -25, node: <Dash colour="var(--color-sky)" className="w-full" /> },
  { key: "dash-orange", x: 10, y: 86, w: 8, ratio: 0.3, tilt: 20, node: <Dash colour="var(--color-bm)" className="w-full" /> },
  { key: "dash-purple", x: 86, y: 72, w: 9, ratio: 0.3, tilt: -35, node: <Dash colour="var(--color-en)" className="w-full" /> },
];

function Burst() {
  return (
    <Scene intro="load" aria-hidden="true" className="relative mx-auto aspect-square w-[82%] max-w-[26rem] md:w-full [container-type:size]">
      {/* The phone: a white face on a green slab, the Tavis mark on its screen. */}
      <div className="phone-open absolute left-[35%] top-[18%] w-[30%] origin-[50%_60%]">
        <div className="grid aspect-[1/2] place-items-center rounded-[24%/12%] border-4 border-brand-soft bg-paper shadow-[9px_9px_0_var(--color-brand)]">
          <TavisMark className="icon-away w-[60%]" />
        </div>
      </div>

      {pieces.map((p, i) => {
        const fx = origin.x - (p.x + p.w / 2);
        const fy = origin.y - (p.y + (p.w * p.ratio) / 2);
        return (
          <div
            key={p.key}
            className="burst absolute"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.w}%`, "--fx": fx, "--fy": fy, "--delay": `${1450 + i * 55}ms` } as CSSProperties}
          >
            <div className="animate-float" style={{ animationDelay: `-${i * 0.9}s` }}>
              <div style={{ rotate: `${p.tilt ?? 0}deg` }}>{p.node}</div>
            </div>
          </div>
        );
      })}
    </Scene>
  );
}

/** Home: the app bursting open on one side, the promise and two stacked buttons on the other; `footer` sits on the fold. */
export function HomeHero({ title, actions, footer }: { title: Title; actions: ReactNode; footer?: ReactNode }) {
  return (
    // Fills the screen under the header: 74px from sm, its 72px bar and 2px border.
    <section id="top" className="flex flex-col lg:min-h-[calc(100svh-4.625rem)]">
      <div className="shell flex flex-1 items-center">
        <div className="mx-auto grid w-full max-w-[60rem] items-center gap-8 py-10 md:grid-cols-2 md:gap-14 md:py-14">
          <Burst />
          <div className="text-center">
            <h1 className="intro-fade mx-auto max-w-[24rem] text-[clamp(1.75rem,1.25rem+1.7vw,2.5rem)] font-extrabold leading-[1.2] text-forest" style={delay(150)}>
              <Lines title={title} names={false} />
            </h1>
            <div className="intro-fade mx-auto mt-9 grid w-full max-w-[21rem] gap-3" style={delay(260)}>
              {actions}
            </div>
          </div>
        </div>
      </div>
      {footer}
    </section>
  );
}

/** Subpages: one Tavi dressed for the page, the headline under it, centred. */
export function PageHero({
  title,
  body,
  outfit,
  mood,
  actions,
  children,
}: {
  title: Title;
  body: string;
  outfit: Outfit;
  mood: Mood;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section id="top" className="pt-10 sm:pt-14">
      <div className="shell pb-12 text-center sm:pb-16">
        <TaviDisc outfit={outfit} mood={mood} className="mx-auto w-[min(70%,20rem)]" />
        <h1 className="intro-fade mx-auto mt-8 max-w-[52rem] text-[clamp(2.75rem,1.5rem+4.4vw,5.25rem)] leading-[0.98] lowercase text-brand-ink" style={delay(200)}>
          <Lines title={title} />
        </h1>
        <p className={cx("intro-fade mx-auto mt-6 max-w-[34rem] text-muted", lede)} style={delay(300)}>
          {body}
        </p>
        {actions && (
          <div className="intro-fade mx-auto mt-9 flex flex-wrap justify-center gap-3" style={delay(400)}>
            {actions}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

/** Tavi dressed for the page on a sky disc, popping in on load; the pupils follow the pointer. */
export function TaviDisc({ outfit, mood, className }: { outfit: Outfit; mood: Mood; className?: string }) {
  return (
    <div className={cx("relative", className)}>
      <div aria-hidden="true" className="absolute inset-[6%] rounded-full bg-sky-soft" />
      <Floaters
        spots={[
          { node: <Star className="w-full" />, className: "left-[-14%] top-[18%] w-[18%] -rotate-12" },
          { node: <Bolt className="w-full" />, className: "right-[-12%] top-[30%] w-[16%] rotate-12" },
        ]}
      />
      <div className="intro-pop relative mx-auto w-[78%]" style={delay(80)}>
        <Mascot outfit={outfit} mood={mood} follow decorative />
      </div>
    </div>
  );
}

/** BA's subpage hero, after Duolingo's subject pages: the headline, a sentence and the buttons on one side, the
    page's scene on the other, lined up with the sections below. Below lg the words come first and the scene sits
    under them, as half a tablet is too narrow for a scene. The words fade in on load; the scene plays its own intro. */
export function SplitHero({ title, body, actions, art }: { title: Title; body: string; actions?: ReactNode; art: ReactNode }) {
  return (
    <section id="top" className="overflow-x-clip pb-[clamp(3.5rem,2rem+5vw,6rem)] pt-10 sm:pt-14">
      <div className="shell">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div className="text-center lg:text-left">
            <h1 className="intro-fade text-[clamp(2.375rem,1.6rem+2.6vw,3.875rem)] leading-[1] lowercase text-brand-ink text-balance" style={delay(120)}>
              <Lines title={title} />
            </h1>
            <p className={cx("intro-fade mx-auto mt-6 max-w-[30rem] text-muted lg:mx-0", lede)} style={delay(220)}>
              {body}
            </p>
            {actions && (
              <div className="intro-fade mx-auto mt-9 grid w-full max-w-[21rem] gap-3 lg:mx-0" style={delay(320)}>
                {actions}
              </div>
            )}
          </div>
          <div className="mx-auto w-full max-w-[30rem]">{art}</div>
        </div>
      </div>
    </section>
  );
}
