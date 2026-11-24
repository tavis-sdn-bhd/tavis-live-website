import { allForms, biteSized, faq, formRange as formsLabel, rewards, screens, whatsappWith } from "./content";

/* ───────────────────────── Question Universe ───────────────────────── */

export const questionUniverse = {
  hero: {
    title: ["Free questions."],
    accent: "Clear answers.",
    body: `Unlimited ${allForms} practice with explanations for every answer, plus ${biteSized()} Learning Cards.`,
    cta: "Get Tavis free",
  },
  universe: {
    id: "question-universe",
    title: ["Unlimited practice.", "Your way."],
    body: "Pick a subject and topic. Practise at your own pace or against the timer.",
    steps: [
      { title: "Choose your topic", body: "Focus on the subject and chapter or topic you want to practise." },
      { title: "Optional timer", body: "Practise at your own pace or switch on a timer for a timed session." },
      { title: "Unlimited free practice", body: `Keep building your knowledge with free questions across ${allForms} core subjects.` },
    ],
    screen: { scene: "question", alt: "Question Universe showing a bilingual Science question and answer options" },
  },
  explanations: {
    id: "explanations",
    title: ["Understand the answer.", "Learn from every mistake."],
    body: "See why an answer is right or wrong, then try again.",
    cta: "Get Tavis free",
    screen: { scene: "explanation", alt: "An incorrect answer explained clearly, followed by the correct answer" },
  },
  cards: {
    id: "learning-cards",
    title: ["Quick revision.", "Lasting understanding."],
    body: `${biteSized(true)} cards for key facts and concepts.`,
    points: [
      { title: `Keep it ${biteSized()}`, body: "Review important knowledge in short, focused cards." },
      { title: "Refresh your memory", body: "Revisit key facts and concepts as part of your revision." },
      { title: "Make revision count", body: "Use a quick study session to strengthen your recall." },
    ],
    screen: { scene: "cards", alt: "Tavis Science Learning Card with a concise explanation of microalgae technology" },
  },
  gamification: {
    id: "points-ranking",
    title: ["Practise, earn,", "climb the ranking."],
    body: "Every correct answer earns points. See how you rank, then redeem your points for rewards.",
    steps: [
      { title: "Answer questions", body: "Practise questions and get instant feedback." },
      { title: "Earn points", body: "Every correct answer earns you points to redeem rewards." },
      { title: "Climb the ranking", body: "See how you rank and keep challenging yourself." },
    ],
    screens: [
      { scene: "correct", alt: "Correct answer in Question Universe earning 10 points" },
      { scene: "leaderboard", alt: "Question Universe leaderboard showing students ranked on a podium" },
    ],
  },
  credibility: {
    id: "credibility",
    title: ["Free. Teacher-verified."],
    accent: "Built for Malaysia’s syllabus.",
    items: [
      { title: "Free to access", body: "Practise questions and revise with Learning Cards at no cost." },
      { title: "Teacher-verified", body: "School teachers review questions for accuracy." },
      { title: "Aligned with Malaysia’s latest curriculum", body: `Built around Malaysia’s ${allForms} syllabus.` },
    ],
  },
} as const;

/* ───────────────────────────── Rewards ───────────────────────────── */

/** The points price of a voucher as the rewards catalogue lists it, so the two pages cannot disagree. */
const costOf = (name: (typeof rewards.vouchers)[number]["name"]) => rewards.vouchers.find((v) => v.name === name)?.cost;

export const rewardsPage = {
  hero: {
    title: ["Study hard."],
    accent: "Get rewarded.",
    body: "Earn points for correct answers, swap them for real vouchers, dress up your avatar and compete for your school.",
    cta: "Get Tavis free",
    badges: [
      { src: "/assets/badge-star-seeker-transparent.webp", alt: "Star Seeker badge", w: 320, h: 315 },
      { src: "/assets/badge-royal-tavisian-transparent.webp", alt: "Royal Tavisian badge", w: 320, h: 314 },
      { src: "/assets/badge-class-achiever-transparent.webp", alt: "Class Achiever badge", w: 311, h: 320 },
    ],
    screen: { scene: "rewards", alt: "Tavis rewards catalogue with redeemable vouchers" },
  },
  earn: {
    id: "earn",
    title: ["Earn points", "as you learn."],
    body: "Practise, log in daily and attend classes to collect points.",
    ways: [
      { title: "Practise in Question Universe", body: "Answer questions and collect points." },
      { title: "Log in daily", body: "Log in every day to earn points." },
      { title: "Attend online classes", body: "Join your online tuition classes and earn points while you learn." },
    ],
    screen: { scene: "correct", alt: "A correct answer in Question Universe earning 10 points" },
  },
  redeem: {
    id: "redeem",
    title: ["Your effort", "deserves rewards."],
    body: "Swap your points for real-life rewards.",
    vouchers: [
      { name: "Foodpanda", cost: costOf("Foodpanda") },
      { name: "KFC", cost: costOf("KFC") },
      { name: "Touch ’n Go" },
      { name: "Roblox", cost: costOf("Roblox") },
      // The client's artwork (tavis-cash-voucher.png) prints "Cash voucher RM20"; its catalogue name is the tuition voucher.
      { name: "Tavis", title: "Tuition voucher", value: "RM20" },
    ],
  },
  avatar: {
    id: "avatar",
    title: ["Your avatar.", "Your style."],
    body: "Mix outfits and accessories to make your avatar yours.",
  },
  rankings: {
    id: "rankings",
    title: ["Rise together.", "Rank higher."],
    body: "Climb the student rankings and compete for your school.",
    items: [
      { title: "Compete for yourself", body: "See how you rank with other students and keep challenging yourself to improve." },
      { title: "Compete for your school", body: "Represent your school and enjoy the challenge together." },
    ],
    screen: { scene: "leaderboard", alt: "Question Universe leaderboard showing student rankings on a podium" },
  },
  download: {
    title: ["Ready to make learning", "more fun?"],
  },
} as const;

/* ────────────────────────── Online Tuition ────────────────────────── */

/** 700 → "RM700", grouped the Malaysian way. */
export const ringgit = (n: number) => `RM${n.toLocaleString("en-MY")}`;

/* 2027 prices for new students, as Tavis sent them. Each plan's saving is its monthly
   rate against the 1-month plan, rounded to a whole percent (their table: 0, 9, 19, 29). */
const plans = [
  { name: "Monthly", term: "1 month of tuition", perMonth: 99, total: 99, featured: false },
  { name: "3 Months", term: "3 months of tuition", perMonth: 90, total: 270, featured: false },
  { name: "6 Months", term: "6 months of tuition", perMonth: 80, total: 480, featured: false },
  { name: "Full year", term: "10 months of tuition", perMonth: 70, total: 700, featured: true },
] as const;

const monthlyRate = plans[0].perMonth;

/** Between a credential's parts: a dot that never starts a line. */
export const credentialDot = "\u00a0· ";
const dotted = (...parts: string[]) => parts.join(credentialDot);

/** The WhatsApp message for signing up to a plan; the (GA) tag in `whatsappWith` is the greeting. */
export const signUpFor = (plan: { readonly name: string; readonly total: number }) =>
  whatsappWith(`I'd like to sign up for the ${plan.name} tuition plan (${ringgit(plan.total)}). My child is in Form `);

export const tuitionPage = {
  hero: {
    title: ["Learn from experts."],
    accent: "Rewatch anytime.",
    body: `Live evening classes for ${allForms}, from RM70 a month. Rewatch every recording.`,
    image: { src: "/assets/tuition-team.webp", alt: "The Tavis online tuition teaching team", w: 1059, h: 564 },
  },
  tutors: {
    id: "tutors",
    title: "Meet the tutors",
    accent: "behind your progress.",
    body: "Examiners, module writers and experienced teachers.",
    list: [
      { name: "Cikgu Sue Dino", subjects: ["Sains", "Biologi", "Kimia"], credential: "Writes KSSM science modules", src: "/assets/tutor-sue-dino.webp", w: 450, h: 800 },
      { name: "Sir Kamal", subjects: ["Sejarah"], credential: dotted("Sejarah examiner", "25 years"), src: "/assets/tutor-kamal.webp", w: 464, h: 800 },
      { name: "Sir Azri", subjects: ["Matematik", "Perniagaan"], credential: "Tutoring since 2009", src: "/assets/tutor-azri.webp", w: 478, h: 800 },
      { name: "Sir Syamim", subjects: ["Bahasa Melayu"], credential: "First-class honours, Malay", src: "/assets/tutor-syamim.webp", w: 474, h: 800 },
      { name: "Ms Mira", subjects: ["English"], credential: dotted("First-class TESL", "7 years"), src: "/assets/tutor-mira.webp", w: 433, h: 800 },
      { name: "Ms Shwaarna", subjects: ["Bahasa Melayu", "English"], credential: "7+ years teaching", src: "/assets/tutor-shwarrna.webp", w: 404, h: 800 },
      { name: "Ms Aida", subjects: ["Sejarah"], credential: "First-class B.Ed (History)", src: "/assets/tutor-aida.webp", w: 426, h: 800 },
      { name: "Sir Ameer", subjects: ["Fizik"], credential: "Best Performance Tutor 2023", src: "/assets/tutor-ameer.webp", w: 500, h: 784 },
      { name: "Sir Farid", subjects: ["Prinsip Perakaunan"], credential: "Speaker at SBP and MARA schools", src: "/assets/tutor-farid.webp", w: 500, h: 703 },
      { name: "Ms Fathirah", subjects: ["Sejarah"], credential: "PhD candidate, UPM", src: "/assets/tutor-fathirah.webp", w: 386, h: 800 },
      { name: "Sir Izaat", subjects: ["Matematik Tambahan"], credential: dotted("10+ years", "Mathematical Science"), src: "/assets/tutor-izaat.webp", w: 445, h: 800 },
    ],
  },
  timetable: {
    id: "timetable",
    title: "Your 2027 class timetable.",
    body: "Pick your form to see the week.",
    image: {
      src: "/assets/tavis-timetable-2027.png",
      alt: "2027 Tavis class timetable for Form 1–5, showing subjects, tutors, times and holidays",
      w: 1080,
      h: 1350,
    },
  },
  pricing: {
    id: "pricing",
    title: "One price.",
    accent: "All subjects for your form.",
    body: "Live classes in every subject for your form. Rewatch any class.",
    plans: plans.map((plan) => ({ ...plan, saving: Math.round((1 - plan.perMonth / monthlyRate) * 100) })),
    badge: "Lowest monthly rate",
    footnote: `Monthly rates for multi-month plans are the plan total divided by its months. Savings compare with the ${ringgit(monthlyRate)} monthly plan.`,
  },
  portal: {
    title: ["Already enrolled?"],
    body: "Go to your classes and recordings.",
    cta: "Sign in",
  },
  join: {
    title: ["Ready to join", "your next class?"],
    body: "WhatsApp us to sign up. Tell us your form and we will set you up.",
    cta: "Sign up on WhatsApp",
  },
} as const;

/* ─────────────────────────────── About ─────────────────────────────── */

export const aboutPage = {
  hero: {
    title: ["Our story."],
    accent: "Built for Malaysian students.",
    body: "Free practice, real rewards and expert tutors, since 2022.",
  },
  journey: {
    title: "Our journey.",
    end: "The journey continues.",
    years: [
      { year: "2022", image: { src: "/assets/journey-2022.webp", alt: "Tavis team group photo featured in Focus Malaysia", w: 412, h: 249 } },
      { year: "2023", image: { src: "/assets/journey-2023.webp", alt: "Tavis event group photo with the Tavis mascot", w: 1000, h: 667 } },
      { year: "2024", image: { src: "/assets/journey-2024.webp", alt: "Tavis community gathering group photo", w: 1000, h: 667 } },
      { year: "2025", image: { src: "/assets/journey-2025.webp", alt: "Tavis school event with students in a school hall", w: 1000, h: 750 } },
      { year: "2026", image: null },
    ],
    screen: screens.home,
  },
  founder: {
    title: "Meet our co-founder.",
    name: ["Dr. Suhada", "Binti Mazlan"],
    image: { src: "/assets/dr-suhada.webp", alt: "Dr. Suhada Binti Mazlan, Tavis co-founder", w: 534, h: 949 },
  },
  press: {
    title: "Featured in.",
    /* `solid`: the logo is a filled box or tile, which reads heavier than letters of the same area. */
    outlets: [
      { name: "Ceritera", src: "/assets/media-ceritera.webp", w: 322, h: 80, href: "https://ceritera.com.my/question-bank-learning-cards-mampu-bantu-pelajar/" },
      { name: "MalaysiaGazette", src: "/assets/media-malaysiagazette.webp", w: 298, h: 300, solid: true, href: "https://malaysiagazette.com/2026/10/13/lambakan-nota-ai-tersedia-jadi-cabaran-baharu-pelajar-masa-kini/" },
      { name: "The Malaysia Press", src: "/assets/press/the-malaysia-press.png", w: 437, h: 251, href: "https://themalaysiapress.com/2026/10/13/tavis-sahut-aspirasi-belanjawan-2027-perkasa-pendidikan-digital/" },
      { name: "BebasNews", src: "/assets/press/bebasnews.png", w: 800, h: 228, solid: true, href: "https://bebasnews.my/2026/10/14/question-bank-bantu-pelajar-kenal-pasti-kelemahan/" },
      { name: "The Star", src: "/assets/press/the-star.svg", w: 1953, h: 656, href: "https://www.thestar.com.my/news/nation/2022/09/21/online-tutoring-gets-an-ai-boost" },
      { name: "New Straits Times", src: "/assets/press/new-straits-times.png", w: 894, h: 141, href: "https://www.nst.com.my/lifestyle/bots/2023/07/926875/tech-online-competition-boost-bahasa-malaysia" },
      { name: "Malaysiakini", src: "/assets/press/malaysiakini.svg", w: 2742, h: 437, href: "https://www.malaysiakini.com/brandedcontent/621127" },
      { name: "Focus Malaysia", src: "/assets/press/focus-malaysia.png", w: 294, h: 144, solid: true, href: "https://focusmalaysia.my/tavis-not-your-ordinary-tuition-centre/" },
      { name: "Suria", src: "/assets/press/suria.png", w: 331, h: 98, href: null },
      { name: "KITA Reporters", src: "/assets/press/kita-reporters.png", w: 334, h: 313, solid: true, href: "https://kitareporters.com/insan/WZdP1zq2eK" },
      { name: "Vulcan Post", src: "/assets/press/vulcan-post.svg", w: 2001, h: 381, href: "https://vulcanpost.com/791250/tavis-malaysia-online-tuition-learning-platform-rewards-programme/" },
      { name: "LUMI", src: "/assets/media-lumi.webp", w: 141, h: 33, href: "https://luminews.my/ms/news/1452428" },
      { name: "Citizens Journal", src: "/assets/media-citizens-journal.webp", w: 136, h: 50, href: "https://cj.my/133431/ahmad-iqbals-selfless-triumph-in-cabaran-bahasa-malaysia/" },
      { name: "KL Hype", src: "/assets/press/kl-hype.png", w: 775, h: 176, href: "https://klhype.com/derma-separuh-hadiah-kemenangan-tindakan-pelajar-ini-dapat-pujian/" },
      { name: "Relevan", src: "/assets/press/relevan.png", w: 218, h: 85, href: "https://relevan.com.my/2023/07/26/ahmad-iqbal-kongsi-hadiah-kemenangan-dengan-badan-amal/" },
      { name: "Cilisos", src: "/assets/press/cilisos.png", w: 300, h: 100, solid: true, href: "https://cilisos.my/student-wins-rm10000-in-the-cabaran-bahasa-malaysia-tavis/" },
      { name: "Afterschool", src: "/assets/press/afterschool.svg", w: 1900, h: 265, href: null },
    ],
  },
} as const;

type Outlet = (typeof aboutPage.press.outlets)[number];
export type LinkedOutlet = Extract<Outlet, { href: string }>;

/** Press outlets shown under the home hero, in order. Only outlets with an article link type-check. */
export const pressHighlights = ["The Star", "New Straits Times", "Malaysiakini", "Vulcan Post", "Focus Malaysia", "Cilisos"] as const satisfies readonly LinkedOutlet["name"][];

/* ───────────────────── 2027 timetable (from tavis-timetable-2027.png) ─────────────────────
   Transcribed cell by cell. Tutor names follow their tavis.live profiles; the printed PNG spells Sir Izaat as "Izzat". */

export type Slot = { readonly subject: string; readonly tutor: string; readonly start: string; readonly end: string };
type Week = readonly [readonly Slot[], readonly Slot[], readonly Slot[], readonly Slot[], readonly Slot[]];

const s = (subject: string, tutor: string, start: string, end: string): Slot => ({ subject, tutor, start, end });
const eve = (subject: string, tutor: string) => s(subject, tutor, "8.00pm", "9.00pm");

export const timetable2027 = {
  days: [
    { ms: "Isnin", en: "Mon" },
    { ms: "Selasa", en: "Tue" },
    { ms: "Rabu", en: "Wed" },
    { ms: "Khamis", en: "Thu" },
    { ms: "Jumaat", en: "Fri" },
  ],
  forms: {
    1: [
      [eve("English", "Ms Mira")],
      [eve("Sains", "Ms Fatehah")],
      [eve("Bahasa Melayu", "Ms Shwaarna")],
      [eve("Matematik", "Sir Azri")],
      [eve("Sejarah", "Ms Aida")],
    ],
    2: [
      [eve("Bahasa Melayu", "Ms Shwaarna")],
      [eve("Sejarah", "Ms Fathirah")],
      [eve("Matematik", "Sir Ameer")],
      [eve("English", "Ms Shwaarna")],
      [eve("Sains", "Ms Fatehah")],
    ],
    3: [
      [eve("English", "Sir Daniel")],
      [eve("Bahasa Melayu", "Sir Syamim")],
      [eve("Sains", "Ms Fatehah")],
      [eve("Sejarah", "Sir Shahiran")],
      [eve("Matematik", "Sir Azri")],
    ],
    4: [
      [s("Sains", "Ms Suhada", "6.00pm", "7.00pm"), s("Fizik", "Sir Ameer", "8.00pm", "9.00pm")],
      [s("Sejarah", "Sir Shahiran", "6.00pm", "7.00pm"), s("Matematik Tambahan", "Sir Izaat", "8.15pm", "9.15pm")],
      [
        s("Biologi", "Ms Suhada", "6.00pm", "7.00pm"),
        s("Perniagaan", "Sir Azri", "6.00pm", "7.00pm"),
        s("English", "Ms Mira", "8.00pm", "9.00pm"),
      ],
      [s("Bahasa Melayu", "Sir Syamim", "6.00pm", "7.00pm"), s("Matematik", "Sir Izaat", "8.15pm", "9.15pm")],
      [s("Prinsip Perakaunan", "Ms Shamema", "6.00pm", "7.00pm"), s("Kimia", "Ms Suhada", "8.15pm", "9.15pm")],
    ],
    5: [
      [s("Biologi", "Ms Suhada", "8.15pm", "9.15pm"), s("Sejarah", "Sir Kamal", "6.00pm", "7.00pm")],
      [s("Matematik Tambahan", "Sir Izaat", "6.00pm", "7.00pm"), s("English", "Ms Mira", "8.15pm", "9.15pm")],
      [s("Prinsip Perakaunan", "Sir Farid", "6.00pm", "7.00pm"), s("Matematik", "Sir Azri", "8.15pm", "9.15pm")],
      [
        s("Sains", "Ms Suhada", "6.00pm", "7.00pm"),
        s("Fizik", "Sir Ameer", "6.00pm", "7.00pm"),
        s("Bahasa Melayu", "Sir Syamim", "8.15pm", "9.15pm"),
      ],
      [s("Kimia", "Ms Suhada", "6.00pm", "7.00pm"), s("Perniagaan", "Sir Farid", "8.15pm", "9.15pm")],
    ],
  } satisfies Record<1 | 2 | 3 | 4 | 5, Week>,
  holidays: [
    [
      { date: "8 Mac", name: "Hari Raya Aidilfitri" },
      { date: "17 Mei", name: "Hari Raya Aidiladha" },
      { date: "7 Jun", name: "Hari Kelahiran YDPA" },
    ],
    [
      { date: "9 Mac", name: "Hari Raya Aidilfitri" },
      { date: "8 Jun", name: "Cuti Ganti" },
      { date: "31 Ogos", name: "Hari Kemerdekaan" },
    ],
    [
      { date: "24 Feb", name: "Nuzul Al-Quran" },
      { date: "10 Mac", name: "Hari Raya Aidilfitri" },
    ],
    [
      { date: "11 Mac", name: "Hari Raya Aidilfitri" },
      { date: "20 Mei", name: "Wesak" },
      { date: "16 Sep", name: "Hari Malaysia" },
    ],
    [
      { date: "22 Jan", name: "Thaipusam" },
      { date: "12 Mac", name: "Hari Raya Aidilfitri" },
      { date: "21 Mei", name: "Cuti" },
    ],
  ],
} as const;

/** "8.15pm" → minutes since midnight. */
export function minutes(time: string) {
  const m = /^(\d{1,2})\.(\d{2})(am|pm)$/.exec(time);
  if (!m) return 0;
  return ((Number(m[1]) % 12) + (m[3] === "pm" ? 12 : 0)) * 60 + Number(m[2]);
}

export type Form = keyof typeof timetable2027.forms;

/** A form's week, each day in time order. Sorted once at module load. */
export const weekByForm = Object.fromEntries(
  Object.entries(timetable2027.forms).map(([form, week]) => [
    form,
    week.map((day) => [...day].sort((a, b) => minutes(a.start) - minutes(b.start))),
  ]),
) as Record<Form, Slot[][]>;

export type Holiday = { readonly date: string; readonly name: string };

/** What the timetable grid draws: each form's week, each day in time order, and each weekday's holidays. */
export type Timetable = { readonly weeks: Record<Form, Slot[][]>; readonly holidays: readonly (readonly Holiday[])[] };

export const timetable: Timetable = { weeks: weekByForm, holidays: timetable2027.holidays };

const upcomingSlot = timetable2027.forms[5][1][0];
if (!upcomingSlot) throw new Error("timetable2027: F5 Selasa has no first class");

/** The upcoming class shown in the app: F5 Matematik Tambahan with Sir Izaat (Selasa). */
export const upcomingClass = { form: 5 as Form, slot: upcomingSlot as Slot };

/* ───────────────────── Subjects (from the 2027 timetable) ───────────────────── */

/** Every subject on the 2027 timetable in the order it first appears, with the forms that take it. */
const formsOf = new Map<string, Form[]>();
for (const form of Object.keys(timetable2027.forms).map(Number) as Form[]) {
  for (const slot of timetable2027.forms[form].flat()) {
    const forms = formsOf.get(slot.subject) ?? [];
    if (!forms.includes(form)) formsOf.set(slot.subject, [...forms, form]);
  }
}

/** "Form 1–5", "Form 4–5", or "Form 3" for one form. Assumes the forms are consecutive, which the timetable's are. */
const formRange = (forms: readonly Form[]) => formsLabel(forms[0] ?? 1, forms[forms.length - 1]);

/** The timetable's subjects grouped by the forms that take them: every form first, then the upper forms. */
export const subjectGroups = [...formsOf].reduce<Array<{ forms: string; subjects: string[] }>>((groups, [subject, forms]) => {
  const label = formRange(forms);
  const group = groups.find((g) => g.forms === label);
  if (group) group.subjects.push(subject);
  else groups.push({ forms: label, subjects: [subject] });
  return groups;
}, []);

export const timetableSubjects = [...formsOf.keys()];

/* ───────────────────────────── Design BA ─────────────────────────────
   Copy for the pages only BA has, and the BA sections the other pages gained. Every claim here restates a fact
   already on the site: the content above, content.ts, the price table or the timetable. */

const lowestRate = Math.min(...plans.map((plan) => plan.perMonth));

type FaqItem = { readonly q: string; readonly a: string; readonly link?: { readonly label: string; readonly href: string } };
type ParentQuestion = (typeof faq.items)[number]["q"];

/** The parents' FAQ as BA shows it: BA has a Tutors page, so "Meet the tutors" goes there. */
export const baParentsFaq = {
  ...faq,
  items: faq.items.map((item): FaqItem => ("link" in item && item.link.href === "/online-tuition#tutors" ? { ...item, link: { ...item.link, href: "/tutors" } } : item)),
};

/** A question from BA's parents' FAQ, by its exact wording, so a reworded question fails here rather than vanishing. */
function askedByParents(q: ParentQuestion): FaqItem {
  const item = baParentsFaq.items.find((i) => i.q === q);
  if (!item) throw new Error(`No FAQ item "${q}"`);
  return item;
}

/** Signing up for tuition, from the join copy: WhatsApp, your form, live classes, recordings. */
const joinSteps = [
  { title: "WhatsApp us", body: "Message Tavis on WhatsApp to sign up." },
  { title: "Tell us your form", body: "We set your child up with the classes for their form." },
  { title: "Join live classes", body: "Classes run live online on weekday evenings." },
  { title: "Rewatch anytime", body: "Every class is recorded, so it can be watched again." },
] as const;

/** BA's headline for tuition's price, on Home and over the plans: what the price covers. The shared "One price."
    reads wrongly above four plans. */
const baPriceTitle = ["All subjects", "for your form."] as const;

export const baHome = {
  /** Leads with SPM revision, one of the searches Tavis named in the brief. */
  title: ["Free SPM revision", `for ${allForms}.`],
  promo: {
    title: baPriceTitle,
    body: `Live classes, from ${ringgit(lowestRate)} a month.`,
  },
} as const;

export const baQuestionUniverse = {
  practice: {
    id: "practice",
    title: questionUniverse.universe.title,
    body: questionUniverse.universe.body,
    screen: { scene: "universe", alt: "Question Universe listing Form 5 subjects to practise, with Sains ready to start" },
  },
  subjects: {
    id: "subjects",
    title: "Subjects for every form.",
    body: `Free practice covers ${allForms} core subjects. Online tuition teaches every subject below.`,
  },
  faq: {
    id: "faq",
    title: "Questions",
    accent: "from students and parents.",
    items: [
      askedByParents("Is Tavis free?"),
      { q: "Who checks the questions?", a: "School teachers review questions for accuracy." },
      { q: "Which syllabus are the questions for?", a: `Questions are built around Malaysia’s ${allForms} syllabus.` },
      { q: "What happens when I get one wrong?", a: "You see why the answer is right or wrong, then try again." },
      { q: "Is there a timer?", a: "Only if you want one. Practise at your own pace or switch on a timer for a timed session." },
      askedByParents("How do points turn into rewards?"),
    ],
  },
} as const;

/** Points cost of a catalogue voucher, written out. */
const pointsFor = (name: (typeof rewards.vouchers)[number]["name"]) => `${(costOf(name) ?? 0).toLocaleString("en-MY")} points`;

export const baRewards = {
  faq: {
    id: "faq",
    title: "Questions",
    accent: "about points.",
    items: [
      { q: "How do I earn points?", a: "Answer questions correctly in Question Universe, log in every day and attend your online classes." },
      { q: "Does earning points cost anything?", a: "No. Practice in Question Universe is free, and every correct answer earns points." },
      {
        q: "What can I swap points for?",
        a: "Vouchers such as Foodpanda, KFC, Watsons and Roblox, and new looks for your avatar.",
      },
      {
        q: "How many points is a voucher?",
        a: `Foodpanda, KFC and Watsons vouchers are ${pointsFor("Foodpanda")} each. A Roblox gift card is ${pointsFor("Roblox")}.`,
      },
      { q: "Where do I redeem my points?", a: "In the Tavis app, under Rewards." },
      { q: "How do the rankings work?", a: "See how you rank with other students, and represent your school." },
    ],
  },
  /** The rewards catalogue first, each with its points price, then the vouchers the client's artwork adds. */
  vouchers: [
    ...rewards.vouchers.map(({ name, cost }) => ({ name, cost })),
    ...rewardsPage.redeem.vouchers.filter((v) => !rewards.vouchers.some((c) => c.name === v.name)),
  ],
} as const;

export const baTuition = {
  hero: { cta: tuitionPage.join.cta, secondary: "View plans" },
  compare: {
    id: "compare",
    title: "Free app or online tuition?",
    body: "Practice is free for everyone. Tuition adds live classes with expert tutors.",
    columns: { free: "Free app", tuition: "Online tuition" },
    rows: [
      { feature: "Unlimited practice questions, with explanations", free: true, tuition: true },
      { feature: "Learning Cards for revision", free: true, tuition: true },
      { feature: "Points, real rewards and your own avatar", free: true, tuition: true },
      { feature: "Live evening classes in every subject for your form", free: false, tuition: true },
      { feature: "Experienced Malaysian teachers, including examiners and module writers", free: false, tuition: true },
      { feature: "Every class recorded to rewatch", free: false, tuition: true },
      { feature: "Points for attending classes", free: false, tuition: true },
      { feature: "A weekly progress report emailed to parents", free: false, tuition: true },
    ],
    price: { free: "Free", tuition: { from: "From", amount: ringgit(lowestRate), per: "a month" } },
  },
  pricing: {
    title: baPriceTitle,
    body: `Longer plans cost less per month, from ${ringgit(monthlyRate)} down to ${ringgit(lowestRate)}.`,
  },
  steps: { id: "how-it-works", title: "How it works.", items: joinSteps },
  tutors: { cta: "Meet the tutors" },
  faq: {
    id: "faq",
    title: "Questions",
    accent: "about tuition.",
    items: [
      askedByParents("How much is online tuition?"),
      askedByParents("Are the classes live?"),
      askedByParents("What if my child misses a class?"),
      askedByParents("How many students are in a class?"),
      askedByParents("Who are the teachers?"),
      askedByParents("How do I follow my child’s progress?"),
      askedByParents("Is Tavis free?"),
    ],
  },
} as const;

export const tutorsPage = {
  hero: {
    title: ["Meet the tutors."],
    body: `${tuitionPage.tutors.body} They run Tavis’s live online classes for ${allForms}.`,
  },
  list: { id: "tutors", title: "Our tutors.", cta: "See the tutors", all: "All subjects" },
  closing: { title: "Learn with them.", body: tuitionPage.hero.body, cta: "Explore online tuition" },
} as const;

/** A parent's WhatsApp question about tuition; the (GA) tag in `whatsappWith` is the greeting. */
export const askAboutTuition = whatsappWith("I'd like to ask about online tuition. My child is in Form ");

export const parentsPage = {
  hero: {
    title: ["Revision is hard."],
    // A no-break space keeps "we made it" on one line, so the headline breaks before "rewarding." and nowhere else.
    accent: "We made\u00a0it rewarding.",
    body: `Free practice for ${allForms}, points your child swaps for real rewards, and live online tuition from ${ringgit(lowestRate)} a month.`,
    cta: "Ask about tuition",
    secondary: "Get Tavis free",
  },
  gets: {
    practice: {
      id: "practice",
      title: "Free practice.",
      body: `Unlimited questions with explanations, and ${biteSized()} Learning Cards, built for Malaysia’s ${allForms} syllabus. School teachers review questions for accuracy.`,
      screen: questionUniverse.explanations.screen,
    },
    rewards: {
      id: "rewards",
      title: "Rewards that motivate.",
      body: "Points for correct answers, daily log\u2011ins and classes, swapped for real vouchers such as Foodpanda and KFC.",
    },
    tuition: {
      id: "tuition",
      title: "Live tuition.",
      body: `Live evening classes in every subject for their form, from ${ringgit(lowestRate)} a month. Every class is recorded to rewatch.`,
    },
  },
  learn: {
    id: "learn",
    title: "What they learn.",
    body: `The KSSM subjects for ${allForms}, as on the 2027 class timetable.`,
    cta: "See the timetable",
  },
  steps: { id: "how-tuition-works", title: "How tuition works.", items: joinSteps },
  faq: baParentsFaq,
  contact: {
    id: "talk",
    title: "Talk to us.",
    body: "Ask about classes, plans or your child’s form on WhatsApp, or write to us.",
    whatsapp: "Chat on WhatsApp",
    form: "Write to us",
  },
} as const;
