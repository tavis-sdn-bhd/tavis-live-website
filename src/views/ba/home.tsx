import { island } from "@/components/island";
import type { ReactNode } from "react";
import { Classroom, Podium } from "@/components/v2/art";
import { GetTavis } from "@/components/v2/get-button";
import { HomeHero } from "@/components/v2/hero";
import { Faq, PressRow, TuitionPromo, TutorFaces, Voices } from "@/components/v2/sections";
import { Button, Feature } from "@/components/v2/ui";
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

      <TuitionPromo flip title={baHome.promo.title} body={baHome.promo.body} art={<TutorFaces count={6} night className="mx-auto max-w-[26rem]" />}>
        <Button href="/online-tuition" size="lg">
          {tuition.cta}
        </Button>
      </TuitionPromo>

      <Voices />
      <Faq set={baParentsFaq} />
    </>
  );
}

export default island(Home);
