import { usePathname } from "@/lib/pathname";
import { type Locale, locale, pathIn } from "@/lib/locale";
import { cx } from "./ui";

const languages: ReadonlyArray<{ id: Locale; short: string; name: string }> = [
  { id: "en", short: "EN", name: "English" },
  { id: "ms", short: "BM", name: "Bahasa Melayu" },
];

const chip = "tap inline-flex h-10 min-w-11 items-center justify-center rounded-xl px-2.5 font-display text-body-sm font-bold";

/** In the bar, one link to this page in the other language: the bar has no room for both. In the menu (`labelled`),
    both languages under a "Language" caption, the one being read marked. */
export function LanguageSwitch({ className, labelled = false }: { className?: string; labelled?: boolean }) {
  const pathname = usePathname();
  const link = ({ id, short, name }: (typeof languages)[number], extra: string) => (
    <a key={id} href={pathIn(id, pathname)} hrefLang={id} lang={id} aria-label={name} aria-current={id === locale ? "true" : undefined} className={cx(chip, extra)}>
      {short}
    </a>
  );

  if (!labelled) {
    const other = languages.find((l) => l.id !== locale) ?? languages[0];
    return <div className={className}>{link(other, "text-muted hover:bg-cream hover:text-forest")}</div>;
  }
  return (
    <div className={cx("flex items-center justify-between gap-4", className)}>
      <span className="font-display text-[1.125rem] font-extrabold leading-tight text-forest">Language</span>
      <nav aria-label="Language" className="flex shrink-0 items-center gap-0.5 rounded-xl p-0.5 ring-2 ring-inset ring-line-strong">
        {languages.map((l) => link(l, l.id === locale ? "bg-sky/10 text-sky-ink" : "text-muted hover:bg-cream hover:text-forest"))}
      </nav>
    </div>
  );
}
