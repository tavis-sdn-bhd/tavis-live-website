import { Image } from "@/components/image";
import { company, links } from "@/lib/content";
import { type DesignId, deckOf, navOf } from "@/lib/site";
import { ContactForm } from "../contact-form";
import { DesignLink } from "../design-link";
import { PauseMotionToggle } from "../motion-pause";
import { WhatsApp } from "../icons";
import { NewTab } from "../ui";
import { DownloadBand } from "./sections";
import { buttonClass } from "./ui";

/** The address breaks only after a comma, so no line splits a name or strands the dot, the postcode or the city. */
const address = `${company.legalName} · ${company.street}, ${company.postalCode} ${company.city}`.replace(/([^,]) /g, "$1\u00a0");

type FooterLink = { label: string; href: string; newTab?: boolean };

const parents: FooterLink[] = [
  { label: "What we offer", href: "/parents" },
  { label: "Tuition prices", href: "/online-tuition#pricing" },
  { label: "Timetable", href: "/online-tuition#timetable" },
  { label: "FAQ", href: "/#faq" },
];

/** Duolingo's footer columns, fitted to Tavis. A link to a page the design doesn't have is left out, and each page
    is linked once: the parents' page heads its own column rather than repeating under Tavis. */
function columnsFor(design: DesignId): Array<{ title: string; items: FooterLink[] }> {
  const pages = new Set<string>(deckOf(design).map((page) => page.href));
  const has = (link: FooterLink) => !link.href.startsWith("/") || pages.has(link.href.replace(/[#?].*$/, ""));
  const forParents = parents.filter(has);
  return [
    { title: "Tavis", items: navOf(design).filter((page) => !forParents.some((link) => link.href === page.href)) },
    { title: "For parents", items: forParents },
    {
      title: "Talk to us",
      items: [
        { label: "WhatsApp", href: links.whatsapp },
        { label: links.emailLabel, href: links.email },
        { label: "Sign in", href: links.signIn },
      ],
    },
    {
      title: "Follow",
      items: [
        { label: "Facebook", href: links.facebook, newTab: true },
        { label: "Instagram", href: links.instagram, newTab: true },
        { label: "TikTok", href: links.tiktok, newTab: true },
      ],
    },
    {
      title: "Legal",
      items: [
        { label: "Privacy Policy", href: links.privacy, newTab: true },
        { label: "Terms of Service", href: links.terms, newTab: true },
      ],
    },
  ];
}

/** Every B and BA page ends here: the download band, then the big green footer. */
export function Footer({ design }: { design: DesignId }) {
  return (
    <>
      <DownloadBand />

      {/* Duolingo's rhythm: 96px over, 64px under, headings and links in tones of the green. The bright field keeps
          its tones dark, which is what passes 4.5:1 on it: headings night (7.9:1), links brand-deep (5.0:1). */}
      <footer id="contact" className="bg-brand pb-[calc(4rem+env(safe-area-inset-bottom))] pt-16 text-brand-deep sm:pt-24">
        <div className="shell">
          {/* Duolingo's 988px column grid. */}
          <div className="mx-auto max-w-[61.75rem]">
            {/* From lg the form sits on the three right-hand columns of the grid below, its heading on the other two. */}
            <div className="grid gap-x-8 gap-y-5 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <h2 className="text-[1.5rem] leading-tight text-night">Write to us</h2>
                <p className="mt-3 max-w-[19rem] font-semibold max-lg:hidden">Send us a message and we’ll reply by email.</p>
                <a href={links.whatsapp} className="link-press mt-2 inline-flex min-h-11 items-center gap-2 text-body-sm font-bold hover:text-night max-lg:hidden">
                  <WhatsApp aria-hidden="true" className="size-5" />
                  Chat on WhatsApp
                </a>
              </div>
              <ContactForm buttonClassName={buttonClass({ size: "lg", tone: "sky", className: "max-sm:w-full" })} fieldClassName="rounded-2xl" className="max-w-xl lg:col-span-3" />
            </div>
            <div className="mt-16 grid grid-cols-2 gap-x-8 gap-y-10 sm:mt-20 sm:grid-cols-3 sm:gap-y-12 lg:grid-cols-5">
              {columnsFor(design).map((column) => (
                <div key={column.title}>
                  <h2 className="text-[1.1875rem] leading-[1.4] text-night">{column.title}</h2>
                  <ul className="mt-3 grid">
                    {column.items.map((item) => (
                      <li key={item.label}>
                        <DesignLink
                          href={item.href}
                          {...(item.newTab && { target: "_blank", rel: "noopener noreferrer" })}
                          className="link-press inline-flex min-h-11 items-center text-body-sm font-bold leading-[1.375rem] [overflow-wrap:anywhere] hover:text-night aria-[current=page]:text-night aria-[current=page]:underline aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-4"
                        >
                          {item.label}
                          {item.newTab && <NewTab />}
                        </DesignLink>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-16 flex flex-col gap-4 border-t-2 border-brand-deep/20 pt-6 text-small font-bold md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                {/* The official mark is the logo's own lighter green, which vanishes on this field, so it sits on white, unrecoloured. */}
                <span className="inline-flex w-fit rounded-xl bg-paper px-3 py-2">
                  <Image src="/assets/tavis-logo.svg" alt="Tavis" width={749} height={194} unoptimized className="h-6 w-auto" />
                </span>
                <p className="text-balance">{address}</p>
              </div>
              {/* Its own width: squeezed beside the address on a tablet, the label broke onto two lines. */}
              <div className="shrink-0">
                <PauseMotionToggle className="text-brand-deep! ring-brand-deep/25! aria-pressed:bg-night! aria-pressed:text-on-forest! aria-pressed:ring-night!" />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
