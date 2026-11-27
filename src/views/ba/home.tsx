import { island } from "@/components/island";
import type { ReactNode } from "react";
import { Classroom, Podium } from "@/components/v2/art";
import { GetTavis } from "@/components/v2/get-button";
import { HomeHero } from "@/components/v2/hero";
import { Faq, PressRow, Voices } from "@/components/v2/sections";
import { Tonight } from "@/components/v2/tonight";
import { Actions, Button, Feature, Headline, Section, halfColumnHeadline, lede } from "@/components/v2/ui";
import { cx } from "@/components/ui";
import { DesignLink } from "@/components/design-link";
import { AppShot } from "@/components/app-demos/app-stage";
import { Mascot } from "@/components/mascot";
import { hero, practice, rewards, screens, tuition } from "@/lib/content";
import { baHome, baParentsFaq, questionUniverse, rewardsPage, tuitionPage } from "@/lib/pages";


const heroTitle = [...baHome.title, hero.accent];

/** Duolingo's feature rows carry no button; a quiet link under the sentence leads on instead. */
function More({ href, children }: { href: string; children: ReactNode }) {
  return (
    <DesignLink href={href} className="link-press inline-flex min-h-11 items-center justify-center gap-1.5 font-display text-body-sm uppercase tracking-[0.06em] text-sky-ink hover:underline">
      {children}
      <span aria-hidden="true">→</span>
    </DesignLink>
  );
}

/** The paid tier on the mint band: what it covers and who teaches it, the lowest price, then tonight's class from the
    real timetable. Words first on phones, so the card has its heading. */
function Tuition() {
  const { title, body, price } = baHome.promo;
  return (
    <Section id="tuition" band="mint">
      <div className="shell grid items-center gap-14 md:grid-cols-[2fr_3fr] md:gap-16 lg:gap-24">
        <div className="text-center md:text-left">
          <Headline band="mint" title={title} className={halfColumnHeadline} />
          <p className={cx("mx-auto mt-6 max-w-[26rem] text-muted md:mx-0", lede)}>{body}</p>
          <p className="mt-8 flex items-baseline justify-center gap-2 text-forest md:justify-start">
            <span className="font-bold text-muted">{price.from}</span>
            <span className="text-[3rem] font-black leading-none tabular-nums">{price.amount}</span>
            <span className="font-bold text-muted">{price.per}</span>
          </p>
          <Actions className="mt-8 md:justify-start">
            <Button href="/online-tuition" size="lg">
              {tuition.cta}
            </Button>
          </Actions>
        </div>
        <Tonight className="mx-auto w-full max-w-[36rem]" />
      </div>
    </Section>
  );
}

/** BA's home, on Duolingo's: the promise, proof it is real, the free app in three pictures, live tuition and its
    price, the numbers, then what students say and the questions parents ask. */
function Home() {
  return (
    <>
      <HomeHero
        title={heroTitle}
        actions={
          <>
            <GetTavis
              secondary={
                // Under the store badges a full-width button would outweigh them, so on a phone it is a quiet link.
                <Button href="/parents" tone="white" size="lg" className="max-sm:hidden">
                  {hero.secondary}
                </Button>
              }
            >
              {hero.cta}
            </GetTavis>
            <DesignLink href="/parents" className="link-press inline-flex min-h-11 items-center justify-self-center gap-1.5 font-display text-body-sm uppercase tracking-[0.06em] text-sky-ink sm:hidden">
              {hero.secondary}
              <span aria-hidden="true">→</span>
            </DesignLink>
          </>
        }
      />

      <PressRow />

      <Feature
        id="practice"
        band="sky"
        title={practice.title}
        body={practice.body}
        flip
        visual={
          <AppShot
            screen={questionUniverse.explanations.screen}
            beside={<Mascot mood="cheer" outfit="science" follow decorative className="pointer-events-none absolute -bottom-3 right-full -mr-12 w-[190px] max-lg:hidden" />}
          />
        }
      >
        <More href="/question-universe">{practice.cta}</More>
      </Feature>

      <Feature id="rewards" title={rewards.title} body={rewards.body} visual={<AppShot screen={screens.outfit} />}>
        <More href="/rewards">{rewards.cta}</More>
      </Feature>

      <Feature id="rankings" flip title={rewardsPage.rankings.title} body={rewardsPage.rankings.body} visual={<Podium />}>
        <More href="/rewards#rankings">See the rankings</More>
      </Feature>

      <Feature id="live-tuition" title={tuition.title} body={tuition.body} visual={<Classroom image={tuitionPage.hero.image} />}>
        <More href="/tutors">Meet the tutors</More>
      </Feature>

      <Tuition />

      <Voices />
      <Faq set={baParentsFaq} />
    </>
  );
}

export default island(Home);
