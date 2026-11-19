import { island } from "@/components/island";
import { Image } from "@/components/image";
import { PlayCircle, Retry, Student } from "@/components/icons";
import { Mascot } from "@/components/mascot";
import { subjectDot, subjectKey } from "@/components/subject";
import { cx } from "@/components/ui";
import { BurstStage, type Piece } from "@/components/v2/art";
import { SplitHero } from "@/components/v2/hero";
import { ClosingCta, Tiles } from "@/components/v2/sections";
import { Button, Centered, Section } from "@/components/v2/ui";
import { links } from "@/lib/content";
import { tuitionPage, tutorsPage as page } from "@/lib/pages";
import { TutorGrid } from "./tutor-grid";


/* Seven faces round Tavi, each in a ring of the tutor's subject colour. */
const spots = [
  { x: 2, y: 6 },
  { x: 38, y: 0 },
  { x: 74, y: 6 },
  { x: 0, y: 42 },
  { x: 76, y: 42 },
  { x: 8, y: 76 },
  { x: 70, y: 76 },
] as const;

const faces: Piece[] = spots.flatMap((spot, i) => {
  const t = tuitionPage.tutors.list[i];
  if (!t) return [];
  return [
    {
      key: t.name,
      ...spot,
      w: 24,
      ratio: 1,
      node: (
        <span className={cx("block aspect-square overflow-hidden rounded-full p-[6%] shadow-[0_5px_0_rgb(0_0_0/0.12)]", subjectDot[subjectKey(t.subjects[0])])}>
          <Image src={t.src} alt="" width={t.w} height={t.h} sizes="120px" className="size-full rounded-full bg-paper object-cover object-top" />
        </span>
      ),
    },
  ];
});

/** The closing scene: three of the faces, larger, round a cheering Tavi. */
const closingSpots = [
  { x: 0, y: 10 },
  { x: 72, y: 4 },
  { x: 70, y: 66 },
] as const;
const closingFaces: Piece[] = faces.slice(0, closingSpots.length).map((face, i) => ({ ...face, ...closingSpots[i], w: 28 }));

/** BA's tutors page: who teaches, what and with what credentials, how the classes run, then the way in. */
function TutorsPage() {
  const { hero, list, teaching, closing } = page;

  return (
    <>
      <SplitHero
        title={hero.title}
        body={hero.body}
        actions={
          <>
            <Button href="/online-tuition" size="lg">
              {closing.cta}
            </Button>
            <Button href={`#${list.id}`} tone="white" size="lg">
              {list.cta}
            </Button>
          </>
        }
        art={
          <BurstStage pieces={faces} from={{ x: 50, y: 50 }} intro="load" delay={200} className="max-w-[28rem]">
            <div className="intro-pop absolute left-[29%] top-[24%] w-[42%]">
              <Mascot mood="wave" outfit="graduate" decorative />
            </div>
          </BurstStage>
        }
      />

      <Section id={list.id} band="sky">
        <div className="shell">
          <Centered band="sky" title={list.title} />
          <div className="mt-10">
            <TutorGrid />
          </div>
        </div>
      </Section>

      <Section id={teaching.id}>
        <div className="shell">
          <Centered title={teaching.title} />
          <Tiles items={teaching.items} icons={[Student, PlayCircle, Retry]} />
        </div>
      </Section>

      <ClosingCta
        title={closing.title}
        body={closing.body}
        art={
          <BurstStage pieces={closingFaces} from={{ x: 50, y: 50 }}>
            <div className="scene-pop absolute left-[18%] top-[20%] w-[56%]">
              <Mascot mood="cheer" outfit="graduate" decorative />
            </div>
          </BurstStage>
        }
        actions={
          <>
            <Button href="/online-tuition" size="lg">
              {closing.cta}
            </Button>
            <Button href={links.whatsapp} tone="white" size="lg">
              {tuitionPage.join.cta}
            </Button>
          </>
        }
      />
    </>
  );
}

export default island(TutorsPage);
