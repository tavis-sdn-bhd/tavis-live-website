import { island } from "@/components/island";
import { Check } from "@/components/icons";
import { TimetableGrid } from "@/components/timetable-grid";
import { cx } from "@/components/ui";
import { Mascot } from "@/components/mascot";
import { BurstStage, Classroom, Crown, Floaters, Star, type Piece } from "@/components/v2/art";
import { CoinArt } from "@/components/v2/cast";
import { SplitHero } from "@/components/v2/hero";
import { ClosingCta, Faq, Steps, TutorFaces } from "@/components/v2/sections";
import { Actions, Button, Centered, Section, Shout, chunky } from "@/components/v2/ui";
import { links } from "@/lib/content";
import { baTuition as ba, ringgit, signUpFor, tuitionPage as page } from "@/lib/pages";


/** The closing scene: Tavi dressed for school, waving, with a crown, a star and points round him; the hero already
    shows the class, and the download band below has Tavi in his mortarboard. */
const closingPieces: Piece[] = [
  { key: "star", x: 4, y: 10, w: 16, ratio: 1, tilt: -12, node: <Star className="w-full" /> },
  { key: "crown", x: 78, y: 6, w: 18, ratio: 1, tilt: 10, node: <Crown className="w-full" /> },
  { key: "coin", x: 80, y: 70, w: 12, ratio: 0.875, tilt: 8, node: <CoinArt className="w-full" /> },
  { key: "coin-b", x: 8, y: 72, w: 10, ratio: 0.875, tilt: -8, node: <CoinArt className="w-full" /> },
];

function Mark({ included }: { included: boolean }) {
  return included ? (
    <span className="mx-auto grid size-7 place-items-center rounded-full bg-brand text-forest shadow-[inset_0_-3px_0_var(--color-brand-ledge)]">
      <Check aria-hidden="true" className="size-3.5" />
      <span className="sr-only">Included</span>
    </span>
  ) : (
    <span className="mx-auto block h-1 w-4 rounded-full bg-line-strong">
      <span className="sr-only">Not included</span>
    </span>
  );
}

/** Duolingo's Free and Super table: what the free app gives everyone, and what tuition adds. The headline, the table
    and the button fit one laptop screen (1440 by 800), so the rows are short and the introduction keeps to one line.
    The section is a call to action, so the floating chat steps aside: on a laptop it would sit on the table's last
    column, and beside the section's own WhatsApp button. */
function Compare() {
  const { compare } = ba;
  // Each row kind has its own vertical padding, and no cell takes two: `cx` joins classes, it does not merge them.
  const pad = { head: "py-2.5 sm:py-3", row: "py-2.5 sm:py-2", foot: "py-2.5 sm:py-3.5" };
  const cell = "px-1 text-center align-middle sm:px-4";
  const label = "px-4 font-extrabold leading-snug text-pretty text-forest sm:px-7 sm:text-[1.0625rem]";
  const column = "font-display text-caption uppercase leading-tight tracking-[0.05em] sm:text-body-sm";
  return (
    <Section id={compare.id} cta>
      <div className="shell">
        <Centered wide title={compare.title} body={compare.body} />
        <div className={cx(chunky, "mx-auto mt-8 max-w-[64rem] overflow-hidden")}>
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">What the free app and online tuition include</caption>
            <thead>
              <tr className="border-b-2 border-line">
                <th scope="col">
                  <span className="sr-only">Feature</span>
                </th>
                <th scope="col" className={cx(cell, pad.head, column, "w-[4.25rem] text-muted sm:w-36")}>
                  {compare.columns.free}
                </th>
                <th scope="col" className={cx(cell, pad.head, column, "w-[4.75rem] bg-mint text-brand-deep sm:w-44 lg:w-48")}>
                  {compare.columns.tuition}
                </th>
              </tr>
            </thead>
            <tbody>
              {compare.rows.map((row) => (
                <tr key={row.feature} className="border-b-2 border-line">
                  <th scope="row" className={cx(label, pad.row)}>
                    {row.feature}
                  </th>
                  <td className={cx(cell, pad.row)}>
                    <Mark included={row.free} />
                  </td>
                  <td className={cx(cell, pad.row, "bg-mint")}>
                    <Mark included={row.tuition} />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row" className={cx(label, pad.foot)}>
                  Price
                </th>
                <td className={cx(cell, pad.foot, "font-extrabold text-forest")}>{compare.price.free}</td>
                <td className={cx(cell, pad.foot, "bg-mint font-extrabold leading-tight text-brand-deep lg:whitespace-nowrap")}>
                  <span className="block text-caption font-bold sm:inline">{compare.price.tuition.from}</span>{" "}
                  <span className="nums block text-[1.125rem] sm:inline">{compare.price.tuition.amount}</span>{" "}
                  <span className="block text-caption font-bold sm:inline">{compare.price.tuition.per}</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        <Actions className="mt-8">
          <Button href={links.whatsapp} size="lg">
            {ba.hero.cta}
          </Button>
        </Actions>
      </div>
    </Section>
  );
}

/** BA's online tuition, on Duolingo's Super and Family pages: the class in the hero, free against paid, the prices,
    how joining works, the tutors, the week, the questions, then WhatsApp once more. */
function OnlineTuitionPage() {
  const { hero, tutors, timetable, pricing, portal, join } = page;

  return (
    <>
      <SplitHero
        title={[...hero.title, hero.accent]}
        body={hero.body}
        actions={
          <>
            <Button href={links.whatsapp} size="lg">
              {ba.hero.cta}
            </Button>
            <Button href={`#${pricing.id}`} tone="white" size="lg">
              {ba.hero.secondary}
            </Button>
          </>
        }
        art={<Classroom image={hero.image} intro="load" />}
      />

      <Compare />

      <Section id={pricing.id} band="night" cta>
        <Floaters
          spots={[
            { node: <Star fill="var(--color-brand)" className="w-12" />, className: "left-[5%] top-[8%] -rotate-12 max-md:hidden" },
            { node: <Crown className="w-14" />, className: "right-[6%] top-[6%] rotate-12 max-md:hidden" },
          ]}
        />
        <div className="shell relative">
          <div className="mx-auto max-w-[48rem] text-center">
            <Shout title={ba.pricing.title} body={ba.pricing.body} />
          </div>
          <ul className="mt-12 grid gap-4 sm:mt-16 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
            {pricing.plans.map((plan) => (
              <li key={plan.name} className={cx("h-full", plan.featured && "max-sm:mt-4")}>
                <article className={cx(chunky, "relative flex h-full flex-col p-6 text-center max-sm:grid max-sm:grid-cols-[1fr_auto] max-sm:items-center max-sm:gap-x-4 max-sm:p-5 max-sm:text-left", plan.featured && "border-mint shadow-[0_0_0_4px_var(--color-mint)] max-sm:pt-7")}>
                  {plan.featured && (
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl bg-mint px-3 py-1.5 font-display text-[0.75rem] uppercase tracking-[0.06em] text-forest">
                      {pricing.badge}
                    </span>
                  )}
                  <h3 className="mt-2 text-[1.375rem] max-sm:col-start-1 max-sm:row-start-1 max-sm:mt-0 max-sm:text-[1.25rem]">{plan.name}</h3>
                  <p className="mt-5 flex items-baseline justify-center gap-1 text-forest max-sm:col-start-2 max-sm:row-start-1 max-sm:mt-0 max-sm:justify-end">
                    <span className="text-[1.125rem] font-extrabold">RM</span>
                    <span className="text-[3.5rem] font-black leading-none tabular-nums max-sm:text-[2.5rem]">{plan.perMonth}</span>
                    <span className="font-bold text-muted">/mo</span>
                  </p>
                  <p
                    aria-hidden={plan.saving === 0}
                    className={cx(
                      "mt-3 self-center whitespace-nowrap rounded-full bg-attention px-3 py-1 text-body-sm font-extrabold text-forest max-sm:col-start-2 max-sm:row-start-2 max-sm:mt-1 max-sm:self-start max-sm:justify-self-end",
                      plan.saving === 0 && "invisible max-sm:hidden",
                    )}
                  >
                    Save {plan.saving}%
                  </p>
                  <p className="mt-3 text-body-sm font-semibold text-muted max-sm:col-start-1 max-sm:row-start-2 max-sm:mt-1">
                    <span className="block">{plan.term}</span>
                    <span className="block">{ringgit(plan.total)} total</span>
                  </p>
                  <div className="mt-auto pt-7 max-sm:col-span-2 max-sm:row-start-3 max-sm:pt-5">
                    <Button
                      href={signUpFor(plan)}
                      tone={plan.featured ? "sky" : "white"}
                      className="w-full"
                    >
                      Sign up<span className="sr-only"> for the {plan.name} plan on WhatsApp</span>
                    </Button>
                  </div>
                </article>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-center text-small font-semibold text-on-forest-muted">{pricing.footnote}</p>
        </div>
      </Section>

      <Section id={ba.steps.id} band="sky">
        <div className="shell">
          <Centered band="sky" title={ba.steps.title} />
          <Steps items={ba.steps.items} className="mx-auto mt-14 max-w-[64rem]" />
        </div>
      </Section>

      <Section id={tutors.id}>
        <div className="shell">
          <Centered title={[tutors.title, tutors.accent]} body={tutors.body} />
          <TutorFaces count={6} credentials className="mx-auto mt-14 max-w-[40rem]" />
          <Actions className="mt-12">
            <Button href="/tutors" tone="white" size="lg">
              {ba.tutors.cta}
            </Button>
          </Actions>
        </div>
      </Section>

      <Section id={timetable.id} band="sky">
        <div className="shell">
          <Centered band="sky" title={timetable.title} body={timetable.body} />
          <div className="mt-12">
            <TimetableGrid />
          </div>
          <p className="mt-6 text-center">
            <a href={timetable.image.src} download="Tavis-Timetable-2027.png" className="link-press inline-flex min-h-11 items-center font-display text-small uppercase tracking-[0.06em] text-sky-ink">
              Save the timetable
            </a>
          </p>
        </div>
      </Section>

      <Faq set={ba.faq} />

      <ClosingCta
        title={join.title}
        body={join.body}
        art={
          <BurstStage pieces={closingPieces} from={{ x: 50, y: 50 }}>
            <div className="scene-pop absolute left-[20%] top-[16%] w-[60%]">
              <Mascot mood="wave" outfit="school" decorative />
            </div>
          </BurstStage>
        }
        actions={
          <>
            <Button href={links.whatsapp} size="lg">
              {join.cta}
            </Button>
            <Button href={links.signIn} tone="white" size="lg">
              {portal.title.join(" ")} {portal.cta}
            </Button>
          </>
        }
      />
    </>
  );
}

export default island(OnlineTuitionPage);
