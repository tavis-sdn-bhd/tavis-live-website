import { Fragment, type AnchorHTMLAttributes, type ReactNode } from "react";
import { DesignLink } from "../design-link";
import { cx } from "../ui";

/* Variant B's building blocks. Duolingo's grammar: a chunky uppercase button on
   a 4px ledge, a short green headline (lowercase in B), one grey sentence, one big
   picture, and a lot of white around each idea. */

type Tone = "green" | "white" | "sky" | "red";
type Size = "sm" | "md" | "lg";

/* Fill, label and lip. Every label keeps 4.5:1 on its fill at rest and hovered: sky brightens less, white dims. */
const tones: Record<Tone, string> = {
  green: "bg-brand-bright text-forest shadow-[0_4px_0_var(--color-brand-ledge)] [--ledge-hover:1.05]",
  white: "bg-paper text-sky-ink ring-2 ring-inset ring-line-strong shadow-[0_4px_0_var(--color-line-strong)] [--ledge-hover:0.95]",
  sky: "bg-sky-ink text-white shadow-[0_4px_0_var(--color-sky-ledge)] [--ledge-hover:1.05]",
  red: "bg-wrong-ink text-white shadow-[0_4px_0_var(--color-wrong-ledge)]",
};

/* `sm` is the header's: 40px tall, with an invisible 4px margin of touch around it so the target still reaches 48px. */
const sizes: Record<Size, string> = {
  sm: "relative min-h-10 py-1.5 px-3.5 text-[0.8125rem] before:absolute before:-inset-1 before:content-['']",
  md: "min-h-[3.125rem] py-2 px-5 text-body-sm",
  lg: "min-h-14 py-3 px-5 text-body-sm sm:px-7",
};

export function buttonClass({ tone = "green", size = "md", className }: { tone?: Tone; size?: Size; className?: string }) {
  return cx(
    "ledge inline-flex select-none items-center justify-center gap-2 max-w-full text-center text-balance rounded-2xl font-display uppercase tracking-[0.05em] [-webkit-touch-callout:none]",
    tones[tone],
    sizes[size],
    className,
  );
}

type ButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; tone?: Tone; size?: Size };

/** Internal hrefs stay inside the design being viewed; external and # hrefs pass through, and next/link renders those as plain anchors. */
export function Button({ href, tone, size, className, children, ...props }: ButtonProps) {
  return (
    <DesignLink href={href} className={buttonClass({ tone, size, className })} {...props}>
      {children}
    </DesignLink>
  );
}

/** Full-bleed backgrounds. White is the page; sky is Duolingo's pale feature band; night is the dark band (the paid tier, and Rewards' avatar section); green is the brand at full volume. */
type Band = "white" | "sky" | "night" | "green";

const bands: Record<Band, string> = {
  white: "",
  sky: "bg-sky-soft",
  night: "bg-night text-on-forest",
  green: "bg-brand",
};

const headlineTone: Record<Band, string> = {
  white: "text-brand-ink",
  sky: "text-brand-ink",
  night: "text-brand",
  green: "text-night",
};

const bodyTone: Record<Band, string> = {
  white: "text-muted",
  sky: "text-forest/75",
  night: "text-on-forest-muted",
  green: "text-brand-deep",
};

/** A title as the copy writes it: one string, or the lines it is authored in. */
export type Title = string | readonly string[];

/** Design B keeps Duolingo's lowercase headlines; BA sets them in sentence case, as the copy writes them. Add this to a
    headline that both designs share. */
export const bLowercase = "in-data-[design=b]:lowercase";

/** Names a lowercase headline (design B's) keeps capitalised, so they never read as typos: Malaysia, Malaysian, Form
    (as in "Form 1–5") and KSSM. "Tavis" is left to lowercase, as the wordmark is. */
const properNoun = /(\bMalaysia\S*|\bForm(?=\u00a0)|\bKSSM\b)/;

function keepNames(line: string) {
  return line.split(properNoun).map((part, i) => (i % 2 ? <span key={i} className="normal-case">{part}</span> : part));
}

/** Each authored line as its own block, so a phrase only ever wraps inside itself; a space between the blocks keeps
    the heading's text readable as one sentence. */
export function Lines({ title, names = true }: { title: Title; /** Keep proper nouns capitalised under `lowercase`. */ names?: boolean }) {
  const parts = typeof title === "string" ? [title] : title;
  return parts.map((line, i) => (
    <Fragment key={i}>
      {i > 0 && " "}
      <span className="block">{names ? keepNames(line) : line}</span>
    </Fragment>
  ));
}

/** The sentence under a headline: 18px on phones, 20px from tablets. Balanced, so its last line is never a word or two. */
export const lede = "text-[clamp(1.125rem,1rem+0.5vw,1.25rem)] font-semibold leading-relaxed text-balance";

/** Green headline, set big and black: sentence case in BA, as the copy writes it, and lowercase in B (`bLowercase`).
    A section headline stays under the subpage h1 (`SplitHero`) at every width, so the page title is the largest
    type on its page; a design whose h1 is larger sets `--headline` (B, in `layout.tsx`). `closing` is the download
    band's, set at full size. */
export function Headline({ title, as: Tag = "h2", band = "white", closing, className }: { title: Title; as?: "h1" | "h2"; band?: Band; closing?: boolean; className?: string }) {
  return (
    <Tag className={cx(closing ? "text-[clamp(2.125rem,1.4rem+3.6vw,4.5rem)]" : "text-[length:var(--headline,clamp(2.125rem,1.8rem+1.9vw,3.5rem))]", "leading-[0.98] text-balance [overflow-wrap:break-word]", bLowercase, headlineTone[band], className)}>
      <Lines title={title} />
    </Tag>
  );
}

const sectionY = "py-[clamp(5rem,3rem+7vw,9rem)]";

type FeatureProps = {
  id?: string;
  title: Title;
  body: string;
  visual: ReactNode;
  children?: ReactNode;
  /** Picture on the right instead of the left. */
  flip?: boolean;
  band?: Band;
  /** Decoration behind the picture: floaters, a blob. */
  backdrop?: ReactNode;
  /** On phones, put the headline above the picture: for a picture that reads as a list and needs its heading first. */
  textFirst?: boolean;
};

/** A headline in half the shell, from md, sized as Duolingo sets its feature rows: small enough that each authored
    line of a two-line title fits the column at most widths, and that no word is ever clipped. */
export const halfColumnHeadline = "md:text-[clamp(2rem,0.75rem+2.9vw,3.25rem)] md:leading-[1.02]";

/** One idea: picture on one side, headline and a sentence on the other. Stacks centred on phones. */
export function Feature({ id, title, body, visual, children, flip, band = "white", backdrop, textFirst }: FeatureProps) {
  return (
    <section id={id} data-band={band} className={cx("overflow-hidden", sectionY, bands[band])}>
      <div className="shell grid items-center gap-14 md:grid-cols-2 md:gap-16 lg:gap-24">
        <div className={cx("relative mx-auto w-full max-w-[30rem]", flip && "md:order-2", textFirst && "max-md:order-2")}>
          {backdrop}
          <div className="relative">{visual}</div>
        </div>
        <div className="text-center md:text-left">
          <Headline band={band} title={title} className={halfColumnHeadline} />
          <p className={cx("mx-auto mt-6 max-w-[30rem] md:mx-0", lede, bodyTone[band])}>{body}</p>
          {children && <Actions className="mt-9 md:justify-start">{children}</Actions>}
        </div>
      </div>
    </section>
  );
}

/** A row of calls to action. On phones they stack and each button is full width up to 21rem, as in the heroes; a
    quiet text link keeps its own width. */
export function Actions({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cx("flex flex-wrap justify-center gap-3 max-sm:mx-auto max-sm:max-w-[21rem] max-sm:flex-col max-sm:items-center max-sm:[&>.ledge]:w-full", className)}>
      {children}
    </div>
  );
}

/** A full-bleed band holding anything. `cta` marks a call-to-action block, which the floating chat steps aside for. */
export function Section({ id, band = "white", cta, className, children }: { id?: string; band?: Band; cta?: boolean; className?: string; children: ReactNode }) {
  return (
    <section id={id} data-band={band} data-cta={cta || undefined} className={cx("relative overflow-hidden", sectionY, bands[band], className)}>
      {children}
    </section>
  );
}

/** Centred headline block for sections whose picture is wide. `wide` lets the sentence run as wide as a table below
    it (64rem), where keeping it to one line matters more than its measure; the headline keeps its own width. */
export function Centered({ title, body, band = "white", wide, className }: { title: Title; body?: string; band?: Band; wide?: boolean; className?: string }) {
  return (
    <div className={cx("mx-auto text-center", wide ? "max-w-[64rem]" : "max-w-[48rem]", className)}>
      <Headline band={band} title={title} className={wide ? "mx-auto max-w-[48rem]" : undefined} />
      {body && <p className={cx("mx-auto mt-6", !wide && "max-w-[34rem]", lede, bodyTone[band])}>{body}</p>}
    </div>
  );
}

/** Duolingo's paid-tier headline: heavy slanted caps in a green-to-sun gradient, for the night band. */
export function Shout({ title, body, align = "center" }: { title: Title; body: string; align?: "center" | "start" }) {
  return (
    <>
      {/* Set beside a picture (`start`), it has half the shell from md, so it steps down there. */}
      <h2 className={cx("shout bg-linear-to-r from-brand via-brand-lime to-sun bg-clip-text pb-1 text-[clamp(2.25rem,1.35rem+4vw,5rem)] leading-[0.95] text-transparent", align === "start" && "md:text-[clamp(2rem,0.25rem+3.6vw,3.75rem)]")}>
        <Lines title={title} names={false} />
      </h2>
      <p className={cx("mx-auto mt-6 max-w-[30rem]", lede, align === "start" && "md:mx-0", bodyTone.night)}>{body}</p>
    </>
  );
}

/** Round badges on a path (lesson steps, years): green, sun, sky, each on its ledge. */
export const ledgeFills = [
  "bg-brand text-forest shadow-[0_6px_0_var(--color-brand-ledge)]",
  "bg-sun text-forest shadow-[0_6px_0_var(--color-sun-ledge)]",
  "bg-sky-ink text-white shadow-[0_6px_0_var(--color-sky-ledge)]",
] as const;

/** The chunky card: 2px border, 4px bottom edge, big radius. */
export const chunky = "rounded-3xl border-2 border-b-4 border-line bg-paper";
