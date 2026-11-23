"use client";

import { usePathname } from "@/lib/pathname";
import { type FormEvent, type KeyboardEvent, useId, useState } from "react";
import { enquiryLimits } from "@/lib/enquiry";
import { cx } from "./ui";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "failed"; message: string };

const unreachable = "Couldn't send that. Check your connection, or use WhatsApp.";

// scroll-mt: a field focused for its error lands clear of a sticky header.
const field = "w-full scroll-mt-32 border-2 border-line-control bg-paper text-[1rem] text-ink focus:border-forest aria-invalid:border-wrong-ink";

function text(data: FormData, name: string) {
  const value = data.get(name);
  return typeof value === "string" ? value : "";
}

type Field = "name" | "email" | "message";
type Errors = Partial<Record<Field, string>>;

/** The form's own checks, in its own words, instead of the browser's bubble. Order is the order of the fields. */
function check(data: FormData): Errors {
  const errors: Errors = {};
  if (!text(data, "name").trim()) errors.name = "Enter your name.";
  const email = text(data, "email").trim();
  if (!email) errors.email = "Enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter an email address like name@example.com.";
  if (!text(data, "message").trim()) errors.message = "Write your message.";
  return errors;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <span id={id} className="text-small font-bold">
      {message}
    </span>
  );
}

/** The EmDash forms plugin's public endpoint. Submissions land in the admin under Forms, and its notifications go out from there. */
const submitUrl = "/_emdash/api/plugins/emdash-forms/submit";

/** The form the admin defines for these fields. */
const formId = "contact";

/** The plugin's answer: `{ data: { success, message, errors } }`, or the same fields at the top level. */
function failureMessage(body: unknown): string | null {
  const result = isRecord(body) && isRecord(body.data) ? body.data : isRecord(body) ? body : {};
  if (result.success === true) return null;
  const first = Array.isArray(result.errors) ? result.errors[0] : undefined;
  return isRecord(first) && typeof first.message === "string" ? sentence(first.message) : unreachable;
}

/** The plugin words some errors without a full stop; the status line always ends with one. */
const sentence = (message: string) => (/[.!?]$/.test(message.trim()) ? message.trim() : `${message.trim()}.`);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function send(fields: { name: string; email: string; phone: string; message: string; _hp: string; page: string }): Promise<Status> {
  try {
    const res = await fetch(submitUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formId, data: fields }),
    });
    const message = failureMessage(await res.json());
    return message ? { kind: "failed", message } : { kind: "sent" };
  } catch {
    return { kind: "failed", message: unreachable };
  }
}

type Props = {
  /** Classes for the Send button, from the design's own button style. */
  buttonClassName: string;
  /** The corner radius of the fields, to match the design. */
  fieldClassName?: string;
  className?: string;
};

/** The footer's contact form. Each message is stored in the EmDash admin for Tavis; the visitor hears back by email. */
export function ContactForm({ buttonClassName, fieldClassName = "rounded-control", className }: Props) {
  const id = useId();
  const page = usePathname();
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [errors, setErrors] = useState<Errors>({});
  const sending = status.kind === "sending";
  const errorId = (name: Field) => `${id}-${name}-error`;
  const invalid = (name: Field) => (errors[name] ? { "aria-invalid": true, "aria-describedby": errorId(name) } : {});

  /** Typing in a flagged field clears its error; the next Send checks again. */
  function clearError(event: FormEvent<HTMLFormElement>) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
    const name = target.name;
    if (name === "name" || name === "email" || name === "message") setErrors((current) => ({ ...current, [name]: undefined }));
  }

  /** Return in a field marked "next" goes on to the next field, as the keyboard's key says, rather than sending a
      half-filled form. */
  function nextField(event: KeyboardEvent<HTMLFormElement>) {
    const target = event.target;
    // keyCode 229 is the Enter that commits an input method's text, which Safari sends after composition has ended.
    if (event.key !== "Enter" || event.nativeEvent.isComposing || event.keyCode === 229) return;
    if (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) return;
    if (!(target instanceof HTMLInputElement) || target.enterKeyHint !== "next") return;
    event.preventDefault();
    const fields = [...event.currentTarget.querySelectorAll<HTMLElement>('input:not([tabindex="-1"]), textarea')];
    fields[fields.indexOf(target) + 1]?.focus();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const found = check(data);
    setErrors(found);
    const first = (Object.keys(found) as Field[])[0];
    if (first) {
      form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setStatus({ kind: "sending" });
    const result = await send({
      name: text(data, "name"),
      email: text(data, "email"),
      phone: text(data, "phone"),
      message: text(data, "message"),
      _hp: text(data, "_hp"),
      page,
    });
    if (result.kind === "sent") form.reset();
    setStatus(result);
  }

  return (
    <form noValidate onSubmit={submit} onInput={clearError} onKeyDown={nextField} className={cx("grid gap-4 text-left", className)} aria-busy={sending}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-small font-bold">
          Name
          <input name="name" required maxLength={enquiryLimits.name} autoComplete="name" autoCapitalize="words" enterKeyHint="next" {...invalid("name")} className={cx(field, fieldClassName, "h-12 px-4 font-normal")} />
          <FieldError id={errorId("name")} message={errors.name} />
        </label>
        <label className="grid gap-1.5 text-small font-bold">
          Email
          <input name="email" type="email" required maxLength={enquiryLimits.email} autoComplete="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} enterKeyHint="next" {...invalid("email")} className={cx(field, fieldClassName, "h-12 px-4 font-normal")} />
          <FieldError id={errorId("email")} message={errors.email} />
        </label>
      </div>
      <label className="grid gap-1.5 text-small font-bold">
        <span>
          Phone <span className="font-normal">(optional)</span>
        </span>
        <input name="phone" type="tel" maxLength={enquiryLimits.phone} autoComplete="tel" enterKeyHint="next" className={cx(field, fieldClassName, "h-12 px-4 font-normal")} />
      </label>
      <label className="grid gap-1.5 text-small font-bold">
        Message
        <textarea name="message" required rows={4} maxLength={enquiryLimits.message} {...invalid("message")} className={cx(field, fieldClassName, "block resize-y px-4 py-3 font-normal leading-relaxed")} />
        <FieldError id={errorId("message")} message={errors.message} />
      </label>
      <div className="sr-only" aria-hidden="true">
        <label htmlFor={`${id}-trap`}>Leave this empty</label>
        <input id={`${id}-trap`} name="_hp" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <button type="submit" disabled={sending} className={cx(buttonClassName, "min-w-32")}>
          {sending ? "Sending" : "Send"}
        </button>
        <p role="status" aria-live="polite" className="min-w-0 flex-1 text-body-sm font-bold empty:hidden">
          {status.kind === "sent" ? "Thanks. We’ll reply by email." : status.kind === "failed" ? status.message : ""}
        </p>
      </div>
    </form>
  );
}
