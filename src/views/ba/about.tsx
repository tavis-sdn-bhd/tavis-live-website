import { island } from "@/components/island";
import { Image } from "@/components/image";
import type { CSSProperties, ReactNode } from "react";
import { ArrowDown, ArrowUpRight, ChalkboardTeacher, Flask, RocketLaunch, TavisMark } from "@/components/icons";
import { cx } from "@/components/ui";
import { SplitHero } from "@/components/v2/hero";
import { Scene } from "@/components/v2/scene";
import { PressLogo } from "@/components/v2/sections";
import { Story, StoryHero } from "@/components/v2/story";
import { Button, Centered, Headline, Section, chunky, halfColumnHeadline } from "@/components/v2/ui";
import { aboutPage as page } from "@/lib/pages";


const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

/** Her belief, set apart in the logo's colours: the brand green with a button's ledge, the logo's white "T" as a
    watermark at its side, with room kept for it, and its key phrase on a white highlight. Dark ink on brand is 7.8:1. */
function Belief({ text, highlight }: { text: string; highlight: string }) {
  const at = highlight ? text.indexOf(highlight) : -1;
  // A full stop right after the phrase goes inside the highlight, so the highlight's padding never parts the two.
  const end = at < 0 ? -1 : at + highlight.length + (/^[.,!?]/.test(text.slice(at + highlight.length)) ? 1 : 0);
  return (
    <div className="relative overflow-hidden rounded-3xl border-b-[5px] border-brand-ledge bg-brand px-6 py-6 text-forest-deep sm:px-8">
      <TavisMark className="pointer-events-none absolute right-5 top-1/2 size-16 -translate-y-1/2 text-white/40 sm:right-7 sm:size-24" />
      <p className="relative pr-16 text-[clamp(1.25rem,1.1rem+0.6vw,1.5rem)] font-extrabold leading-[1.4] text-pretty sm:pr-28">
        {at < 0 ? (
          text
        ) : (
          <>
            {text.slice(0, at)}
            <span className="rounded-md bg-paper px-1.5 [box-decoration-break:clone]">{text.slice(at, end)}</span>
            {text.slice(end)}
          </>
        )}
      </p>
    </div>
  );
}

/** A fact from the co-founder's bio: its icon, then the fact over its context. A column on phones, a row from sm. */
function Fact({ value, label, icon }: { value: string; label: string; icon: ReactNode }) {
  return (
    <li className="flex flex-col items-center gap-1.5 px-2 text-center sm:flex-row sm:items-center sm:gap-2.5 sm:px-4 sm:text-left sm:first:pl-0">
      <span className="size-7 shrink-0 text-brand-ink">{icon}</span>
      <span className="leading-tight">
        <span className="block text-[0.9375rem] font-extrabold text-forest">{value}</span>
        <span className="block text-[0.8125rem] font-semibold text-muted">{label}</span>
      </span>
    </li>
  );
}

/** BA's about page: the years spring out of Tavi in the hero, the journey walks them one at a time, the co-founder
    rises into frame beside her facts and her story, and the press lands tile by tile. */
function AboutPage() {
  const { hero, journey, founder, press } = page;
  const [years, research, role] = founder.facts;

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
          <Scene className="relative mx-auto w-full max-w-[25rem]">
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
          </Scene>
          <div className="text-center md:text-left">
            <Headline band="sky" title={founder.title} className={halfColumnHeadline} />
            {/* One line where it fits; where it can't, balanced, so neither line is a lone word. */}
            <p className="mt-6 text-[clamp(1.5rem,1.2rem+1.2vw,2.25rem)] font-extrabold leading-[1.1] text-balance text-forest">{founder.name.join(" ")}</p>
            <ul className="mx-auto mt-6 grid max-w-[34rem] grid-cols-3 divide-x-2 sm:grid-cols-[auto_1fr_auto] divide-line border-y-2 border-line py-4 md:mx-0">
              <Fact {...years} icon={<ChalkboardTeacher className="size-full" />} />
              <Fact {...research} icon={<Flask className="size-full" />} />
              <Fact {...role} icon={<RocketLaunch className="size-full" />} />
            </ul>
            {/* Left-aligned on a phone too: a paragraph this long is hard to read centred. */}
            <div className="mx-auto mt-6 max-w-[34rem] space-y-5 text-left text-[1.0625rem] font-semibold leading-relaxed text-pretty text-forest/75 md:mx-0">
              <p>{founder.bio.start}</p>
              <Belief text={founder.bio.belief} highlight={founder.bio.beliefKey} />
              <p>{founder.bio.work}</p>
            </div>
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
