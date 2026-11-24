import { island } from "@/components/island";
import { Image } from "@/components/image";
import type { CSSProperties } from "react";
import { ArrowDown, ArrowUpRight } from "@/components/icons";
import { cx } from "@/components/ui";
import { Bolt, Floaters, Star } from "@/components/v2/art";
import { SplitHero } from "@/components/v2/hero";
import { Scene } from "@/components/v2/scene";
import { PressLogo } from "@/components/v2/sections";
import { Story, StoryHero } from "@/components/v2/story";
import { Button, Centered, Headline, Section, chunky, halfColumnHeadline } from "@/components/v2/ui";
import { aboutPage as page } from "@/lib/pages";


const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

/** BA's about page: the years spring out of Tavi in the hero, the journey walks them one at a time, the co-founder
    rises into frame, and the press lands tile by tile. */
function AboutPage() {
  const { hero, journey, founder, press } = page;

  return (
    <>
      <SplitHero
        title={[...hero.title, hero.accent]}
        body={hero.body}
        actions={
          <Button href="#journey" tone="white" className="group">
            See our journey
            <ArrowDown className="size-4 transition-transform duration-300 ease-out-quart group-hover:translate-y-0.5" />
          </Button>
        }
        art={<StoryHero years={journey.years} />}
      />

      <Story title={journey.title} years={journey.years} end={journey.end} screen={journey.screen} />

      <Section band="sky">
        <div className="shell grid items-center gap-14 md:grid-cols-2 md:gap-16 lg:gap-24">
          {/* Narrower on a phone, so the star and bolt hanging off its sides stay on screen. */}
          <Scene className="relative mx-auto w-[86%] max-w-[25rem] sm:w-full">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border-2 border-b-[6px] border-line bg-paper">
              <div aria-hidden="true" className="scene-pop absolute bottom-[-24%] left-[5%] aspect-square w-[90%] rounded-full bg-brand" />
              <div className="scene-rise absolute inset-x-0 bottom-0 top-[7%]" style={delay(160)}>
                <Image
                  src={founder.image.src}
                  alt={founder.image.alt}
                  width={founder.image.w}
                  height={founder.image.h}
                  sizes="(min-width: 768px) 300px, 60vw"
                  className="mx-auto h-full w-auto object-contain object-bottom"
                />
              </div>
            </div>
            <Floaters
              spots={[
                { node: <Star className="w-full" />, className: "-left-[7%] top-[14%] w-[14%] -rotate-12" },
                { node: <Bolt className="w-full" />, className: "-right-[6%] top-[42%] w-[12%] rotate-12" },
              ]}
            />
          </Scene>
          <div className="text-center md:text-left">
            <Headline band="sky" title={founder.title} className={halfColumnHeadline} />
            {/* One line where it fits; where it can't, balanced, so it breaks after "Suhada" and never strands "Mazlan". */}
            <p className="mt-6 text-[clamp(1.5rem,1.2rem+1.2vw,2.25rem)] font-extrabold leading-[1.1] text-balance text-forest">{founder.name.join(" ")}</p>
          </div>
        </div>
      </Section>

      <Section>
        <div className="shell">
          <Centered title={press.title} />
          {/* Flex, not grid, so a short last row sits centred. The logos stamp onto their tiles one after another as the
              wall comes in; the tiles themselves are always there, so a tile reached by Tab is never blank. */}
          <Scene className="mx-auto mt-12 max-w-[66rem]">
            <ul className="flex flex-wrap justify-center gap-2 [--logo-root:3.25rem] sm:gap-3 sm:[--logo-root:initial]">
              {press.outlets.map((outlet, i) => {
                const logo = (
                  <span className="scene-pop grid w-full place-items-center" style={delay(i * 40)}>
                    <PressLogo outlet={outlet} area={5200} className="max-w-[80%] transition-[scale] duration-300 ease-out-quart group-hover:scale-[1.06]" />
                  </span>
                );
                const tile = cx(chunky, "group relative grid h-20 place-items-center px-2 sm:h-28 sm:px-3");
                return (
                  <li key={outlet.name} className="w-[calc(33.333%-0.334rem)] sm:w-[calc(33.333%-0.5rem)] lg:w-[calc(25%-0.5625rem)] xl:w-[calc(20%-0.6rem)]">
                    {outlet.href ? (
                      <a
                        href={outlet.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Read the ${outlet.name} article about Tavis (opens in a new tab)`}
                        className={cx(tile, "press hover:border-sky")}
                      >
                        {logo}
                        <ArrowUpRight
                          aria-hidden="true"
                          className="absolute right-2.5 top-2.5 size-3.5 text-sky-ink opacity-0 transition-[opacity,translate] duration-300 ease-out-quart group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 group-focus-visible:opacity-100"
                        />
                      </a>
                    ) : (
                      <div role="img" aria-label={outlet.name} className={tile}>
                        {logo}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </Scene>
        </div>
      </Section>
    </>
  );
}

export default island(AboutPage);
