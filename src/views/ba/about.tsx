import { island } from "@/components/island";
import { Image } from "@/components/image";
import { Journey } from "@/components/journey";
import { cx } from "@/components/ui";
import { SplitHero, TaviDisc } from "@/components/v2/hero";
import { PressLogo } from "@/components/v2/sections";
import { Centered, Lines, Section, chunky } from "@/components/v2/ui";
import { aboutPage as page } from "@/lib/pages";



/** BA's about page: the story so far on A's interactive timeline, the co-founder, the press, and the app. */
function AboutPage() {
  const { hero, journey, founder, press } = page;

  return (
    <>
      <SplitHero title={[...hero.title, hero.accent]} body={hero.body} art={<TaviDisc outfit="none" mood="wave" className="mx-auto w-[min(80%,22rem)]" />} />

      <Journey years={journey.years} end={journey.end} screen={journey.screen} />

      <Section>
        <div className="shell">
          <div className="grid overflow-hidden rounded-3xl bg-mint md:grid-cols-[0.9fr_1.1fr]">
            <div className="relative min-h-[24rem] overflow-hidden sm:min-h-[30rem]">
              <div aria-hidden="true" className="absolute bottom-[-30%] left-1/2 aspect-square w-[80%] -translate-x-1/2 rounded-full bg-brand" />
              <Image
                src={founder.image.src}
                alt={founder.image.alt}
                width={founder.image.w}
                height={founder.image.h}
                sizes="(min-width: 768px) 360px, 70vw"
                className="absolute bottom-0 left-1/2 h-[92%] w-auto -translate-x-1/2 object-contain object-bottom"
              />
            </div>
            <div className="flex flex-col justify-center p-8 text-center sm:p-12 md:text-left">
              <h2 className="text-[clamp(2rem,1.5rem+2vw,3rem)] leading-[1.05] lowercase text-brand-ink">
                <Lines title={founder.title} />
              </h2>
              <p className="mt-6 text-[1.5rem] font-extrabold leading-tight text-forest">{founder.name.join(" ")}</p>
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <div className="shell">
          <Centered title={press.title} />
          {/* Flex, not grid, so a short last row sits centred. */}
          <ul className="mx-auto mt-12 flex max-w-[66rem] flex-wrap justify-center gap-2 [--logo-root:3.25rem] sm:gap-3 sm:[--logo-root:initial]">
            {press.outlets.map((outlet) => {
              const logo = <PressLogo outlet={outlet} area={5200} className="max-w-[80%]" />;
              const tile = cx(chunky, "grid h-20 place-items-center px-2 sm:h-28 sm:px-3");
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
        </div>
      </Section>
    </>
  );
}

export default island(AboutPage);
