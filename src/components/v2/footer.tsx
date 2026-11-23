import { company, links } from "@/lib/content";
import { type DesignId, deckOf, navOf } from "@/lib/site";
import { ContactForm } from "../contact-form";
import { DesignLink } from "../design-link";
import { PauseMotionToggle } from "../motion-pause";
import { Envelope, Facebook, Instagram, PaperPlaneTilt, TikTok, WhatsApp, YouTube } from "../icons";
import { NewTab, cx } from "../ui";
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

const socials = [
  { label: "Facebook", href: links.facebook, Icon: Facebook },
  { label: "Instagram", href: links.instagram, Icon: Instagram },
  { label: "TikTok", href: links.tiktok, Icon: TikTok },
  { label: "YouTube", href: links.youtube, Icon: YouTube },
];

const legal: FooterLink[] = [
  { label: "Privacy Policy", href: links.privacy, newTab: true },
  { label: "Terms of Service", href: links.terms, newTab: true },
];

/** Each page linked once, in two groups: the parents' pages under their own heading, the rest under Tavis. A page the
    design doesn't have is left out. Contact, social and legal links have their own places in the footer. */
function groupsFor(design: DesignId): Array<{ title: string; items: FooterLink[] }> {
  const pages = new Set<string>(deckOf(design).map((page) => page.href));
  const forParents = parents.filter((link) => pages.has(link.href.replace(/[#?].*$/, "")));
  const rest = navOf(design).filter((page) => !forParents.some((link) => link.href === page.href));
  return [
    { title: "Tavis", items: [...rest, { label: "Sign in", href: links.signIn }] },
    { title: "For parents", items: forParents },
  ];
}

const link =
  "link-press inline-flex min-h-11 items-center font-bold [overflow-wrap:anywhere] hover:text-night sm:whitespace-nowrap lg:min-h-9 aria-[current=page]:text-night aria-[current=page]:underline aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-4";

/** Every B and BA page ends here: the download band, then the green footer. */
export function Footer({ design }: { design: DesignId }) {
  const groups = groupsFor(design);
  return (
    <>
      <DownloadBand />

      {/* On a laptop the footer is one screen under the sticky header, like the sections above it: the contact block at
          the top, the wordmark and the small print on the floor. On a phone it takes its own height. The bright field
          keeps its text dark, which is what passes 4.5:1 on it: headings night (7.9:1), links brand-deep (5.0:1). */}
      <footer
        id="contact"
        className="group/footer flex flex-col bg-brand pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-14 text-brand-deep sm:pt-20 [@media(min-width:64rem)_and_(min-height:37.5rem)]:min-h-[calc(100svh-var(--ba-header,4.625rem))] [@media(min-width:64rem)_and_(min-height:37.5rem)]:pt-[clamp(2rem,6svh,4.5rem)]"
      >
        <div className="shell flex flex-1 flex-col">
          <div className="mx-auto flex w-full max-w-[72rem] flex-1 flex-col">
            <div className="grid gap-x-12 gap-y-12 lg:flex-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:content-center lg:items-center xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] xl:gap-x-20">
              <div className="md:flex md:flex-wrap md:items-start md:gap-x-10 md:gap-y-12 lg:block">
                <div className="md:min-w-[22rem] md:flex-1">
                  <h2 className="text-[clamp(2.5rem,1.75rem+2.4vw,3.5rem)] leading-[0.95] lowercase text-night lg:text-[clamp(2.25rem,3.6vw,3.5rem)]">Write to us.</h2>
                  <p className="mt-4 max-w-[22rem] font-semibold">Send us a message and we’ll reply by email, or reach us directly.</p>
                  <div className="mt-6 flex flex-wrap gap-3 max-sm:grid">
                    {/* Below lg the form waits behind this, so no page ends on most of a screen of empty fields.
                        It is a link to the form, which opens it by :target with no script, as any link to #write does. */}
                    <a href="#write" className={buttonClass({ tone: "white", className: "link-press lg:hidden group-has-[#write:target]/footer:hidden" })}>
                      <PaperPlaneTilt aria-hidden="true" className="size-5" />
                      Write a message
                    </a>
                    <a href={links.whatsapp} className={buttonClass({ tone: "white", className: "link-press" })}>
                      <WhatsApp aria-hidden="true" className="size-5" />
                      WhatsApp
                    </a>
                    <a href={links.email} className={buttonClass({ tone: "white", className: "link-press normal-case! tracking-normal!" })}>
                      <Envelope aria-hidden="true" className="size-5" />
                      {links.emailLabel}
                    </a>
                  </div>
                </div>

                <nav aria-label="Footer" className="mt-12 grid grid-cols-2 gap-x-8 sm:grid-cols-[auto_auto] sm:justify-start sm:gap-x-12 md:mt-1 lg:mt-12 lg:gap-x-8">
                  {groups.map((group) => (
                    <div key={group.title}>
                      <h2 className="text-[1.0625rem] leading-[1.4] text-night">{group.title}</h2>
                      <ul className={cx("mt-2 grid text-body-sm", group.items.length > 4 && "sm:grid-flow-col sm:grid-rows-4 sm:gap-x-6")}>
                        {group.items.map((item) => (
                          <li key={item.label}>
                            <DesignLink href={item.href} className={link}>
                              {item.label}
                            </DesignLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </nav>
              </div>

              <div
                id="write"
                className="rounded-[1.75rem] bg-paper p-5 text-forest shadow-[0_8px_0_var(--color-brand-ledge)] transition-[opacity,translate] duration-300 ease-out-quart max-lg:hidden max-lg:target:block max-lg:starting:translate-y-3 max-lg:starting:opacity-0 sm:p-8 lg:p-[clamp(1.25rem,3.5svh,2rem)]"
              >
                <ContactForm
                  buttonClassName={buttonClass({ size: "lg", tone: "sky", className: "max-sm:w-full" })}
                  fieldClassName="rounded-2xl"
                  className="[&_textarea]:h-28 lg:[&_textarea]:h-[clamp(4.5rem,12svh,7rem)]"
                />
              </div>
            </div>

            <div className="mt-16 grid gap-x-12 gap-y-6 lg:mt-0 lg:grid-cols-[auto_1fr] lg:items-end lg:pt-[clamp(1.5rem,4svh,2.5rem)]">
              <p aria-hidden="true" className="select-none font-display text-[clamp(5.5rem,min(19vw,17svh),15rem)] font-black! leading-[0.78] tracking-[-0.05em] text-paper">
                tavis
              </p>
              <div className="grid gap-4 border-t-2 border-brand-deep/20 pt-5 text-small font-bold lg:justify-items-end lg:gap-3 lg:border-0 lg:pt-0 lg:text-right">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 lg:justify-end">
                  <ul className="flex flex-wrap gap-x-6">
                    {legal.map((item) => (
                      <li key={item.label}>
                        <a href={item.href} target="_blank" rel="noopener noreferrer" className={link}>
                          {item.label}
                          <NewTab />
                        </a>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap items-center gap-3">
                    {socials.map(({ label, href, Icon }) => (
                      <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Tavis on ${label} (opens in a new tab)`}
                        className="link-press grid size-11 place-items-center rounded-full bg-brand-deep text-brand transition-colors hover:bg-night"
                      >
                        <Icon aria-hidden="true" className="size-[1.375rem]" />
                      </a>
                    ))}
                    <span aria-hidden="true" className="mx-1 h-6 w-0.5 rounded-full bg-brand-deep/25" />
                    <PauseMotionToggle
                      iconOnly
                      className="bg-paper/40! text-brand-deep! ring-brand-deep/30! hover:bg-paper/70! aria-pressed:bg-night! aria-pressed:text-on-forest! aria-pressed:ring-night!"
                    />
                  </div>
                </div>
                <p className="text-balance">{address}</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
