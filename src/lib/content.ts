import type { Scene } from "@/components/phone-app/state";

export const links = {
  signIn: "https://app.tavis.live/login",
  /** The web app's sign-up form, where a desktop's "Get Tavis free" goes. */
  signUp: "https://app.tavis.live/signup",
  appStore: "https://apps.apple.com/my/app/tavis/id1580342756",
  googlePlay: "https://play.google.com/store/apps/details?id=com.tavis.tavisapp.v26",
  /** Scanned from the desktop QR code; sends each phone to its own store. */
  get: "https://www.tavis.live/get",
  whatsapp: "https://wa.me/60106536780?text=%28GA%29HiTavis",
  email: "mailto:admin@tavis.live",
  emailLabel: "admin@tavis.live",
  facebook: "https://www.facebook.com/tavislive/",
  instagram: "https://www.instagram.com/tavislive/",
  tiktok: "https://www.tiktok.com/@tavislive",
  youtube: "https://www.youtube.com/@tavislive4018",
  privacy: "https://app.tavis.live/privacy-policy",
  terms: "https://app.tavis.live/terms-conditions",
} as const;

/** WhatsApp with a prefilled message. The (GA) tag leads so enquiries keep their source, and it is also the greeting,
    so `message` starts at the ask ("I'd like to…") and may end in a blank to fill. */
export function whatsappWith(message: string) {
  return `https://wa.me/60106536780?text=${encodeURIComponent(`(GA)HiTavis ${message}`)}`;
}

/** "Form 1–5" that never breaks: a no-break space after "Form" and word joiners round the dash, which browsers
    otherwise break after. Every visible form range goes through here. */
export function formRange(from: number, to?: number) {
  return to === undefined || to === from ? `Form\u00a0${from}` : `Form\u00a0${from}\u2060–\u2060${to}`;
}

/** "Bite-sized" that never breaks at its hyphen, which would leave "bite-" hanging at the end of a line. */
export function biteSized(capital = false) {
  const word = "bite\u2060-\u2060sized";
  return capital ? word.charAt(0).toUpperCase() + word.slice(1) : word;
}

/** Every form Tavis teaches. */
export const allForms = formRange(1, 5);

export const company = {
  legalName: "Tavis Sdn. Bhd.",
  street: "Suite 8.01, 8th Floor, Menara IGB, Lingkaran Syed Putra, Mid Valley City",
  postalCode: "59200",
  city: "Kuala Lumpur",
  region: "Wilayah Persekutuan Kuala Lumpur",
} as const;

/** A screen of the app shown in a phone mockup: the scene the coded app opens at, and what it shows. */
export type Screen = { readonly scene: Scene; readonly alt: string };

export const screens = {
  home: {
    scene: "home",
    alt: "Tavis app home showing Question Universe, online classes, rewards and learning materials",
  },
  avatar: {
    scene: "me",
    alt: "Tavis avatar screen with the student's outfit, a choice of looks and shoes to unlock with points",
  },
} as const satisfies Record<string, Screen>;

export const hero = {
  title: ["Free practice", `for ${allForms}.`],
  accent: "Real rewards.",
  body: "Unlimited questions and Learning Cards built for Malaysia’s syllabus. Online tuition with expert teachers from RM70 a month.",
  cta: "Get Tavis free",
  secondary: "For parents",
} as const;

export const features = {
  title: "Practise. Earn.",
  accent: "Learn from experts.",
} as const;

export const practice = {
  title: ["Practise more.", "Revise faster."],
  body: `Unlimited free questions with clear explanations, and ${biteSized()} Learning Cards to revise.`,
  cta: "Try Question Universe",
} as const;

export const rewards = {
  title: ["Study. Earn.", "Get rewarded."],
  body: "Earn points as you learn. Redeem real rewards and dress up your avatar.",
  vouchers: [
    { name: "Foodpanda", listing: "Foodpanda Cash voucher", cost: 10000 },
    { name: "KFC", listing: "KFC Digital E-Voucher", cost: 10000 },
    { name: "Watsons", listing: "Watsons Cash Voucher", cost: 10000 },
    { name: "Roblox", listing: "Roblox Digital Gift Card", cost: 50000 },
  ],
  cta: "See the rewards",
} as const;

export const tuition = {
  title: ["Learn from experts.", "Rewatch anytime."],
  body: "Live evening classes with experienced teachers. Rewatch every recording.",
  cta: "Explore online tuition",
} as const;

export const why = {
  title: "Why choose",
  accent: "Tavis?",
  items: [
    { title: "Free practice", body: "Unlimited questions and Learning Cards." },
    { title: "Latest curriculum", body: `Built for Malaysia’s ${allForms} syllabus.` },
    { title: "Teacher-verified", body: "Reviewed by school teachers." },
    { title: "Rewarding", body: "Points, real rewards and your own avatar." },
  ],
  stats: [
    { value: 3000, suffix: "+", label: "Students" },
    { value: 120, suffix: "+", label: "Schools" },
  ],
} as const;

/** Published on tavis.live, quoted word for word. */
export const testimonials = {
  title: "Students",
  accent: "say it best.",
  items: [
    {
      quote: "Of course, receiving the rewards gave me the motivation to keep learning better!",
      name: "Muhammad Shohel",
      form: formRange(3),
    },
    {
      quote: "Initially I worried that I would struggle with online classes, but my tutors really made the classes very enjoyable!",
      name: "Vaishavi",
      form: formRange(5),
    },
    {
      quote: "Thanks to Tavis, I managed to get great revision lessons on Science & English, which are two of my weaker subjects.",
      name: "Nurfatehah",
      form: formRange(5),
    },
  ],
} as const;

export const faq = {
  id: "faq",
  title: "Questions",
  accent: "from parents.",
  items: [
    {
      q: "Is Tavis free?",
      a: "Yes. Practice questions in Question Universe and Learning Cards are free. Online tuition is a paid plan.",
    },
    {
      q: "How much is online tuition?",
      a: "From RM70 a month on the full-year plan, or RM99 for a single month. Every plan covers all subjects for your form.",
      link: { label: "See plans", href: "/online-tuition#pricing" },
    },
    {
      q: "Are the classes live?",
      a: "Yes. Classes run live online on weekday evenings, so your child joins from home on any device with an internet connection. Every class is recorded so your child can rewatch it.",
      link: { label: "See the timetable", href: "/online-tuition#timetable" },
    },
    {
      q: "What if my child misses a class?",
      a: "They watch the class recording, so they don’t fall behind.",
    },
    {
      q: "How many students are in a class?",
      a: "It depends on the form and the subject. WhatsApp us to ask about your child’s classes.",
      link: { label: "Ask on WhatsApp", href: whatsappWith("I'd like to ask how many students are in a class. My child is in Form ") },
    },
    {
      q: "Who are the teachers?",
      a: "Experienced Malaysian teachers, including a Sejarah examiner with 25 years in the classroom and writers of KSSM science modules.",
      link: { label: "Meet the tutors", href: "/online-tuition#tutors" },
    },
    {
      q: "How do I follow my child’s progress?",
      a: "Tavis emails you a progress report every week, to the email address you registered with.",
    },
    {
      q: "How do points turn into rewards?",
      a: "Students earn points for correct answers, logging in daily and attending classes, then swap them in the app for vouchers such as Foodpanda and KFC.",
      link: { label: "See the rewards", href: "/rewards" },
    },
    {
      q: "How is my child’s data handled?",
      a: "Tavis Sdn. Bhd. handles personal data as set out in our Privacy Policy.",
      link: { label: "Read the Privacy Policy", href: links.privacy },
    },
  ],
} as const;

export const download = {
  title: ["Your next study session", "starts here."],
  body: "Free on iPhone and Android.",
  scan: "Scan to get Tavis on your phone.",
} as const;

export const contact = {
  title: "Let’s talk.",
} as const;

