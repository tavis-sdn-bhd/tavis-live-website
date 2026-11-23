import { Image } from "@/components/image";
import { Fragment, type ComponentType, type CSSProperties, type ReactNode, type SVGProps } from "react";
import { download, faq, screens, testimonials, why } from "@/lib/content";
import { aboutPage, pressHighlights, questionUniverse, subjectGroups, timetableSubjects, tuitionPage, type LinkedOutlet } from "@/lib/pages";
import { CountUp } from "../count-up";
import { BookOpen, Cards, Gift, SealCheck } from "../icons";
import { GetQr } from "../get-qr";
import { Marquee } from "../marquee";
import { Mascot } from "../mascot";
import { StoreBadges } from "../store-badges";
import { NewTab, cx } from "../ui";
import { Bolt, Chest, Classroom, Crown, Flame, Floaters, Star, TiltedPhone, Trophy } from "./art";
import { DesignLink } from "../design-link";
import { Scene } from "./scene";
import { subjectLang } from "../subject";
import { SubjectIcon } from "./subject-icon";
import { Actions, Centered, Headline, Section, Shout, chunky, halfColumnHeadline, lede, ledgeFills, type Title } from "./ui";

/* Variant B sections shared by more than one page. Copy comes from the same
   content files as variant A; only the drawing differs. Subject colours are
   fills here, as Duolingo's are, where A keeps them to dots. */

/** Duolingo's row of course flags, as the subjects on the 2027 timetable. */
export function SubjectStrip() {
  return (
    <div className="border-y-2 border-line py-6">
      <Marquee
        label="Subjects"
        speed={30}
        items={timetableSubjects.map((name) => ({
          key: name,
          node: (
            <span lang={subjectLang(name)} className="flex h-14 items-center gap-3 px-3 font-display text-body-sm uppercase tracking-[0.06em] text-muted">
              <SubjectIcon name={name} className="size-11" />
              {name}
            </span>
          ),
        }))}
      />
    </div>
  );
}

/* The dot between a tutor's subjects, drawn on a space. A space that ends a line collapses, so a caption that wraps
   breaks between two subjects and has no dot there. A drawn dot is not text, so a comma for screen readers goes with it. */
const gapDot = "bg-[radial-gradient(circle,currentColor_0.1em,transparent_0.13em)] [word-spacing:0.5em]";

/** Tutor faces in rings, like a friends list. `night` sets the names for the dark band. */
export function TutorFaces({ count, credentials, night, className }: { count?: number; credentials?: boolean; night?: boolean; className?: string }) {
  return (
    <ul className={cx("grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 sm:gap-y-6", className)}>
      {tuitionPage.tutors.list.slice(0, count).map((t) => (
        <li key={t.name} className="text-center">
          <span className="mx-auto block aspect-square w-full max-w-[7.5rem] overflow-hidden rounded-full bg-mint p-1">
            <Image src={t.src} alt={t.name} width={t.w} height={t.h} sizes="120px" className="size-full rounded-full bg-cream object-cover object-top" />
          </span>
          {/* A name may run 8px into the gap on each side: "Cikgu Sue Dino" stays on one line in a 98px column. */}
          <span className={cx("-mx-2 mt-2 block text-body-sm font-extrabold leading-tight", night ? "text-on-forest" : "text-forest")}>{t.name}</span>
          <span className={cx("block text-caption font-bold", night ? "text-on-forest-muted" : "text-muted")}>
            {t.subjects.map((subject, i) => (
              <Fragment key={subject}>
                {i > 0 && (
                  <>
                    <span className="sr-only">,</span>
                    <span className={gapDot}> </span>
                  </>
                )}
                <span lang={subjectLang(subject)} className="inline-block">
                  {subject}
                </span>
              </Fragment>
            ))}
          </span>
          {credentials && <span className="mx-auto mt-1 block max-w-[11rem] text-caption font-semibold leading-snug text-muted">{t.credential}</span>}
        </li>
      ))}
    </ul>
  );
}

type IconType = ComponentType<SVGProps<SVGSVGElement>>;
const tileColors = ["bg-brand text-forest", "bg-sun text-forest", "bg-sky-ink text-white"] as const;

/** Reasons as chunky cards, each led by a bright icon tile. */
export function Tiles({ items, icons }: { items: ReadonlyArray<{ title: string; body: string }>; icons: readonly IconType[] }) {
  return (
    // Three tiles go three across from sm, never two and an orphan; four go two by two, then four across.
    <ul className={cx("mt-14 grid gap-4", items.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2", items.length >= 4 && "lg:grid-cols-4")}>
      {items.map((item, i) => {
        const Icon = icons[i] ?? Cards;
        return (
          <li key={item.title}>
            <div className={cx(chunky, "h-full p-6 text-center")}>
              <span className={cx("mx-auto grid size-16 place-items-center rounded-2xl shadow-[inset_0_-5px_0_rgb(0_0_0/0.15)]", tileColors[i % tileColors.length])}>
                <Icon className="size-8" />
              </span>
              <h3 className="mt-5 text-[1.25rem] leading-tight">{item.title}</h3>
              <p className="mt-1.5 font-semibold text-muted">{item.body}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/* The path winds less on phones, where 45% of the row pushed "Log in daily" past the screen edge. */
const pathOffsets = ["translate-x-0", "translate-x-[25%] sm:translate-x-[45%]", "-translate-x-[5%] sm:-translate-x-[10%]", "translate-x-[20%] sm:translate-x-[35%]"] as const;

/** Duolingo's lesson path: round steps on a winding line, the first one waiting with a START bubble. */
export function Path({ steps, label }: { steps: ReadonlyArray<{ title: string }>; label: string }) {
  return (
    <Scene>
      {/* Stacked on phones, the START bubble stays inside the list's own padding, so what is above keeps its gap. */}
      <ol aria-label={label} className="mx-auto grid w-fit gap-9 py-4 max-md:pt-11">
        {steps.map((step, i) => (
          <li key={step.title} className={cx("flex items-center gap-5", pathOffsets[i % pathOffsets.length])}>
            <span className="relative shrink-0">
              {i === 0 && (
                <span aria-hidden="true" className="absolute -top-11 left-1/2 -translate-x-1/2 animate-bounce rounded-xl border-2 border-line bg-paper px-3 py-1.5 font-display text-caption uppercase tracking-[0.06em] text-brand-text">
                  Start
                  <span className="absolute -bottom-[7px] left-1/2 size-3 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-line bg-paper" />
                </span>
              )}
              <span
                className={cx("scene-pop grid size-[4.5rem] place-items-center rounded-full text-[1.75rem] font-black", ledgeFills[i % ledgeFills.length])}
                style={{ "--delay": `${i * 160}ms` } as CSSProperties}
              >
                {i + 1}
              </span>
            </span>
            <span className="max-w-[12rem] text-[1.125rem] font-extrabold leading-tight text-forest">{step.title}</span>
          </li>
        ))}
      </ol>
    </Scene>
  );
}

export function Why() {
  return (
    <Section id="why">
      <div className="shell">
        <Centered title={[why.title, why.accent]} />
        <Tiles items={why.items} icons={[Cards, BookOpen, SealCheck, Gift]} />
      </div>
    </Section>
  );
}

/** The two numbers, as big as the page allows, on the brand green. */
export function Stats() {
  return (
    <Section band="green" className="py-[clamp(4rem,3rem+4vw,6.5rem)]">
      <Floaters
        spots={[
          { node: <Star className="w-14" />, className: "left-[6%] top-[18%] -rotate-12 max-sm:left-[7%] max-sm:top-[7%] max-sm:w-10" },
          { node: <Trophy className="w-16" />, className: "right-[7%] top-[14%] rotate-12 max-sm:right-[7%] max-sm:top-[7%] max-sm:w-12" },
          { node: <Bolt className="w-12" />, className: "bottom-[14%] left-[16%] rotate-6 max-md:hidden" },
          { node: <Flame className="w-12" />, className: "bottom-[16%] right-[18%] -rotate-6 max-md:hidden" },
        ]}
      />
      <dl className="shell relative grid gap-10 text-center sm:grid-cols-2">
        {why.stats.map((s) => (
          <div key={s.label} className="flex flex-col-reverse items-center">
            <dt className="mt-2 text-[1.25rem] font-black uppercase tracking-[0.08em] text-brand-deep">{s.label}</dt>
            <dd className="shout text-[clamp(4rem,2.5rem+6vw,8rem)] leading-none tabular-nums text-night">
              <CountUp value={s.value} suffix={s.suffix} />
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}


/** Student quotes as speech bubbles, each with an initial in a coloured disc. */
export function Testimonials() {
  return (
    <Section id="testimonials">
      <div className="shell">
        <Centered title={[testimonials.title, testimonials.accent]} />
        <ul className="mt-14 grid gap-12 lg:grid-cols-3 lg:gap-6">
          {testimonials.items.map((t, i) => (
            <li key={t.name}>
              <figure className="flex h-full flex-col">
                <blockquote className={cx(chunky, "relative flex-1 p-7 text-[1.125rem] font-bold leading-snug text-forest")}>
                  <p>“{t.quote}”</p>
                  <span aria-hidden="true" className="absolute -bottom-[11px] left-10 size-5 rotate-45 border-b-4 border-r-2 border-line bg-paper" />
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3 pl-5">
                  <span aria-hidden="true" className={cx("grid size-11 place-items-center rounded-full text-[1.125rem] font-black", ledgeFills[i % ledgeFills.length])}>
                    {t.name.charAt(0)}
                  </span>
                  <span>
                    <span className="block font-extrabold text-forest">{t.name}</span>
                    <span className="block text-small font-bold text-muted">{t.form}</span>
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

type FaqSet = {
  readonly id: string;
  readonly title: string;
  readonly accent: string;
  readonly items: ReadonlyArray<{ readonly q: string; readonly a: string; readonly link?: { readonly label: string; readonly href: string } }>;
};

/** Native details/summary, drawn as chunky cards. Internal links stay in the design being viewed. The parents' questions unless given another set. */
export function Faq({ set = faq }: { set?: FaqSet }) {
  return (
    <Section id={set.id}>
      <div className="shell">
        <Centered title={[set.title, set.accent]} />
        <ul className="mx-auto mt-12 grid max-w-[46rem] gap-3">
          {set.items.map((item) => (
            <li key={item.q}>
              <details className={cx(chunky, "group transition-colors hover:border-line-strong open:pb-6")}>
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 rounded-[1.375rem] px-6 py-3 text-[1.125rem] font-extrabold text-balance text-forest transition-colors hover:bg-cream/60 active:bg-cream focus-visible:rounded-[1.375rem] [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span aria-hidden="true" className="relative grid size-9 shrink-0 place-items-center rounded-xl bg-cream transition-colors group-open:bg-brand">
                    <span className="absolute h-1 w-3.5 rounded-full bg-forest" />
                    <span className="absolute h-3.5 w-1 rounded-full bg-forest transition-transform duration-300 ease-out-expo group-open:scale-y-0" />
                  </span>
                </summary>
                <p className="max-w-[40rem] px-6 pt-1 font-semibold text-muted">{item.a}</p>
                {item.link && (
                  <DesignLink
                    href={item.link.href}
                    {...(!item.link.href.startsWith("/") && { target: "_blank", rel: "noopener noreferrer" })}
                    className="link-press mx-6 mt-3 inline-flex min-h-11 items-center font-display text-small uppercase tracking-[0.06em] text-sky-ink"
                  >
                    {item.link.label}
                    {!item.link.href.startsWith("/") && <NewTab />}
                  </DesignLink>
                )}
              </details>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

/** Online tuition is the paid tier, so it gets Duolingo's Super treatment: the night band and shouted caps.
    `flip` puts the words first: above the picture on phones, left of it from md. */
export function TuitionPromo({ title, body, art, flip, children }: { title: Title; body: string; art?: ReactNode; flip?: boolean; children?: ReactNode }) {
  return (
    <Section id="tuition" band="night">
      <Floaters
        spots={[
          { node: <Star fill="var(--color-brand)" className="w-12" />, className: "left-[4%] top-[10%] -rotate-12 max-md:hidden" },
          { node: <Star className="w-9" />, className: "right-[6%] top-[12%] rotate-12 max-md:hidden" },
          { node: <Bolt className="w-12" />, className: "bottom-[10%] right-[44%] rotate-6 max-md:hidden" },
        ]}
      />
      <div className="shell relative grid items-center gap-14 md:grid-cols-2 md:gap-16 lg:gap-24">
        <div className={cx(flip && "order-2")}>
          {art ?? <Classroom image={tuitionPage.hero.image} />}
        </div>
        <div className="text-center md:text-left">
          <Shout title={title} body={body} align="start" />
          {children && <Actions className="mt-9 md:justify-start">{children}</Actions>}
        </div>
      </div>
    </Section>
  );
}

/** Each form's subjects, from the 2027 timetable: one card per group of forms, every subject with its flag. */
export function SubjectGroups({ className }: { className?: string }) {
  return (
    <ul className={cx("mx-auto grid max-w-[44rem] gap-5 md:grid-cols-[5fr_6fr] xl:max-w-[66rem]", className)}>
      {subjectGroups.map((group) => (
        <li key={group.forms} className={cx(chunky, "p-6 sm:p-8")}>
          <h3 className="text-[1.5rem] leading-tight text-forest">{group.forms}</h3>
          <ul className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2 md:max-xl:grid-cols-1">
            {group.subjects.map((name) => (
              <li key={name} lang={subjectLang(name)} className="flex items-center gap-3 text-[1.0625rem] font-extrabold leading-tight text-forest">
                <SubjectIcon name={name} className="size-10" />
                {name}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

/** A numbered run of steps, like Duolingo's "how your free trial works": across on wide screens, down on phones. */
export function Steps({ items, className }: { items: ReadonlyArray<{ title: string; body: string }>; className?: string }) {
  return (
    <Scene className={className}>
      <ol className={cx("relative grid gap-8 md:gap-6", items.length === 4 ? "md:grid-cols-4" : "md:grid-cols-3")}>
        <span aria-hidden="true" className="absolute left-9 top-9 h-[calc(100%-4.5rem)] w-1 -translate-x-1/2 rounded-full bg-line-strong md:left-[12%] md:right-[12%] md:h-1 md:w-auto md:translate-x-0" />
        {items.map((step, i) => (
          <li key={step.title} className="relative flex items-start gap-5 md:flex-col md:items-center md:text-center">
            <span
              aria-hidden="true"
              className={cx("scene-pop grid size-[4.5rem] shrink-0 place-items-center rounded-full text-[1.75rem] font-black", ledgeFills[i % ledgeFills.length])}
              style={{ "--delay": `${i * 160}ms` } as CSSProperties}
            >
              {i + 1}
            </span>
            <span className="pt-2 md:pt-0">
              <span className="block text-[1.25rem] font-extrabold leading-tight text-forest">{step.title}</span>
              <span className="mt-1.5 block font-semibold text-muted">{step.body}</span>
            </span>
          </li>
        ))}
      </ol>
    </Scene>
  );
}

/** The app download block: Tavi, the store badges and, for desktops, a QR code. The header's "Get Tavis" lands here. */
export function DownloadBand() {
  return (
    <Section id="download" band="sky" cta className="text-center">
      <Floaters
        spots={[
          { node: <Flame className="w-14" />, className: "left-[8%] top-[12%] -rotate-12" },
          { node: <Crown className="w-16" />, className: "right-[10%] top-[10%] rotate-12" },
          { node: <Chest className="w-16" />, className: "bottom-[12%] left-[12%] -rotate-6 max-md:hidden" },
          { node: <Bolt className="w-12" />, className: "bottom-[16%] right-[14%] rotate-6 max-md:hidden" },
          { node: <Star className="w-10" />, className: "left-[30%] top-[6%] rotate-12 max-md:hidden" },
        ]}
      />
      <TiltedPhone screen={screens.home} tilt={-12} className="absolute -left-10 top-1/2 hidden w-[15rem] -translate-y-1/2 xl:block" />
      <TiltedPhone screen={questionUniverse.universe.screen} tilt={10} className="absolute -right-10 top-1/2 hidden w-[15rem] -translate-y-1/2 xl:block" />
      <div className="shell relative">
        <Mascot mood="cheer" outfit="graduate" decorative className="mx-auto w-[min(60%,16rem)]" />
        <Headline closing band="sky" title={download.title} className="mx-auto mt-8 max-w-[44rem]" />
        <p className={cx("mt-5 text-forest", lede)}>{download.body}</p>
        <StoreBadges className="mt-10 justify-center" />
        <DownloadQr className="mt-8 justify-center" />
      </div>
    </Section>
  );
}

/** The QR code to the app, for desktop visitors; a phone uses the badges. */
export function DownloadQr({ className }: { className?: string }) {
  return (
    <div className={cx("hidden items-center gap-4 pointer-fine:lg:flex", className)}>
      <span className="rounded-2xl border-2 border-b-4 border-line bg-paper p-2.5 text-forest">
        <GetQr className="block size-[5.5rem]" />
      </span>
      <span className="max-w-[10rem] text-left text-body-sm font-bold leading-snug text-forest">{download.scan}</span>
    </div>
  );
}

/** A page's own last call to action, for a page whose main ask is not the app (tuition sign-up): the picture on one
    side, a headline and stacked buttons on the other; on phones the words and buttons come first. The download band
    follows it, from the footer. */
export function ClosingCta({
  title,
  body,
  art,
  actions,
}: {
  title: Title;
  body?: string;
  art: ReactNode;
  actions: ReactNode;
}) {
  return (
    <Section id="get-started" cta>
      <div className="shell">
        <div className="mx-auto grid max-w-[60rem] items-center gap-10 md:grid-cols-2 md:gap-14">
          <div className="mx-auto w-[82%] max-w-[26rem] max-md:order-2 md:w-full">{art}</div>
          <div className="text-center">
            <Headline title={title} className={halfColumnHeadline} />
            {body && <p className={cx("mx-auto mt-6 max-w-[26rem] text-muted", lede)}>{body}</p>}
            <div className="mx-auto mt-9 grid w-full max-w-[21rem] gap-3">{actions}</div>
          </div>
        </div>
      </div>
    </Section>
  );
}

type Outlet = (typeof aboutPage.press.outlets)[number];

/**
 * A press logo at its optical size. Every logo covers the same area (`area`, in CSS px²), so a long wordmark and a
 * square badge read equally loud; a filled box reads heavier than bare letters, so it gets two thirds of the area and
 * rounded corners that make the box look meant. Width is capped by the space it sits in. A container that sets
 * `--logo-root` (the square root of the area, as a length) can shrink the whole set at once, for smaller tiles on phones.
 */
export function PressLogo({ outlet, area, className }: { outlet: Outlet; area: number; className?: string }) {
  const ratio = outlet.w / outlet.h;
  const solid = "solid" in outlet && outlet.solid;
  const factor = Math.sqrt(ratio * (solid ? 0.66 : 1));
  const root = Math.round(Math.sqrt(area));
  const width = Math.round(root * factor);
  return (
    <Image
      src={outlet.src}
      alt=""
      width={outlet.w}
      height={outlet.h}
      sizes={`${width}px`}
      style={{ width: `calc(var(--logo-root, ${root}px) * ${factor.toFixed(3)})` }}
      className={cx("h-auto max-w-full", solid && "rounded-[0.3125rem]", className)}
    />
  );
}

const linkedOutlets = aboutPage.press.outlets.filter((o): o is LinkedOutlet => o.href !== null);

/** BA's "featured in" strip under the hero: the best-known outlets, each linking to its article, at optical sizes. */
export function PressRow() {
  return (
    <section id="press" aria-labelledby="press-title" data-strip className="pb-[clamp(3.5rem,2rem+5vw,6rem)] pt-10">
      <div className="shell">
        <h2 id="press-title" className="text-center font-display text-caption uppercase tracking-[0.08em] text-muted">
          Featured in
        </h2>
        <ul className="mx-auto mt-7 flex max-w-[60rem] flex-wrap items-center justify-center gap-x-10 gap-y-7 sm:gap-x-14">
          {pressHighlights.flatMap((name) => linkedOutlets.filter((o) => o.name === name)).map((outlet) => (
            <li key={outlet.name}>
              <a
                href={outlet.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${outlet.name} article about Tavis (opens in a new tab)`}
                className="tap flex min-h-11 items-center rounded-lg opacity-70 grayscale transition-[filter,opacity] duration-300 hover:opacity-100 hover:grayscale-0"
              >
                <PressLogo outlet={outlet} area={2900} />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
