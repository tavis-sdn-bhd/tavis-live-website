import { island } from "@/components/island";
import { AvatarStage } from "@/components/avatar-stage";
import { VoucherTicket } from "@/components/ticket";
import { cx } from "@/components/ui";
import { Floaters, Podium, Star, TreasureScene } from "@/components/v2/art";
import { GetTavis } from "@/components/v2/get-button";
import { SplitHero } from "@/components/v2/hero";
import { Faq, Path } from "@/components/v2/sections";
import { Centered, Feature, Section } from "@/components/v2/ui";
import { rewards } from "@/lib/content";
import { baRewards as ba, rewardsPage as page } from "@/lib/pages";


/** BA's rewards: the chest bursting open, how points are earned, what they buy, the avatar, the rankings and the
    rules, answered from the catalogue. */
function RewardsPage() {
  const { hero, earn, redeem, avatar, rankings } = page;

  return (
    <>
      <SplitHero
        title={[...hero.title, hero.accent]}
        body={hero.body}
        actions={<GetTavis>{hero.cta}</GetTavis>}
        art={<TreasureScene vouchers={rewards.vouchers} intro="load" />}
      />

      <Feature id={earn.id} band="sky" textFirst title={earn.title} body={earn.body} visual={<Path steps={earn.ways} label="Ways to earn points" />} />

      <Section id={redeem.id}>
        <div className="shell">
          <Centered title={redeem.title} body={redeem.body} />
          {/* Flex, not grid, so a short last row sits centred: two a row on phones, three from sm. Six in one row read too small. */}
          <ul className="mx-auto mt-14 flex max-w-[52rem] flex-wrap justify-center gap-4 sm:gap-6">
            {ba.vouchers.map((v, i) => (
              <li key={v.name} className={cx("w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-1rem)]", i % 2 ? "rotate-2" : "-rotate-2")}>
                <VoucherTicket voucher={v} />
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Feature
        id={avatar.id}
        flip
        band="night"
        title={avatar.title}
        body={avatar.body}
        backdrop={
          <Floaters
            spots={[
              { node: <Star fill="var(--color-brand)" className="w-full" />, className: "left-[0%] top-[6%] w-[10%] -rotate-12" },
              { node: <Star className="w-full" />, className: "right-[2%] top-[0%] w-[8%] rotate-12" },
            ]}
          />
        }
        visual={<AvatarStage points={false} floor="dark" />}
      />

      <Feature id={rankings.id} title={rankings.title} body={rankings.body} visual={<Podium />} />

      <Faq set={ba.faq} />
    </>
  );
}

export default island(RewardsPage);
