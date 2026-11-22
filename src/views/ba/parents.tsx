import { island } from "@/components/island";
import { PhoneShot, BurstStage, Classroom, TreasureScene, type Piece } from "@/components/v2/art";
import { Envelope, WhatsApp } from "@/components/icons";
import { Mascot } from "@/components/mascot";
import { Phone } from "@/components/phone";
import { Voucher, voucherSizes } from "@/components/ticket";
import { CoinArt, TudungLeap } from "@/components/v2/cast";
import { GetButton } from "@/components/v2/get-button";
import { SplitHero } from "@/components/v2/hero";
import { Faq, Steps, SubjectGroups } from "@/components/v2/sections";
import { Actions, Button, Centered, Feature, Section } from "@/components/v2/ui";
import { links, rewards, screens } from "@/lib/content";
import { askAboutTuition as ask, parentsPage as page, tuitionPage } from "@/lib/pages";


/** What a child gets, bursting out of the app: vouchers, points, a classmate and Tavi. The phone spans x 29 to 69%,
    so every piece frames it from the sides and touches at most its bezel. */
const heroPieces: Piece[] = [
  { key: "foodpanda", x: 0, y: 4, w: 27, ratio: 5 / 6, tilt: -10, node: <Voucher name="Foodpanda" cost={rewards.vouchers.find((v) => v.name === "Foodpanda")?.cost} sizes={voucherSizes.scene} /> },
  { key: "tavis", x: 72, y: 0, w: 28, ratio: 5 / 6, tilt: 9, node: <Voucher name="Tavis" title="Tuition voucher" value="RM20" sizes={voucherSizes.scene} /> },
  { key: "tudung", x: 0, y: 46, w: 27, ratio: 1.2, node: <TudungLeap className="w-full" /> },
  { key: "coin-a", x: 76, y: 34, w: 10, ratio: 0.875, tilt: 10, node: <CoinArt className="w-full" /> },
  { key: "tavi", x: 71, y: 50, w: 29, ratio: 1, still: true, node: <Mascot mood="wave" outfit="school" decorative /> },
];

/** The green band's top and bottom edges, drawn as a gentle wave as on Duolingo's parents' page. */
function Wave({ flip }: { flip?: boolean }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 1440 48" preserveAspectRatio="none" className={flip ? "block h-8 w-full rotate-180 sm:h-12" : "block h-8 w-full sm:h-12"}>
      <path d="M0 48V24C240 0 480 0 720 22s480 26 720 2v24Z" fill="var(--color-brand)" />
    </svg>
  );
}

/** BA's page for parents, on Duolingo's ABC page: the worry and the promise, what a child gets, what they learn, how
    tuition works, the questions parents ask (their child's data among them), then a way to talk to us. */
function ParentsPage() {
  const { hero, gets, learn, steps, faq, contact } = page;

  return (
    <>
      <SplitHero
        title={[...hero.title, hero.accent]}
        body={hero.body}
        actions={
          <>
            <Button href={ask} size="lg">
              {hero.cta}
            </Button>
            <GetButton tone="white" size="lg">
              {hero.secondary}
            </GetButton>
          </>
        }
        art={
          <BurstStage pieces={heroPieces} from={{ x: 50, y: 42 }} intro="load" delay={250} className="max-w-[28rem]">
            <div className="intro-pop absolute left-[29%] top-[4%] w-[40%]">
              <Phone screen={screens.home} className="rotate-[-4deg] drop-shadow-[0_14px_24px_rgb(30_37_45/0.2)]" />
            </div>
          </BurstStage>
        }
      />

      <Feature id={gets.practice.id} flip textFirst title={gets.practice.title} body={gets.practice.body} visual={<PhoneShot screen={gets.practice.screen} />} />
      <Feature id={gets.rewards.id} textFirst title={gets.rewards.title} body={gets.rewards.body} visual={<TreasureScene vouchers={rewards.vouchers} />} />
      <Feature id={gets.tuition.id} flip textFirst title={gets.tuition.title} body={gets.tuition.body} visual={<Classroom image={tuitionPage.hero.image} />}>
        <Button href="/online-tuition#pricing" tone="white" size="lg">
          See plans
        </Button>
      </Feature>

      <div className="mt-[clamp(2rem,1rem+3vw,4rem)]">
        <Wave />
        <Section id={learn.id} band="green" className="py-[clamp(3.5rem,2rem+5vw,6rem)]">
          <div className="shell">
            <Centered band="green" title={learn.title} body={learn.body} />
            <SubjectGroups className="mt-12" />
            <Actions className="mt-10">
              <Button href="/online-tuition#timetable" tone="white" size="lg">
                {learn.cta}
              </Button>
            </Actions>
          </div>
        </Section>
        <Wave flip />
      </div>

      <Section id={steps.id}>
        <div className="shell">
          <Centered title={steps.title} />
          <Steps items={steps.items} className="mx-auto mt-14 max-w-[64rem]" />
          <Actions className="mt-12">
            <Button href={ask} size="lg">
              {hero.cta}
            </Button>
          </Actions>
        </div>
      </Section>

      <Faq set={faq} />

      <section id={contact.id} data-cta className="border-b-2 border-brand-deep/20 bg-brand py-[clamp(4rem,3rem+4vw,7rem)] text-brand-deep">
        <div className="shell text-center">
          <Centered band="green" title={contact.title} body={contact.body} />
          <Actions className="mt-9">
            <Button href={ask} tone="white" size="lg">
              <WhatsApp aria-hidden="true" className="size-5" />
              {contact.whatsapp}
            </Button>
          </Actions>
          <p className="mt-6 flex flex-wrap items-center justify-center gap-x-6 font-bold">
            <a href={links.email} className="link-press inline-flex min-h-11 items-center gap-2 hover:text-night">
              <Envelope aria-hidden="true" className="size-5" />
              {links.emailLabel}
            </a>
            <a href="#contact" className="link-press inline-flex min-h-11 items-center underline decoration-2 underline-offset-4 hover:text-night">
              {contact.form}
            </a>
          </p>
        </div>
      </section>
    </>
  );
}

export default island(ParentsPage);
