import { island } from "@/components/island";
import { CardDemo } from "@/components/app-demos/card-demo";
import { ExplanationDemo } from "@/components/app-demos/explanation-demo";
import { UniverseDemo } from "@/components/app-demos/universe-demo";
import { GetTavis } from "@/components/v2/get-button";
import { SplitHero } from "@/components/v2/hero";
import { Lesson } from "@/components/v2/lesson";
import { Faq, SubjectGroups } from "@/components/v2/sections";
import { Centered, Feature, Section } from "@/components/v2/ui";
import { baQuestionUniverse as ba, questionUniverse as qu } from "@/lib/pages";


/** BA's Question Universe, on Duolingo's subject page: a question to answer in the hero, three Stageshow demos of the
    app (pick a subject, learn from a wrong answer, revise with a Learning Card), the subjects by form, then the
    questions students and parents ask. The header's "Get Tavis free" is the way in. */
function QuestionUniversePage() {
  const { hero, explanations, cards } = qu;
  const { practice, subjects, faq } = ba;

  return (
    <>
      <SplitHero
        title={[...hero.title, hero.accent]}
        body={hero.body}
        actions={<GetTavis>{hero.cta}</GetTavis>}
        art={<Lesson className="w-full" />}
      />

      <Feature id={practice.id} band="sky" title={practice.title} body={practice.body} visual={<UniverseDemo />} />
      <Feature id={explanations.id} flip title={explanations.title} body={explanations.body} visual={<ExplanationDemo />} />
      <Feature id={cards.id} band="sky" title={cards.title} body={cards.body} visual={<CardDemo />} />

      <Section id={subjects.id}>
        <div className="shell">
          <Centered title={subjects.title} body={subjects.body} />
          <SubjectGroups className="mt-12" />
        </div>
      </Section>

      <Faq set={faq} />
    </>
  );
}

export default island(QuestionUniversePage);
