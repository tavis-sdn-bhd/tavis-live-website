import { island } from "@/components/island";
import { cx } from "@/components/ui";
import { DesignLink } from "@/components/design-link";
import { TaviDisc } from "@/components/v2/hero";
import { Actions, Button, chunky, lede } from "@/components/v2/ui";
import { navOf } from "@/lib/site";

/** BA's 404: Tavi looking sorry, a way home, and every page of the site with what it is for. */
function NotFoundPage() {
  return (
    <section data-band="white" className="shell pb-[clamp(5rem,3rem+7vw,9rem)] pt-[clamp(7rem,5rem+6vw,10rem)] text-center">
      <TaviDisc mood="sad" outfit="school" className="mx-auto w-[min(16rem,62vw)]" />
      <h1 className="mx-auto mt-8 max-w-[40rem] text-[clamp(2.5rem,1.5rem+4vw,4.5rem)] leading-[0.98] lowercase text-brand-ink text-balance">
        This page is missing.
      </h1>
      <p className={cx("mx-auto mt-6 max-w-[32rem] text-muted", lede)}>The link may be old, or the page has moved. Start from home, or pick a page below.</p>
      <Actions className="mt-9">
        <Button href="/" size="lg">
          Back to home
        </Button>
      </Actions>
      <nav aria-label="Pages" className="mx-auto mt-16 max-w-[60rem] text-left">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {navOf("ba").map((page) => (
            <li key={page.href} className="flex">
              <DesignLink href={page.href} className={cx(chunky, "link-press flex w-full flex-col gap-2 p-6 transition-colors hover:border-sky/40 hover:bg-sky-soft/40")}>
                <span className="font-display text-body-sm uppercase tracking-[0.06em] text-sky-ink">{page.label}</span>
                <span className="text-body-sm font-semibold leading-relaxed text-muted">{page.description}</span>
              </DesignLink>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}

export default island(NotFoundPage);
