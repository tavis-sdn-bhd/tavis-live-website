/* Real Question Universe content, copied from app screenshots. */

/** Form 5 Science, Q17 of 20. Answer key D (a bacteriophage is a complex virus). */
export const q17 = {
  number: 17,
  of: 20,
  stem: {
    ms: "Rajah di bawah menunjukkan salah satu jenis virus iaitu bakteriofaj. Apakah bentuk bagi virus tersebut?",
    en: "The diagram below shows a type of virus, which is a bacteriophage. What is the shape of this virus?",
  },
  options: [
    { key: "A", ms: "Sfera", en: "Spherical" },
    { key: "B", ms: "Heliks", en: "Helical" },
    { key: "C", ms: "Polihedral", en: "Polyhedral" },
    { key: "D", ms: "Kompleks", en: "Complex" },
  ],
  answer: "D",
  startingPoints: 358,
  reward: 10,
} as const;

export type OptionKey = (typeof q17.options)[number]["key"];

export type OptionState = "idle" | "correct" | "wrong" | "muted";

/** The right option, for "The answer is …" copy. */
export const q17Answer = q17.options.find((o) => o.key === q17.answer) ?? q17.options[3];

/** How an option should look once `picked` is known (null = not answered yet). */
export function optionState(picked: OptionKey | null, key: OptionKey): OptionState {
  if (picked === null) return "idle";
  if (key === q17.answer) return "correct";
  return key === picked ? "wrong" : "muted";
}

/** Form 5 Science, Q6: a wrong pick (D) and the app's explanation of why, before the right answer (A). */
export const q6 = {
  number: 6,
  stem: {
    ms: "Rajah di bawah menunjukkan sejenis mikroorganisma. Antara berikut, yang manakah merupakan ciri utama bagi mikroorganisma ini?",
    en: "The diagram below shows a type of microorganism. Which of the following is the main characteristic of this microorganism?",
  },
  wrong: {
    key: "D",
    ms: "Membiak secara aseks melalui belahan dedua",
    en: "Reproduces asexually through binary fission",
  },
  why: {
    ms: "Mikroorganisma dalam rajah tersebut ialah virus. Ciri utama virus ialah ia tidak mempunyai struktur sel sendiri dan hanya boleh membiak dengan menjangkiti sel perumah yang hidup.",
    en: "The microorganism shown in the diagram is a virus. The defining characteristic of viruses is that they lack a cellular structure and can only reproduce by infecting and replicating inside a living host cell.",
  },
  right: {
    key: "A",
    ms: "Hanya boleh membiak di dalam sel hidup",
    en: "Can only reproduce inside a living cell",
  },
} as const;

/** F5 Sains learning card 2 of 29, chapter 1, from the client's screenshot of the app. */
export const learningCard = {
  subject: "Sains",
  form: "F5",
  formName: "Form 5",
  chapter: 1,
  chapterTitle: "Mikroorganisma",
  index: 2,
  total: 29,
  title: "Flora normal",
  body: "Flora normal merupakan mikroorganisma yang ditemukan pada organisma termasuklah manusia dan haiwan dan tidak menyebabkan penyakit.",
} as const;
