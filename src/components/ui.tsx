import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { DesignLink } from "./design-link";
import { ArrowUpRight, Check } from "./icons";

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** Secondary text buttons in a row of controls (inbox rows, comment threads). */
export const quietButton = "tap inline-flex min-h-11 items-center gap-2 rounded-control px-3 font-display text-body-sm";

/* ── Button ──────────────────────────────────────────────────────────────
   Tactile: every button sits on a coloured ledge and drops onto it when
   pressed, like an answer key in the app. Cal Sans label, mono never. */

export type Tone = "brand" | "forest" | "paper" | "ghost";
type Size = "md" | "lg";

const tones: Record<Tone, string> = {
  brand: "bg-brand text-forest shadow-ledge-brand not-disabled:hover:bg-brand-hover",
  forest: "bg-forest text-on-forest shadow-ledge-dark not-disabled:hover:bg-forest-soft",
  paper: "bg-paper text-forest ring-1 ring-inset ring-line-strong shadow-ledge-paper not-disabled:hover:bg-white",
  ghost: "text-forest not-disabled:hover:bg-forest/[0.05] not-disabled:active:bg-forest/[0.08]",
};

const sizes: Record<Size, string> = {
  md: "min-h-11 gap-2 px-5 py-2 text-body-sm",
  lg: "min-h-14 gap-2.5 px-6 py-3 text-body-lg",
};

export function buttonClasses({ tone = "brand", size = "md", className }: { tone?: Tone; size?: Size; className?: string }) {
  return cx(
    "group/btn relative inline-flex max-w-full select-none items-center justify-center text-center text-balance rounded-control font-display [-webkit-touch-callout:none] disabled:opacity-50 [&>svg]:shrink-0 [&>svg:first-child]:-ml-1 [&>svg:last-child]:-mr-1",
    tone === "ghost" ? "transition-colors duration-200" : "press",
    sizes[size],
    tones[tone],
    className,
  );
}

function Trailing({ icon }: { icon?: ReactNode }) {
  if (icon === null) return null;
  return (
    <span aria-hidden="true" className="relative -mr-1 grid size-5 place-items-center overflow-hidden">
      {icon ?? (
        <>
          <ArrowUpRight className="size-4 transition-transform duration-200 ease-out-quart group-hover/btn:-translate-y-5 group-hover/btn:translate-x-5" />
          <ArrowUpRight className="absolute size-4 -translate-x-5 translate-y-5 transition-transform duration-200 ease-out-quart group-hover/btn:translate-x-0 group-hover/btn:translate-y-0" />
        </>
      )}
    </span>
  );
}

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  tone?: Tone;
  size?: Size;
  /** Trailing icon. Omit for the arrow, pass null for none. */
  icon?: ReactNode | null;
  external?: boolean;
};

/** Variant A's link button. Internal paths are deck paths ("/rewards") and stay inside the design being viewed. */
export function ButtonLink({ href, tone, size, icon, external, className, children, ...props }: ButtonLinkProps) {
  const classes = buttonClasses({ tone, size, className });
  const content = (
    <>
      <span>{children}</span>
      <Trailing icon={icon} />
    </>
  );

  if (href?.startsWith("/")) {
    return (
      <DesignLink href={href} {...props} className={classes}>
        {content}
      </DesignLink>
    );
  }
  return (
    <a href={href} {...props} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className={classes}>
      {content}
      {external && <NewTab />}
    </a>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone; size?: Size; icon?: ReactNode | null };

export function Button({ tone, size, icon = null, className, children, type = "button", ...props }: ButtonProps) {
  return (
    <button type={type} {...props} className={buttonClasses({ tone, size, className })}>
      <span>{children}</span>
      <Trailing icon={icon} />
    </button>
  );
}

/** Screen-reader note for links that open a new tab. */
export function NewTab() {
  return <span className="sr-only"> (opens in a new tab)</span>;
}

/* ── Section heading ───────────────────────────────────────────────────── */

type HeadingProps = {
  title: string | readonly string[];
  accent?: string;
  body?: string;
  onDark?: boolean;
  as?: "h1" | "h2";
  size?: "headline" | "sheet" | "title";
  className?: string;
};

const headingSizes = {
  headline: "text-headline",
  sheet: "text-[clamp(2rem,1.35rem+2.1vw,3.125rem)] leading-[1] tracking-[-0.015em]",
  title: "text-title",
} as const;

/** Cal Sans headline (last line in green unless an accent is given) + one short mono line. */
export function SectionHeading({
  title,
  accent,
  body,
  onDark,
  as: Tag = "h2",
  size = "headline",
  className,
}: HeadingProps) {
  const lines = typeof title === "string" ? [title] : title;
  const green = onDark ? "text-brand" : "text-brand-ink";
  return (
    <div className={className}>
      <Tag
        className={cx(
          headingSizes[size],
          onDark && "text-on-forest",
        )}
      >
        {lines.map((line, i) => (
          <span key={line} className={cx("block", !accent && lines.length > 1 && i === lines.length - 1 && green)}>
            {line}{" "}
          </span>
        ))}
        {accent && <span className={cx("block", green)}>{accent}</span>}
      </Tag>
      {body && <p className={cx("mt-6 max-w-[34rem] text-lede", onDark ? "text-on-forest-muted" : "text-muted")}>{body}</p>}
    </div>
  );
}

/** Marks a proposal or add-on as accepted, beside its label. */
export function AcceptedBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-mint px-2.5 py-1 font-display text-caption text-brand-text">
      <Check className="size-3.5" />
      Accepted
    </span>
  );
}

export type SegmentedOption<T extends string> = { value: T; label: string; count?: string };

/** A pill row of exclusive choices, with an optional count on each. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex w-fit flex-wrap rounded-full bg-cream p-1 print:hidden">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
          className={cx("tap min-h-8 rounded-full px-3 text-small", option.value === value ? "bg-forest text-on-forest" : "text-muted hover:text-forest")}
        >
          {option.label}
          {option.count !== undefined && <span className={cx("nums ms-1.5 text-caption", option.value === value ? "text-on-forest-muted" : "text-muted")}>{option.count}</span>}
        </button>
      ))}
    </div>
  );
}
